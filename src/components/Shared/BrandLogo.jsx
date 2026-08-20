import { useState, useEffect } from 'react';
import { useContent } from '../../context/ContentContext';
import { cn } from '../../utils/helpers';
import { Trees } from 'lucide-react';
import defaultBrandLogo from '../../assets/logo.png';

/**
 * Robust BrandLogo component with multi-level fallback cascade
 * Imports bundled brand asset directly for 100% reliability on Vercel, Netlify & Production.
 */
export default function BrandLogo({
  src,
  alt,
  className = 'h-16 w-auto',
  containerClassName = '',
  showTagline = false,
  variant = 'default', // 'default' | 'light' | 'dark'
}) {
  const { site } = useContent();
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const rawLogo = src || (site?.logo && site.logo !== '/logo.png' ? site.logo : defaultBrandLogo);

  // Normalization to ensure safe URL encoding
  const cleanUrl = (url) => {
    if (!url) return defaultBrandLogo;
    if (typeof url === 'string' && url.includes(' ') && !url.startsWith('data:') && !url.startsWith('blob:')) {
      return encodeURI(url);
    }
    return url;
  };

  const fallbackSources = [
    defaultBrandLogo,
    cleanUrl(rawLogo),
    '/logo.png',
    '/logo-transparent.png',
    '/Lake%20Valley%20Flower%20City%20Logo_Alpha-.png',
    '/logo.svg',
    '/Lake%20Valley%20Logo.png',
  ];

  // Reset fallback index if rawLogo prop changes
  useEffect(() => {
    setFallbackIndex(0);
    setHasFailedAll(false);
  }, [rawLogo]);

  const handleImageError = () => {
    if (fallbackIndex < fallbackSources.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const currentSrc = fallbackSources[fallbackIndex] || defaultBrandLogo;
  const logoAlt = alt || site?.siteName || 'Lake Valley Flower City';

  if (hasFailedAll) {
    // Vector brand fallback if all external assets fail
    return (
      <div className={cn('flex items-center gap-2.5 select-none', containerClassName)}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md">
          <Trees className="w-5 h-5 text-emerald-200" />
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              'font-extrabold text-base tracking-tight leading-none',
              variant === 'light' ? 'text-white' : 'text-slate-900'
            )}
          >
            Lake Valley
          </span>
          <span className="text-[10px] font-bold tracking-widest text-emerald-brand uppercase leading-tight mt-0.5">
            Flower City
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center', containerClassName)}>
      <img
        src={currentSrc}
        alt={logoAlt}
        onError={handleImageError}
        className={cn('object-contain transition-transform duration-300', className)}
        loading="eager"
        decoding="async"
      />
      {showTagline && (
        <span className="hidden sm:inline-block ml-3 pl-3 border-l border-slate-300 text-[11px] font-semibold text-slate-500 max-w-[140px] leading-tight">
          {site?.tagline || 'Eco Township'}
        </span>
      )}
    </div>
  );
}
