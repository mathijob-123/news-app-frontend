export type NewsCategory =
  | 'all'
  | 'traffic'
  | 'weather'
  | 'civic'
  | 'community'
  | 'business'
  | 'safety'
  | 'sports'
  | 'other';

export type CreatorTier = 'bronze' | 'silver' | 'gold';

export type AdminReviewStatus =
  | 'pending_review'
  | 'verified_approved'
  | 'bounty_awarded'
  | 'rejected';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  placeName: string;
  neighborhood?: string;
  district?: string;
  pincode?: string;
  radiusMeters?: number;
}

export type UserRole = 'user' | 'creator' | 'admin';

export interface User {
  id: string;
  handle: string;
  displayName: string;
  email?: string;
  role: UserRole;
  authProvider?: 'local' | 'google';
  avatar: string;
  bio: string;
  homeLocation: LocationCoordinates;
  isCreator: boolean;
  creatorTier: CreatorTier;
  trustScore: number; // e.g. 98 (%)
  verified: boolean;
  followerCount: number;
  followingCount: number;
  walletId: string;
  onboardingCompleted?: boolean;
  copyrightStrikesCount?: number;
  uploadBlocked?: boolean;
  uploadBlockedReason?: string;
  uploadBlockedAt?: string;
}

export interface RegisterPayload {
  displayName: string;
  handle?: string;
  email: string;
  password: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  wallet?: any;
  message?: string;
  error?: string;
  isAdmin?: boolean;
  isNewUser?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userHandle: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface VideoPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  creatorVerified: boolean;
  type: 'video' | 'image' | 'text';
  mediaUrl: string;
  thumbnailUrl: string;
  headline: string;
  caption: string;
  category: NewsCategory;
  location: LocationCoordinates;
  sourceCitation: string | null;
  durationSeconds: number;
  status: 'draft' | 'in_review' | 'published' | 'removed' | 'copyright_takedown';
  createdAt: string;
  viewCount: number;
  qualifiedViewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isBreaking?: boolean;
  distanceKm?: number; // Calculated relative to viewer location

  // Admin Verification & Payout Engine
  adminReviewStatus?: AdminReviewStatus;
  adminPayoutAmount?: number; // Amount paid in ₹ by Platform Admins
  priceAward?: number; // Price award allocated by admin upon approval in ₹
  rpmRate?: number; // RPM rate allocated by admin (₹ per 1,000 qualified views)
  adminBountyAwarded?: number; // Breaking news bounty bonus paid by Admins
  adminDisbursedDate?: string;
  adminReviewerDesk?: string; // e.g. "Chennai & Tiruvallur Admin Bureau"
  rejectionReason?: string;
}

export interface ViewRecord {
  id: string;
  postId: string;
  viewerSessionId: string;
  watchSeconds: number;
  isQualified: boolean;
  viewerLat?: number;
  viewerLng?: number;
  timestamp: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarnings: number;
  thisMonthEarnings: number;
  nextPayoutDate: string;
  payoutMethod: string | null;
  qualifiedViewsTotal: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'admin_payout' | 'bounty' | 'earning' | 'payout' | 'tip' | 'adjustment';
  amount: number;
  relatedPostId?: string | null;
  relatedPostTitle?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  method?: string;
  adminDesk?: string;
}

export type RadiusFilter = 1 | 5 | 25 | 100; // in km (100 = district-wide)

// 4 navigation tabs (Search accessible from top header/search modal)
export type TabType = 'spots' | 'home' | 'monetization' | 'profile';

export const LOCALPULSE_SCHEMA_VERSION = 3;

export interface AdminStats {
  totalVideosSubmitted: number;
  pendingReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalDisbursedINR: number;
  activeReportersCount: number;
  districtBreakdown: {
    chennai: number;
    tiruvallur: number;
    other: number;
  };
  categoryBreakdown: Record<string, number>;
  approvalRatePercent: number;
}

// Advertisements & App Settings Management
export type AdType = 'image' | 'video' | 'banner';

export type AdPosition =
  | 'after_3' // News 3க்கு பிறகு
  | 'after_5' // News 5க்கு பிறகு
  | 'after_7' // News 7க்கு பிறகு
  | 'interval_3' // ஒவ்வொரு 3 செய்திகளுக்கும் (News 3, News 6, etc.)
  | 'interval_5'; // ஒவ்வொரு 5 செய்திகளுக்கும் (News 5, News 10, etc.)

export interface TargetLocation {
  district: string;
  taluk?: string;
  area?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  advertiserName: string;
  adType: AdType;
  mediaUrl: string;
  thumbnailUrl?: string;
  targetUrl?: string;
  callToAction: string; // e.g. "Learn More", "Call Now", "விவரங்களை அறிக"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  targetLocation: TargetLocation;
  position: AdPosition | string;
  status: 'active' | 'inactive' | 'stopped';
  impressions: number;
  reachLimit?: number | null; // Max impressions/reach cap (null/undefined/0 for unlimited)
  autoStop?: boolean; // Whether to automatically stop campaign when reachLimit is reached (default: true)
  clicks: number;
  createdAt: string;
  updatedAt?: string;
}

// 4 Admin Roles as per requirements:
// Super Admin: Full access
// Editor: News create / edit / publish
// Moderator: Review / approve content
// Ad Manager: Advertisements only ("Advertisements மட்டும்")
export type AdminRoleType = 'super_admin' | 'editor' | 'moderator' | 'ad_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRoleType;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface RolePermissions {
  canReviewPosts: boolean;
  canPublishPosts: boolean;
  canEditPosts: boolean;
  canDisbursePayouts: boolean;
  canManageAds: boolean;
  canManageSettings: boolean;
  canManageAdmins: boolean;
  canViewAnalytics: boolean;
}

export interface AppBrandingSettings {
  appName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  supportEmail: string;
  supportPhone: string;
}

export interface NewsCategorySetting {
  id: string;
  key: string;
  nameTamil: string;
  nameEnglish: string;
  icon: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
}

export interface LocationCoverageSetting {
  districts: Array<{
    name: string;
    taluks: Array<{
      name: string;
      areas: string[];
    }>;
  }>;
  defaultLat: number;
  defaultLng: number;
  defaultRadiusKm: number;
}

export interface NotificationSettings {
  pushAlertsEnabled: boolean;
  breakingNewsAlerts: boolean;
  reportApprovalAlerts: boolean;
  payoutAlerts: boolean;
  soundEnabled: boolean;
  fcmServerKeyConfigured: boolean;
}

export interface AdvertisementSettings {
  globalAdsEnabled: boolean;
  defaultAdPosition: string;
  maxAdsPerSession: number;
  sponsoredBadgeText: string;
  allowThirdPartyNetworks: boolean;
  enableVideoInterstitialInSpots: boolean;
}

export interface SocialMediaImportSettings {
  autoImportEnabled: boolean;
  youtubeChannels: string[];
  twitterHandles: string[];
  instagramPages: string[];
  rssFeeds: string[];
  defaultReviewStatusForImported: 'pending_review' | 'verified_approved';
}

export interface ApiSettings {
  r2Configured: boolean;
  r2Bucket: string;
  r2PublicUrl: string;
  googleOAuthConfigured: boolean;
  googleClientId: string;
  dbConfigured: boolean;
  webhookUrl?: string;
}

export interface AppSettings {
  branding: AppBrandingSettings;
  categories: NewsCategorySetting[];
  locations: LocationCoverageSetting;
  notifications: NotificationSettings;
  advertisements: AdvertisementSettings;
  socialImport: SocialMediaImportSettings;
  api: ApiSettings;
  adminUsers: AdminUser[];
}

export type SocialPlatform = 'youtube' | 'twitter' | 'instagram' | 'facebook' | 'rss';
export type ImportStatus = 'staged_pending' | 'approved_published' | 'rejected';

export interface SocialMediaPost {
  id: string;
  platform: SocialPlatform;
  sourceHandle: string;
  sourceName: string;
  sourceAvatar?: string;
  sourceUrl: string;
  externalPostId: string;
  mediaType: 'video' | 'image' | 'text';
  mediaUrl: string;
  thumbnailUrl: string;
  rawTitle: string;
  rawContent: string;
  publishedAt: string;
  importedAt: string;

  // AI Editorial Refinements
  aiHeadline?: string;
  aiSummary?: string;
  aiCategory?: NewsCategory;
  aiLocation?: LocationCoordinates;
  aiKeywords?: string[];
  aiProcessed: boolean;

  // Duplicate Detection
  isDuplicate: boolean;
  duplicateScore?: number; // 0 to 100
  duplicateMatchedPostId?: string;
  duplicateMatchedTitle?: string;

  // Strict Editorial Review Workflow (No direct publishing)
  status: ImportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedPostId?: string;
  rejectionReason?: string;
}

// Copyright Strike & Moderation Types
export type CopyrightReportStatus = 'pending' | 'approved' | 'rejected' | 'retracted';
export type CopyrightStrikeStatus = 'active' | 'expired' | 'revoked';

export interface CopyrightReport {
  id: string;
  postId: string;
  postTitle?: string;
  postMediaUrl?: string;
  postThumbnailUrl?: string;
  postCreatorId?: string;
  postCreatorName?: string;
  postCreatorHandle?: string;
  reporterUserId?: string;
  claimantName: string;
  claimantEmail: string;
  claimantRelation: 'owner' | 'authorized_agent';
  originalWorkTitle: string;
  originalWorkUrl?: string;
  infringementType: 'full_video' | 'audio_track' | 'visual_clip' | 'thumbnail';
  infringementTimestamp?: string;
  description: string;
  status: CopyrightReportStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CopyrightStrike {
  id: string;
  userId: string;
  userName?: string;
  userHandle?: string;
  reportId?: string;
  postId: string;
  postTitle?: string;
  strikeNumber: number; // 1, 2, 3
  reason: string;
  claimantName?: string;
  status: CopyrightStrikeStatus;
  expiresAt: string; // 90 days from creation
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'copyright_strike'
  | 'strike_warning'
  | 'upload_blocked'
  | 'strike_revoked'
  | 'report_status'
  | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================================================
// SPOTLIGHT 360 & BULK VIDEO UPLOAD MODELS
// ============================================================================
export type Spotlight360SubTab =
  | 'dashboard'
  | 'videos'
  | 'bulk_upload'
  | 'scheduled'
  | 'active'
  | 'location_targeting'
  | 'campaigns'
  | 'analytics';

export type SpotlightRadiusKm = 1 | 3 | 5 | 10 | 25;

export interface Spotlight360Location {
  area: string;
  city: string;
  district: string;
  pincode?: string;
  lat: number;
  lng: number;
  radiusKm: SpotlightRadiusKm;
}

export interface Spotlight360Cta {
  type: 'learn_more' | 'call_now' | 'shop_now' | 'visit_location' | 'whatsapp' | 'order_now';
  label: string;
  actionUrl: string;
  phone?: string;
}

export interface Spotlight360Video {
  id: string;
  title: string;
  description: string;
  category: NewsCategory | string;
  mediaUrl: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  location: Spotlight360Location;
  startDate: string; // YYYY-MM-DD or ISO
  endDate: string; // YYYY-MM-DD or ISO
  campaignName?: string;
  advertiserName?: string;
  cta?: Spotlight360Cta;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired';
  views: number;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkUploadVideoItem {
  id: string;
  file?: File;
  fileName: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  title: string;
  description: string;
  category: NewsCategory | string;
  mediaUrl: string;
  thumbnailUrl: string;
  location: Spotlight360Location;
  startDate: string;
  endDate: string;
  campaignName: string;
  cta: Spotlight360Cta;
  status: 'draft' | 'scheduled' | 'active';
  uploadProgress: number; // 0 to 100
  uploadStage: 'idle' | 'uploading' | 'processing' | 'thumbnail' | 'ready' | 'error';
  errorMessage?: string;
}


