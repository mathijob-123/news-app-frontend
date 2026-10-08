import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Home,
  Building,
  Key,
  Layers,
  Calendar,
  Phone,
  Bookmark,
  X,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Bed,
  Bath,
  Maximize2,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import type {
  MarketplaceProperty,
  PropertyListingType,
  PropertyType
} from '../../types/marketplace';
import {
  getStoredProperties,
  toggleStoredPropertySaved
} from '../../services/marketplaceService';

interface RealEstateMarketplaceProps {
  currentLocationName?: string;
  onSelectProperty?: (prop: MarketplaceProperty) => void;
  onToggleSave?: (id: string) => void;
}

export const RealEstateMarketplace: React.FC<RealEstateMarketplaceProps> = ({
  currentLocationName = 'Chennai',
  onSelectProperty,
  onToggleSave
}) => {
  const [properties, setProperties] = useState<MarketplaceProperty[]>(getStoredProperties());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListingType, setSelectedListingType] = useState<string>('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [selectedBhk, setSelectedBhk] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<MarketplaceProperty | null>(null);

  // Gallery state for modal
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Schedule visit state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00 AM');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitSuccess, setVisitSuccess] = useState(false);

  const listingTypes = [
    'All',
    'Buy',
    'Rent',
    'Commercial',
    'Land / Plot',
    'New Projects'
  ];

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Listing Type
      if (selectedListingType !== 'All') {
        if (selectedListingType === 'Buy' && prop.listingType !== 'Buy' && prop.listingType !== 'Sell') {
          return false;
        } else if (selectedListingType === 'Rent' && prop.listingType !== 'Rent' && prop.listingType !== 'Lease') {
          return false;
        } else if (selectedListingType === 'Commercial' && prop.propertyCategory !== 'Commercial' && prop.listingType !== 'Commercial' && !prop.propertyType.toLowerCase().includes('commercial') && !prop.propertyType.toLowerCase().includes('office')) {
          return false;
        } else if (selectedListingType === 'Land / Plot' && prop.propertyCategory !== 'Land / Plot' && prop.propertyType !== 'Plot' && !prop.propertyType.toLowerCase().includes('plot') && !prop.propertyType.toLowerCase().includes('land')) {
          return false;
        } else if (selectedListingType === 'New Projects' && prop.propertyCategory !== 'New Project' && prop.listingType !== 'New Projects') {
          return false;
        }
      }

      // 2. Property Type
      if (selectedPropertyType !== 'All' && prop.propertyType !== selectedPropertyType) {
        return false;
      }

      // 3. BHK
      if (selectedBhk !== 'All') {
        if (selectedBhk === '4+' && prop.bedrooms < 4) return false;
        if (selectedBhk !== '4+' && String(prop.bedrooms) !== selectedBhk) return false;
      }

      // 4. Area
      if (selectedArea !== 'All') {
        const area = prop.areaSqFt || prop.area || 0;
        if (selectedArea === '< 800 sq.ft' && area >= 800) return false;
        if (selectedArea === '800 - 1500 sq.ft' && (area < 800 || area > 1500)) return false;
        if (selectedArea === '> 1500 sq.ft' && area <= 1500) return false;
      }

      // 5. Furnishing
      if (selectedFurnishing !== 'All') {
        const furn = prop.furnishing || prop.specifications?.furnishing || '';
        if (!furn.toLowerCase().includes(selectedFurnishing.toLowerCase())) return false;
      }

      // 6. Owner / Agent / Builder
      if (selectedRole !== 'All') {
        const role = prop.sellerType || prop.owner?.role || '';
        if (role.toLowerCase() !== selectedRole.toLowerCase()) return false;
      }

      // 7. Verified
      if (onlyVerified) {
        const isVer = prop.isVerified || prop.owner?.verified;
        if (!isVer) return false;
      }

      // 8. Price Range
      if (selectedPriceRange !== 'All') {
        const numPrice = prop.numericPrice || parseInt(prop.price.replace(/\D/g, '') || '0', 10);
        if (selectedPriceRange === 'Under ₹30 Lakhs' && numPrice > 3000000) return false;
        if (selectedPriceRange === '₹30L - ₹60L' && (numPrice < 3000000 || numPrice > 6000000)) return false;
        if (selectedPriceRange === '₹60L - ₹1 Crore' && (numPrice < 6000000 || numPrice > 10000000)) return false;
        if (selectedPriceRange === 'Above ₹1 Crore' && numPrice < 10000000) return false;
      }

      // 9. Search query
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
  }, [
    properties,
    selectedListingType,
    selectedPropertyType,
    selectedPriceRange,
    selectedBhk,
    selectedArea,
    selectedFurnishing,
    selectedRole,
    onlyVerified,
    searchQuery
  ]);

  const handleToggleSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStoredPropertySaved(id);
    setProperties(getStoredProperties());
    onToggleSave?.(id);
  };

  const handleOpenProperty = (prop: MarketplaceProperty) => {
    if (onSelectProperty) {
      onSelectProperty(prop);
    } else {
      setSelectedProperty(prop);
      setActiveImageIndex(0);
    }
  };

  const handleWhatsApp = (prop: MarketplaceProperty) => {
    const rawPhone = prop.owner.whatsapp || '919840588990';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${prop.owner.name}, I am interested in your property "${prop.title}" (${prop.price}) in ${prop.location} listed on LocalPlus.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleScheduleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone || !visitDate) return;

    setVisitSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setVisitSuccess(false);
      alert(`Property site visit scheduled for ${visitDate} at ${visitTime}! The property owner/agent will call ${visitorPhone} to coordinate.`);
    }, 1200);
  };

  return (
    <div className="real-estate-container">
      {/* Hero Header & Filters */}
      <div className="re-hero-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--lp-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Building size={18} />
              </div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '22px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                Real Estate Marketplace
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--lp-slate-body)', marginTop: '4px' }}>
              Buy, rent, and invest in verified apartments, independent villas, commercial spaces & plots in {currentLocationName}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#ffffff', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '20px', color: '#15803d' }}>
              {filteredProperties.length} Properties Listed
            </span>
          </div>
        </div>

        {/* Search Bar & Property Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="olx-search-input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="olx-search-icon" />
            <input
              type="text"
              placeholder="Search location, area or property"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className="m-location-pill"
            style={{ background: '#ffffff', height: '40px' }}
          >
            <MapPin size={14} color="var(--lp-orange)" />
            <span>{currentLocationName}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            style={{
              height: '40px',
              padding: '0 14px',
              borderRadius: '9999px',
              border: showFiltersPanel ? '1.5px solid var(--lp-orange)' : '1px solid var(--lp-border)',
              background: showFiltersPanel ? '#fff7ed' : '#ffffff',
              color: showFiltersPanel ? 'var(--lp-orange)' : 'var(--lp-navy)',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Secondary Filters Panel: Buy/Rent, Property Type, Price, BHK, Area, Furnishing, Owner/Agent/Builder, Verified */}
        {showFiltersPanel && (
          <div
            style={{
              marginTop: '10px',
              padding: '14px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--lp-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px'
            }}
          >
            {/* Property Type */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                Property Type
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="Flat">Flat</option>
                <option value="PG">PG</option>
                <option value="Commercial Office">Commercial Office</option>
                <option value="Shop">Shop</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                Price Range
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                <option value="All">All Prices</option>
                <option value="Under ₹30 Lakhs">Under ₹30L</option>
                <option value="₹30L - ₹60L">₹30L - ₹60L</option>
                <option value="₹60L - ₹1 Crore">₹60L - ₹1Cr</option>
                <option value="Above ₹1 Crore">Above ₹1Cr</option>
              </select>
            </div>

            {/* BHK Filter */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                BHK
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedBhk}
                onChange={(e) => setSelectedBhk(e.target.value)}
              >
                <option value="All">All BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4+">4+ BHK</option>
              </select>
            </div>

            {/* Area Filter */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                Area (Sq.Ft)
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="All">All Sizes</option>
                <option value="< 800 sq.ft">&lt; 800 sq.ft</option>
                <option value="800 - 1500 sq.ft">800 - 1500 sq.ft</option>
                <option value="> 1500 sq.ft">&gt; 1500 sq.ft</option>
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                Furnishing
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedFurnishing}
                onChange={(e) => setSelectedFurnishing(e.target.value)}
              >
                <option value="All">All Furnishings</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Posted By (Owner / Agent / Builder) */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>
                Listed By
              </label>
              <select
                className="form-select-field"
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Owner">Owner</option>
                <option value="Agent">Agent</option>
                <option value="Builder">Builder</option>
              </select>
            </div>

            {/* Verified Only Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  style={{ accentColor: '#ea580c' }}
                />
                <span>✓ Verified Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Listing Type Strip: Buy, Rent, Commercial, Land / Plot, New Projects */}
        <div className="re-types-strip">
          {listingTypes.map((type) => (
            <button
              key={type}
              className={`re-type-btn ${selectedListingType === type ? 'active' : ''}`}
              onClick={() => setSelectedListingType(type)}
            >
              {type === 'Buy' && '🏠 '}
              {type === 'Rent' && '🔑 '}
              {type === 'Commercial' && '🏢 '}
              {type === 'Land / Plot' && '🌱 '}
              {type === 'New Projects' && '✨ '}
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="re-grid">
        {filteredProperties.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '48px 20px',
              textAlign: 'center',
              border: '1px solid var(--lp-border)'
            }}
          >
            <Building size={36} color="var(--lp-slate-light)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)' }}>
              No properties match your filters
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--lp-slate-body)', marginTop: '4px' }}>
              Try broadening your search or resetting property type filters.
            </p>
          </div>
        ) : (
          filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="re-card"
              onClick={() => handleOpenProperty(prop)}
            >
              <div className="re-card-img-wrap">
                <img
                  src={prop.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'}
                  alt={prop.title}
                  loading="lazy"
                />

                {/* Badges: For Rent / For Sale and Verified */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: prop.listingType === 'Rent' || prop.listingType === 'Lease' ? '#0284c7' : '#ea580c',
                      color: '#ffffff'
                    }}
                  >
                    For {prop.listingType}
                  </span>

                  {(prop.isVerified || prop.owner?.verified) && (
                    <span
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: '#10b981',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  )}
                </div>

                {/* Primary Cover Tag */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  COVER
                </span>

                <button
                  className="olx-card-fav-btn"
                  onClick={(e) => handleToggleSaved(prop.id, e)}
                  title={prop.isSaved ? 'Saved' : 'Save Property'}
                >
                  <Bookmark
                    size={16}
                    fill={prop.isSaved ? 'var(--lp-orange)' : 'none'}
                    color={prop.isSaved ? 'var(--lp-orange)' : 'currentColor'}
                  />
                </button>
              </div>

              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  {prop.price}
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--lp-navy)', marginTop: '4px', lineHeight: 1.3 }}>
                  {prop.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--lp-slate-light)', marginTop: '4px' }}>
                  <MapPin size={12} color="var(--lp-orange)" />
                  <span>{prop.location}</span>
                </div>

                {/* Specs */}
                <div className="re-specs-strip">
                  {prop.bedrooms > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Bed size={13} /> {prop.bedrooms} Beds
                    </span>
                  )}
                  {prop.bathrooms > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Bath size={13} /> {prop.bathrooms} Baths
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Maximize2 size={13} /> {prop.areaSqFt} sq.ft
                  </span>
                </div>

                {/* Actions Footer */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)' }}>
                    {prop.postedAt}
                  </span>

                  <button
                    className="btn-primary"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: 'var(--lp-slate-dark)',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProperty(prop);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PROPERTY DETAILS MODAL */}
      {selectedProperty && !showScheduleModal && (
        <div className="modal-overlay-backdrop" onClick={() => setSelectedProperty(null)}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="m-modal-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--lp-orange)', textTransform: 'uppercase' }}>
                  For {selectedProperty.listingType} • {selectedProperty.propertyType}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  {selectedProperty.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--lp-slate-body)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={12} color="var(--lp-orange)" />
                  {selectedProperty.location}
                </span>
              </div>

              <button
                onClick={() => setSelectedProperty(null)}
                className="m-action-circle-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="m-modal-body">
              {/* Image Gallery */}
              <div className="p-image-carousel" style={{ aspectRatio: '16 / 9' }}>
                <img
                  src={selectedProperty.images[activeImageIndex] || selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="p-carousel-main-img"
                />
                <span className="p-carousel-badge">
                  {activeImageIndex + 1}/{selectedProperty.images.length}
                </span>

                {selectedProperty.images.length > 1 && (
                  <>
                    <button
                      className="p-carousel-nav-btn left"
                      onClick={() =>
                        setActiveImageIndex(
                          (prev) =>
                            (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length
                        )
                      }
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="p-carousel-nav-btn right"
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev + 1) % selectedProperty.images.length)
                      }
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {selectedProperty.images.length > 1 && (
                <div className="p-thumbnails-strip" style={{ marginTop: '8px' }}>
                  {selectedProperty.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`p-thumb-item ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`thumb-${idx}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Price Banner */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--lp-orange)', fontFamily: 'Plus Jakarta Sans' }}>
                  {selectedProperty.price}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lp-slate-body)' }}>
                  Posted {selectedProperty.postedAt}
                </div>
              </div>

              {/* Specifications Table */}
              <div style={{ marginTop: '14px' }}>
                <span className="p-specs-heading" style={{ display: 'block', marginBottom: '8px' }}>
                  Property Specifications
                </span>
                <div className="p-specs-table">
                  <div className="p-specs-row">
                    <span className="p-specs-key">Bedrooms:</span>
                    <span className="p-specs-val">{selectedProperty.bedrooms || 'Studio / N/A'}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Bathrooms:</span>
                    <span className="p-specs-val">{selectedProperty.bathrooms}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Super Built-up Area:</span>
                    <span className="p-specs-val">{selectedProperty.specifications?.superArea || `${selectedProperty.areaSqFt} Sq.Ft`}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Furnishing:</span>
                    <span className="p-specs-val">{selectedProperty.furnishing || selectedProperty.specifications?.furnishing || 'Semi-Furnished'}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Facing:</span>
                    <span className="p-specs-val">{selectedProperty.specifications?.facing || 'East Facing'}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Floor:</span>
                    <span className="p-specs-val">{selectedProperty.floor || selectedProperty.specifications?.floor || '3rd Floor'}</span>
                  </div>
                  <div className="p-specs-row">
                    <span className="p-specs-key">Parking:</span>
                    <span className="p-specs-val">{selectedProperty.parking || selectedProperty.specifications?.parking || 'Available'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginTop: '14px' }}>
                <span className="p-specs-heading" style={{ display: 'block', marginBottom: '6px' }}>
                  Description
                </span>
                <p style={{ fontSize: '12.5px', color: 'var(--lp-slate-body)', lineHeight: 1.6, background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                  {selectedProperty.description}
                </p>
              </div>

              {/* Owner / Agent Profile */}
              <div className="p-seller-card" style={{ marginTop: '14px' }}>
                <div className="p-seller-info">
                  <img
                    src={selectedProperty.owner.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'}
                    alt={selectedProperty.owner.name}
                    className="p-seller-avatar"
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="p-seller-name">{selectedProperty.owner.name}</span>
                      {selectedProperty.owner.verified && (
                        <CheckCircle2 size={13} color="#10b981" />
                      )}
                    </div>
                    <span className="p-seller-meta">
                      {selectedProperty.owner.role} {selectedProperty.owner.agencyName ? `• ${selectedProperty.owner.agencyName}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--lp-orange)' }}>
                  {selectedProperty.owner.phone}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="m-modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                className={`p-btn-save ${selectedProperty.isSaved ? 'saved' : ''}`}
                onClick={(e) => handleToggleSaved(selectedProperty.id, e)}
              >
                <Bookmark
                  size={16}
                  fill={selectedProperty.isSaved ? 'var(--lp-orange)' : 'none'}
                  color={selectedProperty.isSaved ? 'var(--lp-orange)' : 'currentColor'}
                />
                <span>{selectedProperty.isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="p-btn-whatsapp"
                  onClick={() => handleWhatsApp(selectedProperty)}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </button>

                <button
                  style={{
                    background: 'var(--lp-orange)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                  }}
                  onClick={() => setShowScheduleModal(true)}
                >
                  <Calendar size={15} />
                  <span>Schedule Visit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE VISIT MODAL */}
      {showScheduleModal && selectedProperty && (
        <div className="modal-overlay-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="m-modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  Schedule a Site Visit
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--lp-slate-light)' }}>
                  for {selectedProperty.title}
                </span>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="m-action-circle-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleVisitSubmit}>
              <div className="m-modal-body">
                <div className="form-group-block">
                  <label>Preferred Visit Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input-field"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>

                <div className="form-group-block">
                  <label>Preferred Time Slot *</label>
                  <select
                    className="form-select-field"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                  >
                    <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                  </select>
                </div>

                <div className="form-group-block">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input-field"
                    placeholder="Your Name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                  />
                </div>

                <div className="form-group-block">
                  <label>Mobile Number (For Visit Confirmation) *</label>
                  <input
                    type="tel"
                    required
                    className="form-input-field"
                    placeholder="+91 98400 12345"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="m-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--lp-border)',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={visitSuccess}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '20px',
                    border: 'none',
                    background: visitSuccess ? '#10b981' : 'var(--lp-orange)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  {visitSuccess ? 'Confirmed!' : 'Confirm Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
