import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Tag } from 'lucide-react';
import SectionHeading from '../Shared/SectionHeading';
import ScrollReveal from '../Shared/ScrollReveal';
import { LazyImage } from '../Shared/Lightbox';
import { useCurrency } from '../../context/CurrencyContext';
import { useContent } from '../../context/ContentContext';
import { useImages } from '../../context/ImageContext';
import { resolveProjectImage } from '../../utils/imageResolver';

/**
 * Featured projects grid for homepage
 */
export default function ProjectsSection({ limit = 4, showAll = false }) {
  const { projects: allProjects } = useContent();
  const { images } = useImages();
  const displayProjects = showAll ? (allProjects || []) : (allProjects || []).slice(0, limit);
  const { formatPrice } = useCurrency();

  return (
    <section id="projects" className="section-padding">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="4 Flagship Projects"
          title="Discover Our Integrated Developments"
          titleBn="আমাদের ৪টি প্রধান প্রকল্প"
          subtitle="From serene residential plots to luxury duplex villas, resort living, and bustling commercial hubs — explore our 4 master developments."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProjects.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.1}>
              <Link
                to={`/projects/${project.slug}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-brand rounded-3xl transition-transform"
                title={`View ${project.title} details`}
              >
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl overflow-hidden bg-white shadow-glass hover:shadow-premium border border-slate-100 group-hover:border-emerald-brand/30 transition-all duration-500 h-full flex flex-col cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <LazyImage
                      src={resolveProjectImage(project, images)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold/90 text-deep-green-dark text-xs font-semibold shadow-sm">
                      {project.tagline}
                    </span>
                    {project.stats?.startingPriceUSD && (
                      <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-deep-green-dark/85 backdrop-blur text-white text-xs font-bold border border-gold/30 flex items-center gap-1.5 shadow-lg">
                        <Tag size={12} className="text-gold" />
                        From {formatPrice(project.stats.startingPriceUSD)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-deep-green group-hover:text-emerald-brand transition-colors mb-1">
                      {project.title}
                    </h3>
                    <p className="font-bangla text-sm text-emerald-brand font-semibold mb-3">{project.titleBn}</p>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                      {project.shortDescription}
                    </p>

                    {/* Features preview */}
                    <ul className="space-y-1.5 mb-5">
                      {project.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-emerald-brand mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="inline-flex items-center gap-2 text-emerald-brand font-bold text-sm group-hover:gap-3 transition-all mt-auto pt-2">
                      <span>Read More</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {!showAll && (
          <ScrollReveal className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-brand text-white font-semibold hover:bg-deep-green transition-colors shadow-lg shadow-emerald-brand/25"
            >
              View All Projects
              <ArrowRight size={18} />
            </Link>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
