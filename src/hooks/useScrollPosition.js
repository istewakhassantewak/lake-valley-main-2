import { useState, useEffect } from 'react';

/**
 * Tracks vertical scroll position
 */
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

/**
 * Returns true when user has scrolled past threshold
 */
export function useScrolledPast(threshold = 50) {
  const scrollY = useScrollPosition();
  return scrollY > threshold;
}
