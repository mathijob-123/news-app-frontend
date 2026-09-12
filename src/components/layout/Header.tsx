import React, { useState } from 'react';
import { MapPin, Bell, Search, ChevronDown, Check, Compass, Radio, ShieldCheck } from 'lucide-react';
import type { LocationCoordinates } from '../../types';
import { PRESET_LOCATIONS } from '../../services/geoService';

interface HeaderProps {
  activeLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
  onOpenSearch: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  onSelectLocation,
  onOpenSearch,
  unreadAlertCount = 2
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <>
      <header className="app-header">
        {/* Brand Logo with Live Pulse */}
        <div className="app-logo">
          <div className="pulse-beacon" title="Live Hyperlocal Radar Active" />
          <span style={{ letterSpacing: '-0.03em' }}>LocalPulse</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '800',
              background: '#fff1f2',
              color: '#ef4444',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #fecdd3',
              marginLeft: '2px',
              textTransform: 'uppercase'
            }}
          >
            Live
          </span>
        </div>

        {/* Dynamic Location Switcher */}
        <button
          className="location-pill-btn"
          onClick={() => setShowLocationModal(true)}
          title="Change your active viewing location"
        >
          <MapPin size={13} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
          <span>{activeLocation.neighborhood || activeLocation.placeName}</span>
          <ChevronDown size={12} style={{ flexShrink: 0 }} />
        </button>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenSearch}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Search local news and places"
          >
            <Search size={17} />
          </button>

          <button
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: 'var(--text-secondary)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => alert('Local alerts: 1 active flash weather alert within 3km of you.')}
            title="Breaking notifications"
          >
            <Bell size={17} />
            {unreadAlertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--brand-alert)',
                  borderRadius: '50%',
                  border: '1.5px solid #ffffff'
                }}
              />
            )}
          </button>
        </div>
      </header>

      {/* Location Picker Sheet */}
      {showLocationModal && (
        <div
          className="bottom-sheet-backdrop"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: '20px' }}
          >
            <div className="sheet-handle-bar" />
            <div className="bottom-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Set Your Local Hub</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Done
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Content feeds, distance decay tags, and Spots reels dynamically rank based on your proximity to news events.
              </p>

              {PRESET_LOCATIONS.map((loc) => {
                const isSelected = loc.lat === activeLocation.lat && loc.lng === activeLocation.lng;
                return (
                  <button
                    key={loc.placeName}
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowLocationModal(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isSelected ? '#fff7ed' : '#ffffff',
                      border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
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
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
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
                          radiusMeters: 3000
                        };
                        onSelectLocation(userGps);
                        setShowLocationModal(false);
                      },
                      () => alert('Could not get GPS. Using Downtown Metro default.')
                    );
                  }
                }}
                className="btn-secondary"
                style={{ marginTop: '8px', width: '100%', fontSize: '12px' }}
              >
                <MapPin size={14} color="var(--brand-primary)" />
                Use Device GPS Live Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
