import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT } from '../../utils/constants';
import { getWhatsAppUrl, formatPhoneLink } from '../../utils/helpers';

/**
 * Floating WhatsApp and Call action buttons
 */
export default function FloatingButtons() {
  const whatsappUrl = getWhatsAppUrl(
    CONTACT.whatsapp,
    'Hello! I am interested in Lake Valley Flower City. Please share more details.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col gap-3">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        className="w-14 h-14 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </motion.a>

      <motion.a
        href={`tel:${formatPhoneLink(CONTACT.phoneRaw)}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.1 }}
        className="w-14 h-14 rounded-2xl bg-gold text-deep-green-dark shadow-lg shadow-gold/30 flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="Call us"
      >
        <Phone size={22} />
      </motion.a>
    </div>
  );
}
