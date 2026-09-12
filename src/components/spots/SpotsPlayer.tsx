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
import type { VideoPost, User, RadiusFilter } from '../../types';
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
  radiusKm: RadiusFilter;
  onSelectRadius: (radius: RadiusFilter) => void;
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
  radiusKm,
  onSelectRadius,
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
  const [showRadiusSheet, setShowRadiusSheet] = useState(false);
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
        {/* Top Bar with Radius Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, paddingTop: '10px' }}>
          <button
            onClick={() => setShowRadiusSheet(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <Compass size={14} color="var(--brand-primary)" />
            <span>Radius: {radiusKm === 100 ? 'Citywide (100km)' : `${radiusKm}km`}</span>
            <ChevronDown size={13} />
          </button>

          <span
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 10px',
              borderRadius: '20px'
            }}
          >
            <MapPin size={12} color="var(--brand-primary)" />
            <span>Chennai / Tiruvallur</span>
          </span>
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
            No News Reels in Your Area
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}
          >
            No citizen reports with short-video footage have been published within {radiusKm === 100 ? 'the district' : `${radiusKm}km`}. Be the first citizen journalist to broadcast ground reality!
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

            {radiusKm !== 100 && (
              <button
                onClick={() => onSelectRadius(100)}
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Compass size={16} />
                <span>Expand to Citywide (100km)</span>
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

        {/* Radius Selector Bottom Sheet */}
        {showRadiusSheet && (
          <div className="bottom-sheet-backdrop" onClick={() => setShowRadiusSheet(false)}>
            <div
              className="bottom-sheet-content"
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1e293b', color: '#ffffff', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="sheet-handle-bar" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <div style={{ padding: '0 16px 16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                  Filter Spots by Distance
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>
                  Choose your radar radius from your active coordinates in North Tamil Nadu
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {([1, 3, 5, 10, 25, 100] as RadiusFilter[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onSelectRadius(r);
                        setShowRadiusSheet(false);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: radiusKm === r ? 'var(--brand-primary)' : 'rgba(255,255,255,0.06)',
                        color: '#ffffff',
                        border: radiusKm === r ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
                    >
                      {r === 100 ? 'Citywide (100km)' : `${r} km`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="spots-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Top Bar: Location radar, Distance radius filter & Qualified View Progress */}
      <div className="spots-top-gradient" />
      
      <div className="qualified-view-indicator">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          {/* Distance Filter Button */}
          <button
            onClick={() => setShowRadiusSheet(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Compass size={13} color="var(--brand-primary)" />
            <span>Spots Radius: {radiusKm === 100 ? 'City' : `${radiusKm}km`}</span>
            <ChevronDown size={12} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
                setIsMuted(videoRef.current.muted);
              }
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#ffffff',
              padding: '5px',
              borderRadius: '50%',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* 3s / 50% Anti-Fraud Monetization Progress Bar */}
        <div className="qualified-progress-track">
          <div
            className="qualified-progress-fill"
            style={{
              width: `${isQualifiedView ? 100 : watchProgress}%`,
              background: isQualifiedView ? '#10b981' : 'var(--brand-gradient)'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <div className={`qualified-view-tag ${isQualifiedView ? 'verified' : ''}`}>
            {isQualifiedView ? (
              <>
                <CheckCircle2 size={11} color="#ffffff" />
                <span>Verified View Recorded (+₹0.52 Creator Payout)</span>
              </>
            ) : (
              <span>Anti-fraud view verification: {Math.round(watchProgress)}%</span>
            )}
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px', fontWeight: 600 }}>
            {currentIndex + 1} / {posts.length}
          </span>
        </div>
      </div>

      {/* 2. Main Reel Video Surface */}
      <div className="spots-slider" onClick={handleVideoAreaClick}>
        <div className="spots-slide">
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
        {/* Creator Identity */}
        <div className="spots-creator-row">
          <img
            src={currentPost.creatorAvatar}
            alt={currentPost.creatorName}
            className="spots-creator-avatar"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                @{currentPost.creatorHandle}
              </span>
              {currentPost.creatorVerified && (
                <CheckCircle2 size={13} color="var(--brand-primary)" fill="#ffffff" />
              )}
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)' }}>
              Verified Citizen Reporter
            </span>
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
        </div>

        {/* Location & Category Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: 'rgba(255, 69, 0, 0.85)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            <MapPin size={11} />
            <span>
              {currentPost.distanceKm !== undefined
                ? formatDistance(currentPost.distanceKm)
                : currentPost.location.neighborhood || currentPost.location.placeName}
            </span>
          </div>
          <span
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {currentPost.category}
          </span>
          {currentPost.adminReviewStatus === 'bounty_awarded' && (
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Award size={11} />
              <span>Admin Bounty Paid: ₹{currentPost.adminBountyAwarded || 1000}</span>
            </span>
          )}
          {currentPost.adminReviewStatus === 'verified_approved' && (
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.9)',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <CheckCircle2 size={11} />
              <span>Admin Verified & Paid: ₹{currentPost.adminPayoutAmount || 850}</span>
            </span>
          )}
        </div>

        {/* Headline */}
        <h2 className="spots-headline">{currentPost.headline}</h2>

        {/* Caption (Expandable) */}
        <p
          className={`spots-caption ${captionExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setCaptionExpanded(!captionExpanded);
          }}
        >
          {currentPost.caption}
        </p>

        {/* Source citation */}
        {currentPost.sourceCitation && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              marginTop: '4px'
            }}
          >
            <ShieldCheck size={11} />
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

      {/* 8. Distance Radius Filter Sheet */}
      {showRadiusSheet && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowRadiusSheet(false)}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '16px' }}
          >
            <div className="sheet-handle-bar" />
            <div className="bottom-sheet-header">
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Spots Hyperlocal Radius</h3>
              <button
                onClick={() => setShowRadiusSheet(false)}
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Done
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '10px 0 14px' }}>
              Filter video reels by proximity to your current location:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {([1, 5, 25, 100] as RadiusFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onSelectRadius(r);
                    setShowRadiusSheet(false);
                  }}
                  style={{
                    padding: '12px 0',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    background: radiusKm === r ? 'var(--brand-gradient)' : '#f8fafc',
                    color: radiusKm === r ? '#ffffff' : 'var(--text-primary)',
                    border: radiusKm === r ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  {r === 100 ? 'My City' : `${r}km`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
