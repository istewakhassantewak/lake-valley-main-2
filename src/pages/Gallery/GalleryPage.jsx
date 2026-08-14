import GallerySection from '../../components/Gallery/GallerySection';
import ContactCTA from '../../components/CTA/ContactCTA';
import PageBanner from '../../components/Shared/PageBanner';

const GALLERY_BANNER_IMAGES = [
  'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
  'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
  'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
];

/**
 * Full gallery page
 */
export default function GalleryPage() {
  return (
    <>
      <PageBanner
        badge="Visual Tour"
        title="Gallery"
        titleBn="ছবির গ্যালারি"
        description="Take a visual journey through Lake Valley Flower City — from blooming gardens to modern architecture."
        images={GALLERY_BANNER_IMAGES}
      />

      <GallerySection />
      <ContactCTA />
    </>
  );
}
