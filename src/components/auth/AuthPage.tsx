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
  Phone,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import type { User } from '../../types';

interface AuthPageProps {
  onSuccess?: () => void;
  onAdminSuccess?: () => void;
  onNewUser?: (user: User) => void;
  onClose?: () => void;
  initialMode?: 'google' | 'register' | 'login';
}

const GOOGLE_CLIENT_ID = (
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '457891409432-iq0h518ncoq89u9mf4h694mluq7v5sem.apps.googleusercontent.com'
).trim();

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
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [forgotStep, setForgotStep] = useState<'none' | 'request' | 'verify'>('none');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Detect password reset link (?resetToken=...&email=...) in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const urlToken = sp.get('resetToken');
    const urlEmail = sp.get('email');
    if (urlToken) {
      setAuthMode('login');
      setForgotStep('verify');
      setResetToken(urlToken);
      if (urlEmail) setEmail(urlEmail);
      setSuccessMessage('Enter your new password below to complete your reset.');
      try {
        sp.delete('resetToken');
        sp.delete('email');
        const nextQuery = sp.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      } catch {}
    }
  }, []);

  // Initialize Google Identity Services (GIS) when Google tab is active
  useEffect(() => {
    if (authMode !== 'google') return;

    let cancelled = false;
    let attempts = 0;

    const initGoogleGSI = (): boolean => {
      if (cancelled || !googleBtnRef.current) return false;
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

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
          return true;
        } catch (err) {
          console.warn('[Google GIS Init Warning]:', err);
        }
      }
      return false;
    };

    if (!initGoogleGSI()) {
      const interval = setInterval(() => {
        attempts += 1;
        if (initGoogleGSI() || attempts >= 40) {
          clearInterval(interval);
        }
      }, 250);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
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
            const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.() || 'suppressed';
            console.warn('Google OneTap prompt not displayed or skipped:', reason);
            setError('Google Sign-In popup was blocked or dismissed by the browser. Please allow popups/third-party sign-in or use Register / Sign In above.');
          }
        });
      } catch (e: any) {
        console.warn('GIS prompt error:', e);
        setError(e?.message || 'Unable to open Google Sign-In prompt.');
      }
    } else {
      setError('Google Sign-In is still loading or blocked by your browser/network. Please retry or use Register / Sign In above.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !password) {
      setError('Please fill in your name, mobile phone number, email, and password.');
      return;
    }
    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
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
        phone: cleanPhone,
        email: email.trim(),
        password,
        role: 'creator'
      });
      processAuthResult(res);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email or phone number may already exist.');
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
    setSuccessMessage(null);
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

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await authService.requestPasswordReset(email.trim());
      setResetToken('');
      setForgotStep('verify');
      setSuccessMessage(res.message || 'Reset code sent! Check your email inbox or spam folder.');
    } catch (err: any) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken && (!email.trim() || !resetOtp.trim())) {
      setError('Please enter your email and the 6-digit code sent to your inbox.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim() || undefined,
        otp: resetToken ? undefined : resetOtp.trim(),
        token: resetToken || undefined,
        newPassword
      });
      setForgotStep('none');
      setResetOtp('');
      setResetToken('');
      setNewPassword('');
      setPassword('');
      setSuccessMessage(res.message || 'Password updated! You can now sign in with your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code.');
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
              setForgotStep('none');
              setError(null);
              setSuccessMessage(null);
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
              setSuccessMessage(null);
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
              setForgotStep('none');
              setError(null);
              setSuccessMessage(null);
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

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              fontSize: '12px',
              marginBottom: '16px',
              textAlign: 'left',
              lineHeight: 1.4
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMessage}</span>
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
                  placeholder="Enter your name"
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
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Mobile Phone Number</span>
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800, background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                  * Mandatory
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  placeholder="Enter your email"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: showPassword ? '#ff4500' : '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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

        {/* TAB 2: SIGN IN FORM & FORGOT PASSWORD */}
        {authMode === 'login' && forgotStep === 'none' && (
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
                  placeholder="Enter your email or handle"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: showPassword ? '#ff4500' : '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setForgotStep('request');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ea580c',
                    cursor: 'pointer'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '2px',
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

        {authMode === 'login' && forgotStep === 'request' && (
          <form onSubmit={handleRequestPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  required
                  placeholder="Enter your account email"
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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '4px',
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
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotStep('none');
                setError(null);
                setSuccessMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {authMode === 'login' && forgotStep === 'verify' && (
          <form onSubmit={handleConfirmPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!resetToken && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
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
                    6-Digit Reset Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code from email"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        letterSpacing: '2px',
                        outline: 'none',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                New Password (min 6 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: showPassword ? '#ff4500' : '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '4px',
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setResetToken('');
                  setForgotStep('request');
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ea580c',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetToken('');
                  setForgotStep('none');
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Sign In
              </button>
            </div>
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
                  display: gisLoaded && !isLoading ? 'flex' : 'none',
                  justifyContent: 'center',
                  minHeight: '44px',
                  width: '100%'
                }}
              />

              {(!gisLoaded || isLoading) && (
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
                marginBottom: '12px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>Secure Google OAuth 2.0 Single Sign-On</span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#475569',
                lineHeight: 1.45,
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              💡 <strong>Note / குறிப்பு:</strong> Google-ல் <em>Unauthorized Error</em> வந்தால், மேலிருக்கும் <strong>New User (Register)</strong> அல்லது <strong>Sign In</strong> டேப் மூலம் பெயர் & மொபைல் எண் கொடுத்து உடனடியாக 1 வினாடியில் லாகின் செய்யலாம்!
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
