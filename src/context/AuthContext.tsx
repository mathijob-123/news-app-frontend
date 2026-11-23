import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, RegisterPayload, LoginPayload, AuthResponse, Wallet } from '../types';
import { authService } from '../services/authService';
import { saveWallet, resetStoredWallet } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  wallet: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  loginWithGoogle: (credential: string, role?: 'user' | 'creator') => Promise<AuthResponse>;
  loginAdmin: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  completeOnboarding: (data: {
    displayName: string;
    handle: string;
    role: 'creator' | 'user';
    bio?: string;
    homeLocation?: any;
    avatar?: string;
  }) => Promise<User>;
}

const AUTH_TOKEN_KEY = 'spotlight_auth_token_v1';
const AUTH_USER_KEY = 'spotlight_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [wallet, setWallet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const persistSession = (tokenVal: string, userVal: User, walletVal?: any) => {
    setToken(tokenVal);
    setUser(userVal);
    
    // Synchronize user wallet to localStorage so Monetization/Profile shows fresh accurate points
    const userWallet: Wallet = {
      id: walletVal?.id || `wlt_${userVal.id}`,
      userId: userVal.id,
      balance: Number(walletVal?.balance) || 0.0,
      lifetimeEarnings: Number(walletVal?.lifetimeEarnings ?? walletVal?.lifetime_earnings) || 0.0,
      thisMonthEarnings: Number(walletVal?.thisMonthEarnings ?? walletVal?.this_month_earnings) || 0.0,
      nextPayoutDate: walletVal?.nextPayoutDate || walletVal?.next_payout_date || 'Not Scheduled',
      payoutMethod: walletVal?.payoutMethod || walletVal?.payout_method || 'UPI Direct (Not Linked)',
      qualifiedViewsTotal: Number(walletVal?.qualifiedViewsTotal ?? walletVal?.qualified_views_total) || 0
    };
    saveWallet(userWallet);
    setWallet(userWallet);

    localStorage.setItem(AUTH_TOKEN_KEY, tokenVal);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userVal));
  };

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setWallet(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem('lp_admin_session_v1');
    resetStoredWallet();
  }, []);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const data = await authService.getCurrentUser(storedToken);
        if (isMounted && data.user) {
          setUser(data.user);
          if (data.wallet) setWallet(data.wallet);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }
      } catch (err: any) {
        // Only clear session if server explicitly returned 401 Unauthorized
        if (err?.message === 'Unauthorized' && !storedToken.startsWith('local_')) {
          console.warn('[AuthContext] Session unauthorized (401), logging out.');
          if (isMounted) clearSession();
        } else {
          // Keep existing cached user session so app stays logged in!
          const stored = localStorage.getItem(AUTH_USER_KEY);
          if (stored && isMounted) {
            try {
              setUser(JSON.parse(stored));
            } catch {}
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();
    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await authService.login(payload);
    persistSession(data.token, data.user, data.wallet);
    return data;
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const data = await authService.register(payload);
    persistSession(data.token, data.user, data.wallet);
    return data;
  };

  const loginWithGoogle = async (credential: string, role: 'user' | 'creator' = 'creator'): Promise<AuthResponse> => {
    const data = await authService.loginWithGoogle(credential, role);
    persistSession(data.token, data.user, data.wallet);
    return data;
  };

  const loginAdmin = async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await authService.loginAdmin(payload);
    persistSession(data.token, data.user, data.wallet);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(merged));
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await authService.getCurrentUser(token);
      setUser(data.user);
      if (data.wallet) setWallet(data.wallet);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    } catch (err) {
      console.error('[AuthContext] Failed to refresh user:', err);
    }
  };

  const completeOnboarding = async (data: {
    displayName: string;
    handle: string;
    role: 'creator' | 'user';
    bio?: string;
    homeLocation?: any;
    avatar?: string;
  }): Promise<User> => {
    if (!token) throw new Error('Not authenticated');
    const res = await authService.completeOnboarding(data, token);
    const updatedUser: User = { ...res.user, onboardingCompleted: true };
    const newToken = res.token || token;
    persistSession(newToken, updatedUser);
    return updatedUser;
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isCreator = user?.role === 'creator' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        wallet,
        isAuthenticated,
        isAdmin,
        isCreator,
        loading,
        login,
        register,
        loginWithGoogle,
        loginAdmin,
        logout,
        updateUser,
        refreshUser,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
