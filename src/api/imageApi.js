import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_DOC_REF = 'settings';
const IMAGES_DOC_ID = 'galleryImages';

export async function fetchAllImages() {
  // 1. First try direct Firestore cloud fetch
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, IMAGES_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
        return data.images;
      }
    }
  } catch (firestoreErr) {
    console.warn('Firestore images fetch error, trying backend API:', firestoreErr.message);
  }

  // 2. Try Node/Express backend if running
  try {
    const res = await apiGet('/images', { auth: 'optional' });
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn('Backend images fetch failed:', err.message);
  }

  return null;
}

export async function syncImagesToFirestore(imagesList) {
  if (!Array.isArray(imagesList)) return;
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, IMAGES_DOC_ID);
    await setDoc(docRef, {
      images: imagesList,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync images to Firestore:', err.message);
  }
}

export async function uploadImageFileApi(data) {
  // data = { base64Data, filename, title, category, alt, span, targetSection }
  try {
    return await apiPost('/images/upload', data, { auth: 'optional' });
  } catch {
    return null;
  }
}

export async function addImageApi(data) {
  // data = { src, title, alt, category, targetSection, span }
  try {
    return await apiPost('/images', data, { auth: 'optional' });
  } catch {
    return null;
  }
}

export async function updateImageApi(id, updates) {
  // updates = { src, title, alt, category, targetSection, span, base64Data }
  try {
    return await apiPut(`/images/${id}`, updates, { auth: 'optional' });
  } catch {
    return null;
  }
}

export async function deleteImageApi(id) {
  try {
    return await apiDelete(`/images/${id}`, { auth: 'optional' });
  } catch {
    return null;
  }
}

export async function resetImagesApi() {
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, IMAGES_DOC_ID);
    await setDoc(docRef, { images: [] });
  } catch {
    // ignore
  }

  try {
    return await apiPost('/images/reset', {}, { auth: 'optional' });
  } catch {
    return null;
  }
}

/**
 * Real-time listener for gallery/managed images across all browsers.
 */
export function subscribeToImageChanges(onImagesUpdate) {
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, IMAGES_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
            onImagesUpdate(data.images);
          }
        }
      },
      (error) => {
        console.warn('Real-time images subscription notice:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Unable to establish Firestore real-time images listener:', err.message);
    return () => {};
  }
}

