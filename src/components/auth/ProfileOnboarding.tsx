import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Zap,
  User as UserIcon,
  MapPin,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { User, LocationCoordinates } from '../../types';

interface ProfileOnboardingProps {
  initialUser: User;
  onComplete: (user: User) => void;
}

interface DistrictOption {
  name: string;
  lat: number;
  lng: number;
  district: string;
}

const DISTRICT_OPTIONS: DistrictOption[] = [
  { name: 'Chennai Hub', lat: 13.0827, lng: 80.2707, district: 'Chennai' },
  { name: 'Ponneri', lat: 13.3323, lng: 80.1985, district: 'Tiruvallur' },
  { name: 'Anna Nagar', lat: 13.0878, lng: 80.2170, district: 'Chennai' },
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, district: 'Chennai' },
  { name: 'Tambaram', lat: 12.9249, lng: 80.1000, district: 'Chengalpattu' },
  { name: 'Velachery', lat: 12.9815, lng: 80.2180, district: 'Chennai' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, district: 'Coimbatore' },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198, district: 'Madurai' },
  { name: 'Salem', lat: 11.6643, lng: 78.1460, district: 'Salem' },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, district: 'Tiruchirappalli' }
];

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({
  initialUser,
  onComplete
}) => {
  const { completeOnboarding } = useAuth();

  const [displayName, setDisplayName] = useState(initialUser.displayName || '');
  const [handle, setHandle] = useState(
    initialUser.handle ||
    initialUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 15) ||
    'reporter'
  );
  const [role, setRole] = useState<'creator' | 'user'>('creator');
  const [bio, setBio] = useState(
    initialUser.bio || 'Local reporter sharing verified community news and breaking spots.'
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialUser.homeLocation?.placeName || 'Chennai Hub'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDistrictOption =
    DISTRICT_OPTIONS.find((d) => d.name === selectedDistrict) || DISTRICT_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Please provide your display name.');
      return;
    }

    const cleanHandle = handle.trim().toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]/g, '_');
    if (!cleanHandle) {
      setError('Please enter a valid unique handle.');
      return;
    }

    const locConfig = DISTRICT_OPTIONS.find((d) => d.name === selectedDistrict) || {
      name: selectedDistrict,
      lat: 13.0827,
      lng: 80.2707,
      district: selectedDistrict
    };

    const homeLocation: LocationCoordinates = {
      lat: locConfig.lat,
      lng: locConfig.lng,
      placeName: locConfig.name,
      district: locConfig.district
    };

    setIsSubmitting(true);
    try {
      const updatedUser = await completeOnboarding({
        displayName: displayName.trim(),
        handle: cleanHandle,
        role,
        bio: bio.trim(),
        homeLocation,
        avatar: initialUser.avatar || undefined
      });

      onComplete(updatedUser);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at 50% 10%, #1e1b4b 0%, #090d16 50%, #030712 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient glowing background */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '450px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(255, 69, 0, 0.22) 0%, rgba(245, 158, 11, 0.12) 40%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Glassmorphic Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 69, 0, 0.12)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '999px',
              background: 'rgba(255, 69, 0, 0.15)',
              border: '1px solid rgba(255, 69, 0, 0.3)',
              marginBottom: '10px'
            }}
          >
            <Sparkles size={14} color="#ff4500" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fb923c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Welcome to Spotlight
            </span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Set Up Your Reporter Profile
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', margin: 0, lineHeight: 1.4 }}>
            Tailor your identity and news hub to start publishing and watching hyperlocal spots.
          </p>
        </div>

        {/* Error Alert */}
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
              marginBottom: '16px',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Verified Google Account Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={initialUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initialUser.displayName || 'User')}`}
                alt={initialUser.displayName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initialUser.displayName || 'User')}`;
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ff4500'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
                }}
                title="Verified with Google"
              >
                <svg width="12" height="12" viewBox="0 0 24 24">
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
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  Google Profile Picture
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  Verified
                </span>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.55)',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {initialUser.email || 'Connected Google Account'}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
              Choose How You Want to Use Spotlight
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setRole('creator')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: role === 'creator' ? 'rgba(255, 69, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: role === 'creator' ? '1.5px solid #ff4500' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} color="#ff4500" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: role === 'creator' ? '#ff4500' : '#ffffff' }}>
                    Citizen Creator
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.3 }}>
                  Record breaking spots & earn cash rewards from verified news
                </span>
              </div>

              <div
                onClick={() => setRole('user')}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: role === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: role === 'user' ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={15} color="#3b82f6" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: role === 'user' ? '#3b82f6' : '#ffffff' }}>
                    Community Reader
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.3 }}>
                  Watch live hyperlocal video feed, explore maps & follow reporters
                </span>
              </div>
            </div>
          </div>

          {/* Full Name & Handle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '5px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={14} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (!handle || handle === 'reporter') {
                      setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 15));
                    }
                  }}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 32px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '5px' }}>
                Handle (@username)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '9px', color: '#ff4500', fontWeight: 800, fontSize: '13px' }}>@</span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 18))}
                  placeholder="handle"
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 28px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Primary News District - CUSTOM DROPDOWN */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '5px' }}>
              Primary News District / Hub
            </label>

            {/* Custom Dropdown Trigger Button */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isDropdownOpen ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.06)',
                border: isDropdownOpen ? '1.5px solid #ff4500' : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                boxShadow: isDropdownOpen ? '0 0 16px rgba(255, 69, 0, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} color="#ff4500" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                  {currentDistrictOption.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {currentDistrictOption.district}
                </span>
              </div>

              <ChevronDown
                size={16}
                color="rgba(255, 255, 255, 0.6)"
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>

            {/* Floating Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  maxHeight: '230px',
                  overflowY: 'auto',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '14px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 69, 0, 0.1)',
                  zIndex: 50,
                  padding: '6px',
                  boxSizing: 'border-box'
                }}
              >
                {DISTRICT_OPTIONS.map((item) => {
                  const isSelected = item.name === selectedDistrict;
                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        setSelectedDistrict(item.name);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(255, 69, 0, 0.15)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        marginBottom: '2px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={13} color={isSelected ? '#ff4500' : 'rgba(255, 255, 255, 0.4)'} />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)'
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            color: isSelected ? '#fb923c' : 'rgba(255, 255, 255, 0.45)',
                            background: isSelected ? 'rgba(255, 69, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {item.district}
                        </span>
                      </div>

                      {isSelected && <Check size={14} color="#ff4500" strokeWidth={2.5} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reporter Bio */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '5px' }}>
              Short Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Hyperlocal reporter tracking civic developments"
              maxLength={120}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '6px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff4500 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(255, 69, 0, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="spin" />
                <span>Finalizing Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Profile & Enter Spotlight</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
