import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  Eye,
  Film,
  User,
  Info,
  Calendar,
  Search,
  Filter,
  Check,
  Send,
  Lock,
  ChevronRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import type { CopyrightReport, CopyrightStrike, VideoPost } from '../../types';
import { apiClient } from '../../services/apiClient';
import {
  getStoredCopyrightReports,
  saveStoredCopyrightReports,
  getStoredCopyrightStrikes,
  saveStoredCopyrightStrikes,
  getStoredPosts,
  savePosts,
  addStoredNotification
} from '../../services/storageService';

interface CopyrightManagerProps {
  posts: VideoPost[];
  onRefreshData?: () => void;
  adminName?: string;
}

type CopyrightSubTab = 'claims' | 'strikes' | 'suspended' | 'policy';

export const CopyrightManager: React.FC<CopyrightManagerProps> = ({
  posts,
  onRefreshData,
  adminName = 'SuperAdmin Bureau Desk'
}) => {
  const [subTab, setSubTab] = useState<CopyrightSubTab>('claims');
  const [reports, setReports] = useState<CopyrightReport[]>(() => getStoredCopyrightReports());
  const [strikes, setStrikes] = useState<CopyrightStrike[]>(() => getStoredCopyrightStrikes());
  const [claimFilter, setClaimFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [inspectingReport, setInspectingReport] = useState<CopyrightReport | null>(null);
  const [approvingReport, setApprovingReport] = useState<CopyrightReport | null>(null);
  const [rejectingReport, setRejectingReport] = useState<CopyrightReport | null>(null);
  const [revokingStrike, setRevokingStrike] = useState<CopyrightStrike | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load latest reports and strikes from server
  const loadData = async () => {
    try {
      const serverReports = await apiClient.getCopyrightReports();
      if (serverReports && serverReports.length > 0) {
        setReports(serverReports);
        saveStoredCopyrightReports(serverReports);
      }
    } catch {}

    try {
      const serverStrikes = await apiClient.getCopyrightStrikes();
      if (serverStrikes && serverStrikes.length > 0) {
        setStrikes(serverStrikes);
        saveStoredCopyrightStrikes(serverStrikes);
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Metrics
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const activeStrikes = strikes.filter((s) => s.status === 'active');
  const activeStrikesCount = activeStrikes.length;
  const suspendedUsersMap = new Map<string, number>();
  activeStrikes.forEach((s) => {
    suspendedUsersMap.set(s.userId, (suspendedUsersMap.get(s.userId) || 0) + 1);
  });
  const suspendedCount = Array.from(suspendedUsersMap.values()).filter((c) => c >= 3).length;
  const resolvedCount = reports.filter((r) => r.status === 'approved' || r.status === 'rejected').length;

  // Filtered Claims
  const filteredReports = reports.filter((r) => {
    if (claimFilter !== 'all' && r.status !== claimFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.postTitle?.toLowerCase().includes(q) ||
        r.claimantName.toLowerCase().includes(q) ||
        r.originalWorkTitle.toLowerCase().includes(q) ||
        r.postCreatorHandle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Approve Report & Issue Strike
  const handleApproveReport = async () => {
    if (!approvingReport) return;
    setIsProcessing(true);

    try {
      const res = await apiClient.reviewCopyrightReport(
        approvingReport.id,
        'approved',
        actionNotes || 'Valid copyright infringement confirmed by Bureau Desk.',
        adminName
      );

      // Update local state
      const updatedReports = reports.map((r) =>
        r.id === approvingReport.id
          ? {
              ...r,
              status: 'approved' as const,
              adminNotes: actionNotes,
              reviewedBy: adminName,
              reviewedAt: new Date().toISOString()
            }
          : r
      );
      setReports(updatedReports);
      saveStoredCopyrightReports(updatedReports);

      // Add strike locally if returned
      if (res.strike) {
        const updatedStrikes = [res.strike, ...strikes];
        setStrikes(updatedStrikes);
        saveStoredCopyrightStrikes(updatedStrikes);
      }

      // Update local posts to copyright_takedown
      const storedPosts = getStoredPosts();
      const updatedPosts = storedPosts.map((p) =>
        p.id === approvingReport.postId ? { ...p, status: 'copyright_takedown' as const } : p
      );
      savePosts(updatedPosts);

      showToast(
        `Claim approved. Content taken down. Strike issued${
          res.uploadBlocked ? ' — User upload privileges SUSPENDED (3 strikes)!' : '.'
        }`
      );
      setApprovingReport(null);
      setInspectingReport(null);
      setActionNotes('');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(`Error approving claim: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject Report
  const handleRejectReport = async () => {
    if (!rejectingReport) return;
    setIsProcessing(true);

    try {
      await apiClient.reviewCopyrightReport(
        rejectingReport.id,
        'rejected',
        actionNotes || 'Dismissed: Fair use or insufficient proof of ownership.',
        adminName
      );

      const updatedReports = reports.map((r) =>
        r.id === rejectingReport.id
          ? {
              ...r,
              status: 'rejected' as const,
              adminNotes: actionNotes,
              reviewedBy: adminName,
              reviewedAt: new Date().toISOString()
            }
          : r
      );
      setReports(updatedReports);
      saveStoredCopyrightReports(updatedReports);

      showToast('Copyright claim dismissed and marked as rejected.');
      setRejectingReport(null);
      setInspectingReport(null);
      setActionNotes('');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(`Error rejecting claim: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Revoke Strike
  const handleRevokeStrike = async () => {
    if (!revokingStrike) return;
    setIsProcessing(true);

    try {
      const res = await apiClient.revokeCopyrightStrike(
        revokingStrike.id,
        actionNotes || 'Counter-notification accepted / claimant retracted'
      );

      const updatedStrikes = strikes.map((s) =>
        s.id === revokingStrike.id ? { ...s, status: 'revoked' as const } : s
      );
      setStrikes(updatedStrikes);
      saveStoredCopyrightStrikes(updatedStrikes);

      showToast(
        `Strike revoked. Remaining active strikes: ${res.remainingStrikes}/3.${
          !res.uploadBlocked ? ' Upload privileges restored!' : ''
        }`
      );
      setRevokingStrike(null);
      setActionNotes('');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(`Error revoking strike: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* 1. Header Banner & YouTube 3-Strike Concept Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}
              >
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Copyright & Strike Moderation Desk (பதிப்புரிமை நிர்வாகம்)
                </h2>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                  YouTube-style 3-strike governance system for Spotlight360 Hyperlocal News Platform
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={loadData}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={13} />
              <span>Refresh Claims</span>
            </button>
          </div>
        </div>

        {/* 3-Strike Warning Timeline Progress Bar */}
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '14px 18px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Spotlight 3-Strike Escalation Policy (90-Day Sliding Window)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                borderLeft: '4px solid #ea580c'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fb923c' }}>Strike 1 (First Warning)</span>
                <span style={{ fontSize: '9px', background: 'rgba(234, 88, 12, 0.3)', padding: '1px 6px', borderRadius: '4px', color: '#fed7aa' }}>90 Days</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.35 }}>
                Content taken down immediately. 1-week upload restriction warning issued.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                borderLeft: '4px solid #e11d48'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fda4af' }}>Strike 2 (Second Warning)</span>
                <span style={{ fontSize: '9px', background: 'rgba(225, 29, 72, 0.3)', padding: '1px 6px', borderRadius: '4px', color: '#ffe4e6' }}>90 Days</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.35 }}>
                Content taken down. 2-week restriction on new uploads issued.
              </div>
            </div>

            <div
              style={{
                background: 'rgba(185, 28, 28, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px',
                borderLeft: '4px solid #ef4444'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fca5a5' }}>Strike 3 (Upload Suspension)</span>
                <span style={{ fontSize: '9px', background: '#dc2626', padding: '1px 6px', borderRadius: '4px', color: '#ffffff', fontWeight: 800 }}>LOCKED</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.35 }}>
                Permanent account upload suspension. Upload API returns 403 Forbidden.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Pending Claims</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, marginTop: '4px' }}>
            Requires Bureau Audit
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Active Strikes</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {activeStrikesCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Within 90-day validity
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Suspended Creators</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c' }}>
              <Ban size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b91c1c', marginTop: '8px' }}>
            {suspendedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700, marginTop: '4px' }}>
            3 Strikes (Uploads Blocked)
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Resolved Claims</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
            Takedowns / Dismissals
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '2px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'claims' as const, label: 'Infringement Claims', count: pendingCount },
            { id: 'strikes' as const, label: 'Active Strikes Registry', count: activeStrikesCount },
            { id: 'suspended' as const, label: 'Suspended Creators (3 Strikes)', count: suspendedCount },
            { id: 'policy' as const, label: '3-Strike Policy Guide' }
          ].map((tab) => {
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s'
                }}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? '#ea580c' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {subTab === 'claims' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 12px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  width: '180px'
                }}
              />
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              {[
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'all', label: 'All' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setClaimFilter(f.id as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: claimFilter === f.id ? '#ffffff' : 'transparent',
                    color: claimFilter === f.id ? '#0f172a' : '#64748b',
                    fontWeight: claimFilter === f.id ? 700 : 500,
                    fontSize: '11px',
                    cursor: 'pointer',
                    boxShadow: claimFilter === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SUB-TAB CONTENT: CLAIMS */}
      {subTab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredReports.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                No Copyright Infringement Claims Found
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {claimFilter === 'pending'
                  ? 'All citizen dispatches are currently in compliance with community intellectual property rules.'
                  : 'No claims match your current filter criteria.'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              // Calculate creator's current strike count
              const creatorActiveStrikes = strikes.filter(
                (s) => s.userId === report.postCreatorId && s.status === 'active'
              ).length;

              return (
                <div
                  key={report.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Top Row: Meta, Status, and Creator Strike standing */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background:
                            report.status === 'pending'
                              ? '#fff7ed'
                              : report.status === 'approved'
                              ? '#ecfdf5'
                              : '#fef2f2',
                          color:
                            report.status === 'pending'
                              ? '#ea580c'
                              : report.status === 'approved'
                              ? '#059669'
                              : '#dc2626',
                          border: `1px solid ${
                            report.status === 'pending'
                              ? '#fed7aa'
                              : report.status === 'approved'
                              ? '#a7f3d0'
                              : '#fecaca'
                          }`
                        }}
                      >
                        {report.status.toUpperCase()}
                      </span>

                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Ref: <code>{report.id}</code> • {new Date(report.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Creator Strike Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Creator Standing:</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background:
                            creatorActiveStrikes >= 3
                              ? '#fee2e2'
                              : creatorActiveStrikes > 0
                              ? '#fff7ed'
                              : '#ecfdf5',
                          color:
                            creatorActiveStrikes >= 3
                              ? '#dc2626'
                              : creatorActiveStrikes > 0
                              ? '#ea580c'
                              : '#059669',
                          border: '1px solid currentColor'
                        }}
                      >
                        {creatorActiveStrikes}/3 Strikes
                        {creatorActiveStrikes >= 3 ? ' (SUSPENDED)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Content & Claimant details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
                    {/* Left: Reported Post Info */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        gap: '12px'
                      }}
                    >
                      <img
                        src={report.postThumbnailUrl || report.postMediaUrl}
                        alt={report.postTitle}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          background: '#0f172a',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                          Reported Spotlight Video
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.3,
                            marginTop: '2px'
                          }}
                        >
                          {report.postTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                          Creator: <strong>@{report.postCreatorHandle}</strong> ({report.postCreatorName})
                        </div>
                      </div>
                    </div>

                    {/* Right: Claimant & Original Work */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div>
                        <strong>Claimant:</strong> {report.claimantName} ({report.claimantEmail}) •{' '}
                        <span style={{ color: '#ea580c', fontWeight: 700 }}>
                          {report.claimantRelation === 'owner' ? 'Copyright Owner' : 'Authorized Representative'}
                        </span>
                      </div>
                      <div>
                        <strong>Original Work:</strong> {report.originalWorkTitle}
                        {report.originalWorkUrl && (
                          <a
                            href={report.originalWorkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: '6px',
                              color: '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              textDecoration: 'none'
                            }}
                          >
                            <span>Verify Source</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <div>
                        <strong>Violation:</strong>{' '}
                        <span style={{ textTransform: 'capitalize' }}>{report.infringementType.replace('_', ' ')}</span>
                        {report.infringementTimestamp && ` • Timestamps: ${report.infringementTimestamp}`}
                      </div>
                      <div style={{ color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                        "{report.description}"
                      </div>
                      {report.adminNotes && (
                        <div style={{ marginTop: '4px', color: '#0f172a', background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <strong>Bureau Audit Note:</strong> {report.adminNotes} (by {report.reviewedBy})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      onClick={() => setInspectingReport(report)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={13} />
                      <span>Inspect Details</span>
                    </button>

                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setRejectingReport(report);
                            setActionNotes('');
                          }}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <XCircle size={14} />
                          <span>Reject / Dismiss</span>
                        </button>

                        <button
                          onClick={() => {
                            setApprovingReport(report);
                            setActionNotes('');
                          }}
                          style={{
                            padding: '7px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <Check size={14} />
                          <span>Approve & Issue Strike</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. SUB-TAB CONTENT: STRIKES REGISTRY */}
      {subTab === 'strikes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {strikes.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                No Active Copyright Strikes
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                All creator channels on Spotlight360 are currently in full standing with zero active violations.
              </p>
            </div>
          ) : (
            strikes.map((strike) => (
              <div
                key={strike.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background:
                        strike.status === 'revoked'
                          ? '#f1f5f9'
                          : strike.strikeNumber >= 3
                          ? '#fee2e2'
                          : '#fff7ed',
                      color:
                        strike.status === 'revoked'
                          ? '#64748b'
                          : strike.strikeNumber >= 3
                          ? '#dc2626'
                          : '#ea580c',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>#{strike.strikeNumber}</span>
                    <span style={{ fontSize: '8px', textTransform: 'uppercase' }}>
                      {strike.status === 'revoked' ? 'Revoked' : 'Strike'}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {strike.postTitle || 'Citizen Video Dispatch'}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: strike.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                          color: strike.status === 'active' ? '#059669' : '#64748b'
                        }}
                      >
                        {strike.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                      Channel: <strong>@{strike.userHandle || strike.userId}</strong> ({strike.userName || 'Creator'}) •
                      Claimant: {strike.claimantName} • Reason: {strike.reason}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Issued: {new Date(strike.createdAt).toLocaleDateString()} • Expires:{' '}
                      {new Date(strike.expiresAt).toLocaleDateString()} (90 days)
                    </div>
                  </div>
                </div>

                {strike.status === 'active' && (
                  <button
                    onClick={() => {
                      setRevokingStrike(strike);
                      setActionNotes('');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Revoke / Resolve Appeal</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. SUB-TAB CONTENT: SUSPENDED CREATORS */}
      {subTab === 'suspended' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {suspendedCount === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                No Accounts Under Upload Suspension
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                No citizen journalists or creators currently hold 3 active strikes. All accounts have full upload access.
              </p>
            </div>
          ) : (
            Array.from(suspendedUsersMap.entries())
              .filter(([_, count]) => count >= 3)
              .map(([userId, count]) => {
                const userStrikes = activeStrikes.filter((s) => s.userId === userId);
                const first = userStrikes[0];
                return (
                  <div
                    key={userId}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: '#dc2626',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Ban size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                          @{first?.userHandle || userId} ({first?.userName || 'Creator'})
                        </div>
                        <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                          <strong>{count} Active Copyright Strikes</strong> — Upload privileges locked across web & mobile.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSubTab('strikes')}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #fca5a5',
                          color: '#991b1b',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Violations
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* 7. SUB-TAB CONTENT: POLICY GUIDE */}
      {subTab === 'policy' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#334155'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Spotlight360 Copyright Infringement & YouTube 3-Strike Governance
          </h3>
          <p>
            Spotlight360 empowers hyper-local citizen journalism while protecting media rights, news agencies, and copyright holders. Our copyright management architecture replicates the YouTube 3-strike policy with automated penalty escalation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#ea580c', marginBottom: '6px' }}>Strike 1: Warning Notice</div>
              <div>
                • Content removed immediately from feed and reels.<br />
                • 1-week upload restriction warning issued.<br />
                • Strike expires automatically in 90 days if no further violations occur.
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#e11d48', marginBottom: '6px' }}>Strike 2: Final Warning</div>
              <div>
                • Content removed immediately.<br />
                • 2-week restriction on publishing or uploading.<br />
                • Creator receives high-urgency notifications of pending suspension.
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '6px' }}>Strike 3: Account Lock</div>
              <div>
                • All upload privileges permanently suspended.<br />
                • Direct API calls and UI submission rejected with HTTP 403.<br />
                • Only admin counter-notification resolution can restore access.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE CLAIM & ISSUE STRIKE */}
      {approvingReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setApprovingReport(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Approve Copyright Claim & Issue Strike
              </h3>
            </div>

            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Approving this claim will <strong>immediately take down</strong> the video dispatch "
              {approvingReport.postTitle}" and increment <strong>@{approvingReport.postCreatorHandle}</strong>'s active strike counter.
            </p>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <div><strong>Claimant:</strong> {approvingReport.claimantName}</div>
              <div><strong>Original Work:</strong> {approvingReport.originalWorkTitle}</div>
              <div><strong>Infringement:</strong> {approvingReport.infringementType} ({approvingReport.infringementTimestamp || 'Full'})</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Bureau Audit Reason / Strike Note (Sent to Creator)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Broadcast video footage was confirmed to be owned exclusively by Sun News Tamil without licensing."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setApprovingReport(null)}
                disabled={isProcessing}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveReport}
                disabled={isProcessing}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} />
                <span>{isProcessing ? 'Processing Takedown...' : 'Confirm Strike & Takedown'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT CLAIM */}
      {rejectingReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setRejectingReport(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Dismiss Copyright Claim
            </h3>

            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Dismiss this claim if it qualifies under fair use, has insufficient proof of ownership, or is fraudulent.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Dismissal Reason (Sent to Claimant)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Fair use under news reporting guidelines, or proof of broadcast ownership was not supplied."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRejectingReport(null)}
                disabled={isProcessing}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectReport}
                disabled={isProcessing}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Dismissing...' : 'Confirm Dismissal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVOKE STRIKE */}
      {revokingStrike && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setRevokingStrike(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RotateCcw size={20} color="#2563eb" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Revoke Copyright Strike
              </h3>
            </div>

            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Revoking this strike will decrement @{revokingStrike.userHandle}'s strike counter. If their active strikes drop below 3, upload privileges will automatically be restored.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Resolution Reason
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Creator counter-notification accepted, or claimant formally retracted infringement claim."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRevokingStrike(null)}
                disabled={isProcessing}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeStrike}
                disabled={isProcessing}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
