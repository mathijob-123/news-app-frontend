import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Megaphone,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import type { Advertisement } from '../../types';
import { FeedAdCard } from '../feed/FeedAdCard';

interface AdPreviewModalProps {
  ad: Advertisement;
  onClose: () => void;
}

export const AdPreviewModal: React.FC<AdPreviewModalProps> = ({ ad, onClose }) => {
  const [previewMode, setPreviewMode] = useState<'feed' | 'spots'>('feed');
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          background: '#0f172a',
          border: '1px solid rgba(249, 115, 22, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 88, 12, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#ffffff'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(234, 88, 12, 0.2)',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Live Ad Preview • நேரடி முன்னோட்டம்
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                {ad.advertiserName} • {ad.adType.toUpperCase()} • Position: {ad.position}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Device Switcher Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPreviewMode('feed')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: previewMode === 'feed' ? '#ea580c' : 'rgba(255, 255, 255, 0.1)',
                background: previewMode === 'feed' ? 'rgba(234, 88, 12, 0.2)' : 'transparent',
                color: previewMode === 'feed' ? '#fb923c' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              📰 Feed Placement (செய்திப் பட்டியல்)
            </button>
            <button
              onClick={() => setPreviewMode('spots')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: previewMode === 'spots' ? '#ea580c' : 'rgba(255, 255, 255, 0.1)',
                background: previewMode === 'spots' ? 'rgba(234, 88, 12, 0.2)' : 'transparent',
                color: previewMode === 'spots' ? '#fb923c' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              🎬 Spots / Reels Full View
            </button>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: ad.status === 'active' ? '#4ade80' : '#f87171',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: ad.status === 'active' ? '#22c55e' : '#ef4444'
              }}
            />
            <span>{ad.status === 'active' ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {/* Preview Viewport Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            background: '#020617',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Simulated Mobile Shell */}
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '24px',
              border: '6px solid #334155',
              background: previewMode === 'feed' ? '#f8fafc' : '#000000',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.9)',
              position: 'relative'
            }}
          >
            {/* Mobile Status Bar */}
            <div
              style={{
                height: '24px',
                background: previewMode === 'feed' ? '#f1f5f9' : '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px',
                fontSize: '10px',
                fontWeight: 700,
                color: previewMode === 'feed' ? '#64748b' : '#94a3b8'
              }}
            >
              <span>9:41 AM</span>
              <span style={{ fontSize: '9px' }}>5G • 100%</span>
            </div>

            {previewMode === 'feed' ? (
              <div style={{ padding: '12px' }}>
                {/* Simulated Previous News Item */}
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '10px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>News Item #3:</span> Chennai ORR Metro Phase 2 DPR Approved
                </div>

                {/* The In-Feed Advertisement */}
                <FeedAdCard ad={ad} />

                {/* Simulated Next News Item */}
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    marginTop: '10px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>News Item #4:</span> Tiruvallur Agricultural Market Paddy Arrival Update
                </div>
              </div>
            ) : (
              /* Spots 9:16 Full Screen Preview */
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '9/16',
                  background: '#090d16',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}
              >
                {ad.adType === 'video' ? (
                  <video
                    src={ad.mediaUrl}
                    poster={ad.thumbnailUrl || undefined}
                    playsInline
                    loop
                    autoPlay
                    muted={isMuted}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <img
                    src={ad.mediaUrl}
                    alt={ad.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}

                {/* Dark Gradient Overlay for Readability */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)'
                  }}
                />

                {/* Top Badge in Reels */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(234, 88, 12, 0.9)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Megaphone size={11} />
                    <span>விளம்பரம் • SPONSORED</span>
                  </span>
                </div>

                {/* Right Floating Actions (Simulated Spots Controls) */}
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    bottom: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 10
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <Heart size={20} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#ffffff', marginTop: '2px' }}>{ad.clicks * 4 || 128}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <Share2 size={20} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#ffffff', marginTop: '2px' }}>Share</span>
                  </div>
                </div>

                {/* Spots Bottom Content & CTA */}
                <div style={{ position: 'relative', zIndex: 10, padding: '16px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#ea580c',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800
                      }}
                    >
                      {ad.advertiserName.charAt(0)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                      {ad.advertiserName}
                    </span>
                    <CheckCircle2 size={13} color="#ea580c" fill="#ffffff" />
                  </div>

                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: 1.4,
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
                    }}
                  >
                    {ad.title}
                  </p>

                  {/* High Visibility Floating CTA Bar in Spots */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(234, 88, 12, 0.6)'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>
                      {ad.callToAction || 'Learn More'}
                    </span>
                    <ExternalLink size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ad Metadata Inspector pill below device */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#94a3b8'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="#ea580c" />
              Target: {ad.targetLocation.district || 'All'} {ad.targetLocation.taluk ? `• ${ad.targetLocation.taluk}` : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} color="#ea580c" />
              {ad.startDate} to {ad.endDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={12} color="#ea580c" />
              Slot: {ad.position}
            </span>
          </div>
        </div>

        {/* Footer Close Button */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
