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
  Clock,
  AlertCircle
} from 'lucide-react';
import type { MarketplaceProduct } from '../../types/marketplace';
import {
  deleteStoredProduct,
  markStoredProductSold,
  markStoredProductActive,
  markStoredProductOutOfStock,
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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'out_of_stock' | 'sold'>('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter listings by status
  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'out_of_stock') return p.status === 'out_of_stock';
    if (activeTab === 'sold') return p.status === 'sold';
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

  const handleMarkAsOutOfStock = (id: string) => {
    markStoredProductOutOfStock(id);
    onRefreshProducts();
    setOpenDropdownId(null);
  };

  const handleMarkAsActive = (id: string) => {
    markStoredProductActive(id);
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
              Manage, edit, or toggle stock availability for your products
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
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', borderBottom: '1px solid var(--lp-border)', background: '#f8fafc', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Ads' },
            { id: 'active', label: 'In Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'sold', label: 'Sold' }
          ].map((tab) => {
            const count =
              tab.id === 'all'
                ? products.length
                : products.filter((p) => p.status === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
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
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span> ({count})
              </button>
            );
          })}
        </div>

        {/* Listings List */}
        <div className="m-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--lp-slate-light)' }}>
              <Tag size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lp-navy)' }}>
                No listings in this category
              </h4>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
                Post new items or change the active filter to view products.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.status === 'out_of_stock' || prod.status === 'sold';
                return (
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
                    <div
                      onClick={() => {
                        onViewProduct(prod);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                          src={
                            prod.images[0] ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={prod.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: isOutOfStock ? 'grayscale(0.35)' : 'none'
                          }}
                        />
                        {isOutOfStock && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '8px',
                              fontWeight: 800,
                              textAlign: 'center',
                              lineHeight: 1.1
                            }}
                          >
                            OUT OF STOCK
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                          {prod.title}
                        </h4>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--lp-orange)', marginTop: '2px' }}>
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--lp-slate-light)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span
                            style={{
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              color: prod.status === 'active' ? '#10b981' : '#dc2626'
                            }}
                          >
                            ● {prod.status === 'out_of_stock' ? 'Out of Stock' : prod.status}
                          </span>
                          <span>• Posted {prod.postedAt}</span>
                        </div>

                        {/* Quick Stock Toggle Buttons */}
                        <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                          {isOutOfStock ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsActive(prod.id);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle size={12} /> Mark In Stock
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsOutOfStock(prod.id);
                              }}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <AlertCircle size={12} /> Mark Out of Stock
                            </button>
                          )}
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
                            width: '170px',
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
                            <span>View Details</span>
                          </button>

                          {isOutOfStock ? (
                            <button
                              onClick={() => handleMarkAsActive(prod.id)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 14px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                background: '#ecfdf5',
                                color: '#059669',
                                cursor: 'pointer'
                              }}
                            >
                              <CheckCircle size={14} />
                              <span>Mark In Stock</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsOutOfStock(prod.id)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 14px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                background: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer'
                              }}
                            >
                              <AlertCircle size={14} />
                              <span>Mark Out of Stock</span>
                            </button>
                          )}

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
                                cursor: 'pointer'
                              }}
                            >
                              <Tag size={14} />
                              <span>Mark Sold</span>
                            </button>
                          )}

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
                              cursor: 'pointer'
                            }}
                          >
                            <RefreshCw size={14} />
                            <span>Renew Listing</span>
                          </button>

                          <div style={{ height: '1px', background: 'var(--lp-border)', margin: '4px 0' }} />

                          <button
                            onClick={() => handleDelete(prod.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 14px',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete Ad</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
