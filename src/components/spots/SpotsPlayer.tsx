import React, { useState, useRef, useEffect } from 'react';
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
  Camera
} from 'lucide-react';
import type { VideoPost, User } from '../../types';
import { formatDistance } from '../../services/geoService';
import { isWatchQualified } from '../../services/monetizationEngine';
import { recordQualifiedView } from '../../services/storageService';
import { CommentsDrawer } from './CommentsDrawer';
import { TipModal } from './TipModal';

interface SpotsPlayerProps {
  posts: VideoPost[];
  initialPostId?: string;
  currentUser: User;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (post: VideoPost) => void;
  onAddComment: (postId: string, text: string) => void;
  getCommentsForPost: (postId: string) => any[];
  onSendTip: (postId: string, amount: number, creatorName: string) => void;
  onOpenCreate?: () => void;
}

export const SpotsPlayer: React.FC<SpotsPlayerProps> = ({
  posts,
  initialPostId,
  currentUser,
  onLike,
  onSave,
  onShare,
  onAddComment,
  getCommentsForPost,
  onSendTip,
  onOpenCreate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0); // 0 to 100% of threshold
  const [isQualifiedView, setIsQualifiedView] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const watchSecondsRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Set initial post index if specified
  useEffect(() => {
    if (initialPostId) {
      const idx = posts.findIndex((p) => p.id === initialPostId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialPostId, posts]);

  const currentPost = posts[currentIndex] || posts[0];

  // Reset watch tracking on slide change
  useEffect(() => {
    watchSecondsRef.current = 0;
    setWatchProgress(0);
    setIsQualifiedView(false);
    setIsPlaying(true);
    setCaptionExpanded(false);

    if (currentPost?.type === 'image') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(100, (elapsed / 3) * 100);
        setWatchProgress(progress);
        if (elapsed >= 3) {
          setIsQualifiedView(true);
          recordQualifiedView(currentPost.id);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: mute and play
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [currentIndex, currentPost?.id]);

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
  }, [currentIndex, posts.length]);

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
    if (currentIndex < posts.length - 1) {
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

  if (!currentPost) {
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


        {/* Centered Empty State Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px 16px',
            maxWidth: '360px',
            margin: '0 auto',
            zIndex: 10
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '22px',
              background: 'rgba(255, 69, 0, 0.12)',
              border: '1.5px solid rgba(255, 69, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(255, 69, 0, 0.2)'
            }}
          >
            <PlaySquare size={36} color="var(--brand-primary)" strokeWidth={2} />
          </div>

          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}
          >
            No News Reels Available
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}
          >
            No citizen reports with short-video footage have been published yet. Be the first citizen journalist to broadcast ground reality!
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
            <span style={{ fontWeight: 700, color: '#ffffff' }}>Admin Video Grants Active:</span> Verified reels in Chennai & Tiruvallur earn cash bounties & UPI view royalties.
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


      {/* 2. Main Reel Video Surface */}
      <div className="spots-slider" onClick={handleVideoAreaClick}>
        <div className="spots-slide">
          {currentPost.type === 'image' ? (
            <img
              src={currentPost.mediaUrl}
              alt={currentPost.headline}
              className="spots-video"
              style={{ objectFit: 'contain', width: '100%', height: '100%', background: '#000000' }}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentPost.mediaUrl}
              poster={currentPost.thumbnailUrl}
              loop
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              className="spots-video"
            />
          )}

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                pointerEvents: 'none'
              }}
            >
              <Play size={30} fill="#ffffff" style={{ marginLeft: '4px' }} />
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

        {/* Report Citizen Ethics */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            alert('Report filed with LocalPulse Citizen Ethics & Trust Board for rapid review.');
          }}
        >
          <div className="rail-icon-circle" style={{ width: '34px', height: '34px' }}>
            <Flag size={15} color="rgba(255, 255, 255, 0.7)" />
          </div>
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
                <span>₹{currentPost.priceAward || currentPost.adminPayoutAmount || currentPost.adminBountyAwarded || 50} Paid</span>
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
