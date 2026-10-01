export type MarketplaceCategory =
  | 'mobiles'
  | 'electronics'
  | 'vehicles'
  | 'furniture'
  | 'fashion'
  | 'home_kitchen'
  | 'property'
  | 'services';

export type ProductCondition = 'Brand New' | 'Like New' | 'Good' | 'Fair';

export interface ProductSeller {
  id: string;
  name: string;
  avatar: string;
  joinedDate: string;
  verified: boolean;
  phone: string;
  whatsapp: string;
  email: string;
  rating?: number;
  totalListings?: number;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  priceNegotiable: boolean;
  category: MarketplaceCategory;
  condition: ProductCondition;
  description: string;
  location: string;
  distanceKm?: number;
  postedAt: string;
  viewsCount: number;
  images: string[];
  specs: {
    brand?: string;
    model?: string;
    storage?: string;
    condition?: string;
    warranty?: string;
    year?: string;
    kmDriven?: string;
    fuel?: string;
    [key: string]: string | undefined;
  };
  seller: ProductSeller;
  status: 'active' | 'sold' | 'expired' | 'paused' | 'pending';
  isFavorite?: boolean;
  isMine?: boolean;
}

export type JobCategory =
  | 'IT & Software'
  | 'Sales'
  | 'Marketing'
  | 'Finance'
  | 'HR'
  | 'Customer Support'
  | 'Education'
  | 'Healthcare'
  | 'Engineering';

export type JobType = 'Full Time' | 'Part Time' | 'Contract' | 'Remote' | 'Internship';

export interface MarketplaceJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary: string;
  jobType: JobType;
  experience: string;
  category: JobCategory;
  postedAt: string;
  description: string;
  requirements: string[];
  skills: string[];
  contactEmail: string;
  contactPhone?: string;
  applicantCount: number;
  isSaved?: boolean;
}

export type PropertyListingType = 'Buy' | 'Rent' | 'Sell' | 'Lease' | 'PG' | 'Commercial' | 'Land' | 'New Projects';

export type PropertyCategory = 'Residential' | 'Commercial' | 'Land / Plot' | 'New Project';

export type PropertyType =
  | 'Apartment'
  | 'Independent House'
  | 'Villa'
  | 'Flat'
  | 'PG'
  | 'Office'
  | 'Shop'
  | 'Showroom'
  | 'Warehouse'
  | 'Commercial Building'
  | 'Residential Plot'
  | 'Agricultural Land'
  | 'Commercial Plot'
  | 'Plot'
  | 'Commercial Office'
  | 'Luxury Highrise'
  | 'Gated Community'
  | 'Integrated Township';

export interface MarketplaceProperty {
  id: string;
  propertyId?: string;
  sellerId?: string;
  title: string;
  price: string;
  numericPrice?: number;
  priceUnit?: 'month' | 'total';
  listingType: PropertyListingType;
  propertyCategory?: PropertyCategory;
  propertyType: PropertyType;
  location: string;
  area?: number;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  furnishing?: string;
  propertyAge?: string;
  floor?: string;
  totalFloors?: string;
  parking?: string;
  description: string;
  sellerType?: 'Owner' | 'Agent' | 'Builder';
  contactName?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  photos?: string[];
  videos?: string[];
  coverImage?: string;
  images: string[];
  isVerified?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  postedAt?: string;
  specifications?: {
    furnishing: string;
    facing?: string;
    floor?: string;
    parking?: string;
    carpetArea?: string;
    superArea?: string;
    availableFrom?: string;
  };
  owner: {
    name: string;
    role: 'Owner' | 'Agent' | 'Builder';
    phone: string;
    whatsapp: string;
    verified: boolean;
    avatar?: string;
    agencyName?: string;
  };
  isSaved?: boolean;
}

export interface SellerChatMessage {
  id: string;
  productId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface PostAdFormData {
  category: MarketplaceCategory;
  title: string;
  price: number;
  priceNegotiable: boolean;
  condition: ProductCondition;
  description: string;
  location: string;
  brand?: string;
  model?: string;
  storage?: string;
  warranty?: string;
  images: string[];
  videoUrl?: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsApp: string;
  sellerEmail: string;
  hideExactLocation?: boolean;
}
