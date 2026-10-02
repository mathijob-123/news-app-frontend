import React from 'react';
import {
  Tag,
  Briefcase,
  Home,
  Users,
  ShieldAlert,
  TrendingUp,
  Eye,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { MarketplaceStats } from '../../../services/marketplaceAdminService';

interface MarketplaceAnalyticsViewProps {
  stats: MarketplaceStats | null;
}

export const MarketplaceAnalyticsView: React.FC<MarketplaceAnalyticsViewProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Loading marketplace statistical telemetry...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. OLX / Buy & Sell Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Tag size={18} color="#ff4500" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            OLX / Buy & Sell Marketplace Telemetry
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Listings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{stats.olx.totalListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Active Listings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{stats.olx.activeListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Sold Listings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{stats.olx.soldListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Pending Review</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{stats.olx.pendingListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>Total Views</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>{stats.olx.totalViews}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Total Enquiries</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.olx.totalEnquiries}</div>
          </div>
        </div>
      </div>

      {/* 2. Jobs Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Briefcase size={18} color="#2563eb" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Local Jobs Telemetry
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Jobs Posted</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{stats.jobs.totalJobs}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Active Job Openings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{stats.jobs.activeJobs}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Total Applications</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.jobs.applications}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Expired / Closed</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>{stats.jobs.expiredJobs}</div>
          </div>
        </div>
      </div>

      {/* 3. Real Estate Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Home size={18} color="#059669" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Real Estate Properties Telemetry
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Properties</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{stats.realEstate.totalProperties}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Rent Listings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.realEstate.rentListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Buy Listings</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{stats.realEstate.buyListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Land / Plots</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{stats.realEstate.landListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>Commercial</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>{stats.realEstate.commercialListings}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Total Enquiries</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{stats.realEstate.totalEnquiries}</div>
          </div>
        </div>
      </div>

      {/* 4. Users & Reports Telemetry (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Marketplace Users */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={18} color="#7c3aed" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Marketplace Users & Sellers
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Marketplace Users</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{stats.users.totalUsers}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>New Users (7 Days)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>{stats.users.newUsers}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Verified Sellers</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{stats.users.verifiedUsers}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Reported / Blocked</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{stats.users.reportedUsers}</div>
            </div>
          </div>
        </div>

        {/* Moderation & Reports */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Complaints & Moderation Queue
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>Open Reports</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>{stats.reports.openReports}</div>
            </div>
            <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>Under Review</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>{stats.reports.pendingModeration}</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Resolved</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{stats.reports.resolvedReports}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
