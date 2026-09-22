import type {
  VideoPost,
  User,
  Wallet,
  Transaction,
  Comment,
  LocationCoordinates,
  AdminReviewStatus,
  AdminStats,
  Advertisement,
  AppSettings,
  AdminUser,
  SocialMediaPost,
  CopyrightReport,
  CopyrightStrike,
  AppNotification,
  Spotlight360Video
} from '../types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMENTS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_APP_SETTINGS,
  INITIAL_ADMIN_USERS,
  INITIAL_SOCIAL_IMPORTS,
  INITIAL_COPYRIGHT_REPORTS,
  INITIAL_COPYRIGHT_STRIKES,
  INITIAL_NOTIFICATIONS
} from '../data/mockNewsData';
import { calculatePostEarnings, BASE_RPM } from './monetizationEngine';

const STORAGE_KEYS = {
  POSTS: 'lp_posts_v5_zero_mock',
  USER: 'lp_user_v5_zero_mock',
  WALLET: 'lp_wallet_v5_zero_mock',
  TRANSACTIONS: 'lp_transactions_v5_zero_mock',
  COMMENTS: 'lp_comments_v5_zero_mock',
  SAVED_POSTS: 'lp_saved_posts_v5_zero_mock',
  QUALIFIED_VIEWS: 'lp_qualified_views_v5_zero_mock',
  USER_LOCATION: 'lp_active_location_v5_zero_mock',
  ADS: 'lp_advertisements_v1',
  SETTINGS: 'lp_app_settings_v1',
  ADMIN_USERS: 'lp_admin_users_v1',
  SOCIAL_IMPORTS: 'lp_social_imports_v1',
  COPYRIGHT_REPORTS: 'lp_copyright_reports_v1',
  COPYRIGHT_STRIKES: 'lp_copyright_strikes_v1',
  NOTIFICATIONS: 'lp_user_notifications_v1',
  SPOTLIGHT360_VIDEOS: 'lp_spotlight360_videos_v1',
  CREATORS: 'lp_creators_directory_v1'
};

const VERIFIED_R2_FALLBACKS = [
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789997093458_sk5cm0.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789996953775_f7x7uj.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789995126975_l0csk7.mp4'
];

export function getStoredPosts(): VideoPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const parsed: VideoPost[] = JSON.parse(raw);
    let changed = false;
    const sanitized = parsed.map((p, idx) => {
      const isDeadMedia = !p.mediaUrl || p.mediaUrl.startsWith('blob:') || p.mediaUrl.includes('commondatastorage.googleapis.com');
      if (isDeadMedia && p.type === 'video') {
        changed = true;
        return {
          ...p,
          mediaUrl: VERIFIED_R2_FALLBACKS[idx % VERIFIED_R2_FALLBACKS.length]
        };
      }
      return p;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (err) {
    console.error('Error reading posts:', err);
    return INITIAL_POSTS;
  }
}

export function savePosts(posts: VideoPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving posts:', err);
  }
}

/**
 * Delete a video post / feed item and its comments from local storage
 */
export function deletePost(postId: string): boolean {
  try {
    const posts = getStoredPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    savePosts(filtered);

    // Clean up stored comments for this post if any
    const rawComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (rawComments) {
      try {
        const allComments = JSON.parse(rawComments);
        delete allComments[postId];
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
      } catch {}
    }

    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
    return false;
  }
}

/**
 * Bulk update stored video posts (approve, reject, delete, update properties)
 */
export function bulkUpdateStoredPosts(
  postIds: string[],
  action: 'approve' | 'reject' | 'delete' | 'update',
  updates?: Partial<VideoPost>
): void {
  try {
    const posts = getStoredPosts();
    const idSet = new Set(postIds);

    if (action === 'delete') {
      const remaining = posts.filter((p) => !idSet.has(p.id));
      savePosts(remaining);
      return;
    }

    const updated = posts.map((p) => {
      if (!idSet.has(p.id)) return p;

      if (action === 'approve') {
        return {
          ...p,
          status: 'published' as const,
          adminReviewStatus: 'verified_approved' as const,
          priceAward: updates?.priceAward ?? p.priceAward ?? 100,
          adminPayoutAmount: updates?.adminPayoutAmount ?? p.adminPayoutAmount ?? 100,
          rpmRate: updates?.rpmRate ?? p.rpmRate ?? 350,
          adminDisbursedDate: new Date().toISOString()
        };
      }

      if (action === 'reject') {
        return {
          ...p,
          status: 'removed' as const,
          adminReviewStatus: 'rejected' as const,
          rejectionReason: updates?.rejectionReason || 'Does not meet editorial guidelines'
        };
      }

      if (action === 'update') {
        return {
          ...p,
          ...updates
        };
      }

      return p;
    });

    savePosts(updated);
  } catch (err) {
    console.error('Error during bulk update stored posts:', err);
  }
}

export function getStoredUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(CURRENT_USER));
      return CURRENT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return CURRENT_USER;
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user:', err);
  }
}

export function getStoredWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(INITIAL_WALLET));
      return INITIAL_WALLET;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WALLET;
  }
}

export function saveWallet(wallet: Wallet): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
  } catch (err) {
    console.error('Error saving wallet:', err);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(INITIAL_TRANSACTIONS)
      );
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(transactions)
    );
  } catch (err) {
    console.error('Error saving transactions:', err);
  }
}

export function getStoredComments(postId: string): Comment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const all = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    return all[postId] || [];
  } catch {
    return INITIAL_COMMENTS[postId] || [];
  }
}

export function addComment(postId: string, content: string, user: User): Comment {
  const newComment: Comment = {
    id: `c_${Date.now()}`,
    postId,
    userHandle: user.handle,
    userName: user.displayName,
    userAvatar: user.avatar,
    content,
    createdAt: 'Just now',
    likes: 0
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const all: Record<string, Comment[]> = raw ? JSON.parse(raw) : { ...INITIAL_COMMENTS };
    if (!all[postId]) {
      all[postId] = [];
    }
    all[postId].unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(all));

    // Update comment count on post
    const posts = getStoredPosts();
    const target = posts.find((p) => p.id === postId);
    if (target) {
      target.commentCount += 1;
      savePosts(posts);
    }
  } catch (err) {
    console.error('Error adding comment:', err);
  }

  return newComment;
}

export function toggleLikePost(postId: string): VideoPost | undefined {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return undefined;

  post.isLiked = !post.isLiked;
  post.likeCount += post.isLiked ? 1 : -1;
  savePosts(posts);
  return post;
}

export function toggleSavePost(postId: string): VideoPost | undefined {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return undefined;

  post.isSaved = !post.isSaved;
  savePosts(posts);
  return post;
}

/**
 * Records a qualified view under anti-fraud threshold.
 * If the post belongs to the user, credits their wallet based on payout formula!
 */
export function recordQualifiedView(postId: string): {
  isFirstQualified: boolean;
  earnedAmount?: number;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUALIFIED_VIEWS);
    const set: string[] = raw ? JSON.parse(raw) : [];

    // Session deduplication check
    if (set.includes(postId)) {
      return { isFirstQualified: false };
    }

    set.push(postId);
    localStorage.setItem(STORAGE_KEYS.QUALIFIED_VIEWS, JSON.stringify(set));

    // Increment qualified count on post
    const posts = getStoredPosts();
    const post = posts.find((p) => p.id === postId);
    let earnedAmount = 0;

    if (post) {
      post.viewCount += 1;
      post.qualifiedViewCount += 1;
      savePosts(posts);

      // If user is creator, credit earnings formula:
      // (1 / 1000) * base_RPM (4.50) * tierMultiplier (1.1) * localityMultiplier (1.5) = $0.007425
      const user = getStoredUser();
      if (post.creatorId === user.id) {
        const breakdown = calculatePostEarnings(1, user.creatorTier, true, post.rpmRate || BASE_RPM);
        earnedAmount = breakdown.totalEarnings || 0.01;

        const wallet = getStoredWallet();
        wallet.balance = parseFloat((wallet.balance + earnedAmount).toFixed(2));
        wallet.lifetimeEarnings = parseFloat(
          (wallet.lifetimeEarnings + earnedAmount).toFixed(2)
        );
        wallet.thisMonthEarnings = parseFloat(
          (wallet.thisMonthEarnings + earnedAmount).toFixed(2)
        );
        wallet.qualifiedViewsTotal += 1;
        saveWallet(wallet);

        const txs = getStoredTransactions();
        txs.unshift({
          id: `tx_${Date.now()}`,
          walletId: wallet.id,
          type: 'earning',
          amount: earnedAmount,
          relatedPostId: post.id,
          relatedPostTitle: post.headline,
          status: 'completed',
          createdAt: new Date().toISOString()
        });
        saveTransactions(txs);
      }
    }

    return { isFirstQualified: true, earnedAmount };
  } catch (err) {
    console.error('Error recording qualified view:', err);
    return { isFirstQualified: false };
  }
}

export function requestPayout(
  amount: number,
  method: string
): { success: boolean; message: string } {
  const wallet = getStoredWallet();
  if (amount < 500) {
    return { success: false, message: 'Minimum withdrawal threshold is ₹500.00.' };
  }
  if (amount > wallet.balance) {
    return { success: false, message: 'Withdrawal amount exceeds available balance.' };
  }

  wallet.balance = parseFloat((wallet.balance - amount).toFixed(2));
  saveWallet(wallet);

  const txs = getStoredTransactions();
  txs.unshift({
    id: `tx_payout_${Date.now()}`,
    walletId: wallet.id,
    type: 'payout',
    amount,
    status: 'completed',
    createdAt: new Date().toISOString(),
    method
  });
  saveTransactions(txs);

  return {
    success: true,
    message: `Successfully requested ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} transfer via ${method}. UTR / Transaction Ref #${Math.floor(1000000000 + Math.random() * 9000000000)}.`
  };
}

export function sendTip(
  postId: string,
  amount: number,
  creatorName: string
): boolean {
  const wallet = getStoredWallet();
  const txs = getStoredTransactions();

  txs.unshift({
    id: `tx_tip_${Date.now()}`,
    walletId: wallet.id,
    type: 'tip',
    amount,
    relatedPostId: postId,
    relatedPostTitle: `Viewer Tip to ${creatorName}`,
    status: 'completed',
    createdAt: new Date().toISOString()
  });
  saveTransactions(txs);
  return true;
}

export function getActiveLocation(): LocationCoordinates {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (!raw) return CURRENT_USER.homeLocation;
    return JSON.parse(raw);
  } catch {
    return CURRENT_USER.homeLocation;
  }
}

export function saveActiveLocation(loc: LocationCoordinates): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(loc));
  } catch (err) {
    console.error('Error saving active location:', err);
  }
}

/**
 * Platform Admin action to approve & disburse official news video grant / bounty.
 */
export function approveAdminPayout(
  postId: string,
  payoutAmount: number,
  bountyAmount: number = 0,
  adminDesk: string = 'Chennai & Tiruvallur Admin Bureau'
): { success: boolean; totalDisbursed: number; message: string } {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return { success: false, totalDisbursed: 0, message: 'News video not found.' };
  }

  const totalDisbursed = payoutAmount + bountyAmount;

  post.adminReviewStatus = bountyAmount > 0 ? 'bounty_awarded' : 'verified_approved';
  post.adminPayoutAmount = (post.adminPayoutAmount || 0) + payoutAmount;
  if (bountyAmount > 0) {
    post.adminBountyAwarded = (post.adminBountyAwarded || 0) + bountyAmount;
  }
  post.adminDisbursedDate = 'Just now (Instant UPI Disbursed)';
  post.adminReviewerDesk = adminDesk;
  savePosts(posts);

  // Credit Creator Wallet
  const user = getStoredUser();
  const wallet = getStoredWallet();
  wallet.balance = parseFloat((wallet.balance + totalDisbursed).toFixed(2));
  wallet.lifetimeEarnings = parseFloat((wallet.lifetimeEarnings + totalDisbursed).toFixed(2));
  wallet.thisMonthEarnings = parseFloat((wallet.thisMonthEarnings + totalDisbursed).toFixed(2));
  saveWallet(wallet);

  const txs = getStoredTransactions();
  txs.unshift({
    id: `tx_admin_${Date.now()}`,
    walletId: wallet.id,
    type: bountyAmount > 0 ? 'bounty' : 'admin_payout',
    amount: totalDisbursed,
    relatedPostId: post.id,
    relatedPostTitle: `Admin Video Grant: ${post.headline}`,
    status: 'completed',
    createdAt: new Date().toISOString(),
    method: 'LocalPulse Admin Treasury (Direct UPI)',
    adminDesk
  });
  saveTransactions(txs);

  return {
    success: true,
    totalDisbursed,
    message: `Disbursed ₹${totalDisbursed.toLocaleString('en-IN')} via Admin Treasury UPI to @${post.creatorHandle}. UTR #${Math.floor(1000000000 + Math.random() * 9000000000)}.`
  };
}

/**
 * Update video post review status (approved / rejected / bounty).
 */
export function updatePostReviewStatus(
  postId: string,
  status: AdminReviewStatus,
  isBreaking: boolean = false
): VideoPost | null {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  post.adminReviewStatus = status;
  if (isBreaking !== undefined) {
    post.isBreaking = isBreaking;
  }
  if (status === 'verified_approved' || status === 'bounty_awarded') {
    post.status = 'published';
    const award = post.priceAward || (isBreaking ? 250 : 100);
    post.priceAward = award;
    post.adminPayoutAmount = award;

    // Credit creator's wallet if not already credited
    if (award > 0) {
      const wallet = getStoredWallet();
      wallet.balance = parseFloat((wallet.balance + award).toFixed(2));
      wallet.lifetimeEarnings = parseFloat((wallet.lifetimeEarnings + award).toFixed(2));
      wallet.thisMonthEarnings = parseFloat((wallet.thisMonthEarnings + award).toFixed(2));
      saveWallet(wallet);

      const txs = getStoredTransactions();
      txs.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        walletId: wallet.id,
        type: isBreaking ? 'bounty' : 'admin_payout',
        amount: award,
        relatedPostId: post.id,
        relatedPostTitle: `Bureau Price Award: ${post.headline.slice(0, 32)}...`,
        status: 'completed',
        createdAt: new Date().toISOString(),
        method: 'Spotlight Bureau Treasury (Instant UPI)',
        adminDesk: 'Chennai & Tiruvallur Admin Bureau'
      });
      saveTransactions(txs);

      addStoredNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: post.creatorId,
        title: '🎉 Report Approved & Cash Awarded!',
        message: `Your video report "${post.headline.slice(0, 36)}..." was approved by the Bureau. ₹${award} has been credited to your Spotlight Wallet.`,
        type: 'report_status',
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }
  savePosts(posts);
  return post;
}

/**
 * Step 2: Accept and Publish Post handled by Admin with Geotag, Radius, Citation, Price Award & RPM.
 */
export function acceptAndPublishPostByAdmin(
  postId: string,
  editorialData: {
    landmark: string;
    neighborhood: string;
    lat: number;
    lng: number;
    radiusMeters: number;
    sourceCitation: string;
    isBreaking: boolean;
    priceAward?: number;
    grantAmount?: number;
    rpmRate?: number;
    reviewerDesk?: string;
  }
): VideoPost | null {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const allocatedPriceAward = editorialData.priceAward ?? editorialData.grantAmount ?? (editorialData.isBreaking ? 250 : 100);
  const allocatedRpm = editorialData.rpmRate ?? (editorialData.isBreaking ? 500 : 350);

  // Apply Editorial overrides
  post.location = {
    ...post.location,
    placeName: editorialData.landmark,
    neighborhood: editorialData.neighborhood,
    lat: editorialData.lat,
    lng: editorialData.lng,
    radiusMeters: editorialData.radiusMeters
  };
  post.sourceCitation = editorialData.sourceCitation;
  post.isBreaking = editorialData.isBreaking;
  post.adminReviewStatus = editorialData.isBreaking ? 'bounty_awarded' : 'verified_approved';
  post.status = 'published'; // Every post becomes public only after admin accepts it!
  post.priceAward = allocatedPriceAward;
  post.adminPayoutAmount = allocatedPriceAward;
  post.rpmRate = allocatedRpm;
  post.adminDisbursedDate = new Date().toISOString();
  post.adminReviewerDesk = editorialData.reviewerDesk || 'Chennai & Tiruvallur Admin Bureau';

  // Credit the creator's wallet with the allocated Price Award
  if (allocatedPriceAward > 0) {
    const wallet = getStoredWallet();
    wallet.balance = parseFloat((wallet.balance + allocatedPriceAward).toFixed(2));
    wallet.lifetimeEarnings = parseFloat((wallet.lifetimeEarnings + allocatedPriceAward).toFixed(2));
    wallet.thisMonthEarnings = parseFloat((wallet.thisMonthEarnings + allocatedPriceAward).toFixed(2));
    saveWallet(wallet);

    const txs = getStoredTransactions();
    txs.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      walletId: wallet.id,
      type: editorialData.isBreaking ? 'bounty' : 'admin_payout',
      amount: allocatedPriceAward,
      relatedPostId: post.id,
      relatedPostTitle: `Bureau Price Award: ${post.headline.slice(0, 32)}...`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      method: 'Spotlight Bureau Treasury (Instant UPI)',
      adminDesk: editorialData.reviewerDesk || 'Chennai & Tiruvallur Admin Bureau'
    });
    saveTransactions(txs);

    addStoredNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: post.creatorId,
      title: '🎉 Report Approved & Cash Awarded!',
      message: `Your video report "${post.headline.slice(0, 36)}..." was approved by the Bureau. ₹${allocatedPriceAward} has been credited to your Spotlight Wallet.`,
      type: 'report_status',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  savePosts(posts);
  return post;
}

/**
 * Reject a video post with a moderation reason.
 */
export function rejectPost(postId: string, reason: string): VideoPost | null {
  const posts = getStoredPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  post.adminReviewStatus = 'rejected';
  post.rejectionReason = reason;
  savePosts(posts);
  return post;
}

/**
 * Calculate comprehensive statistical dashboard metrics across Chennai & Tiruvallur.
 */
export function getAdminDashboardStats(): AdminStats {
  const posts = getStoredPosts();
  const txs = getStoredTransactions();

  const totalVideosSubmitted = posts.length;
  const pendingReviewCount = posts.filter(
    (p) => (p.adminReviewStatus === 'pending_review' || p.status === 'in_review') &&
      p.adminReviewStatus !== 'verified_approved' &&
      p.adminReviewStatus !== 'bounty_awarded' &&
      p.adminReviewStatus !== 'rejected'
  ).length;
  const approvedCount = posts.filter(
    (p) => p.adminReviewStatus === 'verified_approved' ||
      p.adminReviewStatus === 'bounty_awarded' ||
      (p.status === 'published' && p.adminReviewStatus !== 'pending_review' && p.adminReviewStatus !== 'rejected')
  ).length;
  const rejectedCount = posts.filter((p) => p.adminReviewStatus === 'rejected').length;

  const totalDisbursedINR = txs
    .filter((t) => t.type === 'admin_payout' || t.type === 'bounty')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeReporters = new Set(posts.map((p) => p.creatorId));

  let chennai = 0;
  let tiruvallur = 0;
  let other = 0;

  const categoryBreakdown: Record<string, number> = {};

  posts.forEach((p) => {
    // District mapping
    const locStr = `${p.location.placeName} ${p.location.neighborhood || ''}`.toLowerCase();
    if (
      locStr.includes('tiruvallur') ||
      locStr.includes('avadi') ||
      locStr.includes('red hills') ||
      locStr.includes('poondi') ||
      locStr.includes('ambattur') ||
      locStr.includes('gummidipoondi')
    ) {
      tiruvallur++;
    } else if (
      locStr.includes('chennai') ||
      locStr.includes('central') ||
      locStr.includes('t nagar') ||
      locStr.includes('anna nagar') ||
      locStr.includes('velachery') ||
      locStr.includes('guindy')
    ) {
      chennai++;
    } else {
      other++;
    }

    // Category count
    categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
  });

  const totalReviewed = approvedCount + rejectedCount;
  const approvalRatePercent =
    totalReviewed > 0 ? Math.round((approvedCount / totalReviewed) * 100) : 0;

  return {
    totalVideosSubmitted,
    pendingReviewCount,
    approvedCount,
    rejectedCount,
    totalDisbursedINR,
    activeReportersCount: activeReporters.size,
    districtBreakdown: {
      chennai,
      tiruvallur,
      other
    },
    categoryBreakdown,
    approvalRatePercent
  };
}

// --- ADVERTISEMENTS MANAGEMENT STORAGE ---

export function getStoredAds(): Advertisement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_ADVERTISEMENTS));
      return INITIAL_ADVERTISEMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading advertisements:', err);
    return INITIAL_ADVERTISEMENTS;
  }
}

export function saveStoredAds(ads: Advertisement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  } catch (err) {
    console.error('Error saving advertisements:', err);
  }
}

export function createStoredAd(ad: Advertisement): Advertisement {
  const ads = getStoredAds();
  ads.unshift(ad);
  saveStoredAds(ads);
  return ad;
}

export function updateStoredAd(id: string, updates: Partial<Advertisement>): Advertisement | null {
  const ads = getStoredAds();
  const idx = ads.findIndex((a) => a.id === id);
  if (idx !== -1) {
    ads[idx] = { ...ads[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoredAds(ads);
    return ads[idx];
  }
  return null;
}

export function deleteStoredAd(id: string): boolean {
  const ads = getStoredAds();
  const filtered = ads.filter((a) => a.id !== id);
  saveStoredAds(filtered);
  return filtered.length !== ads.length;
}

export function trackStoredAdImpression(id: string): void {
  const ads = getStoredAds();
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.impressions = (ad.impressions || 0) + 1;
    if (ad.autoStop !== false && ad.reachLimit && ad.reachLimit > 0 && ad.impressions >= ad.reachLimit) {
      ad.status = 'stopped';
    }
    saveStoredAds(ads);
  }
}

export function trackStoredAdClick(id: string): void {
  const ads = getStoredAds();
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.clicks = (ad.clicks || 0) + 1;
    saveStoredAds(ads);
  }
}

// --- APP SETTINGS STORAGE ---

export function getStoredAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_APP_SETTINGS));
      return INITIAL_APP_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading app settings:', err);
    return INITIAL_APP_SETTINGS;
  }
}

export function saveStoredAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving app settings:', err);
  }
}

// --- ADMIN USERS STORAGE ---

export function getStoredAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(INITIAL_ADMIN_USERS));
      return INITIAL_ADMIN_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading admin users:', err);
    return INITIAL_ADMIN_USERS;
  }
}

export function saveStoredAdminUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving admin users:', err);
  }
}

// --- SOCIAL MEDIA IMPORTS STORAGE ---

export function getStoredSocialImports(): SocialMediaPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_IMPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOCIAL_IMPORTS, JSON.stringify(INITIAL_SOCIAL_IMPORTS));
      return INITIAL_SOCIAL_IMPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading social imports:', err);
    return INITIAL_SOCIAL_IMPORTS;
  }
}

export function saveStoredSocialImports(posts: SocialMediaPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_IMPORTS, JSON.stringify(posts));
  } catch (err) {
    console.error('Error saving social imports:', err);
  }
}

export function createStoredSocialImport(post: SocialMediaPost): SocialMediaPost {
  const all = getStoredSocialImports();
  const existingIdx = all.findIndex((p) => p.id === post.id);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...post };
  } else {
    all.unshift(post);
  }
  saveStoredSocialImports(all);
  return post;
}

export function updateStoredSocialImport(id: string, updates: Partial<SocialMediaPost>): SocialMediaPost | null {
  const all = getStoredSocialImports();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  saveStoredSocialImports(all);
  return all[idx];
}

export function deleteStoredSocialImport(id: string): boolean {
  try {
    const all = getStoredSocialImports();
    const filtered = all.filter((p) => p.id !== id);
    saveStoredSocialImports(filtered);
    return true;
  } catch (err) {
    console.error('Error deleting social import:', err);
    return false;
  }
}

// --- COPYRIGHT REPORTS LOCAL STORAGE ---
export function getStoredCopyrightReports(): CopyrightReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COPYRIGHT_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COPYRIGHT_REPORTS, JSON.stringify(INITIAL_COPYRIGHT_REPORTS));
      return INITIAL_COPYRIGHT_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading copyright reports:', err);
    return INITIAL_COPYRIGHT_REPORTS;
  }
}

export function saveStoredCopyrightReports(reports: CopyrightReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COPYRIGHT_REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Error saving copyright reports:', err);
  }
}

// --- COPYRIGHT STRIKES LOCAL STORAGE ---
export function getStoredCopyrightStrikes(): CopyrightStrike[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COPYRIGHT_STRIKES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COPYRIGHT_STRIKES, JSON.stringify(INITIAL_COPYRIGHT_STRIKES));
      return INITIAL_COPYRIGHT_STRIKES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading copyright strikes:', err);
    return INITIAL_COPYRIGHT_STRIKES;
  }
}

export function saveStoredCopyrightStrikes(strikes: CopyrightStrike[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COPYRIGHT_STRIKES, JSON.stringify(strikes));
  } catch (err) {
    console.error('Error saving copyright strikes:', err);
  }
}

// --- USER NOTIFICATIONS LOCAL STORAGE ---
export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function addStoredNotification(notif: AppNotification): void {
  const all = getStoredNotifications();
  all.unshift(notif);
  saveStoredNotifications(all);
}

// --- SPOTLIGHT360 VIDEOS LOCAL STORAGE ---
export function getStoredSpotlight360Videos(): Spotlight360Video[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPOTLIGHT360_VIDEOS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading spotlight360 videos:', err);
    return [];
  }
}

export function saveStoredSpotlight360Videos(videos: Spotlight360Video[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPOTLIGHT360_VIDEOS, JSON.stringify(videos));
  } catch (err) {
    console.error('Error saving spotlight360 videos:', err);
  }
}

export function addStoredSpotlight360Videos(newVideos: Spotlight360Video[]): void {
  const current = getStoredSpotlight360Videos();
  const updated = [...newVideos, ...current.filter(c => !newVideos.some(n => n.id === c.id))];
  saveStoredSpotlight360Videos(updated);
}

// --- CREATOR & REPORTER DIRECTORY ---
export interface CreatorItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
}

export const DEFAULT_CREATORS: CreatorItem[] = [
  { id: 'usr_admin_jr', name: 'Spotlight360 Official', handle: 'spotlight360', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200', verified: true },
  { id: 'usr_tn_health', name: 'TN Health Desk', handle: 'TNHealthDesk', avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200', verified: true },
  { id: 'usr_tn_civic', name: 'Ponneri Citizen Watch', handle: 'ponnericivic', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', verified: true },
  { id: 'usr_tn_traffic', name: 'Chennai Traffic Live', handle: 'chennaitraffic', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', verified: true },
  { id: 'usr_tn_001', name: 'Citizen Journalist', handle: 'citizen_reporter', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', verified: false }
];

export function getStoredCreators(): CreatorItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREATORS);
    if (!raw) return DEFAULT_CREATORS;
    const list = JSON.parse(raw);
    const map = new Map<string, CreatorItem>();
    DEFAULT_CREATORS.forEach(c => map.set(c.id, c));
    list.forEach((c: CreatorItem) => map.set(c.id, c));
    return Array.from(map.values());
  } catch {
    return DEFAULT_CREATORS;
  }
}

export function saveStoredCreator(newCreator: CreatorItem): void {
  try {
    const current = getStoredCreators();
    const updated = [newCreator, ...current.filter(c => c.id !== newCreator.id)];
    localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving creator:', err);
  }
}

