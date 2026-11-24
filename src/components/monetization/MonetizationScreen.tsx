import React, { useState, useEffect, useCallback } from 'react';
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
  MapPin,
  RotateCw,
  Smartphone,
  CreditCard,
  Building,
  User as UserIcon,
  Phone
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
import { apiClient } from '../../services/apiClient';
import { saveWallet } from '../../services/storageService';

interface MonetizationScreenProps {
  user: User;
  wallet: Wallet;
  transactions: Transaction[];
  userPosts: VideoPost[];
  allPosts: VideoPost[];
  onRequestPayout: (amount: number, method: string) => { success: boolean; message: string };
  onAdminApprovePayout: (postId: string, payoutAmount: number, bountyAmount: number) => void;
  onRefreshWallet?: () => void;
}

export const MonetizationScreen: React.FC<MonetizationScreenProps> = ({
  user,
  wallet,
  transactions,
  userPosts,
  allPosts,
  onRequestPayout,
  onAdminApprovePayout,
  onRefreshWallet
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'history'>('dashboard');
  const [liveWallet, setLiveWallet] = useState<Wallet>(wallet);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>(transactions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize with incoming props
  useEffect(() => {
    setLiveWallet(wallet);
  }, [wallet]);

  useEffect(() => {
    setLiveTransactions(transactions);
  }, [transactions]);

  // Live fetch fresh wallet directly from backend/Supabase
  const fetchFreshWallet = useCallback(async () => {
    if (!user?.id) return;
    setIsRefreshing(true);
    try {
      const res = await apiClient.getWallet(user.id);
      if (res?.wallet) {
        setLiveWallet(res.wallet);
        saveWallet(res.wallet);
      }
      if (res?.transactions && res.transactions.length > 0) {
        setLiveTransactions(res.transactions);
      }
    } catch (err) {
      console.warn('Failed to fetch fresh wallet:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFreshWallet();
  }, [fetchFreshWallet]);

  // Redemption Form State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [methodType, setMethodType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user.displayName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [payoutFeedback, setPayoutFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (showWithdrawModal) {
      setWithdrawAmount(liveWallet.balance > 0 ? String(Math.round(liveWallet.balance)) : '500');
      setAccountHolderName(user.displayName || '');
      setPhone(user.phone || '');
      setFormError(null);
      setPayoutFeedback(null);
    }
  }, [showWithdrawModal, liveWallet.balance, user.displayName, user.phone]);

  // Simulator state
  const [simViews, setSimViews] = useState(25000);
  const [simLocalPercent, setSimLocalPercent] = useState(85);
  const [simTier, setSimTier] = useState<'bronze' | 'silver' | 'gold'>('silver');

  const tierProgress = getTierProgress(liveWallet.qualifiedViewsTotal);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid points amount to redeem.');
      return;
    }
    if (amt > liveWallet.balance) {
      setFormError(`Insufficient points. You have ${Math.round(liveWallet.balance)} points available.`);
      return;
    }
    if (methodType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setFormError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm).');
        return;
      }
    } else {
      if (!accountHolderName.trim()) {
        setFormError('Please enter the Account Holder Name.');
        return;
      }
      if (!accountNumber.trim()) {
        setFormError('Please enter Bank Account Number.');
        return;
      }
      if (accountNumber.trim() !== confirmAccountNumber.trim()) {
        setFormError('Bank Account Numbers do not match. Please verify.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length < 4) {
        setFormError('Please enter a valid Bank IFSC Code (e.g. SBIN0001234).');
        return;
      }
      if (!bankName.trim()) {
        setFormError('Please enter your Bank Name.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.redeemPoints({
        amount: amt,
        methodType,
        upiId: upiId.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
        phone: phone.trim(),
        userId: user.id,
        userName: user.displayName,
        userHandle: user.handle,
        userEmail: user.email
      });

      setIsSubmitting(false);
      if (res.success) {
        setPayoutFeedback({ success: true, message: res.message });
        if (res.data) {
          setLiveWallet(res.data);
          saveWallet(res.data);
        } else {
          setLiveWallet((prev) => ({
            ...prev,
            balance: Math.max(0, prev.balance - amt)
          }));
        }
        if (onRefreshWallet) onRefreshWallet();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setShowWithdrawModal(false);
          setPayoutFeedback(null);
        }, 2200);
      } else {
        setFormError(res.error || res.message || 'Redemption request failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Network error occurred while submitting redemption.');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Creator Points
            </h2>
            <button
              onClick={fetchFreshWallet}
              title="Refresh Points Balance from Server"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <RotateCw size={10} className={isRefreshing ? 'spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
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
            <span>Rewards Active</span>
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
          Points earned from verified video reports and community views across North Tamil Nadu
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
          Points & Views
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
          Points Simulator
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
          Redemptions
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
                  Available Points
                </span>
                <div style={{ fontSize: '30px', fontWeight: 800, margin: '2px 0 4px', letterSpacing: '-0.02em' }}>
                  {Math.round(liveWallet.balance).toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>Points</span>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  background: '#ffffff',
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                <span>Redeem Points</span>
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
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Lifetime Points</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{Math.round(liveWallet.lifetimeEarnings).toLocaleString('en-IN')} Pts</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>This Month</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{Math.round(liveWallet.thisMonthEarnings).toLocaleString('en-IN')} Pts</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Qualified Views</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{liveWallet.qualifiedViewsTotal.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.85 }}>Next Redemption</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>Instant via Admin</div>
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
                Your News Reels & Points
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
                        {Math.round(totalPaid)} Points
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
        <div className="bottom-sheet-backdrop" onClick={() => !isSubmitting && setShowWithdrawModal(false)}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="sheet-handle-bar" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Redeem Creator Points (₹)
                </h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Choose your preferred payout method (UPI or Direct Bank Transfer)
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setShowWithdrawModal(false)}
                style={{ color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {payoutFeedback ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                {payoutFeedback.success ? (
                  <>
                    <CheckCircle2 size={46} color="var(--color-success)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Redemption Request Submitted!</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '320px', margin: '4px auto 0' }}>
                      {payoutFeedback.message}
                    </p>
                    <div style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', marginTop: '12px', display: 'inline-block' }}>
                      Admin Treasury is reviewing and processing payout.
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={46} color="var(--brand-alert)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-alert)' }}>Redemption Failed</h4>
                    <p style={{ fontSize: '12px', color: 'var(--brand-alert)', marginTop: '4px' }}>
                      {payoutFeedback.message}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Amount Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Points to Redeem (1 Point = ₹1)
                    </label>
                    {liveWallet.balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(String(Math.round(liveWallet.balance)))}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--brand-primary)',
                          background: 'var(--brand-primary-light, #fff7ed)',
                          border: '1px solid var(--accent-orange-border, #fed7aa)',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        Redeem All ({Math.round(liveWallet.balance)} Pts)
                      </button>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="1"
                      max={liveWallet.balance}
                      step="1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-subtle)',
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    <span>Available: <b>{Math.round(liveWallet.balance).toLocaleString('en-IN')} Points</b></span>
                    <span>Payout Amount: <b>₹{parseFloat(withdrawAmount || '0').toLocaleString('en-IN')}</b></span>
                  </div>
                </div>

                {/* 2. Payment Method Selector */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Select Preferred Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setMethodType('upi')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: methodType === 'upi' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        background: methodType === 'upi' ? 'var(--brand-primary-light, #fff7ed)' : '#f8fafc',
                        color: methodType === 'upi' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Smartphone size={16} />
                      <span>UPI ID / VPA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethodType('bank')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: methodType === 'bank' ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        background: methodType === 'bank' ? 'var(--brand-primary-light, #fff7ed)' : '#f8fafc',
                        color: methodType === 'bank' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Building size={16} />
                      <span>Bank Account</span>
                    </button>
                  </div>
                </div>

                {/* 3A. UPI Fields */}
                {methodType === 'upi' && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        UPI ID / Virtual Payment Address *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                        Works with Google Pay, PhonePe, Paytm, BHIM, Cred, and any bank UPI app.
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Registered Payee Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name as registered in bank"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Contact Mobile / WhatsApp Number (for Payout SMS)
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 3B. Bank Transfer Fields */}
                {methodType === 'bank' && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Full name as printed in Bank Passbook"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Bank Name & Branch *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India, Chennai Main Branch"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter bank account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\s+/g, ''))}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Re-Enter Account Number (Confirm) *
                      </label>
                      <input
                        type="text"
                        placeholder="Re-enter bank account number to confirm"
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\s+/g, ''))}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: confirmAccountNumber && confirmAccountNumber !== accountNumber ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                      {confirmAccountNumber && confirmAccountNumber !== accountNumber && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
                          Account numbers do not match!
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Bank IFSC Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234 or HDFC0000123"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        maxLength={11}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        11-character alphanumeric IFSC code found on your bank cheque leaf or passbook.
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Registered Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Form Error Banner */}
                {formError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Treasury Notice */}
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
                  <span>Admin Treasury direct clearance with Indian Income Tax TDS 194-O compliance.</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || liveWallet.balance <= 0}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isSubmitting || liveWallet.balance <= 0 ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || liveWallet.balance <= 0 ? 0.6 : 1
                  }}
                >
                  {isSubmitting && <RotateCw size={16} className="spin" />}
                  <span>
                    {isSubmitting
                      ? 'Submitting Redemption...'
                      : `Confirm ₹${parseFloat(withdrawAmount || '0').toLocaleString('en-IN')} ${methodType === 'upi' ? 'UPI' : 'Bank'} Transfer`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
