import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Zap,
  Flame,
  Radio,
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface AuthPageProps {
  onSuccess?: () => void;
  onAdminSuccess?: () => void;
  onNewUser?: (user: User) => void;
  onClose?: () => void;
  initialMode?: 'google' | 'register' | 'login';
}

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '457891409432-iq0h518ncoq89u9mf4h694mluq7v5sem.apps.googleusercontent.com';

const ADMIN_EMAIL =
  ((import.meta.env.VITE_ADMIN_EMAIL as string) || 'jrinfotechponneri@gmail.com')
    .toLowerCase()
    .trim();

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onAdminSuccess,
  onNewUser,
  onClose,
  initialMode = 'register'
}) => {
  const { loginWithGoogle, register, login } = useAuth();

  const [authMode, setAuthMode] = useState<'google' | 'register' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gisLoaded, setGisLoaded] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    const initGoogleGSI = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_blue',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 320
            });
            setGisLoaded(true);
          }
        } catch (err) {
          console.warn('[Google GIS Init Warning]:', err);
        }
      }
    };

    const timer = setTimeout(initGoogleGSI, 400);
    return () => clearTimeout(timer);
  }, [authMode]);

  const processAuthResult = (res: any) => {
    const userEmail = res.user?.email?.toLowerCase().trim();
    const isUserAdmin =
      res.isAdmin === true ||
      res.user?.role === 'admin' ||
      userEmail === ADMIN_EMAIL;

    // 1. Admin user -> direct Admin Panel
    if (isUserAdmin) {
      if (onAdminSuccess) {
        onAdminSuccess();
      } else if (onSuccess) {
        onSuccess();
      }
      return;
    }

    // 2. New User -> show up profile onboarding
    if (res.isNewUser === true || !res.user?.onboardingCompleted) {
      if (onNewUser) {
        onNewUser(res.user);
      } else if (onSuccess) {
        onSuccess();
      }
      return;
    }

    // 3. Registered User -> direct profile/home
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoogleResponse = async (response: any) => {
    if (!response?.credential) {
      setError('No credential received from Google.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithGoogle(response.credential, 'creator');
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    setError(null);
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('OneTap prompt was not displayed or skipped');
          }
        });
      } catch (e) {
        console.warn('GIS prompt error:', e);
      }
    } else {
      setError('Google Sign-In is initializing. Please tap again in a moment.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await register({
        displayName: name.trim(),
        email: email.trim(),
        password,
        role: 'creator'
      });
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await login({
        identifier: email.trim(),
        password
      });
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 15%, #e1effe 0%, #f4f7fc 38%, #faedf3 72%, #ecf4fd 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        zIndex: 9999
      }}
    >
      {/* Decorative ambient glowing pastel orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-40px',
          left: '20%',
          width: '380px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.25) 0%, rgba(29, 114, 254, 0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '15%',
          width: '320px',
          height: '220px',
          background: 'radial-gradient(ellipse, rgba(253, 164, 175, 0.22) 0%, rgba(254, 215, 170, 0.15) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Glassmorphic Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '28px',
          padding: '32px 24px',
          boxShadow: '0 20px 60px -10px rgba(29, 114, 254, 0.15), 0 10px 30px -5px rgba(15, 23, 42, 0.06)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close / Dismiss Button if launched from inside the app */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            title="Browse as Guest"
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ff4500',
              boxShadow: '0 0 8px rgba(255, 69, 0, 0.6)'
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#ff4500',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            Spotlight Hyperlocal News
          </span>
        </div>

        {/* Title & Description */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
            color: '#0f172a'
          }}
        >
          {authMode === 'register'
            ? 'Create Free Account'
            : authMode === 'login'
            ? 'Welcome Back'
            : 'Welcome to Spotlight'}
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '0 0 20px 0',
            lineHeight: 1.45
          }}
        >
          {authMode === 'register'
            ? 'Register to post news, apply for jobs, buy/sell, and earn verified rewards.'
            : authMode === 'login'
            ? 'Sign in to access your reporter profile, earnings, and saved stories.'
            : 'Watch real-time citizen news spots, report hyperlocal events, and earn verified cash rewards.'}
        </p>

        {/* Navigation Tabs (Register / Login / Google) */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'register' ? '#ffffff' : 'transparent',
              color: authMode === 'register' ? '#ea580c' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            New User (Register)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'login' ? '#ffffff' : 'transparent',
              color: authMode === 'login' ? '#ea580c' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('google');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'google' ? '#ffffff' : 'transparent',
              color: authMode === 'google' ? '#1d72fe' : '#64748b',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'google' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Google SSO
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '12px',
              marginBottom: '16px',
              textAlign: 'left',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleEmailRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Password (min 6 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff4500 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 69, 0, 0.3)'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Register</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Email or Handle
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: GOOGLE ONE-TAP SSO */}
        {authMode === 'google' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '48px',
                width: '100%',
                margin: '10px 0 16px'
              }}
            >
              <div
                ref={googleBtnRef}
                style={{
                  display: gisLoaded ? 'flex' : 'none',
                  justifyContent: 'center',
                  minHeight: '44px',
                  width: '100%'
                }}
              />

              {!gisLoaded && (
                <button
                  type="button"
                  onClick={handleGoogleButtonClick}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    borderRadius: '999px',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: '1px solid #e2e8f0',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" color="#1d72fe" />
                      <span style={{ color: '#1d72fe' }}>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>Secure Google OAuth 2.0 Single Sign-On</span>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: '#fff7ed',
              border: '1px solid #ffedd5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <Flame size={14} color="#ff6b00" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Earn Rewards</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.35 }}>
              Cash bounties for verified local reports
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: '#ecfdf5',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>Verified News</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.35 }}>
              100% authentic community reporting
            </div>
          </div>
        </div>

        {/* Continue as Guest Button */}
        {onClose && (
          <div style={{ marginTop: '18px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px'
              }}
            >
              <span>Explore as Guest without registering</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
