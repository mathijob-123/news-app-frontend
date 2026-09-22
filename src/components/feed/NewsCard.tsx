import React, { useRef, useState } from 'react';
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
  Flag
} from 'lucide-react';
import type { VideoPost } from '../../types';
import { formatDistance } from '../../services/geoService';

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

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  onLike,
  onSave,
  onOpenComments,
  onOpenSpots,
  onShare,
  onReportCopyright
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
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
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.creatorName || 'Reporter')}`;
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
      {post.type === 'video' && post.mediaUrl && (
        <div
          className="feed-media-container"
          onClick={handleVideoClick}
          style={{ cursor: 'pointer' }}
        >
          <video
            ref={videoRef}
            src={post.mediaUrl}
            poster={post.thumbnailUrl}
            muted={isMuted}
            loop
            playsInline
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="feed-media-video"
          />
          <div className="media-control-overlay">
            <button className="media-btn-pill" onClick={toggleSound}>
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isMuted ? 'Muted' : 'Audio'}</span>
            </button>
            <button className="media-btn-pill" onClick={handleVideoClick}>
              <Maximize2 size={13} />
              <span>Spots Reel</span>
            </button>
          </div>
        </div>
      )}

      {post.type === 'image' && post.mediaUrl && (
        <div className="feed-media-container" style={{ cursor: 'pointer' }} onClick={() => onOpenSpots(post)}>
          <img
            src={post.mediaUrl}
            alt={post.headline}
            className="feed-media-image"
            loading="lazy"
          />
        </div>
      )}

      {/* 3. Body: Headline, Caption, Source Citation */}
      <div className="feed-card-body">
        <h2 className="feed-headline" onClick={() => onOpenSpots(post)} style={{ cursor: 'pointer' }}>
          {post.headline}
        </h2>
        {post.caption && post.caption.trim() !== post.headline.trim() && (
          <p className="feed-caption">{post.caption}</p>
        )}

        {post.sourceCitation && (
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
