import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminAuthProps {
  onLoginSuccess: (adminUser: { id: string; name: string; role: string }) => void;
  onReturnHome: () => void;
}

const ADMIN_EMAIL =
  ((import.meta.env.VITE_ADMIN_EMAIL as string) || 'jrinfotechponneri@gmail.com')
    .toLowerCase()
    .trim();

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '457891409432-iq0h518ncoq89u9mf4h694mluq7v5sem.apps.googleusercontent.com';

export const AdminAuth: React.FC<AdminAuthProps> = ({
  onLoginSuccess,
  onReturnHome
}) => {
  const { loginWithGoogle } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google GIS for Admin
  useEffect(() => {
    const initGoogleGSI = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleAdminResponse,
            auto_select: false
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 300
            });
            setGisLoaded(true);
          }
        } catch (err) {
          console.warn('[Admin Google Init Warning]:', err);
        }
      }
    };

    const timer = setTimeout(initGoogleGSI, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleAdminResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginWithGoogle(response.credential, 'creator');
      if (data.user.role !== 'admin' && data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        throw new Error(`Access Denied: Google account (${data.user.email}) does not have Bureau Editorial privileges.`);
      }
      onLoginSuccess({
        id: data.user.id,
        name: data.user.displayName,
        role: 'SuperAdmin'
      });
    } catch (err: any) {
      setError(err.message || 'Google Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAdminButtonClick = () => {
    setError(null);
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Admin OneTap prompt was not displayed or skipped');
          }
        });
      } catch (e) {
        console.warn('GIS admin prompt error:', e);
      }
    } else {
      setError('Google Sign-In is initializing. Please wait a moment and try again.');
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
        padding: '60px 16px 80px 16px',
        color: '#0f172a',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        zIndex: 9999
      }}
    >
      {/* Return to App Button */}
      <button
        onClick={onReturnHome}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#ffffff',
          color: '#475569',
          border: '1px solid #e2e8f0',
          padding: '8px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          zIndex: 10000
        }}
      >
        <ArrowLeft size={14} />
        <span>Return to Spotlight App</span>
      </button>

      {/* Main Bureau Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          margin: 'auto 0',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '28px',
          padding: '38px 28px',
          boxShadow: '0 20px 60px -10px rgba(29, 114, 254, 0.12), 0 10px 30px -5px rgba(15, 23, 42, 0.05)',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Terminal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ff4500',
              marginBottom: '14px',
              boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)'
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Bureau Editorial Desk
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Spotlight SuperAdmin Terminal & Payout Clearance Desk
          </p>
        </div>

        {/* Error Notification */}
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
              marginBottom: '18px',
              lineHeight: 1.4,
              textAlign: 'left'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Workspace Bureau OAuth - Single Button */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '44px', width: '100%', marginBottom: '24px' }}>
          <div ref={googleBtnRef} style={{ display: gisLoaded ? 'flex' : 'none', justifyContent: 'center', width: '100%' }} />

          {!gisLoaded && (
            <button
              type="button"
              onClick={handleGoogleAdminButtonClick}
              disabled={isLoading}
              style={{
                width: '100%',
                maxWidth: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 18px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #1d72fe 0%, #0062ff 100%)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(29, 114, 254, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Verifying Bureau Access...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Status Pill */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}
        >
          <Server size={14} color="#1d72fe" />
          <span>Restricted Editorial Bureau Gateway</span>
        </div>
      </div>
    </div>
  );
};
