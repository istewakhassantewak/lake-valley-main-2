import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { formatPhoneLink } from '../../utils/helpers';
import ScrollReveal from '../../components/Shared/ScrollReveal';
import SectionHeading from '../../components/Shared/SectionHeading';
import BookingForm from '../../components/Booking/BookingForm';
import GoogleMap from '../../components/Shared/GoogleMap';
import GallerySection from '../../components/Gallery/GallerySection';
import PageBanner from '../../components/Shared/PageBanner';
import { submitContactMessage } from '../../api/contactApi';

const CONTACT_BANNER_IMAGES = [
  'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
  'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
];

/**
 * Contact page with info cards, form, FAQ, and gallery
 */
export default function ContactPage() {
  const { site, faqs } = useContent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm();

  const [openFaq, setOpenFaq] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      await submitContactMessage(data);
      reset();
    } catch (err) {
      setSubmitError(err.message || 'Failed to send. Please try again.');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 transition-all';

  const phoneText = site?.phones?.length ? site.phones.join(', ') : site?.phone || '';

  const contactCards = [
    { icon: Phone, title: 'Customer Care', value: phoneText, href: `tel:${formatPhoneLink(site?.phoneRaw || site?.phone || '')}` },
    { icon: Mail, title: 'Email Us', value: site?.email, href: `mailto:${site?.email}` },
    { icon: MapPin, title: 'Head Office', value: site?.headOffice, href: null },
    { icon: MapPin, title: 'Corporate Office', value: site?.corporateOffice, href: null },
  ];

  return (
    <>
      {/* Hero Carousel Banner */}
      <PageBanner
        badge="Get in Touch"
        title="Contact Us"
        titleBn="যোগাযোগ করুন"
        description="Have questions about our projects? Our team is ready to help you find your perfect property."
        images={CONTACT_BANNER_IMAGES}
      />

      {/* Contact Cards */}
      <section className="section-padding pb-0">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactCards.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.1}>
              <div className="p-6 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-100 transition-all text-center group h-full min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-brand/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-brand/20 transition-colors">
                    <card.icon className="w-6 h-6 text-emerald-brand" />
                  </div>
                  <h3 className="font-bold text-deep-green mb-2">{card.title}</h3>
                  {card.href ? (
                    <a href={card.href} className="text-sm text-slate-600 hover:text-emerald-brand transition-colors break-words">
                      {card.value}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-600 break-words">{card.value}</p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          <ScrollReveal direction="left">
            <SectionHeading badge="Send a Message" title="Contact Form" align="left" className="mb-6" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isSubmitSuccessful && !submitError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-brand/10 text-emerald-brand">
                  <CheckCircle size={20} />
                  <p className="text-sm font-medium">Message sent! We'll respond within 24 hours.</p>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register('name', { required: 'Required' })}
                    className={inputClass}
                    placeholder="Your Name *"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                    className={inputClass}
                    placeholder="Email Address *"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <input
                {...register('subject', { required: 'Required' })}
                className={inputClass}
                placeholder="Subject *"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
              <textarea
                {...register('message', { required: 'Required' })}
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Your Message *"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-brand text-white font-semibold hover:bg-deep-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={18} /> {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <SectionHeading badge="Location" title="Find Us" align="left" className="mb-6" />
            <GoogleMap height="450px" className="min-h-[450px]" />
          </ScrollReveal>
        </div>
      </section>

      {/* Booking Form */}
      <BookingForm />

      {/* FAQ */}
      <section className="section-padding bg-surface">
        <div className="max-w-3xl mx-auto">
          <SectionHeading badge="FAQ" title="Frequently Asked Questions" titleBn="প্রশ্ন ও উত্তর" />
          <div className="space-y-3">
            {(faqs || []).map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-glass overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-bold text-deep-green text-sm pr-4">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-emerald-brand shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <GallerySection limit={4} />
    </>
  );
}
