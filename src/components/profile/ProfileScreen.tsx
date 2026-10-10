import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Edit3,
  CheckCircle2,
  MapPin,
  DollarSign,
  Coins,
  Grid,
  PlaySquare,
  Bookmark,
  Heart,
  ShieldCheck,
  Bell,
  Smartphone,
  Trash2,
  X,
  Share2,
  Newspaper,
  LogOut,
  Camera,
  RefreshCw,
  Award,
  Clock,
  ShieldAlert,
  Menu,
  ShoppingBag,
  Briefcase,
  Building,
  Wrench,
  Car,
  Plus,
  Eye,
  MessageCircle,
  Pause,
  Play,
  Check,
  ExternalLink
} from 'lucide-react';
import type { User, VideoPost } from '../../types';
import type { MarketplaceProduct, MarketplaceJob, MarketplaceProperty } from '../../types/marketplace';
import {
  getStoredProducts,
  getStoredJobs,
  getStoredProperties,
  markStoredProductSold,
  markStoredProductActive,
  renewStoredProduct,
  deleteStoredProduct,
  toggleStoredProductPause
} from '../../services/marketplaceService';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

interface ProfileScreenProps {
  user: User;
  posts: VideoPost[];
  onOpenPost: (post: VideoPost) => void;
  onNavigateToMonetization: () => void;
  onUpdateUser: (updated: User) => void;
  onOpenAdmin?: () => void;
  onToggleMenu?: () => void;
  onOpenPostAd?: () => void;
  onOpenProduct?: (product: MarketplaceProduct) => void;
  onNavigateToMarketplace?: () => void;
}

type ProfileTab = 'posts' | 'spots' | 'marketplace' | 'saved' | 'liked';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  posts,
  onOpenPost,
  onNavigateToMonetization,
  onUpdateUser,
  onOpenAdmin,
  onToggleMenu,
  onOpenPostAd,
  onOpenProduct,
  onNavigateToMarketplace
}) => {
  const { logout, updateUser: authUpdateUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Edit profile state
  const [nameInput, setNameInput] = useState(user.displayName);
  const [bioInput, setBioInput] = useState(user.bio);
  const [neighborhoodInput, setNeighborhoodInput] = useState(
    user.homeLocation.neighborhood || user.homeLocation.placeName
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const publicR2Url = await authService.uploadAvatarToR2(file);
      const updated: User = { ...user, avatar: publicR2Url };
      onUpdateUser(updated);
      authUpdateUser(updated);
    } catch (err: any) {
      alert('Avatar upload to R2 failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      displayName: nameInput,
      bio: bioInput,
      homeLocation: {
        ...user.homeLocation,
        neighborhood: neighborhoodInput,
        placeName: `${neighborhoodInput} Hub`
      }
    };
    onUpdateUser(updated);
    authUpdateUser(updated);
    setShowEditModal(false);
  };

  // Marketplace state inside Profile
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(() => getStoredProducts());
  const [activeMarketplaceModule, setActiveMarketplaceModule] = useState<
    'my_ads' | 'my_jobs' | 'my_properties' | 'my_services' | 'my_vehicles' | 'saved_items'
  >('my_ads');
  const [myAdsSubTab, setMyAdsSubTab] = useState<'active' | 'sold' | 'pending' | 'expired'>('active');
  const [analyticsProduct, setAnalyticsProduct] = useState<MarketplaceProduct | null>(null);

  const refreshMarketplace = () => {
    setMarketplaceProducts(getStoredProducts());
  };

  const myMarketplaceAds = marketplaceProducts.filter((p) => p.isMine || p.seller.id === user.id);
  const myServices = myMarketplaceAds.filter((p) => p.category === 'services');
  const myVehicles = myMarketplaceAds.filter((p) => p.category === 'vehicles');
  const myProperties = myMarketplaceAds.filter((p) => p.category === 'property');
  const savedMarketplaceItems = marketplaceProducts.filter((p) => p.isFavorite);
  const myJobs = getStoredJobs().filter((j) => j.isSaved || j.salary.includes('Negotiable'));

  // Filtering My Ads by status: active, sold, pending, expired
  const filteredMyAds = myMarketplaceAds.filter((p) => {
    if (myAdsSubTab === 'active') return p.status === 'active' || !p.status;
    if (myAdsSubTab === 'sold') return p.status === 'sold';
    if (myAdsSubTab === 'pending') return (p as any).status === 'pending';
    if (myAdsSubTab === 'expired') return (p as any).status === 'expired' || p.status === 'paused';
    return true;
  });

  const handleMarkSold = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const item = myMarketplaceAds.find((p) => p.id === id);
    if (item?.status === 'sold') {
      markStoredProductActive(id);
    } else {
      markStoredProductSold(id);
    }
    refreshMarketplace();
  };

  const handleTogglePause = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleStoredProductPause(id);
    refreshMarketplace();
  };

  const handleRenew = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    renewStoredProduct(id);
    refreshMarketplace();
  };

  const handleDeleteAd = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteStoredProduct(id);
      refreshMarketplace();
    }
  };

  // Content tab filtering
  const myPosts = posts.filter((p) => p.creatorId === user.id);
  const mySpots = myPosts.filter((p) => p.type === 'video');
  const savedPosts = posts.filter((p) => p.isSaved);
  const likedPosts = posts.filter((p) => p.isLiked);

  const displayedList =
    activeTab === 'posts'
      ? myPosts
      : activeTab === 'spots'
      ? mySpots
      : activeTab === 'saved'
      ? savedPosts
      : likedPosts;

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100%' }}>
      {/* 1. Header Profile Banner */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=ea580c&textColor=ffffff`}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}&backgroundColor=ea580c&textColor=ffffff`;
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: isAdmin ? '3px solid #10b981' : '3px solid #ea580c'
              }}
            />

            {/* Hidden file input for Cloudflare R2 avatar upload */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Camera Upload Button on Avatar */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              title="Upload new avatar to Cloudflare R2"
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isUploadingAvatar ? <RefreshCw size={11} className="spin" /> : <Camera size={11} />}
            </button>

            {user.verified && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={20} color={isAdmin ? '#10b981' : 'var(--brand-primary)'} fill={isAdmin ? '#d1fae5' : '#ffedd5'} />
              </div>
            )}
          </div>

          {/* Action Buttons beside Avatar */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                style={{
                  padding: '5px 10px',
                  borderRadius: '16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={12} />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Settings & PWA config"
            >
              <Settings size={15} />
            </button>

            <button
              onClick={logout}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#ef4444',
                cursor: 'pointer'
              }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* User Identity Info */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user.displayName}
            </h2>
            {user.role === 'admin' ? (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                SuperAdmin
              </span>
            ) : (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  background: '#fff7ed',
                  color: 'var(--brand-primary)',
                  border: '1px solid #ffedd5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                {user.creatorTier} Tier
              </span>
            )}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600 }}>@{user.handle}</span>
            {user.email && <span>• {user.email}</span>}
            {user.authProvider === 'google' && (
              <span style={{ fontSize: '10px', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                Google Verified
              </span>
            )}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
            {user.bio}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} color="var(--brand-primary)" />
              {user.homeLocation.neighborhood || user.homeLocation.placeName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)', fontWeight: 600 }}>
              <ShieldCheck size={12} />
              Trust Score: {user.trustScore}%
            </span>
          </div>
        </div>

        {/* Stats Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
              {user.followerCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Followers</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
              {user.followingCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Following</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
              {myPosts.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Total Views</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--brand-primary)' }}>
              {myPosts.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Reports</div>
          </div>
        </div>

        {/* Creator Hub Quick Banner */}
        <div
          onClick={onNavigateToMonetization}
          style={{
            background: 'var(--brand-gradient)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: 'var(--brand-glow)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Creator Points & Rewards Hub</div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Check points, view milestones & rewards</div>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px' }}>
            Open &rarr;
          </span>
        </div>

        {/* Copyright Standing Card (YouTube 3-Strike Policy) */}
        {(() => {
          const strikes = user.copyrightStrikesCount || 0;
          const isSuspended = Boolean(user.uploadBlocked || strikes >= 3);
          
          let badgeText = 'Good Standing (0 Strikes)';
          let badgeBg = '#ecfdf5';
          let badgeBorder = '#a7f3d0';
          let badgeColor = '#059669';

          if (isSuspended) {
            badgeText = `${strikes} Strikes — Uploads Suspended`;
            badgeBg = '#fef2f2';
            badgeBorder = '#fecaca';
            badgeColor = '#dc2626';
          } else if (strikes === 2) {
            badgeText = '2 Strikes — Final Warning (2-Wk Penalty)';
            badgeBg = '#fff7ed';
            badgeBorder = '#fed7aa';
            badgeColor = '#ea580c';
          } else if (strikes === 1) {
            badgeText = '1 Strike — Warning (1-Wk Penalty)';
            badgeBg = '#fffbeb';
            badgeBorder = '#fde68a';
            badgeColor = '#d97706';
          }

          return (
            <div
              style={{
                marginTop: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} color={isSuspended ? '#dc2626' : strikes > 0 ? '#ea580c' : '#059669'} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Copyright Standing
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    color: badgeColor
                  }}
                >
                  {badgeText}
                </span>
              </div>

              {/* 3-Strike Visual Indicator */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3].map((strikeIndex) => {
                  const isActive = strikes >= strikeIndex;
                  return (
                    <div
                      key={strikeIndex}
                      style={{
                        background: isActive ? (strikeIndex === 3 ? '#fee2e2' : '#fed7aa') : '#ffffff',
                        border: `1px solid ${isActive ? (strikeIndex === 3 ? '#fca5a5' : '#fdba74') : '#e2e8f0'}`,
                        borderRadius: '8px',
                        padding: '6px 4px',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: isActive ? (strikeIndex === 3 ? '#991b1b' : '#9a3412') : '#94a3b8'
                        }}
                      >
                        Strike {strikeIndex}
                      </div>
                      <div
                        style={{
                          fontSize: '9px',
                          color: isActive ? (strikeIndex === 3 ? '#b91c1c' : '#c2410c') : '#94a3b8',
                          marginTop: '2px',
                          fontWeight: isActive ? 600 : 400
                        }}
                      >
                        {strikeIndex === 1 ? '1 Wk Lock' : strikeIndex === 2 ? '2 Wk Lock' : 'Suspended'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                Spotlight follows YouTube's 3-strike copyright guidelines. Strikes expire after 90 days. 3 strikes permanently blocks upload privileges.
              </div>
            </div>
          );
        })()}
      </div>

      {/* Quick Marketplace Access Banner (Image 3 Model) */}
      <div
        onClick={() => setActiveTab('marketplace')}
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '10px 14px',
          margin: '12px 16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#ea580c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)'
            }}
          >
            <ShoppingBag size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#9a3412' }}>
              My Marketplace & Classifieds
            </div>
            <div style={{ fontSize: '11px', color: '#c2410c' }}>
              {myMarketplaceAds.length} Active Ads • {savedMarketplaceItems.length} Saved • Analytics & Enquiries
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPostAd?.();
          }}
          style={{
            background: '#ea580c',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
          }}
        >
          <Plus size={14} />
          <span>Post Ad</span>
        </button>
      </div>

      {/* 2. Content Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          marginTop: '12px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            flex: 1,
            minWidth: '70px',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: activeTab === 'posts' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            borderBottom: activeTab === 'posts' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
          }}
        >
          <Grid size={15} />
          <span>Posts ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('spots')}
          style={{
            flex: 1,
            minWidth: '70px',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: activeTab === 'spots' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            borderBottom: activeTab === 'spots' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
          }}
        >
          <PlaySquare size={15} />
          <span>Spots ({mySpots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          style={{
            flex: 1.2,
            minWidth: '85px',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: activeTab === 'marketplace' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            borderBottom: activeTab === 'marketplace' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
          }}
        >
          <ShoppingBag size={15} />
          <span>My Ads ({myMarketplaceAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          style={{
            flex: 1,
            minWidth: '70px',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: activeTab === 'saved' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            borderBottom: activeTab === 'saved' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
          }}
        >
          <Bookmark size={15} />
          <span>Saved ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          style={{
            flex: 1,
            minWidth: '70px',
            padding: '10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: activeTab === 'liked' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            borderBottom: activeTab === 'liked' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
          }}
        >
          <Heart size={15} />
          <span>Liked ({likedPosts.length})</span>
        </button>
      </div>

      {/* 3. Grid Display or Marketplace View */}
      <div style={{ padding: '8px' }}>
        {activeTab === 'marketplace' ? (
          <div>
            {/* Marketplace Module Navigation Pill Selector */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '14px'
              }}
            >
              {[
                { id: 'my_ads', label: `My Ads (${myMarketplaceAds.length})`, icon: <ShoppingBag size={14} /> },
                { id: 'my_jobs', label: `My Jobs (${myJobs.length})`, icon: <Briefcase size={14} /> },
                { id: 'my_properties', label: `My Properties (${myProperties.length})`, icon: <Building size={14} /> },
                { id: 'my_services', label: `My Services (${myServices.length})`, icon: <Wrench size={14} /> },
                { id: 'my_vehicles', label: `My Vehicles (${myVehicles.length})`, icon: <Car size={14} /> },
                { id: 'saved_items', label: `Saved (${savedMarketplaceItems.length})`, icon: <Bookmark size={14} /> }
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveMarketplaceModule(mod.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: activeMarketplaceModule === mod.id ? '#ea580c' : '#ffffff',
                    color: activeMarketplaceModule === mod.id ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${activeMarketplaceModule === mod.id ? '#ea580c' : 'var(--border-subtle)'}`,
                    boxShadow: activeMarketplaceModule === mod.id ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none'
                  }}
                >
                  {mod.icon}
                  <span>{mod.label}</span>
                </button>
              ))}
            </div>

            {/* If Module is "my_ads" */}
            {activeMarketplaceModule === 'my_ads' && (
              <div>
                {/* 4 Status Tabs: Active, Sold, Pending, Expired */}
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '10px',
                    padding: '3px',
                    marginBottom: '14px'
                  }}
                >
                  {(['active', 'sold', 'pending', 'expired'] as const).map((tab) => {
                    const count = myMarketplaceAds.filter((p) => {
                      if (tab === 'active') return p.status === 'active' || !p.status;
                      if (tab === 'sold') return p.status === 'sold';
                      if (tab === 'pending') return (p as any).status === 'pending';
                      if (tab === 'expired') return (p as any).status === 'expired' || p.status === 'paused';
                      return false;
                    }).length;

                    return (
                      <button
                        key={tab}
                        onClick={() => setMyAdsSubTab(tab)}
                        style={{
                          flex: 1,
                          padding: '7px 4px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          cursor: 'pointer',
                          background: myAdsSubTab === tab ? '#ffffff' : 'transparent',
                          color: myAdsSubTab === tab ? '#ea580c' : 'var(--text-secondary)',
                          boxShadow: myAdsSubTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{tab}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            background: myAdsSubTab === tab ? '#fff7ed' : '#e2e8f0',
                            color: myAdsSubTab === tab ? '#ea580c' : '#64748b'
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Ads List */}
                {filteredMyAds.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '14px',
                      padding: '32px 16px',
                      textAlign: 'center'
                    }}
                  >
                    <ShoppingBag size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      No {myAdsSubTab} listings found
                    </h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '14px' }}>
                      {myAdsSubTab === 'active'
                        ? 'You have no live listings currently on LocalPlus marketplace.'
                        : `No items marked as ${myAdsSubTab}.`}
                    </p>
                    <button
                      onClick={() => onOpenPostAd?.()}
                      style={{
                        background: 'var(--brand-primary)',
                        color: '#ffffff',
                        padding: '9px 20px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(29, 114, 254, 0.28)'
                      }}
                    >
                      + Post New Listing
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredMyAds.map((ad) => (
                      <div
                        key={ad.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '14px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            cursor: ad.status === 'sold' ? 'not-allowed' : 'pointer',
                            opacity: ad.status === 'sold' ? 0.8 : 1
                          }}
                          onClick={() => {
                            if (ad.status === 'sold') return;
                            onOpenProduct?.(ad);
                          }}
                        >
                          <img
                            src={ad.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                            alt={ad.title}
                            style={{
                              width: '84px',
                              height: '84px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  color: '#ea580c',
                                  background: '#fff7ed',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {ad.category}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  background: ad.status === 'sold' ? '#eff6ff' : ad.status === 'paused' ? '#f1f5f9' : '#ecfdf5',
                                  color: ad.status === 'sold' ? '#2563eb' : ad.status === 'paused' ? '#64748b' : '#059669',
                                  border: `1px solid ${ad.status === 'sold' ? '#bfdbfe' : ad.status === 'paused' ? '#cbd5e1' : '#a7f3d0'}`
                                }}
                              >
                                {ad.status === 'sold' ? 'Sold' : ad.status === 'paused' ? 'Paused' : 'Active'}
                              </span>
                            </div>

                            <h4
                              style={{
                                fontSize: '13.5px',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                margin: '4px 0 2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {ad.title}
                            </h4>

                            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                              ₹{ad.price.toLocaleString('en-IN')}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Eye size={12} />
                                <span>{ad.viewsCount || 14} Views</span>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MessageCircle size={12} />
                                <span>4 Enquiries</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons requested: Edit, Mark as Sold, Renew, Pause, Delete, View analytics, View enquiries */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            paddingTop: '8px',
                            borderTop: '1px solid #f1f5f9'
                          }}
                        >
                          <button
                            onClick={(e) => handleMarkSold(ad.id, e)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: ad.status === 'sold' ? '#f0fdf4' : '#eff6ff',
                              color: ad.status === 'sold' ? '#16a34a' : '#2563eb',
                              border: '1px solid',
                              borderColor: ad.status === 'sold' ? '#bbf7d0' : '#bfdbfe',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {ad.status === 'sold' ? 'Mark Active' : 'Mark as Sold'}
                          </button>

                          <button
                            onClick={(e) => handleTogglePause(ad.id, e)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              color: 'var(--text-secondary)',
                              border: '1px solid #cbd5e1',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {ad.status === 'paused' ? 'Resume' : 'Pause'}
                          </button>

                          <button
                            onClick={(e) => handleRenew(ad.id, e)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              color: 'var(--text-secondary)',
                              border: '1px solid #cbd5e1',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Renew
                          </button>

                          <button
                            onClick={() => setAnalyticsProduct(ad)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#fff7ed',
                              color: '#ea580c',
                              border: '1px solid #fed7aa',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Analytics
                          </button>

                          <button
                            onClick={() => onOpenProduct?.(ad)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              color: 'var(--text-secondary)',
                              border: '1px solid #cbd5e1',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Enquiries
                          </button>

                          <button
                            onClick={(e) => handleDeleteAd(ad.id, e)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginLeft: 'auto'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Marketplace Modules */}
            {activeMarketplaceModule === 'my_jobs' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '8px' }}>Saved & Applied Jobs ({myJobs.length})</h4>
                {myJobs.map((j) => (
                  <div key={j.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{j.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{j.company} • {j.location} • ₹{j.salary}</div>
                  </div>
                ))}
              </div>
            )}

            {activeMarketplaceModule === 'my_properties' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '8px' }}>My Real Estate Listings ({myProperties.length})</h4>
                {myProperties.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No real estate properties listed yet.</p>
                ) : (
                  myProperties.map((p) => (
                    <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{p.title}</div>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeMarketplaceModule === 'my_services' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '8px' }}>My Offered Services ({myServices.length})</h4>
                {myServices.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No professional services listed yet.</p>
                ) : (
                  myServices.map((s) => (
                    <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.title}</div>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>₹{s.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeMarketplaceModule === 'my_vehicles' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '8px' }}>My Vehicles for Sale ({myVehicles.length})</h4>
                {myVehicles.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No vehicles listed yet.</p>
                ) : (
                  myVehicles.map((v) => (
                    <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{v.title}</div>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>₹{v.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeMarketplaceModule === 'saved_items' && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '8px' }}>Saved Marketplace Items ({savedMarketplaceItems.length})</h4>
                {savedMarketplaceItems.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No items bookmarked yet.</p>
                ) : (
                  savedMarketplaceItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onOpenProduct?.(item)}
                      style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')} • {item.location}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : displayedList.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              margin: '12px 4px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--brand-primary)',
                border: '1px solid #ffedd5'
              }}
            >
              {activeTab === 'posts' && <Newspaper size={28} />}
              {activeTab === 'spots' && <PlaySquare size={28} />}
              {activeTab === 'saved' && <Bookmark size={28} />}
              {activeTab === 'liked' && <Heart size={28} />}
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {activeTab === 'posts' && 'No Reports Filed Yet'}
              {activeTab === 'spots' && 'No News Reels Yet'}
              {activeTab === 'saved' && 'No Saved Stories'}
              {activeTab === 'liked' && 'No Liked Reels'}
            </h4>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
              {activeTab === 'posts' && 'Ground reports and civic alerts you publish in Chennai & Tiruvallur will appear here.'}
              {activeTab === 'spots' && 'Short video news reels you upload will be organized here with view analytics.'}
              {activeTab === 'saved' && 'Bookmarked news reports and verified updates will be stored here for easy reading.'}
              {activeTab === 'liked' && 'Ground videos and community updates you like will be collected here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {displayedList.map((post) => (
              <div
                key={post.id}
                onClick={() => onOpenPost(post)}
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  background: '#0f172a',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={post.thumbnailUrl}
                  alt={post.headline}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {post.adminReviewStatus === 'pending_review' ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: 'rgba(234, 88, 12, 0.95)',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Clock size={10} />
                    <span>In Review</span>
                  </div>
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  <PlaySquare size={11} />
                  <span>{post.viewCount > 1000 ? (post.viewCount / 1000).toFixed(1) + 'k' : post.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px' }}>
            <div className="sheet-handle-bar" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Edit Citizen Reporter Profile</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Bio / Coverage Beat
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Primary Reporting Neighborhood
                </label>
                <input
                  type="text"
                  value={neighborhoodInput}
                  onChange={(e) => setNeighborhoodInput(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '10px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px' }}>
            <div className="sheet-handle-bar" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>App Settings & PWA</h3>
              <button onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Hyperlocal Emergency Push</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Alerts within 3km</div>
                  </div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-primary)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={16} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>PWA Offline Storage</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Caches last 50 news cards</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>Active</span>
              </div>

              {onOpenAdmin && (
                <div
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenAdmin();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    color: '#ffffff',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} color="var(--brand-primary)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>Editorial Admin Desk</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)' }}>Review video posts & approve payouts</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-primary)' }}>Open &rarr;</span>
                </div>
              )}

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="btn-secondary"
                style={{ color: 'var(--brand-alert)', borderColor: '#fecaca', background: '#fef2f2', marginTop: '10px' }}
              >
                <Trash2 size={15} />
                Reset App & Demo Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsProduct && (
        <div className="bottom-sheet-backdrop" onClick={() => setAnalyticsProduct(null)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '440px', margin: '0 auto' }}>
            <div className="sheet-handle-bar" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  Listing Performance & Analytics
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {analyticsProduct.title}
                </p>
              </div>
              <button onClick={() => setAnalyticsProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Total Views</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                  {analyticsProduct.viewsCount || 24}
                </div>
                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>+12% this week</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Impressions</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {(analyticsProduct.viewsCount || 24) * 8}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>In Hyperlocal Feed</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Direct Enquiries</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                  6
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Chat & WhatsApp</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Buyer CTR</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  4.8%
                </div>
                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>Above Average</div>
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9a3412' }}>Seller Pro Tip</div>
              <div style={{ fontSize: '11px', color: '#c2410c', marginTop: '2px', lineHeight: 1.4 }}>
                Keep your WhatsApp number active and respond within 15 minutes to improve trust score and conversion.
              </div>
            </div>

            <button
              onClick={() => setAnalyticsProduct(null)}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Close Analytics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
