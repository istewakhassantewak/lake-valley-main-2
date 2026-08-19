import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Calculator, X } from 'lucide-react';
import { projects } from '../../data/projects';
import { PLOT_SIZES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import Button from '../Shared/Button';
import { submitBooking } from '../../api/bookingApi';

/**
 * Booking / inquiry form with react-hook-form validation and International Investment Estimator integration
 */
export default function BookingForm({ compact = false }) {
  const [submitError, setSubmitError] = useState('');
  const [estimatorPlan, setEstimatorPlan] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm({
    defaultValues: {
      project: projects[0]?.title || 'Lake Valley Flower City',
    },
  });

  // Auto-fill user information
  useEffect(() => {
    if (user) {
      if (user.displayName) setValue('name', user.displayName);
      if (user.email) setValue('email', user.email);
    }
  }, [user, setValue]);

  // Read saved estimator plan from sessionStorage or custom events
  useEffect(() => {
    const loadSavedPlan = () => {
      try {
        const saved = sessionStorage.getItem('estimatorPlan');
        if (saved) {
          const parsed = JSON.parse(saved);
          setEstimatorPlan(parsed);
          if (parsed.katha) {
            setValue('plotSize', `${parsed.katha} Katha`);
          }
        }
      } catch {
        // ignore
      }
    };

    loadSavedPlan();

    const handleApplyPlan = (e) => {
      if (e.detail) {
        setEstimatorPlan(e.detail);
        if (e.detail.katha) {
          setValue('plotSize', `${e.detail.katha} Katha`);
        }
      }
    };

    window.addEventListener('applyEstimatorPlan', handleApplyPlan);
    return () => window.removeEventListener('applyEstimatorPlan', handleApplyPlan);
  }, [setValue]);

  const removeEstimatorPlan = () => {
    setEstimatorPlan(null);
    try {
      sessionStorage.removeItem('estimatorPlan');
    } catch {
      // ignore
    }
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const payload = {
        ...data,
        project: data.project || 'Lake Valley Flower City Phase 1',
        estimatorDetails: estimatorPlan || undefined,
      };

      await submitBooking(payload);
      toast.success('Booking request submitted successfully!');
      reset({
        name: data.name,
        email: data.email,
        phone: '',
        project: projects[0]?.title || 'Lake Valley Flower City Phase 1',
        plotSize: '',
        message: '',
      });
      setEstimatorPlan(null);
      sessionStorage.removeItem('estimatorPlan');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit. Please try again.');
      toast.error(err.message || 'Submission failed');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-brand/30 focus:border-emerald-brand transition-all text-sm';

  return (
    <section id="booking" className={compact ? '' : 'section-padding bg-surface'}>
      <div className={compact ? '' : 'max-w-7xl mx-auto'}>
        {!compact && (
          <SectionHeading
            badge="Book Your Visit"
            title="Reserve Your Plot Today"
            titleBn="আপনার প্লট বুক করুন"
            subtitle="Fill out the form below and our team will contact you within 24 hours to schedule your site visit."
          />
        )}

        <ScrollReveal>
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-premium space-y-5"
          >
            {isSubmitSuccessful && !submitError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-brand/10 text-emerald-brand">
                <CheckCircle size={20} />
                <p className="text-sm font-medium">Thank you! Your booking request has been received and added to your profile.</p>
              </div>
            )}
            {submitError && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Estimator Plan Badge */}
            {estimatorPlan && (
              <div className="p-4 rounded-2xl bg-emerald-brand/10 border border-emerald-brand/30 relative">
                <button
                  type="button"
                  onClick={removeEstimatorPlan}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Remove estimator plan"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-2 text-emerald-brand font-bold text-xs uppercase tracking-wider">
                  <Calculator size={16} />
                  International Investment Estimator Plan Included
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Plot Size</span>
                    <span className="font-semibold text-deep-green">{estimatorPlan.katha} Katha</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Down Payment ({estimatorPlan.downPaymentPercent}%)</span>
                    <span className="font-semibold text-emerald-brand">{estimatorPlan.formattedDownPayment}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Monthly ({estimatorPlan.months} Mos)</span>
                    <span className="font-semibold text-amber-700">{estimatorPlan.formattedMonthly}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-deep-green mb-1.5">
                  Full Name *
                </label>
                <input
                  id="name"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                  className={inputClass}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-deep-green mb-1.5">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^[+\d\s-()]{10,}$/, message: 'Enter a valid phone number' },
                  })}
                  className={inputClass}
                  placeholder="+880 1XXX XXX XXX"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-deep-green mb-1.5">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Project */}
              <div>
                <label htmlFor="project" className="block text-sm font-semibold text-deep-green mb-1.5">
                  Preferred Project *
                </label>
                <select
                  id="project"
                  {...register('project', { required: 'Please select a project' })}
                  className={inputClass}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
                {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project.message}</p>}
              </div>

              {/* Plot Size */}
              <div>
                <label htmlFor="plotSize" className="block text-sm font-semibold text-deep-green mb-1.5">
                  Plot Size
                </label>
                <select id="plotSize" {...register('plotSize')} className={inputClass}>
                  <option value="">Select size (optional)</option>
                  {PLOT_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-deep-green mb-1.5">
                Message / Custom Requirements
              </label>
              <textarea
                id="message"
                rows={4}
                {...register('message')}
                className={`${inputClass} resize-none`}
                placeholder="Tell us about your requirements or preferred site visit dates..."
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
              <Send size={18} />
              {isSubmitting ? 'Submitting…' : 'Submit Booking Request'}
            </Button>
          </motion.form>
        </ScrollReveal>
      </div>
    </section>
  );
}
