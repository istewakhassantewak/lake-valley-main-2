import { useEffect } from 'react';

/**
 * Hook locked to light mode
 */
export function useDarkMode() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lv-dark-mode', 'false');
    }
  }, []);

  return { isDark: false, toggle: () => {}, setIsDark: () => {} };
}

