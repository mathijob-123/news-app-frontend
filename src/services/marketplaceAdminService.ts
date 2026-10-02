const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  priceNegotiable: boolean;
  category: string;
  subcategory: string;
  condition: string;
  description: string;
  location: string;
  district: string;
  taluk: string;
  area: string;
  distanceKm: number;
  postedAt: string;
  viewsCount: number;
  savesCount: number;
  enquiriesCount: number;
  whatsappClicks: number;
  contactClicks: number;
  images: string[];
  videoUrl?: string | null;
  specs: Record<string, any>;
  seller: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    whatsapp: string;
    email: string;
    verified: boolean;
    joinedDate?: string;
    rating?: number;
    trustScore?: number;
  };
  status: 'active' | 'pending' | 'sold' | 'expired' | 'suspended' | 'reported' | 'rejected';
  isVerified: boolean;
  reportsCount: number;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  recruiterName: string;
  contactPhone?: string;
  contactEmail: string;
  whatsappNumber?: string;
  location: string;
  district: string;
  area: string;
  salary: string;
  minSalary?: number;
  maxSalary?: number;
  jobType: string;
  experience: string;
  education: string;
  category: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  openingsCount: number;
  postedDate: string;
  expiryDate: string;
  viewsCount: number;
  applicantCount: number;
  savesCount: number;
  reportsCount: number;
  status: 'active' | 'pending' | 'expired' | 'closed' | 'reported' | 'suspended' | 'rejected';
  isVerified: boolean;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProperty {
  id: string;
  title: string;
  price: string;
  numericPrice: number;
  priceUnit: string;
  listingType: string;
  propertyCategory: string;
  propertyType: string;
  location: string;
  district: string;
  taluk: string;
  area: string;
  areaSqFt: number;
  superBuiltUpArea: number;
  plotArea: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: string;
  propertyAge?: string;
  floor?: string;
  totalFloors?: string;
  parking?: string;
  sellerType: string;
  contactName?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  description: string;
  photos: string[];
  videos: string[];
  images: string[];
  coverImage?: string;
  specifications: Record<string, any>;
  owner: {
    name?: string;
    role?: string;
    phone?: string;
    whatsapp?: string;
    verified?: boolean;
    [key: string]: any;
  };
  viewsCount: number;
  savesCount: number;
  enquiriesCount: number;
  whatsappClicks: number;
  contactClicks: number;
  reportsCount: number;
  isVerified: boolean;
  status: 'active' | 'pending' | 'sold' | 'expired' | 'suspended' | 'reported' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMarketplaceUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  createdAt: string;
  verified: boolean;
  trustScore: number;
  olxListingsCount: number;
  jobPostsCount: number;
  propertyPostsCount: number;
  totalViews: number;
  totalEnquiries: number;
  reportsReceived: number;
  accountStatus: 'active' | 'suspended' | 'blocked';
}

export interface AdminMarketplaceReport {
  id: string;
  itemType: 'product' | 'job' | 'property' | 'user';
  itemId: string;
  reportedUserId?: string;
  reporterId?: string;
  reporterName: string;
  reporterContact?: string;
  reason: string;
  description: string;
  status: 'new' | 'under_review' | 'resolved' | 'rejected' | 'escalated';
  assignedModerator: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceStats {
  olx: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    pendingListings: number;
    totalViews: number;
    totalEnquiries: number;
  };
  jobs: {
    totalJobs: number;
    activeJobs: number;
    applications: number;
    expiredJobs: number;
  };
  realEstate: {
    totalProperties: number;
    rentListings: number;
    buyListings: number;
    landListings: number;
    commercialListings: number;
    totalEnquiries: number;
  };
  users: {
    totalUsers: number;
    newUsers: number;
    verifiedUsers: number;
    reportedUsers: number;
  };
  reports: {
    openReports: number;
    resolvedReports: number;
    pendingModeration: number;
  };
}

export const marketplaceAdminService = {
  // PRODUCTS
  async getProducts(params?: { status?: string; category?: string; search?: string }): Promise<AdminProduct[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const res = await fetch(`${API_BASE}/marketplace/admin/products?${qs.toString()}`);
    const data = await res.json();
    return data.products || [];
  },

  async updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
    const res = await fetch(`${API_BASE}/marketplace/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/marketplace/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return Boolean(data.success);
  },

  // JOBS
  async getJobs(params?: { status?: string; category?: string; search?: string }): Promise<AdminJob[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const res = await fetch(`${API_BASE}/marketplace/admin/jobs?${qs.toString()}`);
    const data = await res.json();
    return data.jobs || [];
  },

  async updateJob(id: string, updates: Partial<AdminJob>): Promise<AdminJob> {
    const res = await fetch(`${API_BASE}/marketplace/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.job;
  },

  async deleteJob(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/marketplace/admin/jobs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return Boolean(data.success);
  },

  // PROPERTIES
  async getProperties(params?: { status?: string; listingType?: string; propertyType?: string; search?: string }): Promise<AdminProperty[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.listingType) qs.set('listingType', params.listingType);
    if (params?.propertyType) qs.set('propertyType', params.propertyType);
    if (params?.search) qs.set('search', params.search);
    const res = await fetch(`${API_BASE}/marketplace/admin/properties?${qs.toString()}`);
    const data = await res.json();
    return data.properties || [];
  },

  async updateProperty(id: string, updates: Partial<AdminProperty>): Promise<AdminProperty> {
    const res = await fetch(`${API_BASE}/marketplace/admin/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.property;
  },

  async deleteProperty(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/marketplace/admin/properties/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return Boolean(data.success);
  },

  // USERS
  async getUsers(params?: { status?: string; search?: string }): Promise<AdminMarketplaceUser[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const res = await fetch(`${API_BASE}/marketplace/admin/users?${qs.toString()}`);
    const data = await res.json();
    return data.users || [];
  },

  async getUserActivity(id: string): Promise<{
    userId: string;
    products: any[];
    properties: any[];
    jobs: any[];
    reports: any[];
  }> {
    const res = await fetch(`${API_BASE}/marketplace/admin/users/${id}/activity`);
    const data = await res.json();
    return data.activity || { userId: id, products: [], properties: [], jobs: [], reports: [] };
  },

  async updateUserStatus(id: string, updates: { verified?: boolean; trustScore?: number; accountStatus?: string; reason?: string }): Promise<boolean> {
    const res = await fetch(`${API_BASE}/marketplace/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return Boolean(data.success);
  },

  // REPORTS
  async getReports(params?: { status?: string; itemType?: string; search?: string }): Promise<AdminMarketplaceReport[]> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.itemType) qs.set('itemType', params.itemType);
    if (params?.search) qs.set('search', params.search);
    const res = await fetch(`${API_BASE}/marketplace/admin/reports?${qs.toString()}`);
    const data = await res.json();
    return data.reports || [];
  },

  async updateReport(id: string, updates: Partial<AdminMarketplaceReport>): Promise<AdminMarketplaceReport> {
    const res = await fetch(`${API_BASE}/marketplace/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.report;
  },

  async deleteReport(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/marketplace/admin/reports/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return Boolean(data.success);
  },

  // STATS
  async getStats(): Promise<MarketplaceStats> {
    const res = await fetch(`${API_BASE}/marketplace/admin/stats`);
    const data = await res.json();
    return data.stats;
  }
};
