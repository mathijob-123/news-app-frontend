import React from 'react';
import { Newspaper, PlaySquare, Plus, DollarSign, User } from 'lucide-react';
import type { TabType } from '../../types';

export type { TabType };

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenCreate: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenCreate
}) => {
  return (
    <nav className={`app-bottom-nav ${activeTab === 'spots' ? 'spots-mode' : ''}`}>
      {/* 1. Spots (Vertical Video News Reels First) */}
      <button
        className={`nav-tab-item ${activeTab === 'spots' ? 'active' : ''}`}
        onClick={() => onChangeTab('spots')}
        title="Spots — Short Video News Reels"
      >
        <PlaySquare size={19} />
        <span>Spots</span>
      </button>

      {/* 2. Feed */}
      <button
        className={`nav-tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onChangeTab('home')}
        title="Chennai & Tiruvallur News Feed"
      >
        <Newspaper size={19} />
        <span>Feed</span>
      </button>

      {/* 3. Center Elevated Create FAB [+] */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          className="nav-create-fab"
          onClick={onOpenCreate}
          title="File Citizen News Report"
        >
          <Plus size={21} strokeWidth={2.6} />
        </button>
      </div>

      {/* 4. Monetization / Creator Earnings */}
      <button
        className={`nav-tab-item ${activeTab === 'monetization' ? 'active' : ''}`}
        onClick={() => onChangeTab('monetization')}
        title="Creator Earnings & Payouts (INR ₹)"
      >
        <DollarSign size={19} />
        <span>Earnings</span>
      </button>

      {/* 5. Profile */}
      <button
        className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
        title="Reporter Profile & Library"
      >
        <User size={19} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
