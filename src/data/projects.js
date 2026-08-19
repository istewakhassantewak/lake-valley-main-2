/** Project portfolio data — strictly the 4 official flagship projects */

export const projects = [
  {
    id: 'lake-valley-flower-city',
    slug: 'lake-valley-flower-city',
    title: 'Lake Valley Flower City',
    titleBn: 'লেক ভ্যালি ফ্লাওয়ার সিটি',
    tagline: 'The Heart of the Integrated Township',
    shortDescription:
      'A trusted residential destination where riverside serenity meets wide roads and modern civic amenities — your dream address awaits.',
    description:
      'Lake Valley Flower City is the flagship residential zone of our 300-acre integrated eco-township. Surrounded by natural lakes on three sides and adorned with over 2,000 species of flowers across themed blocks, this project offers 3, 5, 7, and 10 katha plots with dedicated schools, playgrounds, mosques, and green corridors for complete community living.',
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
    shortDescription:
      'Stylish duplex villas designed for modern families, offering private gardens, architectural elegance, and lakeside serenity.',
    description:
      'Lake Valley Duplex City & Resort Limited features premium two-story luxury villas within Lake Valley Flower City, combining spacious living, contemporary architecture, and proximity to the sports club, boarding school, convention hall, and community facilities.',
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
    shortDescription:
      'A lakeside resort destination offering premium accommodation, recreational facilities, and high-yield hospitality investment.',
    description:
      'Lake Valley Green Garden Resort is the hospitality crown of Lake Valley Flower City. Set against a backdrop of lush botanical gardens and serene water bodies, the resort features luxury suites, fine dining, event spaces, swimming pools, and wellness facilities.',
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
    shortDescription:
      'Premium commercial spaces positioned for business growth, retail outlets, corporate offices, and strong rental yields.',
    description:
      'Lake Valley Bangla Tower offers modern retail spaces, corporate offices, and banking units facing the main highway corridor near BASIC Chemical Industrial City and Printing Industrial City. The project is designed for businesses and investors seeking prime location advantages and long-term commercial value.',
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
];

export function getProjectBySlug(slug) {
  // Support both new slugs and legacy slugs
  return projects.find((p) => 
    p.slug === slug || 
    p.id === slug ||
    (slug === 'duplex-city' && p.id === 'lake-valley-duplex-city') ||
    (slug === 'green-garden-resort' && p.id === 'lake-valley-green-garden-resort') ||
    (slug === 'commercial-bangla-tower' && p.id === 'lake-valley-bangla-tower')
  );
}
