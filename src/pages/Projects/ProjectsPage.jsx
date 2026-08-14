import ProjectsSection from '../../components/Projects/ProjectsSection';
import ContactCTA from '../../components/CTA/ContactCTA';
import PageBanner from '../../components/Shared/PageBanner';

const PROJECTS_BANNER_IMAGES = [
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
  'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
  'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
];

/**
 * Projects listing page
 */
export default function ProjectsPage() {
  return (
    <>
      <PageBanner
        badge="Portfolio"
        title="Our Projects"
        titleBn="সকল প্রকল্প"
        description="Explore our diverse range of developments — from tranquil residential plots to vibrant commercial spaces."
        images={PROJECTS_BANNER_IMAGES}
      />

      <ProjectsSection showAll />
      <ContactCTA />
    </>
  );
}
