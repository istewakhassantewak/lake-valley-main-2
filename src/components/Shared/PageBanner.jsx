import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import ScrollReveal from './ScrollReveal';
import 'swiper/css';
import 'swiper/css/effect-fade';

const DEFAULT_BANNER_IMAGES = [
  'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
  'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
];

/**
 * Standardized Page Hero Banner with Exact Original Green Theme & Multi-Image Carousel
 * Preserves the exact original bg-gradient-to-br from-emerald-900 via-deep-green to-emerald-800
 * and green overlay styling while smoothly cycling through images.
 */
export default function PageBanner({
  badge,
  title,
  titleBn,
  description,
  images = [],
  align = 'center',
  topElement = null,
  children = null,
  className = '',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // Clean & ensure at least 2 slide images for carousel effect
  const rawList = Array.isArray(images) && images.length > 0 ? images.filter(Boolean) : [];
  const slideImages = rawList.length >= 2 
    ? rawList 
    : [...rawList, ...DEFAULT_BANNER_IMAGES].filter((v, i, a) => a.indexOf(v) === i);

  const isCenter = align === 'center';

  return (
    <section
      className={`relative pt-16 md:pt-20 pb-16 md:pb-20 bg-gradient-to-br from-emerald-900 via-deep-green to-emerald-800 overflow-hidden ${className}`}
      aria-label={title || 'Page Banner'}
    >
      {/* Background Image Carousel Slider with Original Image Opacity */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <Swiper
          ref={swiperRef}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          loop={slideImages.length > 1}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-full w-full"
        >
          {slideImages.map((imgSrc, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <SwiperSlide key={`banner-img-${idx}`}>
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={title || 'Lake Valley Flower City'}
                    referrerPolicy="no-referrer"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(e) => {
                      if (!e.target.dataset.triedFallback) {
                        e.target.dataset.triedFallback = 'true';
                        e.target.src =
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=85';
                      }
                    }}
                    className={`w-full h-full object-cover transition-transform duration-5000 ease-out ${
                      isCurrent ? 'scale-105' : 'scale-100'
                    }`}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Signature Original Green Vignette & Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 via-transparent to-emerald-900/40 pointer-events-none" />

      {/* Main Content Area */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 ${isCenter ? 'text-center' : 'text-left'}`}>
        {topElement && <div className="mb-4">{topElement}</div>}

        <ScrollReveal>
          {badge && (
            <div className={isCenter ? 'flex justify-center mb-4' : 'mb-4'}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold uppercase tracking-widest">
                {badge}
              </span>
            </div>
          )}

          {title && (
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              {title}
            </h1>
          )}

          {titleBn && (
            <p className="font-bangla text-emerald-200 text-lg sm:text-xl mb-4 font-semibold">
              {titleBn}
            </p>
          )}

          {description && (
            <p className={`text-white/80 text-base md:text-lg leading-relaxed ${isCenter ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
              {description}
            </p>
          )}

          {children && <div className="mt-6">{children}</div>}
        </ScrollReveal>
      </div>

      {/* Subtle Carousel Progress Indicators */}
      {slideImages.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
          {slideImages.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-5 bg-white/80' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
