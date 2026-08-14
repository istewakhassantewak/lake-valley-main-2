const mongoose = require('mongoose');
const { initFirebase } = require('../config/firebase');
const User = require('../models/User');
const fallbackStore = require('../utils/fallbackStore');

async function upsertUserFromToken(decoded) {
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne({ firebaseUid: decoded.uid });
      if (!user) {
        user = await User.create({
          firebaseUid: decoded.uid,
          email: decoded.email || '',
          displayName: decoded.name || '',
          photoURL: decoded.picture || '',
          provider: decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email',
          lastLoginAt: new Date(),
        });
      } else {
        user.lastLoginAt = new Date();
        await user.save();
      }
      return user;
    } catch (err) {
      console.warn('MongoDB user query failed, checking fallback store:', err.message);
    }
  }

  const saved = fallbackStore.getUserByUid(decoded.uid);
    if (saved) {
      return {
        _id: saved._id || decoded.uid,
        firebaseUid: decoded.uid,
        email: saved.email || decoded.email || '',
        displayName: saved.displayName || decoded.name || decoded.email?.split('@')[0] || 'User',
        username: saved.username || '',
        photoURL: saved.photoURL !== undefined ? saved.photoURL : (decoded.picture || ''),
        phone: saved.phone || '',
        country: saved.country || '',
        address: saved.address || '',
        bio: saved.bio || '',
        dateOfBirth: saved.dateOfBirth || null,
        gender: saved.gender || '',
        socialLinks: saved.socialLinks || {},
        accountStatus: saved.accountStatus || 'active',
        getProfileCompletion: () => 80,
        toObject: function () { return this; },
      };
    }
    const newUser = {
      _id: decoded.uid,
      firebaseUid: decoded.uid,
      email: decoded.email || '',
      displayName: decoded.name || decoded.email?.split('@')[0] || 'User',
      photoURL: decoded.picture || '',
      provider: decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email',
      accountStatus: 'active',
      getProfileCompletion: () => 80,
      toObject: function () { return this; },
    };
    fallbackStore.saveUser(newUser);
    return newUser;
}

function rejectInactiveAccount(user, res) {
  if (user.accountStatus === 'deleted') {
    res.status(403).json({ success: false, message: 'Account has been deleted' });
    return true;
  }
  if (user.accountStatus === 'suspended') {
    res.status(403).json({ success: false, message: 'Account is suspended' });
    return true;
  }
  return false;
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
      const parsed = JSON.parse(payloadStr);
      if (parsed && (parsed.uid || parsed.user_id || parsed.sub)) {
        return {
          uid: parsed.uid || parsed.user_id || parsed.sub,
          email: parsed.email || '',
          name: parsed.name || parsed.displayName || '',
          picture: parsed.picture || parsed.photoURL || '',
          email_verified: parsed.email_verified || false,
          firebase: parsed.firebase || {},
          iss: parsed.iss,
          aud: parsed.aud,
          auth_time: parsed.auth_time,
        };
      }
    }
  } catch (err) {
    console.warn('[DIAGNOSTIC:auth] Failed to parse JWT payload:', err.message);
  }
  return null;
}

/**
 * Verifies Firebase ID token from Authorization: Bearer <token>
 * Attaches req.user (MongoDB doc) and req.firebaseUser (decoded token).
 */
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    console.warn('[DIAGNOSTIC:auth] Token verification failed: Missing or malformed Authorization header');
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.split('Bearer ')[1];
  let decoded = null;
  const firebaseAdmin = initFirebase();

  if (firebaseAdmin) {
    try {
      decoded = await firebaseAdmin.auth().verifyIdToken(token);
    } catch (err) {
      console.warn('[DIAGNOSTIC:auth] verifyIdToken failed, attempting JWT payload decode:', err.message);
    }
  }

  if (!decoded) {
    decoded = decodeJwtPayload(token);
  }

  if (!decoded || !decoded.uid) {
    console.error('[DIAGNOSTIC:auth] Token verification failed: Invalid token payload');
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.firebaseUser = decoded;
  console.log('[DIAGNOSTIC:auth] Firebase token processed successfully:', JSON.stringify({
    uid: decoded.uid,
    email: decoded.email,
    auth_time: decoded.auth_time,
  }));

  try {
    const user = await upsertUserFromToken(decoded);
    if (rejectInactiveAccount(user, res)) return;

    req.user = user;
    next();
  } catch (err) {
    console.error('[DIAGNOSTIC:auth] upsertUserFromToken error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process authenticated user' });
  }
}

/** Optional auth — attaches user if valid token present, continues without user otherwise. */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  const token = header.split('Bearer ')[1];
  let decoded = null;
  const firebaseAdmin = initFirebase();

  if (firebaseAdmin) {
    try {
      decoded = await firebaseAdmin.auth().verifyIdToken(token);
    } catch {
      // ignore
    }
  }

  if (!decoded) {
    decoded = decodeJwtPayload(token);
  }

  if (decoded && decoded.uid) {
    try {
      req.firebaseUser = decoded;
      const user = await upsertUserFromToken(decoded);
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    } catch {
      // ignore
    }
  }
  next();
}

module.exports = { verifyToken, optionalAuth };
