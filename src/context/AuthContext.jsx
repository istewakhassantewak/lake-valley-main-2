import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, onAuthStateChanged, logOut as firebaseLogOut } from '../firebase';
import { syncUser } from '../api/userApi';
import { getAuthProviders } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateAuthUser = useCallback((partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providers: getAuthProviders(),
        });
        try {
          const res = await syncUser({
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
          });
          const synced = res?.user || res;
          if (synced) {
            setUser((prev) => ({
              ...prev,
              displayName: synced.displayName || prev?.displayName || firebaseUser.displayName,
              photoURL: synced.photoURL !== undefined ? synced.photoURL : (prev?.photoURL || firebaseUser.photoURL),
              providers: getAuthProviders(),
            }));
          }
        } catch {
          // backend may be offline during dev — auth still works client-side
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
