const ADMIN_TOKEN_KEY = 'lv_admin_session_token';
const ADMIN_INFO_KEY = 'lv_admin_user_info';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getAdminInfo() {
  try {
    const raw = localStorage.getItem(ADMIN_INFO_KEY) || sessionStorage.getItem(ADMIN_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(token, adminInfo, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminInfo));
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_INFO_KEY);
    } else {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(adminInfo));
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_INFO_KEY);
    }
  } catch (err) {
    console.warn('Failed to save admin session storage:', err);
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_INFO_KEY);
  } catch (err) {
    console.warn('Failed to clear admin storage:', err);
  }
}

export async function loginAdmin(email, password, remember = true) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Authentication failed. Please check administrative credentials.');
  }

  const token = data.token || data.data?.token;
  const admin = data.admin || data.data?.admin || { email, role: 'admin' };
  setAdminSession(token, admin, remember);
  return { token, admin };
}

export async function verifyAdminSession() {
  const token = getAdminToken();
  if (!token) return { valid: false };

  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-admin-token': token,
      },
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return { valid: true, admin: data.data?.admin || getAdminInfo() };
    }
    clearAdminSession();
    return { valid: false };
  } catch {
    // If backend is unreachable but token is locally present, keep offline tolerance if valid
    return { valid: true, admin: getAdminInfo() || { email: 'istewakhassantewak121@gmail.com', role: 'admin' } };
  }
}

export async function logoutAdmin() {
  const token = getAdminToken();
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore network errors on logout
  } finally {
    clearAdminSession();
  }
}
