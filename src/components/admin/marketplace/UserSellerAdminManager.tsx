import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Tag,
  Briefcase,
  Home,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  X,
  RefreshCw,
  Ban,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import type { AdminMarketplaceUser } from '../../../services/marketplaceAdminService';
import { marketplaceAdminService } from '../../../services/marketplaceAdminService';

interface UserSellerAdminManagerProps {
  users: AdminMarketplaceUser[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, updates: { verified?: boolean; trustScore?: number; accountStatus?: string; reason?: string }) => Promise<void>;
  canModerate: boolean;
}

export const UserSellerAdminManager: React.FC<UserSellerAdminManagerProps> = ({
  users,
  onRefresh,
  onUpdateStatus,
  canModerate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminMarketplaceUser | null>(null);
  const [userActivity, setUserActivity] = useState<any | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<'olx' | 'properties' | 'jobs' | 'reports'>('olx');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.accountStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const handleOpenUser = async (u: AdminMarketplaceUser) => {
    setSelectedUser(u);
    setLoadingActivity(true);
    try {
      const act = await marketplaceAdminService.getUserActivity(u.id);
      setUserActivity(act);
    } catch {
      setUserActivity({ userId: u.id, products: [], properties: [], jobs: [], reports: [] });
    } finally {
      setLoadingActivity(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Search & Filter */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search by seller name, email, phone, user ID..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
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
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
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
                <th style={{ padding: '12px 16px' }}>User / Seller Profile</th>
                <th style={{ padding: '12px 16px' }}>Contact & Location</th>
                <th style={{ padding: '12px 16px' }}>Trust & Verification</th>
                <th style={{ padding: '12px 16px' }}>Listings (OLX / Jobs / RE)</th>
                <th style={{ padding: '12px 16px' }}>Engagement</th>
                <th style={{ padding: '12px 16px' }}>Reports</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569' }}>No users or sellers found</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* User profile */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{u.email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{u.phone} • {u.location}</div>
                    </td>

                    {/* Trust & Verification */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: u.trustScore >= 90 ? '#15803d' : '#b45309' }}>
                          {u.trustScore}% Score
                        </span>
                        {u.verified && (
                          <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 700 }}>
                            <ShieldCheck size={13} /> Verified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Listings Counts */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ff4500', fontWeight: 700 }}>
                          <Tag size={12} /> {u.olxListingsCount}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#2563eb', fontWeight: 700 }}>
                          <Briefcase size={12} /> {u.jobPostsCount}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#059669', fontWeight: 700 }}>
                          <Home size={12} /> {u.propertyPostsCount}
                        </span>
                      </div>
                    </td>

                    {/* Total Views & Enquiries */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: '#334155' }}><strong>{u.totalViews}</strong> views</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{u.totalEnquiries} enquiries</div>
                    </td>

                    {/* Reports Received */}
                    <td style={{ padding: '12px 16px' }}>
                      {u.reportsReceived > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={13} /> {u.reportsReceived} flag(s)
                        </span>
                      ) : (
                        <span style={{ color: '#15803d', fontSize: '12px' }}>Clean</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: u.accountStatus === 'active' ? '#dcfce7' : '#fee2e2',
                          color: u.accountStatus === 'active' ? '#15803d' : '#b91c1c',
                          textTransform: 'uppercase'
                        }}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenUser(u)}
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
                          <span>Dossier</span>
                        </button>

                        {canModerate && (
                          <button
                            onClick={() => {
                              const newStatus = u.accountStatus === 'active' ? 'suspended' : 'active';
                              onUpdateStatus(u.id, { accountStatus: newStatus });
                            }}
                            style={{
                              background: u.accountStatus === 'active' ? 'rgba(239, 68, 68, 0.1)' : '#16a34a',
                              border: u.accountStatus === 'active' ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
                              color: u.accountStatus === 'active' ? '#ef4444' : '#ffffff',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                            title={u.accountStatus === 'active' ? 'Suspend User' : 'Unsuspend User'}
                          >
                            {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
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

      {/* User Complete Activity Dossier Modal */}
      {selectedUser && (
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
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={selectedUser.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    {selectedUser.name} • Activity Dossier
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    ID: {selectedUser.id} • {selectedUser.email} • {selectedUser.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 16px' }}>
              {[
                { id: 'olx', label: `OLX Products (${userActivity?.products?.length || 0})` },
                { id: 'properties', label: `Real Estate (${userActivity?.properties?.length || 0})` },
                { id: 'jobs', label: `Job Posts (${userActivity?.jobs?.length || 0})` },
                { id: 'reports', label: `Reports (${userActivity?.reports?.length || 0})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDossierTab(tab.id as any)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    fontSize: '13px',
                    fontWeight: activeDossierTab === tab.id ? 700 : 500,
                    color: activeDossierTab === tab.id ? '#ff4500' : '#64748b',
                    borderBottom: activeDossierTab === tab.id ? '2px solid #ff4500' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dossier Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {loadingActivity ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Loading user activity history from database...
                </div>
              ) : (
                <>
                  {activeDossierTab === 'olx' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(!userActivity?.products || userActivity.products.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No OLX listings posted by this user.</div>
                      ) : (
                        userActivity.products.map((p: any) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>₹{p.price} • {p.category} • {p.location}</div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d' }}>
                              {p.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeDossierTab === 'properties' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(!userActivity?.properties || userActivity.properties.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No properties listed by this user.</div>
                      ) : (
                        userActivity.properties.map((pr: any) => (
                          <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{pr.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{pr.price} • {pr.property_type} • {pr.location}</div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d' }}>
                              {pr.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeDossierTab === 'jobs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(!userActivity?.jobs || userActivity.jobs.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No job posts by this user.</div>
                      ) : (
                        userActivity.jobs.map((j: any) => (
                          <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{j.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{j.company} • {j.salary} • {j.location}</div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#dcfce7', color: '#15803d' }}>
                              {j.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeDossierTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(!userActivity?.reports || userActivity.reports.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#15803d', fontWeight: 600 }}>No reports recorded for this user.</div>
                      ) : (
                        userActivity.reports.map((rep: any) => (
                          <div key={rep.id} style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '12px' }}>Reason: {rep.reason}</span>
                              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', background: '#fee2e2', color: '#b91c1c' }}>
                                {rep.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569' }}>{rep.description || 'No description provided.'}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  onUpdateStatus(selectedUser.id, { verified: !selectedUser.verified });
                  setSelectedUser({ ...selectedUser, verified: !selectedUser.verified });
                }}
                style={{
                  background: selectedUser.verified ? '#f1f5f9' : '#0284c7',
                  color: selectedUser.verified ? '#475569' : '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {selectedUser.verified ? 'Revoke Verification' : 'Grant Verified Seller Badge'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
