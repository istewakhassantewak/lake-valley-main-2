import { CONTACT, MAP_EMBED_URL } from '../../utils/constants';

/**
 * Responsive Google Maps embed
 */
export default function GoogleMap({ className = '', height = '400px' }) {
  return (
    <div className={`rounded-3xl overflow-hidden shadow-premium ${className}`} style={{ height }}>
      <iframe
        title={`${CONTACT.address} — Google Maps`}
        src={MAP_EMBED_URL}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
