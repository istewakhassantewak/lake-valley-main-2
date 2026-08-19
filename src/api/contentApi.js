import { apiGet, apiPut, apiPost } from './client';
import { db, ensureFirebaseAuth } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const CONTENT_DOC_ID = 'siteContent';

/**
 * Deeply sanitizes objects and arrays so they are 100% compliant with Firestore SDK
 * (removes undefined values, converts NaN, unwraps proxy objects).
 */
function sanitizeForFirestore(data) {
  if (data === undefined) return null;
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value === undefined) return null;
      if (typeof value === 'number' && Number.isNaN(value)) return 0;
      return value;
    })
  );
}

export async function fetchContentApi() {
  await ensureFirebaseAuth().catch(() => {});

  // 1. Try Firestore direct persistent cloud fetch
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONTENT_DOC_ID);
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
    console.warn('Backend content fetch notice:', err.message);
  }

  return null;
}

export async function updateContentApi(updates) {
  await ensureFirebaseAuth().catch(() => {});

  let payloadToSave = {};

  if (updates && updates.section && updates.data !== undefined) {
    payloadToSave = {
      [updates.section]: updates.data,
      lastUpdated: new Date().toISOString(),
      updatedSection: updates.section,
    };
  } else if (updates && typeof updates === 'object') {
    payloadToSave = {
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
  }

  const cleanPayload = sanitizeForFirestore(payloadToSave);

  let firestoreSuccess = false;
  let firestoreError = null;

  // 1. Persist to Firestore cloud database (accessible globally across all browsers)
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONTENT_DOC_ID);
    await setDoc(docRef, cleanPayload, { merge: true });
    firestoreSuccess = true;
  } catch (err) {
    firestoreError = err;
    console.warn('Firestore content update notice:', err.message);
  }

  // 2. Also save section-level doc for extra resilience
  if (updates?.section && updates?.data !== undefined) {
    try {
      const sectionDocRef = doc(db, SETTINGS_COLLECTION, updates.section);
      await setDoc(
        sectionDocRef,
        {
          data: sanitizeForFirestore(updates.data),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // secondary backup
    }
  }

  // 3. Also try syncing to Node backend server
  try {
    await apiPut('/content', cleanPayload, { auth: 'optional' });
  } catch {
    // Backend may not be running on static deployments
  }

  return { success: true, firestore: firestoreSuccess, error: firestoreError?.message };
}

export async function resetContentApi() {
  await ensureFirebaseAuth().catch(() => {});

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONTENT_DOC_ID);
    await setDoc(docRef, { resetAt: new Date().toISOString() });
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
    const docRef = doc(db, SETTINGS_COLLECTION, CONTENT_DOC_ID);
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


