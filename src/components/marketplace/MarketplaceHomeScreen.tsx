import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Smartphone,
  Laptop,
  Car,
  Armchair,
  Shirt,
  Home,
  Building,
  Wrench,
  ChevronRight,
  Plus,
  Flame,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCw
} from 'lucide-react';
import type {
  MarketplaceProduct,
  MarketplaceCategory
} from '../../types/marketplace';
import { ProductCard } from './ProductCard';

interface MarketplaceHomeScreenProps {
  products: MarketplaceProduct[];
  selectedProduct: MarketplaceProduct | null;
  onSelectProduct: (product: MarketplaceProduct) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenPostAd: () => void;
  onCategoryFilterChange?: (cat: MarketplaceCategory | 'all') => void;
  onNavigateHome?: () => void;
  onOpenNotifications?: () => void;
  onNavigateProfile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const MarketplaceHomeScreen: React.FC<MarketplaceHomeScreenProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onToggleFavorite,
  onOpenPostAd,
  onCategoryFilterChange,
  onNavigateHome,
  onOpenNotifications,
  onNavigateProfile,
  onRefresh,
  isRefreshing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [activeBannerDot, setActiveBannerDot] = useState(0);

  const categories: Array<{
    id: MarketplaceCategory;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
  }> = [
    { id: 'mobiles', label: 'Mobiles', icon: <Smartphone size={24} />, colorClass: 'cat-mobiles' },
    { id: 'electronics', label: 'Electronics', icon: <Laptop size={24} />, colorClass: 'cat-electronics' },
    { id: 'vehicles', label: 'Vehicles', icon: <Car size={24} />, colorClass: 'cat-vehicles' },
    { id: 'furniture', label: 'Furniture', icon: <Armchair size={24} />, colorClass: 'cat-furniture' },
    { id: 'fashion', label: 'Fashion', icon: <Shirt size={24} />, colorClass: 'cat-fashion' },
    { id: 'home_kitchen', label: 'Home & Kitchen', icon: <Home size={24} />, colorClass: 'cat-home_kitchen' },
    { id: 'property', label: 'Property', icon: <Building size={24} />, colorClass: 'cat-property' },
    { id: 'services', label: 'Services', icon: <Wrench size={24} />, colorClass: 'cat-services' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesLoc = p.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleSelectCategory = (catId: MarketplaceCategory | 'all') => {
    const next = selectedCategory === catId ? 'all' : catId;
    setSelectedCategory(next);
    onCategoryFilterChange?.(next);
  };

  return (
    <div className="marketplace-center-content">
      {/* 1. Header Section: ROW 1 (Back + Title) & ROW 2 (Search Bar + Filter) */}
      <div className="olx-header-section">
        {/* ROW 1: Back Button & OLX / Buy & Sell Heading */}
        <div className="olx-header-row-1">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="olx-back-btn"
              title="Back to LocalPlus"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="olx-title-block">
            <div className="olx-icon-box">
              <ShoppingBag size={22} />
            </div>
            <div className="olx-title-text">
              <h2>OLX / Buy & Sell</h2>
              <p>Buy • Sell • Swap</p>
            </div>
          </div>
        </div>

        {/* ROW 2: Wide Search Bar + Filter Button (Completely below heading) */}
        <div className="olx-search-filter-row">
          <div className="olx-search-input-wrapper">
            <Search size={18} className="olx-search-icon" />
            <input
              type="text"
              placeholder="Search for product, brand, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="olx-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="olx-filter-btn"
            onClick={() => handleSelectCategory('all')}
            title="Reset Filters"
          >
            <SlidersHorizontal size={18} />
          </button>

          {onRefresh && (
            <button
              className="olx-filter-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Products"
              style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer' }}
            >
              <RotateCw size={17} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categories Horizontal Strip */}
      <div className="olx-categories-strip">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`olx-cat-item ${isSelected ? 'active' : ''}`}
              onClick={() => handleSelectCategory(cat.id)}
            >
              <div className={`olx-cat-icon-container ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <span className="olx-cat-label">{cat.label}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Promotional Banner (Matching Image 2 Model) */}
      <div className="olx-promo-banner">
        <div className="olx-promo-text">
          <span className="olx-promo-badge">Save 25% Today!</span>
          <h3>
            Exclusive discounts<br />on home service
          </h3>
          <button
            type="button"
            className="olx-promo-book-btn"
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--lp-orange)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)'
            }}
          >
            Book Now
          </button>
        </div>

        {/* Banner Decorative Cluster / Graphic */}
        <div
          className="olx-promo-bg-decor"
          style={{
            backgroundImage: 'url(/images/marketplace_banner.jpg)'
          }}
        />

        {/* Carousel indicator dots */}
        <div className="olx-banner-dots">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`olx-banner-dot ${activeBannerDot === dot ? 'active' : ''}`}
              onClick={() => setActiveBannerDot(dot)}
            />
          ))}
        </div>
      </div>

      {/* 4. "Popular Near You" Section */}
      <div className="olx-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="var(--lp-orange)" />
          <h3>Popular Near You</h3>
        </div>

        <span
          className="olx-see-all-link"
          onClick={() => setSelectedCategory('all')}
        >
          <span>See All</span>
          <ArrowRight size={14} />
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="olx-products-grid">
        {filteredProducts.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px solid var(--lp-border)'
            }}
          >
            <ShoppingBag size={40} color="var(--lp-slate-light)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)' }}>
              No products found
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--lp-slate-body)', marginTop: '4px' }}>
              {selectedCategory !== 'all'
                ? `No items found in "${selectedCategory}".`
                : 'No items match your search.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'var(--lp-orange)',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onSelect={onSelectProduct}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>

    </div>
  );
};
