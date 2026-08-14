import { motion } from 'framer-motion';
import { useScrollPosition } from '../../hooks/useScrollPosition';

/**
 * Top scroll progress indicator bar
 */
export default function ScrollProgress() {
  const scrollY = useScrollPosition();
  const docHeight = typeof document !== 'undefined'
    ? document.documentElement.scrollHeight - window.innerHeight
    : 1;
  const progress = Math.min((scrollY / docHeight) * 100, 100);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-emerald-brand/10">
      <motion.div
        className="h-full origin-left"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #10b981, #d4af37)',
        }}
      />
    </div>
  );
}
