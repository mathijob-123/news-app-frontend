import React from 'react';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
  Mail,
  Package
} from 'lucide-react';
import type { ProductSeller, MarketplaceProduct } from '../../types/marketplace';

interface SellerProfileModalProps {
  seller: ProductSeller | null;
  onClose: () => void;
  sellerProducts?: MarketplaceProduct[];
  onSelectProduct?: (product: MarketplaceProduct) => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  seller,
  onClose,
  sellerProducts = [],
  onSelectProduct
}) => {
  if (!seller) return null;

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="m-modal-header">
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--lp-navy)' }}>
            Verified Seller Profile
          </h3>
          <button
            onClick={onClose}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="m-modal-body">
          {/* Header Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              borderRadius: '14px',
              background: '#f8fafc',
              border: '1px solid var(--lp-border)',
              marginBottom: '18px'
            }}
          >
            <img
              src={seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={seller.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #ffffff',
                boxShadow: 'var(--lp-shadow-sm)'
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  {seller.name}
                </h4>
                {seller.verified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#059669',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    <ShieldCheck size={13} /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--lp-slate-body)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={13} color="var(--lp-slate-light)" /> Joined {seller.joinedDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                  <Star size={13} fill="#f59e0b" /> {seller.rating || 4.9} (54 reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Contact Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <a
              href={`tel:${seller.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--lp-border)',
                background: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--lp-slate-dark)',
                textDecoration: 'none'
              }}
            >
              <Phone size={14} color="var(--lp-orange)" />
              <span>Call Seller</span>
            </a>

            <a
              href={`https://wa.me/${(seller.whatsapp || '919820154321').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: '#25d366',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Seller Listings */}
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '10px' }}>
              Other Listings by {seller.name}
            </span>

            {sellerProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '10px', color: 'var(--lp-slate-light)', fontSize: '12px' }}>
                <Package size={24} style={{ margin: '0 auto 6px' }} />
                No other listings currently active.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sellerProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct?.(p);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--lp-border)',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-navy)' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--lp-slate-light)' }}>
                          {p.location}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-orange)' }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
