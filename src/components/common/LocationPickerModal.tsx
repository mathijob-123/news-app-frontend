import React from 'react';
import { Compass, Radio, Check, MapPin, X } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: '24px' }}
      >
        <div className="sheet-handle-bar" />
        <div className="bottom-sheet-header">
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

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Spotlight reels are strictly filtered by your active location. Switch hubs below to view reels published in other local areas.
          </p>

          {PRESET_LOCATIONS.map((loc) => {
            const isSelected =
              loc.lat === activeLocation.lat && loc.lng === activeLocation.lng;
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
          })}

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
