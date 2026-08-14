import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/Shared/Button';

export default function NotFoundPage() {
  return (
    <section className="min-h-screen pt-28 pb-16 section-padding bg-surface flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <p className="text-7xl font-bold text-emerald-brand/30" aria-hidden="true">
          404
        </p>
        <h1 className="text-2xl font-bold text-deep-green mt-4">
          Page not found
        </h1>
        <p className="text-slate-600 mt-2 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
