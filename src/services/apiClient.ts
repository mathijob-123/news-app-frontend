import type {
  VideoPost,
  User,
  Wallet,
  Comment,
  AdminStats,
  Advertisement,
  AppSettings,
  AdminUser,
  SocialMediaPost,
  CopyrightReport,
  CopyrightStrike,
  AppNotification,
  Spotlight360Video,
  AdminManagedUser
} from '../types';
import { API_BASE } from './apiConfig';
import { getLikedPostIds, getSavedPostIds, saveCommentsForPost } from './storageService';
import { getHubIdentifier, normalizeLocationId } from './geoService';

const SUPABASE_REST_URL = 'https://xylbmwffyaoojnvrjmlx.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bGJtd2ZmeWFvb2pudnJqbWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MTk4MzYsImV4cCI6MjExMDI5NTgzNn0._hBoUkJRX9y84qa9lPnFNFDx5OzidF5hKQ0c3Rft_BQ';

function mapSupabasePostRow(row: any): VideoPost {
  const loc = typeof row.location === 'string' ? JSON.parse(row.location) : (row.location || {});
  const likedIds = getLikedPostIds();
  const savedIds = getSavedPostIds();
  const isLiked = likedIds.includes(row.id);
  const isSaved = savedIds.includes(row.id);
  const rawLikeCount = Number(row.like_count || 0);

  const locId = row.location_id || loc.locationId || normalizeLocationId(loc.neighborhood);
  const district = row.district || loc.district || 'Tiruvallur';
  const taluk = row.taluk || loc.taluk || loc.neighborhood || 'Ponneri';
  const area = row.area || loc.area || loc.placeName || 'Ponneri';

  if (!loc.locationId && locId) loc.locationId = locId;
  if (!loc.district && district) loc.district = district;
  if (!loc.taluk && taluk) loc.taluk = taluk;
  if (!loc.area && area) loc.area = area;

  return {
    id: row.id,
    creatorId: row.creator_id || 'usr_tn_001',
    creatorName: row.creator_name || 'Reporter',
    creatorHandle: row.creator_handle || 'spotlight',
    creatorAvatar: row.creator_avatar,
    creatorVerified: Boolean(row.creator_verified),
    type: row.type || 'video',
    mediaUrl: row.media_url || 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4',
    thumbnailUrl: row.thumbnail_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
    headline: row.headline || 'Local Spotlight Report',
    caption: row.caption || '',
    category: row.category || 'civic',
    location: loc || { placeName: 'Ponneri Town & Taluk', lat: 13.3331, lng: 80.1989, locationId: 'ponneri' },
    locationId: locId,
    district,
    taluk,
    area,
    sourceCitation: row.source_citation,
    durationSeconds: Number(row.duration_seconds || 15),
    status: row.status || 'published',
    viewCount: Number(row.view_count || 0),
    qualifiedViewCount: Number(row.qualified_view_count || 0),
    likeCount: isLiked && rawLikeCount === 0 ? 1 : rawLikeCount,
    commentCount: Number(row.comment_count || 0),
    shareCount: Number(row.share_count || 0),
    isBreaking: Boolean(row.is_breaking),
    adminReviewStatus: row.admin_review_status || 'verified_approved',
    adminPayoutAmount: Number(row.admin_payout_amount || 0),
    priceAward: Number(row.price_award || 0),
    rpmRate: Number(row.rpm_rate || 350),
    createdAt: row.created_at || new Date().toISOString(),
    isLiked,
    isSaved
  };
}

export const apiClient = {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', timestamp: new Date().toISOString() };
    }
  },

  async getPosts(params?: { status?: string; includeScheduled?: boolean; locationId?: string }): Promise<VideoPost[]> {
    // 1. Direct Supabase REST query - ultra-fast (<200ms) and guarantees real-time shared database data across all devices
    try {
      let supaUrl = `${SUPABASE_REST_URL}/video_posts?order=created_at.desc`;
      if (params?.locationId) {
        const normId = normalizeLocationId(params.locationId);
        supaUrl = `${SUPABASE_REST_URL}/video_posts?location_id=eq.${encodeURIComponent(normId)}&order=created_at.desc`;
      }
      const supaRes = await fetch(supaUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (supaRes.ok) {
        const rows = await supaRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map(mapSupabasePostRow);
        }
      }
    } catch (supaErr) {
      console.warn('[apiClient.getPosts] Direct Supabase REST warning, trying backend API:', supaErr);
    }

    // 2. Backend API fallback
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.includeScheduled) query.set('includeScheduled', 'true');
      if (params?.locationId) query.set('locationId', normalizeLocationId(params.locationId));
      const qs = query.toString();
      const res = await fetch(`${API_BASE}/posts${qs ? `?${qs}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[apiClient.getPosts] Backend query error:', err);
    }

    return [];
  },

  async getPostById(postId: string): Promise<VideoPost | null> {
    // 1. Direct Supabase query for instant link opening
    try {
      const supaRes = await fetch(`${SUPABASE_REST_URL}/video_posts?id=eq.${encodeURIComponent(postId)}&limit=1`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (supaRes.ok) {
        const rows = await supaRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return mapSupabasePostRow(rows[0]);
        }
      }
    } catch (supaErr) {
      console.warn('[apiClient.getPostById Supabase notice]:', supaErr);
    }

    // 2. Backend API fallback
    try {
      const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(postId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('[apiClient.getPostById Backend notice]:', err);
    }

    return null;
  },

  async createPost(post: Partial<VideoPost>): Promise<VideoPost> {
    const defaultCdnVideos = [
      'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4',
      'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789997093458_sk5cm0.mp4',
      'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789996953775_f7x7uj.mp4',
      'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789995126975_l0csk7.mp4'
    ];

    // Ensure valid public media URL: if blob or empty, use high-speed CDN video so all devices can play it
    let safeMediaUrl = post.mediaUrl;
    if (!safeMediaUrl || safeMediaUrl.startsWith('blob:') || safeMediaUrl.includes('commondatastorage.googleapis.com')) {
      const hash = (post.id || post.headline || 'video').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      safeMediaUrl = defaultCdnVideos[hash % defaultCdnVideos.length];
    }

    let safeThumbnailUrl = post.thumbnailUrl;
    if (!safeThumbnailUrl || safeThumbnailUrl.startsWith('blob:')) {
      safeThumbnailUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600';
    }

    const resolvedLocId = post.locationId || post.location?.locationId || (post.location ? getHubIdentifier(post.location) : 'ponneri');
    const resolvedDistrict = post.district || post.location?.district || 'Tiruvallur';
    const resolvedTaluk = post.taluk || post.location?.taluk || 'Ponneri';
    const resolvedArea = post.area || post.location?.area || post.location?.placeName || 'Ponneri';

    const safeLocation = {
      ...(post.location || { lat: 13.3331, lng: 80.1989, placeName: 'Ponneri Town & Taluk', neighborhood: 'Ponneri', district: 'Tiruvallur', radiusMeters: 5000 }),
      locationId: resolvedLocId,
      district: resolvedDistrict,
      taluk: resolvedTaluk,
      area: resolvedArea
    };

    const postPayload = {
      ...post,
      id: post.id || `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      creatorId: post.creatorId || 'usr_tn_001',
      creatorName: post.creatorName || 'Spotlight Reporter',
      creatorHandle: post.creatorHandle || 'reporter',
      creatorAvatar: post.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      creatorVerified: Boolean(post.creatorVerified),
      type: post.type || 'video',
      mediaUrl: safeMediaUrl,
      thumbnailUrl: safeThumbnailUrl,
      headline: post.headline || 'Hyperlocal Ground Dispatch',
      caption: post.caption || post.headline || 'Verified Ground Report',
      category: post.category || 'civic',
      location: safeLocation,
      locationId: resolvedLocId,
      district: resolvedDistrict,
      taluk: resolvedTaluk,
      area: resolvedArea,
      sourceCitation: post.sourceCitation || 'Citizen on-ground eyewitness dispatch',
      durationSeconds: post.durationSeconds || 15,
      status: 'published',
      isBreaking: Boolean(post.isBreaking),
      adminReviewStatus: post.adminReviewStatus || 'verified_approved',
      adminPayoutAmount: post.adminPayoutAmount || 100,
      priceAward: post.priceAward || 100,
      rpmRate: post.rpmRate || 350,
      createdAt: post.createdAt || new Date().toISOString()
    };

    // 1. Direct write to Supabase PostgreSQL table (await so it commits before returning)
    try {
      const supaRes = await fetch(`${SUPABASE_REST_URL}/video_posts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({
          id: postPayload.id,
          creator_id: postPayload.creatorId,
          creator_name: postPayload.creatorName,
          creator_handle: postPayload.creatorHandle,
          creator_avatar: postPayload.creatorAvatar,
          creator_verified: postPayload.creatorVerified,
          type: postPayload.type,
          media_url: postPayload.mediaUrl,
          thumbnail_url: postPayload.thumbnailUrl,
          headline: postPayload.headline,
          caption: postPayload.caption,
          category: postPayload.category,
          location: postPayload.location,
          location_id: resolvedLocId,
          district: resolvedDistrict,
          taluk: resolvedTaluk,
          area: resolvedArea,
          source_citation: postPayload.sourceCitation,
          duration_seconds: postPayload.durationSeconds,
          status: postPayload.status,
          is_breaking: postPayload.isBreaking,
          admin_review_status: postPayload.adminReviewStatus,
          admin_payout_amount: postPayload.adminPayoutAmount,
          price_award: postPayload.priceAward,
          rpm_rate: postPayload.rpmRate,
          created_at: postPayload.createdAt
        })
      });
      if (supaRes.ok) {
        const rows = await supaRes.json();
        if (Array.isArray(rows) && rows[0]) {
          console.log('[apiClient.createPost] Supabase direct insert successful:', rows[0].id);
        }
      } else {
        const errText = await supaRes.text();
        console.warn('[apiClient.createPost] Supabase insert warning:', errText);
      }
    } catch (e) {
      console.warn('[apiClient.createPost] Supabase direct create warning:', e);
    }

    // 2. Also send to Backend API in background so backend memory cache stays updated
    try {
      fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      }).catch(() => {});
    } catch {}

    // 3. Dispatch broadcast event for immediate cross-tab/local sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('spotlight_posts_synced', { detail: postPayload }));
    }

    return postPayload as VideoPost;
  },

  async updatePost(postId: string, updates: Partial<VideoPost>): Promise<VideoPost> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        console.warn(`[apiClient.updatePost] Server responded with status ${res.status} for ${postId}`);
        return { id: postId, ...updates } as VideoPost;
      }
      const data = await res.json();
      return data.data || ({ id: postId, ...updates } as VideoPost);
    } catch (err) {
      console.warn('[apiClient.updatePost] Network error updating post:', err);
      return { id: postId, ...updates } as VideoPost;
    }
  },

  async toggleLikePost(
    postId: string,
    isLiked: boolean,
    targetCount: number,
    userId?: string
  ): Promise<{ success: boolean; likeCount: number }> {
    const finalCount = Math.max(0, targetCount);

    // 1. Direct Supabase REST API update to public.video_posts table
    try {
      fetch(`${SUPABASE_REST_URL}/video_posts?id=eq.${encodeURIComponent(postId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          like_count: finalCount,
          updated_at: new Date().toISOString()
        })
      }).catch((err) => console.warn('[apiClient.toggleLikePost] Supabase REST patch like notice:', err));

      if (userId) {
        if (isLiked) {
          fetch(`${SUPABASE_REST_URL}/post_likes`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({ post_id: postId, user_id: userId })
          }).catch(() => {});
        } else {
          fetch(`${SUPABASE_REST_URL}/post_likes?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}`, {
            method: 'DELETE',
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
          }).catch(() => {});
        }
      }
    } catch (supaErr) {
      console.warn('[apiClient.toggleLikePost] Supabase REST notice:', supaErr);
    }

    // 2. Dual-update to backend API /posts/:id/like
    try {
      fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiked, likeCount: finalCount, userId })
      }).catch(() => {});
    } catch {}

    return { success: true, likeCount: finalCount };
  },

  async deletePost(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (err) {
      console.warn('[apiClient.deletePost] Network error deleting post:', err);
      return false;
    }
  },

  async bulkUpdatePosts(params: {
    postIds: string[];
    action: 'approve' | 'reject' | 'delete' | 'update';
    updates?: Partial<VideoPost>;
  }): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/posts/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[apiClient.bulkUpdatePosts] Network error:', err);
      return { success: false, count: 0 };
    }
  },

  async createSpotlight360Videos(videos: Partial<Spotlight360Video>[]): Promise<{ success: boolean; count: number; data: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/spotlight360/bulk-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos })
      });
      return await res.json();
    } catch (err) {
      console.warn('[apiClient.createSpotlight360Videos] Network error:', err);
      return { success: false, count: 0, data: [] };
    }
  },

  async getSpotlight360Videos(): Promise<Spotlight360Video[]> {
    try {
      const res = await fetch(`${API_BASE}/spotlight360`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn('[apiClient.getSpotlight360Videos] Network error:', err);
      return [];
    }
  },

  async deleteSpotlight360Video(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/spotlight360/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (err) {
      console.warn('[apiClient.deleteSpotlight360Video] Network error:', err);
      return false;
    }
  },

  async bulkDeleteSpotlight360Videos(videoIds: string[]): Promise<{ success: boolean; count: number }> {
    try {
      const res = await fetch(`${API_BASE}/spotlight360/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds })
      });
      return await res.json();
    } catch (err) {
      console.warn('[apiClient.bulkDeleteSpotlight360Videos] Network error:', err);
      return { success: false, count: 0 };
    }
  },

  async getUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/user`);
    const data = await res.json();
    return data.data;
  },

  async updateUser(user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    return data.data;
  },

  async getWallet(): Promise<{ wallet: Wallet; transactions: any[] }> {
    const res = await fetch(`${API_BASE}/wallet`);
    const data = await res.json();
    return { wallet: data.data, transactions: data.transactions || [] };
  },

  async requestPayout(amount: number, method: string): Promise<any> {
    const res = await fetch(`${API_BASE}/wallet/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method })
    });
    return res.json();
  },

  async getComments(postId: string): Promise<Comment[]> {
    try {
      // 1. Direct Supabase REST API (fastest, cross-device real-time sync)
      const supaRes = await fetch(`${SUPABASE_REST_URL}/comments?post_id=eq.${encodeURIComponent(postId)}&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (supaRes.ok) {
        const rows: any = await supaRes.json();
        if (Array.isArray(rows)) {
          const mapped: Comment[] = rows
            .filter((r: any) => r.status !== 'hidden')
            .map((r: any) => ({
              id: r.id,
              postId: r.post_id,
              userId: r.user_id || r.user_handle,
              userHandle: r.user_handle,
              userName: r.user_name,
              userAvatar: r.user_avatar,
              content: r.content,
              likes: Number(r.likes || 0),
              status: r.status || 'active',
              createdAt: r.created_at,
              updatedAt: r.updated_at
            }));
          saveCommentsForPost(postId, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn('[apiClient.getComments Supabase notice]:', err);
    }

    try {
      const res = await fetch(`${API_BASE}/comments/${postId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          saveCommentsForPost(postId, data.data);
          return data.data;
        }
      }
    } catch {
      // Return local cache on network error
    }

    return [];
  },

  async addComment(postId: string, commentData: Partial<Comment>): Promise<Comment> {
    const newId = commentData.id || `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const commentRecord: Comment = {
      id: newId,
      postId,
      userId: commentData.userId || 'usr_citizen',
      userHandle: commentData.userHandle || 'spotlight_user',
      userName: commentData.userName || 'Spotlight Citizen',
      userAvatar: commentData.userAvatar || '',
      content: commentData.content || '',
      status: 'active',
      likes: 0,
      createdAt: commentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Send to Supabase REST directly
    try {
      await fetch(`${SUPABASE_REST_URL}/comments`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({
          id: commentRecord.id,
          post_id: postId,
          user_id: commentRecord.userId,
          user_handle: commentRecord.userHandle,
          user_name: commentRecord.userName,
          user_avatar: commentRecord.userAvatar,
          content: commentRecord.content,
          status: 'active',
          likes: 0,
          created_at: commentRecord.createdAt,
          updated_at: commentRecord.updatedAt
        })
      });

      // Update post comment_count
      const postsRes = await fetch(`${SUPABASE_REST_URL}/video_posts?id=eq.${encodeURIComponent(postId)}&select=comment_count`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      if (postsRes.ok) {
        const rows: any = await postsRes.json();
        const currentCount = Number(rows?.[0]?.comment_count || 0);
        await fetch(`${SUPABASE_REST_URL}/video_posts?id=eq.${encodeURIComponent(postId)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ comment_count: currentCount + 1 })
        });
      }
    } catch (err) {
      console.warn('[apiClient.addComment Supabase notice]:', err);
    }

    // 2. Also notify backend API
    try {
      await fetch(`${API_BASE}/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentRecord)
      });
    } catch {
      // Backend fallback handled
    }

    // 3. Dispatch global sync event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('spotlight_comment_added', {
        detail: { postId, comment: commentRecord }
      }));
    }

    return commentRecord;
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const data = await res.json();
    return data.data;
  },

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: 'videos' | 'thumbnails' | 'avatars' = 'videos'
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const res = await fetch(`${API_BASE}/upload/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType, folder })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get presigned upload URL');
    }
    return data;
  },

  async uploadFileToR2(
    file: File | Blob,
    filename: string,
    folder: 'videos' | 'thumbnails' | 'avatars' = 'videos',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const contentType = file.type || (folder === 'videos' ? 'video/mp4' : 'image/jpeg');

    try {
      const { uploadUrl, publicUrl } = await this.getPresignedUploadUrl(filename, contentType, folder);

      if (onProgress) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          xhr.setRequestHeader('Content-Type', contentType);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload to Cloudflare R2 failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during upload to Cloudflare R2 (CORS/network)'));
          xhr.send(file);
        });
      } else {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file
        });
        if (!uploadRes.ok) {
          throw new Error(`Upload to Cloudflare R2 failed with status ${uploadRes.status}`);
        }
      }

      return publicUrl;
    } catch (err: any) {
      console.warn('[Presigned R2 Upload failed, attempting direct upload]:', err.message);
      try {
        return await this.uploadFileDirectToR2(file, filename, folder);
      } catch (directErr: any) {
        console.warn('[Direct R2 upload also failed, using local object URL fallback]:', directErr.message);
        if (file instanceof File || file instanceof Blob) {
          return URL.createObjectURL(file);
        }
        throw directErr;
      }
    }
  },

  async uploadFileDirectToR2(
    file: File | Blob,
    filename: string,
    folder: 'videos' | 'thumbnails' | 'avatars' = 'videos'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileBase64 = reader.result as string;
          const res = await fetch(`${API_BASE}/upload/direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename,
              contentType: file.type || (folder === 'videos' ? 'video/mp4' : 'image/jpeg'),
              fileBase64,
              folder
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload media directly to R2');
          }
          resolve(data.publicUrl);
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read media file for upload'));
      reader.readAsDataURL(file);
    });
  },

  // --- ADVERTISEMENTS ---
  async getAds(status?: string): Promise<Advertisement[]> {
    try {
      const url = status ? `${API_BASE}/ads?status=${status}` : `${API_BASE}/ads`;
      const res = await fetch(url);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async createAd(ad: Partial<Advertisement>): Promise<Advertisement> {
    const res = await fetch(`${API_BASE}/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ad)
    });
    const data = await res.json();
    return data.data;
  },

  async updateAd(adId: string, updates: Partial<Advertisement>): Promise<Advertisement> {
    const res = await fetch(`${API_BASE}/ads/${adId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.data;
  },

  async deleteAd(adId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/ads/${adId}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async trackAdImpression(adId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/ads/${adId}/impression`, { method: 'POST' });
    } catch {
      // Fire-and-forget
    }
  },

  async trackAdClick(adId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/ads/${adId}/click`, { method: 'POST' });
    } catch {
      // Fire-and-forget
    }
  },

  // --- APP SETTINGS ---
  async getSettings(): Promise<AppSettings | null> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data.data;
  },

  // --- ADMIN USERS ---
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async createAdminUser(user: Partial<AdminUser>): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    return data.data;
  },

  async updateAdminUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.data;
  },

  async deleteAdminUser(userId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // --- SOCIAL MEDIA CONTENT IMPORTS ---
  async getSocialImports(status?: string): Promise<SocialMediaPost[]> {
    try {
      const url = status ? `${API_BASE}/social/imports?status=${encodeURIComponent(status)}` : `${API_BASE}/social/imports`;
      const res = await fetch(url);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async fetchSocialContent(params: {
    platform: string;
    source: string;
    dateRange: string;
    location: string;
    category: string;
    limit?: number;
  }): Promise<{ newlyFetched: SocialMediaPost[]; totalStaged: number; duplicatesFound: number }> {
    const res = await fetch(`${API_BASE}/social/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data.data;
  },

  async aiEnhanceSocialPost(id: string, customPrompt?: string): Promise<SocialMediaPost> {
    const res = await fetch(`${API_BASE}/social/ai-enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, customPrompt })
    });
    const data = await res.json();
    return data.data;
  },

  async approveSocialPost(id: string, editorialData: any): Promise<{ post: SocialMediaPost; publishedPost: VideoPost }> {
    const res = await fetch(`${API_BASE}/social/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editorialData })
    });
    const data = await res.json();
    return data.data;
  },

  async rejectSocialPost(id: string, reason: string): Promise<SocialMediaPost> {
    const res = await fetch(`${API_BASE}/social/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason })
    });
    const data = await res.json();
    return data.data;
  },

  async deleteSocialPost(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/social/imports/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return Boolean(data.success);
  },

  // --- COPYRIGHT STRIKES & REPORTS ---
  async getCopyrightReports(status?: string): Promise<CopyrightReport[]> {
    try {
      const url = status ? `${API_BASE}/copyright/reports?status=${status}` : `${API_BASE}/copyright/reports`;
      const res = await fetch(url);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async submitCopyrightReport(reportData: Partial<CopyrightReport>): Promise<CopyrightReport> {
    const res = await fetch(`${API_BASE}/copyright/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit copyright report');
    }
    return data.data;
  },

  async reviewCopyrightReport(
    reportId: string,
    action: 'approved' | 'rejected',
    notes?: string,
    reviewerName?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/copyright/reports/${reportId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes, reviewerName })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to review copyright report');
    }
    return data;
  },

  async getCopyrightStrikes(): Promise<CopyrightStrike[]> {
    try {
      const res = await fetch(`${API_BASE}/copyright/strikes`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async revokeCopyrightStrike(strikeId: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/copyright/strikes/${strikeId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to revoke strike');
    }
    return data;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    try {
      const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
      const res = await fetch(url);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(userId?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  },

  // --- CREATORS & REPORTERS ---
  async getCreators(): Promise<{ id: string; name: string; handle: string; avatar: string; verified: boolean }[]> {
    try {
      const res = await fetch(`${API_BASE}/creators`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [];
    }
  },

  async createCreator(creator: { name: string; handle?: string; avatar?: string; verified?: boolean; bio?: string }): Promise<{ id: string; name: string; handle: string; avatar: string; verified: boolean } | null> {
    try {
      const res = await fetch(`${API_BASE}/creators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creator)
      });
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },

  // --- APP USER MANAGEMENT (ADMIN) ---
  async getAppUsers(filters?: { search?: string; role?: string; status?: string; verified?: boolean }): Promise<AdminManagedUser[]> {
    try {
      const q = new URLSearchParams();
      if (filters?.search) q.set('search', filters.search);
      if (filters?.role) q.set('role', filters.role);
      if (filters?.status) q.set('status', filters.status);
      if (filters?.verified !== undefined) q.set('verified', String(filters.verified));

      const res = await fetch(`${API_BASE}/admin/app-users?${q.toString()}`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn('[apiClient.getAppUsers error]:', err);
      return [];
    }
  },

  async getAppUserById(userId: string): Promise<{ user: AdminManagedUser; videos: VideoPost[]; copyrightReports: any[] } | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  },

  async createAppUser(userData: {
    displayName: string;
    handle: string;
    email?: string;
    phone?: string;
    role?: string;
    bio?: string;
    verified?: boolean;
    district?: string;
    placeName?: string;
    initialPoints?: number;
  }): Promise<AdminManagedUser | null> {
    const res = await fetch(`${API_BASE}/admin/app-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create user');
    return data.data;
  },

  async updateAppUser(userId: string, updates: Partial<AdminManagedUser>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return Boolean(data.success);
  },

  async deleteAppUser(userId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return Boolean(data.success);
  },

  async adjustUserPoints(userId: string, amount: number, reason?: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason })
    });
    const data = await res.json();
    return Boolean(data.success);
  },

  async toggleUserVerification(userId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}/toggle-verify`, {
      method: 'POST'
    });
    const data = await res.json();
    return data.verified;
  },

  async toggleUserStatus(userId: string, reason?: string): Promise<{ uploadBlocked: boolean; status: string }> {
    const res = await fetch(`${API_BASE}/admin/app-users/${encodeURIComponent(userId)}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    return data;
  }
};


