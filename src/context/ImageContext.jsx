import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { galleryImages as defaultGalleryImages, galleryCategories } from '../data/gallery';
import {
  fetchAllImages,
  uploadImageFileApi,
  addImageApi,
  updateImageApi,
  deleteImageApi,
  resetImagesApi,
} from '../api/imageApi';

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

  // Sync to local storage whenever images change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [images]);

  // Sync with backend API on mount
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
    return () => {
      isMounted = false;
    };
  }, []);

  // Upload image file (reads file as Base64, calls API and updates state)
  const uploadImageFile = useCallback(async ({ file, title, category, alt, span, targetSection }) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          let newImg;

          try {
            const apiRes = await uploadImageFileApi({
              base64Data,
              filename: file.name,
              title: title || file.name.replace(/\.[^/.]+$/, ''),
              category: category || 'Township',
              alt: alt || title || file.name,
              span: span || 'col-span-1 row-span-1',
              targetSection: targetSection || 'gallery',
            });
            if (apiRes?.data) {
              newImg = apiRes.data;
            }
          } catch {
            // Fallback: use data URL locally
          }

          if (!newImg) {
            newImg = {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              src: base64Data,
              title: title || file.name.replace(/\.[^/.]+$/, ''),
              alt: alt || title || file.name,
              category: category || 'Township',
              span: span || 'col-span-1 row-span-1',
              targetSection: targetSection || 'gallery',
              createdAt: new Date().toISOString(),
            };
          }

          setImages((prev) => [newImg, ...prev]);
          resolve(newImg);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Add image by URL
  const addImageUrl = useCallback(async ({ src, title, category, alt, span, targetSection }) => {
    let newImg;
    try {
      const apiRes = await addImageApi({
        src,
        title,
        category,
        alt,
        span,
        targetSection,
      });
      if (apiRes?.data) newImg = apiRes.data;
    } catch {
      // Fallback
    }

    if (!newImg) {
      newImg = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        src,
        title: title || 'New Image',
        alt: alt || title || 'New Image',
        category: category || 'Township',
        span: span || 'col-span-1 row-span-1',
        targetSection: targetSection || 'gallery',
        createdAt: new Date().toISOString(),
      };
    }

    setImages((prev) => [newImg, ...prev]);
    return newImg;
  }, []);

  // Replace existing image file or URL
  const replaceImage = useCallback(async (id, { file, src, title, category, alt, span, targetSection }) => {
    let updatedImg;

    if (file) {
      // Read file as base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      try {
        const apiRes = await updateImageApi(id, {
          base64Data,
          title,
          category,
          alt,
          span,
          targetSection,
        });
        if (apiRes?.data) updatedImg = apiRes.data;
      } catch {
        // Fallback
      }

      if (!updatedImg) {
        setImages((prev) =>
          prev.map((img) =>
            String(img.id) === String(id)
              ? {
                  ...img,
                  src: base64Data,
                  title: title !== undefined ? title : img.title,
                  category: category !== undefined ? category : img.category,
                  alt: alt !== undefined ? alt : img.alt,
                  span: span !== undefined ? span : img.span,
                  targetSection: targetSection !== undefined ? targetSection : img.targetSection,
                  updatedAt: new Date().toISOString(),
                }
              : img
          )
        );
        return;
      }
    } else if (src) {
      try {
        const apiRes = await updateImageApi(id, {
          src,
          title,
          category,
          alt,
          span,
          targetSection,
        });
        if (apiRes?.data) updatedImg = apiRes.data;
      } catch {
        // Fallback
      }

      if (!updatedImg) {
        setImages((prev) =>
          prev.map((img) =>
            String(img.id) === String(id)
              ? {
                  ...img,
                  src,
                  title: title !== undefined ? title : img.title,
                  category: category !== undefined ? category : img.category,
                  alt: alt !== undefined ? alt : img.alt,
                  span: span !== undefined ? span : img.span,
                  targetSection: targetSection !== undefined ? targetSection : img.targetSection,
                  updatedAt: new Date().toISOString(),
                }
              : img
          )
        );
        return;
      }
    } else {
      // Only metadata updates
      try {
        const apiRes = await updateImageApi(id, {
          title,
          category,
          alt,
          span,
          targetSection,
        });
        if (apiRes?.data) updatedImg = apiRes.data;
      } catch {
        // Fallback
      }

      if (!updatedImg) {
        setImages((prev) =>
          prev.map((img) =>
            String(img.id) === String(id)
              ? {
                  ...img,
                  title: title !== undefined ? title : img.title,
                  category: category !== undefined ? category : img.category,
                  alt: alt !== undefined ? alt : img.alt,
                  span: span !== undefined ? span : img.span,
                  targetSection: targetSection !== undefined ? targetSection : img.targetSection,
                  updatedAt: new Date().toISOString(),
                }
              : img
          )
        );
        return;
      }
    }

    if (updatedImg) {
      setImages((prev) =>
        prev.map((img) => (String(img.id) === String(id) ? updatedImg : img))
      );
    }
  }, []);

  // Delete image
  const deleteImage = useCallback(async (id) => {
    try {
      await deleteImageApi(id);
    } catch {
      // ignore
    }
    setImages((prev) => prev.filter((img) => String(img.id) !== String(id)));
  }, []);

  // Reset to default gallery images
  const resetImagesToDefault = useCallback(async () => {
    try {
      await resetImagesApi();
    } catch {
      // ignore
    }
    const defaults = defaultGalleryImages.map((img) => ({
      ...img,
      title: img.title || img.alt || 'Gallery Image',
      targetSection: img.targetSection || 'gallery',
    }));
    setImages(defaults);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
