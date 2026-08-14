import Hero from '../../components/Hero/Hero';
import About from '../../components/About/About';
import ProjectsSection from '../../components/Projects/ProjectsSection';
import Features from '../../components/Features/Features';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import MasterPlan from '../../components/Features/MasterPlan';
import GallerySection from '../../components/Gallery/GallerySection';
import Amenities from '../../components/Features/Amenities';
import BookingProcess from '../../components/Booking/BookingProcess';
import Testimonials from '../../components/Testimonials/Testimonials';
import Statistics from '../../components/Features/Statistics';
import ContactCTA from '../../components/CTA/ContactCTA';
import BookingForm from '../../components/Booking/BookingForm';
import GoogleMap from '../../components/Shared/GoogleMap';
import ScrollReveal from '../../components/Shared/ScrollReveal';

/**
 * Homepage — assembles all landing page sections
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ProjectsSection />
      <Features />
      <WhyChooseUs />
      <MasterPlan />
      <GallerySection limit={6} />
      <Amenities />
      <BookingProcess />
      <Testimonials />
      <Statistics />
      <ContactCTA />
      <BookingForm />
      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <GoogleMap height="450px" />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
