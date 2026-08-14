import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useScrolledPast } from '../../hooks/useScrollPosition';
import { CONTACT } from '../../utils/constants';
import { formatPhoneLink } from '../../utils/helpers';
import Button from './Button';

/**
 * Sticky bottom CTA bar on mobile
 */
export default function StickyCTA() {
  const visible = useScrolledPast(600);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-emerald-brand/10 p-3"
        >
          <div className="flex gap-3 max-w-lg mx-auto">
            <a
              href={`tel:${formatPhoneLink(CONTACT.phoneRaw)}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold text-deep-green-dark font-semibold text-sm"
              style={{ minHeight: '44px' }}
            >
              <Phone size={16} />
              Call Now
            </a>
            <Link to="/contact#booking" className="flex-1">
              <Button variant="primary" size="sm" className="w-full min-h-[44px] text-sm">
                Book Visit
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
