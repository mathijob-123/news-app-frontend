import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  SlidersHorizontal,
  Home,
  Building,
  Key,
  Layers,
  MapPin,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  X,
  Bed,
  Bath,
  Maximize2
} from 'lucide-react';
import type { MarketplaceProperty, PropertyListingType } from '../../types/marketplace';
import { getStoredProperties, toggleStoredPropertySaved } from '../../services/marketplaceService';

interface RealEstateExploreScreenProps {
  onBackToMain?: () => void;
  onSelectProperty?: (prop: MarketplaceProperty) => void;
}

export const RealEstateExploreScreen: React.FC<RealEstateExploreScreenProps> = ({
  onBackToMain,
  onSelectProperty
}) => {
  const [properties, setProperties] = useState<MarketplaceProperty[]>(getStoredProperties());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListingType, setSelectedListingType] = useState<PropertyListingType | 'All'>('All');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('All');

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (selectedListingType !== 'All' && prop.listingType !== selectedListingType) {
        return false;
      }
      if (selectedBhk !== 'All' && String(prop.bedrooms) !== selectedBhk) {
        return false;
      }
      if (onlyVerified && !prop.owner.verified) {
        return false;
      }
      if (selectedFurnishing !== 'All' && (prop.furnishing || prop.specifications?.furnishing) !== selectedFurnishing) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(q);
        const matchesLocation = prop.location.toLowerCase().includes(q);
        const matchesType = prop.propertyType.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [properties, selectedListingType, selectedBhk, onlyVerified, selectedFurnishing, searchQuery]);

  const handleToggleSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStoredPropertySaved(id);
    setProperties(getStoredProperties());
  };

  return (
    <div className="realestate-explore-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
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
              Explore Properties
            </h2>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {filteredProperties.length} found
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
          marginBottom: '10px'
        }}
      >
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search by neighborhood, project, builder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#0f172a' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* Category Pills: All | Buy | Rent | Commercial | PG | Land */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px', scrollbarWidth: 'none' }}>
        {(['All', 'Buy', 'Rent', 'Commercial', 'PG', 'Land'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedListingType(t as any)}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: selectedListingType === t ? '1px solid #ea580c' : '1px solid #e2e8f0',
              background: selectedListingType === t ? '#fff7ed' : '#ffffff',
              color: selectedListingType === t ? '#ea580c' : '#475569',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filter strip: BHK, Verified */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px', fontSize: '11.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>BHK:</span>
          <select
            value={selectedBhk}
            onChange={(e) => setSelectedBhk(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11.5px', cursor: 'pointer' }}
          >
            <option value="All">All BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <button
          onClick={() => setOnlyVerified(!onlyVerified)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: onlyVerified ? '1px solid #10b981' : '1px solid #cbd5e1',
            background: onlyVerified ? '#ecfdf5' : '#ffffff',
            color: onlyVerified ? '#059669' : '#475569',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={12} />
          <span>Verified Only</span>
        </button>
      </div>

      {/* Property Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredProperties.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '36px 16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Home size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No properties found
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty?.(prop)}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer'
              }}
            >
              {/* Image banner */}
              <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  <span
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    {prop.listingType}
                  </span>
                  {prop.owner.verified && (
                    <span
                      style={{
                        background: '#10b981',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => handleToggleSaved(prop.id, e)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  <Bookmark
                    size={16}
                    color={prop.isSaved ? '#ea580c' : '#64748b'}
                    fill={prop.isSaved ? '#ea580c' : 'none'}
                  />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
                  {prop.price}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px', lineHeight: '1.3' }}>
                  {prop.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                  <MapPin size={12} color="#ea580c" />
                  <span>{prop.location}</span>
                </div>

                {/* Specs row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bed size={13} color="#94a3b8" />
                    <span>{prop.bedrooms} BHK</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bath size={13} color="#94a3b8" />
                    <span>{prop.bathrooms} Baths</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Maximize2 size={13} color="#94a3b8" />
                    <span>{prop.areaSqFt} Sq.Ft</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
