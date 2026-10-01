import React, { useState } from 'react';
import {
  X,
  Bookmark,
  ShoppingBag,
  Briefcase,
  Building,
  Heart,
  ExternalLink,
  Trash2
} from 'lucide-react';
import type {
  MarketplaceProduct,
  MarketplaceJob,
  MarketplaceProperty
} from '../../types/marketplace';

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: MarketplaceProduct[];
  savedJobs: MarketplaceJob[];
  savedProperties: MarketplaceProperty[];
  onSelectProduct: (product: MarketplaceProduct) => void;
  onSelectProperty?: (property: MarketplaceProperty) => void;
  onRemoveSavedProduct: (id: string) => void;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  isOpen,
  onClose,
  savedProducts,
  savedJobs,
  savedProperties,
  onSelectProduct,
  onSelectProperty,
  onRemoveSavedProduct
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'jobs' | 'properties'>('products');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="m-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--lp-orange)'
              }}
            >
              <Bookmark size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                Saved Items
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--lp-slate-light)' }}>
                Your bookmarked listings, job openings & properties
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', borderBottom: '1px solid var(--lp-border)', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'products' ? '1px solid var(--lp-orange)' : '1px solid var(--lp-border)',
              background: activeTab === 'products' ? 'var(--lp-orange)' : '#ffffff',
              color: activeTab === 'products' ? '#ffffff' : 'var(--lp-slate-body)'
            }}
          >
            Products ({savedProducts.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'jobs' ? '1px solid var(--lp-orange)' : '1px solid var(--lp-border)',
              background: activeTab === 'jobs' ? 'var(--lp-orange)' : '#ffffff',
              color: activeTab === 'jobs' ? '#ffffff' : 'var(--lp-slate-body)'
            }}
          >
            Jobs ({savedJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'properties' ? '1px solid var(--lp-orange)' : '1px solid var(--lp-border)',
              background: activeTab === 'properties' ? 'var(--lp-orange)' : '#ffffff',
              color: activeTab === 'properties' ? '#ffffff' : 'var(--lp-slate-body)'
            }}
          >
            Properties ({savedProperties.length})
          </button>
        </div>

        {/* Content list */}
        <div className="m-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'products' && (
            <div>
              {savedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--lp-slate-light)', fontSize: '13px' }}>
                  <Heart size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  You haven't saved any marketplace products yet. Click the heart icon on any card to save it!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedProducts.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid var(--lp-border)',
                        background: '#ffffff'
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--lp-navy)' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-orange)' }}>
                            ₹{p.price.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--lp-slate-light)' }}>
                            {p.location}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveSavedProduct(p.id)}
                        className="m-action-circle-btn"
                        style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        title="Remove from Saved"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {savedJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--lp-slate-light)', fontSize: '13px' }}>
                  <Briefcase size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  No saved jobs yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedJobs.map((j) => (
                    <div
                      key={j.id}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid var(--lp-border)',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                        {j.title}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--lp-slate-dark)', marginTop: '2px' }}>
                        {j.company} • {j.location}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
                        {j.salary} ({j.jobType})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              {savedProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--lp-slate-light)', fontSize: '13px' }}>
                  <Building size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  No saved properties yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        onSelectProperty?.(prop);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid var(--lp-border)',
                        background: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                          {prop.title}
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--lp-orange)' }}>
                          {prop.price}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--lp-slate-light)' }}>
                          {prop.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
