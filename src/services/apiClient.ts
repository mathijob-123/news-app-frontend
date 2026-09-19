import type { VideoPost, User, Wallet, Comment, AdminStats } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

export const apiClient = {
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getPosts(): Promise<VideoPost[]> {
    const res = await fetch(`${API_BASE}/posts`);
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
  }
};
