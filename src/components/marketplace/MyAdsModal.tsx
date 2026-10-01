import React, { useState } from 'react';
import {
  X,
  MoreVertical,
  CheckCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Edit,
  Tag,
  Clock
} from 'lucide-react';
import type { MarketplaceProduct } from '../../types/marketplace';
import {
  deleteStoredProduct,
  markStoredProductSold,
  renewStoredProduct
} from '../../services/marketplaceService';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MarketplaceProduct[];
  onRefreshProducts: () => void;
  onViewProduct: (product: MarketplaceProduct) => void;
}

export const MyAdsModal: React.FC<MyAdsModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
  onViewProduct
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'expired'>('active');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter listings by status or isMine
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'sold') return p.status === 'sold';
    if (activeTab === 'expired') return p.status === 'expired';
    return true;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteStoredProduct(id);
      onRefreshProducts();
      setOpenDropdownId(null);
    }
  };

  const handleMarkAsSold = (id: string) => {
    markStoredProductSold(id);
    onRefreshProducts();
    setOpenDropdownId(null);
  };

  const handleRenew = (id: string) => {
    renewStoredProduct(id);
    onRefreshProducts();
    setOpenDropdownId(null);
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="m-modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
              My Ads & Listings
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--lp-slate-light)' }}>
              Manage, edit, or renew your posted advertisements
            </span>
          </div>
          <button
            onClick={onClose}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', borderBottom: '1px solid var(--lp-border)', background: '#f8fafc' }}>
          {(['active', 'sold', 'expired'] as const).map((tab) => {
            const count = products.filter((p) => p.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setOpenDropdownId(null);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--lp-orange)' : '1px solid var(--lp-border)',
                  background: isActive ? 'var(--lp-orange)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--lp-slate-body)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{tab}</span> ({count})
              </button>
            );
          })}
        </div>

        {/* Listings List */}
        <div className="m-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--lp-slate-light)' }}>
              <Tag size={36} color="var(--lp-slate-light)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--lp-slate-dark)' }}>
                No {activeTab} ads found
              </p>
              <p style={{ fontSize: '12px' }}>
                {activeTab === 'active'
                  ? 'You have not posted any active listings yet.'
                  : `There are no listings marked as ${activeTab}.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--lp-border)',
                    background: '#ffffff',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={
                        prod.images[0] ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={prod.title}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                        {prod.title}
                      </h4>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--lp-orange)', marginTop: '2px' }}>
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ textTransform: 'uppercase', fontWeight: 700, color: prod.status === 'active' ? '#10b981' : '#64748b' }}>
                          ● {prod.status}
                        </span>
                        <span>• Posted {prod.postedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() =>
                        setOpenDropdownId(openDropdownId === prod.id ? null : prod.id)
                      }
                      className="m-action-circle-btn"
                      style={{ width: '34px', height: '34px' }}
                      title="Manage options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openDropdownId === prod.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '40px',
                          background: '#ffffff',
                          border: '1px solid var(--lp-border)',
                          borderRadius: '10px',
                          boxShadow: 'var(--lp-shadow-lg)',
                          width: '160px',
                          zIndex: 20,
                          padding: '4px 0',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={() => {
                            onViewProduct(prod);
                            onClose();
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 14px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>View Listing</span>
                        </button>

                        {prod.status === 'active' && (
                          <button
                            onClick={() => handleMarkAsSold(prod.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 14px',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: 'none',
                              background: 'none',
                              color: '#059669',
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle size={14} />
                            <span>Mark as Sold</span>
                          </button>
                        )}

                        {prod.status !== 'active' && (
                          <button
                            onClick={() => handleRenew(prod.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 14px',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: 'none',
                              background: 'none',
                              color: '#2563eb',
                              cursor: 'pointer'
                            }}
                          >
                            <RefreshCw size={14} />
                            <span>Renew Listing</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(prod.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 14px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            background: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            borderTop: '1px solid #f1f5f9'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
