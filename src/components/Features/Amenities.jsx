import { useContent } from '../../context/ContentContext';
import { getIconByName } from '../../utils/iconMap';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';

/**
 * Luxury amenities cards with icons
 */
export default function Amenities() {
  const { amenities: amenitiesList } = useContent();

  const items = amenitiesList || [];

  return (
    <section className="section-padding bg-surface">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Amenities"
          title="World-Class Facilities at Your Doorstep"
          titleBn="সুবিধাসমূহ"
          subtitle="From floral gardens to international schools — every amenity is designed to elevate your lifestyle within the township."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, i) => {
            const IconComp = getIconByName(item.iconName || item.icon);
            return (
              <ScrollReveal key={item.id || item.title} delay={i * 0.05}>
                <div className="group p-6 rounded-3xl bg-white shadow-glass hover:shadow-premium transition-all duration-500 border border-slate-100 hover:border-emerald-brand/30 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-emerald-brand/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6 text-emerald-brand" />
                  </div>
                  <h3 className="font-bold text-deep-green mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
