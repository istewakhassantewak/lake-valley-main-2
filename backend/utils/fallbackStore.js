const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTACTS_FILE = path.join(__dirname, '..', 'data', 'contact-messages.json');
const BOOKINGS_FILE = path.join(__dirname, '..', 'data', 'bookings.json');

function ensureFile(filePath) {
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
}

function readJson(filePath) {
  ensureFile(filePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson(filePath, data) {
  ensureFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function addContactMessage(message) {
  const messages = readJson(CONTACTS_FILE);
  const record = {
    _id: crypto.randomUUID(),
    ...message,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  messages.unshift(record);
  writeJson(CONTACTS_FILE, messages);
  return record;
}

function getContactMessages() {
  const messages = readJson(CONTACTS_FILE);
  return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUserContactMessages(userId) {
  if (!userId) return [];
  return getContactMessages().filter(
    (message) =>
      message.userId === userId ||
      message.userFirebaseUid === userId ||
      message.userEmail === userId
  );
}

function updateContactMessage(id, updates = {}) {
  const messages = readJson(CONTACTS_FILE);
  const idx = messages.findIndex((m) => m._id === id || m.id === id);
  if (idx < 0) return null;

  messages[idx] = {
    ...messages[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJson(CONTACTS_FILE, messages);
  return messages[idx];
}

function deleteContactMessage(id) {
  const messages = readJson(CONTACTS_FILE);
  const filtered = messages.filter((m) => m._id !== id && m.id !== id);
  const changed = filtered.length !== messages.length;
  if (changed) {
    writeJson(CONTACTS_FILE, filtered);
  }
  return changed;
}

function addBooking(booking) {
  const bookings = readJson(BOOKINGS_FILE);
  const record = {
    _id: crypto.randomUUID(),
    ...booking,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.unshift(record);
  writeJson(BOOKINGS_FILE, bookings);
  return record;
}

function getBookings() {
  const bookings = readJson(BOOKINGS_FILE);
  return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUserBookings(query) {
  const allBookings = getBookings();
  if (!query) return [];

  let uid = '';
  let email = '';
  let mongoId = '';

  if (typeof query === 'string') {
    uid = query;
    mongoId = query;
  } else if (typeof query === 'object') {
    uid = query.firebaseUid || '';
    email = (query.email || '').toLowerCase();
    mongoId = query.mongoId || '';
  }

  return allBookings.filter((b) => {
    if (uid && (b.userFirebaseUid === uid || b.userId === uid)) return true;
    if (mongoId && b.userId === mongoId) return true;
    if (email && b.email && b.email.toLowerCase() === email) return true;
    return false;
  });
}

function updateBooking(id, updates = {}) {
  const bookings = readJson(BOOKINGS_FILE);
  const idx = bookings.findIndex((b) => b._id === id || b.id === id);
  if (idx < 0) return null;

  bookings[idx] = {
    ...bookings[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeJson(BOOKINGS_FILE, bookings);
  return bookings[idx];
}

function deleteBooking(id) {
  const bookings = readJson(BOOKINGS_FILE);
  const filtered = bookings.filter((b) => b._id !== id && b.id !== id);
  const changed = filtered.length !== bookings.length;
  if (changed) {
    writeJson(BOOKINGS_FILE, filtered);
  }
  return changed;
}

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function saveUser(userData) {
  if (!userData) return null;
  const users = readJson(USERS_FILE);
  const uid = userData.firebaseUid || userData._id || userData.id;
  if (!uid) return userData;

  const idx = users.findIndex((u) => u.firebaseUid === uid || u._id === uid || u.id === uid);
  const updated = {
    ...(idx >= 0 ? users[idx] : {}),
    ...userData,
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    users[idx] = updated;
  } else {
    users.unshift(updated);
  }

  writeJson(USERS_FILE, users);
  return updated;
}

function getUserByUid(uid) {
  if (!uid) return null;
  const users = readJson(USERS_FILE);
  return users.find((u) => u.firebaseUid === uid || u._id === uid || u.id === uid) || null;
}

module.exports = {
  addContactMessage,
  getContactMessages,
  getUserContactMessages,
  updateContactMessage,
  deleteContactMessage,
  addBooking,
  getBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
  saveUser,
  getUserByUid,
};
