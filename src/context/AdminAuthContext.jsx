import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginAdmin,
  logoutAdmin,
  verifyAdminSession,
  getAdminToken,
  getAdminInfo,
} from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getAdminToken()));
  const [adminUser, setAdminUser] = useState(() => getAdminInfo());
  const [loading, setLoading] = useState(true);

  // Initial check on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const token = getAdminToken();
      if (!token) {
        if (isMounted) {
          setIsAdmin(false);
          setAdminUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await verifyAdminSession();
        if (isMounted) {
          if (result.valid) {
            setIsAdmin(true);
            setAdminUser(result.admin || { email: 'istewakhassantewak121@gmail.com', role: 'admin' });
          } else {
            setIsAdmin(false);
            setAdminUser(null);
          }
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          setAdminUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password, remember = true) => {
    setLoading(true);
    try {
      const { admin } = await loginAdmin(email, password, remember);
      setIsAdmin(true);
      setAdminUser(admin);
      return { success: true, admin };
    } catch (err) {
      setIsAdmin(false);
      setAdminUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Instantly clear storage and update React state for immediate UI feedback
    try {
      clearAdminSession();
    } catch (err) {
      console.warn('Error clearing admin session storage:', err);
    }
    setIsAdmin(false);
    setAdminUser(null);

    // Notify backend in background if accessible
    try {
      await logoutAdmin();
    } catch {
      // ignore background network failures
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
