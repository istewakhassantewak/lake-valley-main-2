import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function fetchAllImages() {
  try {
    const res = await apiGet('/images', { auth: 'optional' });
    return res?.data || res || [];
  } catch (err) {
    console.warn('Backend images fetch failed, using fallback:', err.message);
    return null;
  }
}

export async function uploadImageFileApi(data) {
  // data = { base64Data, filename, title, category, alt, span, targetSection }
  return await apiPost('/images/upload', data, { auth: 'optional' });
}

export async function addImageApi(data) {
  // data = { src, title, alt, category, targetSection, span }
  return await apiPost('/images', data, { auth: 'optional' });
}

export async function updateImageApi(id, updates) {
  // updates = { src, title, alt, category, targetSection, span, base64Data }
  return await apiPut(`/images/${id}`, updates, { auth: 'optional' });
}

export async function deleteImageApi(id) {
  return await apiDelete(`/images/${id}`, { auth: 'optional' });
}

export async function resetImagesApi() {
  return await apiPost('/images/reset', {}, { auth: 'optional' });
}
