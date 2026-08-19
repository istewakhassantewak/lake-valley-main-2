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
  const lastLocalSaveTime = useRef(0);

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
          const now = Date.now();
          if (now - lastLocalSaveTime.current > 6000) {
            setImages(backendData);
          }
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
        const now = Date.now();
        // Do not let stale listener snapshots overwrite recent local updates (< 6s)
        if (now - lastLocalSaveTime.current > 6000) {
          setImages(liveImages);
        }
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Upload image file (uploads to Firebase Storage / CDN, updates Firestore and state)
  const uploadImageFile = useCallback(async ({ file, title, category, alt, span, targetSection }) => {
    let uploadedUrl = '';
    try {
      uploadedUrl = await uploadAnyImageToFirebase(file, 'gallery');
    } catch (err) {
      console.warn('Firebase storage upload failed, using compression fallback:', err);
    }

    if (!uploadedUrl) {
      try {
        const compressed = await compressAndResizeImage(file, 1200, 0.78);
        uploadedUrl = await fileToDataUrl(compressed || file);
      } catch {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }
    }

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

    lastLocalSaveTime.current = Date.now();
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

    lastLocalSaveTime.current = Date.now();
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
      try {
        finalSrc = await uploadAnyImageToFirebase(file, 'gallery');
      } catch (err) {
        console.warn('Firebase upload notice, falling back:', err);
      }
      if (!finalSrc) {
        try {
          const compressed = await compressAndResizeImage(file, 1200, 0.78);
          finalSrc = await fileToDataUrl(compressed || file);
        } catch {
          finalSrc = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        }
      }
    }

    let updatedRecord = null;
    let nextImages = [];

    lastLocalSaveTime.current = Date.now();
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
    lastLocalSaveTime.current = Date.now();
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
