import { Flower2, TrendingUp, ShieldCheck } from 'lucide-react';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';

/** Key selling features inspired by Lake Valley Flower City */
const features = [
  {
    icon: TrendingUp,
    title: 'High-Growth Expressway Corridor',
    titleBn: 'কৌশলগত অবস্থান ও দ্রুত মূল্যায়ণ',
    badge: 'Strategic Location',
    description:
      'Conveniently situated along the Dhaka-Mawa Expressway corridor opposite the BSCIC Industrial Hub. Unlocks rapid capital appreciation and commercial rental potential with direct multi-lane highway connectivity to central Dhaka.',
  },
  {
    icon: Flower2,
    title: 'Lakeside Botanical Living',
    titleBn: 'প্রাকৃতিক লেক ও ফুলগাছের সমারোহ',
    badge: 'Eco Living',
    description:
      'Surrounded by natural lakes on three sides and landscaped with over 2,000 seasonal flower species. Creates an unpolluted, oxygen-rich microclimate that promotes wellness and longevity for your family.',
  },
  {
    icon: ShieldCheck,
    title: '100% Legal & Ready Demarcation',
    titleBn: 'নিষ্কণ্টক জমি ও স্বচ্ছ দলিলপত্র',
    badge: 'Legal Transparency',
    description:
      'Clear CS, SA, RS, and BS record lineage with ready on-ground plot demarcation in 3, 5, 7, and 10 Katha sizes. Includes 40-60 ft RCC internal roads, planned utility lines, and immediate mutation support.',
  },
];

/**
 * Three key feature highlights section
 */
export default function Features() {
  return (
    <section className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Why Invest Here"
          title="Designed for Living, Built for Growth"
          titleBn="লেক ভ্যালির অনন্য বিশেষত্ব"
          subtitle="A harmonious blend of secure property ownership, pristine lakeside nature, and rapid connectivity to Dhaka."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.15}>
              <div className="relative p-8 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-200/70 transition-all duration-300 group h-full flex flex-col justify-between hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-brand flex items-center justify-center group-hover:bg-emerald-brand group-hover:text-white transition-colors duration-300 border border-emerald-100">
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/80">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="font-bangla text-sm text-emerald-brand font-semibold mb-4">{feature.titleBn}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{feature.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-brand flex items-center gap-1">
                  <span>Verified Township Standard</span>
                  <span>•</span>
                  <span>Direct Ownership</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
