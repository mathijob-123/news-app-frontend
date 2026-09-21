import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  Send,
  HelpCircle
} from 'lucide-react';
import type { VideoPost, CopyrightReport } from '../../types';
import { apiClient } from '../../services/apiClient';

interface CopyrightReportModalProps {
  post: VideoPost;
  onClose: () => void;
  currentUser?: { id: string; displayName: string; email?: string } | null;
  onSuccess?: (report: CopyrightReport) => void;
}

export const CopyrightReportModal: React.FC<CopyrightReportModalProps> = ({
  post,
  onClose,
  currentUser,
  onSuccess
}) => {
  const [claimantName, setClaimantName] = useState(currentUser?.displayName || '');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantRelation, setClaimantRelation] = useState<'owner' | 'authorized_agent'>('owner');
  const [originalWorkTitle, setOriginalWorkTitle] = useState('');
  const [originalWorkUrl, setOriginalWorkUrl] = useState('');
  const [infringementType, setInfringementType] = useState<'full_video' | 'audio_track' | 'visual_clip' | 'thumbnail'>('visual_clip');
  const [infringementTimestamp, setInfringementTimestamp] = useState('00:00 - 00:30');
  const [description, setDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<CopyrightReport | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!claimantName.trim()) {
      setError('Please provide your legal name or the copyright holder name.');
      return;
    }
    if (!claimantEmail.trim() || !claimantEmail.includes('@')) {
      setError('Please provide a valid official contact email address.');
      return;
    }
    if (!originalWorkTitle.trim()) {
      setError('Please specify the title or name of the original copyrighted work.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setError('Please provide a detailed explanation of the infringement (at least 20 characters).');
      return;
    }
    if (!agreedToTerms) {
      setError('You must confirm the good-faith legal declaration before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Partial<CopyrightReport> = {
        postId: post.id,
        reporterUserId: currentUser?.id,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim().toLowerCase(),
        claimantRelation,
        originalWorkTitle: originalWorkTitle.trim(),
        originalWorkUrl: originalWorkUrl.trim() || undefined,
        infringementType,
        infringementTimestamp: infringementTimestamp.trim() || undefined,
        description: description.trim()
      };

      const result = await apiClient.submitCopyrightReport(payload);
      setSubmittedReport(result);
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to submit copyright claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 2100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171'
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Submit Copyright Takedown Notice
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Spotlight360 Legal Protection & DMCA Infringement Claim
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {submittedReport ? (
          /* Confirmation State */
          <div style={{ padding: '32px 24px', textAlign: 'center', overflowY: 'auto' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Copyright Claim Filed Successfully
            </h4>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              Your copyright infringement notification has been submitted to the Spotlight Bureau Desk.
              Our legal moderation team will audit the reported footage against your original work.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'left',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '24px'
              }}
            >
              <div><strong>Claim Reference:</strong> <code style={{ color: '#ea580c' }}>{submittedReport.id}</code></div>
              <div><strong>Reported Dispatch:</strong> {submittedReport.postTitle}</div>
              <div><strong>Claimant:</strong> {submittedReport.claimantName} ({submittedReport.claimantEmail})</div>
              <div><strong>Original Work:</strong> {submittedReport.originalWorkTitle}</div>
              <div><strong>Status:</strong> <span style={{ color: '#ea580c', fontWeight: 700 }}>Under Bureau Investigation</span></div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close & Return to Feed
            </button>
          </div>
        ) : (
          /* Report Submission Form */
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Target Post Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '10px 14px'
              }}
            >
              <img
                src={post.thumbnailUrl || post.mediaUrl}
                alt={post.headline}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  background: '#0f172a'
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                  Target Content to Report
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {post.headline}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Reported by: @{post.creatorHandle} • {post.category}
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#b91c1c',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Claimant Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Your Legal Full Name *
                </label>
                <input
                  type="text"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Contact Email Address *
                </label>
                <input
                  type="email"
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  placeholder="legal@yournetwork.com"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Relation to work */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Relationship to Copyrighted Work *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="claimantRelation"
                    checked={claimantRelation === 'owner'}
                    onChange={() => setClaimantRelation('owner')}
                  />
                  <span>I am the original copyright owner</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="claimantRelation"
                    checked={claimantRelation === 'authorized_agent'}
                    onChange={() => setClaimantRelation('authorized_agent')}
                  />
                  <span>I am an authorized legal representative</span>
                </label>
              </div>
            </div>

            {/* Original Work Title & Proof */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Title of Original Copyrighted Work *
              </label>
              <input
                type="text"
                value={originalWorkTitle}
                onChange={(e) => setOriginalWorkTitle(e.target.value)}
                placeholder="e.g. Thanthi TV Ground Coverage - Koyambedu Flood"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Link to Original Work / Proof of Rights (Optional)
              </label>
              <input
                type="url"
                value={originalWorkUrl}
                onChange={(e) => setOriginalWorkUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://news.domain.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Infringement Specifics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Infringement Scope *
                </label>
                <select
                  value={infringementType}
                  onChange={(e) => setInfringementType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                >
                  <option value="visual_clip">Visual Video Clip / Footage</option>
                  <option value="full_video">Entire Video Content</option>
                  <option value="audio_track">Audio Track / Commentary</option>
                  <option value="thumbnail">Thumbnail / Still Image</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Timestamps of Infringement
                </label>
                <input
                  type="text"
                  value={infringementTimestamp}
                  onChange={(e) => setInfringementTimestamp(e.target.value)}
                  placeholder="e.g. 00:10 - 00:35 or Entire"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Explanation of Infringement *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain clearly why this citizen dispatch infringes your copyrights without permission or license..."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Legal Good-Faith Declaration */}
            <div
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <input
                type="checkbox"
                id="legalAgree"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#ea580c', cursor: 'pointer' }}
              />
              <label
                htmlFor="legalAgree"
                style={{ fontSize: '11px', color: '#7c2d12', lineHeight: 1.45, cursor: 'pointer' }}
              >
                <strong>Good-Faith Legal Declaration:</strong> I have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law. I swear, under penalty of perjury, that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the owner.
              </label>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '11px 18px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Filing Legal Claim...' : 'Submit Takedown Notice'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
