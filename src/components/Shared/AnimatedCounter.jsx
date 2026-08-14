import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/**
 * Animated counter with intersection trigger and no external dependency
 */
export default function AnimatedCounter({ value, suffix = '', duration = 2.5, className }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const endValue = Number(value) || 0;
    const startTime = performance.now();
    let frameId;

    const animate = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(endValue * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [duration, isVisible, value]);

  return (
    <span ref={ref} className={className}>
      {displayValue}{suffix}
    </span>
  );
}
