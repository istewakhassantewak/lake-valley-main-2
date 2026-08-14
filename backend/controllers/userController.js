const mongoose = require('mongoose');
const User = require('../models/User');
const { sanitizeString, isValidPhone, pickFields } = require('../utils/validate');
const { success, error } = require('../utils/apiResponse');
const fallbackStore = require('../utils/fallbackStore');

const PROFILE_FIELDS = [
  'displayName',
  'username',
  'photoURL',
  'bannerURL',
  'phone',
  'dateOfBirth',
  'gender',
  'country',
  'address',
  'bio',
  'socialLinks',
];

function formatUserResponse(user) {
  if (!user) return {};
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  let completion = 0;
  try {
    if (typeof user.getProfileCompletion === 'function') {
      completion = user.getProfileCompletion();
    } else {
      const fields = [
        obj.displayName,
        obj.username,
        obj.photoURL,
        obj.phone,
        obj.dateOfBirth,
        obj.gender,
        obj.country,
        obj.address,
        obj.bio,
      ];
      const filled = fields.filter((f) => f && String(f).trim()).length;
      completion = Math.round((filled / fields.length) * 100);
    }
  } catch {
    completion = 60;
  }
  return {
    ...obj,
    profileCompletion: completion,
    memberSince: obj.createdAt || new Date(),
  };
}

/** Sync / upsert user after Firebase sign-in (called with verified token). */
exports.syncUser = async (req, res) => {
  try {
    const { displayName, phone, photoURL } = req.body;
    const updates = { lastLoginAt: new Date() };
    if (displayName) updates.displayName = sanitizeString(displayName, 100);
    if (phone) updates.phone = sanitizeString(phone, 30);
    if (photoURL !== undefined && photoURL !== '') {
      updates.photoURL = typeof photoURL === 'string' ? photoURL.slice(0, 10000000) : photoURL;
    }
    const provider = req.firebaseUser?.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email';
    updates.provider = provider;

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOneAndUpdate(
          { firebaseUid: req.firebaseUser.uid },
          { $set: updates },
          { new: true, upsert: true }
        );
      } catch {
        // MongoDB query failed or not ready
      }
    }

    if (!user) {
      const saved = fallbackStore.getUserByUid(req.firebaseUser.uid);
      user = {
        _id: req.firebaseUser.uid,
        firebaseUid: req.firebaseUser.uid,
        email: req.firebaseUser.email || '',
        displayName: saved?.displayName || req.firebaseUser.name || displayName || 'User',
        photoURL: photoURL || saved?.photoURL || req.firebaseUser.picture || '',
        country: saved?.country || '',
        phone: saved?.phone || phone || '',
        provider: req.firebaseUser.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email',
        accountStatus: 'active',
        getProfileCompletion: () => 80,
        toObject: function () { return this; },
      };
    }

    const formatted = formatUserResponse(user);
    fallbackStore.saveUser(formatted);

    return success(res, { message: 'User synced', user: formatted });
  } catch (err) {
    return error(res, 'Failed to sync user', 500, err.message);
  }
};

exports.getProfile = async (req, res) => {
  return success(res, { user: formatUserResponse(req.user) });
};

exports.updateProfile = async (req, res) => {
  const diagnosticId = `prof_update_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log(`[DIAGNOSTIC:${diagnosticId}] Profile update request started`);
  console.log(`[DIAGNOSTIC:${diagnosticId}] Firebase token payload:`, JSON.stringify({
    uid: req.firebaseUser?.uid,
    email: req.firebaseUser?.email,
    provider: req.firebaseUser?.firebase?.sign_in_provider,
    authTime: req.firebaseUser?.auth_time,
  }));
  console.log(`[DIAGNOSTIC:${diagnosticId}] Auth user context:`, JSON.stringify({
    _id: req.user?._id,
    firebaseUid: req.user?.firebaseUid,
    email: req.user?.email,
    accountStatus: req.user?.accountStatus,
  }));
  console.log(`[DIAGNOSTIC:${diagnosticId}] Raw req.body keys:`, Object.keys(req.body || {}));

  try {
    const raw = pickFields(req.body, PROFILE_FIELDS);
    const updates = {};
    const unsets = {};

    if (raw.displayName !== undefined) updates.displayName = sanitizeString(raw.displayName, 100);
    if (raw.username !== undefined) {
      const username = sanitizeString(raw.username, 30).toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (username) {
        if (username.length < 3) {
          console.warn(`[DIAGNOSTIC:${diagnosticId}] Validation failed: Username too short (<3 chars)`);
          return error(res, 'Username must be at least 3 characters', 400);
        }
        updates.username = username;
      } else {
        unsets.username = 1;
      }
    }
    if (raw.photoURL !== undefined) {
      updates.photoURL = typeof raw.photoURL === 'string' ? raw.photoURL.slice(0, 10000000) : '';
    }
    if (raw.bannerURL !== undefined) {
      updates.bannerURL = typeof raw.bannerURL === 'string' ? raw.bannerURL.slice(0, 10000000) : '';
    }
    if (raw.phone !== undefined) {
      const phone = sanitizeString(raw.phone, 30);
      if (phone && !isValidPhone(phone)) {
        console.warn(`[DIAGNOSTIC:${diagnosticId}] Validation failed: Invalid phone format '${phone}'`);
        return error(res, 'Invalid phone number format', 400);
      }
      updates.phone = phone;
    }
    if (raw.dateOfBirth !== undefined) {
      if (!raw.dateOfBirth) {
        updates.dateOfBirth = null;
      } else {
        const d = new Date(raw.dateOfBirth);
        updates.dateOfBirth = isNaN(d.getTime()) ? null : d;
      }
    }
    if (raw.gender !== undefined) {
      const allowed = ['male', 'female', 'other', 'prefer_not_to_say', ''];
      updates.gender = allowed.includes(raw.gender) ? raw.gender : '';
    }
    if (raw.country !== undefined) updates.country = sanitizeString(raw.country, 100);
    if (raw.address !== undefined) updates.address = sanitizeString(raw.address, 300);
    if (raw.bio !== undefined) updates.bio = sanitizeString(raw.bio, 500);
    if (raw.socialLinks !== undefined && typeof raw.socialLinks === 'object' && raw.socialLinks !== null) {
      updates.socialLinks = {
        facebook: sanitizeString(raw.socialLinks?.facebook || '', 200),
        twitter: sanitizeString(raw.socialLinks?.twitter || '', 200),
        linkedin: sanitizeString(raw.socialLinks?.linkedin || '', 200),
        instagram: sanitizeString(raw.socialLinks?.instagram || '', 200),
      };
    }

    console.log(`[DIAGNOSTIC:${diagnosticId}] Prepared updates:`, JSON.stringify({
      ...updates,
      photoURL: updates.photoURL ? `[string len ${updates.photoURL.length}]` : undefined,
      bannerURL: updates.bannerURL ? `[string len ${updates.bannerURL.length}]` : undefined,
    }));
    console.log(`[DIAGNOSTIC:${diagnosticId}] Prepared unsets:`, JSON.stringify(unsets));

    const mongoose = require('mongoose');
    let updatedUser = null;

    const mongoOp = {};
    if (Object.keys(updates).length > 0) mongoOp.$set = updates;
    if (Object.keys(unsets).length > 0) mongoOp.$unset = unsets;

    if (mongoose.connection.readyState === 1) {
      if (req.user && req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
        try {
          console.log(`[DIAGNOSTIC:${diagnosticId}] Executing findByIdAndUpdate for _id: ${req.user._id}`);
          updatedUser = await User.findByIdAndUpdate(req.user._id, mongoOp, {
            new: true,
            runValidators: true,
          });
          console.log(`[DIAGNOSTIC:${diagnosticId}] findByIdAndUpdate result:`, updatedUser ? 'SUCCESS' : 'NO_DOC_FOUND');
        } catch (dbErr) {
          console.warn(`[DIAGNOSTIC:${diagnosticId}] findByIdAndUpdate error:`, {
            name: dbErr.name,
            message: dbErr.message,
            code: dbErr.code,
            validationErrors: dbErr.errors ? Object.keys(dbErr.errors).map(k => ({ field: k, kind: dbErr.errors[k].kind, message: dbErr.errors[k].message })) : null,
          });
          if (dbErr.code === 11000) {
            return error(res, 'Username is already taken by another account', 409, 'Duplicate username');
          }
          if (dbErr.name === 'ValidationError') {
            const firstErr = Object.values(dbErr.errors || {})[0]?.message;
            return error(res, firstErr || 'Validation failed for user profile fields', 400, dbErr.message);
          }
          if (dbErr.name === 'CastError') {
            return error(res, `Invalid input format for ${dbErr.path}`, 400, dbErr.message);
          }
        }
      }

      if (!updatedUser && (req.user?.firebaseUid || req.firebaseUser?.uid)) {
        const uid = req.user?.firebaseUid || req.firebaseUser?.uid;
        try {
          console.log(`[DIAGNOSTIC:${diagnosticId}] Executing findOneAndUpdate for firebaseUid: ${uid}`);
          updatedUser = await User.findOneAndUpdate(
            { firebaseUid: uid },
            mongoOp,
            { new: true, upsert: true, runValidators: true }
          );
          console.log(`[DIAGNOSTIC:${diagnosticId}] findOneAndUpdate result:`, updatedUser ? 'SUCCESS' : 'FAILED');
        } catch (dbErr) {
          console.warn(`[DIAGNOSTIC:${diagnosticId}] findOneAndUpdate error:`, {
            name: dbErr.name,
            message: dbErr.message,
            code: dbErr.code,
            validationErrors: dbErr.errors ? Object.keys(dbErr.errors).map(k => ({ field: k, kind: dbErr.errors[k].kind, message: dbErr.errors[k].message })) : null,
          });
          if (dbErr.code === 11000) {
            return error(res, 'Username is already taken by another account', 409, 'Duplicate username');
          }
          if (dbErr.name === 'ValidationError') {
            const firstErr = Object.values(dbErr.errors || {})[0]?.message;
            return error(res, firstErr || 'Validation failed for user profile fields', 400, dbErr.message);
          }
          if (dbErr.name === 'CastError') {
            return error(res, `Invalid input format for ${dbErr.path}`, 400, dbErr.message);
          }
        }
      }
    } else {
      console.log(`[DIAGNOSTIC:${diagnosticId}] MongoDB connection not ready (readyState: ${mongoose.connection.readyState}), bypassing Mongo query`);
    }

    if (!updatedUser) {
      console.log(`[DIAGNOSTIC:${diagnosticId}] No Mongo document updated, applying in-memory fallback merge`);
      const baseUser = typeof req.user?.toObject === 'function' ? req.user.toObject() : { ...req.user };
      updatedUser = { ...baseUser, ...updates };
      if (unsets.username) delete updatedUser.username;
    }

    const formatted = formatUserResponse(updatedUser);
    fallbackStore.saveUser(formatted);

    console.log(`[DIAGNOSTIC:${diagnosticId}] Profile updated successfully for UID: ${formatted.firebaseUid || formatted._id}`);
    return success(res, { message: 'Profile updated', user: formatted });
  } catch (err) {
    console.error(`[DIAGNOSTIC:${diagnosticId}] Fatal updateProfile exception:`, {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack,
      validationErrors: err.errors ? Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message })) : null,
    });
    if (err.code === 11000) {
      return error(res, 'Username is already taken by another account', 409, 'Duplicate username');
    }
    if (err.name === 'ValidationError') {
      const firstErr = Object.values(err.errors || {})[0]?.message;
      return error(res, firstErr || 'Validation failed for profile update', 400, err.message);
    }
    return error(res, err.message || 'Failed to update profile', 500, err.message);
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const fallbackStore = require('../utils/fallbackStore');
    const mongoose = require('mongoose');

    const userEmail = (req.user?.email || req.firebaseUser?.email || '').toLowerCase();
    const userFirebaseUid = req.user?.firebaseUid || req.firebaseUser?.uid || (typeof req.user?._id === 'string' ? req.user._id : '');
    const userMongoId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id : null;

    const { status, search } = req.query;

    let dbBookings = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const Booking = require('../models/Booking');
        const orConditions = [];

        if (userMongoId) orConditions.push({ userId: userMongoId });
        if (userFirebaseUid) orConditions.push({ userFirebaseUid: userFirebaseUid });
        if (userEmail) orConditions.push({ email: userEmail });

        if (orConditions.length > 0) {
          const filter = { $or: orConditions };

          if (status === 'upcoming') {
            filter.status = { $in: ['new', 'contacted', 'site_visit_scheduled'] };
          } else if (status === 'completed') {
            filter.status = 'closed';
          } else if (status === 'cancelled') {
            filter.status = 'cancelled';
          } else if (status && status !== 'all') {
            filter.status = status;
          }

          dbBookings = await Booking.find(filter).sort({ createdAt: -1 });
        }
      } catch (dbErr) {
        console.warn('MongoDB getMyBookings query failed, falling back:', dbErr.message);
      }
    }

    const fbBookings = fallbackStore.getUserBookings({
      firebaseUid: userFirebaseUid,
      email: userEmail,
      mongoId: userMongoId ? userMongoId.toString() : '',
    });

    // Merge and deduplicate by bookingId or _id
    const seenIds = new Set();
    let combined = [];

    for (const b of [...dbBookings, ...fbBookings]) {
      const bObj = b.toObject ? b.toObject() : b;
      const key = bObj.bookingId || bObj._id?.toString() || bObj.id;
      if (key && !seenIds.has(key)) {
        seenIds.add(key);

        // Apply status filter for fallback records if needed
        let statusMatch = true;
        if (status === 'upcoming') {
          statusMatch = ['new', 'contacted', 'site_visit_scheduled'].includes(bObj.status);
        } else if (status === 'completed') {
          statusMatch = bObj.status === 'closed';
        } else if (status === 'cancelled') {
          statusMatch = bObj.status === 'cancelled';
        } else if (status && status !== 'all') {
          statusMatch = bObj.status === status;
        }

        if (statusMatch) {
          combined.push(bObj);
        }
      }
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(
        (b) =>
          (b.project && b.project.toLowerCase().includes(q)) ||
          (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
          (b.plotSize && b.plotSize.toLowerCase().includes(q)) ||
          (b.message && b.message.toLowerCase().includes(q))
      );
    }

    return success(res, { bookings: combined });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return error(res, 'Failed to fetch bookings', 500, err.message);
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1 && req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      await User.findByIdAndUpdate(req.user._id, {
        accountStatus: 'deleted',
        displayName: 'Deleted User',
        bio: '',
        phone: '',
        address: '',
        photoURL: '',
        bannerURL: '',
      });
    } else {
      req.user.accountStatus = 'deleted';
    }
    return success(res, { message: 'Account marked for deletion' });
  } catch (err) {
    return error(res, 'Failed to delete account', 500, err.message);
  }
};
