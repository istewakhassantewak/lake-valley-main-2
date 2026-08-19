import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAKqRzEcaJ4yc4nfV_Z-xHsgQt1KMDATKw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lake-valley-b23e2.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lake-valley-b23e2',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lake-valley-b23e2.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '156953843011',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:156953843011:web:93197bb9c11234bfe4cbf6',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0 && import.meta.env.DEV) {
  console.warn(
    `[Firebase] Missing env vars: ${missingKeys.join(', ')}. Copy .env.example to .env.local`
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Ensures the client has an active Firebase Auth session (authenticated or anonymous).
 * This enables seamless Firestore database reading and writing across all browsers.
 */
let authPromise = null;
export async function ensureFirebaseAuth() {
  if (auth.currentUser) return auth.currentUser;
  if (!authPromise) {
    authPromise = (async () => {
      try {
        const cred = await signInAnonymously(auth);
        return cred.user;
      } catch (err) {
        // If anonymous auth is not enabled in Firebase Console, fallback silently
        return auth.currentUser || null;
      } finally {
        authPromise = null;
      }
    })();
  }
  return authPromise;
}

// Auto-initialize auth session in the background
ensureFirebaseAuth().catch(() => {});

// Check redirect result on load
getRedirectResult(auth).catch((err) => {
  console.error('Redirect sign in error:', err);
});

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    // Fallback to redirect if popup is blocked or fails in iframe
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.message?.includes('popup')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Links the current user's account with Google.
 * Used when a user signed up with email/password and wants to also sign in with Google.
 */
export async function linkGoogleAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const providers = (user.providerData || []).map((p) => p.providerId);
  if (providers.includes('google.com')) {
    throw new Error('This account is already linked with Google.');
  }

  try {
    const result = await linkWithCredential(user, googleProvider);
    return result.user;
  } catch (err) {
    // If the Google account already exists with a different credential,
    // we need to sign in with the Google credential and link the email/password.
    if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/account-exists-with-different-credential') {
      throw new Error('This Google account is already registered. Try signing in with Google instead.');
    }
    throw err;
  }
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export async function compressAndResizeImage(file, maxDimension = 1200, quality = 0.78) {
  if (!file || !(file instanceof Blob || (typeof file.type === 'string' && file.type.startsWith('image/')))) {
    return file;
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(file);
    }, 1500);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        clearTimeout(timer);
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  (file.name || 'image.jpg').replace(/\.[^/.]+$/, '.jpg'),
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }
                );
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(file);
      };
      img.src = e.target?.result;
    };
    reader.onerror = () => {
      clearTimeout(timer);
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadProfileImage(file, folder = 'avatars') {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  let processedFile = file;
  if (file.size > 300 * 1024) {
    try {
      processedFile = await compressAndResizeImage(file, 1000, 0.82);
    } catch {
      // compression fallback
    }
  }

  if (processedFile.size > 5 * 1024 * 1024) {
    throw new Error('Image is too large even after compression. Please select a smaller photo.');
  }

  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  let url = '';
  try {
    const ext = processedFile.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `${folder}/${user.uid}/${Date.now()}.${ext}`);
    await uploadBytes(storageRef, processedFile, { contentType: processedFile.type });
    url = await getDownloadURL(storageRef);
  } catch (storageError) {
    console.warn('Firebase Storage upload failed, converting to data URL fallback:', storageError);
    url = await fileToDataUrl(processedFile);
  }

  try {
    await updateProfile(user, { photoURL: url });
  } catch (err) {
    console.warn('Firebase Auth updateProfile photoURL failed:', err);
  }

  return url;
}

export async function uploadBannerImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  let processedFile = file;
  if (file.size > 300 * 1024) {
    try {
      processedFile = await compressAndResizeImage(file, 1600, 0.82);
    } catch {
      // compression fallback
    }
  }

  if (processedFile.size > 5 * 1024 * 1024) {
    throw new Error('Image is too large even after compression. Please select a smaller photo.');
  }

  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  try {
    const ext = processedFile.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `banners/${user.uid}/${Date.now()}.${ext}`);
    await uploadBytes(storageRef, processedFile, { contentType: processedFile.type });
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn('Firebase Storage banner upload failed, converting to data URL fallback:', err);
    return await fileToDataUrl(processedFile);
  }
}

export async function linkPasswordAccount(newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated or email missing.');

  // Already has a password provider — nothing to do
  const providers = (user.providerData || []).map((p) => p.providerId);
  if (providers.includes('password')) {
    throw new Error('This account already has a password. Use the "Change Existing Password" section instead.');
  }

  const credential = EmailAuthProvider.credential(user.email, newPassword);

  try {
    const result = await linkWithCredential(user, credential);
    return result.user;
  } catch (err) {
    // auth/credential-already-in-use means the email already has a password account.
    // In that case we can just tell the user to sign in with email/password.
    if (err.code === 'auth/credential-already-in-use') {
      throw new Error('This email already has a password. Try signing in with Email/Password.');
    }
    throw err;
  }
}

/** Returns list of provider IDs for the current user, e.g. ['google.com', 'password']. */
export function getAuthProviders() {
  const user = auth.currentUser;
  if (!user) return [];
  return (user.providerData || [])
    .map((p) => p.providerId)
    .filter(Boolean);
}

/** True if the current user can sign in with email + password. */
export function hasPasswordProvider() {
  return getAuthProviders().includes('password');
}

export async function removeProfileImage() {
  const user = auth.currentUser;
  if (!user) return true;
  try {
    await updateProfile(user, { photoURL: '' });
  } catch (err) {
    console.warn('Firebase Auth remove photoURL warning:', err);
  }
  return true;
}

export async function uploadAnyImageToFirebase(file, folder = 'site-assets') {
  if (!file) return null;
  await ensureFirebaseAuth().catch(() => {});

  let processedFile = file;
  try {
    processedFile = await compressAndResizeImage(file, 1400, 0.80);
  } catch (err) {
    console.warn('Compression notice:', err);
  }

  try {
    const ext = (processedFile.name || 'image.jpg').split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, processedFile, { contentType: processedFile.type || 'image/jpeg' });
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn('Firebase Storage upload notice, converting to optimized data URL fallback:', err?.message || err);
    return await fileToDataUrl(processedFile);
  }
}

export { onAuthStateChanged };
