import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  Calendar,
  Trees,
  Compass,
  Building,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useImages } from '../../context/ImageContext';
import { resolveHeroSlideImage } from '../../utils/imageResolver';
import AnimatedCounter from '../Shared/AnimatedCounter';
import Button from '../Shared/Button';
import 'swiper/css';
import 'swiper/css/effect-fade';

/**
 * World-Class Luxury Real Estate Hero Banner - Lush Eco-Greenish Theme
 * Designed for Lake Valley Flower City with deep forest & emerald accents,
 * organic botanical illumination, and high-contrast luxury editorial typography.
 */
export default function Hero() {
  const { hero } = useContent();
  const { images } = useImages();
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const slides = hero?.slides || [];
  const stats = hero?.stats || [];

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goToSlide = (idx) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideToLoop(idx);
    }
  };

  const statIcons = [Trees, Building, Compass, ShieldCheck];

  return (
    <section
      className="relative min-h-[720px] lg:h-[90vh] max-h-[960px] w-full overflow-hidden bg-slate-950 select-none"
      aria-label="Lake Valley Hero Banner"
    >
      {/* Background Cinematic Slider */}
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, EffectFade, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        loop={slides.length > 1}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, idx) => {
          const slideImageUrl =
            resolveHeroSlideImage(slide, idx, images) ||
            slide.image ||
            'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg';
          const isCurrent = activeIndex === idx;

          return (
            <SwiperSlide key={slide.id || `hero-slide-${idx}`}>
              <div className="relative h-full w-full overflow-hidden flex items-center">
                {/* Crisp Full-Resolution Image with Slow Ambient Motion */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={slideImageUrl}
                    alt={slide.title || 'Lake Valley Flower City'}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      if (!e.target.dataset.triedFallback) {
                        e.target.dataset.triedFallback = 'true';
                        e.target.src =
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=85';
                      }
                    }}
                    className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out ${
                      isCurrent ? 'scale-105' : 'scale-100'
                    }`}
                  />
                </div>

                {/* Lush Eco-Green Editorial Scrims */}
                {/* 1. Green Opacity Wash Layer directly over slide image */}
                <div className="absolute inset-0 bg-[#064e3b]/65 mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-emerald-950/35 pointer-events-none" />

                {/* 2. Deep Forest-to-Emerald Left Gradient for Maximum Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#022c22]/95 via-[#064e3b]/80 to-transparent w-full md:w-4/5 lg:w-3/5 pointer-events-none" />
                
                {/* 3. Vertical Emerald Bottom-to-Top Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/95 via-[#064e3b]/45 to-transparent pointer-events-none" />

                {/* 4. Ambient Eco Glow Auras */}
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

                {/* Hero Editorial Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 pb-40 md:pt-24 md:pb-40 flex items-center">
                  <div className="max-w-2xl lg:max-w-3xl">
                    {/* Eyebrow / Eco Badge */}
                    <motion.div
                      key={`badge-${idx}-${isCurrent}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex flex-wrap items-center gap-2.5 mb-3 sm:mb-4"
                    >
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-emerald-900/30">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                        {slide.subtitle || 'Eco-Friendly Integrated Township'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-100 text-xs font-medium backdrop-blur-md">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        Dhaka-Mawa Expressway
                      </span>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                      key={`title-${idx}-${isCurrent}`}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight mb-2 sm:mb-3 drop-shadow-xl"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Bengali Subheadline */}
                    {slide.titleBn && (
                      <motion.p
                        key={`titleBn-${idx}-${isCurrent}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="font-bangla text-lg sm:text-xl md:text-2xl font-bold text-emerald-300 mb-3 drop-shadow-md"
                      >
                        {slide.titleBn}
                      </motion.p>
                    )}

                    {/* Description */}
                    <motion.p
                      key={`desc-${idx}-${isCurrent}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                      className="text-sm sm:text-base md:text-lg text-emerald-50/90 leading-relaxed mb-7 max-w-2xl font-normal drop-shadow"
                    >
                      {slide.description}
                    </motion.p>

                    {/* Call to Actions - Green & Gold Eco Synergy */}
                    <motion.div
                      key={`cta-${idx}-${isCurrent}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.45 }}
                      className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1"
                    >
                      {/* Primary Eco-Emerald CTA */}
                      <Link to={slide.ctaLink || '/projects'}>
                        <Button
                          variant="primary"
                          size="lg"
                          className="font-bold shadow-xl shadow-emerald-600/30 text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-400 hover:to-teal-600 border border-emerald-400/40 transition-all duration-300 px-6 py-3.5 text-sm sm:text-base rounded-2xl group"
                        >
                          <Sparkles className="w-4 h-4 mr-1 text-emerald-200" />
                          <span>{slide.cta || 'Explore Masterplan'}</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>

                      {/* Secondary Site Visit CTA */}
                      <Link to="/contact#booking">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="font-semibold bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-100 border border-emerald-500/40 backdrop-blur-md shadow-lg transition-all px-5 py-3.5 text-sm sm:text-base rounded-2xl"
                        >
                          <Calendar className="w-4 h-4 mr-1.5 text-amber-400" />
                          <span>Book Site Visit</span>
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Luxury Interactive Slide Strip & Navigation (Right Side on Desktop) */}
      <div className="absolute bottom-28 md:bottom-28 right-4 sm:right-8 lg:right-12 z-20 flex items-center gap-3">
        {/* Interactive Numbered Slide Selector */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/30 text-white shadow-2xl">
          <span className="text-emerald-400 font-mono text-sm font-bold">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-emerald-500/40">/</span>
          <span className="text-emerald-200/60 font-mono text-xs">
            {String(slides.length).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                  activeIndex === i ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'w-2 bg-emerald-700/40 hover:bg-emerald-500/60'
                }`}
                title={`Go to slide ${i + 1}: ${slide.title || ''}`}
              />
            ))}
          </div>
        </div>

        {/* Prev & Next Minimalist Luxury Arrows */}
        <div className="flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur-xl p-1.5 rounded-2xl border border-emerald-500/30 shadow-2xl">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="w-10 h-10 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/60 text-emerald-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="w-10 h-10 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/60 text-emerald-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Streamlined Architectural Metrics Bar (Bottom Ribbon) - Lush Eco-Green Glass */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-emerald-950 via-emerald-950/95 to-slate-950/80 backdrop-blur-xl border-t border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-emerald-500/20">
            {stats.slice(0, 4).map((stat, idx) => {
              const IconComponent = statIcons[idx % statIcons.length];
              return (
                <div
                  key={stat.label || idx}
                  className={`flex items-center gap-3 sm:gap-4 ${
                    idx > 0 ? 'pt-2 md:pt-0 md:pl-4 lg:pl-6' : ''
                  }`}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-50 tracking-tight leading-none">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-emerald-200/80 mt-1 truncate">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
