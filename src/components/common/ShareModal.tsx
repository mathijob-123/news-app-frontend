import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send, Share2, ExternalLink } from 'lucide-react';
import type { VideoPost } from '../../types';

interface ShareModalProps {
  post: VideoPost;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Use production URL if in dev or standalone scheme, or current origin
  const baseUrl = typeof window !== 'undefined' && (window.location.origin.includes('localhost') || window.location.protocol.includes('capacitor'))
    ? 'https://news-app-backend-mathis-projects-a3546874.vercel.app'
    : window.location.origin;

  const shareUrl = `${baseUrl}?post=${encodeURIComponent(post.id)}`;
  const shareTitle = post.headline || 'Spotlight360 Ground Report';
  const locationText = post.location?.placeName || post.location?.neighborhood || 'Chennai & Tiruvallur';
  const shareMessage = `🔴 Spotlight360 Ground Report: ${shareTitle} (${locationText})\n\nWatch and verify local updates here:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
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
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🔴 Spotlight360: ${shareTitle} (${locationText})`)}`;
    window.open(tgUrl, '_blank');
    onClose();
  };

  const handleShareTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔴 Spotlight360 Ground Report: ${shareTitle}`)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twUrl, '_blank');
    onClose();
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '80vh',
          background: '#ffffff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 18px 28px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.18)'
        }}
      >
        <div className="sheet-handle-bar" style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '4px', margin: '0 auto 14px' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}
            >
              <Share2 size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Share News Report
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                Broadcast ground truth to your community
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
            marginBottom: '18px',
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

        {/* Share Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {/* WhatsApp */}
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
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#25d366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
              }}
            >
              <MessageSquare size={24} />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>WhatsApp</span>
          </button>

          {/* Telegram */}
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
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#0088cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 136, 204, 0.35)'
              }}
            >
              <Send size={22} style={{ transform: 'translateX(-1px)' }} />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>Telegram</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleShareTwitter}
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
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3)'
              }}
            >
              <ExternalLink size={20} />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>X / Twitter</span>
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
                width: '52px',
                height: '52px',
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
              {copied ? <Check size={22} /> : <Copy size={20} />}
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: copied ? '#059669' : '#334155' }}>
              {copied ? 'Copied!' : 'Copy Link'}
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
              maxWidth: '240px'
            }}
          >
            {shareUrl}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: copied ? '#059669' : 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {copied ? (
              <>
                <Check size={12} /> Copied!
              </>
            ) : (
              <>
                <Copy size={12} /> Tap to Copy
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
