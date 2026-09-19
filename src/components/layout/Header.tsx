import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  Search,
  ChevronDown,
  Check,
  Compass,
  Radio,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Sparkles,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import type { LocationCoordinates } from '../../types';
import { PRESET_LOCATIONS } from '../../services/geoService';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  activeLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  onSelectLocation,
  onOpenSearch,
  onOpenAdmin,
  unreadAlertCount = 2
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="app-header">
        {/* Brand Logo */}
        <div className="app-logo">
          <div className="pulse-beacon" />
          <span style={{ letterSpacing: '-0.03em' }}>LocalPulse</span>
        </div>

        {/* Dynamic Location Switcher */}
        <button
          className="location-pill-btn"
          onClick={() => setShowLocationModal(true)}
          title="Change your active viewing location"
        >
          <MapPin size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <span>{activeLocation.neighborhood || activeLocation.placeName}</span>
          <ChevronDown size={12} style={{ flexShrink: 0 }} />
        </button>

        {/* Action icons & User Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <button
            onClick={onOpenSearch}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Search local news and places"
          >
            <Search size={16} />
          </button>

          {/* User Profile Avatar Pill */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 6px 3px 3px',
                  borderRadius: '20px',
                  background: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 69, 0, 0.08)',
                  border: isAdmin ? '1px solid #10b981' : '1px solid rgba(255, 69, 0, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title={user.displayName}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}`}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}`;
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                {isAdmin ? (
                  <ShieldCheck size={13} color="#059669" />
                ) : user.isCreator ? (
                  <Flame size={12} color="#ff4500" />
                ) : null}
              </button>

              {/* Dropdown Popup Menu */}
              {showProfileMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '36px',
                      right: '0',
                      width: '220px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                      border: '1px solid #e2e8f0',
                      zIndex: 100,
                      animation: 'fadeIn 0.15s ease'
                    }}
                  >
                    {/* User info */}
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                        {user.displayName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        @{user.handle}
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        {isAdmin ? (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid #a7f3d0'
                            }}
                          >
                            SuperAdmin Bureau
                          </span>
                        ) : user.isCreator ? (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              background: '#fff7ed',
                              color: '#ea580c',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid #fed7aa'
                            }}
                          >
                            Citizen Creator
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}
                          >
                            Local Reader
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isAdmin && onOpenAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAdmin();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: '#0f172a',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          marginBottom: '6px'
                        }}
                      >
                        <ShieldCheck size={14} color="#10b981" />
                        <span>Bureau Admin Desk</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #fecaca',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Location Picker Sheet */}
      {showLocationModal && (
        <div
          className="bottom-sheet-backdrop"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: '20px' }}
          >
            <div className="sheet-handle-bar" />
            <div className="bottom-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Set Your Local Hub</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Done
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Content feeds, distance decay tags, and Spots reels dynamically rank based on your proximity to news events.
              </p>

              {PRESET_LOCATIONS.map((loc) => {
                const isSelected = loc.lat === activeLocation.lat && loc.lng === activeLocation.lng;
                return (
                  <button
                    key={loc.placeName}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowLocationModal(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isSelected ? '#fff7ed' : '#ffffff',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? 'var(--brand-gradient)' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        <Radio size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {loc.neighborhood}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {loc.placeName} • Radius {loc.radiusMeters ? loc.radiusMeters / 1000 : 3}km
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={18} color="var(--brand-primary)" />}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const userGps: LocationCoordinates = {
                          placeName: 'My Live GPS Location',
                          neighborhood: 'Live Coordinates',
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                          radiusMeters: 3000
                        };
                        onSelectLocation(userGps);
                        setShowLocationModal(false);
                      },
                      () => alert('Could not get GPS. Using Downtown Metro default.')
                    );
                  }
                }}
                className="btn-secondary"
                style={{ marginTop: '8px', width: '100%', fontSize: '12px' }}
              >
                <MapPin size={14} color="var(--brand-primary)" />
                Use Device GPS Live Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
