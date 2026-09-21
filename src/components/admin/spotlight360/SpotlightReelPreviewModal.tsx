import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Sparkles,
  ExternalLink,
  Phone,
  ShoppingBag,
  Share2,
  Heart,
  Eye,
  Radio
} from 'lucide-react';
import type { BulkUploadVideoItem, Spotlight360Video } from '../../../types';

interface SpotlightReelPreviewModalProps {
  video: BulkUploadVideoItem | Spotlight360Video | null;
  onClose: () => void;
}

export const SpotlightReelPreviewModal: React.FC<SpotlightReelPreviewModalProps> = ({
  video,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => setIsPlaying(false));
        }
      });
    }
  }, [video]);

  if (!video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
    setProgress(p);
  };

  const locationName = video.location?.area || video.location?.city || 'Chennai Hub';
  const radiusText = video.location?.radiusKm ? `${video.location.radiusKm} km radius` : '5 km radius';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '380px',
          height: '675px',
          maxHeight: '94vh',
          background: '#000000',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255, 69, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            padding: '16px 16px 24px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 69, 0, 0.95)',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }}
            >
              <Radio size={12} className="animate-pulse" />
              Spotlight360 Reel
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '3px 8px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <MapPin size={11} />
              {locationName} • {radiusText}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleMute}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div
          onClick={togglePlay}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {video.mediaUrl ? (
            <video
              ref={videoRef}
              src={video.mediaUrl}
              poster={video.thumbnailUrl}
              playsInline
              loop
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              <Eye size={40} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>No video media URL loaded</div>
            </div>
          )}

          {/* Play/Pause indicator overlay on tap */}
          {!isPlaying && (
            <div
              style={{
                position: 'absolute',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.3)',
                pointerEvents: 'none'
              }}
            >
              <Play size={28} style={{ marginLeft: '4px' }} />
            </div>
          )}

          {/* Right Action Icons (Reels Style) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '120px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Like */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setLiked(!liked)}
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: 'none',
                  color: liked ? '#ef4444' : '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <Heart size={22} fill={liked ? '#ef4444' : 'none'} />
              </button>
              <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {liked ? '1.2k' : '1.1k'}
              </span>
            </div>

            {/* Share */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => alert('Spotlight360 Reel Share link copied!')}
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: 'none',
                  color: '#ffffff',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <Share2 size={20} />
              </button>
              <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                Share
              </span>
            </div>
          </div>

          {/* Bottom Details Overlay */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              padding: '24px 16px 18px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)',
              color: '#ffffff'
            }}
          >
            {/* Progress bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'rgba(255,255,255,0.2)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'var(--brand-primary)',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>

            {/* Creator / Sponsor Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff4500, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px'
                }}
              >
                360
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>Spotlight360</span>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '9px',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    SPONSORED
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {video.campaignName ? `Campaign: ${video.campaignName}` : 'Hyperlocal Broadcast'}
                </div>
              </div>
            </div>

            {/* Headline */}
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '4px',
                lineHeight: 1.35,
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {video.title || 'Untitled Spotlight360 Video'}
            </h3>

            {/* Caption */}
            {video.description && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.4,
                  marginBottom: '12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {video.description}
              </p>
            )}

            {/* Call To Action (CTA) Button */}
            {video.cta && (
              <a
                href={video.cta.actionUrl || '#'}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(255, 69, 0, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {video.cta.type === 'call_now' ? (
                    <Phone size={16} />
                  ) : video.cta.type === 'shop_now' ? (
                    <ShoppingBag size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>{video.cta.label || 'Learn More'}</span>
                </div>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
