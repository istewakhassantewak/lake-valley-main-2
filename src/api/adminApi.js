const ADMIN_TOKEN_KEY = 'lv_admin_session_token';
const ADMIN_INFO_KEY = 'lv_admin_user_info';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Fallback universal credentials for static deployments (e.g. Vercel / Netlify)
const STATIC_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'istewakhassantewak121@gmail.com').toLowerCase().trim();
const STATIC_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Istee@787898';

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

/**
 * Safely parse JSON from a response, handling empty bodies, HTML 404s, or Vite index.html rewrites.
 */
async function safelyParseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    try {
      const text = await response.text();
      if (text && text.trim().startsWith('{')) {
        return JSON.parse(text);
      }
    } catch {
      // ignore
    }
    return null;
  }

  try {
    const text = await response.text();
    return text && text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * Generates a client-side admin session token for static environments.
 */
function createStaticAdminToken(email) {
  const payload = {
    email: email.toLowerCase().trim(),
    role: 'admin',
    iss: 'lake-valley-static-auth',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  return `lv_admin_${btoa(JSON.stringify(payload)).replace(/=/g, '')}`;
}

export async function loginAdmin(email, password, remember = true) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const rawPassword = (password || '').trim();

  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail, password: rawPassword }),
    });

    const data = await safelyParseResponse(response);

    // If backend provided a valid JSON response
    if (data) {
      if (response.ok && data.success) {
        const token = data.token || data.data?.token || createStaticAdminToken(normalizedEmail);
        const admin = data.admin || data.data?.admin || {
          email: normalizedEmail,
          role: 'admin',
          name: 'Principal Executive Admin',
        };
        setAdminSession(token, admin, remember);
        return { token, admin };
      } else if (!response.ok && data.message) {
        // Backend actively rejected with a message
        throw new Error(data.message);
      }
    }
  } catch (err) {
    // If it's an explicit rejection error from backend, re-throw
    if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
      throw err;
    }
    // Otherwise fallback to static verification (e.g. on Vercel static hosting)
  }

  // Fallback verification for static deployments (like Vercel, Netlify, GitHub Pages)
  if (
    normalizedEmail === STATIC_ADMIN_EMAIL &&
    rawPassword === STATIC_ADMIN_PASSWORD
  ) {
    const token = createStaticAdminToken(normalizedEmail);
    const admin = {
      email: normalizedEmail,
      role: 'admin',
      name: 'Principal Executive Admin',
      authorizedAt: new Date().toISOString(),
    };
    setAdminSession(token, admin, remember);
    return { token, admin };
  }

  throw new Error('Authentication failed. Invalid administrative email or password.');
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

    const data = await safelyParseResponse(response);
    if (response.ok && data && data.success) {
      return { valid: true, admin: data.data?.admin || data.admin || getAdminInfo() };
    }
    if (data && data.success === false) {
      clearAdminSession();
      return { valid: false };
    }
  } catch {
    // Network or static deployment: continue with local check
  }

  // Offline / Static deployment verification
  const localAdmin = getAdminInfo();
  if (localAdmin && token) {
    return { valid: true, admin: localAdmin };
  }

  return { valid: false };
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

