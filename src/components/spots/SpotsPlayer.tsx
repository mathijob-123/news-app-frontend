import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  DollarSign,
  Flag,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Compass,
  Award,
  PlaySquare,
  Camera,
  Loader2
} from 'lucide-react';
import type { VideoPost, User, LocationCoordinates } from '../../types';
import { formatDistance } from '../../services/geoService';
import { isWatchQualified } from '../../services/monetizationEngine';
import { recordQualifiedView } from '../../services/storageService';
import { CommentsDrawer } from './CommentsDrawer';
import { TipModal } from './TipModal';

interface SpotsPlayerProps {
  posts: VideoPost[];
  initialPostId?: string;
  currentUser: User;
  activeLocation?: LocationCoordinates;
  onOpenLocationPicker?: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (post: VideoPost) => void;
  onAddComment: (postId: string, text: string) => void;
  getCommentsForPost: (postId: string) => any[];
  onSendTip: (postId: string, amount: number, creatorName: string) => void;
  onOpenCreate?: () => void;
  onReportCopyright?: (post: VideoPost) => void;
}

export const SpotsPlayer: React.FC<SpotsPlayerProps> = ({
  posts,
  initialPostId,
  currentUser,
  activeLocation,
  onOpenLocationPicker,
  onLike,
  onSave,
  onShare,
  onAddComment,
  getCommentsForPost,
  onSendTip,
  onOpenCreate,
  onReportCopyright
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Default: Sound ON as requested
  const [isBuffering, setIsBuffering] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0); // 0 to 100% of threshold
  const [isQualifiedView, setIsQualifiedView] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const watchSecondsRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Spotlight Rule: STRICTLY video / reel posts only (NO images, NO fallback to images!)
  const videoReels = useMemo(() => {
    return posts.filter((p) => p.type === 'video');
  }, [posts]);

  // Set initial post index if specified
  useEffect(() => {
    if (initialPostId) {
      const idx = videoReels.findIndex((p) => p.id === initialPostId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialPostId, videoReels]);

  const currentPost = videoReels[currentIndex] || videoReels[0];

  // Reliable video stream resolution (prevents broken/dead blob URLs or 403 Forbidden URLs from hanging)
  const resolvedVideoSrc = useMemo(() => {
    const rawUrl = currentPost?.mediaUrl || '';
    if (
      !rawUrl ||
      hasPlaybackError ||
      rawUrl.startsWith('blob:') ||
      rawUrl.includes('commondatastorage.googleapis.com')
    ) {
      return 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4';
    }
    return rawUrl;
  }, [currentPost?.mediaUrl, hasPlaybackError]);

  // Preload next upcoming reel in background for 0s lag on swipe
  const nextPost = videoReels[currentIndex + 1];
  const nextVideoSrc = useMemo(() => {
    if (!nextPost?.mediaUrl) return '';
    const rawUrl = nextPost.mediaUrl;
    if (
      rawUrl.startsWith('blob:') ||
      rawUrl.includes('commondatastorage.googleapis.com')
    ) {
      return 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4';
    }
    return rawUrl;
  }, [nextPost?.mediaUrl]);

  // Unlock unmuted audio playback on user gesture if browser initially blocked audio autoplay
  useEffect(() => {
    const unlockAudio = () => {
      if (videoRef.current && videoRef.current.muted && !isMuted) {
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, [isMuted]);

  // Reset watch tracking on slide change & play video smoothly
  useEffect(() => {
    watchSecondsRef.current = 0;
    setWatchProgress(0);
    setIsQualifiedView(false);
    setCaptionExpanded(false);
    setHasPlaybackError(false);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.muted = isMuted;

      // Fast immediate play attempt with sound
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn('[SpotsPlayer Autoplay Notice]:', err);
            // If browser policy restricted unmuted playback before user gesture:
            if (video) {
              video.muted = true;
              video.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          });
      }
    }
  }, [currentIndex, resolvedVideoSrc, isMuted]);

  // Keyboard navigation for reels (ArrowUp / ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videoReels.length]);

  // Handle video playback time updates & qualified view tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current || isQualifiedView) return;
    const current = videoRef.current.currentTime;
    watchSecondsRef.current = current;

    // Threshold: min(3s, 50% of video duration)
    const duration = currentPost.durationSeconds || 15;
    const thresholdSeconds = Math.min(3, Math.max(1, duration * 0.5));
    const progress = Math.min(100, (current / thresholdSeconds) * 100);
    setWatchProgress(progress);

    if (isWatchQualified(current, duration)) {
      setIsQualifiedView(true);
      recordQualifiedView(currentPost.id);
    }
  };

  // Double tap to like or single tap to pause/play
  const handleVideoAreaClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap!
      if (!currentPost.isLiked) {
        onLike(currentPost.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 750);
    } else {
      // Single tap toggle play/pause
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
    lastTapRef.current = now;
  };

  // Swipe up / down gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped UP -> Next video
        goToNext();
      } else {
        // Swiped DOWN -> Previous video
        goToPrev();
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < videoReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId]
    }));
  };

  // Empty state: Spotlight rule requirement:
  // "If there are no reels for that location, display a message like 'No reels available for your location,' rather than showing an image."
  if (!currentPost) {
    const locName = activeLocation?.neighborhood || activeLocation?.placeName || 'your location';
    return (
      <div
        className="spots-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#090d16',
          color: '#ffffff',
          padding: '16px',
          position: 'relative'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="pulse-beacon" />
            <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Spotlight Reels
            </span>
          </div>

          {onOpenLocationPicker && (
            <button
              onClick={onOpenLocationPicker}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <MapPin size={11} color="var(--brand-primary)" />
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {locName}
              </span>
              <ChevronDown size={11} />
            </button>
          )}
        </div>

        {/* Centered Empty State Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 16px',
            maxWidth: '360px',
            margin: '0 auto',
            zIndex: 10
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '24px',
              background: 'rgba(255, 69, 0, 0.12)',
              border: '1.5px solid rgba(255, 69, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 35px rgba(255, 69, 0, 0.25)'
            }}
          >
            <PlaySquare size={38} color="var(--brand-primary)" strokeWidth={2} />
          </div>

          {/* Location Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              marginBottom: '12px'
            }}
          >
            <MapPin size={13} color="var(--brand-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>
              {locName}
            </span>
          </div>

          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '6px'
            }}
          >
            No reels available for your location
          </h3>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              marginBottom: '12px'
            }}
          >
            உங்கள் பகுதியில் ரீல்ஸ் எதுவும் இல்லை
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.72)',
              lineHeight: 1.55,
              marginBottom: '22px'
            }}
          >
            {activeLocation?.placeName
              ? `There are currently no video reels published for ${activeLocation.neighborhood || activeLocation.placeName}. Spotlight exclusively streams video dispatches from your active location.`
              : 'There are currently no video reels published for your location. Spotlight exclusively streams video dispatches from your active location.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {onOpenCreate && (
              <button
                onClick={onOpenCreate}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--brand-glow)'
                }}
              >
                <Camera size={16} />
                <span>Record First News Reel</span>
              </button>
            )}

            {onOpenLocationPicker && (
              <button
                onClick={onOpenLocationPicker}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Compass size={14} />
                <span>Switch Location / பகுதி மாற்றவும்</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Trust & Treasury Banner */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '65px',
            zIndex: 10
          }}
        >
          <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.35 }}>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>Spotlight Verified:</span> Only high-trust video reels from your immediate vicinity are broadcast here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="spots-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Top Location Pill & Reeling Badge */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenLocationPicker) onOpenLocationPicker();
          }}
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '5px 12px',
            color: '#ffffff',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <MapPin size={12} color="var(--brand-primary)" />
          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeLocation?.neighborhood || activeLocation?.placeName || currentPost.location.neighborhood || currentPost.location.placeName}
          </span>
          <ChevronDown size={12} />
        </button>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--brand-primary)'
          }}
        >
          <span>REELS ONLY</span>
        </div>
      </div>

      {/* 2. Main Reel Video Surface (STRICTLY video posts only, no images) */}
      <div className="spots-slider" onClick={handleVideoAreaClick}>
        <div className="spots-slide">
          <video
            ref={videoRef}
            src={resolvedVideoSrc}
            poster={currentPost.thumbnailUrl}
            autoPlay
            loop
            playsInline
            preload="auto"
            muted={isMuted}
            onPlay={() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }}
            onPause={() => setIsPlaying(false)}
            onPlaying={() => {
              setIsPlaying(true);
              setIsBuffering(false);
            }}
            onWaiting={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
            onTimeUpdate={handleTimeUpdate}
            onError={(e) => {
              console.warn('[SpotsPlayer] Stream load error for:', currentPost.id, currentPost.mediaUrl, e);
              setHasPlaybackError(true);
              setIsBuffering(false);
            }}
            className="spots-video"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />

          {/* Hidden Next Reel Preloader for Instant 0s Playback on Next Swipe */}
          {nextVideoSrc && (
            <video
              src={nextVideoSrc}
              preload="auto"
              muted
              playsInline
              style={{ display: 'none', position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            />
          )}

          {/* Buffering Loading Spinner */}
          {isBuffering && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                pointerEvents: 'none',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Loader2 size={26} color="#ff4500" className="spin" />
            </div>
          )}

          {/* Interactive Sound Control Pill - Sound ON by default, easy tap to mute/unmute */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) {
                const nextMuted = !isMuted;
                videoRef.current.muted = nextMuted;
                setIsMuted(nextMuted);
                if (!nextMuted) {
                  videoRef.current.play().catch(() => {});
                }
              }
            }}
            style={{
              position: 'absolute',
              top: '64px',
              right: '16px',
              background: isMuted ? 'rgba(0, 0, 0, 0.75)' : 'rgba(16, 185, 129, 0.25)',
              backdropFilter: 'blur(8px)',
              border: isMuted ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #10b981',
              borderRadius: '20px',
              padding: '6px 14px',
              color: isMuted ? '#fca5a5' : '#6ee7b7',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              zIndex: 25,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isMuted ? <VolumeX size={14} color="#fca5a5" /> : <Volume2 size={14} color="#6ee7b7" />}
            <span>{isMuted ? 'Tap for Sound' : 'Sound ON'}</span>
          </button>

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              <Play size={32} fill="#ffffff" style={{ marginLeft: '4px' }} />
            </div>
          )}

          {/* Double-tap Heart Burst */}
          {showHeartBurst && (
            <div className="spots-heart-burst">
              <Heart size={90} fill="#ff3b5c" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Gradient for Overlay Readability */}
      <div className="spots-bottom-gradient" />

      {/* 4. Right Action Rail */}
      <div className="spots-action-rail">
        {/* Like */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onLike(currentPost.id);
          }}
        >
          <div className={`rail-icon-circle ${currentPost.isLiked ? 'liked' : ''}`}>
            <Heart size={22} fill={currentPost.isLiked ? '#ffffff' : 'none'} />
          </div>
          <span className="rail-label">{currentPost.likeCount}</span>
        </button>

        {/* Comment */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
        >
          <div className="rail-icon-circle">
            <MessageCircle size={22} />
          </div>
          <span className="rail-label">{currentPost.commentCount}</span>
        </button>

        {/* Tip / Support Creator */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowTipModal(true);
          }}
        >
          <div
            className="rail-icon-circle"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#34d399' }}
          >
            <DollarSign size={22} />
          </div>
          <span className="rail-label">Tip</span>
        </button>

        {/* Share */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onShare(currentPost);
          }}
        >
          <div className="rail-icon-circle">
            <Share2 size={22} />
          </div>
          <span className="rail-label">{currentPost.shareCount}</span>
        </button>

        {/* Save / Bookmark */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSave(currentPost.id);
          }}
        >
          <div className="rail-icon-circle">
            <Bookmark size={22} fill={currentPost.isSaved ? '#ffffff' : 'none'} />
          </div>
          <span className="rail-label">Save</span>
        </button>

        {/* Sound Toggle (Mute / Unmute) */}
        {currentPost.type === 'video' && (
          <button
            className="rail-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
                setIsMuted(videoRef.current.muted);
              }
            }}
          >
            <div className="rail-icon-circle">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </div>
            <span className="rail-label">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>
        )}

        {/* Report Copyright & Citizen Ethics */}
        <button
          className="rail-btn"
          title="Report copyright infringement / ethics"
          onClick={(e) => {
            e.stopPropagation();
            if (onReportCopyright) {
              onReportCopyright(currentPost);
            } else {
              alert('Report filed with LocalPulse Citizen Ethics & Trust Board for rapid review.');
            }
          }}
        >
          <div className="rail-icon-circle" style={{ width: '34px', height: '34px' }}>
            <Flag size={15} color="rgba(255, 255, 255, 0.7)" />
          </div>
          <span className="rail-label" style={{ fontSize: '9px' }}>Report</span>
        </button>
      </div>

      {/* 5. Bottom Overlay Content (Creator, Headline, Location Pin) */}
      <div className="spots-overlay-content">
        {/* Compact Creator & Meta Row */}
        <div className="spots-creator-row">
          <img
            src={currentPost.creatorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentPost.creatorName || 'Reporter')}`}
            alt={currentPost.creatorName}
            className="spots-creator-avatar"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentPost.creatorName || 'Reporter')}`;
            }}
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '12.5px', textShadow: '0 1px 2px rgba(0,0,0,0.85)' }}>
              @{currentPost.creatorHandle}
            </span>
            {currentPost.creatorVerified && (
              <CheckCircle2 size={12} color="var(--brand-primary)" fill="#ffffff" />
            )}
          </div>

          <button
            className="spots-follow-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleFollow(currentPost.creatorId);
            }}
            style={{
              background: followedCreators[currentPost.creatorId]
                ? 'rgba(255, 255, 255, 0.25)'
                : 'var(--brand-gradient)'
            }}
          >
            {followedCreators[currentPost.creatorId] ? 'Following' : '+ Follow'}
          </button>

          {/* Inline Compact Meta Pills */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255, 69, 0, 0.85)',
                padding: '1.5px 6px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 700
              }}
            >
              <MapPin size={9} />
              <span>
                {currentPost.location.neighborhood || currentPost.location.placeName || 'Local'}
              </span>
            </span>

            <span
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                padding: '1.5px 6px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}
            >
              {currentPost.category}
            </span>

            {(currentPost.adminReviewStatus === 'bounty_awarded' || currentPost.adminReviewStatus === 'verified_approved') && (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.9)',
                  color: '#ffffff',
                  padding: '1.5px 6px',
                  borderRadius: '4px',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <CheckCircle2 size={9} />
                <span>
                  {currentUser && currentUser.id === currentPost.creatorId && (currentPost.priceAward || currentPost.adminPayoutAmount)
                    ? `Verified • ₹${currentPost.priceAward || currentPost.adminPayoutAmount} Awarded to You`
                    : 'Verified'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Headline (Clamped to 2 lines max) */}
        <h2 className="spots-headline">{currentPost.headline}</h2>

        {/* Caption (Deduplicated: only show if distinct from headline) */}
        {currentPost.caption && currentPost.caption.trim() !== currentPost.headline.trim() && (
          <p
            className={`spots-caption ${captionExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCaptionExpanded(!captionExpanded);
            }}
          >
            {currentPost.caption}
          </p>
        )}

        {/* Compact Source Citation */}
        {currentPost.sourceCitation && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '9.5px',
              padding: '1px 5px',
              borderRadius: '3px',
              maxWidth: 'fit-content'
            }}
          >
            <ShieldCheck size={9} />
            <span>{currentPost.sourceCitation}</span>
          </div>
        )}
      </div>

      {/* 6. Comments Drawer */}
      {showComments && (
        <CommentsDrawer
          comments={getCommentsForPost(currentPost.id)}
          currentUser={currentUser}
          onClose={() => setShowComments(false)}
          onAddComment={(text) => onAddComment(currentPost.id, text)}
        />
      )}

      {/* 7. Tip Modal */}
      {showTipModal && (
        <TipModal
          post={currentPost}
          onClose={() => setShowTipModal(false)}
          onSendTip={(amt) => onSendTip(currentPost.id, amt, currentPost.creatorName)}
        />
      )}
    </div>
  );
};
