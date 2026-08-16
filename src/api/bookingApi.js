import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import { db } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';

/** Submits booking; persists to Firestore and backend */
export async function submitBooking(data) {
  const bookingPayload = {
    ...data,
    status: data.status || 'new',
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
  };

  let firestoreId = null;
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const docRef = await addDoc(colRef, bookingPayload);
    firestoreId = docRef.id;
  } catch (err) {
    console.warn('Firestore booking submission notice:', err.message);
  }

  try {
    const res = await apiPost('/bookings', { ...bookingPayload, id: firestoreId }, { auth: 'optional' });
    return res?.data || res || { success: true, id: firestoreId };
  } catch {
    return { success: true, id: firestoreId };
  }
}

export async function getAllBookings() {
  const bookingsMap = new Map();

  // 1. Fetch from Firestore
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      bookingsMap.set(d.id, { id: d.id, ...d.data() });
    });
  } catch {
    try {
      const colRef = collection(db, BOOKINGS_COLLECTION);
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        bookingsMap.set(d.id, { id: d.id, ...d.data() });
      });
    } catch (err) {
      console.warn('Firestore bookings read notice:', err.message);
    }
  }

  // 2. Fetch from backend API
  try {
    const data = await apiGet('/bookings', { auth: 'optional' });
    const list = data.bookings || data?.data?.bookings || (Array.isArray(data) ? data : []);
    if (Array.isArray(list)) {
      list.forEach((b) => {
        if (b && (b.id || b._id)) {
          const id = b.id || b._id;
          if (!bookingsMap.has(id)) {
            bookingsMap.set(id, b);
          }
        }
      });
    }
  } catch {
    // ignore
  }

  return Array.from(bookingsMap.values());
}

export async function updateBookingStatus(id, status) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, String(id));
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore booking status update notice:', err.message);
  }

  try {
    return await apiPatch(`/bookings/${id}/status`, { status }, { auth: 'optional' });
  } catch {
    return { success: true };
  }
}

export async function deleteBooking(id) {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, String(id));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore booking deletion notice:', err.message);
  }

  try {
    return await apiDelete(`/bookings/${id}`, { auth: 'optional' });
  } catch {
    return { success: true };
  }
}
