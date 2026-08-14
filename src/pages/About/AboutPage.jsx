import { Target, Eye, Award, Users } from 'lucide-react';
import SectionHeading from '../../components/Shared/SectionHeading';
import ScrollReveal from '../../components/Shared/ScrollReveal';
import Statistics from '../../components/Features/Statistics';
import Testimonials from '../../components/Testimonials/Testimonials';
import ContactCTA from '../../components/CTA/ContactCTA';
import PageBanner from '../../components/Shared/PageBanner';
import { LazyImage } from '../../components/Shared/Lightbox';
import { useContent } from '../../context/ContentContext';
import { useImages } from '../../context/ImageContext';
import { resolveMasterPlanImage } from '../../utils/imageResolver';

/**
 * About page with extended company information
 */
export default function AboutPage() {
  const { about, site } = useContent();
  const { images } = useImages();

  const milestones = about?.milestones || [];
  const leadershipMessages = about?.leadershipMessages || [];

  const aboutHeroImg = about?.heroImage || resolveMasterPlanImage(images, "https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg");
  const aboutCarouselImages = [
    aboutHeroImg,
    "https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg",
    "https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg",
    "https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg"
  ];

  return (
    <>
      {/* Page Hero Carousel Banner */}
      <PageBanner
        badge="About Us"
        title={about?.heroTitle || `About ${site?.companyName || 'Lake Valley Duplex & Resort Ltd.'}`}
        titleBn={about?.heroTitleBn || site?.siteNameBn || 'লেক ভ্যালি ডুপ্লেক্স এন্ড রিসোর্ট লিঃ'}
        description={about?.heroSubtitle || 'Pioneering sustainable township development that balances urban growth with environmental stewardship.'}
        images={aboutCarouselImages}
      />

      {/* Story */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <LazyImage
              src={about?.storyImage1 || "https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg"}
              alt="Lake Valley Flower City development"
              className="rounded-3xl shadow-premium w-full h-80 object-cover"
            />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.2}>
            <LazyImage
              src={about?.storyImage2 || "https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg"}
              alt="Lake Valley Garden View"
              className="rounded-3xl shadow-premium w-full h-80 object-cover mb-6"
            />
            <h2 className="text-3xl font-bold text-deep-green mb-4">{about?.storyHeading || 'Our Story'}</h2>
            <p className="text-slate-700 leading-relaxed mb-4 font-bangla">
              {about?.storyBn}
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              {about?.storyEn1}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {about?.storyEn2}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Messages From Leadership"
            title="Leadership Messages"
            subtitle="The following messages share our leadership perspective on integrity, responsible development, and customer-first service excellence."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {leadershipMessages.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="h-full p-6 rounded-3xl bg-white shadow-glass hover:shadow-premium border border-slate-100 transition-shadow duration-300 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-brand uppercase tracking-[0.2em]">
                      {item.title}
                    </span>
                    <p className="mt-5 text-slate-600 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <p className="mt-6 text-sm font-bold text-deep-green">
                    {item.footer}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <Statistics />

      {/* Values */}
      <section className="section-padding bg-surface">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Our Values" title="What Drives Us" subtitle="The principles that guide every decision at Lake Valley Flower City." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: 'Vision', text: 'A self-reliant Bangladesh through sustainable townships.' },
              { icon: Target, title: 'Mission', text: 'Eco-friendly housing that meets national demand responsibly.' },
              { icon: Award, title: 'Quality', text: 'International-standard amenities and transparent processes.' },
              { icon: Users, title: 'Community', text: 'Building neighborhoods where families flourish together.' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="p-6 rounded-3xl bg-white shadow-glass border border-slate-100 text-center">
                  <item.icon className="w-8 h-8 text-emerald-brand mx-auto mb-4" />
                  <h3 className="font-bold text-deep-green mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <SectionHeading badge="Timeline" title="Our Journey" />
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <ScrollReveal key={m.year} delay={i * 0.1}>
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-brand/10 flex items-center justify-center shrink-0">
                    <span className="font-bold text-emerald-brand text-sm">{m.year}</span>
                  </div>
                  <div className="pt-3">
                    <p className="text-slate-700 font-medium">{m.event}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <ContactCTA />
    </>
  );
}
