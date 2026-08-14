import { apiPost, apiGet, apiPut, apiPatch, apiDelete } from './client';

export function syncUser(data) {
  return apiPost('/users/sync', data, { auth: true });
}

export function getProfile() {
  return apiGet('/users/profile');
}

export function updateProfile(data) {
  return apiPut('/users/profile', data);
}

export function getMyBookings(params) {
  return apiGet('/users/bookings', { params });
}

export function deleteAccount() {
  return apiDelete('/users/account');
}

export function cancelBooking(bookingId) {
  return apiPatch(`/bookings/${bookingId}/cancel`, {});
}
