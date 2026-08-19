import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { galleryImages as defaultGalleryImages, galleryCategories } from '../data/gallery';
import {
  fetchAllImages,
  uploadImageFileApi,
  addImageApi,
  updateImageApi,
  deleteImageApi,
  resetImagesApi,
  syncImagesToFirestore,
  subscribeToImageChanges,
} from '../api/imageApi';
import { uploadAnyImageToFirebase, compressAndResizeImage, fileToDataUrl } from '../firebase';

const ImageContext = createContext(null);
const LOCAL_STORAGE_KEY = 'lv_managed_images_v1';
const LOCAL_IMAGE_TIME_KEY = 'lv_images_last_saved_time';

function getStoredImageSaveTime() {
  try {
    const raw = localStorage.getItem(LOCAL_IMAGE_TIME_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function ImageProvider({ children }) {
  const [images, setImages] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultGalleryImages.map((img) => ({
      ...img,
      title: img.title || img.alt || 'Gallery Image',
      targetSection: img.targetSection || 'gallery',
    }));
  });

  const [loading, setLoading] = useState(false);
  const lastLocalSaveTime = useRef(getStoredImageSaveTime());

  // Sync to local storage & Firestore whenever images change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [images]);

  // Sync with Firestore and backend API on mount + subscribe to live changes
  useEffect(() => {
    let isMounted = true;
    async function syncBackend() {
      setLoading(true);
      try {
        const backendData = await fetchAllImages();
        if (isMounted && backendData && Array.isArray(backendData) && backendData.length > 0) {
          const localSaved = getStoredImageSaveTime();
          setImages((prev) => {
            // If local images have custom additions/edits, merge them cleanly by ID
            if (localSaved > 0 && Array.isArray(prev) && prev.length > 0) {
              const localIds = new Set(prev.map((img) => img.id));
              const combined = [...prev];
              backendData.forEach((bImg) => {
                if (!localIds.has(bImg.id)) {
                  combined.push(bImg);
                }
              });
              syncImagesToFirestore(combined).catch(() => {});
              return combined;
            }
            return backendData;
          });
        }
      } catch (err) {
        console.warn('Backend image sync warning:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    syncBackend();

    // Real-time synchronization across all tabs and browsers
    const unsubscribe = subscribeToImageChanges((liveImages) => {
      if (isMounted && Array.isArray(liveImages) && liveImages.length > 0) {
        setImages((prev) => {
          const localSaved = getStoredImageSaveTime();
          if (localSaved > 0 && Array.isArray(prev) && prev.length > 0) {
            const liveIds = new Set(liveImages.map((img) => img.id));
            const merged = [...liveImages];
            prev.forEach((pImg) => {
              if (!liveIds.has(pImg.id)) {
                merged.unshift(pImg);
              }
            });
            return merged;
          }
          return liveImages;
        });
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Upload image file (uploads to Firebase Storage / CDN, updates Firestore and state)
  const uploadImageFile = useCallback(async ({ file, title, category, alt, span, targetSection }) => {
    const uploadedUrl = await uploadAnyImageToFirebase(file, 'gallery');

    const newImg = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src: uploadedUrl,
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      alt: alt || title || file.name,
      category: category || 'Township',
      span: span || 'col-span-1 row-span-1',
      targetSection: targetSection || 'gallery',
      createdAt: new Date().toISOString(),
    };

    const now = Date.now();
    lastLocalSaveTime.current = now;
    try {
      localStorage.setItem(LOCAL_IMAGE_TIME_KEY, String(now));
    } catch {
      // ignore
    }

    let nextImages = [];
    setImages((prev) => {
      nextImages = [newImg, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextImages));
      } catch {
        // ignore
      }
      return nextImages;
    });

    if (nextImages.length > 0) {
      syncImagesToFirestore(nextImages).catch((e) => console.warn('Firestore sync note:', e));
    }

    // Also attempt backend call if server is running
    uploadImageFileApi({
      src: uploadedUrl,
      filename: file.name,
      title: newImg.title,
      category: newImg.category,
      alt: newImg.alt,
      span: newImg.span,
      targetSection: newImg.targetSection,
    }).catch(() => {});

    return newImg;
  }, []);

  // Add image by URL
  const addImageUrl = useCallback(async ({ src, title, category, alt, span, targetSection }) => {
    const newImg = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src,
      title: title || 'New Image',
      alt: alt || title || 'New Image',
      category: category || 'Township',
      span: span || 'col-span-1 row-span-1',
      targetSection: targetSection || 'gallery',
      createdAt: new Date().toISOString(),
    };

    const now = Date.now();
    lastLocalSaveTime.current = now;
    try {
      localStorage.setItem(LOCAL_IMAGE_TIME_KEY, String(now));
    } catch {
      // ignore
    }

    let nextImages = [];
    setImages((prev) => {
      nextImages = [newImg, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextImages));
      } catch {
        // ignore
      }
      return nextImages;
    });

    if (nextImages.length > 0) {
      syncImagesToFirestore(nextImages).catch((e) => console.warn('Firestore sync note:', e));
    }

    addImageApi({
      src,
      title: newImg.title,
      category: newImg.category,
      alt: newImg.alt,
      span: newImg.span,
      targetSection: newImg.targetSection,
    }).catch(() => {});

    return newImg;
  }, []);

  // Replace existing image file or URL
  const replaceImage = useCallback(async (id, { file, src, title, category, alt, span, targetSection }) => {
    let finalSrc = src;

    if (file) {
      finalSrc = await uploadAnyImageToFirebase(file, 'gallery');
    }

    let updatedRecord = null;
    let nextImages = [];

    const now = Date.now();
    lastLocalSaveTime.current = now;
    try {
      localStorage.setItem(LOCAL_IMAGE_TIME_KEY, String(now));
    } catch {
      // ignore
    }

    setImages((prev) => {
      let found = false;
      const updated = prev.map((img) => {
        if (String(img.id) === String(id)) {
          found = true;
          updatedRecord = {
            ...img,
            ...(finalSrc ? { src: finalSrc } : {}),
            title: title !== undefined && title !== null ? title : img.title,
            category: category !== undefined && category !== null ? category : img.category,
            alt: alt !== undefined && alt !== null ? alt : img.alt,
            span: span !== undefined && span !== null ? span : img.span,
            targetSection: targetSection !== undefined && targetSection !== null ? targetSection : img.targetSection,
            updatedAt: new Date().toISOString(),
          };
          return updatedRecord;
        }
        return img;
      });

      if (!found && prev.length > 0) {
        const first = prev[0];
        updatedRecord = {
          ...first,
          ...(finalSrc ? { src: finalSrc } : {}),
          title: title || first.title,
          updatedAt: new Date().toISOString(),
        };
      }

      nextImages = updated;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (nextImages && nextImages.length > 0) {
      syncImagesToFirestore(nextImages).catch((e) => console.warn('Firestore sync note:', e));
    }

    updateImageApi(id, {
      ...(finalSrc ? { src: finalSrc } : {}),
      title,
      category,
      alt,
      span,
      targetSection,
    }).catch(() => {});

    return updatedRecord || { id, src: finalSrc, title, category, alt, span, targetSection };
  }, []);

  // Delete image
  const deleteImage = useCallback(async (id) => {
    const now = Date.now();
    lastLocalSaveTime.current = now;
    try {
      localStorage.setItem(LOCAL_IMAGE_TIME_KEY, String(now));
    } catch {
      // ignore
    }

    setImages((prev) => {
      const updated = prev.filter((img) => String(img.id) !== String(id));
      syncImagesToFirestore(updated);
      return updated;
    });

    try {
      await deleteImageApi(id);
    } catch {
      // ignore
    }
  }, []);

  // Reset to default gallery images
  const resetImagesToDefault = useCallback(async () => {
    const defaults = defaultGalleryImages.map((img) => ({
      ...img,
      title: img.title || img.alt || 'Gallery Image',
      targetSection: img.targetSection || 'gallery',
    }));

    try {
      localStorage.removeItem(LOCAL_IMAGE_TIME_KEY);
    } catch {
      // ignore
    }

    setImages(defaults);
    syncImagesToFirestore(defaults);

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      await resetImagesApi();
    } catch {
      // ignore
    }
  }, []);

  return (
    <ImageContext.Provider
      value={{
        images,
        loading,
        categories: galleryCategories,
        uploadImageFile,
        addImageUrl,
        replaceImage,
        deleteImage,
        resetImagesToDefault,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error('useImages must be used within an ImageProvider');
  return ctx;
}
