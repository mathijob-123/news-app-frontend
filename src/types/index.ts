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
  radiusMeters?: number;
}

export interface User {
  id: string;
  handle: string;
  displayName: string;
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
  status: 'draft' | 'in_review' | 'published' | 'removed';
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
