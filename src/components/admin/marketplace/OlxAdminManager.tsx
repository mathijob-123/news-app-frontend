import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Tag,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import type { AdminProduct } from '../../../services/marketplaceAdminService';
import { OlxProductDetailModal } from './OlxProductDetailModal';

interface OlxAdminManagerProps {
  products: AdminProduct[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: AdminProduct['status'], notes?: string, reason?: string) => Promise<void>;
  onToggleVerify: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canModerate: boolean;
  canDelete: boolean;
}

export const OlxAdminManager: React.FC<OlxAdminManagerProps> = ({
  products,
  onRefresh,
  onUpdateStatus,
  onToggleVerify,
  onDelete,
  canModerate,
  canDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'expired' | 'suspended' | 'reported'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'reported') {
          if ((p.reportsCount || 0) === 0) return false;
        } else if (p.status !== statusFilter) {
          return false;
        }
      }
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSeller = p.seller.name.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        return matchesTitle || matchesSeller || matchesId || matchesLocation || matchesCategory;
      }
      return true;
    });
  }, [products, statusFilter, categoryFilter, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Search, Category & Status Filter Bar */}
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
              placeholder="Search by product name, seller, listing ID, location, category..."
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

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Category:</span>
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
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>

            {/* Refresh Button */}
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
              title="Refresh Products"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: `All (${products.length})` },
            { id: 'active', label: `Active (${products.filter((p) => p.status === 'active').length})` },
            { id: 'pending', label: `Pending (${products.filter((p) => p.status === 'pending').length})` },
            { id: 'sold', label: `Sold (${products.filter((p) => p.status === 'sold').length})` },
            { id: 'expired', label: `Expired (${products.filter((p) => p.status === 'expired').length})` },
            { id: 'suspended', label: `Suspended (${products.filter((p) => p.status === 'suspended').length})` },
            { id: 'reported', label: `Reported (${products.filter((p) => (p.reportsCount || 0) > 0).length})` }
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

      {/* Listings Table / Mobile Cards */}
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
                <th style={{ padding: '12px 16px' }}>Listing / Item</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Seller</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Stats</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <Tag size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569' }}>No marketplace listings found</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your filters or search terms.</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const thumb = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Product Thumbnail & Title */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={thumb}
                            alt={p.title}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              background: '#e2e8f0',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>ID: {p.id}</span>
                              <span>•</span>
                              <span>{p.condition}</span>
                              {p.isVerified && (
                                <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                                  <ShieldCheck size={12} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          {p.category}
                        </span>
                        {p.subcategory && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>{p.subcategory}</div>
                        )}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{formatPrice(p.price)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.priceNegotiable ? 'Negotiable' : 'Fixed'}</div>
                      </td>

                      {/* Seller */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={p.seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={p.seller.name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.seller.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{p.seller.phone || 'Phone hidden'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#334155', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.location}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {p.district || 'Chennai'}
                        </div>
                      </td>

                      {/* Stats */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ color: '#475569' }}><strong>{p.viewsCount}</strong> views</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>{p.enquiriesCount} enquiries</span>
                          {p.reportsCount > 0 && (
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                              {p.reportsCount} report(s)
                            </span>
                          )}
                        </div>
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
                              p.status === 'active' ? '#dcfce7' :
                              p.status === 'pending' ? '#fef3c7' :
                              p.status === 'sold' ? '#e0f2fe' : '#fee2e2',
                            color:
                              p.status === 'active' ? '#15803d' :
                              p.status === 'pending' ? '#b45309' :
                              p.status === 'sold' ? '#0369a1' : '#b91c1c',
                            textTransform: 'uppercase'
                          }}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Inspect / View Modal */}
                          <button
                            onClick={() => setSelectedProduct(p)}
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
                            title="Inspect complete product details & seller"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {/* Quick Approve if pending */}
                          {canModerate && p.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStatus(p.id, 'active')}
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
                              title="Approve listing"
                            >
                              Approve
                            </button>
                          )}

                          {/* Quick Suspend if active and flagged */}
                          {canModerate && p.status === 'active' && (
                            <button
                              onClick={() => onUpdateStatus(p.id, 'suspended')}
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
                              title="Suspend listing"
                            >
                              Suspend
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently delete "${p.title}"?`)) {
                                  onDelete(p.id);
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
                              title="Delete Listing"
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

      {/* Detailed Inspection Modal */}
      {selectedProduct && (
        <OlxProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdateStatus={onUpdateStatus}
          onToggleVerify={onToggleVerify}
          onDelete={onDelete}
          canModerate={canModerate}
          canDelete={canDelete}
        />
      )}
    </div>
  );
};
