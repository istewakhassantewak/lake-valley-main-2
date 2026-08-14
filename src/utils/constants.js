/** Global site constants for Lake Valley Flower City */

export const SITE_NAME = 'Lake Valley Flower City';
export const SITE_NAME_BN = 'লেক ভ্যালি ফ্লাওয়ার সিটি';
export const COMPANY_NAME = 'Lake Valley Duplex & Resort Ltd.';
export const TAGLINE = 'Where Nature Meets Modern Living';

export const CONTACT = {
  phone: '+880 1806 42 59 61',
  phoneSecondary: '+880 1806 42 59 62',
  phones: ['+880 1806 42 59 61', '+880 1806 42 59 62', '+880 1806 42 59 63', '+880 1806 42 59 64'],
  phoneRaw: '+8801806425961',
  email: 'info@lakevalleyflowercity.com',
  website: 'https://www.lakevalleyflowercity.com',
  headOffice: 'JCX Business Tower, Plot # 1136/A (5th Floor), Block # I, Japan Street, Bashundhara R/A, Dhaka-1229, Bangladesh',
  corporateOffice: '3/2 Outer Circular Road, Proshanti Heights, Levels 2, 3 & 4, Malibagh, Dhaka-1217, Bangladesh',
  address: 'JCX Business Tower, Plot # 1136/A (5th Floor), Block # I, Japan Street, Bashundhara R/A, Dhaka-1229, Bangladesh',
  whatsapp: '8801806425961',
  hours: '9:30 AM – 6:30 PM (Sat – Thu)',
};

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/lakevalleyflowercity',
  instagram: 'https://instagram.com/lakevalleyflowercity',
  youtube: 'https://www.youtube.com/@LakeValleyGroup',
  linkedin: 'https://linkedin.com/company/lakevalleyflowercity',
};

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export const PLOT_SIZES = ['3 Katha', '5 Katha', '7 Katha', '10 Katha'];

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&z=15&output=embed`;

export const BOOKING_STEPS = [
  {
    step: 1,
    title: 'Consultation & Plot Selection',
    description: 'Choose from 3, 5, 7, or 10 Katha residential, duplex, or commercial plots tailored to your lifestyle and budget.',
  },
  {
    step: 2,
    title: 'Guided On-Site Inspection',
    description: 'Visit the live township, lakefront promenade, and demarcated boundaries via scheduled transport from our Dhaka office.',
  },
  {
    step: 3,
    title: 'Document & Legal Verification',
    description: 'Review vetted land records, CS/SA/RS/BS lineage, approved layout plans, and customized flexible installment schedules.',
  },
  {
    step: 4,
    title: 'Allotment, Demarcation & Registration',
    description: 'Receive your formal allotment letter, physical plot demarcation on ground, and smooth deed handover with complete peace of mind.',
  },
];
