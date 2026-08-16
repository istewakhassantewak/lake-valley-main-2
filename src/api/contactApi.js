import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { db } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';

const CONTACT_COLLECTION = 'contact_messages';

export async function submitContactMessage(data) {
  const contactPayload = {
    ...data,
    status: data.status || 'new',
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  let firestoreId = null;
  try {
    const colRef = collection(db, CONTACT_COLLECTION);
    const docRef = await addDoc(colRef, contactPayload);
    firestoreId = docRef.id;
  } catch (err) {
    console.warn('Firestore contact submission notice:', err.message);
  }

  try {
    const res = await apiPost('/contact', { ...contactPayload, id: firestoreId }, { auth: 'optional' });
    return res?.data || res || { success: true, id: firestoreId };
  } catch {
    return { success: true, id: firestoreId };
  }
}

export async function getMyContactMessages(userEmail) {
  const messagesMap = new Map();

  if (userEmail) {
    try {
      const colRef = collection(db, CONTACT_COLLECTION);
      const q = query(colRef, where('email', '==', userEmail.toLowerCase().trim()));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        messagesMap.set(d.id, { id: d.id, ...d.data() });
      });
    } catch {
      // ignore
    }
  }

  try {
    const data = await apiGet('/contact/me');
    const list = data.messages || data?.data?.messages || (Array.isArray(data) ? data : []);
    if (Array.isArray(list)) {
      list.forEach((m) => {
        if (m && (m.id || m._id)) {
          const id = m.id || m._id;
          if (!messagesMap.has(id)) {
            messagesMap.set(id, m);
          }
        }
      });
    }
  } catch {
    // ignore
  }

  return Array.from(messagesMap.values());
}

export async function getAllContactMessages() {
  const messagesMap = new Map();

  // 1. Fetch from Firestore
  try {
    const colRef = collection(db, CONTACT_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      messagesMap.set(d.id, { id: d.id, ...d.data() });
    });
  } catch {
    try {
      const colRef = collection(db, CONTACT_COLLECTION);
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        messagesMap.set(d.id, { id: d.id, ...d.data() });
      });
    } catch (err) {
      console.warn('Firestore messages read notice:', err.message);
    }
  }

  // 2. Fetch from backend API
  try {
    const data = await apiGet('/contact', { auth: 'optional' });
    const list = data.messages || data?.data?.messages || (Array.isArray(data) ? data : []);
    if (Array.isArray(list)) {
      list.forEach((m) => {
        if (m && (m.id || m._id)) {
          const id = m.id || m._id;
          if (!messagesMap.has(id)) {
            messagesMap.set(id, m);
          }
        }
      });
    }
  } catch {
    // ignore
  }

  return Array.from(messagesMap.values());
}

export async function updateContactMessageStatus(id, status) {
  try {
    const docRef = doc(db, CONTACT_COLLECTION, String(id));
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore message status update notice:', err.message);
  }

  try {
    return await apiPatch(`/contact/${id}/status`, { status }, { auth: 'optional' });
  } catch {
    return { success: true };
  }
}

export async function deleteContactMessage(id) {
  try {
    const docRef = doc(db, CONTACT_COLLECTION, String(id));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore message deletion notice:', err.message);
  }

  try {
    return await apiDelete(`/contact/${id}`, { auth: 'optional' });
  } catch {
    return { success: true };
  }
}
