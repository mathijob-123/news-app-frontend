import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Building,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import type { AdminJob } from '../../../services/marketplaceAdminService';

interface JobsAdminManagerProps {
  jobs: AdminJob[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: AdminJob['status'], notes?: string, reason?: string) => Promise<void>;
  onToggleVerify: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canModerate: boolean;
  canDelete: boolean;
}

export const JobsAdminManager: React.FC<JobsAdminManagerProps> = ({
  jobs,
  onRefresh,
  onUpdateStatus,
  onToggleVerify,
  onDelete,
  canModerate,
  canDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'closed' | 'reported'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.category) set.add(j.category);
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'reported') {
          if ((j.reportsCount || 0) === 0) return false;
        } else if (j.status !== statusFilter) {
          return false;
        }
      }
      if (categoryFilter !== 'all' && j.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.recruiterName.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [jobs, statusFilter, categoryFilter, searchQuery]);

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
              placeholder="Search by job title, company, recruiter, location, ID..."
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

          {/* Category Dropdown & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Industry:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              <option value="all">All Industries</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
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
              title="Refresh Jobs"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: `All Jobs (${jobs.length})` },
            { id: 'active', label: `Active (${jobs.filter((j) => j.status === 'active').length})` },
            { id: 'pending', label: `Pending (${jobs.filter((j) => j.status === 'pending').length})` },
            { id: 'expired', label: `Expired (${jobs.filter((j) => j.status === 'expired').length})` },
            { id: 'closed', label: `Closed (${jobs.filter((j) => j.status === 'closed').length})` },
            { id: 'reported', label: `Reported (${jobs.filter((j) => (j.reportsCount || 0) > 0).length})` }
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

      {/* Jobs Table */}
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
                <th style={{ padding: '12px 16px' }}>Job Title & Company</th>
                <th style={{ padding: '12px 16px' }}>Category & Type</th>
                <th style={{ padding: '12px 16px' }}>Salary</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Recruiter</th>
                <th style={{ padding: '12px 16px' }}>Applications</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <Briefcase size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569' }}>No job postings found</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your filters or search terms.</div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr
                    key={j.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Title & Company */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                          }}
                        >
                          <Building size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{j.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{j.company}</span>
                            <span>•</span>
                            <span>ID: {j.id}</span>
                            {j.isVerified && (
                              <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                                <ShieldCheck size={12} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {j.category}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{j.jobType} • {j.experience}</div>
                    </td>

                    {/* Salary */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{j.salary}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{j.openingsCount} Opening(s)</div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#334155', fontWeight: 500 }}>{j.location}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{j.district || 'Chennai'}</div>
                    </td>

                    {/* Recruiter */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{j.recruiterName || j.company}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{j.contactPhone || j.contactEmail}</div>
                    </td>

                    {/* Applications */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700 }}>
                        <Users size={14} />
                        <span>{j.applicantCount} applied</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{j.viewsCount} views</div>
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
                            j.status === 'active' ? '#dcfce7' :
                            j.status === 'pending' ? '#fef3c7' :
                            j.status === 'expired' ? '#f1f5f9' : '#fee2e2',
                          color:
                            j.status === 'active' ? '#15803d' :
                            j.status === 'pending' ? '#b45309' :
                            j.status === 'expired' ? '#64748b' : '#b91c1c',
                          textTransform: 'uppercase'
                        }}
                      >
                        {j.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedJob(j)}
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
                          <span>View</span>
                        </button>

                        {canModerate && j.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(j.id, 'active')}
                            style={{
                              background: '#16a34a',
                              border: 'none',
                              color: '#ffffff',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            Approve
                          </button>
                        )}

                        {canModerate && j.status === 'active' && (
                          <button
                            onClick={() => onUpdateStatus(j.id, 'closed')}
                            style={{
                              background: '#f59e0b',
                              border: 'none',
                              color: '#ffffff',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            Close
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete "${j.title}"?`)) {
                                onDelete(j.id);
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
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Job Details Modal */}
      {selectedJob && (
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
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '750px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(255, 69, 0, 0.2)',
                    border: '1px solid rgba(255, 69, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff4500'
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    {selectedJob.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {selectedJob.company} • ID: {selectedJob.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Job Details Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Salary / Compensation</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{selectedJob.salary}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Job Type & Experience</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedJob.jobType} • {selectedJob.experience}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Location & District</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedJob.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Openings</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedJob.openingsCount} Candidate(s)</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Job Description</h4>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {selectedJob.description}
                </div>
              </div>

              {/* Skills */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJob.skills.map((s, idx) => (
                      <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Information */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Recruiter Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#64748b" />
                    <span>{selectedJob.recruiterName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#2563eb" />
                    <a href={`mailto:${selectedJob.contactEmail}`} style={{ color: '#2563eb', fontWeight: 600 }}>{selectedJob.contactEmail}</a>
                  </div>
                  {selectedJob.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} color="#059669" />
                      <a href={`tel:${selectedJob.contactPhone}`} style={{ color: '#0f172a', fontWeight: 600 }}>{selectedJob.contactPhone}</a>
                    </div>
                  )}
                  {selectedJob.whatsappNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageCircle size={16} color="#25d366" />
                      <a href={`https://wa.me/${selectedJob.whatsappNumber}`} target="_blank" rel="noreferrer" style={{ color: '#0f172a', fontWeight: 600 }}>
                        WhatsApp Recruiter
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canModerate && (
                  <button
                    onClick={() => {
                      onToggleVerify(selectedJob.id, selectedJob.isVerified);
                      setSelectedJob({ ...selectedJob, isVerified: !selectedJob.isVerified });
                    }}
                    style={{
                      background: selectedJob.isVerified ? '#f1f5f9' : '#0284c7',
                      color: selectedJob.isVerified ? '#475569' : '#ffffff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedJob.isVerified ? 'Remove Verified' : 'Verify Job & Recruiter'}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this job?')) {
                        onDelete(selectedJob.id);
                        setSelectedJob(null);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {canModerate && selectedJob.status !== 'active' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedJob.id, 'active');
                      setSelectedJob(null);
                    }}
                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Approve Job
                  </button>
                )}
                {canModerate && selectedJob.status === 'active' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedJob.id, 'closed');
                      setSelectedJob(null);
                    }}
                    style={{ background: '#f59e0b', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Close Job
                  </button>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
