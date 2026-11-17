import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import type { MarketplaceProduct } from '../../types/marketplace';

interface ProductCardProps {
  product: MarketplaceProduct;
  isSelected?: boolean;
  onSelect: (product: MarketplaceProduct) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected = false,
  onSelect,
  onToggleFavorite
}) => {
  const isOutOfStock = product.status === 'out_of_stock' || product.status === 'sold';
  const formattedPrice = `₹ ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(product.price)}`;

  const mainImage =
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rawPhone = product.seller.whatsapp || product.seller.phone || '919840123456';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const text = encodeURIComponent(
      isOutOfStock
        ? `Hi ${product.seller.name}, I saw your product "${product.title}" on Spotlight360 (₹${product.price.toLocaleString('en-IN')}). It is currently Out of Stock. When will new stock be available?`
        : `Hi ${product.seller.name}, I want to buy your product "${product.title}" listed on Spotlight360 for ₹${product.price.toLocaleString('en-IN')}. Is it available?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div
      className={`olx-product-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'is-out-of-stock-card' : ''}`}
      onClick={() => onSelect(product)}
      style={{
        cursor: 'pointer',
        position: 'relative'
      }}
      title={isOutOfStock ? `${product.title} (Out of Stock - Tap to view details)` : product.title}
    >
      {/* Photo with 16:10 OLX aspect ratio */}
      <div className="olx-card-media-wrapper">
        <img
          src={mainImage}
          alt={product.title}
          className="olx-card-img"
          loading="lazy"
          style={isOutOfStock ? { filter: 'grayscale(0.35) brightness(0.85)' } : undefined}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Meesho-style Out of Stock overlay */}
        {isOutOfStock && (
          <div className="meesho-out-of-stock-overlay">
            <span className="meesho-out-of-stock-badge">
              {product.status === 'sold' ? 'SOLD OUT' : 'OUT OF STOCK'}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          className={`olx-card-fav-btn ${product.isFavorite ? 'active' : ''}`}
          onClick={(e) => onToggleFavorite(product.id, e)}
          title={product.isFavorite ? 'Remove from Saved' : 'Save Item'}
        >
          <Heart
            size={18}
            strokeWidth={1.8}
            fill={product.isFavorite ? '#ef4444' : 'none'}
            color={product.isFavorite ? '#ef4444' : '#002f34'}
          />
        </button>

        {/* Status Badge if active non-standard or pending */}
        {!isOutOfStock && product.status !== 'active' && (
          <span className="olx-card-badge-status">
            {product.status}
          </span>
        )}
      </div>

      {/* Details Content - OLX style with price first and yellow accent */}
      <div className="olx-card-content">
        <div className="olx-card-price-row">
          <span className="olx-card-price">{formattedPrice}</span>
          {product.priceNegotiable && (
            <span className="olx-card-negotiable">Negotiable</span>
          )}
        </div>

        <h4 className="olx-card-title" title={product.title}>
          {product.title}
        </h4>

        <div className="olx-card-footer">
          <div className="olx-card-footer-meta">
            <span className="olx-card-location-text" title={product.location}>
              {product.location}
            </span>
            <span className="olx-card-date-text">
              {product.postedAt}
            </span>
          </div>

          <button
            type="button"
            className="olx-card-whatsapp-btn"
            onClick={handleWhatsAppClick}
            title="Chat or buy on WhatsApp"
          >
            <MessageCircle size={13} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
