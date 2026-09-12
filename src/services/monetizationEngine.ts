import type { CreatorTier } from '../types';

// Baseline RPM in Indian Rupees (₹350 per 1,000 qualified views = ₹0.35 per verified watch)
export const BASE_RPM = 350.0;
// Minimum withdrawal threshold in INR (₹500 minimum for UPI / Direct IMPS)
export const MIN_PAYOUT_THRESHOLD = 500.0;

export interface EarningsBreakdown {
  qualifiedViews: number;
  baseRPM: number;
  tierMultiplier: number;
  localityMultiplier: number;
  totalEarnings: number;
  effectiveRPM: number;
}

/**
 * Format currency in Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Returns tier multiplier based on creator's monthly qualified view count.
 * Bronze (0–10K): 1.0x
 * Silver (10K–100K): 1.1x
 * Gold (100K+): 1.25x
 */
export function getTierMultiplier(tier: CreatorTier): number {
  switch (tier) {
    case 'gold':
      return 1.25;
    case 'silver':
      return 1.1;
    case 'bronze':
    default:
      return 1.0;
  }
}

/**
 * Evaluates whether a watch session qualifies as a verified view under anti-fraud rules.
 * Rule: watched >= min(3 seconds, 50% of video duration)
 */
export function isWatchQualified(
  watchSeconds: number,
  durationSeconds: number
): boolean {
  const threshold = Math.min(3, Math.max(1, durationSeconds * 0.5));
  return watchSeconds >= threshold;
}

/**
 * Calculates earnings in INR for a post using the auditable platform formula:
 * earnings = (qualified_views / 1000) * base_RPM * tier_multiplier * locality_multiplier
 */
export function calculatePostEarnings(
  qualifiedViews: number,
  tier: CreatorTier = 'bronze',
  isLocalAudience: boolean = true,
  customRPM: number = BASE_RPM
): EarningsBreakdown {
  const tierMultiplier = getTierMultiplier(tier);
  const localityMultiplier = isLocalAudience ? 1.5 : 1.0;

  const totalEarnings =
    (qualifiedViews / 1000) * customRPM * tierMultiplier * localityMultiplier;
  const effectiveRPM =
    qualifiedViews > 0 ? (totalEarnings / qualifiedViews) * 1000 : customRPM;

  return {
    qualifiedViews,
    baseRPM: customRPM,
    tierMultiplier,
    localityMultiplier,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    effectiveRPM: parseFloat(effectiveRPM.toFixed(2))
  };
}

/**
 * Resolves next tier progress percentage and remaining qualified views
 */
export function getTierProgress(monthlyViews: number): {
  currentTier: CreatorTier;
  nextTier: CreatorTier | null;
  progressPercent: number;
  viewsRemaining: number;
} {
  if (monthlyViews >= 100000) {
    return {
      currentTier: 'gold',
      nextTier: null,
      progressPercent: 100,
      viewsRemaining: 0
    };
  }
  if (monthlyViews >= 10000) {
    const progress = Math.min(
      100,
      Math.round(((monthlyViews - 10000) / 90000) * 100)
    );
    return {
      currentTier: 'silver',
      nextTier: 'gold',
      progressPercent: progress,
      viewsRemaining: 100000 - monthlyViews
    };
  }
  const progress = Math.min(100, Math.round((monthlyViews / 10000) * 100));
  return {
    currentTier: 'bronze',
    nextTier: 'silver',
    progressPercent: progress,
    viewsRemaining: 10000 - monthlyViews
  };
}
