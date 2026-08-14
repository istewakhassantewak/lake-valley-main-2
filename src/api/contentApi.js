import { apiGet, apiPut, apiPost } from './client';

export async function fetchContentApi() {
  try {
    const res = await apiGet('/content', { auth: 'optional' });
    return res?.data || res || null;
  } catch (err) {
    console.warn('Backend content fetch failed, using frontend fallback:', err.message);
    return null;
  }
}

export async function updateContentApi(updates) {
  // updates can be { section: 'site', data: {...} } or full content object
  return await apiPut('/content', updates, { auth: 'optional' });
}

export async function resetContentApi() {
  return await apiPost('/content/reset', {}, { auth: 'optional' });
}
