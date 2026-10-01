import React, { useState } from 'react';
import {
  Bookmark,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Trash2,
  ArrowLeft,
  Phone,
  MessageCircle,
  Home
} from 'lucide-react';
import type { MarketplaceProperty } from '../../types/marketplace';
import { getStoredProperties, toggleStoredPropertySaved } from '../../services/marketplaceService';

interface RealEstateSavedScreenProps {
  onBackToMain?: () => void;
  onSelectProperty?: (prop: MarketplaceProperty) => void;
}

export const RealEstateSavedScreen: React.FC<RealEstateSavedScreenProps> = ({
  onBackToMain,
  onSelectProperty
}) => {
  const [properties, setProperties] = useState<MarketplaceProperty[]>(getStoredProperties());

  const savedProperties = properties.filter((p) => p.isSaved);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStoredPropertySaved(id);
    setProperties(getStoredProperties());
  };

  return (
    <div className="realestate-saved-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
            <Bookmark size={20} color="#ea580c" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Saved Properties
            </h2>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          {savedProperties.length} bookmarked
        </span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {savedProperties.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Bookmark size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No saved properties yet
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Tap the bookmark icon on any apartment, villa, or plot to save it here for quick access.
            </p>
          </div>
        ) : (
          savedProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty?.(prop)}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer'
              }}
            >
              <img
                src={prop.images[0]}
                alt={prop.title}
                style={{ width: '88px', height: '88px', borderRadius: '10px', objectFit: 'cover' }}
              />

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>
                      {prop.price}
                    </div>
                    <button
                      onClick={(e) => handleRemove(prop.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prop.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {prop.bedrooms} BHK • {prop.location}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <a
                    href={`https://wa.me/${prop.owner.whatsapp || '919840123456'}?text=${encodeURIComponent(`Hi, I am interested in your property "${prop.title}" on LocalPlus.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '5px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${prop.owner.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '5px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      color: '#334155',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Phone size={12} />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
