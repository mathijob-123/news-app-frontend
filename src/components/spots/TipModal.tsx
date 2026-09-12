import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoPost } from '../../types';

interface TipModalProps {
  post: VideoPost;
  onClose: () => void;
  onSendTip: (amount: number) => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  post,
  onClose,
  onSendTip
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTip = () => {
    onSendTip(amount);
    setIsSuccess(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4500', '#f97316', '#ef4444', '#10b981']
    });
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '20px' }}
      >
        <div className="sheet-handle-bar" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Tip Local Citizen Reporter (₹)</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              நன்றி! Thank you for supporting citizen news!
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your ₹{amount.toLocaleString('en-IN')} tip has been credited directly via UPI to @{post.creatorHandle}.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img
                src={post.creatorAvatar}
                alt={post.creatorName}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{post.creatorName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Verified Citizen Reporter • {post.location.neighborhood || 'North Tamil Nadu Bureau'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Direct UPI micro-tips empower independent reporters across Chennai & Tiruvallur to document real-time breaking alerts. 100% goes to the creator.
            </p>

            {/* Quick INR Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  style={{
                    padding: '10px 0',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '14px',
                    background: amount === amt ? 'var(--brand-gradient)' : '#f8fafc',
                    color: amount === amt ? '#ffffff' : 'var(--text-primary)',
                    border: amount === amt ? 'none' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={handleTip}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <span>Send ₹{amount.toLocaleString('en-IN')} Tip via UPI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
