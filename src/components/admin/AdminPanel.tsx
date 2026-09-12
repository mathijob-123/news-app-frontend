import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Film,
  CreditCard,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  MapPin,
  Check,
  Search,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  Send,
  Eye,
  FileVideo,
  ChevronRight,
  ExternalLink,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoPost, AdminReviewStatus } from '../../types';
import {
  approveAdminPayout,
  updatePostReviewStatus,
  rejectPost,
  getAdminDashboardStats
} from '../../services/storageService';
import { formatINR } from '../../services/monetizationEngine';

interface AdminPanelProps {
  posts: VideoPost[];
  onClose: () => void;
  onRefreshData: () => void;
  onLogout?: () => void;
  adminUser?: { id: string; name: string; role: string };
}

type AdminTab = 'requests' | 'payouts' | 'analytics';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  onClose,
  onRefreshData,
  onLogout,
  adminUser
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingPost, setRejectingPost] = useState<VideoPost | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Unverified or duplicate footage');

  // Payout Drawer / Modal state
  const [payoutTargetPost, setPayoutTargetPost] = useState<VideoPost | null>(null);
  const [customGrantAmount, setCustomGrantAmount] = useState<number>(100);
  const [bountyBonus, setBountyBonus] = useState<number>(0);
  const [payoutFeedback, setPayoutFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Derive Admin Stats dynamically
  const stats = useMemo(() => getAdminDashboardStats(), [posts]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return posts.filter((post) => {
      // Status filter
      if (requestFilter === 'pending') {
        if (post.adminReviewStatus && post.adminReviewStatus !== 'pending_review') return false;
      } else if (requestFilter === 'approved') {
        if (post.adminReviewStatus !== 'verified_approved' && post.adminReviewStatus !== 'bounty_awarded') return false;
      } else if (requestFilter === 'rejected') {
        if (post.adminReviewStatus !== 'rejected') return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          post.headline.toLowerCase().includes(q) ||
          post.creatorName.toLowerCase().includes(q) ||
          post.creatorHandle.toLowerCase().includes(q) ||
          post.location.placeName.toLowerCase().includes(q) ||
          (post.location.neighborhood && post.location.neighborhood.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [posts, requestFilter, searchQuery]);

  // Posts eligible for payout (approved video reports)
  const payoutQueue = useMemo(() => {
    return posts.filter(
      (p) =>
        p.adminReviewStatus === 'verified_approved' ||
        p.adminReviewStatus === 'bounty_awarded' ||
        p.adminReviewStatus === 'pending_review'
    );
  }, [posts]);

  // Handlers
  const handleApprove = (postId: string, isBreaking: boolean = false) => {
    updatePostReviewStatus(postId, isBreaking ? 'bounty_awarded' : 'verified_approved', isBreaking);
    onRefreshData();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPost) return;
    rejectPost(rejectingPost.id, rejectionReason);
    setRejectingPost(null);
    onRefreshData();
  };

  const handleDisburseGrant = (postId: string) => {
    const result = approveAdminPayout(
      postId,
      customGrantAmount,
      bountyBonus,
      'Chennai & Tiruvallur Admin Bureau'
    );
    setPayoutFeedback(result);
    if (result.success) {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 }
      });
      onRefreshData();
      setTimeout(() => {
        setPayoutTargetPost(null);
        setPayoutFeedback(null);
        setBountyBonus(0);
      }, 2000);
    }
  };

  return (
    <div className="admin-page-root">
      {/* 1. Official Admin Top Bar */}
      <div className="admin-header-outer">
        <div className="admin-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 69, 0, 0.2)',
                border: '1px solid rgba(255, 69, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  LocalPulse Bureau Desk
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#059669',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    letterSpacing: '0.04em'
                  }}
                >
                  ADMIN
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)' }}>
                {adminUser?.name ? `${adminUser.name} • Chennai & Tiruvallur Bureau` : 'Chennai & Tiruvallur Editorial Authority'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                title="Sign Out of Bureau Desk"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <ArrowLeft size={14} />
              <span>Citizen App (/)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="admin-tabs-outer">
        <div className="admin-tabs-inner">
          <button
            onClick={() => setActiveTab('requests')}
            className="admin-tab-button"
            style={{
              color: activeTab === 'requests' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'requests' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
            }}
          >
            <Film size={16} />
            <span>Video Requests</span>
            {stats.pendingReviewCount > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: '#ea580c',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}
              >
                {stats.pendingReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className="admin-tab-button"
            style={{
              color: activeTab === 'payouts' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'payouts' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
            }}
          >
            <CreditCard size={16} />
            <span>Payment Approval</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="admin-tab-button"
            style={{
              color: activeTab === 'analytics' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'analytics' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
            }}
          >
            <BarChart3 size={16} />
            <span>Statistical Dashboard</span>
          </button>
        </div>
      </div>

      {/* 3. Main Tab Contents */}
      <div className="admin-main-container">
        {/* ============================================================ */}
        {/* TAB 1: VIDEO POST REQUESTS                                  */}
        {/* ============================================================ */}
        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Filter pills & Search input */}
            <div className="admin-filter-bar">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  width: '100%',
                  maxWidth: '380px'
                }}
              >
                <Search size={16} color="var(--text-tertiary)" />
                <input
                  type="text"
                  placeholder="Search reporter, location, or headline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', flexWrap: 'wrap' }}>
                {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestFilter(st)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      background: requestFilter === st ? 'var(--brand-primary)' : '#ffffff',
                      color: requestFilter === st ? '#ffffff' : 'var(--text-secondary)',
                      border: requestFilter === st ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: requestFilter === st ? 'var(--shadow-sm)' : 'none',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {st === 'all'
                      ? `All Requests (${posts.length})`
                      : st === 'pending'
                      ? `Pending (${stats.pendingReviewCount})`
                      : st === 'approved'
                      ? `Approved (${stats.approvedCount})`
                      : `Rejected (${stats.rejectedCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Request cards list */}
            {filteredRequests.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '50px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  maxWidth: '640px',
                  margin: '30px auto',
                  width: '100%'
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
                  <FileVideo size={28} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {posts.length === 0
                    ? 'No Video Requests Submitted'
                    : `No ${requestFilter === 'all' ? '' : requestFilter.charAt(0).toUpperCase() + requestFilter.slice(1) + ' '}Video Requests`}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '340px', margin: '0 auto' }}>
                  {posts.length === 0
                    ? 'Citizen journalists have not submitted any news video dispatches yet across Chennai & Tiruvallur Districts. When news reels are submitted from the field, they will appear here for editorial review and verification.'
                    : requestFilter === 'pending'
                    ? 'All incoming citizen video dispatches have been moderated and reviewed.'
                    : 'No video reports match the selected queue filter.'}
                </p>
              </div>
            ) : (
              <div className="admin-responsive-grid">
                {filteredRequests.map((post) => {
                const isPlaying = playingPostId === post.id;
                const isPending = !post.adminReviewStatus || post.adminReviewStatus === 'pending_review';

                return (
                  <div
                    key={post.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Reporter Header */}
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={post.creatorAvatar}
                          alt={post.creatorName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                            <span>{post.creatorName}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>@{post.creatorHandle}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={10} color="var(--brand-primary)" />
                            <span>{post.location.neighborhood || post.location.placeName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {post.adminReviewStatus === 'bounty_awarded' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#ecfdf5',
                              color: '#047857',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 800
                            }}
                          >
                            <Award size={11} />
                            <span>Bounty Awarded</span>
                          </span>
                        ) : post.adminReviewStatus === 'verified_approved' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#f0fdf4',
                              color: '#15803d',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={11} />
                            <span>Approved</span>
                          </span>
                        ) : post.adminReviewStatus === 'rejected' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <XCircle size={11} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fff7ed',
                              color: '#ea580c',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <Clock size={11} />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Media Preview & Headline */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Video / Thumbnail Container */}
                        <div
                          style={{
                            width: '100px',
                            height: '130px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#090d16',
                            flexShrink: 0,
                            cursor: 'pointer'
                          }}
                          onClick={() => setPlayingPostId(isPlaying ? null : post.id)}
                        >
                          {isPlaying ? (
                            <video
                              src={post.mediaUrl}
                              autoPlay
                              controls
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <>
                              <img
                                src={post.thumbnailUrl}
                                alt={post.headline}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(0,0,0,0.3)'
                                }}
                              >
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 69, 0, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff'
                                  }}
                                >
                                  <Play size={15} fill="#ffffff" style={{ marginLeft: '2px' }} />
                                </div>
                              </div>
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  right: '4px',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#ffffff',
                                  padding: '1px 4px',
                                  borderRadius: '3px'
                                }}
                              >
                                15s
                              </span>
                            </>
                          )}
                        </div>

                        {/* Text and context */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span className={`category-tag-badge ${post.category}`}>
                                {post.category}
                              </span>
                              {post.isBreaking && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '1px 5px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Breaking
                                </span>
                              )}
                            </div>

                            <h3
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                lineHeight: 1.35,
                                marginBottom: '4px'
                              }}
                            >
                              {post.headline}
                            </h3>

                            <p
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {post.caption}
                            </p>
                          </div>

                          {post.sourceCitation && (
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                              Source: {post.sourceCitation}
                            </div>
                          )}

                          {post.rejectionReason && (
                            <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
                              Reason: {post.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Editorial Action Buttons */}
                      {isPending && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '8px',
                            paddingTop: '10px',
                            borderTop: '1px solid #f1f5f9',
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            onClick={() => handleApprove(post.id, false)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#10b981',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Check size={14} />
                            <span>Approve Video</span>
                          </button>

                          <button
                            onClick={() => handleApprove(post.id, true)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Award size={14} />
                            <span>Mark Breaking</span>
                          </button>

                          <button
                            onClick={() => setRejectingPost(post)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: VIDEO PAYMENT APPROVAL                                */}
        {/* ============================================================ */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Treasury summary box */}
            <div className="admin-treasury-banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                    Admin Treasury UPI Disbursements
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    Direct UPI Rails Active
                  </span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {formatINR(stats.totalDisbursedINR)}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                  Disbursed to citizen journalists across Chennai & Tiruvallur Districts
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Pending Disbursement</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{payoutQueue.length} reports</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Settlement Rails</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>Instant NPCI / UPI</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Approved Video Reports Ready For Grant Disbursement ({payoutQueue.length})
            </div>

            {payoutQueue.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '50px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  maxWidth: '640px',
                  margin: '30px auto',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: posts.length === 0 ? '#f8fafc' : '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: posts.length === 0 ? 'var(--brand-primary)' : '#059669',
                    border: posts.length === 0 ? '1px solid var(--border-subtle)' : '1px solid #a7f3d0'
                  }}
                >
                  {posts.length === 0 ? <CreditCard size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {posts.length === 0 ? 'No Video Reports Awaiting Payment' : 'All Video Grants Settled'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '340px', margin: '0 auto' }}>
                  {posts.length === 0
                    ? 'No citizen video dispatches have been submitted yet. Once citizen news videos are approved by the editorial desk, they will appear here for 1-click UPI grant disbursement.'
                    : 'All eligible citizen video dispatches have received their approved UPI treasury payouts.'}
                </p>
              </div>
            ) : (
              <div className="admin-responsive-grid">
                {payoutQueue.map((post) => {
                  const totalPaidSoFar = (post.adminPayoutAmount || 0) + (post.adminBountyAwarded || 0);

                  return (
                    <div
                      key={post.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <img
                          src={post.thumbnailUrl}
                          alt={post.headline}
                          style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '4px' }}>
                            {post.headline}
                          </h4>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>By @{post.creatorHandle}</span>
                            <span>•</span>
                            <span>{post.qualifiedViewCount} qualified views</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #f1f5f9'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Disbursed:</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-primary)', marginLeft: '4px' }}>
                            {formatINR(totalPaidSoFar)}
                          </span>
                        </div>

                        <button
                          onClick={() => setPayoutTargetPost(post)}
                          className="btn-primary"
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <CreditCard size={13} />
                          <span>Disburse Payout</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: STATISTICAL DASHBOARD                                 */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top 4 KPI Cards */}
            <div className="admin-kpi-grid">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', marginBottom: '6px' }}>
                  <DollarSign size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Disbursed</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatINR(stats.totalDisbursedINR)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
                  Admin UPI Treasury
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c', marginBottom: '6px' }}>
                  <Film size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Submitted Videos</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.totalVideosSubmitted}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Short News Reels
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', marginBottom: '6px' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending Review</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.pendingReviewCount}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Awaiting Verification
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', marginBottom: '6px' }}>
                  <Users size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Reporters</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.activeReportersCount}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Citizen Journalists
                </div>
              </div>
            </div>

            {/* Analytics Dashboard Grid (2 columns on desktop) */}
            <div className="admin-analytics-grid">
              {/* Geographic Coverage: Chennai vs Tiruvallur */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <MapPin size={18} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>North Tamil Nadu District Coverage</h3>
                </div>

                {stats.totalVideosSubmitted === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed var(--border-subtle)'
                    }}
                  >
                    <MapPin size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No District Telemetry Yet
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      Geographic reporting distribution between Chennai and Tiruvallur will update automatically once citizen news videos are submitted.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Chennai District</span>
                        <span>
                          {stats.districtBreakdown.chennai} reports (
                          {Math.round((stats.districtBreakdown.chennai / stats.totalVideosSubmitted) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--brand-primary)',
                            width: `${(stats.districtBreakdown.chennai / stats.totalVideosSubmitted) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Tiruvallur District</span>
                        <span>
                          {stats.districtBreakdown.tiruvallur} reports (
                          {Math.round((stats.districtBreakdown.tiruvallur / stats.totalVideosSubmitted) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: '#ea580c',
                            width: `${(stats.districtBreakdown.tiruvallur / stats.totalVideosSubmitted) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={18} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Category Breakdown</h3>
                </div>

                {Object.keys(stats.categoryBreakdown).length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed var(--border-subtle)'
                    }}
                  >
                    <TrendingUp size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Category Telemetry Yet
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      Categorical distribution (Civic, Traffic, Weather, Crime, Community) will display here as stories are uploaded.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span className={`category-tag-badge ${cat}`}>{cat}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{count} {count === 1 ? 'story' : 'stories'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editorial Performance & Treasury Health (Spans 2 columns on desktop) */}
              <div
                className="admin-analytics-fullwidth"
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                  Editorial Performance & Treasury Health
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Approval Rate</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: stats.totalVideosSubmitted > 0 ? '#059669' : 'var(--text-tertiary)' }}>
                      {stats.totalVideosSubmitted > 0 ? `${stats.approvalRatePercent}%` : '0% (No reviews yet)'}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Editorial Turnaround</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {stats.pendingReviewCount > 0 ? '~15 Mins (Active Queue)' : 'Instant (Queue Empty)'}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Disbursement Gateway</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      Admin UPI Treasury Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: Reject Post with Reason                               */}
      {/* ============================================================ */}
      {rejectingPost && (
        <div className="admin-modal-overlay" onClick={() => setRejectingPost(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-alert)' }}>
                Reject Video Submission
              </h3>
              <button onClick={() => setRejectingPost(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <XCircle size={18} color="var(--text-secondary)" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please provide a clear editorial reason for rejecting <strong>"{rejectingPost.headline}"</strong>:
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Unverified or duplicate footage',
                'Low video resolution / inaudible audio',
                'Outside Chennai & Tiruvallur coverage zone',
                'Violates community safety guidelines'
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: rejectionReason === reason ? '#fff1f2' : '#f8fafc',
                    border: rejectionReason === reason ? '1px solid #fecdd3' : '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    style={{ accentColor: '#e11d48' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirm Video Rejection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Payout Grant Disbursement                             */}
      {/* ============================================================ */}
      {payoutTargetPost && (
        <div className="admin-modal-overlay" onClick={() => setPayoutTargetPost(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Disburse Video Grant (₹)</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Platform Admin Treasury to @{payoutTargetPost.creatorHandle}
                </div>
              </div>
              <button onClick={() => setPayoutTargetPost(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <XCircle size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {payoutFeedback ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={44} color="var(--color-success)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Grant Disbursed Successfully!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {payoutFeedback.message}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Select Video Grant Tier
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCustomGrantAmount(amt)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '8px',
                          background: customGrantAmount === amt ? '#fff7ed' : '#f8fafc',
                          border: customGrantAmount === amt ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          color: customGrantAmount === amt ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Add Breaking News Bounty Bonus (Optional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[0, 150, 300].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBountyBonus(b)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: '8px',
                          background: bountyBonus === b ? '#ecfdf5' : '#f8fafc',
                          border: bountyBonus === b ? '2px solid #059669' : '1px solid var(--border-subtle)',
                          color: bountyBonus === b ? '#059669' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {b === 0 ? 'No Bounty' : `+₹${b}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Disbursement:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {formatINR(customGrantAmount + bountyBonus)}
                  </span>
                </div>

                <button
                  onClick={() => handleDisburseGrant(payoutTargetPost.id)}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={15} />
                  <span>Execute UPI Transfer ({formatINR(customGrantAmount + bountyBonus)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
