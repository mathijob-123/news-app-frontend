import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Flag,
  ChevronDown,
  ShieldCheck,
  Compass,
  Camera,
  Loader2,
  RotateCw,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import type { VideoPost, User, LocationCoordinates } from '../../types';
import { isWatchQualified } from '../../services/monetizationEngine';
import { recordQualifiedView, isCrypticHash, getCleanHeadline } from '../../services/storageService';
import { CommentsDrawer } from './CommentsDrawer';

interface SpotsPlayerProps {
  posts: VideoPost[];
  initialPostId?: string;
  isPaused?: boolean;
  currentUser: User;
  activeLocation?: LocationCoordinates;
  onOpenLocationPicker?: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (post: VideoPost) => void;
  onAddComment: (postId: string, text: string) => void;
  getCommentsForPost: (postId: string) => any[];
  onOpenCreate?: () => void;
  onReportCopyright?: (post: VideoPost) => void;
  onVideoWatched?: (postId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onBack?: () => void;
}

interface ReelCardProps {
  post: VideoPost;
  index: number;
  isActive: boolean;
  isPaused?: boolean;
  isNear: boolean;
  shouldPreloadNext?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onAutoMuted?: () => void;
  onActiveReady?: () => void;
  onSkipNext?: () => void;
  currentUser: User;
  activeLocation?: LocationCoordinates;
  onOpenLocationPicker?: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (post: VideoPost) => void;
  onOpenComments: (post: VideoPost) => void;
  onReportCopyright?: (post: VideoPost) => void;
  onVideoWatched?: (postId: string) => void;
  isFollowed: boolean;
  onToggleFollow: (creatorId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isSwipingRef?: React.MutableRefObject<boolean>;
}

const VERIFIED_CDN_VIDEOS = [
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789997093458_sk5cm0.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789996953775_f7x7uj.mp4',
  'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789995126975_l0csk7.mp4'
];

const resolveVideoSrc = (rawUrl?: string, index: number = 0) => {
  if (
    !rawUrl ||
    rawUrl.includes('commondatastorage.googleapis.com')
  ) {
    return VERIFIED_CDN_VIDEOS[index % VERIFIED_CDN_VIDEOS.length];
  }
  return rawUrl;
};

const ReelCard: React.FC<ReelCardProps> = ({
  post,
  index,
  isActive,
  isPaused = false,
  isNear,
  shouldPreloadNext = false,
  isMuted,
  onToggleMute,
  onAutoMuted,
  onActiveReady,
  onSkipNext,
  currentUser,
  activeLocation,
  onOpenLocationPicker,
  onLike,
  onSave,
  onShare,
  onOpenComments,
  onReportCopyright,
  onVideoWatched,
  isFollowed,
  onToggleFollow,
  onRefresh,
  isRefreshing,
  isSwipingRef
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [playbackErrorDetail, setPlaybackErrorDetail] = useState<'format' | 'network' | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isQualifiedView, setIsQualifiedView] = useState(false);

  const videoSrc = useMemo(() => {
    return resolveVideoSrc(post.mediaUrl, index);
  }, [post.mediaUrl, index]);

  const creatorAvatarUrl = useMemo(() => {
    return (
      post.creatorAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        post.creatorName || 'Reporter'
      )}`
    );
  }, [post.creatorAvatar, post.creatorName]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<number>(0);
  const prevActiveRef = useRef(false);
  const prevSrcRef = useRef<string>(videoSrc);
  const watchedReportedRef = useRef(false);
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallRetriedRef = useRef(false);
  const isBufferingRef = useRef(false);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const isEndedRef = useRef(isEnded);
  isEndedRef.current = isEnded;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const scheduleBufferingIndicator = useCallback(() => {
    if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    bufferingTimerRef.current = setTimeout(() => {
      if (isActiveRef.current && !isPausedRef.current && !isEndedRef.current) {
        const v = videoRef.current;
        if (v && (v.readyState < 2 || v.paused)) {
          isBufferingRef.current = true;
          setIsBuffering(true);
        }
      }
    }, 300);
  }, []);

  const clearBufferingIndicator = useCallback(() => {
    if (bufferingTimerRef.current) {
      clearTimeout(bufferingTimerRef.current);
      bufferingTimerRef.current = null;
    }
    if (isBufferingRef.current) {
      isBufferingRef.current = false;
    }
    setIsBuffering(false);
  }, []);

  useEffect(() => {
    return () => {
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    watchedReportedRef.current = false;
  }, [post.id]);

  // Reset error state and reload element cleanly if the underlying videoSrc changes
  useEffect(() => {
    if (prevSrcRef.current !== videoSrc) {
      prevSrcRef.current = videoSrc;
      stallRetriedRef.current = false;
      setHasPlaybackError(false);
      setPlaybackErrorDetail(null);
      setHasFirstFrame(false);
      setIsEnded(false);
      if (videoRef.current) {
        try {
          videoRef.current.load();
        } catch {
          // Safely ignore load interruption
        }
      }
    }
  }, [videoSrc]);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActiveRef.current || isPausedRef.current) return;

    video.volume = 1;
    video.muted = isMutedRef.current;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          clearBufferingIndicator();
          setHasPlaybackError(false);
          if (video.readyState >= 2) {
            setHasFirstFrame(true);
          }
          onActiveReady?.();
        })
        .catch((err) => {
          // Ignore transient AbortError when source swaps or rapid scroll occurs
          if (err?.name === 'AbortError') {
            return;
          }
          console.warn('[SpotsPlayer ReelCard Autoplay Notice]:', err);
          if (videoRef.current && !videoRef.current.muted && isActiveRef.current && !isPausedRef.current) {
            videoRef.current.muted = true;
            onAutoMuted?.();
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                clearBufferingIndicator();
                if (videoRef.current && videoRef.current.readyState >= 2) {
                  setHasFirstFrame(true);
                }
                onActiveReady?.();
              })
              .catch(() => {
                setIsPlaying(false);
                clearBufferingIndicator();
              });
          } else {
            setIsPlaying(false);
            clearBufferingIndicator();
          }
        });
    }
  }, [onAutoMuted, onActiveReady, clearBufferingIndicator]);

  // Handle Play/Pause when entering or leaving active view or when paused by modal
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPaused) {
      video.muted = isMuted;
      setIsEnded(false);
      stallRetriedRef.current = false;

      if (video.readyState >= 2) {
        setHasFirstFrame(true);
        clearBufferingIndicator();
      } else {
        scheduleBufferingIndicator();
      }

      if (!prevActiveRef.current) {
        try {
          if (video.readyState >= 1) {
            video.currentTime = 0;
          }
        } catch {
          // Safely ignore if metadata is still initializing
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '0%';
        }
        setIsQualifiedView(false);
      }
      prevActiveRef.current = true;

      attemptPlay();
    } else {
      video.pause();
      setIsPlaying(false);
      clearBufferingIndicator();
      setCaptionExpanded(false);
      setIsEnded(false);
      if (!isActive) {
        prevActiveRef.current = false;
        try {
          if (video.readyState >= 1) {
            video.currentTime = 0;
          }
        } catch {
          // Safely ignore
        }
      }
    }
  }, [isActive, isPaused, videoSrc, attemptPlay, scheduleBufferingIndicator, clearBufferingIndicator]);

  // Watchdog: if an active video stalls > 6s on mobile without advancing, retry connection once automatically
  useEffect(() => {
    if (!isActive || isPaused || isPlaying || isEnded || hasPlaybackError) return;

    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (!video || !isActiveRef.current || isPausedRef.current) return;
      if (video.readyState < 2 && !stallRetriedRef.current) {
        stallRetriedRef.current = true;
        try {
          video.load();
          attemptPlay();
        } catch {
          // ignore
        }
      } else if (video.readyState < 2 && stallRetriedRef.current) {
        clearBufferingIndicator();
        if (video.error) {
          const isFormatErr = video.error.code === 3 || video.error.code === 4 || /\.mov(\?|$)/i.test(videoSrc);
          setPlaybackErrorDetail(isFormatErr ? 'format' : 'network');
          setHasPlaybackError(true);
        }
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [isActive, isPaused, isPlaying, isEnded, hasPlaybackError, attemptPlay, clearBufferingIndicator]);

  // Listen for global pause-all-videos broadcast (e.g. when CreateModal opens)
  useEffect(() => {
    const handlePauseAll = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('lp:pause-all-videos', handlePauseAll);
    return () => {
      window.removeEventListener('lp:pause-all-videos', handlePauseAll);
    };
  }, []);

  // Sync mute state dynamically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Time update tracking for watch progress & monetization qualification
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    if (isBufferingRef.current) {
      clearBufferingIndicator();
    }
    if (!hasFirstFrame && videoRef.current.readyState >= 2) {
      setHasFirstFrame(true);
    }
    if (isQualifiedView) return;
    const current = videoRef.current.currentTime;
    const duration = post.durationSeconds || 15;
    const thresholdSeconds = Math.min(3, Math.max(1, duration * 0.5));
    const rawProgress = Math.min(100, (current / thresholdSeconds) * 100);

    // Direct DOM update: zero component re-renders during video playback
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${rawProgress}%`;
    }

    // Engagement mark: only reported ONCE per video view
    if ((current >= 2 || isWatchQualified(current, duration)) && !watchedReportedRef.current) {
      watchedReportedRef.current = true;
      onVideoWatched?.(post.id);
    }

    if (isWatchQualified(current, duration)) {
      setIsQualifiedView(true);
      recordQualifiedView(post.id);
    }
  };

  // Replay video when ended
  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setIsEnded(false);
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch(() => {});
  };

  // Double tap to like or single tap to toggle play/pause
  const handleCardClick = (e: React.MouseEvent) => {
    if (isSwipingRef?.current) return;
    const target = e.target as HTMLElement;
    if (
      target.closest('.spots-action-rail') ||
      target.closest('.spots-overlay-content') ||
      target.closest('button') ||
      target.closest('.spots-follow-btn')
    ) {
      return;
    }

    if (isEnded) {
      handleReplay(e);
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        onLike(post.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 750);
    } else {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }
    lastTapRef.current = now;
  };

  const isPhotoPost =
    post.type === 'image' ||
    (Boolean(post.mediaUrl) &&
      !post.mediaUrl.match(/\.(mp4|webm|mov|m4v|ogg)/i) &&
      Boolean(post.mediaUrl.match(/\.(jpe?g|png|gif|webp|avif|bmp|svg)/i)));

  return (
    <div
      className="spots-reel-card"
      data-index={index}
      onClick={handleCardClick}
    >
      {/* 1. Media Element */}
      {isPhotoPost ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              backgroundImage: `url(${post.mediaUrl || post.thumbnailUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px) brightness(0.4)',
              transform: 'scale(1.15)',
              opacity: 0.7
            }}
          />
          <img
            src={post.mediaUrl || post.thumbnailUrl}
            alt={post.headline}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block'
            }}
          />
        </div>
      ) : isNear ? (
        <div className="spots-media-wrapper">
          {post.thumbnailUrl && (
            <div
              className="spots-media-ambient-blur"
              style={{
                backgroundImage: `url(${post.thumbnailUrl})`
              }}
            />
          )}
          {post.thumbnailUrl && !hasFirstFrame && (
            <img
              src={post.thumbnailUrl}
              alt={post.headline}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          )}
          <video
            ref={videoRef}
            src={videoSrc}
            poster={post.thumbnailUrl}
            playsInline
            preload={isActive ? 'auto' : shouldPreloadNext ? 'auto' : 'none'}
            muted={isMuted}
            onLoadedData={() => {
              setHasFirstFrame(true);
              clearBufferingIndicator();
              if (isActiveRef.current && !isPausedRef.current && !isEndedRef.current && videoRef.current?.paused) {
                attemptPlay();
              }
            }}
            onPlay={() => {
              setIsPlaying(true);
              clearBufferingIndicator();
              setIsEnded(false);
              setHasPlaybackError(false);
            }}
            onPause={() => setIsPlaying(false)}
            onPlaying={() => {
              setIsPlaying(true);
              setHasFirstFrame(true);
              clearBufferingIndicator();
              setIsEnded(false);
              setHasPlaybackError(false);
              onActiveReady?.();
            }}
            onWaiting={() => scheduleBufferingIndicator()}
            onStalled={() => {
              if (isActiveRef.current && !isPausedRef.current) {
                scheduleBufferingIndicator();
              }
            }}
            onCanPlay={() => {
              setHasFirstFrame(true);
              clearBufferingIndicator();
              onActiveReady?.();
              if (isActiveRef.current && !isPausedRef.current && !isEndedRef.current && videoRef.current?.paused) {
                attemptPlay();
              }
            }}
            onEnded={() => {
              setIsEnded(true);
              setIsPlaying(false);
              clearBufferingIndicator();
            }}
            onTimeUpdate={handleTimeUpdate}
            onError={(e) => {
              const errCode = e.currentTarget.error?.code;
              const isFormatErr = errCode === 3 || errCode === 4 || /\.mov(\?|$)/i.test(videoSrc);
              setPlaybackErrorDetail(isFormatErr ? 'format' : 'network');
              setHasPlaybackError(true);
              clearBufferingIndicator();
            }}
            className="spots-video"
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: post.thumbnailUrl
              ? `url(${post.thumbnailUrl}) center/cover no-repeat`
              : '#0a0a0a'
          }}
        />
      )}

      {/* Top Gradient for header clarity */}
      <div className="spots-top-gradient" />

      {/* Qualified View Progress Bar */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 'max(0px, env(safe-area-inset-top, 0px))',
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.2)',
            zIndex: 40
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: '100%',
              width: '0%',
              background: 'var(--brand-gradient)',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}

      {/* Buffering Loading Spinner */}
      {isBuffering && isActive && !isEnded && (
        <div className="spots-loader-overlay">
          <Loader2 size={28} color="#ff4500" className="spin" />
        </div>
      )}

      {/* Pause Icon Indicator */}
      {!isPlaying && !isBuffering && !isEnded && isActive && (
        <div className="spots-play-indicator">
          <Play size={32} fill="#ffffff" style={{ marginLeft: '4px' }} />
        </div>
      )}

      {/* Replay Option When Video Ends */}
      {isEnded && isActive && !hasPlaybackError && (
        <div className="spots-replay-overlay" onClick={handleReplay}>
          <div className="spots-replay-icon-circle">
            <RotateCw size={26} color="#ffffff" />
          </div>
          <span className="spots-replay-text">
            Replay / மீண்டும் பார்க்க
          </span>
        </div>
      )}

      {/* Playback Error Notice with Retry */}
      {hasPlaybackError && isActive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 35,
            padding: '24px',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(234, 88, 12, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              border: '1px solid rgba(234, 88, 12, 0.4)'
            }}
          >
            <AlertCircle size={28} color="#ea580c" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Video Unavailable
          </h3>
          <p style={{ fontSize: '12px', color: '#a1a1aa', maxWidth: '280px', lineHeight: 1.5, marginBottom: '16px' }}>
            {playbackErrorDetail === 'format'
              ? 'This clip uses an iPhone HEVC / .MOV format not supported by this browser or WebView. You can open it externally or skip to the next reel.'
              : 'This reel could not be played. It may still be processing or had a network interruption.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                stallRetriedRef.current = false;
                setHasPlaybackError(false);
                setPlaybackErrorDetail(null);
                scheduleBufferingIndicator();
                const video = videoRef.current;
                if (video) {
                  video.load();
                  attemptPlay();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '9999px',
                background: '#ea580c',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RotateCw size={14} />
              <span>Retry Video</span>
            </button>
            {playbackErrorDetail === 'format' && (
              <a
                href={videoSrc}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  textDecoration: 'none'
                }}
              >
                <span>Open Player</span>
              </a>
            )}
            {onSkipNext && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkipNext();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <span>Next Reel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Double-tap Heart Burst */}
      {showHeartBurst && (
        <div className="spots-heart-burst">
          <Heart size={90} fill="#ff3b5c" />
        </div>
      )}

      {/* Bottom Gradient for Overlay Readability */}
      <div className="spots-bottom-gradient" />

      {/* Right Action Rail */}
      <div className="spots-action-rail">
        {/* Like */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.id);
          }}
          title={post.isLiked ? 'Unlike' : 'Like'}
          aria-label={post.isLiked ? 'Unlike' : 'Like'}
        >
          <div className={`rail-icon-circle ${post.isLiked ? 'liked' : ''}`}>
            <Heart
              size={22}
              fill={post.isLiked ? '#ffffff' : 'none'}
              color={post.isLiked ? '#ffffff' : 'currentColor'}
            />
          </div>
          <span className="rail-label">{(post.likeCount ?? 0).toLocaleString()}</span>
        </button>

        {/* Comment */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(post);
          }}
        >
          <div className="rail-icon-circle">
            <MessageCircle size={22} />
          </div>
          <span className="rail-label">{post.commentCount}</span>
        </button>

        {/* Share */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onShare(post);
          }}
        >
          <div className="rail-icon-circle">
            <Share2 size={22} />
          </div>
          <span className="rail-label">{post.shareCount}</span>
        </button>

        {/* Save */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSave(post.id);
          }}
        >
          <div className="rail-icon-circle">
            <Bookmark size={22} fill={post.isSaved ? '#ffffff' : 'none'} />
          </div>
          <span className="rail-label">Save</span>
        </button>

        {/* Sound Toggle */}
        <button
          className="rail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
        >
          <div className="rail-icon-circle">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </div>
          <span className="rail-label">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>

        {/* Report Copyright & Citizen Ethics */}
        <button
          className="rail-btn"
          title="Report copyright infringement / ethics"
          onClick={(e) => {
            e.stopPropagation();
            if (onReportCopyright) {
              onReportCopyright(post);
            } else {
              alert('Report filed with LocalPulse Citizen Ethics & Trust Board for rapid review.');
            }
          }}
        >
          <div className="rail-icon-circle" style={{ width: '34px', height: '34px' }}>
            <Flag size={15} color="rgba(255, 255, 255, 0.7)" />
          </div>
          <span className="rail-label" style={{ fontSize: '9px' }}>
            Report
          </span>
        </button>
      </div>

      {/* Bottom Overlay Content */}
      <div className="spots-overlay-content">
        {/* Creator & Follow Row */}
        <div className="spots-creator-row">
          <img
            src={creatorAvatarUrl}
            alt={post.creatorName}
            className="spots-creator-avatar"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                post.creatorName || 'Reporter'
              )}`;
            }}
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '12.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.85)'
              }}
            >
              @{post.creatorHandle}
            </span>
            {post.creatorVerified && (
              <CheckCircle2 size={12} color="var(--brand-primary)" fill="#ffffff" />
            )}
          </div>

          <button
            className="spots-follow-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(post.creatorId);
            }}
            style={{
              background: isFollowed ? 'rgba(255, 255, 255, 0.25)' : 'var(--brand-gradient)'
            }}
          >
            {isFollowed ? 'Following' : '+ Follow'}
          </button>

          {/* Inline Compact Meta Pills */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap'
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                onOpenLocationPicker?.();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255, 69, 0, 0.85)',
                padding: '1.5px 6px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 700,
                cursor: onOpenLocationPicker ? 'pointer' : 'default'
              }}
              title="Change active location"
            >
              <MapPin size={9} />
              <span>
                {post.location.neighborhood || post.location.placeName || 'Local'}
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
              {post.category}
            </span>

            {(post.adminReviewStatus === 'bounty_awarded' ||
              post.adminReviewStatus === 'verified_approved') && (
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
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Headline */}
        <h2 className="spots-headline">
          {getCleanHeadline(post.headline, post.caption, post.location.neighborhood || post.location.placeName)}
        </h2>

        {/* Caption */}
        {post.caption &&
          !isCrypticHash(post.caption) &&
          post.caption.trim() !== getCleanHeadline(post.headline, post.caption, post.location.neighborhood || post.location.placeName).trim() && (
          <p
            className={`spots-caption ${captionExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCaptionExpanded(!captionExpanded);
            }}
          >
            {post.caption}
          </p>
        )}

        {/* Source Citation */}
        {post.sourceCitation &&
          !post.sourceCitation.toLowerCase().includes('campaign') &&
          !post.sourceCitation.toLowerCase().includes('spotlight360') && (
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
            <span>{post.sourceCitation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SpotsPlayer: React.FC<SpotsPlayerProps> = ({
  posts,
  initialPostId,
  isPaused = false,
  currentUser,
  activeLocation,
  onOpenLocationPicker,
  onLike,
  onSave,
  onShare,
  onAddComment,
  getCommentsForPost,
  onOpenCreate,
  onReportCopyright,
  onVideoWatched,
  onRefresh,
  isRefreshing,
  onBack
}) => {
  // Restore saved reel index or start at index 0 (never random)
  const [activeIndex, setActiveIndex] = useState(() => {
    try {
      const saved = sessionStorage.getItem('spotlight_last_reel_index_v1');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {}
    return 0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [activeVideoReady, setActiveVideoReady] = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});
  const [activeModalPost, setActiveModalPost] = useState<VideoPost | null>(null);
  const [showComments, setShowComments] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const hasScrolledInitialRef = useRef<string | null>(null);
  const isSwipingRef = useRef(false);
  const prevLocationKeyRef = useRef<string | undefined>(undefined);
  const autoMutedByPolicyRef = useRef(false);

  // STRICTLY video / reel posts only
  const videoReels = useMemo(() => {
    return posts.filter((p) => {
      if (p.type === 'video') return true;
      if (p.mediaUrl && (p.mediaUrl.endsWith('.mp4') || p.mediaUrl.endsWith('.mov') || p.mediaUrl.endsWith('.webm') || p.mediaUrl.includes('/videos/'))) return true;
      return false;
    });
  }, [posts]);

  // Clamp activeIndex if videoReels list shrinks or reloads from server
  useEffect(() => {
    if (videoReels.length > 0 && activeIndex >= videoReels.length) {
      setActiveIndex(0);
      activeIndexRef.current = 0;
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [videoReels.length, activeIndex]);

  // Persist current active index and reset next-reel preload gate until the new active reel plays
  useEffect(() => {
    setActiveVideoReady(false);
    try {
      sessionStorage.setItem('spotlight_last_reel_index_v1', String(activeIndex));
    } catch {}
  }, [activeIndex]);

  // Scroll to saved index on initial mount if not starting from a deep link
  useEffect(() => {
    if (!initialPostId && containerRef.current && activeIndex > 0) {
      containerRef.current.scrollTo({
        top: activeIndex * containerRef.current.clientHeight,
        behavior: 'instant'
      });
    }
  }, []);

  // When location changes, reset to the first video (index 0) of the new location
  const currentLocationKey = `${activeLocation?.lat}_${activeLocation?.lng}`;
  useEffect(() => {
    if (prevLocationKeyRef.current && prevLocationKeyRef.current !== currentLocationKey) {
      setActiveIndex(0);
      activeIndexRef.current = 0;
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    prevLocationKeyRef.current = currentLocationKey;
  }, [currentLocationKey]);

  // Listen for scroll-to-top event (e.g. user taps Reels tab while already on Reels)
  useEffect(() => {
    const handleScrollTop = () => {
      if (containerRef.current) {
        setActiveIndex(0);
        activeIndexRef.current = 0;
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('lp:spots-scroll-top', handleScrollTop);
    return () => window.removeEventListener('lp:spots-scroll-top', handleScrollTop);
  }, []);

  // Set initial post and scroll to it when initialPostId changes
  useEffect(() => {
    if (initialPostId && containerRef.current && videoReels.length > 0) {
      if (hasScrolledInitialRef.current !== initialPostId) {
        hasScrolledInitialRef.current = initialPostId;
        const idx = videoReels.findIndex((p) => p.id === initialPostId);
        if (idx !== -1) {
          setActiveIndex(idx);
          activeIndexRef.current = idx;
          containerRef.current.scrollTo({
            top: idx * containerRef.current.clientHeight,
            behavior: 'instant'
          });
        }
      }
    } else if (!initialPostId) {
      hasScrolledInitialRef.current = null;
    }
  }, [initialPostId, videoReels]);

  // Unlock unmuted audio on any user gesture (e.g. button click, upload finish, tap)
  // whenever browser/WebView autoplay policy forced mute — without ever overriding a manual user mute
  useEffect(() => {
    const unlockAudio = () => {
      if (autoMutedByPolicyRef.current) {
        autoMutedByPolicyRef.current = false;
        setIsMuted(false);
        const activeVideo = containerRef.current?.querySelector(
          `[data-index="${activeIndexRef.current}"] video`
        ) as HTMLVideoElement | null;
        if (activeVideo) {
          activeVideo.volume = 1;
          activeVideo.muted = false;
          if (activeVideo.paused) {
            activeVideo.play().catch(() => {});
          }
        }
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { capture: true, passive: true });
    window.addEventListener('click', unlockAudio, { capture: true });
    window.addEventListener('lp:unlock-audio', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio, { capture: true });
      window.removeEventListener('touchstart', unlockAudio, { capture: true });
      window.removeEventListener('click', unlockAudio, { capture: true });
      window.removeEventListener('lp:unlock-audio', unlockAudio);
    };
  }, []);

  // IntersectionObserver: smoothly detects the active card when the user scrolls
  // ONLY switches activeIndex when the card is predominantly (>= 60%) visible
  // Zero automatic scrolling, zero jitter!
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.spots-reel-card');
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idxStr = entry.target.getAttribute('data-index');
            if (idxStr !== null) {
              const idx = parseInt(idxStr, 10);
              if (!isNaN(idx) && idx !== activeIndexRef.current) {
                setActiveIndex(idx);
                activeIndexRef.current = idx;
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [videoReels]);

  // Sync activeIndex immediately when scroll snap completes (mobile & desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: any = null;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const clientHeight = container.clientHeight;
        if (clientHeight > 0) {
          const snappedIdx = Math.round(container.scrollTop / clientHeight);
          if (
            snappedIdx >= 0 &&
            snappedIdx < videoReels.length &&
            snappedIdx !== activeIndexRef.current
          ) {
            setActiveIndex(snappedIdx);
            activeIndexRef.current = snappedIdx;
          }
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [videoReels.length]);

  // Desktop navigation with Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        showComments ||
        !containerRef.current
      ) {
        return;
      }

      const clientHeight = containerRef.current.clientHeight;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIdx = Math.min(videoReels.length - 1, activeIndexRef.current + 1);
        containerRef.current.scrollTo({
          top: nextIdx * clientHeight,
          behavior: 'smooth'
        });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIdx = Math.max(0, activeIndexRef.current - 1);
        containerRef.current.scrollTo({
          top: prevIdx * clientHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoReels.length, showComments]);

  // Desktop Mouse Wheel Navigation (strictly 1 video per deliberate wheel tick)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isWheelThrottled = false;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (showComments || isWheelThrottled) return;

      if (e.deltaY > 20) {
        // Scrolled down -> Next Reel slides up from bottom
        e.preventDefault();
        isWheelThrottled = true;
        const nextIdx = Math.min(videoReels.length - 1, activeIndexRef.current + 1);
        container.scrollTo({
          top: nextIdx * container.clientHeight,
          behavior: 'smooth'
        });
        setTimeout(() => {
          isWheelThrottled = false;
        }, 400);
      } else if (e.deltaY < -20) {
        // Scrolled up -> Previous Reel slides down from top
        e.preventDefault();
        isWheelThrottled = true;
        const prevIdx = Math.max(0, activeIndexRef.current - 1);
        container.scrollTo({
          top: prevIdx * container.clientHeight,
          behavior: 'smooth'
        });
        setTimeout(() => {
          isWheelThrottled = false;
        }, 400);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [videoReels.length, showComments]);

  // Touch Swipe Handlers (Instagram Reels Standard: Swipe UP = Next, Swipe DOWN = Prev)
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const isTouchActive = useRef(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (showComments) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isTouchActive.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTouchActive.current || showComments || !containerRef.current) return;
    isTouchActive.current = false;

    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaTime = Date.now() - touchStartTime.current;

    if (Math.abs(deltaY) < Math.abs(deltaX) || Math.abs(deltaY) < 30) return;

    const velocity = Math.abs(deltaY) / Math.max(deltaTime, 1);
    const isFlick = Math.abs(deltaY) > 20 && velocity > 0.25;
    const clientHeight = containerRef.current.clientHeight;

    if (deltaY < -35 || (deltaY < 0 && isFlick)) {
      // Swiped UP -> Next Reel slides up from bottom
      isSwipingRef.current = true;
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
      const nextIdx = Math.min(videoReels.length - 1, activeIndexRef.current + 1);
      containerRef.current.scrollTo({
        top: nextIdx * clientHeight,
        behavior: 'smooth'
      });
    } else if (deltaY > 35 || (deltaY > 0 && isFlick)) {
      // Swiped DOWN -> Previous Reel slides down from top
      isSwipingRef.current = true;
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
      const prevIdx = Math.max(0, activeIndexRef.current - 1);
      containerRef.current.scrollTo({
        top: prevIdx * clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Mouse Drag Handlers for Desktop Testing
  const isMouseDown = useRef(false);
  const mouseStartY = useRef(0);
  const mouseStartX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || showComments) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, .spots-action-rail, .spots-overlay-content')) return;

    isMouseDown.current = true;
    mouseStartY.current = e.clientY;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current || showComments || !containerRef.current) return;
    isMouseDown.current = false;

    const deltaY = e.clientY - mouseStartY.current;
    const deltaX = e.clientX - mouseStartX.current;

    if (Math.abs(deltaY) < Math.abs(deltaX) || Math.abs(deltaY) < 30) return;

    const clientHeight = containerRef.current.clientHeight;
    if (deltaY < -30) {
      // Dragged UP -> Next Reel slides up from bottom
      isSwipingRef.current = true;
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
      const nextIdx = Math.min(videoReels.length - 1, activeIndexRef.current + 1);
      containerRef.current.scrollTo({
        top: nextIdx * clientHeight,
        behavior: 'smooth'
      });
    } else if (deltaY > 30) {
      // Dragged DOWN -> Previous Reel slides down from top
      isSwipingRef.current = true;
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
      const prevIdx = Math.max(0, activeIndexRef.current - 1);
      containerRef.current.scrollTo({
        top: prevIdx * clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const toggleFollow = (creatorId: string) => {
    setFollowedCreators((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId]
    }));
  };

  const handleToggleMute = useCallback(() => {
    autoMutedByPolicyRef.current = false;
    setIsMuted((prev) => !prev);
  }, []);

  const handleAutoMuted = useCallback(() => {
    autoMutedByPolicyRef.current = true;
    setIsMuted(true);
  }, []);

  // Empty state: When no video reels are available for the location
  if (videoReels.length === 0) {
    const locName =
      activeLocation?.neighborhood || activeLocation?.placeName || 'your location';
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            paddingTop: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="pulse-beacon" />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}
            >
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
              <span
                style={{
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
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
              marginBottom: '18px',
              color: 'var(--brand-primary)'
            }}
          >
            <Camera size={36} />
          </div>

          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '8px'
            }}
          >
            No Reels In This Vicinity Yet
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.72)',
              lineHeight: 1.55,
              marginBottom: '22px'
            }}
          >
            {activeLocation?.placeName
              ? `There are currently no video reels published for ${
                  activeLocation.neighborhood || activeLocation.placeName
                }. Spotlight exclusively streams video dispatches from your active location.`
              : 'There are currently no video reels published for your location. Spotlight exclusively streams video dispatches from your active location.'}
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%'
            }}
          >
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

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'rgba(255, 107, 0, 0.2)',
                  border: '1px solid rgba(255, 107, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: isRefreshing ? 'wait' : 'pointer'
                }}
              >
                <RotateCw
                  size={14}
                  style={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
                <span>{isRefreshing ? 'Refreshing Videos...' : 'Refresh Videos / புதுப்பிக்கவும்'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Trust Banner */}
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
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.35
            }}
          >
            <span style={{ fontWeight: 700, color: '#ffffff' }}>Spotlight Verified:</span> Only
            high-trust video reels from your immediate vicinity are broadcast here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spots-container">
      {/* Native CSS Scroll-Snap Reel List: Natural 60fps mobile touch physics, zero shake */}
      <div
        ref={containerRef}
        className="spots-reel-list"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {videoReels.map((post, idx) => (
          <ReelCard
            key={post.id}
            post={post}
            index={idx}
            isActive={idx === activeIndex && !isPaused && !showComments}
            isPaused={isPaused || showComments}
            isNear={Math.abs(idx - activeIndex) <= 1}
            shouldPreloadNext={idx === activeIndex + 1 && activeVideoReady}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onAutoMuted={handleAutoMuted}
            onActiveReady={idx === activeIndex ? () => setActiveVideoReady(true) : undefined}
            onSkipNext={
              idx + 1 < videoReels.length
                ? () => {
                    const nextIdx = idx + 1;
                    setActiveIndex(nextIdx);
                    activeIndexRef.current = nextIdx;
                    containerRef.current?.scrollTo({
                      top: nextIdx * containerRef.current.clientHeight,
                      behavior: 'smooth'
                    });
                  }
                : undefined
            }
            currentUser={currentUser}
            activeLocation={activeLocation}
            onOpenLocationPicker={onOpenLocationPicker}
            onLike={onLike}
            onSave={onSave}
            onShare={onShare}
            onOpenComments={(p) => {
              setActiveModalPost(p);
              setShowComments(true);
            }}
            onReportCopyright={onReportCopyright}
            onVideoWatched={onVideoWatched}
            isFollowed={!!followedCreators[post.creatorId]}
            onToggleFollow={toggleFollow}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isSwipingRef={isSwipingRef}
          />
        ))}
      </div>

      {/* Floating Back Button (only shown when arrived from Feed/Search/Profile) */}
      {onBack && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          aria-label="Go Back"
          className="spots-floating-back-btn"
          style={{
            position: 'absolute',
            top: 'max(14px, calc(env(safe-area-inset-top, 0px) + 8px))',
            left: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 45,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
          }}
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Comments Drawer */}
      {showComments && activeModalPost && (
        <CommentsDrawer
          postId={activeModalPost.id}
          comments={getCommentsForPost(activeModalPost.id)}
          currentUser={currentUser}
          onClose={() => {
            setShowComments(false);
            setActiveModalPost(null);
          }}
          onAddComment={(text) => {
            onAddComment(activeModalPost.id, text);
            setActiveModalPost((prev) =>
              prev ? { ...prev, commentCount: Math.max(0, Number(prev.commentCount) || 0) + 1 } : prev
            );
          }}
        />
      )}
    </div>
  );
};
