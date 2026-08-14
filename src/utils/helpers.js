/** Utility helper functions */

/**
 * Combines class names, filtering out falsy values
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a phone number for tel: links
 */
export function formatPhoneLink(phone) {
  return phone.replace(/\s+/g, '');
}

/**
 * Generates a WhatsApp chat URL
 */
export function getWhatsAppUrl(number, message = '') {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Scrolls smoothly to an element by ID
 */
export function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Truncates text to a maximum length
 */
export function truncate(text, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/**
 * Creates SEO-friendly slug from title
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
