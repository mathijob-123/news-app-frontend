import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  Eye,
  Award,
  Flag,
  Play,
  Pause
} from 'lucide-react';
import type { VideoPost } from '../../types';
import { formatDistance } from '../../services/geoService';
import { isCrypticHash, getCleanHeadline } from '../../services/storageService';

interface NewsCardProps {
  post: VideoPost;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onOpenComments: (post: VideoPost) => void;
  onOpenSpots: (post: VideoPost) => void;
  onShare: (post: VideoPost) => void;
  onReportCopyright?: (post: VideoPost) => void;
}

const formatPostDate = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Global Instagram-style feed sound preference (shared across feed videos)
let globalFeedMuted = true;

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  onLike,
  onSave,
  onOpenComments,
  onOpenSpots,
  onShare,
  onReportCopyright
}) => {
  const [isMuted, setIsMuted] = useState(globalFeedMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSoundBadge, setShowSoundBadge] = useState(false);
  const soundBadgeTimeoutRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync with global sound changes across feed videos (Instagram behavior)
  useEffect(() => {
    const handleSoundSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ isMuted: boolean }>;
      if (typeof customEvent.detail?.isMuted === 'boolean') {
        setIsMuted(customEvent.detail.isMuted);
        if (videoRef.current) {
          videoRef.current.muted = customEvent.detail.isMuted;
        }
      }
    };

    window.addEventListener('lp:feed-sound-sync', handleSoundSync);
    return () => {
      window.removeEventListener('lp:feed-sound-sync', handleSoundSync);
    };
  }, []);

  // 1. IntersectionObserver: Auto-play when entering view band (35%+ visible), PAUSE immediately when scrolled away
  useEffect(() => {
    const el = mediaContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const center = rect.top + rect.height / 2;
          // Active reading/viewing band: card center is between 12% and 88% of screen height
          const inViewingBand = center >= vh * 0.12 && center <= vh * 0.88;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.35 && inViewingBand) {
            // Video is in focus: auto-play immediately
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.muted = globalFeedMuted;
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  // Notify other feed videos to immediately pause so only this active video plays
                  window.dispatchEvent(
                    new CustomEvent('lp:feed-video-playing', { detail: { id: post.id } })
                  );
                })
                .catch(() => {
                  // If browser restricts unmuted autoplay, mute and immediately play
                  if (videoRef.current && !videoRef.current.muted) {
                    videoRef.current.muted = true;
                    videoRef.current
                      .play()
                      .then(() => {
                        setIsPlaying(true);
                        window.dispatchEvent(
                          new CustomEvent('lp:feed-video-playing', { detail: { id: post.id } })
                        );
                      })
                      .catch(() => {});
                  }
                });
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.25 || !inViewingBand) {
            // Video scrolled away: pause immediately
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: [0, 0.15, 0.25, 0.35, 0.5, 0.75]
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (soundBadgeTimeoutRef.current) clearTimeout(soundBadgeTimeoutRef.current);
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    };
  }, [post.id]);

  // 2. Single active video coordinator: Pause when another feed video starts
  useEffect(() => {
    const handleOtherPlaying = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id !== post.id && videoRef.current) {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('lp:feed-video-playing', handleOtherPlaying);
    return () => {
      window.removeEventListener('lp:feed-video-playing', handleOtherPlaying);
    };
  }, [post.id]);

  // Toggle audio like Instagram: click once -> play sound, click again -> mute
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    const nextMuted = !isMuted;
    globalFeedMuted = nextMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // Sync all feed cards so scrolling to next video honors current sound mode
    window.dispatchEvent(
      new CustomEvent('lp:feed-sound-sync', { detail: { isMuted: nextMuted } })
    );

    // Show Instagram center sound bubble
    setShowSoundBadge(true);
    if (soundBadgeTimeoutRef.current) clearTimeout(soundBadgeTimeoutRef.current);
    soundBadgeTimeoutRef.current = setTimeout(() => {
      setShowSoundBadge(false);
    }, 750);

    // If user unmuted and video was paused, start playing
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          window.dispatchEvent(
            new CustomEvent('lp:feed-video-playing', { detail: { id: post.id } })
          );
        })
        .catch(() => {});
    }
  };

  const handleOpenReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    onOpenSpots(post);
  };

  return (
    <article className="feed-card">
      {/* 1. Header: Reporter Info + Location Tag */}
      <div className="feed-card-header">
        <div className="reporter-badge-group">
          <img
            src={post.creatorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.creatorName || 'Reporter')}`}
            alt={post.creatorName}
            className="reporter-avatar"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.creatorName || 'Reporter')}&backgroundColor=ea580c&textColor=ffffff`;
            }}
          />
          <div className="reporter-meta">
            <div className="reporter-name-row">
              <span>{post.creatorName}</span>
              {post.creatorVerified && (
                <CheckCircle2 size={13} color="var(--brand-primary)" fill="#ffedd5" />
              )}
            </div>
            <div className="reporter-sub-row">
              <span>@{post.creatorHandle}</span>
              <span>•</span>
              <span>{formatPostDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Location & Category Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span className={`category-tag-badge ${post.category}`}>
            {post.category}
          </span>
          <div className="location-tag-badge">
            <MapPin size={10} />
            <span>
              {post.location.neighborhood || post.location.placeName || 'Local'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Media Section */}
      {(() => {
        const isPhoto =
          post.type === 'image' ||
          (Boolean(post.mediaUrl) &&
            !post.mediaUrl.match(/\.(mp4|webm|mov|m4v|ogg)/i) &&
            Boolean(post.mediaUrl.match(/\.(jpe?g|png|gif|webp|avif|bmp|svg)/i)));

        if (isPhoto && post.mediaUrl) {
          return (
            <div
              className="feed-photo-container"
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenSpots(post)}
            >
              <img
                src={post.mediaUrl}
                alt={post.headline}
                className="feed-photo-image"
                loading="lazy"
              />
            </div>
          );
        }

        if (post.mediaUrl) {
          return (
            <div
              ref={mediaContainerRef}
              className="feed-media-container"
              onClick={toggleSound}
              style={{ cursor: 'pointer' }}
            >
              {(post.thumbnailUrl || post.mediaUrl) && (
                <div
                  className="feed-media-ambient-blur"
                  style={{
                    backgroundImage: `url(${post.thumbnailUrl || post.mediaUrl})`
                  }}
                />
              )}
              <video
                ref={videoRef}
                src={post.mediaUrl}
                poster={post.thumbnailUrl}
                preload="metadata"
                muted={isMuted}
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="feed-media-video"
              />

              {/* Instagram-style central tap sound badge */}
              {showSoundBadge && (
                <div className="insta-sound-badge">
                  {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                </div>
              )}

              {/* Instagram-style sound toggle icon button + Spots Reel */}
              <div className="media-control-overlay">
                <button
                  type="button"
                  className="insta-sound-btn"
                  onClick={toggleSound}
                  title={isMuted ? 'Play sound' : 'Mute sound'}
                  aria-label={isMuted ? 'Play sound' : 'Mute sound'}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  type="button"
                  className="media-btn-pill"
                  onClick={handleOpenReel}
                  title="Open full-screen Spots Reel"
                >
                  <Maximize2 size={13} />
                  <span>Spots Reel</span>
                </button>
              </div>
            </div>
          );
        }

        return null;
      })()}

      {/* 3. Body: Headline, Caption, Source Citation */}
      <div className="feed-card-body">
        <h2 className="feed-headline" onClick={() => onOpenSpots(post)} style={{ cursor: 'pointer' }}>
          {getCleanHeadline(post.headline, post.caption, post.location.neighborhood || post.location.placeName)}
        </h2>
        {post.caption &&
          !isCrypticHash(post.caption) &&
          post.caption.trim() !== getCleanHeadline(post.headline, post.caption, post.location.neighborhood || post.location.placeName).trim() && (
          <p className="feed-caption">{post.caption}</p>
        )}

        {post.sourceCitation &&
          !post.sourceCitation.toLowerCase().includes('campaign') &&
          !post.sourceCitation.toLowerCase().includes('spotlight360') && (
          <div className="source-citation-bar">
            <ShieldCheck size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11px' }}>
              <strong>Verified Source:</strong> {post.sourceCitation}
            </span>
          </div>
        )}

        {/* View Statistics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginTop: '8px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            {post.viewCount.toLocaleString('en-IN')} views
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-success)',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={12} color="var(--color-success)" />
            <span>{post.qualifiedViewCount.toLocaleString('en-IN')} verified watch sessions</span>
          </span>
        </div>

        {/* Admin Payout Grant Status */}
        {post.adminReviewStatus === 'bounty_awarded' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              marginTop: '8px'
            }}
          >
            <Award size={12} />
            <span>Featured Ground Dispatch</span>
          </div>
        )}
        {post.adminReviewStatus === 'verified_approved' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              marginTop: '8px'
            }}
          >
            <CheckCircle2 size={12} />
            <span>Bureau Verified Report</span>
          </div>
        )}
      </div>

      {/* 4. Actions: Like, Comment, Share, Save */}
      <div className="feed-card-actions">
        <button
          className={`action-item ${post.isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
          title="Like this report"
        >
          <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
          <span>{post.likeCount}</span>
        </button>

        <button
          className="action-item"
          onClick={() => onOpenComments(post)}
          title="View and post comments"
        >
          <MessageCircle size={18} />
          <span>{post.commentCount}</span>
        </button>

        <button
          className="action-item"
          onClick={() => onShare(post)}
          title="Share news report"
        >
          <Share2 size={18} />
          <span>{post.shareCount}</span>
        </button>

        <button
          className={`action-item ${post.isSaved ? 'saved' : ''}`}
          onClick={() => onSave(post.id)}
          title="Save for later"
        >
          <Bookmark size={18} fill={post.isSaved ? 'currentColor' : 'none'} />
        </button>

        {onReportCopyright && (
          <button
            className="action-item"
            onClick={() => onReportCopyright(post)}
            title="Report copyright infringement"
            style={{ color: '#94a3b8' }}
          >
            <Flag size={17} />
          </button>
        )}
      </div>
    </article>
  );
};
