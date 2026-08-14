const crypto = require('crypto');
const { success, error } = require('../utils/apiResponse');

// Universal Administrative Credentials
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'istewakhassantewak121@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Istee@787898';
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'lake_valley_admin_hmac_secret_key_787898_2026';

/**
 * Safe string comparison for administrative credentials.
 */
function safeStringCompare(input, target) {
  if (typeof input !== 'string' || typeof target !== 'string') return false;
  try {
    const inputBuf = Buffer.from(input.normalize('NFC'), 'utf8');
    const targetBuf = Buffer.from(target.normalize('NFC'), 'utf8');
    if (inputBuf.length !== targetBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(inputBuf, targetBuf);
  } catch {
    return input === target;
  }
}

/**
 * Generates an HMAC-SHA256 authenticated Admin Session Token.
 */
function generateAdminToken(email) {
  const payload = {
    email: email.toLowerCase().trim(),
    role: 'admin',
    iss: 'lake-valley-auth-service',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7-day validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes an Admin Session Token.
 */
function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (!safeStringCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload || payload.role !== 'admin') return null;
    if (payload.exp && Date.now() > payload.exp) return null;
    if (payload.email !== ADMIN_EMAIL) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/login
 * Universal single admin authentication endpoint.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return error(res, 'Email address and password are required', 400);
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();

    const isEmailValid = safeStringCompare(cleanEmail, ADMIN_EMAIL);
    const isPasswordValid = safeStringCompare(cleanPassword, ADMIN_PASSWORD);

    if (!isEmailValid || !isPasswordValid) {
      return error(res, 'Invalid administrative credentials. Access denied.', 401);
    }

    const token = generateAdminToken(ADMIN_EMAIL);

    return success(
      res,
      {
        token,
        message: 'Administrative authentication successful',
        admin: {
          email: ADMIN_EMAIL,
          name: 'Principal Executive Admin',
          role: 'admin',
          authorizedAt: new Date().toISOString(),
        },
      },
      200
    );
  } catch (err) {
    return error(res, 'Admin authentication process failed: ' + err.message, 500);
  }
};

/**
 * GET /api/admin/verify
 * Validates active admin session token.
 */
exports.verifySession = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.headers['x-admin-token'] ||
      (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null);

    if (!token) {
      return error(res, 'No admin session token provided', 401);
    }

    const verified = verifyAdminToken(token);
    if (!verified) {
      return error(res, 'Admin session expired or invalid', 401);
    }

    return success(
      res,
      {
        valid: true,
        message: 'Session is valid',
        admin: {
          email: ADMIN_EMAIL,
          role: 'admin',
          name: 'Principal Executive Admin',
        },
      },
      200
    );
  } catch (err) {
    return error(res, 'Session verification error: ' + err.message, 500);
  }
};

/**
 * POST /api/admin/logout
 */
exports.logout = async (req, res) => {
  return success(res, { loggedOut: true, message: 'Admin session cleared' }, 200);
};

// Export internal verification helpers for middleware use
exports.verifyAdminToken = verifyAdminToken;
exports.generateAdminToken = generateAdminToken;
exports.safeStringCompare = safeStringCompare;
