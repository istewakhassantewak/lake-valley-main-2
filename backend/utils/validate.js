/** Input validation and sanitization helpers */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()#.-]{3,30}$/;

function sanitizeString(value, maxLen = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return EMAIL_RE.test(email);
}

function isValidPhone(phone) {
  return PHONE_RE.test(phone);
}

function pickFields(body, allowed) {
  const result = {};
  for (const key of allowed) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
}

module.exports = { sanitizeString, isValidEmail, isValidPhone, pickFields, EMAIL_RE, PHONE_RE };
