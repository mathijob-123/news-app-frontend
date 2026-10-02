import React, { useState, useEffect } from 'react';
import {
  Tag,
  Briefcase,
  Home,
  Users,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import type { AdminRoleType } from '../../../types';
import {
  marketplaceAdminService,
  AdminProduct,
  AdminJob,
  AdminProperty,
  AdminMarketplaceUser,
  AdminMarketplaceReport,
  MarketplaceStats
} from '../../../services/marketplaceAdminService';
import { OlxAdminManager } from './OlxAdminManager';
import { JobsAdminManager } from './JobsAdminManager';
import { RealEstateAdminManager } from './RealEstateAdminManager';
import { UserSellerAdminManager } from './UserSellerAdminManager';
import { ReportsComplaintsManager } from './ReportsComplaintsManager';
import { MarketplaceAnalyticsView } from './MarketplaceAnalyticsView';

interface LocalPlusMarketplaceManagerProps {
  currentSimulatedRole: AdminRoleType;
  onRefreshParentData?: () => void;
}

type MarketplaceSubTab = 'olx' | 'jobs' | 'real_estate' | 'users' | 'reports' | 'analytics';

export const LocalPlusMarketplaceManager: React.FC<LocalPlusMarketplaceManagerProps> = ({
  currentSimulatedRole,
  onRefreshParentData
}) => {
  // Determine default subtab based on role
  const [activeSubTab, setActiveSubTab] = useState<MarketplaceSubTab>(() => {
    if (currentSimulatedRole === 'moderator') return 'reports';
    return 'olx';
  });

  // State data
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [users, setUsers] = useState<AdminMarketplaceUser[]>([]);
  const [reports, setReports] = useState<AdminMarketplaceReport[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all marketplace data from server
  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      const [prods, jbs, props, usrs, reps, stts] = await Promise.all([
        marketplaceAdminService.getProducts().catch(() => []),
        marketplaceAdminService.getJobs().catch(() => []),
        marketplaceAdminService.getProperties().catch(() => []),
        marketplaceAdminService.getUsers().catch(() => []),
        marketplaceAdminService.getReports().catch(() => []),
        marketplaceAdminService.getStats().catch(() => null)
      ]);

      setProducts(prods);
      setJobs(jbs);
      setProperties(props);
      setUsers(usrs);
      setReports(reps);
      setStats(stts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Role Permissions
  // Super Admin: full access to all tabs & deletion
  // Editor: access to OLX, Jobs, Real Estate, Analytics
  // Moderator: access to Reports & Complaints, review & moderation actions
  const isSubTabAllowed = (tab: MarketplaceSubTab): boolean => {
    if (currentSimulatedRole === 'super_admin') return true;
    if (currentSimulatedRole === 'editor') {
      return tab === 'olx' || tab === 'jobs' || tab === 'real_estate' || tab === 'analytics';
    }
    if (currentSimulatedRole === 'moderator') {
      return tab === 'reports' || tab === 'olx' || tab === 'jobs' || tab === 'real_estate' || tab === 'users';
    }
    return false;
  };

  const canModerate = currentSimulatedRole === 'super_admin' || currentSimulatedRole === 'moderator' || currentSimulatedRole === 'editor';
  const canDelete = currentSimulatedRole === 'super_admin';

  // Subtab switch guard
  useEffect(() => {
    if (!isSubTabAllowed(activeSubTab)) {
      if (currentSimulatedRole === 'moderator') setActiveSubTab('reports');
      else setActiveSubTab('olx');
    }
  }, [currentSimulatedRole]);

  // Product Actions
  const handleUpdateProductStatus = async (id: string, status: AdminProduct['status'], notes?: string, reason?: string) => {
    const updated = await marketplaceAdminService.updateProduct(id, { status, adminNotes: notes, rejectionReason: reason });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    loadMarketplaceData();
  };

  const handleToggleProductVerify = async (id: string, current: boolean) => {
    const updated = await marketplaceAdminService.updateProduct(id, { isVerified: !current });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isVerified: !current } : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await marketplaceAdminService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    loadMarketplaceData();
  };

  // Job Actions
  const handleUpdateJobStatus = async (id: string, status: AdminJob['status'], notes?: string, reason?: string) => {
    const updated = await marketplaceAdminService.updateJob(id, { status, adminNotes: notes, rejectionReason: reason });
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updated } : j)));
    loadMarketplaceData();
  };

  const handleToggleJobVerify = async (id: string, current: boolean) => {
    await marketplaceAdminService.updateJob(id, { isVerified: !current });
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isVerified: !current } : j)));
  };

  const handleDeleteJob = async (id: string) => {
    await marketplaceAdminService.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    loadMarketplaceData();
  };

  // Property Actions
  const handleUpdatePropertyStatus = async (id: string, status: AdminProperty['status'], notes?: string, reason?: string) => {
    const updated = await marketplaceAdminService.updateProperty(id, { status, adminNotes: notes, rejectionReason: reason });
    setProperties((prev) => prev.map((pr) => (pr.id === id ? { ...pr, ...updated } : pr)));
    loadMarketplaceData();
  };

  const handleTogglePropertyVerify = async (id: string, current: boolean) => {
    await marketplaceAdminService.updateProperty(id, { isVerified: !current });
    setProperties((prev) => prev.map((pr) => (pr.id === id ? { ...pr, isVerified: !current } : pr)));
  };

  const handleDeleteProperty = async (id: string) => {
    await marketplaceAdminService.deleteProperty(id);
    setProperties((prev) => prev.filter((pr) => pr.id !== id));
    loadMarketplaceData();
  };

  // User Actions
  const handleUpdateUserStatus = async (id: string, updates: { verified?: boolean; trustScore?: number; accountStatus?: string; reason?: string }) => {
    await marketplaceAdminService.updateUserStatus(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } as any : u)));
    loadMarketplaceData();
  };

  // Report Actions
  const handleUpdateReport = async (id: string, updates: Partial<AdminMarketplaceReport>) => {
    const updated = await marketplaceAdminService.updateReport(id, updates);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    loadMarketplaceData();
  };

  const handleDeleteReport = async (id: string) => {
    await marketplaceAdminService.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    loadMarketplaceData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* LocalPlus Marketplace Top Sub-Header & Sub-Navigation */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.15), rgba(234, 88, 12, 0.25))',
                color: '#ff4500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                LocalPlus Marketplace Management
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Verified Hyperlocal Buy & Sell • Jobs • Real Estate • Moderation Queue
              </div>
            </div>
          </div>

          <button
            onClick={() => loadMarketplaceData()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            <span>Sync Telemetry</span>
          </button>
        </div>

        {/* Sub-tabs bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '0 16px',
            overflowX: 'auto'
          }}
        >
          {isSubTabAllowed('olx') && (
            <button
              onClick={() => setActiveSubTab('olx')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'olx' ? 800 : 600,
                color: activeSubTab === 'olx' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'olx' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Tag size={16} />
              <span>OLX / Buy & Sell</span>
              {products.length > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                  {products.length}
                </span>
              )}
            </button>
          )}

          {isSubTabAllowed('jobs') && (
            <button
              onClick={() => setActiveSubTab('jobs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'jobs' ? 800 : 600,
                color: activeSubTab === 'jobs' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'jobs' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Briefcase size={16} />
              <span>Jobs</span>
              {jobs.length > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                  {jobs.length}
                </span>
              )}
            </button>
          )}

          {isSubTabAllowed('real_estate') && (
            <button
              onClick={() => setActiveSubTab('real_estate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'real_estate' ? 800 : 600,
                color: activeSubTab === 'real_estate' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'real_estate' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Home size={16} />
              <span>Real Estate</span>
              {properties.length > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                  {properties.length}
                </span>
              )}
            </button>
          )}

          {isSubTabAllowed('users') && (
            <button
              onClick={() => setActiveSubTab('users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'users' ? 800 : 600,
                color: activeSubTab === 'users' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'users' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Users size={16} />
              <span>Users / Sellers</span>
              {users.length > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                  {users.length}
                </span>
              )}
            </button>
          )}

          {isSubTabAllowed('reports') && (
            <button
              onClick={() => setActiveSubTab('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'reports' ? 800 : 600,
                color: activeSubTab === 'reports' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'reports' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldAlert size={16} />
              <span>Reports & Complaints</span>
              {reports.filter((r) => r.status === 'new').length > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#ef4444', color: '#ffffff', padding: '1px 6px', borderRadius: '10px' }}>
                  {reports.filter((r) => r.status === 'new').length}
                </span>
              )}
            </button>
          )}

          {isSubTabAllowed('analytics') && (
            <button
              onClick={() => setActiveSubTab('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeSubTab === 'analytics' ? 800 : 600,
                color: activeSubTab === 'analytics' ? '#ff4500' : '#475569',
                borderBottom: activeSubTab === 'analytics' ? '2.5px solid #ff4500' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Active Views */}
      {activeSubTab === 'olx' && (
        <OlxAdminManager
          products={products}
          onRefresh={loadMarketplaceData}
          onUpdateStatus={handleUpdateProductStatus}
          onToggleVerify={handleToggleProductVerify}
          onDelete={handleDeleteProduct}
          canModerate={canModerate}
          canDelete={canDelete}
        />
      )}

      {activeSubTab === 'jobs' && (
        <JobsAdminManager
          jobs={jobs}
          onRefresh={loadMarketplaceData}
          onUpdateStatus={handleUpdateJobStatus}
          onToggleVerify={handleToggleJobVerify}
          onDelete={handleDeleteJob}
          canModerate={canModerate}
          canDelete={canDelete}
        />
      )}

      {activeSubTab === 'real_estate' && (
        <RealEstateAdminManager
          properties={properties}
          onRefresh={loadMarketplaceData}
          onUpdateStatus={handleUpdatePropertyStatus}
          onToggleVerify={handleTogglePropertyVerify}
          onDelete={handleDeleteProperty}
          canModerate={canModerate}
          canDelete={canDelete}
        />
      )}

      {activeSubTab === 'users' && (
        <UserSellerAdminManager
          users={users}
          onRefresh={loadMarketplaceData}
          onUpdateStatus={handleUpdateUserStatus}
          canModerate={canModerate}
        />
      )}

      {activeSubTab === 'reports' && (
        <ReportsComplaintsManager
          reports={reports}
          onRefresh={loadMarketplaceData}
          onUpdateReport={handleUpdateReport}
          onDeleteReport={handleDeleteReport}
          canModerate={canModerate}
        />
      )}

      {activeSubTab === 'analytics' && (
        <MarketplaceAnalyticsView stats={stats} />
      )}
    </div>
  );
};
