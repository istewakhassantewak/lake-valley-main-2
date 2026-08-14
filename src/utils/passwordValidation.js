/** Client-side password validation (Firebase handles storage) */

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function validatePassword(password) {
  const failed = PASSWORD_RULES.filter((r) => !r.test(password));
  return {
    valid: failed.length === 0,
    failed,
    score: PASSWORD_RULES.length - failed.length,
  };
}

export function getPasswordStrength(score) {
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 3) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
  if (score <= 4) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
  return { label: 'Strong', color: 'bg-emerald-brand', width: '100%' };
}

export function getPasswordValidationMessage(password) {
  const { valid, failed } = validatePassword(password);
  if (valid) return null;
  return `Password must include: ${failed.map((r) => r.label.toLowerCase()).join(', ')}.`;
}
