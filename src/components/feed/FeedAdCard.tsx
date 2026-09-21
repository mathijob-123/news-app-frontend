import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, Megaphone, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Advertisement } from '../../types';

interface FeedAdCardProps {
  ad: Advertisement;
  onAdClick?: (ad: Advertisement) => void;
  onAdImpression?: (ad: Advertisement) => void;
}

export const FeedAdCard: React.FC<FeedAdCardProps> = ({
  ad,
  onAdClick,
  onAdImpression
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasTrackedImpression = useRef(false);

  // IntersectionObserver to track impressions when 50% visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression.current) {
            hasTrackedImpression.current = true;
            onAdImpression?.(ad);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [ad, onAdImpression]);

  const handleClick = () => {
    onAdClick?.(ad);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // BANNER FORMAT
  if (ad.adType === 'banner') {
    return (
      <div
        ref={cardRef}
        onClick={handleClick}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(249, 115, 22, 0.35)',
          overflow: 'hidden',
          margin: '14px 0',
          cursor: ad.targetUrl ? 'pointer' : 'default',
          boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.3), 0 0 16px rgba(249, 115, 22, 0.12)',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        {/* Top Sponsored Tag Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: 'rgba(249, 115, 22, 0.12)',
            borderBottom: '1px solid rgba(249, 115, 22, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: 800,
                color: '#ea580c',
                background: '#fff7ed',
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <Megaphone size={11} />
              <span>விளம்பரம் • SPONSORED</span>
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              {ad.advertiserName}
            </span>
          </div>

          <span
            style={{
              fontSize: '10px',
              color: '#fdba74',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Sparkles size={11} /> Featured Partner
          </span>
        </div>

        {/* Banner Media */}
        {ad.mediaUrl && (
          <div style={{ position: 'relative', width: '100%', maxHeight: '180px', overflow: 'hidden' }}>
            <img
              src={ad.mediaUrl}
              alt={ad.title}
              style={{
                width: '100%',
                maxHeight: '180px',
                objectFit: 'cover',
                display: 'block'
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Content & CTA Row */}
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 700,
                color: '#f8fafc',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {ad.title}
            </h4>
          </div>

          <button
            type="button"
            style={{
              flexShrink: 0,
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
            }}
          >
            <span>{ad.callToAction || 'Learn More'}</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    );
  }

  // NATIVE FEED CARD (Image or Video)
  return (
    <article
      ref={cardRef}
      className="feed-card"
      style={{
        border: '1px solid rgba(249, 115, 22, 0.35)',
        background: '#ffffff',
        position: 'relative',
        boxShadow: '0 8px 24px -4px rgba(234, 88, 12, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* 1. Header with Sponsored Badge */}
      <div className="feed-card-header" style={{ padding: '12px 14px 8px' }}>
        <div className="reporter-badge-group">
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            {ad.advertiserName.charAt(0).toUpperCase()}
          </div>
          <div className="reporter-meta">
            <div className="reporter-name-row" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                {ad.advertiserName}
              </span>
              <CheckCircle2 size={13} color="#ea580c" fill="#fff7ed" />
            </div>
            <div className="reporter-sub-row" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              <span>Verified Commercial Partner</span>
              {ad.targetLocation.district && ad.targetLocation.district !== 'All' && (
                <>
                  <span>•</span>
                  <span>{ad.targetLocation.district}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sponsored Pill Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 800,
            color: '#ea580c',
            background: '#fff7ed',
            border: '1px solid #ffedd5',
            padding: '3px 9px',
            borderRadius: '999px',
            letterSpacing: '0.03em'
          }}
        >
          <Megaphone size={11} />
          <span>விளம்பரம்</span>
        </span>
      </div>

      {/* 2. Ad Media Player or Image */}
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: ad.adType === 'video' ? '16/9' : '16/10',
          background: '#090d16',
          overflow: 'hidden',
          cursor: ad.targetUrl ? 'pointer' : 'default'
        }}
      >
        {ad.adType === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={ad.mediaUrl}
              poster={ad.thumbnailUrl || undefined}
              playsInline
              loop
              autoPlay
              muted={isMuted}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Audio Toggle Button */}
            <button
              onClick={toggleMute}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                zIndex: 2
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </>
        ) : (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            loading="lazy"
          />
        )}
      </div>

      {/* 3. Ad Content & Action Bar */}
      <div style={{ padding: '12px 14px' }}>
        <h3
          onClick={handleClick}
          style={{
            fontSize: '14px',
            fontWeight: 800,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
            margin: '0 0 10px 0',
            cursor: ad.targetUrl ? 'pointer' : 'default'
          }}
        >
          {ad.title}
        </h3>

        {/* CTA Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #f1f5f9'
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Sponsored Post
          </span>

          <button
            type="button"
            onClick={handleClick}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
            }}
          >
            <span>{ad.callToAction || 'Learn More'}</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </article>
  );
};
