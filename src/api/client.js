import { getIdToken } from '../firebase';
import { getAdminToken } from './adminApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function buildHeaders(auth = false, forceRefresh = false) {
  const headers = { 'Content-Type': 'application/json' };
  const adminToken = getAdminToken();

  if (adminToken) {
    headers['x-admin-token'] = adminToken;
    if (!headers.Authorization) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
  }

  const needsAuth = auth === true || auth === 'optional';
  if (needsAuth) {
    const token = await getIdToken(forceRefresh);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (auth === true && !adminToken) {
      throw new Error('Authentication required. Please sign in.');
    }
  }
  return headers;
}

async function parseResponse(res) {
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    const errorMsg =
      payload?.message ||
      payload?.error ||
      payload?.details ||
      (typeof payload === 'string' && payload ? payload : null);
    throw new Error(errorMsg || `Request failed with status ${res.status}`);
  }

  return payload;
}

async function request(method, path, { auth = false, params, body, retried = false, forceRefresh = false } = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: await buildHeaders(auth, forceRefresh),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && auth === true && !retried) {
    return request(method, path, { auth, params, body, retried: true, forceRefresh: true });
  }

  return parseResponse(res);
}

export async function apiPost(path, data, options = {}) {
  return request('POST', path, { auth: false, ...options, body: data });
}

export async function apiGet(path, options = {}) {
  return request('GET', path, { auth: true, ...options });
}

export async function apiPut(path, data, options = {}) {
  return request('PUT', path, { auth: true, ...options, body: data });
}

export async function apiPatch(path, data, options = {}) {
  return request('PATCH', path, { auth: true, ...options, body: data });
}

export async function apiDelete(path, options = {}) {
  return request('DELETE', path, { auth: true, ...options });
}
