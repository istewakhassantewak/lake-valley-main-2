import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

/**
 * Luxury White-Theme Professional Loading Screen
 * Delivers a clean, focused executive presentation while initial assets initialize.
 */
export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(15);

  useEffect(() => {
    // Smooth progress simulation
    const p1 = setTimeout(() => setLoadingProgress(65), 400);
    const p2 = setTimeout(() => setLoadingProgress(100), 1000);
    const timer = setTimeout(() => setLoading(false), 1400);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white text-slate-800 select-none overflow-hidden"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/50 via-teal-50/40 to-amber-100/40 rounded-full blur-3xl opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
          </div>

          {/* Top spacer */}
          <div className="pt-10" />

          {/* Center Brand Identity & Progress */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full text-center"
          >
            {/* Prominent White-Theme Brand Logo */}
            <div className="relative group">
              <BrandLogo
                className="h-20 sm:h-24 md:h-28 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[380px] object-contain drop-shadow-sm transition-transform duration-500"
                variant="default"
              />
            </div>

            {/* Sleek Minimalist Progress Bar */}
            <div className="w-full max-w-[260px] flex flex-col items-center gap-2.5 mt-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-xs">
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 rounded-full"
                />
              </div>

              {/* Status note */}
              <div className="flex items-center justify-between w-full text-[11px] font-medium text-slate-500 px-0.5">
                <span className="text-emerald-700 font-semibold">The Address of Happiness</span>
                <span className="font-mono text-slate-400">{loadingProgress}%</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Luxury Footer Note */}
          <div className="pb-8 text-center relative z-10">
            <p className="text-xs font-semibold text-slate-600">
              Lake Valley Duplex &amp; Resort Ltd.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bangladesh&apos;s First Integrated Eco-Township
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
