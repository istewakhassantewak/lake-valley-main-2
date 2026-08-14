const ContactMessage = require('../models/ContactMessage');
const notify = require('../utils/notify');
const fallbackStore = require('../utils/fallbackStore');
const { sanitizeString, isValidEmail } = require('../utils/validate');
const { success, error } = require('../utils/apiResponse');

function buildContactMessagePayload(req) {
  const name = sanitizeString(req.body.name, 100);
  const email = sanitizeString(req.body.email, 100).toLowerCase();
  const subject = sanitizeString(req.body.subject, 200);
  const message = sanitizeString(req.body.message, 2000);
  const payload = { name, email, subject, message };

  if (req.user) {
    const mongoose = require('mongoose');
    // Only set userId if it's a valid ObjectId (MongoDB mode)
    if (req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      payload.userId = req.user._id;
    }
    // Always store the Firebase UID for fallback matching
    const firebaseUid = req.user.firebaseUid || req.firebaseUser?.uid || (typeof req.user._id === 'string' ? req.user._id : '');
    if (firebaseUid) payload.userFirebaseUid = firebaseUid;
    if (req.user.email) payload.userEmail = req.user.email;
    if (req.user.displayName) payload.userName = req.user.displayName;
  }

  return payload;
}

exports.buildContactMessagePayload = buildContactMessagePayload;

exports.createMessage = async (req, res) => {
  try {
    const payload = buildContactMessagePayload(req);
    const { name, email, subject, message } = payload;

    if (!name || !email || !subject || !message) {
      return error(res, 'name, email, subject and message are required', 400);
    }
    if (!isValidEmail(email)) {
      return error(res, 'Invalid email address', 400);
    }

    let contactMessage;

    try {
      contactMessage = await ContactMessage.create(payload);
    } catch (dbError) {
      contactMessage = fallbackStore.addContactMessage(payload);
      console.warn('MongoDB save failed, used fallback storage:', dbError.message);
    }

    notify(`New contact message: ${subject}`, `Name: ${name}\nEmail: ${email}\n\n${message}`);

    return success(res, { message: 'Message received', contactMessage }, 201);
  } catch (err) {
    return error(res, 'Failed to save message', 500, err.message);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let messages = [];
    if (mongoose.connection.readyState === 1) {
      try {
        messages = await ContactMessage.find().sort({ createdAt: -1 });
      } catch (err) {
        console.warn('MongoDB getMessages error, falling back:', err.message);
      }
    }
    if (!messages || messages.length === 0) {
      messages = fallbackStore.getContactMessages();
    }
    return success(res, { messages });
  } catch (err) {
    return success(res, { messages: fallbackStore.getContactMessages() });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!status || !validStatuses.includes(status)) {
      return error(res, `Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
    }

    const mongoose = require('mongoose');
    let message = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        message = await ContactMessage.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('MongoDB updateMessageStatus failed, trying fallback:', dbErr.message);
      }
    }

    if (!message) {
      message = fallbackStore.updateContactMessage(id, { status });
    }

    if (!message) {
      return error(res, 'Contact message not found', 404);
    }

    return success(res, { message: 'Message status updated', contactMessage: message });
  } catch (err) {
    return error(res, 'Failed to update message status', 500, err.message);
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let deleted = false;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const resMongo = await ContactMessage.findByIdAndDelete(id);
        if (resMongo) deleted = true;
      } catch (dbErr) {
        console.warn('MongoDB deleteMessage failed, trying fallback:', dbErr.message);
      }
    }

    const fallbackDeleted = fallbackStore.deleteContactMessage(id);
    if (fallbackDeleted) deleted = true;

    if (!deleted) {
      return error(res, 'Contact message not found or already deleted', 404);
    }

    return success(res, { message: 'Message deleted successfully' });
  } catch (err) {
    return error(res, 'Failed to delete message', 500, err.message);
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userMongoId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id : null;
    const userFirebaseUid = req.user?.firebaseUid || req.firebaseUser?.uid || (typeof req.user?._id === 'string' ? req.user._id : '');
    const userEmail = (req.user?.email || req.firebaseUser?.email || '').toLowerCase();

    let dbMessages = [];
    if (mongoose.connection.readyState === 1) {
      try {
        const orConditions = [];
        if (userMongoId) orConditions.push({ userId: userMongoId });
        if (userFirebaseUid) orConditions.push({ userFirebaseUid: userFirebaseUid });
        if (userEmail) orConditions.push({ userEmail: userEmail });

        if (orConditions.length > 0) {
          dbMessages = await ContactMessage.find({ $or: orConditions }).sort({ createdAt: -1 });
        }
      } catch (dbErr) {
        console.warn('MongoDB getMyMessages query failed, falling back:', dbErr.message);
      }
    }

    const fbMessages = fallbackStore.getUserContactMessages(userFirebaseUid || userMongoId?.toString() || '');

    // Merge and deduplicate
    const seenIds = new Set();
    const combined = [];
    for (const m of [...dbMessages, ...fbMessages]) {
      const mObj = m.toObject ? m.toObject() : m;
      const key = mObj._id?.toString() || mObj.id;
      if (key && !seenIds.has(key)) {
        seenIds.add(key);
        combined.push(mObj);
      }
    }

    return success(res, { messages: combined });
  } catch (err) {
    console.error('getMyMessages error:', err);
    return error(res, 'Failed to fetch messages', 500, err.message);
  }
};
