import React from 'react';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';

export type OlxTabType = 'home' | 'explore' | 'alerts' | 'profile';

export interface OlxBottomNavProps {
  activeTab: OlxTabType;
  onChangeTab: (tab: OlxTabType) => void;
  onOpenPostAd: () => void;
  unreadAlertsCount?: number;
}

export const OlxBottomNav: React.FC<OlxBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenPostAd,
  unreadAlertsCount = 0
}) => {
  return (
    <nav
      className="app-bottom-nav olx-bottom-nav"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 12px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* 1. Home -> OLX Buy & Sell home page */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onChangeTab('home')}
        title="OLX Buy & Sell Home"
        style={{
          color: activeTab === 'home' ? '#ea580c' : '#64748b'
        }}
      >
        <Home size={19} strokeWidth={activeTab === 'home' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'home' ? 700 : 500 }}>Home</span>
      </button>

      {/* 2. Explore -> Product/category browsing page */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => onChangeTab('explore')}
        title="Explore Categories & Listings"
        style={{
          color: activeTab === 'explore' ? '#ea580c' : '#64748b'
        }}
      >
        <Compass size={19} strokeWidth={activeTab === 'explore' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'explore' ? 700 : 500 }}>Explore</span>
      </button>

      {/* 3. Center Elevated + FAB -> Open Post an Ad flow */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          type="button"
          className="nav-create-fab"
          onClick={onOpenPostAd}
          title="Post an Ad on OLX"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4500 0%, #ea580c 100%)',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={22} strokeWidth={2.8} color="#ffffff" />
        </button>
      </div>

      {/* 4. Alerts -> OLX notifications, saved-search alerts, enquiries */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'alerts' ? 'active' : ''}`}
        onClick={() => onChangeTab('alerts')}
        title="OLX Alerts & Enquiries"
        style={{
          color: activeTab === 'alerts' ? '#ea580c' : '#64748b',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <Bell size={19} strokeWidth={activeTab === 'alerts' ? 2.4 : 2} />
          {unreadAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ea580c'
              }}
            />
          )}
        </div>
        <span style={{ fontWeight: activeTab === 'alerts' ? 700 : 500 }}>Alerts</span>
      </button>

      {/* 5. Profile -> OLX-specific user profile / My Ads page */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
        title="OLX Profile & My Ads"
        style={{
          color: activeTab === 'profile' ? '#ea580c' : '#64748b'
        }}
      >
        <User size={19} strokeWidth={activeTab === 'profile' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'profile' ? 700 : 500 }}>Profile</span>
      </button>
    </nav>
  );
};
