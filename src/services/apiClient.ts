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
  }
};
