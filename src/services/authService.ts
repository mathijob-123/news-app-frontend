import type { User, RegisterPayload, LoginPayload, AuthResponse } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

export const authService = {
  // 1. Email & Password Register
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create account');
    }
    return data;
  },

  // 2. Email / Handle & Password Login
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to sign in');
    }
    return data;
  },

  // 3. Editorial Bureau Admin Login
  async loginAdmin(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Bureau authentication failed');
    }
    return data;
  },

  // 4. Google OAuth Login / Registration
  async loginWithGoogle(credential: string, role: 'user' | 'creator' = 'creator'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, role })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Google authentication failed');
    }
    return data;
  },

  // 5. Validate session token & fetch current user
  async getCurrentUser(token: string): Promise<{ success: boolean; user: User; wallet?: any; isAdmin?: boolean }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Session expired');
    }
    return data;
  },

  // 6. Direct Avatar Upload to Cloudflare R2
  async uploadAvatarToR2(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageBase64 = reader.result as string;
          const res = await fetch(`${API_BASE}/auth/upload-avatar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type || 'image/jpeg',
              imageBase64
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload avatar to R2');
          }
          resolve(data.publicUrl);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (e) => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },

  // 7. Complete Profile Onboarding for New Users
  async completeOnboarding(
    payload: {
      displayName: string;
      handle: string;
      role: 'creator' | 'user';
      bio?: string;
      homeLocation?: any;
      avatar?: string;
    },
    token: string
  ): Promise<{ success: boolean; user: User; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to complete profile onboarding');
    }
    return data;
  }
};
