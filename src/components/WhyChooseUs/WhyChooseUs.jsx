import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import { useContent } from '../../context/ContentContext';
import { getIconByName } from '../../utils/iconMap';

/**
 * Why Choose Us — icon feature grid
 */
export default function WhyChooseUs() {
  const { whyChooseUs } = useContent();

  const featureItems = Array.isArray(whyChooseUs)
    ? whyChooseUs
    : (Array.isArray(whyChooseUs?.items) ? whyChooseUs.items : []);

  const sectionTitle = whyChooseUs?.sectionTitle || "Everything You Need in One Township";
  const sectionSubtitle = whyChooseUs?.sectionSubtitle || "Bangladesh's first complete township plan combining commercial, residential, resort, agro tourism, and civic amenities — designed for modern living and smart investment.";
  const sectionTitleBn = whyChooseUs?.sectionTitleBn || "কেন লেক ভ্যালি ফ্লাওয়ার সিটি";

  return (
    <section className="section-padding bg-gradient-to-b from-surface to-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Why Choose Us"
          title={sectionTitle}
          titleBn={sectionTitleBn}
          subtitle={sectionSubtitle}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featureItems.map((item, i) => {
            const IconComp = getIconByName(item.iconName || item.icon);
            return (
              <ScrollReveal key={item.id || item.title || i} delay={i * 0.05}>
                <div className="group p-5 md:p-6 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-100 transition-all duration-500 text-center hover:-translate-y-1 h-full flex flex-col">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-brand/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-brand group-hover:scale-110 transition-all duration-300">
                    <IconComp className="w-6 h-6 md:w-7 md:h-7 text-emerald-brand group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-deep-green text-sm md:text-base mb-1">
                    {item.title}
                  </h3>
                  {item.titleBn && (
                    <p className="font-bangla text-xs text-emerald-brand font-semibold mb-2">{item.titleBn}</p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed hidden md:block flex-1">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
