import { useParams, Link, Navigate } from 'react-router-dom';
import { Check, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/Shared/ScrollReveal';
import SectionHeading from '../../components/Shared/SectionHeading';
import GallerySection from '../../components/Gallery/GallerySection';
import Amenities from '../../components/Features/Amenities';
import ContactCTA from '../../components/CTA/ContactCTA';
import BookingForm from '../../components/Booking/BookingForm';
import GoogleMap from '../../components/Shared/GoogleMap';
import PlotCalculator from '../../components/Shared/PlotCalculator';
import PageBanner from '../../components/Shared/PageBanner';
import { LazyImage } from '../../components/Shared/Lightbox';
import { useCurrency } from '../../context/CurrencyContext';
import { useContent } from '../../context/ContentContext';
import { useImages } from '../../context/ImageContext';
import {
  resolveProjectImage,
  resolveProjectHeroImage,
  resolveMasterPlanImage,
} from '../../utils/imageResolver';

/**
 * Individual project detail page
 */
export default function ProjectDetailsPage() {
  const { slug } = useParams();
  const { projects } = useContent();
  const { images } = useImages();
  const { formatPrice } = useCurrency();

  const projectList = projects || [];
  const project = projectList.find((p) => 
    p.slug === slug || 
    p.id === slug ||
    (slug === 'duplex-city' && (p.slug === 'lake-valley-duplex-city' || p.id === 'lake-valley-duplex-city')) ||
    (slug === 'green-garden-resort' && (p.slug === 'lake-valley-green-garden-resort' || p.id === 'lake-valley-green-garden-resort')) ||
    (slug === 'commercial-bangla-tower' && (p.slug === 'lake-valley-bangla-tower' || p.id === 'lake-valley-bangla-tower'))
  );

  if (!project) return <Navigate to="/projects" replace />;

  const currentIndex = projectList.findIndex((p) => p.slug === slug || p.id === slug);
  const nextProject = projectList[(currentIndex + 1) % projectList.length];
  const prevProject = projectList[(currentIndex - 1 + projectList.length) % projectList.length];

  const resolvedHeroImg = resolveProjectHeroImage(project, images);
  const resolvedOverviewImg = resolveProjectImage(project, images);
  const resolvedMasterPlanImg = resolveMasterPlanImage(
    images,
    'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg'
  );

  const projectCarouselImages = [
    resolvedHeroImg,
    resolvedOverviewImg,
    resolvedMasterPlanImg,
    'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
    'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
  ].filter(Boolean);

  return (
    <>
      {/* Project Hero Carousel Banner */}
      <PageBanner
        align="left"
        badge={project.tagline}
        title={project.title}
        titleBn={project.titleBn}
        description={project.shortDescription}
        images={projectCarouselImages}
        topElement={
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white text-sm transition-colors py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm w-fit"
          >
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        }
      >
        {/* Quick stats pills */}
        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mt-4">
          <div className="bg-emerald-950/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-emerald-500/20 shadow-md">
            <p className="text-white font-bold">{project.stats?.area || '300 Acres'}</p>
            <p className="text-emerald-200/60 text-xs">Total Area</p>
          </div>
          <div className="bg-emerald-950/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-emerald-500/20 shadow-md">
            <p className="text-white font-bold">{project.stats?.plots || '1000+'}</p>
            <p className="text-emerald-200/60 text-xs">Total Units</p>
          </div>
          {project.stats?.startingPriceUSD && (
            <div className="bg-emerald-950/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-amber-400/40 shadow-md">
              <p className="text-amber-300 font-bold">{formatPrice(project.stats.startingPriceUSD)}</p>
              <p className="text-emerald-200/60 text-xs">Starting Price</p>
            </div>
          )}
          {project.stats?.pricePerKathaUSD && (
            <div className="bg-emerald-950/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-emerald-400/30 shadow-md">
              <p className="text-emerald-300 font-bold">{formatPrice(project.stats.pricePerKathaUSD)} / Katha</p>
              <p className="text-emerald-200/60 text-xs">Plot Rate</p>
            </div>
          )}
        </div>
      </PageBanner>

      {/* Overview */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <ScrollReveal direction="left">
            <LazyImage
              src={resolvedOverviewImg}
              alt={project.title}
              className="rounded-3xl shadow-premium w-full h-80 object-cover"
            />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.2}>
            <SectionHeading badge="Overview" title={`About ${project.title}`} align="left" className="mb-6" />
            <p className="text-slate-600 leading-relaxed mb-6">{project.description}</p>
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-brand/5 border border-emerald-brand/10">
              <MapPin className="w-5 h-5 text-emerald-brand mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-deep-green text-sm">Location</p>
                <p className="text-slate-600 text-sm">{project.location}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Features" title="Project Highlights" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.features.map((feature, i) => (
              <ScrollReveal key={feature} delay={i * 0.05}>
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-white shadow-glass border border-slate-100">
                  <Check className="w-5 h-5 text-emerald-brand mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 font-medium">{feature}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <GallerySection showFilters={false} limit={4} />

      {/* Amenities */}
      <Amenities />

      {/* Master Plan */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Master Plan" title="Site Layout" subtitle="Strategic zoning designed for optimal living and investment returns." />
          <ScrollReveal>
            <LazyImage
              src={resolvedMasterPlanImg}
              alt={`${project.title} master plan`}
              className="rounded-3xl shadow-premium w-full h-72 md:h-96 object-cover"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Plot Calculator */}
      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Calculator" title="Estimate Your Investment" subtitle="Flexible financing terms for global buyers and investors." />
          <ScrollReveal>
            <PlotCalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* Location Map */}
      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Location" title="Find Us on the Map" />
          <GoogleMap height="400px" />
        </div>
      </section>

      {/* Booking CTA */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Book Now"
            title={`Interested in ${project.title}?`}
            subtitle="Fill out the form below and our sales team will get in touch within 24 hours."
          />
          <BookingForm compact />
        </div>
      </section>

      {/* Navigation between projects */}
      <section className="border-t border-emerald-brand/10 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <Link to={`/projects/${prevProject.slug}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-brand transition-colors">
            <ArrowLeft size={16} /> {prevProject.title}
          </Link>
          <Link to={`/projects/${nextProject.slug}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-brand transition-colors">
            {nextProject.title} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
