import React from 'react';
import { Home, Compass, Plus, Bookmark, User } from 'lucide-react';

export type RealEstateTabType = 'home' | 'explore' | 'saved' | 'profile';

export interface RealEstateBottomNavProps {
  activeTab: RealEstateTabType;
  onChangeTab: (tab: RealEstateTabType) => void;
  onOpenPostProperty: () => void;
  savedCount?: number;
}

export const RealEstateBottomNav: React.FC<RealEstateBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenPostProperty,
  savedCount = 0
}) => {
  return (
    <nav
      className="app-bottom-nav realestate-bottom-nav"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 12px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onChangeTab('home')}
        title="Real Estate Home"
        style={{
          color: activeTab === 'home' ? '#ea580c' : '#64748b'
        }}
      >
        <Home size={19} strokeWidth={activeTab === 'home' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'home' ? 700 : 500 }}>Home</span>
      </button>

      {/* 2. Explore */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => onChangeTab('explore')}
        title="Explore Properties & Projects"
        style={{
          color: activeTab === 'explore' ? '#ea580c' : '#64748b'
        }}
      >
        <Compass size={19} strokeWidth={activeTab === 'explore' ? 2.4 : 2} />
        <span style={{ fontWeight: activeTab === 'explore' ? 700 : 500 }}>Explore</span>
      </button>

      {/* 3. Center Elevated + FAB -> Post Property */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          type="button"
          className="nav-create-fab"
          onClick={onOpenPostProperty}
          title="Post Property (Rent / Sell)"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
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

      {/* 4. Saved */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'saved' ? 'active' : ''}`}
        onClick={() => onChangeTab('saved')}
        title="Saved Properties"
        style={{
          color: activeTab === 'saved' ? '#ea580c' : '#64748b',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <Bookmark size={19} strokeWidth={activeTab === 'saved' ? 2.4 : 2} />
          {savedCount > 0 && (
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
        <span style={{ fontWeight: activeTab === 'saved' ? 700 : 500 }}>Saved</span>
      </button>

      {/* 5. Profile -> Real Estate Profile */}
      <button
        type="button"
        className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
        title="My Properties & Listings"
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
