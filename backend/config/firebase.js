const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

function initFirebase() {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return admin;
  }

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, '..', 'firebase-admin-key.json');

  if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = require(keyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      console.log('Firebase Admin initialized with service account key');
      return admin;
    } catch (error) {
      console.warn('Firebase admin key could not be loaded:', error.message);
    }
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      initialized = true;
      console.log('Firebase Admin initialized with env credentials');
      return admin;
    } catch (error) {
      console.warn('Firebase env credentials invalid:', error.message);
    }
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'lake-valley-b23e2';
    admin.initializeApp({ projectId });
    initialized = true;
    console.log(`Firebase Admin initialized in basic mode with projectId: ${projectId}`);
    return admin;
  } catch (err) {
    console.warn('Firebase Admin basic initialization error:', err.message);
    return null;
  }
}

module.exports = { initFirebase, admin };
