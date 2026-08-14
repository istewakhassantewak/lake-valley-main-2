import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { PASSWORD_RULES, validatePassword, getPasswordStrength } from '../../utils/passwordValidation';

/**
 * Password field with show/hide toggle and optional strength indicator
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  showStrength = false,
  className,
  id,
  required = false,
  autoComplete = 'current-password',
}) {
  const [visible, setVisible] = useState(false);
  const validation = showStrength ? validatePassword(value) : null;
  const strength = validation ? getPasswordStrength(validation.score) : null;

  const inputClass =
    'w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 focus:border-emerald-brand transition-all';

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(inputClass, className)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={showStrength ? `${id}-strength` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-brand transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && (
        <div id={`${id}-strength`} className="space-y-2" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', strength.color)}
                style={{ width: strength.width }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">{strength.label}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(value);
              return (
                <li
                  key={rule.id}
                  className={cn(
                    'text-xs flex items-center gap-1.5',
                    passed ? 'text-emerald-brand' : 'text-slate-400'
                  )}
                >
                  <span aria-hidden="true">{passed ? '✓' : '○'}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
