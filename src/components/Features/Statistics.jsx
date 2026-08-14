import { siteStats } from '../../data/stats';
import AnimatedCounter from '../Shared/AnimatedCounter';
import ScrollReveal from '../Shared/ScrollReveal';

/**
 * Animated statistics section with CountUp
 */
export default function Statistics() {
  return (
    <section className="py-14 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-y border-emerald-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {siteStats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.08}>
              <div className="text-center p-3 rounded-2xl bg-white/80 shadow-sm border border-emerald-brand/10">
                <p className="text-3xl md:text-4xl font-bold text-deep-green">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</p>
                <p className="font-bangla text-[11px] text-emerald-brand font-semibold mt-0.5">{stat.labelBn}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
