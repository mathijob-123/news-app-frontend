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
  Spotlight360Video
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

export const apiClient = {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getPosts(params?: { status?: string; includeScheduled?: boolean }): Promise<VideoPost[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.includeScheduled) query.set('includeScheduled', 'true');
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/posts${qs ? `?${qs}` : ''}`);
    const data = await res.json();
    return data.data || [];
  },

  async createPost(post: Partial<VideoPost>): Promise<VideoPost> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    const data = await res.json();
    return data.data;
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
    const res = await fetch(`${API_BASE}/comments/${postId}`);
    const data = await res.json();
    return data.data || [];
  },

  async addComment(postId: string, commentData: Partial<Comment>): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    const data = await res.json();
    return data.data;
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
    const { uploadUrl, publicUrl } = await this.getPresignedUploadUrl(filename, contentType, folder);

    try {
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
      console.warn('[Presigned R2 Upload failed, falling back to direct upload]:', err.message);
      return this.uploadFileDirectToR2(file, filename, folder);
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
  }
};


