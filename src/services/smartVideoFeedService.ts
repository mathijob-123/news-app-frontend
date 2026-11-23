import type { VideoPost, LocationCoordinates, User } from '../types';
import { calculateDistanceKm, isLocationMatch } from './geoService';
import { API_BASE } from './apiConfig';

const SUPABASE_REST_URL = 'https://xylbmwffyaoojnvrjmlx.supabase.co/rest/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bGJtd2ZmeWFvb2pudnJqbWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MTk4MzYsImV4cCI6MjExMDI5NTgzNn0._hBoUkJRX9y84qa9lPnFNFDx5OzidF5hKQ0c3Rft_BQ';

const WATCH_STORAGE_PREFIX = 'spotlight_video_watch_v1_';
const CYCLE_STORAGE_PREFIX = 'spotlight_video_cycle_v1_';
const DEVICE_ID_KEY = 'spotlight_device_uuid_v1';

/**
 * Returns a persistent identifier for this device or user.
 */
export function getEffectiveUserId(user?: User | null): string {
  if (user?.id) return user.id;
  try {
    let devId = localStorage.getItem(DEVICE_ID_KEY);
    if (!devId) {
      devId = `guest_dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem(DEVICE_ID_KEY, devId);
    }
    return devId;
  } catch {
    return 'guest_dev_default';
  }
}

/**
 * Returns the set of post IDs watched by this user in the current cycle (from localStorage).
 */
export function getLocalWatchedSet(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${WATCH_STORAGE_PREFIX}${userId}`);
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set<string>(arr) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

/**
 * Saves the set of watched post IDs to localStorage for instant 0ms access.
 */
export function saveLocalWatchedSet(userId: string, set: Set<string>): void {
  try {
    localStorage.setItem(`${WATCH_STORAGE_PREFIX}${userId}`, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('[smartVideoFeed] Error saving local watch set:', err);
  }
}

/**
 * Returns the user's current watch cycle number.
 */
export function getWatchCycle(userId: string): number {
  try {
    const raw = localStorage.getItem(`${CYCLE_STORAGE_PREFIX}${userId}`);
    return raw ? Math.max(1, parseInt(raw, 10) || 1) : 1;
  } catch {
    return 1;
  }
}

/**
 * Advances the watch cycle when all available videos have been watched.
 * Clears the watched set for the new cycle and returns the new cycle number.
 */
export function advanceWatchCycle(userId: string): number {
  const current = getWatchCycle(userId);
  const next = current + 1;
  try {
    localStorage.setItem(`${CYCLE_STORAGE_PREFIX}${userId}`, String(next));
    // Clear local watch set so all videos start fresh in the new cycle
    localStorage.removeItem(`${WATCH_STORAGE_PREFIX}${userId}`);
  } catch {}

  // Inform backend asynchronously
  fetch(`${API_BASE}/videos/reset-cycle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newCycleNumber: next })
  }).catch(() => {});

  return next;
}

/**
 * Records that a user watched a video.
 * Immediately saves to localStorage and syncs with Supabase REST + Backend.
 */
export async function recordVideoWatch(
  userId: string,
  postId: string,
  currentCycle?: number
): Promise<void> {
  if (!userId || !postId) return;

  const cycle = currentCycle || getWatchCycle(userId);
  const localSet = getLocalWatchedSet(userId);

  // If already marked in this session, skip redundant writes
  if (localSet.has(postId)) return;

  localSet.add(postId);
  saveLocalWatchedSet(userId, localSet);

  const watchId = `wh_${userId}_${postId}`;
  const now = new Date().toISOString();

  // 1. Direct Supabase REST Upsert (fastest & cross-device)
  try {
    fetch(`${SUPABASE_REST_URL}/video_watch_history`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: watchId,
        user_id: userId,
        post_id: postId,
        watched_at: now,
        cycle_number: cycle
      })
    }).catch(() => {});
  } catch {}

  // 2. Backend API fallback
  try {
    fetch(`${API_BASE}/videos/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId, cycleNumber: cycle })
    }).catch(() => {});
  } catch {}
}

/**
 * Fetches the user's remote watch history from Supabase / Backend to merge with local set.
 */
export async function syncRemoteWatchHistory(userId: string): Promise<Set<string>> {
  const localSet = getLocalWatchedSet(userId);
  const cycle = getWatchCycle(userId);

  try {
    const supaRes = await fetch(
      `${SUPABASE_REST_URL}/video_watch_history?user_id=eq.${encodeURIComponent(
        userId
      )}&cycle_number=eq.${cycle}&select=post_id`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    if (supaRes.ok) {
      const rows = await supaRes.json();
      if (Array.isArray(rows)) {
        rows.forEach((r: any) => {
          if (r.post_id) localSet.add(r.post_id);
        });
        saveLocalWatchedSet(userId, localSet);
      }
    }
  } catch {}

  return localSet;
}

/**
 * Deterministic feed order (preserves input order without random shuffling).
 */
export function shuffleArray<T>(items: T[]): T[] {
  return [...items];
}

export interface SmartFeedOptions {
  posts: VideoPost[];
  userLocation: LocationCoordinates | null;
  userId: string;
  watchedSet?: Set<string>;
}

/**
 * Consistent feed sorting logic:
 * 1. Breaking / Urgent videos first.
 * 2. Newest uploaded videos first (chronological order).
 * 3. Stable tie-breaker by post ID.
 */
export const sortVideosByFeedOrder = (a: VideoPost, b: VideoPost): number => {
  if (a.isBreaking && !b.isBreaking) return -1;
  if (!a.isBreaking && b.isBreaking) return 1;

  const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (tB !== tA) return tB - tA;

  return (b.id || '').localeCompare(a.id || '');
};

/**
 * DETERMINISTIC REELS FEED RECOMMENDATION
 * 
 * Strict Instagram-Style Consistency:
 * 1. Unwatched videos displayed in strict chronological feed order (newest first).
 * 2. Watched videos placed at the end in chronological order.
 * 3. Never randomly selects or plays videos.
 * 4. The first video is always index 0 of the consistent sorted feed.
 */
export function generateSmartVideoFeed(options: SmartFeedOptions): {
  feed: VideoPost[];
  cycle: number;
  unwatchedCount: number;
  watchedCount: number;
} {
  const { posts, userLocation, userId } = options;

  // 1. Strictly consider video posts that are not copyright removed
  let candidateVideos = posts.filter(
    (p) => p.type === 'video' && p.status !== 'copyright_takedown'
  );

  // Strict Hyperlocal Isolation Rule:
  // When a location is selected (e.g. Ponneri, Tiruvallur, Minjur, Gummidipoondi),
  // candidate videos MUST strictly belong to that location. Ponneri never leaks into Tiruvallur, etc.
  if (userLocation) {
    candidateVideos = candidateVideos.filter((v) => isLocationMatch(v.location, userLocation));
  }

  if (candidateVideos.length === 0) {
    return { feed: [], cycle: 1, unwatchedCount: 0, watchedCount: 0 };
  }

  // 2. Read watched set
  let watchedSet = options.watchedSet ? new Set(options.watchedSet) : getLocalWatchedSet(userId);
  let cycle = getWatchCycle(userId);

  // 3. Separate into unwatched and watched, both sorted strictly in feed order
  let unwatchedVideos = candidateVideos
    .filter((v) => !watchedSet.has(v.id))
    .sort(sortVideosByFeedOrder);
  let watchedVideos = candidateVideos
    .filter((v) => watchedSet.has(v.id))
    .sort(sortVideosByFeedOrder);

  // 4. If all videos have been watched by this user, auto-advance cycle and start fresh!
  if (unwatchedVideos.length === 0 && candidateVideos.length > 0) {
    cycle = advanceWatchCycle(userId);
    watchedSet = new Set<string>();
    unwatchedVideos = [...candidateVideos].sort(sortVideosByFeedOrder);
    watchedVideos = [];
  }

  // Consistent, deterministic order: unwatched first in feed order, followed by watched
  const finalFeed = [...unwatchedVideos, ...watchedVideos];

  return {
    feed: finalFeed,
    cycle,
    unwatchedCount: unwatchedVideos.length,
    watchedCount: watchedVideos.length
  };
}
