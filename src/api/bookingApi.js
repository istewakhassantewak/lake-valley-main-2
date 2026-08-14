import { apiGet, apiPost, apiPatch, apiDelete } from './client';

/** Submits booking; attaches auth token when user is signed in. */
export function submitBooking(data) {
  return apiPost('/bookings', data, { auth: 'optional' });
}

export async function getAllBookings() {
  const data = await apiGet('/bookings', { auth: 'optional' });
  return data.bookings || data || [];
}

export async function updateBookingStatus(id, status) {
  return apiPatch(`/bookings/${id}/status`, { status }, { auth: 'optional' });
}

export async function deleteBooking(id) {
  return apiDelete(`/bookings/${id}`, { auth: 'optional' });
}
