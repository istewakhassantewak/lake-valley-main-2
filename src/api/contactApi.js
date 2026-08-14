import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export function submitContactMessage(data) {
  return apiPost('/contact', data, { auth: 'optional' });
}

export async function getMyContactMessages() {
  const data = await apiGet('/contact/me');
  return data.messages || data || [];
}

export async function getAllContactMessages() {
  const data = await apiGet('/contact', { auth: 'optional' });
  return data.messages || data || [];
}

export async function updateContactMessageStatus(id, status) {
  return apiPatch(`/contact/${id}/status`, { status }, { auth: 'optional' });
}

export async function deleteContactMessage(id) {
  return apiDelete(`/contact/${id}`, { auth: 'optional' });
}
