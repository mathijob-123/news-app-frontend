import React from 'react';
import { Heart } from 'lucide-react';
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
  const isSold = product.status === 'sold';
  const formattedPrice = `₹ ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(product.price)}`;

  const mainImage =
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      className={`olx-product-card ${isSelected ? 'selected' : ''} ${isSold ? 'is-sold-card' : ''}`}
      onClick={() => {
        if (isSold) {
          // Sold products cannot be clicked/opened
          return;
        }
        onSelect(product);
      }}
      style={{
        cursor: isSold ? 'not-allowed' : 'pointer',
        opacity: isSold ? 0.75 : 1,
        position: 'relative'
      }}
      title={isSold ? 'This product is Sold and cannot be viewed' : product.title}
    >
      {/* Photo with 16:10 OLX aspect ratio */}
      <div className="olx-card-media-wrapper">
        <img
          src={mainImage}
          alt={product.title}
          className="olx-card-img"
          loading="lazy"
          style={isSold ? { filter: 'grayscale(0.4)' } : undefined}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Favorite Heart Button */}
        {!isSold && (
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
        )}

        {/* Status Badge if not active */}
        {product.status !== 'active' && (
          <span
            className="olx-card-badge-status"
            style={
              isSold
                ? {
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 800,
                    letterSpacing: '0.6px',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.45)'
                  }
                : undefined
            }
          >
            {isSold ? 'SOLD' : product.status}
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
          <span className="olx-card-location-text" title={product.location}>
            {product.location}
          </span>

          <span className="olx-card-date-text">
            {product.postedAt}
          </span>
        </div>
      </div>
    </div>
  );
};
