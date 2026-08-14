import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import 'swiper/css';
import 'swiper/css/pagination';

/**
 * Testimonials carousel
 */
export default function Testimonials() {
  const { testimonials: testimonialsList } = useContent();

  const items = Array.isArray(testimonialsList) ? testimonialsList : [];

  return (
    <section className="section-padding bg-gradient-to-br from-emerald-50/50 via-slate-50 to-emerald-50/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <SectionHeading
          badge="Client Experiences"
          title="Stories From Our Property Owners"
          titleBn="গ্রাহকদের বাস্তব অভিজ্ঞতা"
          subtitle="Hear from residents, NRBs, and corporate investors who have entrusted their dream properties to Lake Valley."
        />

        <ScrollReveal>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="pb-12"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-glass border border-slate-200/80 h-full flex flex-col justify-between hover:shadow-premium transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-7 h-7 text-emerald-brand/30" />
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-brand/40 shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Verified Owner" />
                        </div>
                        <p className="text-slate-600 text-xs truncate">{item.role}</p>
                        {item.tag && (
                          <span className="inline-block mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </ScrollReveal>
      </div>
    </section>
  );
}
