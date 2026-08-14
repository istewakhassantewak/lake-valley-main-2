import { useContent } from '../../context/ContentContext';
import { BOOKING_STEPS } from '../../utils/constants';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';

/**
 * Booking process step cards
 */
export default function BookingProcess() {
  const { booking } = useContent();
  const steps = (booking?.steps && Array.isArray(booking.steps) && booking.steps.length > 0)
    ? booking.steps
    : BOOKING_STEPS;

  return (
    <section className="section-padding bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="Ownership Path"
          title="Simple & Transparent Buying Process"
          titleBn="সহজ ও নিষ্কণ্টক ক্রয় প্রক্রিয়া"
          subtitle="A clear, fully supported step-by-step path to owning your registered plot at Lake Valley Flower City."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.step || i} delay={i * 0.1}>
              <div className="relative p-6 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-200/80 transition-all duration-300 group h-full flex flex-col justify-between hover:-translate-y-1">
                <div>
                  {/* Step number badge */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-base flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
                    0{step.step || i + 1}
                  </div>

                  {/* Connector line (desktop) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-0.5 bg-emerald-200" />
                  )}

                  <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
                  Step {step.step || i + 1} of 4 • Full Legal Assistance
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
