import React, { useState } from 'react';
import {
  Home,
  Coins,
  Bookmark,
  User,
  ShieldCheck,
  ChevronRight,
  Download,
  X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LegalModal } from '../common/LegalModal';

export type MainNavSection =
  | 'home'
  | 'news_feed'
  | 'olx'
  | 'jobs'
  | 'real_estate'
  | 'services'
  | 'vehicles'
  | 'local_businesses'
  | 'events'
  | 'saved'
  | 'profile'
  | 'spots'
  | 'monetization'
  | 'admin';

interface SidebarProps {
  activeSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpen = false,
  onCloseMobile,
  onOpenPrivacy,
  onOpenTerms
}) => {
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  const navItems: Array<{
    id: MainNavSection;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'monetization', label: 'Points', icon: <Coins size={18} /> }
  ];

  const secondaryItems: Array<{
    id: MainNavSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'saved', label: 'Saved', icon: <Bookmark size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  return (
    <>
      {/* Full-screen Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 90,
            cursor: 'pointer'
          }}
        />
      )}

      <aside className={`localplus-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--lp-border)'
          }}
        >
          <div
            className="localplus-brand-wrapper"
            style={{ marginBottom: 0 }}
            onClick={() => {
              onSelectSection('home');
              onCloseMobile?.();
            }}
          >
            <div
              className="localplus-logo-icon"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                overflow: 'hidden',
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: '10px'
              }}
            >
              <img
                src="/logo.png"
                alt="Spotlight360"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="localplus-brand-text">
              <span className="localplus-brand-title">
                Spotlight<span>360</span>
              </span>
              <span className="localplus-brand-tagline">
                Connect • Buy • Sell • Grow
              </span>
            </div>
          </div>

          {/* Close button for drawer */}
          {isOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px',
                color: 'var(--lp-slate-body)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Primary Navigation List */}
        <nav className="sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <div
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile?.();
                }}
              >
                <div className="sidebar-nav-left">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive ? (
                  <ChevronRight size={16} color="var(--lp-orange)" />
                ) : item.badge ? (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                ) : null}
              </div>
            );
          })}

          <div className="sidebar-divider" />

          {/* Secondary links (Saved, Profile) */}
          {secondaryItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <div
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile?.();
                }}
              >
                <div className="sidebar-nav-left">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive ? (
                  <ChevronRight size={16} color="var(--lp-orange)" />
                ) : (
                  <ChevronRight size={14} color="#94a3b8" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Download Android App Button (Visible on Web & Mobile Browsers) */}
        {!Capacitor.isNativePlatform() && (
          <div style={{ padding: '0 12px', marginTop: 'auto', paddingTop: '16px' }}>
            <a
              href="/Spotlight360-release.apk"
              download="Spotlight360-release.apk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '11px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)',
                boxSizing: 'border-box',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              title="Download Android APK"
            >
              <Download size={16} />
              <span>Download Android App</span>
            </a>
          </div>
        )}

        {/* Small Privacy & Terms links positioned at bottom */}
        <div
          style={{
            marginTop: Capacitor.isNativePlatform() ? 'auto' : '8px',
            paddingTop: '20px',
            paddingBottom: '14px',
            paddingLeft: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px'
          }}
        >
          <button
            onClick={() => {
              if (onOpenPrivacy) onOpenPrivacy();
              else setLegalModalTab('privacy');
              onCloseMobile?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            title="Privacy Policy"
          >
            Privacy
          </button>

          <button
            onClick={() => {
              if (onOpenTerms) onOpenTerms();
              else setLegalModalTab('terms');
              onCloseMobile?.();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              letterSpacing: '-0.01em',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            title="Terms of Use"
          >
            Terms and use
          </button>
        </div>
      </aside>

      {/* Built-in Legal Modal for Privacy Policy & Terms of Use */}
      <LegalModal
        isOpen={legalModalTab !== null}
        initialTab={legalModalTab || 'privacy'}
        onClose={() => setLegalModalTab(null)}
      />
    </>
  );
};
