import {
  MarketplaceProduct,
  MarketplaceJob,
  MarketplaceProperty,
  SellerChatMessage,
  PostAdFormData
} from '../types/marketplace';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

/**
 * Compresses an uploaded image file into a permanent, high-quality base64 Data URL.
 * Works 100% offline and stays valid across page reloads (unlike temporary blob: URLs).
 */
export async function compressImageToBase64(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  // If video, read as standard data URL
  if (file.type && file.type.includes('video')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image or video directly to Cloudflare R2 bucket via server endpoint
 * If R2 is not configured or fails, falls back to a permanent compressed base64 data URL
 * so images NEVER break on page reload.
 */
export async function uploadMarketplaceMediaToR2(
  file: File | Blob,
  filename?: string,
  folder: 'marketplace' | 'realestate' | 'jobs' = 'marketplace'
): Promise<string> {
  try {
    const fileBase64 = await compressImageToBase64(file);
    const name = filename || (file instanceof File ? file.name : `media_${Date.now()}.${file.type?.includes('video') ? 'mp4' : 'jpg'}`);

    const res = await fetch(`${API_BASE}/upload/direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: name,
        contentType: file.type || (file.type?.includes('video') ? 'video/mp4' : 'image/jpeg'),
        fileBase64,
        folder
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.publicUrl) {
        return data.publicUrl;
      }
    }
    // If backend direct upload fails, fallback to permanent base64 URL
    return fileBase64;
  } catch (err: any) {
    console.warn('[Cloudflare R2 direct upload failed, fallback to persistent base64]:', err.message);
    return compressImageToBase64(file);
  }
}

const STORAGE_KEYS = {
  PRODUCTS: 'localplus_marketplace_products_v1',
  JOBS: 'localplus_marketplace_jobs_v1',
  PROPERTIES: 'localplus_marketplace_properties_v1',
  CHAT_MESSAGES: 'localplus_marketplace_chats_v1',
  SAVED_ITEMS: 'localplus_marketplace_saved_v1'
};

export const INITIAL_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-iphone15',
    title: 'iPhone 15 (256GB)',
    price: 62000,
    priceNegotiable: true,
    category: 'mobiles',
    condition: 'Like New',
    description:
      'iPhone 15 256GB, original box with charger. Excellent condition, no scratches. Bill available. Battery health 98%. Price slightly negotiable for immediate buyers.',
    location: 'Andheri West, Mumbai',
    distanceKm: 1.2,
    postedAt: '2 days ago',
    viewsCount: 13,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Apple',
      model: 'iPhone 15',
      storage: '256 GB',
      condition: 'Like New',
      warranty: 'Yes (8 months left)'
    },
    seller: {
      id: 'seller-rohit',
      name: 'Rohit Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Jan 2024',
      verified: true,
      phone: '+91 98201 54321',
      whatsapp: '919820154321',
      email: 'rohit.sharma@example.com',
      rating: 4.9,
      totalListings: 4
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  },
  {
    id: 'prod-s23',
    title: 'Samsung Galaxy S23',
    price: 58000,
    priceNegotiable: true,
    category: 'mobiles',
    condition: 'Like New',
    description:
      'Samsung Galaxy S23 128GB Phantom Black. Under brand warranty. With official silicon cover and original 25W adapter. Flawless display with screen protector applied.',
    location: 'Bandra, Mumbai',
    distanceKm: 2.5,
    postedAt: '3 days ago',
    viewsCount: 28,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Samsung',
      model: 'Galaxy S23',
      storage: '128 GB',
      condition: 'Like New',
      warranty: 'Yes (5 months left)'
    },
    seller: {
      id: 'seller-priya',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Mar 2023',
      verified: true,
      phone: '+91 98202 88412',
      whatsapp: '919820288412',
      email: 'priya.patel@example.com',
      rating: 4.8,
      totalListings: 2
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  },
  {
    id: 'prod-macbook-m1',
    title: 'MacBook Air M1',
    price: 72000,
    priceNegotiable: false,
    category: 'electronics',
    condition: 'Like New',
    description:
      'MacBook Air M1 Space Grey, 8GB RAM, 256GB SSD. Battery cycle count only 42. Comes with magnetic sleeve and 30W Apple USB-C charger. No dents or keyboard shine.',
    location: 'Powai, Mumbai',
    distanceKm: 4.1,
    postedAt: '5 days ago',
    viewsCount: 45,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Apple',
      model: 'MacBook Air M1',
      storage: '256 GB SSD',
      condition: 'Like New',
      warranty: 'Out of warranty'
    },
    seller: {
      id: 'seller-amit',
      name: 'Amit Verma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Jun 2023',
      verified: true,
      phone: '+91 98203 99123',
      whatsapp: '919820399123',
      email: 'amit.verma@example.com',
      rating: 5.0,
      totalListings: 1
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  },
  {
    id: 'prod-activa-6g',
    title: 'Honda Activa 6G',
    price: 78000,
    priceNegotiable: true,
    category: 'vehicles',
    condition: 'Good',
    description:
      'Honda Activa 6G Deluxe model with alloy wheels. Matte Axis Grey Metallic. 12,400 KM driven. Single owner, all periodic services done at authorized Honda center. Insurance valid till 2027.',
    location: 'Borivali, Mumbai',
    distanceKm: 3.0,
    postedAt: '2 days ago',
    viewsCount: 62,
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Honda',
      model: 'Activa 6G DLX',
      year: '2023',
      kmDriven: '12,400 KM',
      fuel: 'Petrol',
      condition: 'Excellent'
    },
    seller: {
      id: 'seller-vikram',
      name: 'Vikram Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Nov 2022',
      verified: true,
      phone: '+91 98204 77231',
      whatsapp: '919820477231',
      email: 'vikram.d@example.com',
      rating: 4.7,
      totalListings: 3
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  },
  {
    id: 'prod-office-chair',
    title: 'Ergonomic High-Back Office Chair',
    price: 8500,
    priceNegotiable: true,
    category: 'furniture',
    condition: 'Like New',
    description:
      'Green Soul ergonomic mesh office chair with adjustable lumbar support, 3D armrests, and synchro-tilt mechanism. Very lightly used for work from home.',
    location: 'Avadi / Ambattur, Chennai',
    distanceKm: 1.8,
    postedAt: '1 day ago',
    viewsCount: 19,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Green Soul',
      model: 'Jupiter Superb',
      condition: 'Like New',
      warranty: '1 year remaining'
    },
    seller: {
      id: 'seller-rajesh',
      name: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Feb 2024',
      verified: true,
      phone: '+91 98401 23456',
      whatsapp: '919840123456',
      email: 'rajesh.k@example.com',
      rating: 4.9,
      totalListings: 2
    },
    status: 'active',
    isFavorite: false,
    isMine: true
  },
  {
    id: 'prod-sony-bravia',
    title: 'Sony Bravia 55" 4K Smart Google TV',
    price: 45000,
    priceNegotiable: true,
    category: 'electronics',
    condition: 'Like New',
    description:
      'Sony Bravia 55-inch 4K Ultra HD Smart LED Google TV (KD-55X74K). Dolby Audio, Apple AirPlay, Chromecast built-in. Pristine condition with wall mount and magic remote.',
    location: 'Ambattur Industrial Estate, Chennai',
    distanceKm: 2.2,
    postedAt: '4 days ago',
    viewsCount: 52,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Sony',
      model: 'KD-55X74K',
      storage: '16 GB ROM',
      condition: 'Like New',
      warranty: 'Extended warranty active'
    },
    seller: {
      id: 'seller-suresh',
      name: 'Suresh R.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Oct 2023',
      verified: true,
      phone: '+91 98402 77112',
      whatsapp: '919840277112',
      email: 'suresh.r@example.com',
      rating: 4.8,
      totalListings: 1
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  },
  {
    id: 'prod-dining-table',
    title: 'Solid Teak Wood 6-Seater Dining Table',
    price: 18000,
    priceNegotiable: true,
    category: 'furniture',
    condition: 'Good',
    description:
      'Genuine CP Teak wood dining set with 6 upholstered chairs and 8mm beveled glass top. Relocating to another city, hence selling at a discount.',
    location: 'Anna Nagar, Chennai',
    distanceKm: 4.8,
    postedAt: '6 days ago',
    viewsCount: 31,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      brand: 'Custom Crafted',
      condition: 'Good',
      warranty: 'N/A'
    },
    seller: {
      id: 'seller-meena',
      name: 'Meena Sundaram',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Jan 2024',
      verified: true,
      phone: '+91 98403 66543',
      whatsapp: '919840366543',
      email: 'meena.s@example.com',
      rating: 4.6,
      totalListings: 2
    },
    status: 'active',
    isFavorite: false,
    isMine: false
  }
];

export const INITIAL_JOBS: MarketplaceJob[] = [
  {
    id: 'job-dev-vedaspark',
    title: 'Software Developer',
    company: 'Vedaspark IT Solution',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    location: 'Chennai',
    salary: '₹3 LPA – ₹6 LPA',
    jobType: 'Full Time',
    experience: '1-3 Years',
    category: 'IT & Software',
    postedAt: '1 day ago',
    description:
      'We are looking for a skilled Software Developer proficient in Modern JavaScript, React.js, and Node.js to join our core development team. You will be building user-facing features, integrating APIs, and collaborating with cross-functional design teams.',
    requirements: [
      "Bachelor's degree in Computer Science, IT, or related fields",
      '1+ years hands-on experience in React, TypeScript, and REST APIs',
      'Knowledge of state management and responsive web development',
      'Good communication and problem-solving skills'
    ],
    skills: ['React.js', 'TypeScript', 'Node.js', 'REST APIs', 'Git'],
    contactEmail: 'careers@vedaspark.com',
    contactPhone: '+91 98409 11223',
    applicantCount: 24,
    isSaved: false
  },
  {
    id: 'job-sales-fmcg',
    title: 'Regional Sales Executive',
    company: 'FMCG Brands Ltd',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80',
    location: 'Ambattur / Avadi, Chennai',
    salary: '₹4 LPA – ₹7 LPA + Incentives',
    jobType: 'Full Time',
    experience: '2-4 Years',
    category: 'Sales',
    postedAt: '2 days ago',
    description:
      'Drive retail distribution and partner channel expansion for premium consumer packaged goods in Chennai North district. Manage distributor relations and monthly volume targets.',
    requirements: [
      'Proven track record in FMCG / retail distribution sales',
      'Must have two-wheeler and valid driving license',
      'Fluent in Tamil and workable English'
    ],
    skills: ['B2B Sales', 'Channel Management', 'Negotiation', 'Territory Planning'],
    contactEmail: 'hr@fmcgbrandsltd.in',
    applicantCount: 18,
    isSaved: false
  },
  {
    id: 'job-mktg-growth',
    title: 'Digital Marketing Specialist',
    company: 'Growth Media Studio',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80',
    location: 'Chennai (Hybrid)',
    salary: '₹4.5 LPA – ₹6.5 LPA',
    jobType: 'Full Time',
    experience: '2-3 Years',
    category: 'Marketing',
    postedAt: '3 days ago',
    description:
      'Manage paid performance campaigns on Meta Ads, Google Ads, and run SEO strategies for growing D2C brands. Analyze conversion funnels and optimize ad ROI.',
    requirements: [
      'Demonstrated expertise in Meta Ads Manager and Google Ads',
      'Strong analytical capabilities with GA4',
      'Experience in creative copywriting and creative briefs'
    ],
    skills: ['Meta Ads', 'Google Ads', 'SEO', 'GA4 Analytics', 'Copywriting'],
    contactEmail: 'hello@growthmediastudio.com',
    applicantCount: 32,
    isSaved: false
  },
  {
    id: 'job-hr-talent',
    title: 'HR Talent Acquisition Lead',
    company: 'CloudByte Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80',
    location: 'Chennai',
    salary: '₹6 LPA – ₹9 LPA',
    jobType: 'Full Time',
    experience: '3-6 Years',
    category: 'HR',
    postedAt: 'Just now',
    description:
      'Lead end-to-end technical recruiting for engineers, product designers, and project managers. Own sourcing pipelines, interview scheduling, and offer rollouts.',
    requirements: [
      'Experience in tech recruitment agency or fast-paced startup',
      'Proficiency with LinkedIn Recruiter and ATS tools',
      'Strong interpersonal and negotiation skills'
    ],
    skills: ['Technical Recruiting', 'Sourcing', 'LinkedIn Recruiter', 'Offer Negotiation'],
    contactEmail: 'talent@cloudbyte.tech',
    applicantCount: 14,
    isSaved: false
  },
  {
    id: 'job-finance-apex',
    title: 'Financial Analyst',
    company: 'Apex FinServ',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80',
    location: 'Chennai',
    salary: '₹5 LPA – ₹8 LPA',
    jobType: 'Full Time',
    experience: '2-5 Years',
    category: 'Finance',
    postedAt: '4 days ago',
    description:
      'Prepare financial models, evaluate business investment opportunities, forecast monthly revenues, and assist senior management with capital allocation decisions.',
    requirements: [
      'MBA in Finance, CA Inter, or CFA Level 1 clearance',
      'Advanced MS Excel and financial modeling proficiency',
      'Attention to detail and presentation clarity'
    ],
    skills: ['Financial Modeling', 'Valuation', 'Excel', 'Forecasting', 'P&L Analysis'],
    contactEmail: 'careers@apexfin.com',
    applicantCount: 29,
    isSaved: false
  },
  {
    id: 'job-cust-support',
    title: 'Customer Support Associate',
    company: 'SwiftServe BPO',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80',
    location: 'Avadi, Chennai',
    salary: '₹2.5 LPA – ₹3.6 LPA',
    jobType: 'Full Time',
    experience: '0-2 Years',
    category: 'Customer Support',
    postedAt: '3 days ago',
    description:
      'Provide inbound customer assistance via phone, email, and live chat for our e-commerce clients. Freshers with good communication skills are welcome to apply.',
    requirements: [
      'Fluency in Tamil and English (written & spoken)',
      'Basic computer literacy and typing speed of 30+ WPM',
      'Willingness to work in rotational shifts'
    ],
    skills: ['Customer Service', 'Communication', 'Zendesk', 'Chat Support'],
    contactEmail: 'support-jobs@swiftserve.in',
    applicantCount: 41,
    isSaved: false
  }
];

export const INITIAL_PROPERTIES: MarketplaceProperty[] = [
  {
    id: 'prop-2bhk-avadi',
    title: '2 BHK Apartment',
    price: '₹28,000/month',
    numericPrice: 28000,
    priceUnit: 'month',
    listingType: 'Rent',
    propertyType: 'Apartment',
    location: 'Avadi / Ambattur, Chennai',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1100,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80'
    ],
    postedAt: '2 days ago',
    description:
      'Spacious and well-ventilated 2 BHK flat in a gated community near Avadi Railway Station and Ambattur IT corridor. Semi-furnished with modular kitchen, wardrobes, LED lighting, and covered car parking.',
    specifications: {
      furnishing: 'Semi-Furnished',
      facing: 'East Facing',
      floor: '3rd of 5 Floors',
      parking: '1 Covered Car + 1 Bike',
      carpetArea: '950 sq.ft',
      superArea: '1100 sq.ft',
      availableFrom: 'Immediately'
    },
    owner: {
      name: 'R. K. Narayanan',
      role: 'Owner',
      phone: '+91 98405 88990',
      whatsapp: '919840588990',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    },
    isSaved: false
  },
  {
    id: 'prop-3bhk-villa',
    title: '3 BHK Luxury Independent Villa',
    price: '₹1.45 Crore',
    numericPrice: 14500000,
    priceUnit: 'total',
    listingType: 'Buy',
    propertyType: 'Villa',
    location: 'Anna Nagar West, Chennai',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2200,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    postedAt: '4 days ago',
    description:
      'Architect-designed duplex luxury villa with private terrace garden, Italian marble flooring, teakwood woodwork, solar power setup, and CMDA approved clear titles.',
    specifications: {
      furnishing: 'Fully Furnished',
      facing: 'North Facing',
      floor: 'G+1 Independent',
      parking: '2 Covered Car Parks',
      carpetArea: '1900 sq.ft',
      superArea: '2200 sq.ft',
      availableFrom: 'Within 15 days'
    },
    owner: {
      name: 'Elite Properties Chennai',
      role: 'Agent',
      phone: '+91 98406 12345',
      whatsapp: '919840612345',
      verified: true,
      agencyName: 'Elite Realty Associates'
    },
    isSaved: false
  },
  {
    id: 'prop-commercial-guindy',
    title: 'Commercial Office Space (2500 sq.ft)',
    price: '₹85,000/month',
    numericPrice: 85000,
    priceUnit: 'month',
    listingType: 'Commercial',
    propertyType: 'Commercial Office',
    location: 'Guindy Industrial Estate, Chennai',
    bedrooms: 0,
    bathrooms: 2,
    areaSqFt: 2500,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ],
    postedAt: '1 week ago',
    description:
      'Plug-and-play modern commercial IT workspace with 35 workstations, 2 conference rooms, server room, high-speed fiber internet, and 100% DG power backup.',
    specifications: {
      furnishing: 'Fully Furnished',
      facing: 'Main Road Facing',
      floor: '2nd Floor',
      parking: '4 Car + 10 Bike Parks',
      carpetArea: '2200 sq.ft',
      superArea: '2500 sq.ft',
      availableFrom: 'Ready to Move'
    },
    owner: {
      name: 'Vasanth Realties',
      role: 'Agent',
      phone: '+91 98407 55443',
      whatsapp: '919840755443',
      verified: true,
      agencyName: 'Vasanth Commercials'
    },
    isSaved: false
  },
  {
    id: 'prop-villa-plot-ambattur',
    title: 'Residential Villa Plot (CMDA Approved)',
    price: '₹42 Lakhs',
    numericPrice: 4200000,
    priceUnit: 'total',
    listingType: 'Land',
    propertyType: 'Plot',
    location: 'Ambattur, Chennai',
    bedrooms: 0,
    bathrooms: 0,
    areaSqFt: 1500,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80'
    ],
    postedAt: '3 days ago',
    description:
      '30x50 East-facing residential land parcel in well-developed layout. Sweet groundwater at 40 feet, 30-feet blacktop roads, streetlights, and gated security.',
    specifications: {
      furnishing: 'Unfurnished',
      facing: 'East Facing',
      floor: 'Plot',
      parking: 'Street Parking',
      carpetArea: '1500 sq.ft',
      superArea: '1500 sq.ft',
      availableFrom: 'Immediate Registration'
    },
    owner: {
      name: 'K. Balaji',
      role: 'Owner',
      phone: '+91 98408 99887',
      whatsapp: '919840899887',
      verified: true
    },
    isSaved: false
  }
];

// Initial preloaded chat message with Rohit Sharma for iPhone 15
export const INITIAL_CHAT_MESSAGES: Record<string, SellerChatMessage[]> = {
  'prod-iphone15': [
    {
      id: 'msg-1',
      productId: 'prod-iphone15',
      senderId: 'seller-rohit',
      senderName: 'Rohit Sharma',
      text: 'Hi there! Thanks for your interest. The iPhone 15 is in pristine condition with bill and box.',
      timestamp: '10:30 AM',
      isMe: false
    }
  ]
};

// STORAGE & SUPABASE HELPERS
export async function fetchProductsFromSupabase(): Promise<MarketplaceProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/marketplace/products`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        saveStoredProducts(data.products);
        return data.products;
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Products Sync Warning]:', err.message);
  }
  return getStoredProducts();
}

export function getStoredProducts(): MarketplaceProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      saveStoredProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const parsed: MarketplaceProduct[] = JSON.parse(raw);
    return parsed.map((p) => ({
      ...p,
      images: (p.images || []).map((img) =>
        img && img.startsWith('blob:')
          ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
          : img
      )
    }));
  } catch (err) {
    console.error('Error loading marketplace products:', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: MarketplaceProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving marketplace products:', err);
  }
}

export function addStoredProduct(formData: PostAdFormData, currentUserId = 'usr_current'): MarketplaceProduct {
  const products = getStoredProducts();
  const newProduct: MarketplaceProduct = {
    id: `prod_${Date.now()}`,
    title: formData.title,
    price: Number(formData.price),
    priceNegotiable: Boolean(formData.priceNegotiable),
    category: formData.category,
    condition: formData.condition,
    description: formData.description,
    location: formData.location || 'Avadi / Ambattur, Chennai',
    distanceKm: 0.5,
    postedAt: 'Just now',
    viewsCount: 1,
    images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    specs: {
      brand: formData.brand || 'Standard',
      model: formData.model || formData.title,
      storage: formData.storage,
      condition: formData.condition,
      warranty: formData.warranty || 'Available'
    },
    seller: {
      id: currentUserId,
      name: formData.sellerName || 'LocalPlus Verified Member',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Current User',
      verified: true,
      phone: formData.sellerPhone || '+91 98765 43210',
      whatsapp: formData.sellerWhatsApp || '919876543210',
      email: formData.sellerEmail || 'user@localplus.in',
      rating: 5.0,
      totalListings: 1
    },
    status: 'active',
    isFavorite: false,
    isMine: true
  };

  const updated = [newProduct, ...products];
  saveStoredProducts(updated);

  // Asynchronously send to Supabase PostgreSQL database
  fetch(`${API_BASE}/marketplace/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct)
  }).catch((err) => {
    console.warn('[Supabase Product POST Warning]:', err.message);
  });

  return newProduct;
}

export function updateStoredProduct(updatedProduct: MarketplaceProduct): MarketplaceProduct {
  const products = getStoredProducts();
  const next = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
  saveStoredProducts(next);

  // Sync update to backend
  fetch(`${API_BASE}/marketplace/products/${updatedProduct.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct)
  }).catch((err) => {
    console.warn('[Backend Product PATCH Warning]:', err.message);
  });

  return updatedProduct;
}

export function deleteStoredProduct(id: string): void {
  const products = getStoredProducts();
  const next = products.filter((p) => p.id !== id);
  saveStoredProducts(next);

  // Sync delete to backend
  fetch(`${API_BASE}/marketplace/products/${id}`, {
    method: 'DELETE'
  }).catch((err) => {
    console.warn('[Backend Product DELETE Warning]:', err.message);
  });
}

export function toggleStoredProductFavorite(id: string): boolean {
  const products = getStoredProducts();
  let nextFavState = false;
  const next = products.map((p) => {
    if (p.id === id) {
      nextFavState = !p.isFavorite;
      return { ...p, isFavorite: nextFavState };
    }
    return p;
  });
  saveStoredProducts(next);
  return nextFavState;
}

export function markStoredProductSold(id: string): void {
  const products = getStoredProducts();
  const next = products.map((p) => (p.id === id ? { ...p, status: 'sold' as const } : p));
  saveStoredProducts(next);
}

export function renewStoredProduct(id: string): void {
  const products = getStoredProducts();
  const next = products.map((p) => (p.id === id ? { ...p, status: 'active' as const, postedAt: 'Just now' } : p));
  saveStoredProducts(next);
}

export function toggleStoredProductPause(id: string): void {
  const products = getStoredProducts();
  const next = products.map((p) => {
    if (p.id === id) {
      const nextStatus = p.status === 'paused' ? 'active' : 'paused';
      return { ...p, status: nextStatus as any };
    }
    return p;
  });
  saveStoredProducts(next);
}

// JOBS STORAGE
export function getStoredJobs(): MarketplaceJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!raw) {
      saveStoredJobs(INITIAL_JOBS);
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading jobs:', err);
    return INITIAL_JOBS;
  }
}

export function saveStoredJobs(jobs: MarketplaceJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.error('Error saving jobs:', err);
  }
}

export function toggleStoredJobSaved(id: string): boolean {
  const jobs = getStoredJobs();
  let nextSaved = false;
  const next = jobs.map((j) => {
    if (j.id === id) {
      nextSaved = !j.isSaved;
      return { ...j, isSaved: nextSaved };
    }
    return j;
  });
  saveStoredJobs(next);
  return nextSaved;
}

// REAL ESTATE STORAGE & SUPABASE HELPERS
export async function fetchPropertiesFromSupabase(): Promise<MarketplaceProperty[]> {
  try {
    const res = await fetch(`${API_BASE}/marketplace/properties`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
        saveStoredProperties(data.properties);
        return data.properties;
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Properties Sync Warning]:', err.message);
  }
  return getStoredProperties();
}

export function getStoredProperties(): MarketplaceProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!raw) {
      saveStoredProperties(INITIAL_PROPERTIES);
      return INITIAL_PROPERTIES;
    }
    const parsed: MarketplaceProperty[] = JSON.parse(raw);
    return parsed.map((prop) => ({
      ...prop,
      images: (prop.images || []).map((img) =>
        img && img.startsWith('blob:')
          ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
          : img
      )
    }));
  } catch (err) {
    console.error('Error loading properties:', err);
    return INITIAL_PROPERTIES;
  }
}

export function saveStoredProperties(properties: MarketplaceProperty[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  } catch (err) {
    console.error('Error saving properties:', err);
  }
}

export function addStoredProperty(property: MarketplaceProperty): MarketplaceProperty {
  const current = getStoredProperties();
  const updated = [property, ...current];
  saveStoredProperties(updated);

  // Sync to Supabase PostgreSQL database
  fetch(`${API_BASE}/marketplace/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property)
  }).catch((err) => {
    console.warn('[Supabase Property POST Warning]:', err.message);
  });

  return property;
}

export function updateStoredProperty(updatedProperty: MarketplaceProperty): void {
  const properties = getStoredProperties();
  const next = properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p));
  saveStoredProperties(next);

  fetch(`${API_BASE}/marketplace/properties/${updatedProperty.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProperty)
  }).catch((err) => {
    console.warn('[Backend Property PATCH Warning]:', err.message);
  });
}

export function deleteStoredProperty(id: string): void {
  const properties = getStoredProperties();
  const next = properties.filter((p) => p.id !== id);
  saveStoredProperties(next);

  fetch(`${API_BASE}/marketplace/properties/${id}`, {
    method: 'DELETE'
  }).catch((err) => {
    console.warn('[Backend Property DELETE Warning]:', err.message);
  });
}

export function toggleStoredPropertySaved(id: string): boolean {
  const properties = getStoredProperties();
  let nextSaved = false;
  const next = properties.map((prop) => {
    if (prop.id === id) {
      nextSaved = !prop.isSaved;
      return { ...prop, isSaved: nextSaved };
    }
    return prop;
  });
  saveStoredProperties(next);
  return nextSaved;
}

// CHAT STORAGE
export function getStoredChatMessages(productId: string): SellerChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const chats: Record<string, SellerChatMessage[]> = raw ? JSON.parse(raw) : INITIAL_CHAT_MESSAGES;
    return chats[productId] || [];
  } catch (err) {
    console.error('Error reading chat messages:', err);
    return INITIAL_CHAT_MESSAGES[productId] || [];
  }
}

export function addStoredChatMessage(productId: string, message: Omit<SellerChatMessage, 'id' | 'timestamp'>): SellerChatMessage {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    const chats: Record<string, SellerChatMessage[]> = raw ? JSON.parse(raw) : { ...INITIAL_CHAT_MESSAGES };
    
    const newMsg: SellerChatMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentList = chats[productId] || [];
    chats[productId] = [...currentList, newMsg];
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chats));
    return newMsg;
  } catch (err) {
    console.error('Error adding chat message:', err);
    return {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: 'Now'
    };
  }
}
