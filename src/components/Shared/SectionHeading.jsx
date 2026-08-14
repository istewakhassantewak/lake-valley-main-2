import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

/**
 * Reusable section heading with optional badge and Bangla subtitle
 */
export default function SectionHeading({
  badge,
  title,
  titleBn,
  subtitle,
  align = 'center',
  className,
  light = false,
}) {
  const alignClass = {
    center: 'text-center mx-auto',
    left: 'text-left',
    right: 'text-right ml-auto',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn('max-w-3xl mb-12', alignClass[align], className)}
    >
      {badge && (
        <span
          className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4',
            light ? 'bg-white/10 text-gold' : 'bg-emerald-brand/10 text-emerald-brand'
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
          light ? 'text-white' : 'text-deep-green'
        )}
      >
        {title}
      </h2>
      {titleBn && (
        <p className={cn('font-bangla text-lg mt-2', light ? 'text-gold-light' : 'text-emerald-brand font-semibold')}>
          {titleBn}
        </p>
      )}
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base md:text-lg leading-relaxed font-normal',
            light ? 'text-white/80' : 'text-slate-600'
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
