import React, { useState } from 'react';
import { X, Copy, Check, Send, Share2, Download, Video, Loader2, Link2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import type { VideoPost } from '../../types';
import { API_BASE } from '../../services/apiConfig';

interface ShareModalProps {
  post: VideoPost;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Resolves the public rich preview URL for video reels
  // Points to the backend endpoint which generates rich Open Graph video cards for WhatsApp, Instagram, Telegram, and Twitter
  const getShareUrl = () => {
    const backendOrigin = 'https://news-app-backend-mathis-projects-a3546874.vercel.app';
    return `${backendOrigin}/reel/${encodeURIComponent(post.id)}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = post.headline || 'Spotlight 360 Ground Report';
  const locationText =
    post.location?.placeName ||
    post.location?.neighborhood ||
    post.location?.district ||
    post.district ||
    'Hyperlocal Report';

  const shareMessage = `🔴 Spotlight 360 | Ground Report\n📍 Location: ${locationText}\n🎬 Headline: ${shareTitle}\n\n▶️ Watch Reel Link:\n${shareUrl}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  /**
   * Primary Share Handler: Shares the video as a link via native system share sheet or Web Share API.
   */
  const handleShareLink = async () => {
    const isNativeCapacitor =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        (window.location.hostname === 'localhost' && !window.location.port));

    // 1. Native Capacitor Share (Android & iOS APK)
    if (isNativeCapacitor) {
      try {
        await Share.share({
          title: shareTitle,
          text: shareMessage,
          url: shareUrl,
          dialogTitle: 'Share Video Link'
        });
        showToast('✓ Video link shared!');
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 2. Web Share API (Mobile Browsers)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: shareUrl
        });
        showToast('✓ Video link shared!');
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 3. Fallback: Copy Link
    await handleCopyLink();
  };

  /**
   * Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast('✓ Video link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  /**
   * Share link directly to WhatsApp
   */
  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  /**
   * Share to Instagram (Native system share sheet on mobile or copies caption + link and opens Instagram)
   */
  const handleShareInstagram = async () => {
    const isNativeCapacitor =
      typeof window !== 'undefined' &&
      (window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        (window.location.hostname === 'localhost' && !window.location.port));

    // In native Android APK, trigger system share sheet targeting Instagram Stories/Direct/Reels
    if (isNativeCapacitor) {
      try {
        await Share.share({
          title: shareTitle,
          text: shareMessage,
          url: shareUrl,
          dialogTitle: 'Share to Instagram'
        });
        showToast('✓ Video link shared!');
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Try Web Share API (Mobile Chrome / Safari)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: shareUrl
        });
        showToast('✓ Video link shared!');
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard and launch Instagram
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareMessage);
      }
    } catch {}

    showToast('✓ Link copied! Opening Instagram...');
    setTimeout(() => {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'instagram://app';
        setTimeout(() => {
          window.open('https://www.instagram.com', '_blank');
        }, 1200);
      } else {
        window.open('https://www.instagram.com', '_blank');
      }
      onClose();
    }, 500);
  };

  /**
   * Share link to Telegram
   */
  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      `🔴 Spotlight 360: ${shareTitle} (${locationText})`
    )}`;
    window.open(tgUrl, '_blank');
    onClose();
  };

  /**
   * Optional: Download the MP4 file to gallery
   */
  const handleDownloadVideo = async () => {
    try {
      setIsDownloading(true);
      const cleanHeadline = (post.headline || 'spotlight360_video')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);
      const filename = `${cleanHeadline}.mp4`;

      let blob: Blob | null = null;
      try {
        const res = await fetch(post.mediaUrl, { mode: 'cors' });
        if (res.ok) blob = await res.blob();
      } catch {}

      if (!blob || blob.size < 1000) {
        const proxyUrl = `${API_BASE}/media-download?url=${encodeURIComponent(
          post.mediaUrl
        )}&filename=${encodeURIComponent(filename)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) blob = await res.blob();
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('✓ Video downloaded successfully!');
      } else {
        window.open(post.mediaUrl, '_blank');
      }
    } catch {
      window.open(post.mediaUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '85vh',
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 18px 28px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        <div
          className="sheet-handle-bar"
          style={{
            width: '40px',
            height: '4px',
            background: '#cbd5e1',
            borderRadius: '4px',
            margin: '0 auto 14px'
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}
            >
              <Video size={18} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                Share Video Link
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                Share video link to WhatsApp, Instagram & Apps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Share Modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Post Preview Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt=""
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {shareTitle}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600 }}>
              📍 {locationText}
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION: SHARE VIDEO LINK DIRECTLY */}
        <button
          onClick={handleShareLink}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
            marginBottom: '18px',
            transition: 'all 0.2s ease'
          }}
        >
          <Share2 size={18} />
          <span>Share Video Link (WhatsApp / Apps)</span>
        </button>

        {/* Share Action Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px',
            marginBottom: '18px'
          }}
        >
          {/* WhatsApp Link */}
          <button
            onClick={handleShareWhatsApp}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
              }}
            >
              {/* WhatsApp Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>WhatsApp</span>
          </button>

          {/* Instagram Link */}
          <button
            onClick={handleShareInstagram}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background:
                  'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(220, 39, 67, 0.35)'
              }}
            >
              {/* Instagram Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Instagram</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: copied ? '#10b981' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: copied ? '#ffffff' : '#475569',
                border: copied ? 'none' : '1px solid #cbd5e1',
                boxShadow: copied ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? <Check size={21} /> : <Link2 size={21} />}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: copied ? '#059669' : '#334155'
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>

          {/* Telegram Link */}
          <button
            onClick={handleShareTelegram}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#0088cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 136, 204, 0.35)'
              }}
            >
              <Send size={21} style={{ transform: 'translateX(-1px)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Telegram</span>
          </button>

          {/* Save MP4 Video */}
          <button
            onClick={handleDownloadVideo}
            disabled={isDownloading}
            title="Download MP4 video file to device gallery"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
              }}
            >
              {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={21} />}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
              {isDownloading ? 'Saving...' : 'Save MP4'}
            </span>
          </button>
        </div>

        {/* Copy Link Direct Bar */}
        <div
          onClick={handleCopyLink}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '220px'
            }}
          >
            {shareUrl}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: copied ? '#059669' : 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? (
              <>
                <Check size={12} /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Copy Link
              </>
            )}
          </span>
        </div>

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              zIndex: 130,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check size={14} color="#10b981" />
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};