import React, { useState, useEffect } from 'react';
import { Compass, Radio, Check, MapPin, Search, X } from 'lucide-react';
import type { LocationCoordinates } from '../../types';
import { PRESET_LOCATIONS } from '../../services/geoService';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  activeLocation,
  onSelectLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredLocations = trimmedQuery
    ? PRESET_LOCATIONS.filter((loc) =>
        `${loc.neighborhood || ''} ${loc.placeName || ''} ${loc.district || ''} ${loc.taluk || ''} ${loc.area || ''}`
          .toLowerCase()
          .includes(trimmedQuery)
      )
    : PRESET_LOCATIONS;

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 0, maxHeight: '88dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div className="sheet-handle-bar" style={{ flexShrink: 0 }} />
        <div className="bottom-sheet-header" style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Set Your Local Hub</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            padding: '16px',
            paddingBottom: 'max(28px, calc(16px + env(safe-area-inset-bottom, 0px)))',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.4 }}>
            News feed, photos, and video reels are strictly filtered by your selected hub. For example, reports posted in <strong>Ponneri</strong> will only appear when Ponneri is active, and reports in <strong>Tiruvallur</strong> will only appear in Tiruvallur.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              marginBottom: '4px',
              flexShrink: 0
            }}
          >
            <Search size={15} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local hub (e.g. Ponneri, Avadi, Anna Nagar)..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {filteredLocations.length === 0 ? (
            <div
              style={{
                padding: '18px 12px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed var(--border-subtle)'
              }}
            >
              No matching preset hub found for &ldquo;{searchQuery}&rdquo;. Try another name or use GPS below.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected =
                (loc.locationId && activeLocation.locationId === loc.locationId) ||
                (loc.neighborhood && activeLocation.neighborhood === loc.neighborhood) ||
                (loc.lat === activeLocation.lat && loc.lng === activeLocation.lng) ||
                loc.placeName === activeLocation.placeName;
              return (
                <button
                  key={loc.placeName}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isSelected ? '#fff7ed' : '#ffffff',
                    border: isSelected
                      ? '1.5px solid var(--brand-primary)'
                      : '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--brand-gradient)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                      }}
                    >
                      <Radio size={16} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {loc.neighborhood}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {loc.placeName} • Radius {loc.radiusMeters ? loc.radiusMeters / 1000 : 3}km
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={18} color="var(--brand-primary)" />}
                </button>
              );
            })
          )}

          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const userGps: LocationCoordinates = {
                      placeName: 'My Live GPS Location',
                      neighborhood: 'Live Coordinates',
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      radiusMeters: 5000
                    };
                    onSelectLocation(userGps);
                    onClose();
                  },
                  () => alert('Could not get GPS. Using Downtown Metro default.')
                );
              }
            }}
            className="btn-secondary"
            style={{
              marginTop: '8px',
              width: '100%',
              flexShrink: 0,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <MapPin size={14} color="var(--brand-primary)" />
            <span>Use Device GPS Live Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
