import type {
  VideoPost,
  User,
  Wallet,
  Transaction,
  Comment,
  LocationCoordinates,
  AdminReviewStatus,
  AdminStats
} from '../types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMENTS
} from '../data/mockNewsData';
import { calculatePostEarnings } from './monetizationEngine';

const STORAGE_KEYS = {
  POSTS: 'lp_posts_v5_zero_mock',
  USER: 'lp_user_v5_zero_mock',
  WALLET: 'lp_wallet_v5_zero_mock',
  TRANSACTIONS: 'lp_transactions_v5_zero_mock',
  COMMENTS: 'lp_comments_v5_zero_mock',
  SAVED_POSTS: 'lp_saved_posts_v5_zero_mock',
  QUALIFIED_VIEWS: 'lp_qualified_views_v5_zero_mock',
  USER_LOCATION: 'lp_active_location_v5_zero_mock'
};

export function getStoredPosts(): VideoPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
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
        const breakdown = calculatePostEarnings(1, user.creatorTier, true);
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
    (p) => !p.adminReviewStatus || p.adminReviewStatus === 'pending_review'
  ).length;
  const approvedCount = posts.filter(
    (p) => p.adminReviewStatus === 'verified_approved' || p.adminReviewStatus === 'bounty_awarded'
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
