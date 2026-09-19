import React, { useState, useRef } from 'react';
import {
  Settings,
  Edit3,
  CheckCircle2,
  MapPin,
  DollarSign,
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
  Clock
} from 'lucide-react';
import type { User, VideoPost } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

interface ProfileScreenProps {
  user: User;
  posts: VideoPost[];
  onOpenPost: (post: VideoPost) => void;
  onNavigateToMonetization: () => void;
  onUpdateUser: (updated: User) => void;
  onOpenAdmin?: () => void;
}

type ProfileTab = 'posts' | 'spots' | 'saved' | 'liked';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  posts,
  onOpenPost,
  onNavigateToMonetization,
  onUpdateUser,
  onOpenAdmin
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
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}`}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'User')}`;
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: isAdmin ? '3px solid #10b981' : '3px solid #ff4500'
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

          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={13} />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
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
              <Edit3 size={13} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                padding: '7px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Settings & PWA config"
            >
              <Settings size={16} />
            </button>

            <button
              onClick={logout}
              style={{
                padding: '7px',
                borderRadius: '50%',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#ef4444',
                cursor: 'pointer'
              }}
              title="Sign Out"
            >
              <LogOut size={16} />
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
            <DollarSign size={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px' }}>Creator Monetization Hub</div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Check balance, formula RPM & payouts</div>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px' }}>
            Open &rarr;
          </span>
        </div>
      </div>

      {/* 2. Content Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            flex: 1,
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
          onClick={() => setActiveTab('saved')}
          style={{
            flex: 1,
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

      {/* 3. Grid Display */}
      <div style={{ padding: '8px' }}>
        {displayedList.length === 0 ? (
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
                {post.adminReviewStatus === 'pending_review' && (
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
                )}
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
    </div>
  );
};
