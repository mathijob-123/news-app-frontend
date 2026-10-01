import React from 'react';
import {
  MapPin,
  Home,
  Newspaper,
  ShoppingBag,
  Briefcase,
  Building,
  Wrench,
  Car,
  Store,
  Calendar,
  Bookmark,
  User,
  ChevronRight,
  X
} from 'lucide-react';

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
  | 'monetization';

interface SidebarProps {
  activeSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  isOpen = false,
  onCloseMobile
}) => {
  const navItems: Array<{
    id: MainNavSection;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'news_feed', label: 'News Feed', icon: <Newspaper size={18} /> },
    { id: 'olx', label: 'OLX / Buy & Sell', icon: <ShoppingBag size={18} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { id: 'real_estate', label: 'Real Estate', icon: <Building size={18} /> },
    { id: 'services', label: 'Services', icon: <Wrench size={18} /> },
    { id: 'vehicles', label: 'Vehicles', icon: <Car size={18} /> },
    { id: 'local_businesses', label: 'Local Businesses', icon: <Store size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> }
  ];

  const bottomNavItems: Array<{
    id: MainNavSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'saved', label: 'Saved', icon: <Bookmark size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> }
  ];

  return (
    <>
      {/* Overlay Backdrop inside App Shell */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 80,
            cursor: 'pointer'
          }}
        />
      )}

      <aside className={`localplus-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            className="localplus-brand-wrapper"
            onClick={() => {
              onSelectSection('home');
              onCloseMobile?.();
            }}
          >
            <div className="localplus-logo-icon">
              <MapPin size={22} fill="#ffffff" color="#ffffff" />
            </div>
            <div className="localplus-brand-text">
              <span className="localplus-brand-title">
                Local<span>Plus</span>
              </span>
              <span className="localplus-brand-tagline">
                Connect • Buy • Sell • Grow
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          {isOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                color: 'var(--lp-slate-body)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
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
          {bottomNavItems.map((item) => {
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
                {isActive && <ChevronRight size={16} color="var(--lp-orange)" />}
              </div>
            );
          })}
        </nav>

      </aside>
    </>
  );
};
