const fs = require('fs');
const path = require('path');

const contentFilePath = path.join(__dirname, '../data/content.json');

const defaultContent = {
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
        title: 'Green Garden Resort',
        titleBn: 'গ্রীন গার্ডেন রিসোর্ট',
        subtitle: 'Luxury Amidst Nature',
        description: 'Escape to a serene resort destination within the township — featuring lakeside views, premium hospitality, and world-class recreational facilities.',
        image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
        cta: 'Discover Resort',
        ctaLink: '/projects/green-garden-resort',
      },
      {
        id: 3,
        title: 'Duplex City',
        titleBn: 'ডুপ্লেক্স সিটি',
        subtitle: 'Elevated Family Living',
        description: 'Spacious duplex villas designed for modern families, combining architectural elegance with the tranquility of lakeside township living.',
        image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
        cta: 'View Duplexes',
        ctaLink: '/projects/duplex-city',
      },
      {
        id: 4,
        title: 'Commercial Bangla Tower',
        titleBn: 'বাংলা টাওয়ার',
        subtitle: 'Prime Business Destination',
        description: 'Strategic commercial spaces positioned near industrial zones — offering exceptional rental yields and long-term investment potential.',
        image: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
        cta: 'Invest Now',
        ctaLink: '/projects/commercial-bangla-tower',
      },
    ],
    stats: [
      { value: 300, suffix: '+', label: 'Acres of Land' },
      { value: 2000, suffix: '+', label: 'Flower Species' },
      { value: 5, suffix: '', label: 'Major Projects' },
      { value: 15, suffix: '+', label: 'Years Vision' },
    ],
  },
  projects: [
    {
      id: 'lake-valley-flower-city',
      slug: 'lake-valley-flower-city',
      title: 'Lake Valley Flower City',
      titleBn: 'লেক ভ্যালি ফ্লাওয়ার সিটি',
      tagline: 'The Heart of the Township',
      shortDescription: 'A trusted residential destination where riverside serenity meets wide roads and modern civic amenities — your dream address awaits.',
      description: 'Lake Valley Flower City is the flagship residential zone of our 300-acre integrated township. Surrounded by natural lakes on three sides and adorned with over 2,000 species of flowers across themed blocks, this project offers 3, 5, 7, and 10 katha plots with dedicated schools, playgrounds, mosques, and green corridors for complete community living.',
      image: 'https://lakevalleyflowercity.com/uploads/pages/1745397003_76929.jpeg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      features: [
        '3, 5, 7 & 10 katha plots',
        '2000+ flower species and lakeside greenery',
        'Dedicated schools, playgrounds & mosques',
        'Wide internal roads & civic amenities',
        'Resort and commercial zones',
        'Secure gated community',
      ],
      amenities: ['Park', 'Lake View', 'Mosque', 'School', 'Sports Club', 'Wide Roads'],
      stats: { area: '180 Acres', plots: '1200+', startingPriceUSD: 25000, pricePerKathaUSD: 8500 },
      location: 'Near Dhaka, Bangladesh — adjacent to BASIC Chemical Industrial City',
      featured: true,
    },
    {
      id: 'duplex-city',
      slug: 'duplex-city',
      title: 'Duplex City',
      titleBn: 'লেক ভ্যালি ডুপ্লেক্স সিটি',
      tagline: 'Premium Duplex Living',
      shortDescription: 'Stylish duplex villas designed for modern families, offering private gardens and easy access to township amenities.',
      description: 'Duplex City features premium two-story villas within Lake Valley Flower City, combining spacious living, contemporary architecture, and proximity to the sports club, boarding school, convention hall, and community facilities.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      features: [
        'Two-story premium villas',
        'Private garden spaces',
        'Modern architectural design',
        'Gated community security',
        'Close to sports club & school',
        'Family-friendly living',
      ],
      amenities: ['Private Garden', 'Parking', 'Security', 'Club Access', 'Lake Proximity'],
      stats: { area: '45 Acres', plots: '200+', startingPriceUSD: 65000, pricePerKathaUSD: 13000 },
      location: 'Within Lake Valley Flower City master plan',
      featured: true,
    },
    {
      id: 'green-garden-resort',
      slug: 'green-garden-resort',
      title: 'Green Garden Resort',
      titleBn: 'গ্রীন গার্ডেন রিসোর্ট',
      tagline: 'Hospitality Redefined',
      shortDescription: 'Lakeside resort destination with studio apartments, luxury villas, and recreational facilities.',
      description: 'Green Garden Resort offers studio apartments and luxury holiday homes integrated into Lake Valley Flower City. Guests and owners enjoy lakeside dining, swimming pools, convention hall access, and organic garden views.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      features: [
        'Studio apartments & luxury villas',
        'Lakeside restaurant & dining',
        'Convention hall for events',
        'Swimming pool & recreation',
        'Organic garden surroundings',
        'Rental income management option',
      ],
      amenities: ['Resort Pool', 'Convention Hall', 'Restaurant', 'Lake View', 'Housekeeping'],
      stats: { area: '30 Acres', plots: '150 Units', startingPriceUSD: 35000, pricePerKathaUSD: 10000 },
      location: 'Resort Zone, Lake Valley Flower City',
      featured: true,
    },
    {
      id: 'commercial-bangla-tower',
      slug: 'commercial-bangla-tower',
      title: 'Commercial Bangla Tower',
      titleBn: 'বাংলা টাওয়ার',
      tagline: 'Prime Business Destination',
      shortDescription: 'Modern commercial tower offering retail, office, and bank spaces near major industrial zones.',
      description: 'Commercial Bangla Tower is a high-yield commercial property situated strategically near BASIC Chemical Industrial City and Printing Industrial City. Features modern elevators, ample parking, 24/7 power backup, and high footfall location.',
      image: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/pages/1784711067_90986.jpeg',
      features: [
        'Retail shops, bank spaces & offices',
        'High footfall commercial location',
        'Modern elevators & 24/7 power backup',
        'Ample basement & surface parking',
        'High rental yield potential',
        'Near industrial hub corridor',
      ],
      amenities: ['Elevators', 'Power Backup', 'Security', 'Parking', 'Fire Safety'],
      stats: { area: '15 Acres', plots: '80 Outlets', startingPriceUSD: 45000, pricePerKathaUSD: 15000 },
      location: 'Commercial Zone — Main Entrance Road',
      featured: true,
    },
    {
      id: 'eco-agro-tourism',
      slug: 'eco-agro-tourism',
      title: 'Eco Agro Tourism',
      titleBn: 'ইকো এগ্রো ট্যুরিজম',
      tagline: 'Sustainable Agriculture & Leisure',
      shortDescription: 'Farmhouses, organic orchards, and agro-based recreational activities within the township.',
      description: 'Eco Agro Tourism blends organic farming, flower cultivation, fish farming, and weekend farmhouses. Owners enjoy organic produce, scenic nature walks, and passive income from agro-based tourism.',
      image: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062793_98940.jpg',
      heroImage: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062793_98940.jpg',
      features: [
        'Organic orchards & flower gardens',
        'Weekend farmhouse plots',
        'Agro-based tourism attractions',
        'Fishery & organic produce',
        'Peaceful countryside atmosphere',
        'Sustainable eco-investment',
      ],
      amenities: ['Organic Farming', 'Fishery', 'Farmhouse Plots', 'Guided Tours', 'Nature Trails'],
      stats: { area: '30 Acres', plots: '100 Plots', startingPriceUSD: 20000, pricePerKathaUSD: 7000 },
      location: 'Agro Zone, Northern Perimeter',
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
      name: 'Christen Johns',
      role: 'Teacher',
      avatar: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062773_63428.jpg',
      quote: 'Lake Valley Flower City exceeded every expectation. The floral landscapes, lake views, and thoughtful planning make it the ideal place to raise a family. Our investment has already appreciated significantly.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Perfect Piller',
      role: 'Director',
      avatar: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062793_98940.jpg',
      quote: 'The commercial spaces at Bangla Tower have delivered outstanding rental returns. The team\'s transparency and professional approach made the entire purchase process seamless and trustworthy.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Excellent World',
      role: 'CEO',
      avatar: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062826_00838.jpg',
      quote: 'Green Garden Resort is a hidden gem. We hosted our corporate retreat here and the experience was world-class. The integration of resort living within a residential township is truly innovative.',
      rating: 5,
    },
    {
      id: 4,
      name: 'Mudhisheba',
      role: 'Executive',
      avatar: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785062843_47538.jpg',
      quote: 'The Eco Agro Tourism project allowed us to build our dream farmhouse while generating organic produce income. It\'s a unique concept that blends lifestyle with sustainable business.',
      rating: 5,
    },
    {
      id: 5,
      name: 'Dreambrigus',
      role: 'Manager',
      avatar: 'https://lakevalleyflowercity.com/uploads/gallery-images/1785063337_15794.jpg',
      quote: 'We\'ve been part of Lake Valley Flower City for over a year now. The infrastructure development, security, and community atmosphere continue to impress us every single day.',
      rating: 5,
    },
  ],
  faqs: [
    {
      id: 1,
      question: 'What plot sizes are available at Lake Valley Flower City?',
      answer: 'We offer residential plots in 3, 5, 7, and 10 katha sizes. Each plot is part of a master-planned township with parks, schools, mosques, and modern civic amenities.',
    },
    {
      id: 2,
      question: 'How do I book a site visit?',
      answer: 'You can book a site visit by filling out the booking form on our website, calling +880 1806 42 59 61, or sending a WhatsApp message. Our sales team will schedule your guided visit and share project details promptly.',
    },
    {
      id: 3,
      question: 'Is the project legally approved?',
      answer: 'Yes, Lake Valley Flower City is an approved and documented project by Lake Valley Duplex & Resort Ltd. All plots are delivered with proper mutation and registration support.',
    },
    {
      id: 4,
      question: 'What payment plans are available?',
      answer: 'Flexible installment plans are available across our projects. Contact our sales team for current availability, pricing, and a tailored payment schedule that suits your needs.',
    },
    {
      id: 5,
      question: 'What makes this project different from others?',
      answer: 'Lake Valley Flower City is Bangladesh’s first integrated township combining residential plots, duplex villas, resort living, agro tourism, commercial spaces, sports club, international boarding school, and convention hall across a 300-acre master plan.',
    },
    {
      id: 6,
      question: 'Can I invest in commercial spaces?',
      answer: 'Yes — Commercial Bangla Tower offers premium retail and office spaces near BASIC Chemical Industrial City and Printing Industrial City, making it a strong investment opportunity with excellent rental potential.',
    },
  ],
  booking: {
    steps: [
      { step: 1, title: 'Choose Your Project', description: 'Browse our integrated township offerings and select the project that matches your lifestyle or investment goals.' },
      { step: 2, title: 'Schedule a Site Visit', description: 'Book a guided tour of Lake Valley Flower City and experience the master-planned community firsthand.' },
      { step: 3, title: 'Select Plot or Unit', description: 'Pick from available residential plots, duplex units, or commercial spaces with flexible sizing options.' },
      { step: 4, title: 'Complete Registration', description: 'Finalize documentation with our transparent process and secure your property with confidence.' },
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
};

function readContent() {
  try {
    if (!fs.existsSync(contentFilePath)) {
      fs.writeFileSync(contentFilePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
      return defaultContent;
    }
    const raw = fs.readFileSync(contentFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...defaultContent, ...parsed };
  } catch (err) {
    console.error('Error reading content.json, falling back to defaults:', err);
    return defaultContent;
  }
}

function writeContent(data) {
  try {
    fs.writeFileSync(contentFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing content.json:', err);
  }
}

exports.getContent = async (req, res) => {
  try {
    const data = readContent();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const existing = readContent();
    const updates = req.body;

    let updated;
    if (updates.section && updates.data) {
      // Partial update by section name, e.g. { section: 'site', data: {...} }
      updated = {
        ...existing,
        [updates.section]: updates.data,
      };
    } else {
      // Full content update
      updated = {
        ...existing,
        ...updates,
      };
    }

    writeContent(updated);
    res.json({ success: true, message: 'Content updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetContent = async (req, res) => {
  try {
    writeContent(defaultContent);
    res.json({ success: true, message: 'Content reset to defaults', data: defaultContent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
