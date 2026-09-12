import React, { useState } from 'react';
import {
  X,
  Camera,
  Video,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { VideoPost, User, NewsCategory, LocationCoordinates } from '../../types';

interface CreateModalProps {
  currentUser: User;
  onClose: () => void;
  onPublishPost: (post: VideoPost) => void;
}

// Preset verified short video clips for instant testing
const SAMPLE_MEDIA_OPTIONS = [
  {
    label: 'Red Hills & GNT Road Waterlogging',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    category: 'traffic' as NewsCategory,
    defaultHeadline: 'Waterlogging at Karanodai Bridge: Heavy Vehicles Diverted via ORR'
  },
  {
    label: 'Poondi Reservoir Gate Release',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    category: 'civic' as NewsCategory,
    defaultHeadline: 'Poondi Dam Inflow Rises: WRD Releases 1,500 Cusecs into River'
  },
  {
    label: 'Avadi Kabaddi Tournament Final',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    category: 'sports' as NewsCategory,
    defaultHeadline: 'Ambattur Lions Clinch District Kabaddi Cup on Last-Second Raid'
  },
  {
    label: 'Manali Express Tow Recovery',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    category: 'safety' as NewsCategory,
    defaultHeadline: 'Manali Port Express: Highway Tanker Breakdown Cleared in 18 Mins'
  }
];

export const CreateModal: React.FC<CreateModalProps> = ({
  currentUser,
  onClose,
  onPublishPost
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Media & Copy, 2: Location & Tags, 3: Moderation & Publish
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [headline, setHeadline] = useState(SAMPLE_MEDIA_OPTIONS[0].defaultHeadline);
  const [caption, setCaption] = useState(
    'Ground dispatch from Tiruvallur/Chennai border. Highway traffic patrol and local municipal authorities are actively coordinating diversions.'
  );
  const [category, setCategory] = useState<NewsCategory>(SAMPLE_MEDIA_OPTIONS[0].category);
  const [locationName, setLocationName] = useState('Avadi Municipal Corporation Junction');
  const [neighborhood, setNeighborhood] = useState('Avadi / Ambattur Belt');
  const [radiusMeters, setRadiusMeters] = useState<number>(4000);
  const [citation, setCitation] = useState('Eyewitness confirmation + Greater Chennai / Tiruvallur Dispatch');

  // Moderation simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [moderationPassed, setModerationPassed] = useState(false);

  const handleSelectSample = (idx: number) => {
    setSelectedSampleIndex(idx);
    const opt = SAMPLE_MEDIA_OPTIONS[idx];
    setHeadline(opt.defaultHeadline);
    setCategory(opt.category);
  };

  const handleRunModeration = () => {
    setIsScanning(true);
    setModerationPassed(false);
    setTimeout(() => {
      setIsScanning(false);
      setModerationPassed(true);
    }, 1200);
  };

  const handlePublish = () => {
    const chosenMedia = SAMPLE_MEDIA_OPTIONS[selectedSampleIndex];
    const newPost: VideoPost = {
      id: `post_${Date.now()}`,
      creatorId: currentUser.id,
      creatorName: currentUser.displayName,
      creatorHandle: currentUser.handle,
      creatorAvatar: currentUser.avatar,
      creatorVerified: currentUser.verified,
      type: 'video',
      mediaUrl: chosenMedia.videoUrl,
      thumbnailUrl: chosenMedia.thumbnailUrl,
      headline: headline.trim(),
      caption: caption.trim(),
      category,
      location: {
        placeName: locationName,
        neighborhood,
        lat: currentUser.homeLocation.lat + (Math.random() - 0.5) * 0.015,
        lng: currentUser.homeLocation.lng + (Math.random() - 0.5) * 0.015,
        radiusMeters
      },
      sourceCitation: citation.trim() || null,
      durationSeconds: 15,
      status: 'published',
      createdAt: 'Just now',
      viewCount: 1,
      qualifiedViewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      distanceKm: 0.4,
      adminReviewStatus: 'pending_review',
      adminPayoutAmount: 0,
      adminBountyAwarded: 0
    };

    onPublishPost(newPost);
    onClose();
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet-content"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sheet-handle-bar" />

        {/* Modal Header */}
        <div className="bottom-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--brand-gradient)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={14} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Publish Citizen News Report</h3>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                Step {step} of 3 • Payout Verified Pipeline
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Main Step Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* STEP 1: Media Preview & Headlines */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  1. Select or Record Video Footage
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {SAMPLE_MEDIA_OPTIONS.map((opt, i) => (
                    <div
                      key={opt.label}
                      onClick={() => handleSelectSample(i)}
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: selectedSampleIndex === i ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={opt.thumbnailUrl}
                        alt={opt.label}
                        style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          padding: '6px',
                          background: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          lineHeight: 1.2
                        }}
                      >
                        {opt.label}
                      </div>
                      {selectedSampleIndex === i && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'var(--brand-primary)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            padding: '2px'
                          }}
                        >
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Report Headline
                </label>
                <input
                  type="text"
                  placeholder="Clear, factual headline (e.g. Underpass closed due to flooding)"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Caption */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Details & Context
                </label>
                <textarea
                  rows={3}
                  placeholder="What happened? Who is affected? Timeframes and advisory notes..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!headline.trim()}
                style={{ padding: '12px', width: '100%', fontSize: '13px' }}
              >
                <span>Continue to Location & Category</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* STEP 2: Location Tagging & Category */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  News Category (Required)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(['traffic', 'weather', 'civic', 'safety', 'community', 'business', 'sports'] as NewsCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: category === cat ? 'var(--brand-gradient)' : '#f1f5f9',
                        color: category === cat ? '#ffffff' : 'var(--text-secondary)',
                        border: category === cat ? 'none' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Tagging */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={16} color="var(--brand-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Hyperlocal Coordinates</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Specific Landmark / Cross Street
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    <span>Target Alert Radius</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{radiusMeters / 1000} km</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                  />
                </div>
              </div>

              {/* Source / Citation */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Source / Citation Link (Boosts Trust Score)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eyewitness video + Police log #402"
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Back
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setStep(3);
                    handleRunModeration();
                  }}
                  style={{ flex: 2, padding: '12px' }}
                >
                  <span>Pre-Publish Review</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Automated Moderation & Publish */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', paddingTop: '10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: moderationPassed ? '#ecfdf5' : '#fff7ed',
                  color: moderationPassed ? 'var(--color-success)' : 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}
              >
                {isScanning ? (
                  <Sparkles size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
                ) : moderationPassed ? (
                  <ShieldCheck size={36} />
                ) : (
                  <AlertTriangle size={36} />
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isScanning
                    ? 'Automated News Moderation Scanning...'
                    : 'Report Cleared for Publication!'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                  {isScanning
                    ? 'Checking content for misinformation patterns, hate speech, copyright and geotag validity.'
                    : 'Automated policy filter score: 98.4%. Certified for monetization and hyperlocal feed broadcast.'}
                </p>
              </div>

              {/* Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'left',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Headline:</span>
                  <strong style={{ color: 'var(--text-primary)', maxWidth: '200px', textAlign: 'right' }}>
                    {headline}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Category:</span>
                  <span className={`category-tag-badge ${category}`}>{category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Locality:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={12} color="var(--brand-primary)" />
                    <span>{neighborhood} ({radiusMeters / 1000}km)</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Earnings Eligibility:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)', fontWeight: 700 }}>
                    <CheckCircle2 size={12} />
                    <span>Verified View Eligible</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, padding: '12px' }}>
                  Back
                </button>
                <button
                  className="btn-primary"
                  onClick={handlePublish}
                  disabled={isScanning || !moderationPassed}
                  style={{
                    flex: 2,
                    padding: '12px',
                    opacity: isScanning || !moderationPassed ? 0.6 : 1
                  }}
                >
                  Publish to Local Feed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
