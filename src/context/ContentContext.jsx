import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchContentApi, updateContentApi, resetContentApi, subscribeToContentChanges } from '../api/contentApi';

// Fallback default content in case backend call fails
export const defaultContentState = {
  site: {
    siteName: 'Lake Valley Flower City',
    siteNameBn: 'লেক ভ্যালি ফ্লাওয়ার সিটি',
    companyName: 'Lake Valley Duplex & Resort Ltd.',
    tagline: 'Where Nature Meets Modern Living',
    logo: '/logo.png',
    phone: '+880 1806 42 59 61',
    phoneSecondary: '+880 1806 42 59 62',
    phones: ['+880 1806 42 59 61', '+880 1806 42 59 62', '+880 1806 42 59 63', '+880 1806 42 59 64'],
    phoneRaw: '+8801806425961',
    email: 'info@lakevalleyflowercity.com',
    website: 'https://www.lakevalleyflowercity.com',
    headOffice: 'JCX Business Tower, Plot # 1136/A (5th Floor), Block # I, Japan Street, Bashundhara R/A, Dhaka-1229, Bangladesh',
    corporateOffice: '3/2 Outer Circular Road, Proshanti Heights, Levels 2, 3 & 4, Malibagh, Dhaka-1217, Bangladesh',
    hours: '9:30 AM – 6:30 PM (Sat – Thu)',
    whatsapp: '8801806425961',
    facebook: 'https://facebook.com/lakevalleyflowercity',
    instagram: 'https://instagram.com/lakevalleyflowercity',
    youtube: 'https://www.youtube.com/@LakeValleyGroup',
    linkedin: 'https://linkedin.com/company/lakevalleyflowercity',
    mapEmbedUrl: 'https://www.google.com/maps?q=JCX+Business+Tower,+Bashundhara+R/A,+Dhaka-1229,+Bangladesh&z=15&output=embed',
  },
  hero: {
    slides: [
      {
        id: 1,
        title: 'Lake Valley Flower City',
        titleBn: 'লেক ভ্যালি ফ্লাওয়ার সিটি',
        subtitle: "Bangladesh's First Integrated Eco-Township",
        description: 'A 300-acre master-planned community where floral landscapes, natural lakes, and modern amenities create an unparalleled living experience near Dhaka.',
        image: 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
        cta: 'Explore Projects',
        ctaLink: '/projects',
      },
      {
        id: 2,
        title: 'Lake Valley Duplex City & Resort Limited',
        titleBn: 'লেক ভ্যালি ডুপ্লেক্স সিটি অ্যান্ড রিসোর্ট লিমিটেড',
        subtitle: 'Elevated Family Living',
        description: 'Spacious duplex villas designed for modern families, combining architectural elegance with the tranquility of lakeside township living.',
        image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
        cta: 'View Duplexes',
        ctaLink: '/projects/lake-valley-duplex-city',
      },
      {
        id: 3,
        title: 'Lake Valley Green Garden Resort',
        titleBn: 'লেক ভ্যালি গ্রীন গার্ডেন রিসোর্ট',
        subtitle: 'Luxury Amidst Nature',
        description: 'Escape to a serene resort destination within the township — featuring lakeside views, premium hospitality, and world-class recreational facilities.',
        image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
        cta: 'Discover Resort',
        ctaLink: '/projects/lake-valley-green-garden-resort',
      },
      {
        id: 4,
        title: 'Lake Valley Bangla Tower',
        titleBn: 'লেক ভ্যালি বাংলা টাওয়ার',
        subtitle: 'Prime Business Destination',
        description: 'Strategic commercial spaces positioned near industrial zones — offering exceptional rental yields and long-term investment potential.',
        image: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
        cta: 'Invest Now',
        ctaLink: '/projects/lake-valley-bangla-tower',
      },
    ],
    stats: [
      { value: 300, suffix: '+', label: 'Acres of Land' },
      { value: 2000, suffix: '+', label: 'Flower Species' },
      { value: 4, suffix: '', label: 'Flagship Projects' },
      { value: 15, suffix: '+', label: 'Years Vision' },
    ],
  },
  projects: [
    {
      id: 'lake-valley-flower-city',
      slug: 'lake-valley-flower-city',
      title: 'Lake Valley Flower City',
      titleBn: 'লেক ভ্যালি ফ্লাওয়ার সিটি',
      tagline: 'The Heart of the Integrated Township',
      shortDescription: 'A trusted residential destination where riverside serenity meets wide roads and modern civic amenities — your dream address awaits.',
      description: 'Lake Valley Flower City is the flagship residential zone of our 300-acre integrated eco-township. Surrounded by natural lakes on three sides and adorned with over 2,000 species of flowers across themed blocks, this project offers 3, 5, 7, and 10 katha plots with dedicated schools, playgrounds, mosques, and green corridors for complete community living.',
      image: 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      features: [
        '3, 5, 7 & 10 katha residential plots',
        '2000+ flower species and lakeside greenery',
        'Dedicated schools, playgrounds & mosques',
        'Wide internal roads & 24/7 civic amenities',
        'Resort and commercial zones',
        'Secure gated community with 3-tier security',
      ],
      amenities: ['Park', 'Lake View', 'Mosque', 'School', 'Sports Club', 'Wide Roads'],
      stats: { area: '180 Acres', plots: '1200+', startingPriceUSD: 25000, pricePerKathaUSD: 8500 },
      location: 'Near Dhaka-Mawa Expressway, Bangladesh — adjacent to BASIC Industrial City',
      featured: true,
    },
    {
      id: 'lake-valley-duplex-city',
      slug: 'lake-valley-duplex-city',
      title: 'Lake Valley Duplex City & Resort Limited',
      titleBn: 'লেক ভ্যালি ডুপ্লেক্স সিটি অ্যান্ড রিসোর্ট লিমিটেড',
      tagline: 'Premium Duplex & Villa Living',
      shortDescription: 'Stylish duplex villas designed for modern families, offering private gardens, architectural elegance, and lakeside serenity.',
      description: 'Lake Valley Duplex City & Resort Limited features premium two-story luxury villas within Lake Valley Flower City, combining spacious living, contemporary architecture, and proximity to the sports club, boarding school, convention hall, and community facilities.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      features: [
        'Two-story premium luxury duplex villas',
        'Private landscaped garden spaces',
        'Contemporary architectural aesthetics',
        '24/7 gated security & CCTV surveillance',
        'Walking distance to sports club & international school',
        'Serene family-friendly neighborhood',
      ],
      amenities: ['Private Garden', 'Parking', 'Security', 'Club Access', 'Lake Proximity'],
      stats: { area: '45 Acres', plots: '200+ Villas', startingPriceUSD: 65000, pricePerKathaUSD: 13000 },
      location: 'Central Lakefront Zone, Lake Valley Flower City',
      featured: true,
    },
    {
      id: 'lake-valley-green-garden-resort',
      slug: 'lake-valley-green-garden-resort',
      title: 'Lake Valley Green Garden Resort',
      titleBn: 'লেক ভ্যালি গ্রীন গার্ডেন রিসোর্ট',
      tagline: 'Luxury Hospitality & Leisure',
      shortDescription: 'A lakeside resort destination offering premium accommodation, recreational facilities, and high-yield hospitality investment.',
      description: 'Lake Valley Green Garden Resort is the hospitality crown of Lake Valley Flower City. Set against a backdrop of lush botanical gardens and serene water bodies, the resort features luxury suites, fine dining, event spaces, swimming pools, and wellness facilities.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      features: [
        'Lakeside luxury suites & chalets',
        'Fine dining & grand banquet halls',
        'Infinity swimming pool & wellness spa',
        'Grand event & wedding convention venues',
        'Eco-friendly resort landscape',
        'High-yield rental management options',
      ],
      amenities: ['Pool', 'Spa', 'Restaurant', 'Event Hall', 'Lake View', 'Garden'],
      stats: { area: '25 Acres', plots: '80+ Units', startingPriceUSD: 80000, pricePerKathaUSD: 16000 },
      location: 'Resort Peninsula Zone, Lake Valley Flower City',
      featured: true,
    },
    {
      id: 'lake-valley-bangla-tower',
      slug: 'lake-valley-bangla-tower',
      title: 'Lake Valley Bangla Tower',
      titleBn: 'লেক ভ্যালি বাংলা টাওয়ার',
      tagline: 'Strategic Commercial & Business Hub',
      shortDescription: 'Premium commercial spaces positioned for business growth, retail outlets, corporate offices, and strong rental yields.',
      description: 'Lake Valley Bangla Tower offers modern retail spaces, corporate offices, and banking units facing the main highway corridor near BASIC Chemical Industrial City and Printing Industrial City. The project is designed for businesses and investors seeking prime location advantages and long-term commercial value.',
      image: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
      features: [
        'Prime highway frontage commercial location',
        'Adjacent to major industrial corridors',
        'High rental yield & capital growth potential',
        'High-speed elevators & 24/7 power backup',
        'Flexible retail & corporate office unit sizes',
        'Ample multi-level basement parking',
      ],
      amenities: ['Parking', 'Elevator', 'Security', 'Retail Space', 'Office Units', 'Power Backup'],
      stats: { area: '12 Acres', plots: '100+ Units', startingPriceUSD: 45000, pricePerKathaUSD: 11000 },
      location: 'Main Commercial Avenue, Lake Valley Flower City',
      featured: true,
    },
  ],
  about: {
    heroTitle: 'About Lake Valley Duplex & Resort Ltd.',
    heroTitleBn: 'লেক ভ্যালি ডুপ্লেক্স এন্ড রিসোর্ট লিঃ',
    heroSubtitle: 'Pioneering sustainable township development that balances urban growth with environmental stewardship.',
    heroImage: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
    storyHeading: 'Our Story',
    storyBn: 'দেশের ক্রমবর্ধমান জনসংখ্যার আবাসন চাহিদা মেটাতে হ্রাস পাচ্ছে কৃষি জমি, ইট-পাথরের নগরায়নে পরিবেশ তার ভারসাম্য হারাচ্ছে। কৃষি জমির বহুমুখী ব্যবহার নিশ্চিত করে এবং পরিবেশ বান্ধব আবাসনের একটি অভিনব ধারণা নিয়ে যাত্রা শুরু করেছে লেক ভ্যালি ডুপ্লেক্স এন্ড রিসোর্ট লিঃ।',
    storyEn1: "Dhaka’s rapid urbanization has reduced agricultural land and unbalanced the environment. Lake Valley Duplex & Resort Ltd. launched Lake Valley Flower City to deliver a sustainable township with residential plots, duplex villas, resort living, eco agro-tourism, and commercial developments on 300 acres near Dhaka.",
    storyEn2: "The project combines a private park, resort, commercial zone, convention hall, studio apartments, duplex villas, sports club, international boarding school, and senior-friendly living — all designed for safe investment and long-term, sustainable urban growth.",
    storyImage1: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
    storyImage2: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
    vision: 'To build Bangladesh\'s leading eco-township network that sets benchmark standards for floral landscaping, sustainable civic infrastructure, and quality community living near major urban centers.',
    mission: 'To empower families and investors through transparent, legal real estate offerings that preserve natural lakes and ecosystems while providing modern amenities, educational institutions, and healthcare facilities.',
    leadershipMessages: [
      {
        id: 1,
        title: 'Advisor Message',
        summary: 'Our priority is to maintain integrity in every stage of development, from land planning to project handover. We believe that trust is earned through consistency, transparency, and accountable business practices.',
        footer: 'S. M. Jahrul Islam — Advisor, Lake Valley Duplex and Resort Ltd.',
      },
      {
        id: 2,
        title: 'Chairman Message',
        summary: 'The company started its journey in 2011 with a commitment to fair and responsible real estate business. Since then, we have focused on serving people who dream of a quality home in and around Dhaka with better accessibility and living standards.',
        footer: 'Anwar Hossain Royal Rana — Chairman, Lake Valley Duplex and Resort Ltd.',
      },
      {
        id: 3,
        title: 'Managing Director Message',
        summary: 'Our business was founded on innovation, sustainability, and commitment. Over the years, we have expanded into apartments, commercial spaces, duplex homes, shopping areas, agro-based resort projects, and premium holiday villas.',
        footer: 'Md. Nazmul Hasan (Jabir) — Managing Director, Lake Valley Duplex and Resort Ltd.',
      },
    ],
    milestones: [
      { id: 1, year: '2010', event: 'Company founded with a vision for eco-friendly townships' },
      { id: 2, year: '2015', event: 'Acquired 300 acres for Lake Valley Flower City master plan' },
      { id: 3, year: '2018', event: 'Launched residential plot sales with 2000+ flower species landscaping' },
      { id: 4, year: '2021', event: 'Green Garden Resort and Duplex City zones inaugurated' },
      { id: 5, year: '2024', event: 'Eco Agro Tourism and Commercial Bangla Tower projects launched' },
    ],
  },
  amenities: [
    { id: 1, iconName: 'Flower2', title: 'Floral Gardens', description: 'Over 2,000 flower species arranged in themed blocks across the township.' },
    { id: 2, iconName: 'Waves', title: 'Natural Lakes', description: 'Pristine lakes on three sides providing scenic views and fresh air.' },
    { id: 3, iconName: 'Building', title: 'Convention Hall', description: 'Grand event spaces for weddings, conferences, and community gatherings.' },
    { id: 4, iconName: 'GraduationCap', title: 'International School', description: 'Boarding school with global curriculum standards for quality education.' },
    { id: 5, iconName: 'HeartPulse', title: 'Healthcare Center', description: 'Planned hospital facilities ensuring medical care within the community.' },
    { id: 6, iconName: 'Users', title: 'Senior Living', description: 'Dedicated old home facilities providing compassionate care for elders.' },
    { id: 7, iconName: 'Car', title: 'Wide Road Network', description: 'Generously planned roads ensuring smooth traffic and connectivity.' },
    { id: 8, iconName: 'Wifi', title: 'Smart Infrastructure', description: 'Modern utilities including high-speed connectivity and smart systems.' },
    { id: 9, iconName: 'Zap', title: 'Reliable Power', description: 'Uninterrupted electricity supply with backup systems throughout.' },
    { id: 10, iconName: 'Droplets', title: 'Clean Water Supply', description: 'Purified water infrastructure for every residential and commercial unit.' },
    { id: 11, iconName: 'Dumbbell', title: 'Sports Club', description: 'Premium athletic facilities including gym, courts, and swimming pool.' },
    { id: 12, iconName: 'UtensilsCrossed', title: 'Dining & Retail', description: 'Restaurants, cafes, and retail outlets within walking distance.' },
  ],
  whyChooseUs: {
    sectionTitle: 'Why Choose Lake Valley',
    sectionSubtitle: 'Unmatched advantages of living and investing in Bangladesh’s flagship eco-township.',
    items: [
      { id: 1, iconName: 'Leaf', title: 'Eco Friendly', titleBn: 'পরিবেশ বান্ধব', description: 'Sustainable development preserving natural ecosystems and promoting green living.' },
      { id: 2, iconName: 'Waves', title: 'Lake View', titleBn: 'লেক ভিউ', description: 'Scenic natural lakes on three sides offering pollution-free, healthy environments.' },
      { id: 3, iconName: 'Home', title: 'Residential', titleBn: 'আবাসিক', description: 'Premium plots and homes designed for families of every size and lifestyle.' },
      { id: 4, iconName: 'Building2', title: 'Commercial', titleBn: 'কমার্শিয়াল', description: 'Strategic business spaces with high rental potential near industrial hubs.' },
      { id: 5, iconName: 'Palmtree', title: 'Resort', titleBn: 'রিসোর্ট', description: 'World-class hospitality and recreation within your township.' },
      { id: 6, iconName: 'Trophy', title: 'Sports Club', titleBn: 'স্পোর্টস ক্লাব', description: 'State-of-the-art athletic facilities for an active, balanced lifestyle.' },
      { id: 7, iconName: 'GraduationCap', title: 'Boarding School', titleBn: 'বোর্ডিং স্কুল', description: 'International-standard residential school for quality education.' },
      { id: 8, iconName: 'Landmark', title: 'Mosque', titleBn: 'মসজিদ', description: 'Dedicated prayer spaces in every block for spiritual convenience.' },
      { id: 9, iconName: 'Trees', title: 'Park', titleBn: 'পার্ক', description: 'Expansive green parks and floral gardens throughout the community.' },
      { id: 10, iconName: 'Route', title: 'Wide Roads', titleBn: 'প্রশস্ত রাস্তা', description: 'Generously planned road networks ensuring smooth connectivity.' },
      { id: 11, iconName: 'TrendingUp', title: 'Investment Opportunity', titleBn: 'বিনিয়োগের সুযোগ', description: 'Secure, profitable investments backed by transparent documentation.' },
      { id: 12, iconName: 'ShieldCheck', title: 'Secure Environment', titleBn: 'নিরাপদ পরিবেশ', description: 'Gated community with 24/7 security for complete peace of mind.' },
    ],
  },
  testimonials: [
    {
      id: 1,
      name: 'Engr. Kazi Mahfuzur Rahman',
      role: 'Senior Infrastructure Consultant (NRB, Dubai)',
      tag: 'Plot #B-14, Lake View Zone',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      quote: 'Living in Dubai for over 14 years, finding a legally verified plot near the Dhaka-Mawa Expressway was my top priority. The direct registration, clear demarcation, and 3-sided lake planning at Lake Valley gave our family complete peace of mind.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Dr. Nusrat Jahan Chowdhury',
      role: 'Associate Professor & Consultant Physician, Dhaka',
      tag: 'Duplex City, Block-C',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      quote: 'We wanted a peaceful family residence away from the city\'s congestion yet within 25 minutes of central Dhaka. The 60-foot main boulevard, dedicated international school, and fresh botanical lakefront are genuinely exceptional.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Md. Tariqul Islam',
      role: 'Managing Director, TexTech Logistics (Motijheel, Dhaka)',
      tag: 'Commercial Bangla Tower',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      quote: 'Securing commercial units at Commercial Bangla Tower was one of our best corporate decisions. Given the rapid industrial growth in this corridor, the road connectivity and rental yield potential are unmatched.',
      rating: 5,
    },
    {
      id: 4,
      name: 'Barrister Syed Ashiqur Rahman',
      role: 'Supreme Court Advocate, Dhaka',
      tag: 'Sector-1, Residential Plot Owner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      quote: 'As a legal practitioner, I personally reviewed the CS, SA, RS, and BS land records along with the approved masterplan layout. Lake Valley\'s transparent documentation and clear mutation process set a very reassuring standard.',
      rating: 5,
    },
    {
      id: 5,
      name: 'Farhana Akhtar & M. A. Rashid',
      role: 'NRB Investor Family (London, UK)',
      tag: 'Eco Agro Farmhouse & Villa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      quote: 'We visited the project during our winter vacation and were impressed by the on-ground development, paved roads, and lush gardens. The flexible installment plan made acquiring our weekend farmhouse effortless.',
      rating: 5,
    },
  ],
  faqs: [
    {
      id: 1,
      question: 'What plot sizes and categories are available at Lake Valley Flower City?',
      answer: 'We offer residential plots in 3, 5, 7, and 10 katha sizes, duplex villa plots, eco-agro farmhouse plots, and commercial units in Commercial Bangla Tower. Each sector is master-planned with parks, schools, mosques, and wide RCC internal roads.',
    },
    {
      id: 2,
      question: 'How do I schedule a guided site visit from Dhaka?',
      answer: 'We arrange complimentary guided site visits every Friday and Saturday from our Bashundhara R/A and Malibagh corporate offices. You can book directly via our online form, by calling +880 1806 42 59 61, or via WhatsApp.',
    },
    {
      id: 3,
      question: 'What is the legal status of the land and documentation?',
      answer: 'All land is 100% owned by Lake Valley Duplex & Resort Ltd. with verified CS, SA, RS, and BS records. All plots are demarcated on the master plan with immediate registration and mutation support upon payment completion.',
    },
    {
      id: 4,
      question: 'What payment schedules and installment options are offered?',
      answer: 'We provide flexible installment plans ranging from 24 up to 60/72 monthly installments with an initial down payment (usually 20–30%). Special one-time cash purchase discounts are also available.',
    },
    {
      id: 5,
      question: 'How far is the project from Zero Point / central Dhaka?',
      answer: 'Lake Valley Flower City is conveniently located along the Dhaka-Mawa Expressway corridor, approximately 20–25 minutes drive from Postogola / Jatrabari and easily accessible through the modern 8-lane expressway network.',
    },
    {
      id: 6,
      question: 'Can Non-Resident Bangladeshis (NRBs) purchase and manage plots remotely?',
      answer: 'Yes. We have a dedicated NRB Support Desk providing virtual site walkthroughs, digital documentation, verified international bank remittance guidance, and power of attorney deed management.',
    },
  ],
  booking: {
    steps: [
      { step: 1, title: 'Consultation & Plot Selection', description: 'Choose from 3, 5, 7, or 10 Katha residential, duplex, or commercial plots tailored to your lifestyle and budget.' },
      { step: 2, title: 'Guided On-Site Inspection', description: 'Visit the live township, lakefront promenade, and demarcated boundaries via scheduled transport from our Dhaka office.' },
      { step: 3, title: 'Document & Legal Verification', description: 'Review vetted land records, CS/SA/RS/BS lineage, approved layout plans, and customized flexible installment schedules.' },
      { step: 4, title: 'Allotment, Demarcation & Registration', description: 'Receive your formal allotment letter, physical plot demarcation on ground, and smooth deed handover with complete peace of mind.' },
    ],
    ctaTitle: 'Ready to Own Your Piece of Paradise?',
    ctaSubtitle: 'Schedule a guided site visit or speak with our property advisors today to secure your plot in Bangladesh’s premier eco-township.',
    ctaButtonText: 'Book Site Visit Now',
  },
  stats: {
    siteStats: [
      { id: 1, value: 300, suffix: '+', label: 'Acres Developed', labelBn: 'একর জমি' },
      { id: 2, value: 1200, suffix: '+', label: 'Residential Plots', labelBn: 'আবাসিক প্লট' },
      { id: 3, value: 2000, suffix: '+', label: 'Flower Species', labelBn: 'ফুলের প্রজাতি' },
      { id: 4, value: 5, suffix: '', label: 'Integrated Projects', labelBn: 'প্রকল্প' },
      { id: 5, value: 500, suffix: '+', label: 'Happy Families', labelBn: 'সন্তুষ্ট পরিবার' },
      { id: 6, value: 15, suffix: '+', label: 'Years of Excellence', labelBn: 'বছরের অভিজ্ঞতা' },
    ],
  },
  cta: {
    badge: 'Limited Plots Available',
    title: 'Ready to Own Your Piece of Paradise?',
    titleBn: 'আপনার স্বপ্নের প্লট বেছে নিন',
    subtitle: 'Schedule a guided site visit or speak with our property advisors today to secure your plot in Bangladesh’s premier eco-township.',
    buttonText: 'Book Site Visit Now',
  },
};

export function sanitizeProjectsAndHero(data) {
  if (!data || typeof data !== 'object') return defaultContentState;
  const cleaned = { ...defaultContentState, ...data };

  // If projects is provided as an array, preserve all user edits and ensure valid structure
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    cleaned.projects = data.projects.map((p) => {
      if (!p || typeof p !== 'object') return p;
      return {
        ...p,
        id: p.id || p.slug || `proj-${Date.now()}`,
        slug: p.slug || p.id || 'project',
        title: p.title || 'Untitled Project',
        titleBn: p.titleBn || '',
        tagline: p.tagline || '',
        shortDescription: p.shortDescription || '',
        description: p.description || p.fullDescription || '',
        image: p.image || '',
        heroImage: p.heroImage || p.image || '',
        features: Array.isArray(p.features) ? p.features : [],
        amenities: Array.isArray(p.amenities) ? p.amenities : [],
        stats: p.stats && typeof p.stats === 'object' ? p.stats : {},
        location: p.location || '',
      };
    });
  } else {
    cleaned.projects = defaultContentState.projects;
  }

  // Preserve hero slides and stats
  if (data.hero && typeof data.hero === 'object') {
    cleaned.hero = {
      slides: Array.isArray(data.hero.slides) && data.hero.slides.length > 0
        ? data.hero.slides
        : defaultContentState.hero.slides,
      stats: Array.isArray(data.hero.stats) && data.hero.stats.length > 0
        ? data.hero.stats
        : defaultContentState.hero.stats,
    };
  } else {
    cleaned.hero = defaultContentState.hero;
  }

  return cleaned;
}

const ContentContext = createContext(null);
const LOCAL_CONTENT_KEY = 'lv_managed_content_v3';

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return sanitizeProjectsAndHero(parsed);
        }
      }
    } catch {
      // ignore
    }
    return defaultContentState;
  });
  const [loading, setLoading] = useState(true);
  const lastLocalSaves = useRef({});

  // Sync state to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(content));
    } catch (e) {
      console.warn('LocalStorage content save failed:', e);
    }
  }, [content]);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchContentApi();
      if (res && typeof res === 'object' && Object.keys(res).length > 0) {
        setContent((prev) => {
          // Merge incoming cloud data while protecting any sections saved in the last 8 seconds
          const mergedIncoming = { ...prev };
          const now = Date.now();

          Object.keys(res).forEach((key) => {
            const lastSave = lastLocalSaves.current[key];
            if (lastSave && now - lastSave < 8000) {
              // Section was modified locally within the last 8s, preserve local copy
              return;
            }
            mergedIncoming[key] = res[key];
          });

          const merged = sanitizeProjectsAndHero(mergedIncoming);
          try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to load content from cloud, keeping local state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();

    // Subscribe to real-time live content updates across all browsers/devices
    const unsubscribe = subscribeToContentChanges((liveContent) => {
      if (liveContent && typeof liveContent === 'object' && Object.keys(liveContent).length > 0) {
        setContent((prev) => {
          const now = Date.now();
          const mergedIncoming = { ...prev };

          Object.keys(liveContent).forEach((key) => {
            if (key === 'lastUpdated' || key === 'updatedSection') return;
            const lastSave = lastLocalSaves.current[key];
            // If this section was saved locally less than 8 seconds ago, don't overwrite with listener snapshot
            if (lastSave && now - lastSave < 8000) {
              return;
            }
            mergedIncoming[key] = liveContent[key];
          });

          const merged = sanitizeProjectsAndHero(mergedIncoming);
          try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadContent]);

  const updateSection = useCallback(async (section, newSectionData) => {
    // 1. Record local save timestamp immediately
    lastLocalSaves.current[section] = Date.now();

    // 2. Direct state update immediately
    setContent((prev) => {
      const updated = {
        ...prev,
        [section]: newSectionData,
      };
      try {
        localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 3. Persist to cloud database and backend server
    const res = await updateContentApi({ section, data: newSectionData });
    // Renew timestamp on completion to protect for another 8 seconds
    lastLocalSaves.current[section] = Date.now();

    if (res && res.error) {
      console.warn(`Cloud database sync note for ${section}:`, res.error);
    }
    return res;
  }, []);

  const saveFullContent = useCallback(async (newFullContent) => {
    setContent(newFullContent);
    try {
      localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(newFullContent));
    } catch {
      // ignore
    }
    const res = await updateContentApi(newFullContent);
    return res;
  }, []);

  const resetContent = useCallback(async () => {
    setContent(defaultContentState);
    try {
      localStorage.removeItem(LOCAL_CONTENT_KEY);
      await resetContentApi();
    } catch (err) {
      console.error('Failed to reset content on server:', err);
    }
  }, []);

  const value = {
    content,
    loading,
    updateSection,
    saveFullContent,
    resetContent,
    refreshContent: loadContent,
    // Convenient getters
    site: content.site || defaultContentState.site,
    hero: content.hero || defaultContentState.hero,
    projects: content.projects || defaultContentState.projects,
    about: content.about || defaultContentState.about,
    amenities: content.amenities || defaultContentState.amenities,
    whyChooseUs: content.whyChooseUs || defaultContentState.whyChooseUs,
    testimonials: content.testimonials || defaultContentState.testimonials,
    faqs: content.faqs || defaultContentState.faqs,
    cta: content.cta || defaultContentState.cta,
    booking: content.booking || defaultContentState.booking,
    stats: content.stats || defaultContentState.stats,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return ctx;
}
