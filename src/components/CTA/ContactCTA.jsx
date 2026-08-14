import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { formatPhoneLink } from '../../utils/helpers';
import Button from '../Shared/Button';

/**
 * Large contact CTA banner
 */
export default function ContactCTA() {
  const { site, cta } = useContent();

  const phoneNum = site?.phone || (site?.phones?.[0] || '');

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 border border-emerald-brand/20 shadow-premium"
        >
          <div className="relative px-8 py-16 md:py-20 text-center">
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand text-xs font-bold uppercase tracking-wider mb-4">
              {cta?.badge || "Get In Touch"}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-green mb-3">
              {cta?.title || "Ready to Find Your Dream Property?"}
            </h2>
            <p className="font-bangla text-emerald-brand text-lg font-semibold mb-3">
              {cta?.titleBn || "আপনার স্বপ্নের ঠিকানা খুঁজে নিন"}
            </p>
            <p className="text-slate-600 max-w-xl mx-auto text-base leading-relaxed mb-8">
              {cta?.subtitle || "Schedule a site visit today and discover why Lake Valley Flower City is Bangladesh's most sought-after integrated township."}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact#booking">
                <Button variant="primary" size="lg">
                  {cta?.buttonText || "Book a Site Visit"}
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <a href={`tel:${formatPhoneLink(site?.phoneRaw || phoneNum)}`}>
                <Button variant="outline" size="lg">
                  <Phone size={18} />
                  {phoneNum}
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
