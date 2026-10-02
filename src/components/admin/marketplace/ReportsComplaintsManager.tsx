import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Trash2,
  Eye,
  MessageSquare,
  Tag,
  Briefcase,
  Home,
  Users,
  RefreshCw,
  X
} from 'lucide-react';
import type { AdminMarketplaceReport } from '../../../services/marketplaceAdminService';

interface ReportsComplaintsManagerProps {
  reports: AdminMarketplaceReport[];
  onRefresh: () => void;
  onUpdateReport: (id: string, updates: Partial<AdminMarketplaceReport>) => Promise<void>;
  onDeleteReport: (id: string) => Promise<void>;
  canModerate: boolean;
}

export const ReportsComplaintsManager: React.FC<ReportsComplaintsManagerProps> = ({
  reports,
  onRefresh,
  onUpdateReport,
  onDeleteReport,
  canModerate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'under_review' | 'resolved' | 'rejected' | 'escalated'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'job' | 'property' | 'user'>('all');
  const [inspectingReport, setInspectingReport] = useState<AdminMarketplaceReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [assignedModerator, setAssignedModerator] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.itemType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.reason.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.reporterName.toLowerCase().includes(q) ||
          r.itemId.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, statusFilter, typeFilter, searchQuery]);

  const openInspection = (rep: AdminMarketplaceReport) => {
    setInspectingReport(rep);
    setAdminNotes(rep.adminNotes || '');
    setResolutionText(rep.resolution || '');
    setAssignedModerator(rep.assignedModerator || 'Moderator Desk');
  };

  const handleSaveResolution = async (status: AdminMarketplaceReport['status']) => {
    if (!inspectingReport) return;
    await onUpdateReport(inspectingReport.id, {
      status,
      adminNotes,
      resolution: resolutionText,
      assignedModerator
    });
    setInspectingReport(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search & Filter Header */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search reports by reason, description, reporter, item ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Module Filter Dropdown & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Module:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Modules</option>
              <option value="product">OLX Products</option>
              <option value="job">Jobs</option>
              <option value="property">Real Estate</option>
              <option value="user">User Profiles</option>
            </select>

            <button
              onClick={onRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Refresh Reports"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: `All Reports (${reports.length})` },
            { id: 'new', label: `New (${reports.filter((r) => r.status === 'new').length})` },
            { id: 'under_review', label: `Under Review (${reports.filter((r) => r.status === 'under_review').length})` },
            { id: 'resolved', label: `Resolved (${reports.filter((r) => r.status === 'resolved').length})` },
            { id: 'rejected', label: `Rejected (${reports.filter((r) => r.status === 'rejected').length})` },
            { id: 'escalated', label: `Escalated (${reports.filter((r) => r.status === 'escalated').length})` }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === pill.id ? '#ff4500' : '#f1f5f9',
                color: statusFilter === pill.id ? '#ffffff' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Report ID & Type</th>
                <th style={{ padding: '12px 16px' }}>Reported Item / Target</th>
                <th style={{ padding: '12px 16px' }}>Reason & Claim</th>
                <th style={{ padding: '12px 16px' }}>Reporter</th>
                <th style={{ padding: '12px 16px' }}>Moderator</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <ShieldAlert size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569' }}>No reports or complaints in this queue</div>
                    <div style={{ fontSize: '12px' }}>Citizen moderation queue is currently clear.</div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const getModuleIcon = (type: string) => {
                    switch (type) {
                      case 'product': return <Tag size={13} color="#ea580c" />;
                      case 'job': return <Briefcase size={13} color="#2563eb" />;
                      case 'property': return <Home size={13} color="#059669" />;
                      case 'user': return <Users size={13} color="#7c3aed" />;
                      default: return <AlertTriangle size={13} color="#dc2626" />;
                    }
                  };

                  return (
                    <tr
                      key={rep.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Report ID & Type */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getModuleIcon(rep.itemType)}
                          <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                            {rep.itemType}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{rep.id}</div>
                      </td>

                      {/* Reported Item / Target */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>ID: {rep.itemId}</div>
                        {rep.reportedUserId && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>User: {rep.reportedUserId}</div>
                        )}
                      </td>

                      {/* Reason & Claim */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#dc2626', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rep.reason}
                        </div>
                        {rep.description && (
                          <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rep.description}
                          </div>
                        )}
                      </td>

                      {/* Reporter */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{rep.reporterName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{rep.reporterContact || 'Contact hidden'}</div>
                      </td>

                      {/* Assigned Moderator */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                          {rep.assignedModerator}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                        {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background:
                              rep.status === 'new' ? '#fee2e2' :
                              rep.status === 'under_review' ? '#fef3c7' :
                              rep.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                            color:
                              rep.status === 'new' ? '#b91c1c' :
                              rep.status === 'under_review' ? '#b45309' :
                              rep.status === 'resolved' ? '#15803d' : '#64748b',
                            textTransform: 'uppercase'
                          }}
                        >
                          {rep.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => openInspection(rep)}
                            style={{
                              background: '#f1f5f9',
                              border: 'none',
                              color: '#334155',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            <Eye size={13} />
                            <span>Review</span>
                          </button>

                          {canModerate && (
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this report record?')) {
                                  onDeleteReport(rep.id);
                                }
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Delete Report"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Review & Resolution Modal */}
      {inspectingReport && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setInspectingReport(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a',
                color: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="#ef4444" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    Report Review • {inspectingReport.id}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Module: {inspectingReport.itemType.toUpperCase()} • Item ID: {inspectingReport.itemId}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Citizen Complaint Reason
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#b91c1c' }}>{inspectingReport.reason}</div>
                {inspectingReport.description && (
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                    "{inspectingReport.description}"
                  </div>
                )}
              </div>

              {/* Reporter details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Reporter: </span>
                  <strong>{inspectingReport.reporterName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Contact: </span>
                  <strong>{inspectingReport.reporterContact || 'N/A'}</strong>
                </div>
              </div>

              {/* Assigned Moderator */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Assigned Moderator / Desk
                </label>
                <input
                  type="text"
                  value={assignedModerator}
                  onChange={(e) => setAssignedModerator(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Internal Moderation Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record investigations, seller contacts, or verification findings..."
                  style={{
                    width: '100%',
                    minHeight: '70px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Resolution */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Final Resolution & Corrective Action
                </label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="e.g. Warning issued to seller, listing verified and approved, or listing removed for policy violation."
                  style={{
                    width: '100%',
                    minHeight: '70px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Footer Status Actions */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setInspectingReport(null)}
                style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleSaveResolution('under_review')}
                  style={{ background: '#f59e0b', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Under Review
                </button>
                <button
                  onClick={() => handleSaveResolution('rejected')}
                  style={{ background: '#64748b', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Dismiss / Reject
                </button>
                <button
                  onClick={() => handleSaveResolution('escalated')}
                  style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Escalate
                </button>
                <button
                  onClick={() => handleSaveResolution('resolved')}
                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Resolve Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
