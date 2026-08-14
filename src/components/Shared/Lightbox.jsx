import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_IMAGE = 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg';

/**
 * Full-screen image lightbox with navigation, keyboard shortcuts, and captions
 */
export default function Lightbox({ images = [], currentIndex, onClose, onNavigate }) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && images && images.length > 0;
  const image = isOpen ? images[currentIndex] : null;

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!images || images.length === 0) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images, onNavigate]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!images || images.length === 0) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
        onClick={onClose}
        role="dialog"
        aria-label="Image lightbox"
      >
        {/* Top Controls */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all shadow-lg hover:scale-105"
            aria-label="Close lightbox"
          >
            <X size={22} />
          </button>
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 md:left-8 p-3 md:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-20 hover:scale-110 shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Central Display Image */}
        <div
          className="relative max-h-[80vh] max-w-[90vw] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={image.src || currentIndex}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25 }}
            src={image.src || FALLBACK_IMAGE}
            alt={image.alt || image.title || 'Gallery image'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="max-h-[75vh] max-w-[88vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            loading="lazy"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 md:right-8 p-3 md:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-20 hover:scale-110 shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Bottom Caption & Counter */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-center max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {image.title && (
            <p className="text-white text-sm md:text-base font-semibold truncate max-w-sm">
              {image.title}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-emerald-300">
            {image.category && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                {image.category}
              </span>
            )}
            <span className="text-white/60">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Lazy-loaded image with fade-in effect and graceful fallback
 */
export function LazyImage({ src, alt, className, fallbackSrc = FALLBACK_IMAGE, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <img
      src={error || !src ? fallbackSrc : src}
      alt={alt || ''}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setError(true);
        setLoaded(true);
      }}
      className={`img-lazy ${loaded ? 'loaded' : 'opacity-0'} ${className || ''}`}
      {...props}
    />
  );
}

