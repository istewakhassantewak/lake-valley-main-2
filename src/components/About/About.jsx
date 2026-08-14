import { Target, Eye, Award } from 'lucide-react';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import AnimatedCounter from '../Shared/AnimatedCounter';
import { aboutStats } from '../../data/stats';
import { LazyImage } from '../Shared/Lightbox';

/**
 * About section with company intro, vision, mission, and experience counters
 */
export default function About() {
  const values = [
    {
      icon: Eye,
      title: 'Our Vision',
      titleBn: 'আমাদের ভিশন',
      text: 'To build a self-reliant Bangladesh by creating sustainable townships that harmonize urban development with environmental preservation.',
    },
    {
      icon: Target,
      title: 'Our Mission',
      titleBn: 'আমাদের মিশন',
      text: 'Delivering secure, profitable investments while ensuring eco-friendly housing solutions that meet the growing demand of our nation.',
    },
    {
      icon: Award,
      title: 'Our Promise',
      titleBn: 'আমাদের প্রতিশ্রুতি',
      text: 'Transparent documentation, world-class amenities, and a commitment to building communities where families thrive for generations.',
    },
  ];

  return (
    <section id="about" className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="About Us"
          title="Building Bangladesh's Premier Eco-Township"
          titleBn="লেক ভ্যালি ফ্লাওয়ার সিটি সম্পর্কে"
          subtitle="As urbanization consumes agricultural land, Lake Valley Duplex & Resort Ltd. pioneers a revolutionary approach — multi-purpose land use that protects the environment while delivering modern living."
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Collage */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <LazyImage
                  src="https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg"
                  alt="Lake Valley residential area"
                  className="rounded-3xl w-full h-64 object-cover shadow-premium"
                />
                <LazyImage
                  src="https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg"
                  alt="Floral garden at Lake Valley"
                  className="rounded-3xl w-full h-64 object-cover shadow-premium mt-8"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 glass rounded-2xl p-5 shadow-float">
                <p className="text-3xl font-bold text-emerald-brand">
                  <AnimatedCounter value={15} suffix="+" />
                </p>
                <p className="text-sm text-slate-600">Years of Excellence</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed font-bangla text-base">
                কৃষি জমির বহুমুখী ব্যবহার নিশ্চিত করে পরিবেশ বান্ধব আবাসনের অভিনব ধারণা নিয়ে যাত্রা শুরু করেছে লেক ভ্যালি। ঢাকার নিকটে ৩০০ একর জমি নিয়ে গড়ে উঠেছে এই পূর্ণাঙ্গ টাউনশিপ।
              </p>
              <p className="text-slate-600 leading-relaxed">
                Spanning 300 acres near Dhaka, our integrated township features residential plots, duplex villas, a luxury resort, convention hall, studio apartments, sports club, international boarding school, and distinctive senior living facilities — all within a master-planned floral paradise.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                {aboutStats.map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-2xl bg-white shadow-glass border border-slate-100">
                    <p className="text-2xl font-bold text-emerald-brand">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs font-medium text-slate-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Vision / Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {values.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="p-8 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-100 transition-shadow duration-500 group h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-emerald-brand/10 flex items-center justify-center mb-5 group-hover:bg-emerald-brand/20 transition-colors">
                  <item.icon className="w-7 h-7 text-emerald-brand" />
                </div>
                <h3 className="text-xl font-bold text-deep-green mb-1">{item.title}</h3>
                <p className="font-bangla text-sm text-emerald-brand font-semibold mb-3">{item.titleBn}</p>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
