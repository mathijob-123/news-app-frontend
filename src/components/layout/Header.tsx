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
  Award,
  Menu
} from 'lucide-react';
import type { LocationCoordinates } from '../../types';
import { PRESET_LOCATIONS } from '../../services/geoService';
import { useAuth } from '../../context/AuthContext';
import { LocationPickerModal } from '../common/LocationPickerModal';

interface HeaderProps {
  activeLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
  onOpenSearch: () => void;
  onOpenAdmin?: () => void;
  onOpenNotifications?: () => void;
  onToggleMenu?: () => void;
  onOpenProfile?: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  onSelectLocation,
  onOpenSearch,
  onOpenAdmin,
  onOpenNotifications,
  onToggleMenu,
  onOpenProfile,
  unreadAlertCount = 0
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      <header className="app-header">
        {/* Brand Logo & Hamburger Menu */}
        <div className="header-left">
          {onToggleMenu && (
            <button
              onClick={onToggleMenu}
              className="header-icon-btn menu-btn"
              title="Menu & Marketplace Modules"
            >
              <Menu size={16} />
            </button>
          )}
          <div className="app-logo">
            <div className="header-logo-icon" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
              <img src="/logo.png" alt="Spotlight360" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="header-logo-text">
              Spotlight<span className="header-logo-accent">360</span>
            </span>
          </div>
        </div>

        {/* Dynamic Location Switcher */}
        <button
          className="location-pill-btn"
          onClick={() => setShowLocationModal(true)}
          title="Change your active viewing location"
        >
          <MapPin size={12} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <span className="location-name">{activeLocation.neighborhood || activeLocation.placeName}</span>
          <ChevronDown size={11} style={{ flexShrink: 0 }} />
        </button>

        {/* Action icons & User Profile Menu */}
        <div className="header-right">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="header-icon-btn notif-btn"
            style={{
              color: unreadAlertCount > 0 ? '#ea580c' : 'var(--text-secondary)'
            }}
            title="Notifications & Bureau Alerts"
          >
            <Bell size={16} />
            {unreadAlertCount > 0 && (
              <span className="notif-badge">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="header-icon-btn search-btn"
            title="Search local news and places"
          >
            <Search size={16} />
          </button>

          {/* User Profile Avatar Pill / Guest Login Button */}
          {user ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="header-user-avatar-btn"
                style={{
                  background: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 69, 0, 0.08)',
                  border: isAdmin ? '1px solid #10b981' : '1px solid rgba(255, 69, 0, 0.25)'
                }}
                title={user.displayName}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=ea580c&textColor=ffffff`}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=ea580c&textColor=ffffff`;
                  }}
                  className="header-user-avatar-img"
                />
                {isAdmin ? (
                  <ShieldCheck size={12} color="#059669" />
                ) : user.isCreator ? (
                  <Flame size={11} color="#ff4500" />
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
          ) : (
            <button
              onClick={onOpenProfile}
              className="header-login-btn"
              title="Sign in or Register"
            >
              <UserIcon size={12} />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Location Picker Sheet */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        activeLocation={activeLocation}
        onSelectLocation={onSelectLocation}
      />
    </>
  );
};
