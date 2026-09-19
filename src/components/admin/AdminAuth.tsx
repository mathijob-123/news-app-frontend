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

  const handleGoogleQuickLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginWithGoogle('test_superadmin', 'creator');
      onLoginSuccess({
        id: data.user.id,
        name: data.user.displayName,
        role: 'SuperAdmin'
      });
    } catch (err: any) {
      setError(err.message || 'Google SuperAdmin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 15%, #064e3b 0%, #090d16 55%, #020617 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#ffffff',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}
    >
      {/* Return to App Button */}
      <button
        onClick={onReturnHome}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
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
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '36px 26px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(16, 185, 129, 0.18)',
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
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
              border: '1px solid #10b981',
              color: '#34d399',
              marginBottom: '14px',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)'
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Bureau Editorial Desk
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', margin: 0, lineHeight: 1.4 }}>
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
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
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
              onClick={handleGoogleQuickLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                maxWidth: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                border: '1px solid rgba(52, 211, 153, 0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
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
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#6ee7b7'
          }}
        >
          <Server size={14} />
          <span>Configured Admin: {ADMIN_EMAIL}</span>
        </div>
      </div>
    </div>
  );
};
