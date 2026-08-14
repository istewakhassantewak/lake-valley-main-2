import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-emerald-brand text-white hover:bg-deep-green shadow-lg shadow-emerald-brand/25',
  secondary: 'bg-white text-deep-green border-2 border-emerald-brand hover:bg-emerald-brand hover:text-white',
  gold: 'bg-gold text-deep-green-dark hover:bg-gold-dark hover:text-white shadow-lg shadow-gold/30',
  ghost: 'bg-transparent text-white border-2 border-white/40 hover:bg-white/10',
  outline: 'bg-transparent text-emerald-brand border-2 border-emerald-brand hover:bg-emerald-brand hover:text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * Reusable premium button component with ripple effect
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  disabled = false,
  as: Component = 'button',
  ...props
}) {
  return (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.98 }}>
      <Component
        type={Component === 'button' ? type : undefined}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'btn-ripple inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-300 cursor-pointer',
          variants[variant],
          sizes[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
}
