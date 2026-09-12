import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AdminAuthProps {
  onLoginSuccess: (adminUser: { id: string; name: string; role: string }) => void;
  onReturnHome: () => void;
}

const DEMO_CREDENTIALS = {
  id: 'admin@localpulse.in',
  password: 'admin'
};

export const AdminAuth: React.FC<AdminAuthProps> = ({
  onLoginSuccess,
  onReturnHome
}) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const trimmedId = adminId.trim().toLowerCase();
      const trimmedPass = password.trim();

      // Check against credentials (supports demo credentials or common admin logins)
      if (
        (trimmedId === DEMO_CREDENTIALS.id || trimmedId === 'admin' || trimmedId === 'bureau_editor') &&
        (trimmedPass === DEMO_CREDENTIALS.password || trimmedPass === 'admin2026' || trimmedPass === 'admin')
      ) {
        onLoginSuccess({
          id: trimmedId,
          name: 'Bureau Editorial Chief',
          role: 'SuperAdmin'
        });
      } else {
        setError('Invalid Bureau credentials. Use the Demo Credentials below or verify your Security Key.');
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setAdminId(DEMO_CREDENTIALS.id);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        color: '#ffffff',
        position: 'relative'
      }}
    >
      {/* Return Home Button */}
      <button
        onClick={onReturnHome}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={14} />
        <span>Citizen App (/)</span>
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '32px 28px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Bureau Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255, 69, 0, 0.15)',
              border: '1.5px solid rgba(255, 69, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              margin: '0 auto 12px'
            }}
          >
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            LocalPulse Bureau Access
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.4 }}>
            Official Editorial & Treasury Authority
            <br />
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Chennai & Tiruvallur Districts (/admin)
            </span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#fca5a5',
              marginBottom: '16px',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Bureau Admin ID
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <User size={16} color="var(--brand-primary)" />
              <input
                type="text"
                placeholder="admin@localpulse.in"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Security Passcode
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <Key size={16} color="var(--brand-primary)" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: '12px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <Lock size={15} />
            <span>{isLoading ? 'Verifying Security Clearance...' : 'Authenticate & Open Desk'}</span>
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
              Quick Demo Access
            </span>
            <button
              onClick={handleFillDemo}
              type="button"
              style={{
                fontSize: '11px',
                color: 'var(--brand-primary)',
                background: 'rgba(255, 69, 0, 0.1)',
                border: '1px solid rgba(255, 69, 0, 0.25)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Fill Credentials
            </button>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.4 }}>
            ID: <code style={{ color: '#ffffff' }}>admin@localpulse.in</code> &bull; Pass: <code style={{ color: '#ffffff' }}>admin</code>
          </div>
        </div>
      </div>
    </div>
  );
};
