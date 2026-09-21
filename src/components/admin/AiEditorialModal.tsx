import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  XCircle,
  AlertTriangle,
  MapPin,
  Tag,
  DollarSign,
  TrendingUp,
  Award,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Film,
  Globe
} from 'lucide-react';
import type { SocialMediaPost, NewsCategory } from '../../types';
import { formatINR } from '../../services/monetizationEngine';
import { PlatformIcon } from './PlatformIcon';

interface AiEditorialModalProps {
  post: SocialMediaPost;
  onClose: () => void;
  onApprovePublish: (id: string, editorialData: any) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onAiEnhance: (id: string, customPrompt?: string) => Promise<SocialMediaPost>;
}

export const AiEditorialModal: React.FC<AiEditorialModalProps> = ({
  post,
  onClose,
  onApprovePublish,
  onReject,
  onAiEnhance
}) => {
  const [headline, setHeadline] = useState(post.aiHeadline || post.rawTitle);
  const [summary, setSummary] = useState(post.aiSummary || post.rawContent);
  const [category, setCategory] = useState<NewsCategory>(post.aiCategory || 'civic');
  const [landmark, setLandmark] = useState(post.aiLocation?.placeName || 'Chennai Hub');
  const [neighborhood, setNeighborhood] = useState(post.aiLocation?.neighborhood || 'Chennai Central');
  const [district, setDistrict] = useState(post.aiLocation?.district || 'Chennai');
  const [lat, setLat] = useState<number>(post.aiLocation?.lat || 13.0827);
  const [lng, setLng] = useState<number>(post.aiLocation?.lng || 80.2707);
  const [radiusMeters, setRadiusMeters] = useState<number>(post.aiLocation?.radiusMeters || 4000);
  const [priceAward, setPriceAward] = useState<number>(100);
  const [rpmRate, setRpmRate] = useState<number>(350);
  const [isBreaking, setIsBreaking] = useState<boolean>(false);
  const [citation, setCitation] = useState<string>(`Official Dispatch: ${post.sourceName} (${post.sourceHandle})`);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingMode, setRejectingMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Duplicate or unverified information');

  // Trigger AI enrichment
  const handleTriggerAiEnrich = async () => {
    setIsAiLoading(true);
    try {
      const updated = await onAiEnhance(post.id);
      if (updated) {
        if (updated.aiHeadline) setHeadline(updated.aiHeadline);
        if (updated.aiSummary) setSummary(updated.aiSummary);
        if (updated.aiCategory) setCategory(updated.aiCategory);
        if (updated.aiLocation?.placeName) setLandmark(updated.aiLocation.placeName);
        if (updated.aiLocation?.neighborhood) setNeighborhood(updated.aiLocation.neighborhood);
      }
    } catch (err) {
      console.error('AI Enhance error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmPublish = async () => {
    setIsSubmitting(true);
    try {
      await onApprovePublish(post.id, {
        headline,
        caption: summary,
        category,
        location: {
          placeName: landmark,
          neighborhood,
          district,
          lat,
          lng,
          radiusMeters
        },
        priceAward,
        rpmRate,
        isBreaking,
        sourceCitation: citation,
        reviewerDesk: 'Bureau Editorial Desk'
      });
      onClose();
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(post.id, rejectionReason);
      onClose();
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformIcon = () => {
    return <PlatformIcon platform={post.platform} size={14} />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '94vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(234, 88, 12, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 88, 12, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
                  AI Editorial Review & Calibrate (AI செய்தி திருத்தம் & மறுவடிவமைப்பு)
                </h2>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    textTransform: 'uppercase'
                  }}
                >
                  {getPlatformIcon()}
                  <span>{post.platform}</span>
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                From {post.sourceName} ({post.sourceHandle}) • Staged Dispatch ID: {post.id}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Duplicate warning alert if duplicate */}
          {post.isDuplicate && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fca5a5' }}>
                  ⚠️ நகல் கண்டறியப்பட்டது (Duplicate Detected • {post.duplicateScore}% Match)
                </div>
                <div style={{ fontSize: '11px', color: '#fed7aa', marginTop: '2px' }}>
                  ஏற்கனவே உள்ள செய்தி: <em>"{post.duplicateMatchedTitle}"</em> (Post Ref: #{post.duplicateMatchedPostId})
                </div>
              </div>
            </div>
          )}

          {/* Side-by-side or Top-bottom: Raw Dispatch vs AI Refined Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* LEFT COLUMN: RAW SOCIAL DISPATCH */}
            <div
              style={{
                background: '#090d16',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                  Original Raw Dispatch (அசல் சமூகப் பதிவு)
                </span>
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  <ExternalLink size={12} />
                  <span>View Source</span>
                </a>
              </div>

              {/* Media Preview Box */}
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#000000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {post.mediaType === 'video' || post.mediaUrl?.match(/\.(mp4|webm|mov)/i) ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    poster={post.thumbnailUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={post.mediaUrl || post.thumbnailUrl}
                    alt="Social media visual"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {getPlatformIcon()}
                  <span>{post.mediaType.toUpperCase()}</span>
                </span>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Raw Title:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
                  {post.rawTitle}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Raw Content:</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  {post.rawContent}
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span>Published: {new Date(post.publishedAt).toLocaleString()}</span>
                <span>Imported: {new Date(post.importedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: AI ENHANCED NEWS EDITOR */}
            <div
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '14px',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#38bdf8" />
                  <span>AI Cleansed News (AI மறுவடிவமைத்த செய்தி)</span>
                </span>

                <button
                  type="button"
                  onClick={handleTriggerAiEnrich}
                  disabled={isAiLoading}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: isAiLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{isAiLoading ? 'Regenerating...' : '✨ AI Re-write'}</span>
                </button>
              </div>

              {/* 1. Tamil Headline */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Catchy Tamil News Headline (செய்தித் தலைப்பு)
                </label>
                <textarea
                  rows={2}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter clean, factual Tamil headline..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: 1.4,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 2. Narrative Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                  Journalistic Summary Narrative (செய்தி சுருக்கம்)
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter 50-70 words structured summary..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 3. Category & Breaking Switch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                    Category (பிரிவு)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NewsCategory)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  >
                    <option value="civic">Civic (குடிமை)</option>
                    <option value="traffic">Traffic (போக்குவரத்து)</option>
                    <option value="weather">Weather (வானிலை & மழை)</option>
                    <option value="crime">Crime (குற்றம்)</option>
                    <option value="community">Community (சமூகம்)</option>
                  </select>
                </div>

                <div
                  onClick={() => setIsBreaking(!isBreaking)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isBreaking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: isBreaking ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} color={isBreaking ? '#ef4444' : '#94a3b8'} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isBreaking ? '#ef4444' : '#cbd5e1' }}>
                      Breaking News
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={() => {}}
                    style={{ accentColor: '#ef4444' }}
                  />
                </div>
              </div>

              {/* 4. Geotag Landmark & Neighborhood */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                    Landmark / Place (குறிப்பிட்ட இடம்)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
                    Ward / Neighborhood (பகுதி / மண்டலம்)
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 5. Economics: Price Award & RPM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Price Award (பரிசு)</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
                    {formatINR(priceAward)}
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Allocated RPM (1k views)</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    ₹{rpmRate} / 1k
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Rejection Form Drawer (if admin clicks Reject) */}
          {rejectingMode && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fca5a5' }}>
                Provide reason for rejecting this social dispatch:
              </div>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <option value="Duplicate or duplicate video footage">Duplicate or duplicate video footage (நகல் பதிவு)</option>
                <option value="Outside Chennai & Tiruvallur coverage zone">Outside Chennai & Tiruvallur coverage zone (பகுதிக்கு வெளியே)</option>
                <option value="Unverified facts / misleading claim">Unverified facts / misleading claim (உறுதிப்படுத்தப்படாத தகவல்)</option>
                <option value="Violates community news standards">Violates community news standards (கொள்கை மீறல்)</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRejectingMode(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '12px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection (நிராகரி)'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            Close (மூடு)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!rejectingMode && (
              <button
                type="button"
                onClick={() => setRejectingMode(true)}
                disabled={isSubmitting}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                <XCircle size={15} />
                <span>Reject (நிராகரி)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmPublish}
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <span>Publishing to News Feed...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Approve & Publish News (ஒப்புதல் அளித்து வெளியிடு)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
