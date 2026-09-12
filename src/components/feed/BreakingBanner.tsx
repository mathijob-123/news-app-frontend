import React, { useState } from 'react';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import type { VideoPost } from '../../types';

interface BreakingBannerProps {
  breakingPost?: VideoPost;
  onOpenPost: (post: VideoPost) => void;
}

export const BreakingBanner: React.FC<BreakingBannerProps> = ({
  breakingPost,
  onOpenPost
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!breakingPost || dismissed) return null;

  return (
    <div className="breaking-alert-banner">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
        <div style={{ color: 'var(--brand-alert)', flexShrink: 0, marginTop: '2px' }}>
          <AlertTriangle size={18} />
        </div>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onOpenPost(breakingPost)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span className="breaking-tag">Breaking Alert</span>
            <span style={{ fontSize: '11px', color: 'var(--brand-alert)', fontWeight: 700 }}>
              Near Your Location
            </span>
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#991b1b',
              lineHeight: 1.3
            }}
          >
            {breakingPost.headline}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#b91c1c',
              marginTop: '4px',
              fontWeight: 600
            }}
          >
            <span>Watch Live Reel</span>
            <ChevronRight size={13} />
          </div>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{ color: '#991b1b', padding: '2px' }}
        title="Dismiss Alert"
      >
        <X size={15} />
      </button>
    </div>
  );
};
