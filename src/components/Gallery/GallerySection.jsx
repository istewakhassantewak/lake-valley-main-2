import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { useImages } from '../../context/ImageContext';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import Lightbox, { LazyImage } from '../Shared/Lightbox';

/**
 * Masonry gallery with category filters, hover animation and full-screen lightbox
 */
export default function GallerySection({ showFilters = true, limit }) {
  const { images, categories } = useImages();
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Consider all valid images in the system
  const galleryList = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) return [];
    return images.filter(
      (img) =>
        img &&
        img.src &&
        (!img.targetSection ||
          img.targetSection === 'gallery' ||
          img.targetSection === 'all' ||
          img.targetSection === 'project' ||
          img.targetSection === 'hero')
    );
  }, [images]);

  const filtered = useMemo(() => {
    const list =
      activeCategory === 'All'
        ? galleryList
        : galleryList.filter(
            (img) =>
              (img.category || '').toLowerCase() === activeCategory.toLowerCase()
          );

    return limit ? list.slice(0, limit) : list;
  }, [galleryList, activeCategory, limit]);

  return (
    <section id="gallery" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Gallery"
          title="Experience the Beauty"
          titleBn="গ্যালারি"
          subtitle="Explore the stunning landscapes, modern architecture, and vibrant community life at Lake Valley Flower City."
        />

        {showFilters && (
          <ScrollReveal className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-emerald-brand text-white shadow-lg shadow-emerald-brand/25'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-brand/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </ScrollReveal>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">এই ক্যাটাগরিতে বর্তমানে কোনো ছবি পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px]">
            {filtered.map((image, i) => (
              <ScrollReveal
                key={image.id || `img-${i}`}
                delay={i * 0.04}
                className={image.span || 'col-span-1 row-span-1'}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setLightboxIndex(i)}
                  className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer border border-slate-100/50 shadow-sm"
                  aria-label={`View ${image.title || image.alt || 'Gallery photo'}`}
                >
                  <LazyImage
                    src={image.src}
                    alt={image.alt || image.title || 'Lake Valley Flower City'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                    <div className="self-end p-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                    <div>
                      {image.title && (
                        <p className="text-white text-xs md:text-sm font-semibold truncate text-left">
                          {image.title}
                        </p>
                      )}
                      {image.category && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-medium backdrop-blur-sm">
                          {image.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/50 text-white text-[11px] backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                    {image.category}
                  </span>
                </motion.button>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        images={filtered}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}

