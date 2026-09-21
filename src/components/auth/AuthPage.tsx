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

  const handleOneClickGoogle = async () => {
    setError(null);

    // If official Google prompt is ready, trigger it
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
    }

    // In local development or fallback simulation if GIS is not responsive
    setIsLoading(true);
    try {
      const res = await loginWithGoogle('demo_google_one_click', 'creator');
      processAuthResult(res);
    } catch (err: any) {
      // If server rejected demo fallback, show informative message
      if (!gisLoaded) {
        setError('Please sign in using the Google button above.');
      } else {
        setError(err.message || 'Google sign-in error.');
      }
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
        background: 'radial-gradient(circle at 50% 12%, #1e1b4b 0%, #090d16 50%, #030712 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px 80px 16px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        zIndex: 9999
      }}
    >
      {/* Decorative ambient glowing background */}
      <div
        style={{
          position: 'fixed',
          top: '-70px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '420px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(255, 69, 0, 0.28) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: 'auto 0',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '36px 24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(255, 69, 0, 0.15)',
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
            background: 'rgba(255, 69, 0, 0.15)',
            border: '1px solid rgba(255, 69, 0, 0.3)',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ff4500',
              boxShadow: '0 0 8px #ff4500'
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#fb923c',
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
            color: '#ffffff'
          }}
        >
          Welcome to Spotlight
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.65)',
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
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
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
              onClick={handleOneClickGoogle}
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
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Signing in...</span>
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

        {/* Quick Dev Login (Bypasses Google Origin restriction for local testing) */}
        <div style={{ marginBottom: '20px', width: '100%', maxWidth: '320px', margin: '0 auto 20px auto' }}>
          <button
            type="button"
            onClick={handleOneClickGoogle}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 16px',
              borderRadius: '999px',
              background: 'rgba(255, 69, 0, 0.15)',
              border: '1px solid rgba(255, 69, 0, 0.45)',
              color: '#fb923c',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(255, 69, 0, 0.1)'
            }}
          >
            <Zap size={15} />
            <span>Instant SuperAdmin Dev Access (jrinfotech)</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Flame size={14} color="#ff4500" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Earn Rewards</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.3 }}>
              Direct cash bounties for verified citizen reports
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Editorial Bureau</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.3 }}>
              SuperAdmin access automatically synced
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
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
