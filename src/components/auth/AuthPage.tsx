import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Zap,
  Flame,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface AuthPageProps {
  onSuccess?: () => void;
  onAdminSuccess?: () => void;
  onNewUser?: (user: User) => void;
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
  onNewUser
}) => {
  const { loginWithGoogle } = useAuth();

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
  }, []);

  const processAuthResult = (res: any) => {
    const userEmail = res.user?.email?.toLowerCase().trim();
    const isUserAdmin =
      res.isAdmin === true ||
      res.user?.role === 'admin' ||
      userEmail === ADMIN_EMAIL;

    // 1. Admin user (Env hardcoded) -> direct Admin Panel
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

    // 3. Old User -> direct login
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        /* Soft, airy pastel mesh canvas from Image 2 */
        background: 'radial-gradient(circle at 20% 15%, #e1effe 0%, #f4f7fc 38%, #faedf3 72%, #ecf4fd 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px 80px 16px',
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

      {/* Main Glassmorphic Container (Image 2 Model) */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: 'auto 0',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '28px',
          padding: '38px 28px',
          boxShadow: '0 20px 60px -10px rgba(29, 114, 254, 0.12), 0 10px 30px -5px rgba(15, 23, 42, 0.05)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center'
        }}
      >
        {/* Brand Header Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            marginBottom: '18px'
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
            fontSize: '26px',
            fontWeight: 800,
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
            color: '#0f172a'
          }}
        >
          Welcome to Spotlight
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#64748b',
            margin: '0 0 28px 0',
            lineHeight: 1.5
          }}
        >
          Watch real-time citizen news spots, report hyperlocal events, and earn verified cash rewards.
        </p>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '12px',
              marginBottom: '20px',
              textAlign: 'left',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Single Google Authentication Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '48px',
            width: '100%',
            marginBottom: '24px'
          }}
        >
          {/* Official GIS Button Render Container */}
          <div
            ref={googleBtnRef}
            style={{
              display: gisLoaded ? 'flex' : 'none',
              justifyContent: 'center',
              minHeight: '44px',
              width: '100%'
            }}
          />

          {/* Styled Google Button - displayed only when official GIS is loading or not active */}
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

        {/* Feature Highlights (Pastel Badge Cards from Image 2) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: '#fff7ed',
              border: '1px solid #ffedd5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Flame size={15} color="#ff6b00" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Earn Rewards</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
              Direct cash bounties for verified citizen reports
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              background: '#ecfdf5',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={15} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Verified News</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
              Authentic stories verified by local community
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            marginTop: '22px',
            fontSize: '11px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>Secure Google OAuth 2.0 Single Sign-On</span>
        </div>
      </div>
    </div>
  );
};
