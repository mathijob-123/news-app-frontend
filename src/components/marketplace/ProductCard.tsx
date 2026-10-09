import React from 'react';
import { Heart, MapPin, Clock } from 'lucide-react';
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
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div
      className={`olx-product-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(product)}
    >
      {/* Media with Favorite button */}
      <div className="olx-card-media-wrapper">
        <img
          src={product.images && product.images.length > 0 && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          className="olx-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Favorite Heart Button */}
        <button
          className={`olx-card-fav-btn ${product.isFavorite ? 'active' : ''}`}
          onClick={(e) => onToggleFavorite(product.id, e)}
          title={product.isFavorite ? 'Remove from Saved' : 'Save Item'}
        >
          <Heart
            size={16}
            fill={product.isFavorite ? '#ef4444' : 'none'}
            color={product.isFavorite ? '#ef4444' : 'currentColor'}
          />
        </button>

        {/* Status Badge if not active */}
        {product.status !== 'active' && (
          <span className="olx-card-badge-status">
            {product.status}
          </span>
        )}
      </div>

      {/* Details Content */}
      <div className="olx-card-content">
        <h4 className="olx-card-title" title={product.title}>
          {product.title}
        </h4>

        <div className="olx-card-price-row">
          <span className="olx-card-price">{formattedPrice}</span>
          {product.priceNegotiable && (
            <span className="olx-card-negotiable">Negotiable</span>
          )}
        </div>

        <div className="olx-card-footer">
          <div className="olx-card-location">
            <MapPin size={11} color="var(--lp-orange)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.location}
            </span>
          </div>

          <div className="olx-card-time">
            <Clock size={11} color="var(--lp-slate-light)" style={{ flexShrink: 0 }} />
            <span>{product.postedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
