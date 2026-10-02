import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Eye,
  Bookmark,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
  Play
} from 'lucide-react';
import type { AdminProduct } from '../../../services/marketplaceAdminService';

interface OlxProductDetailModalProps {
  product: AdminProduct;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AdminProduct['status'], notes?: string, reason?: string) => Promise<void>;
  onToggleVerify: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canModerate: boolean;
  canDelete: boolean;
}

export const OlxProductDetailModal: React.FC<OlxProductDetailModalProps> = ({
  product,
  onClose,
  onUpdateStatus,
  onToggleVerify,
  onDelete,
  canModerate,
  canDelete
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'seller' | 'engagement' | 'moderation'>('info');
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [adminNotes, setAdminNotes] = useState(product.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState(product.rejectionReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
  };

  const handleAction = async (action: 'approve' | 'reject' | 'suspend' | 'sold') => {
    setIsSubmitting(true);
    try {
      const statusMap = {
        approve: 'active' as const,
        reject: 'rejected' as const,
        suspend: 'suspended' as const,
        sold: 'sold' as const
      };
      await onUpdateStatus(product.id, statusMap[action], adminNotes, action === 'reject' ? rejectionReason : undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        className="admin-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
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
              <Tag size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  {product.title}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background:
                      product.status === 'active' ? '#dcfce7' :
                      product.status === 'pending' ? '#fef3c7' :
                      product.status === 'sold' ? '#e0f2fe' : '#fee2e2',
                    color:
                      product.status === 'active' ? '#15803d' :
                      product.status === 'pending' ? '#b45309' :
                      product.status === 'sold' ? '#0369a1' : '#b91c1c',
                    textTransform: 'uppercase'
                  }}
                >
                  {product.status}
                </span>
                {product.isVerified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                    <ShieldCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                ID: {product.id} • Posted {product.postedAt}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '0 16px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'info', label: 'Product Information' },
            { id: 'media', label: `Media (${product.images.length}${product.videoUrl ? ' + 1 Vid' : ''})` },
            { id: 'seller', label: 'Seller Profile' },
            { id: 'engagement', label: 'Engagement & Stats' },
            { id: 'moderation', label: `Moderation (${product.reportsCount} Reports)` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#ff4500' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #ff4500' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'info' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>General Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Price:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{formatPrice(product.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Negotiable:</span>
                    <span style={{ fontWeight: 600 }}>{product.priceNegotiable ? 'Yes' : 'Fixed Price'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Category:</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Subcategory:</span>
                      <span style={{ fontWeight: 600 }}>{product.subcategory}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Condition:</span>
                    <span style={{ fontWeight: 600 }}>{product.condition}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Location:</span>
                    <span style={{ fontWeight: 600, textAlign: 'right' }}>{product.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>District / Taluk / Area:</span>
                    <span style={{ fontWeight: 600 }}>
                      {[product.district, product.taluk, product.area].filter(Boolean).join(' • ') || 'Chennai Metro'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>Description</h4>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#334155',
                    maxHeight: '180px',
                    overflowY: 'auto'
                  }}
                >
                  {product.description}
                </div>

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {Object.entries(product.specs).map(([k, v]) => (
                        <div key={k} style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px' }}>
                          <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k}: </span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                {/* Main Preview Box */}
                <div
                  style={{
                    width: '100%',
                    height: '320px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Product Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: '#94a3b8' }}>No image selected</span>
                  )}
                </div>

                {/* Thumbnails list */}
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: selectedImage === img ? '2px solid #ff4500' : '2px solid transparent',
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>

                {product.videoUrl && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={16} color="#ff4500" /> Attached Product Video
                    </h4>
                    <video
                      controls
                      src={product.videoUrl}
                      style={{ width: '100%', maxHeight: '300px', borderRadius: '10px', background: '#000' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'seller' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img
                  src={product.seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={product.seller.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
                />
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>{product.seller.name}</h4>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  Member ID: {product.seller.id}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                  <ShieldCheck size={14} /> Trust Score: {product.seller.trustScore || 98}%
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Phone size={16} color="#059669" />
                  <span style={{ color: '#64748b' }}>Phone:</span>
                  <a href={`tel:${product.seller.phone}`} style={{ fontWeight: 600, color: '#0f172a' }}>{product.seller.phone || 'N/A'}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <MessageCircle size={16} color="#25d366" />
                  <span style={{ color: '#64748b' }}>WhatsApp:</span>
                  <a href={`https://wa.me/${product.seller.whatsapp}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#0f172a' }}>
                    +{product.seller.whatsapp || 'N/A'}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Mail size={16} color="#2563eb" />
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <a href={`mailto:${product.seller.email}`} style={{ fontWeight: 600, color: '#0f172a' }}>{product.seller.email || 'N/A'}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Calendar size={16} color="#ea580c" />
                  <span style={{ color: '#64748b' }}>Joined:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{product.seller.joinedDate || 'Verified Member'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Eye size={20} color="#2563eb" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{product.viewsCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Views</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Bookmark size={20} color="#7c3aed" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{product.savesCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Saves</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <MessageCircle size={20} color="#059669" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{product.enquiriesCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Buyer Enquiries</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Phone size={20} color="#ea580c" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{product.contactClicks}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Phone Clicks</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Sparkles size={20} color="#25d366" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{product.whatsappClicks}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>WhatsApp Clicks</div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Admin Notes & Audit Log</label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Internal moderation only</span>
                </div>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add administrative notes regarding this listing's verification, authenticity check, or inspection..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
              </div>

              {product.status === 'rejected' || product.status === 'suspended' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: '6px' }}>
                    Rejection / Suspension Reason (Shared with Seller)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Inappropriate item, counterfeit goods, incorrect pricing..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #f87171',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              ) : null}

              {product.reportsCount > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <AlertTriangle size={20} color="#ef4444" />
                  <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600 }}>
                    This listing has received {product.reportsCount} citizen flag(s). Review reports tab to inspect specific claims.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            {canModerate && (
              <button
                onClick={() => onToggleVerify(product.id, product.isVerified)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: product.isVerified ? '#f1f5f9' : '#0284c7',
                  color: product.isVerified ? '#475569' : '#ffffff',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={14} />
                {product.isVerified ? 'Remove Verified Badge' : 'Mark as Verified'}
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to permanently delete this listing?')) {
                    onDelete(product.id);
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {canModerate && product.status !== 'active' && (
              <button
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={14} />
                Approve Listing
              </button>
            )}

            {canModerate && product.status === 'active' && (
              <button
                onClick={() => handleAction('suspend')}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <AlertTriangle size={14} />
                Suspend Listing
              </button>
            )}

            {canModerate && product.status !== 'rejected' && (
              <button
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <XCircle size={14} />
                Reject Listing
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
