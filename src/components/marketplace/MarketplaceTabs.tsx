import React from 'react';
import {
  ShoppingBag,
  Briefcase,
  Building,
  MapPin,
  ChevronDown,
  Bell,
  MessageSquare,
  Plus,
  Menu
} from 'lucide-react';
import type { LocationCoordinates } from '../../types';

export type MarketplaceNavTab = 'olx' | 'jobs' | 'real_estate';

interface MarketplaceTabsProps {
  activeTab: MarketplaceNavTab;
  onSelectTab: (tab: MarketplaceNavTab) => void;
  activeLocation: LocationCoordinates;
  onOpenLocationModal: () => void;
  onOpenPostAd: () => void;
  onOpenNotifications?: () => void;
  onOpenSaved?: () => void;
  onOpenProfile?: () => void;
  onToggleSidebar?: () => void;
  unreadCount?: number;
}

export const MarketplaceTabs: React.FC<MarketplaceTabsProps> = ({
  activeTab,
  onSelectTab,
  activeLocation,
  onOpenLocationModal,
  onOpenPostAd,
  onOpenNotifications,
  onOpenProfile,
  onToggleSidebar,
  unreadCount = 0
}) => {
  return (
    <header className="marketplace-top-header">
      {/* Mobile Sidebar Hamburger + Global Marketplace Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="m-action-circle-btn"
            style={{ display: 'flex' }}
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="marketplace-global-tabs">
          <button
            className={`m-tab-btn ${activeTab === 'olx' ? 'active' : ''}`}
            onClick={() => onSelectTab('olx')}
          >
            <ShoppingBag size={16} />
            <span>OLX / Buy & Sell</span>
          </button>

          <button
            className={`m-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => onSelectTab('jobs')}
          >
            <Briefcase size={16} />
            <span>Jobs</span>
          </button>

          <button
            className={`m-tab-btn ${activeTab === 'real_estate' ? 'active' : ''}`}
            onClick={() => onSelectTab('real_estate')}
          >
            <Building size={16} />
            <span>Real Estate</span>
          </button>
        </div>
      </div>

      {/* Right Side: Location Selector + Action Buttons */}
      <div className="m-header-right">
        {/* Dynamic Location Selector */}
        <button
          className="m-location-pill"
          onClick={onOpenLocationModal}
          title="Change active location"
        >
          <MapPin size={14} color="var(--lp-orange)" style={{ flexShrink: 0 }} />
          <span>{activeLocation.neighborhood || activeLocation.placeName || 'Avadi / Ambattur'}</span>
          <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--lp-slate-light)' }} />
        </button>

        {/* Post Ad Button */}
        <button
          className="m-post-ad-btn"
          onClick={onOpenPostAd}
          title="Post a new advertisement"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Post Ad</span>
        </button>

        {/* Notifications Bell */}
        <button
          className="m-action-circle-btn"
          onClick={onOpenNotifications}
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ea580c',
                border: '1.5px solid #ffffff'
              }}
            />
          )}
        </button>

        {/* Chat / Messages Button */}
        <button
          className="m-action-circle-btn"
          onClick={() => onSelectTab('olx')}
          title="Marketplace Chats"
        >
          <MessageSquare size={17} />
        </button>

        {/* User Profile Avatar */}
        <div
          className="m-avatar-badge"
          onClick={onOpenProfile}
          title="My Profile & Settings"
        >
          V
        </div>
      </div>
    </header>
  );
};
