import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import AnimatedCounter from '../Shared/AnimatedCounter';
import { LazyImage } from '../Shared/Lightbox';

/** Interactive hotspot data for master plan */
const hotspots = [
  { id: 1, x: 25, y: 35, label: 'Residential Zone', plots: '1200+' },
  { id: 2, x: 55, y: 25, label: 'Green Garden Resort', plots: '80+' },
  { id: 3, x: 70, y: 50, label: 'Duplex City', plots: '200+' },
  { id: 4, x: 40, y: 65, label: 'Eco Agro Tourism', plots: '150+' },
  { id: 5, x: 80, y: 30, label: 'Bangla Tower', plots: '100+' },
];

/**
 * Master plan section with interactive hotspots
 */
export default function MasterPlan() {
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <section className="section-padding bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <SectionHeading
          badge="Master Plan"
          title="300 Acres of Thoughtful Design"
          titleBn="মাস্টার প্ল্যান"
          subtitle="Every zone is strategically planned to maximize livability, investment potential, and environmental harmony."
        />

        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden shadow-premium border border-slate-200">
            <LazyImage
              src="https://lakevalleyflowercity.com/uploads/pages/1784702276_86395.jpeg"
              alt="Lake Valley Flower City master plan layout"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />

            {/* Hotspots */}
            {hotspots.map((spot) => (
              <button
                key={spot.id}
                className="absolute z-10 group"
                style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setActiveHotspot(spot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                aria-label={spot.label}
              >
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-brand opacity-50" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-brand border-2 border-white shadow-lg" />
                </span>

                {activeHotspot === spot.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-xl px-4 py-2 text-sm z-20"
                  >
                    <p className="font-bold text-slate-800">{spot.label}</p>
                    <p className="text-emerald-brand font-semibold text-xs">{spot.plots} Units</p>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Plan Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { value: 300, suffix: ' Acres', label: 'Total Area' },
            { value: 5, suffix: ' Zones', label: 'Project Areas' },
            { value: 3, suffix: ' Lakes', label: 'Natural Water Bodies' },
            { value: 12, suffix: '+', label: 'Amenities' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-emerald-brand/10">
              <p className="text-2xl font-bold text-deep-green">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm font-medium text-slate-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
