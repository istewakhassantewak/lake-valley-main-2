import { apiGet, apiPut, apiPost } from './client';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_DOC_REF = 'settings';
const CONTENT_DOC_ID = 'siteContent';

export async function fetchContentApi() {
  // 1. Try Firestore direct persistent cloud fetch
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, CONTENT_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return data;
      }
    }
  } catch (firestoreErr) {
    console.warn('Firestore content fetch error, trying backend API:', firestoreErr.message);
  }

  // 2. Try Node/Express backend if running
  try {
    const res = await apiGet('/content', { auth: 'optional' });
    if (res?.data || (res && typeof res === 'object' && !res.error)) {
      return res?.data || res;
    }
  } catch (err) {
    console.warn('Backend content fetch failed:', err.message);
  }

  return null;
}

export async function updateContentApi(updates) {
  let payloadToSave = {};

  if (updates && updates.section && updates.data !== undefined) {
    payloadToSave = { [updates.section]: updates.data };
  } else if (updates && typeof updates === 'object') {
    payloadToSave = { ...updates };
  }

  // 1. Persist to Firestore cloud database (accessible globally across all browsers)
  let firestoreSuccess = false;
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, CONTENT_DOC_ID);
    await setDoc(docRef, payloadToSave, { merge: true });
    firestoreSuccess = true;
  } catch (firestoreErr) {
    console.warn('Firestore content update warning:', firestoreErr.message);
  }

  // 2. Also try syncing to Node backend server
  try {
    await apiPut('/content', updates, { auth: 'optional' });
  } catch {
    // Backend may not be running on static deployments
  }

  return { success: true, firestore: firestoreSuccess };
}

export async function resetContentApi() {
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, CONTENT_DOC_ID);
    await setDoc(docRef, {});
  } catch (err) {
    console.warn('Firestore content reset warning:', err.message);
  }

  try {
    await apiPost('/content/reset', {}, { auth: 'optional' });
  } catch {
    // Backend may be offline
  }

  return { success: true };
}

/**
 * Subscribes to real-time content changes across all connected devices and browsers.
 */
export function subscribeToContentChanges(onContentUpdate) {
  try {
    const docRef = doc(db, SETTINGS_DOC_REF, CONTENT_DOC_ID);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const liveData = snapshot.data();
          if (liveData && typeof liveData === 'object') {
            onContentUpdate(liveData);
          }
        }
      },
      (error) => {
        console.warn('Real-time content subscription notice:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Unable to establish Firestore real-time content listener:', err.message);
    return () => {};
  }
}

