import React, { useState, useMemo } from 'react';
import {
  Compass,
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
  ArrowLeft,
  X,
  Tag,
  RotateCw
} from 'lucide-react';
import type { MarketplaceProduct, MarketplaceCategory } from '../../types/marketplace';
import { ProductCard } from './ProductCard';

interface OlxExploreScreenProps {
  products: MarketplaceProduct[];
  selectedProduct: MarketplaceProduct | null;
  onSelectProduct: (product: MarketplaceProduct) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onBackToMain?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OlxExploreScreen: React.FC<OlxExploreScreenProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onToggleFavorite,
  onBackToMain,
  onRefresh,
  isRefreshing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'price_low' | 'price_high'>('latest');

  const categories: Array<{
    id: MarketplaceCategory;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'mobiles', label: 'Mobiles', icon: <Smartphone size={16} /> },
    { id: 'electronics', label: 'Electronics', icon: <Laptop size={16} /> },
    { id: 'vehicles', label: 'Vehicles', icon: <Car size={16} /> },
    { id: 'furniture', label: 'Furniture', icon: <Armchair size={16} /> },
    { id: 'fashion', label: 'Fashion', icon: <Shirt size={16} /> },
    { id: 'home_kitchen', label: 'Home & Kitchen', icon: <Home size={16} /> },
    { id: 'property', label: 'Property', icon: <Building size={16} /> },
    { id: 'services', label: 'Services', icon: <Wrench size={16} /> }
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
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

    if (sortBy === 'price_low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, conditionFilter, searchQuery, sortBy]);

  return (
    <div className="olx-explore-page" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Back"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={20} color="#ea580c" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Explore Marketplace
            </h2>
          </div>
        </div>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {filteredProducts.length} items
        </span>
      </div>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '12px'
        }}
      >
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by product, brand, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#0f172a',
            background: 'transparent'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} color="#94a3b8" />
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              color: '#ea580c'
            }}
            title="Refresh Products"
          >
            <RotateCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        )}
      </div>

      {/* Horizontal Category Scroll */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          marginBottom: '10px'
        }}
      >
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: selectedCategory === 'all' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: selectedCategory === 'all' ? '#fff7ed' : '#ffffff',
            color: selectedCategory === 'all' ? '#ea580c' : '#475569',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          }}
        >
          <Tag size={13} />
          <span>All Items</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '9999px',
                border: isSelected ? '1px solid #ea580c' : '1px solid #e2e8f0',
                background: isSelected ? '#fff7ed' : '#ffffff',
                color: isSelected ? '#ea580c' : '#475569',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Sort & Filter strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '11.5px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={13} color="#64748b" />
          <span style={{ color: '#64748b', fontWeight: 600 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="latest">Latest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Condition:</span>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11.5px',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="all">Any</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="olx-products-grid">
        {filteredProducts.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}
          >
            <Compass size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              No items matching filters
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Try clearing search terms or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setConditionFilter('all');
                setSortBy('latest');
              }}
              style={{
                marginTop: '14px',
                padding: '7px 16px',
                borderRadius: '8px',
                background: '#ea580c',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reset All Filters
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
