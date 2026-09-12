import React, { useState } from 'react';
import {
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Download,
  AlertCircle,
  X,
  Building2,
  Sparkles,
  Clock,
  DollarSign,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { User, Wallet, Transaction, VideoPost } from '../../types';
import {
  BASE_RPM,
  MIN_PAYOUT_THRESHOLD,
  calculatePostEarnings,
  getTierProgress,
  formatINR
} from '../../services/monetizationEngine';

interface MonetizationScreenProps {
  user: User;
  wallet: Wallet;
  transactions: Transaction[];
  userPosts: VideoPost[];
  allPosts: VideoPost[];
  onRequestPayout: (amount: number, method: string) => { success: boolean; message: string };
  onAdminApprovePayout: (postId: string, payoutAmount: number, bountyAmount: number) => void;
}

export const MonetizationScreen: React.FC<MonetizationScreenProps> = ({
  user,
  wallet,
  transactions,
  userPosts,
  allPosts,
  onRequestPayout,
  onAdminApprovePayout
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'history'>('dashboard');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>(
    wallet.balance >= MIN_PAYOUT_THRESHOLD ? wallet.balance.toString() : '500'
  );
  const [payoutMethod, setPayoutMethod] = useState('UPI Direct (anbarasan@okhdfcbank)');
  const [payoutFeedback, setPayoutFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Simulator state
  const [simViews, setSimViews] = useState(25000);
  const [simLocalPercent, setSimLocalPercent] = useState(85);
  const [simTier, setSimTier] = useState<'bronze' | 'silver' | 'gold'>('silver');

  const tierProgress = getTierProgress(wallet.qualifiedViewsTotal);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt)) return;
    const res = onRequestPayout(amt, payoutMethod);
    setPayoutFeedback(res);
    if (res.success) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setShowWithdrawModal(false);
        setPayoutFeedback(null);
      }, 1800);
    }
  };

  // Calculate simulated earnings in INR
  const localViews = Math.round(simViews * (simLocalPercent / 100));
  const nonLocalViews = simViews - localViews;
  const localEarnings = calculatePostEarnings(localViews, simTier, true);
  const nonLocalEarnings = calculatePostEarnings(nonLocalViews, simTier, false);
  const totalSimulatedEarnings = (localEarnings.totalEarnings + nonLocalEarnings.totalEarnings);

  return (
    <div className="monetization-screen">
      {/* 1. Header & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Creator Earnings
          </h2>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={11} />
            <span>Treasury Active</span>
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
          Admin grants and view royalties across North Tamil Nadu
        </p>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            background: activeTab === 'dashboard' ? '#ffffff' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Wallet & Views
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            background: activeTab === 'simulator' ? '#ffffff' : 'transparent',
            color: activeTab === 'simulator' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'simulator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Rate Simulator
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            background: activeTab === 'history' ? '#ffffff' : 'transparent',
            color: activeTab === 'history' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          UPI Receipts
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <>
          {/* Main Wallet Balance Card */}
          <div className="balance-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9, fontWeight: 700 }}>
                  Available Balance (INR)
                </span>
                <div style={{ fontSize: '30px', fontWeight: 800, margin: '2px 0 4px', letterSpacing: '-0.02em' }}>
                  {formatINR(wallet.balance)}
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  background: '#ffffff',
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}
              >
                <span>Withdraw UPI</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px 12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                marginTop: '6px'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Lifetime Grants</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatINR(wallet.lifetimeEarnings)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>This Month</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatINR(wallet.thisMonthEarnings)}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Qualified Views</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{wallet.qualifiedViewsTotal.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Next Payout</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>{wallet.nextPayoutDate}</div>
              </div>
            </div>
          </div>

          {/* Admin Funding Explainer Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px 14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={15} color="var(--brand-primary)" />
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Admin-Funded News Video Model
              </h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              LocalPulse bureau admins directly finance short-video news reels to guarantee verified, on-ground reporting in Chennai & Tiruvallur Districts.
            </p>
          </div>

          {/* Per-Video Performance Cards (Mobile-First Responsive) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                Your News Reels & Admin Payouts
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {userPosts.length} video reports
              </span>
            </div>

            {userPosts.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '32px 20px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
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
                  <Building2 size={28} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  No Reports Submitted Yet
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto 14px' }}>
                  File hyperlocal news reports with verified video footage in Chennai & Tiruvallur to receive admin review & payouts.
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Admin payout active: ₹50 - ₹500 per verified video</span>
                </div>
              </div>
            ) : (
              userPosts.map((post) => {
                const totalPaid = (post.adminPayoutAmount || 0) + (post.adminBountyAwarded || 0);
                return (
                  <div
                    key={post.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <img
                        src={post.thumbnailUrl}
                        alt={post.headline}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.35,
                            marginBottom: '3px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {post.headline}
                        </h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} color="var(--brand-primary)" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.location.neighborhood || post.location.placeName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} />
                          <span>{post.qualifiedViewCount.toLocaleString('en-IN')} views</span>
                        </span>

                        {post.adminReviewStatus === 'bounty_awarded' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#ecfdf5',
                              color: '#047857',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Award size={10} />
                            <span>Bounty Paid</span>
                          </span>
                        ) : post.adminReviewStatus === 'verified_approved' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#f0fdf4',
                              color: '#15803d',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <CheckCircle2 size={10} />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fff7ed',
                              color: '#ea580c',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Clock size={10} />
                            <span>In Review</span>
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--brand-primary)', flexShrink: 0 }}>
                        {formatINR(totalPaid)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TAB 3: INTERACTIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sliders size={16} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Admin Payout Rate Simulator</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Estimate what the platform admin treasury will disburse for your monthly video reels across Chennai & Tiruvallur.
            </p>

            {/* Slider 1: Monthly Views */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>Monthly Verified Views</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{simViews.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={simViews}
                onChange={(e) => setSimViews(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Slider 2: Hyperlocal % */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>Hyperlocal Views (within 5km district radius, 1.5× bonus)</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{simLocalPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={simLocalPercent}
                onChange={(e) => setSimLocalPercent(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Output Result */}
            <div
              style={{
                background: '#fff7ed',
                border: '1.5px solid #ffedd5',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-secondary)', textTransform: 'uppercase' }}>
                Estimated Monthly Admin Payout
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-primary)', margin: '4px 0' }}>
                {formatINR(totalSimulatedEarnings)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Guaranteed by LocalPulse Bureau Admin Treasury
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUT HISTORY / RECEIPTS */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Admin Treasury UPI Disbursement Receipts
          </div>
          {transactions.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '36px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                margin: '8px 0'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Clock size={28} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Payout History Yet
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '300px', margin: '0 auto' }}>
                Once your submitted reports are verified by the admin treasury, your direct UPI transfer receipts and UTR reference numbers will appear here.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: tx.type === 'bounty' ? '#ecfdf5' : tx.type === 'admin_payout' ? '#fff7ed' : '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tx.type === 'bounty' ? '#059669' : tx.type === 'admin_payout' ? '#ea580c' : '#2563eb'
                    }}
                  >
                    {tx.type === 'bounty' ? <Award size={16} /> : tx.type === 'admin_payout' ? <Building2 size={16} /> : <Download size={16} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                      {tx.type === 'bounty'
                        ? `Admin Breaking Bounty: ${tx.relatedPostTitle || 'Exclusive Video'}`
                        : tx.type === 'admin_payout'
                        ? `Admin Video Grant: ${tx.relatedPostTitle || 'Reel Watch Session'}`
                        : tx.type === 'payout'
                        ? `Transfer to ${tx.method || 'UPI'}`
                        : `Tip: ${tx.relatedPostTitle || 'Viewer Support'}`}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN')} • {tx.adminDesk || 'Chennai Admin Treasury'} • UTR #{tx.id.slice(-6)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: tx.type === 'payout' ? 'var(--text-primary)' : 'var(--color-success)'
                  }}
                >
                  {tx.type === 'payout' ? '-' : '+'}{formatINR(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Withdrawal Sheet Modal */}
      {showWithdrawModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowWithdrawModal(false)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px' }}>
            <div className="sheet-handle-bar" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Request Earnings Payout (₹)</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Disbursed by Admin Treasury to UPI</div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            {payoutFeedback ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                {payoutFeedback.success ? (
                  <>
                    <CheckCircle2 size={44} color="var(--color-success)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>UPI Transfer Initiated!</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {payoutFeedback.message}
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={44} color="var(--brand-alert)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Payout Failed</h4>
                    <p style={{ fontSize: '12px', color: 'var(--brand-alert)', marginTop: '4px' }}>
                      {payoutFeedback.message}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Withdrawal Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={MIN_PAYOUT_THRESHOLD}
                    max={wallet.balance}
                    step="10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Available: {formatINR(wallet.balance)} • Minimum: {formatINR(MIN_PAYOUT_THRESHOLD)}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Payout Rails / UPI ID
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      background: '#ffffff'
                    }}
                  >
                    <option value="UPI (anbarasan@okhdfcbank)">Google Pay / PhonePe UPI (anbarasan@okhdfcbank)</option>
                    <option value="Paytm UPI (98401XXXXX@paytm)">Paytm UPI ID</option>
                    <option value="IMPS Direct Bank (Indian Bank A/C •••• 5021)">Indian Bank IMPS Direct (Branch: Parrys)</option>
                    <option value="State Bank of India (SBI A/C •••• 9812)">State Bank of India (SBI) Direct Wire</option>
                  </select>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span>Admin Treasury direct clearing with Indian Income Tax TDS 194-O compliance.</span>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px', fontSize: '14px', marginTop: '6px' }}
                >
                  Confirm ₹{parseFloat(withdrawAmount || '0').toLocaleString('en-IN')} Transfer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
