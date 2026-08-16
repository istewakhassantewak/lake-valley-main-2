import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { uploadAnyImageToFirebase } from '../firebase';

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
          setImages(backendData);
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
        setImages(liveImages);
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
      console.warn('Firebase storage upload failed, using file reader:', err);
    }

    if (!uploadedUrl) {
      uploadedUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
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

    setImages((prev) => {
      const updated = [newImg, ...prev];
      syncImagesToFirestore(updated);
      return updated;
    });

    // Also attempt backend call if server is running
    try {
      await uploadImageFileApi({
        src: uploadedUrl,
        filename: file.name,
        title: newImg.title,
        category: newImg.category,
        alt: newImg.alt,
        span: newImg.span,
        targetSection: newImg.targetSection,
      });
    } catch {
      // ignore
    }

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

    setImages((prev) => {
      const updated = [newImg, ...prev];
      syncImagesToFirestore(updated);
      return updated;
    });

    try {
      await addImageApi({
        src,
        title: newImg.title,
        category: newImg.category,
        alt: newImg.alt,
        span: newImg.span,
        targetSection: newImg.targetSection,
      });
    } catch {
      // Fallback
    }

    return newImg;
  }, []);

  // Replace existing image file or URL
  const replaceImage = useCallback(async (id, { file, src, title, category, alt, span, targetSection }) => {
    let finalSrc = src;

    if (file) {
      try {
        finalSrc = await uploadAnyImageToFirebase(file, 'gallery');
      } catch {
        finalSrc = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
    }

    setImages((prev) => {
      const updated = prev.map((img) =>
        String(img.id) === String(id)
          ? {
              ...img,
              ...(finalSrc ? { src: finalSrc } : {}),
              title: title !== undefined ? title : img.title,
              category: category !== undefined ? category : img.category,
              alt: alt !== undefined ? alt : img.alt,
              span: span !== undefined ? span : img.span,
              targetSection: targetSection !== undefined ? targetSection : img.targetSection,
              updatedAt: new Date().toISOString(),
            }
          : img
      );
      syncImagesToFirestore(updated);
      return updated;
    });

    try {
      await updateImageApi(id, {
        ...(finalSrc ? { src: finalSrc } : {}),
        title,
        category,
        alt,
        span,
        targetSection,
      });
    } catch {
      // ignore
    }
  }, []);

  // Delete image
  const deleteImage = useCallback(async (id) => {
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
