import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { MarketplaceCategory, MarketplacePromoBanner } from '../../types/marketplace';
import { getPromoBannersMeta, DEFAULT_PROMO_BANNERS } from '../../services/marketplaceService';

interface PromoBannerCarouselProps {
  screen?: 'all' | 'olx' | 'real_estate';
  position?: 'top' | 'between' | 'any';
  onOpenPostAd?: () => void;
  onSelectCategory?: (cat: MarketplaceCategory) => void;
}

export const PromoBannerCarousel: React.FC<PromoBannerCarouselProps> = ({
  screen = 'all',
  position = 'any',
  onOpenPostAd,
  onSelectCategory
}) => {
  const [banners, setBanners] = useState<MarketplacePromoBanner[]>([]);
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);

  // Auto-slide interval: 2.8s (2 to 3 seconds)
  const AUTO_SLIDE_INTERVAL = 2800;

  const loadBanners = () => {
    let mounted = true;
    getPromoBannersMeta(screen)
      .then((meta) => {
        if (!mounted) return;
        if (!meta.isSectionEnabled || !meta.banners || meta.banners.length === 0) {
          setIsSectionVisible(false);
          setBanners([]);
          return;
        }

        // Check if placement setting permits this carousel position
        if (position !== 'any') {
          const allowed =
            meta.bannerPlacement === 'both' ||
            meta.bannerPlacement === position;
          if (!allowed) {
            setIsSectionVisible(false);
            setBanners([]);
            return;
          }
        }

        setIsSectionVisible(true);
        setBanners(meta.banners);
      })
      .catch((err) => {
        console.warn('[PromoBannerCarousel] Error fetching banners:', err);
        if (mounted) {
          setBanners(DEFAULT_PROMO_BANNERS);
          setIsSectionVisible(true);
        }
      });
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    loadBanners();

    // Listen for custom admin update events to immediately re-sync
    const handleSync = () => loadBanners();
    window.addEventListener('storage', handleSync);
    window.addEventListener('spotlight_banners_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('spotlight_banners_updated', handleSync);
    };
  }, [screen]);

  // Continuous auto-sliding effect (every 2.8 seconds, resets after manual slide)
  useEffect(() => {
    if (banners.length <= 1 || isDragging || !isSectionVisible) return;

    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length, isDragging, activeBannerIndex, isSectionVisible]);

  // Adjust active index if banners count changes (e.g. 4, 5, 6 slides)
  useEffect(() => {
    if (activeBannerIndex >= banners.length && banners.length > 0) {
      setActiveBannerIndex(0);
    }
  }, [banners.length, activeBannerIndex]);

  // If section is toggled off by admin or no active banners exist, completely hide the section
  if (!isSectionVisible || banners.length === 0) {
    return null;
  }

  // Next / Prev / Dot navigation
  const handlePrevBanner = () => {
    if (banners.length <= 1) return;
    setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextBanner = () => {
    if (banners.length <= 1) return;
    setActiveBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handleSelectDot = (dotIdx: number) => {
    setActiveBannerIndex(dotIdx);
  };

  // Handle Banner CTA clicks
  const handleBannerCtaClick = (banner: MarketplacePromoBanner) => {
    if (banner.actionType === 'category' && banner.actionPayload) {
      onSelectCategory?.(banner.actionPayload as MarketplaceCategory);
    } else if (banner.actionType === 'post_ad') {
      onOpenPostAd?.();
    } else if (banner.actionType === 'external' && banner.buttonLink) {
      window.open(banner.buttonLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragDeltaX(0);
    hasDraggedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartXRef.current === null) return;
    const delta = e.touches[0].clientX - dragStartXRef.current;
    setDragDeltaX(delta);
    if (Math.abs(delta) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (dragStartXRef.current === null) return;
    const delta = dragDeltaX;
    if (delta < -40 && banners.length > 1) {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    } else if (delta > 40 && banners.length > 1) {
      setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
    setIsDragging(false);
    setDragDeltaX(0);
    dragStartXRef.current = null;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  // Mouse Drag for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    setDragDeltaX(0);
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartXRef.current === null || !isDragging) return;
    const delta = e.clientX - dragStartXRef.current;
    setDragDeltaX(delta);
    if (Math.abs(delta) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const delta = dragDeltaX;
    if (delta < -40 && banners.length > 1) {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    } else if (delta > 40 && banners.length > 1) {
      setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
    setIsDragging(false);
    setDragDeltaX(0);
    dragStartXRef.current = null;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div
      className={`olx-promo-carousel-wrapper ${position === 'between' ? 'is-in-feed' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={
        position === 'between'
          ? {
              gridColumn: '1 / -1',
              width: '100%',
              margin: '10px 0 16px 0'
            }
          : undefined
      }
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track containing all banners */}
      <div
        className="olx-promo-track"
        style={{
          transform: isDragging
            ? `translateX(calc(-${activeBannerIndex * 100}% + ${dragDeltaX}px))`
            : `translateX(-${activeBannerIndex * 100}%)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.52s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {banners.map((banner, index) => {
          const isVideoMedia =
            banner.mediaType === 'video' ||
            (!banner.mediaType && Boolean(banner.videoUrl) && !banner.imageUrl);
          const videoSource = banner.videoUrl;
          const isFullPoster = banner.bannerStyle === 'full_poster';

          return (
            <div
              key={banner.id || index}
              className={`olx-promo-slide ${isFullPoster ? 'is-full-poster' : ''}`}
              style={{
                background:
                  banner.bgGradient ||
                  'linear-gradient(135deg, #e0edfb 0%, #edf5fc 45%, #fff1e5 100%)'
              }}
              onClick={() => {
                if (isFullPoster) {
                  if (hasDraggedRef.current) return;
                  handleBannerCtaClick(banner);
                }
              }}
            >
              {isFullPoster ? (
                /* Full Graphic Poster Mode - uploaded photo alone displays 100% full width with zero text overlap */
                isVideoMedia && videoSource ? (
                  <video
                    src={videoSource}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="olx-promo-full-media"
                  />
                ) : banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || 'Promotional Banner'}
                    className="olx-promo-full-media"
                  />
                ) : null
              ) : (
                /* Split Template Mode - Text on left, Graphic on right */
                <>
                  <div className="olx-promo-text">
                    {banner.badge && (
                      <span
                        className="olx-promo-badge"
                        style={{
                          backgroundColor: banner.badgeBg || 'var(--lp-orange)'
                        }}
                      >
                        {banner.badge}
                      </span>
                    )}

                    <h3 style={{ whiteSpace: 'pre-line' }}>{banner.title}</h3>

                    {banner.subtitle && (
                      <p style={{ whiteSpace: 'pre-line' }}>{banner.subtitle}</p>
                    )}

                    {banner.buttonText && (
                      <button
                        type="button"
                        className="olx-promo-book-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasDraggedRef.current) return;
                          handleBannerCtaClick(banner);
                        }}
                        style={{
                          marginTop: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: banner.btnBg || 'var(--lp-orange)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)'
                        }}
                      >
                        <span>{banner.buttonText}</span>
                        {banner.actionType === 'external' ? (
                          <ExternalLink size={12} />
                        ) : null}
                      </button>
                    )}
                  </div>

                  {/* Banner Video or Image Media Cluster (Exactly fitted) */}
                  {isVideoMedia && videoSource ? (
                    <div className="olx-promo-bg-decor">
                      <video
                        src={videoSource}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="olx-promo-video-decor"
                      />
                    </div>
                  ) : banner.imageUrl ? (
                    <div className="olx-promo-bg-decor">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="olx-promo-video-decor"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Previous / Next Arrow Controls */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="olx-banner-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevBanner();
            }}
            title="Previous Banner"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className="olx-banner-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              handleNextBanner();
            }}
            title="Next Banner"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Carousel indicator dots (dynamically 3, 4, 5, 6... dots) */}
      {banners.length > 1 && (
        <div className="olx-banner-dots">
          {banners.map((b, dotIdx) => (
            <div
              key={b.id || dotIdx}
              className={`olx-banner-dot ${activeBannerIndex === dotIdx ? 'active' : ''}`}
              style={{
                background:
                  activeBannerIndex === dotIdx
                    ? banners[activeBannerIndex]?.badgeBg || 'var(--lp-orange)'
                    : undefined
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectDot(dotIdx);
              }}
              title={`Banner ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
