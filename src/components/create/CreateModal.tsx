import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Video as VideoIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  Send,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  MapPin
} from 'lucide-react';
import type { VideoPost, User, NewsCategory } from '../../types';
import { apiClient } from '../../services/apiClient';

interface CreateModalProps {
  currentUser: User;
  onClose: () => void;
  onPublishPost: (post: VideoPost) => void;
}

const CATEGORIES: { id: NewsCategory; label: string; color: string }[] = [
  { id: 'civic', label: 'Civic & Infrastructure', color: '#f59e0b' },
  { id: 'traffic', label: 'Traffic & Transit', color: '#3b82f6' },
  { id: 'safety', label: 'Safety & Emergency', color: '#ef4444' },
  { id: 'weather', label: 'Weather & Rain', color: '#06b6d4' },
  { id: 'community', label: 'Community & Life', color: '#10b981' },
  { id: 'business', label: 'Markets & Commerce', color: '#8b5cf6' },
  { id: 'sports', label: 'Sports & Events', color: '#ec4899' }
];

// Helper to format file size cleanly (never shows 0.0 MB for small images/videos)
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(2) : mb.toFixed(1)} MB`;
}

// Helper to extract a high-quality thumbnail frame from an uploaded video file
function extractVideoThumbnail(videoFile: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(objectUrl);
                resolve(blob);
              },
              'image/jpeg',
              0.85
            );
            return;
          }
        } catch {
          // Canvas error fallback
        }
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export const CreateModal: React.FC<CreateModalProps> = ({
  currentUser,
  onClose,
  onPublishPost
}) => {
  // Real Uploaded File State (Strictly ONE file)
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(15);

  // Form Fields
  const [headline, setHeadline] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<NewsCategory>('civic');

  // Status & Progress
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submittedPost, setSubmittedPost] = useState<VideoPost | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Validation & Touched Field State
  const [touched, setTouched] = useState<{
    media?: boolean;
    headline?: boolean;
    caption?: boolean;
  }>({});

  const markTouched = (field: 'media' | 'headline' | 'caption') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time calculated validation errors (interactive feedback as user types)
  const validationErrors = {
    media: !mediaFile
      ? 'A real video or photo file is required to broadcast citizen news.'
      : undefined,
    headline: (() => {
      const trimmed = headline.trim();
      if (!trimmed) return 'Report headline is required.';
      if (trimmed.length < 8)
        return `Headline is too brief (${trimmed.length}/8 min chars). State what happened.`;
      if (trimmed.length > 120) return 'Headline cannot exceed 120 characters.';
      return undefined;
    })(),
    caption: (() => {
      const trimmed = caption.trim();
      if (trimmed && trimmed.length < 10)
        return `Details are too brief (${trimmed.length}/10 min chars). Provide more context.`;
      return undefined;
    })()
  };

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle single file selection (video or image)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Please upload a valid video (MP4, MOV, WEBM) or image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size === 0) {
      setError('The selected file appears to be empty (0 bytes). Please choose a valid media file.');
      return;
    }

    // Limit video size (max 80MB) and image size (max 20MB)
    const maxSize = isVideo ? 80 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Selected file is too large. Maximum size is ${isVideo ? '80MB for video' : '20MB for image'}.`);
      return;
    }

    // Revoke previous URL if any
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const newPreviewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setPreviewUrl(newPreviewUrl);
    setTouched((prev) => ({ ...prev, media: true }));

    if (isVideo) {
      // Auto-extract real video thumbnail
      try {
        const thumb = await extractVideoThumbnail(file);
        setThumbnailBlob(thumb);
      } catch (err) {
        console.warn('Could not extract video thumbnail:', err);
      }
    } else {
      setThumbnailBlob(file);
    }
  };

  const handleRemoveMedia = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMediaFile(null);
    setPreviewUrl(null);
    setThumbnailBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTouched((prev) => ({ ...prev, media: true }));
  };

  // Submit Citizen Report to Cloudflare R2 and Supabase PostgreSQL for Bureau Review
  const handlePublish = async () => {
    setTouched({
      media: true,
      headline: true,
      caption: true
    });

    if (validationErrors.media || validationErrors.headline || validationErrors.caption) {
      setError(
        validationErrors.media ||
          validationErrors.headline ||
          validationErrors.caption ||
          'Please complete all required fields.'
      );
      return;
    }

    if (!mediaFile) {
      setError('Please upload a video or photo for your report.');
      return;
    }

    const currentMediaFile: File = mediaFile;
    setError(null);
    setIsPublishing(true);

    try {
      // 1. Upload Real Media to Cloudflare R2
      setUploadStatus(`Uploading ${mediaType} to Cloudflare R2...`);
      const fileExt = currentMediaFile.name.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
      const mediaFilename = `spot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
      const folder = mediaType === 'video' ? 'videos' : 'thumbnails';

      const uploadedMediaUrl = await apiClient.uploadFileToR2(
        currentMediaFile,
        mediaFilename,
        folder
      );

      // 2. Upload Thumbnail if video, or use mediaUrl if image
      let uploadedThumbnailUrl = uploadedMediaUrl;
      if (mediaType === 'video' && thumbnailBlob) {
        setUploadStatus('Saving report thumbnail to R2...');
        const thumbFilename = `thumb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
        try {
          uploadedThumbnailUrl = await apiClient.uploadFileToR2(
            thumbnailBlob,
            thumbFilename,
            'thumbnails'
          );
        } catch (thumbErr) {
          console.warn('Thumbnail upload warning:', thumbErr);
          uploadedThumbnailUrl = uploadedMediaUrl;
        }
      }

      // 3. Register real report in Supabase PostgreSQL database
      setUploadStatus('Submitting report for Bureau Acceptance...');
      const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      const newPostPayload: Partial<VideoPost> = {
        id: postId,
        creatorId: currentUser.id,
        creatorName: currentUser.displayName,
        creatorHandle: currentUser.handle,
        creatorAvatar: currentUser.avatar,
        creatorVerified: currentUser.verified,
        type: mediaType,
        mediaUrl: uploadedMediaUrl,
        thumbnailUrl: uploadedThumbnailUrl,
        headline: headline.trim(),
        caption: caption.trim() || headline.trim(),
        category,
        location: {
          placeName: currentUser.homeLocation?.placeName || 'Chennai Hub',
          neighborhood: currentUser.homeLocation?.district || 'Chennai',
          lat: currentUser.homeLocation?.lat || 13.0827,
          lng: currentUser.homeLocation?.lng || 80.2707,
          radiusMeters: 4000
        },
        sourceCitation: 'Citizen on-ground eyewitness dispatch',
        durationSeconds: mediaType === 'video' ? videoDuration : 10,
        status: 'in_review',
        isBreaking: false,
        adminReviewStatus: 'pending_review',
        adminPayoutAmount: 0,
        priceAward: 0,
        rpmRate: 0,
        adminBountyAwarded: 0,
        createdAt: new Date().toISOString(),
        viewCount: 0,
        qualifiedViewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        distanceKm: 0.2
      };

      const createdPost = await apiClient.createPost(newPostPayload);
      const finalPost = createdPost || (newPostPayload as VideoPost);

      // 4. Update parent state & show Bureau Queue confirmation
      onPublishPost(finalPost);
      setIsPublishing(false);
      setUploadStatus('');
      setSubmittedPost(finalPost);
    } catch (err: any) {
      console.error('[Publish Report Error]:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
      setIsPublishing(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      {submittedPost ? (
        <div
          className="bottom-sheet-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            maxWidth: '520px',
            margin: '0 auto',
            borderRadius: '24px 24px 0 0',
            padding: '28px 24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
            }}
          >
            <ShieldCheck size={34} />
          </div>

          <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Report Submitted to Bureau Desk!
          </h3>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Your eyewitness dispatch has been sent as a request to the Admin Bureau. Every post is reviewed before going public:
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '22px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <MapPin size={15} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Geotag Calibration & Perimeter
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Admin verifies ground footage and calibrates exact coordinates and broadcast radius.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <DollarSign size={15} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Price Award Allocation
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Admin allocates your cash reporting grant (₹50–₹500), credited directly to your Spotlight Wallet upon acceptance.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <TrendingUp size={15} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  3. RPM Allocation & Public Launch
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Admin sets your post's custom RPM (Revenue Per 1,000 views in ₹) and publishes your story live to the community.
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{
              padding: '13px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Check size={16} />
            <span>Got It — Track in Profile</span>
          </button>
        </div>
      ) : (
        <div
          className="bottom-sheet-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            height: '92vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            maxWidth: '560px',
            margin: '0 auto',
            position: 'relative'
          }}
        >
        <div className="sheet-handle-bar" />

        {/* Modal Header */}
        <div className="bottom-sheet-header" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4500 0%, #ea580c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(255, 69, 0, 0.35)'
              }}
            >
              <Camera size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Publish Citizen News Report
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Eyewitness Dispatch • Submitted for Bureau Desk Acceptance
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              margin: '12px 16px 0',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* ========================================================
              STEP 1: Real Media Upload & Content
             ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Media File Upload Area (Only ONE video or image) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>1. Real Media File (Upload 1 Video or 1 Photo)</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  {mediaFile && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
                      <Check size={12} />
                      <span>Attached</span>
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/quicktime,video/ogg,image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                />

                {!previewUrl ? (
                  <div
                    onClick={() => {
                      markTouched('media');
                      fileInputRef.current?.click();
                    }}
                    style={{
                      border:
                        touched.media && validationErrors.media
                          ? '2px dashed #ef4444'
                          : '2px dashed var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '32px 16px',
                      textAlign: 'center',
                      background:
                        touched.media && validationErrors.media
                          ? 'rgba(239, 68, 68, 0.04)'
                          : 'var(--bg-surface-subtle)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background:
                          touched.media && validationErrors.media
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(255, 69, 0, 0.1)',
                        color:
                          touched.media && validationErrors.media
                            ? '#ef4444'
                            : 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Upload size={24} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Choose Real Video or Photo
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.4 }}>
                      Direct camera clip or gallery upload • MP4, MOV, WEBM, JPG, PNG (Max 80MB)
                    </div>
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background:
                          touched.media && validationErrors.media
                            ? '#ef4444'
                            : 'var(--brand-primary)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        transition: 'background 0.2s'
                      }}
                    >
                      <Camera size={14} />
                      <span>Select Media File</span>
                    </div>
                  </div>
                ) : (
                  /* Media Preview with Interactive Player */
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      background: '#000000',
                      position: 'relative'
                    }}
                  >
                    {mediaType === 'video' ? (
                      <video
                        src={previewUrl}
                        controls
                        playsInline
                        onLoadedMetadata={(e) => {
                          const dur = Math.round((e.target as HTMLVideoElement).duration);
                          if (dur) setVideoDuration(dur);
                        }}
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          display: 'block',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          display: 'block',
                          objectFit: 'contain'
                        }}
                      />
                    )}

                    {/* Media Info Bar & Remove Button */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {mediaType === 'video' ? (
                          <>
                            <VideoIcon size={16} color="#ff4500" />
                            <span style={{ fontWeight: 700 }}>Real Video Clip</span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>•</span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{videoDuration}s</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={16} color="#3b82f6" />
                            <span style={{ fontWeight: 700 }}>Real Photo</span>
                          </>
                        )}
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>•</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>
                          {formatFileSize(mediaFile?.size)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveMedia}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            color: '#fca5a5',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inline Media Error */}
                {touched.media && validationErrors.media && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#dc2626',
                      fontSize: '11px',
                      marginTop: '6px',
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{validationErrors.media}</span>
                  </div>
                )}
              </div>

              {/* Headline */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Report Headline</span>
                    <span style={{ color: '#ef4444' }}>*</span>
                    {touched.headline && !validationErrors.headline && headline.trim() && (
                      <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                        <Check size={12} /> Valid
                      </span>
                    )}
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color:
                        headline.length === 0
                          ? 'var(--text-tertiary)'
                          : headline.length < 8
                          ? '#ef4444'
                          : headline.length > 105
                          ? '#f59e0b'
                          : '#10b981'
                    }}
                  >
                    {headline.length}/120
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Clear, factual summary (e.g. Tree fallen on Grand Trunk Road blocking south lane)"
                    value={headline}
                    maxLength={120}
                    onBlur={() => markTouched('headline')}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      if (!touched.headline) markTouched('headline');
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 36px 11px 12px',
                      borderRadius: '10px',
                      border:
                        touched.headline && validationErrors.headline
                          ? '1.5px solid #ef4444'
                          : touched.headline && headline.trim().length >= 8
                          ? '1.5px solid #10b981'
                          : '1px solid var(--border-subtle)',
                      boxShadow:
                        touched.headline && validationErrors.headline
                          ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                          : touched.headline && headline.trim().length >= 8
                          ? '0 0 0 3px rgba(16, 185, 129, 0.12)'
                          : 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {touched.headline && validationErrors.headline && (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                    {touched.headline && !validationErrors.headline && headline.trim().length >= 8 && (
                      <CheckCircle2 size={16} color="#10b981" />
                    )}
                  </div>
                </div>

                {/* Inline Headline Error */}
                {touched.headline && validationErrors.headline && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#dc2626',
                      fontSize: '11px',
                      marginTop: '5px',
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{validationErrors.headline}</span>
                  </div>
                )}
              </div>

              {/* News Category */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  News Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface-subtle)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                          border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Ground Dispatch & Details</span>
                    {caption.trim().length >= 10 && (
                      <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                        <Check size={12} /> Detailed
                      </span>
                    )}
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {caption.length} chars
                  </span>
                </div>

                <textarea
                  rows={3}
                  placeholder="What is happening? Provide exact context, affected routes, civic authorities responding, or citizen advice..."
                  value={caption}
                  onBlur={() => markTouched('caption')}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    if (e.target.value.length > 0 && !touched.caption) markTouched('caption');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border:
                      touched.caption && validationErrors.caption
                        ? '1.5px solid #ef4444'
                        : touched.caption && caption.trim().length >= 10
                        ? '1.5px solid #10b981'
                        : '1px solid var(--border-subtle)',
                    boxShadow:
                      touched.caption && validationErrors.caption
                        ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                        : 'none',
                    fontSize: '12px',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                />

                {/* Inline Caption Error */}
                {touched.caption && validationErrors.caption && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: '#dc2626',
                      fontSize: '11px',
                      marginTop: '5px',
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{validationErrors.caption}</span>
                  </div>
                )}
              </div>

              {/* Submit Citizen Report Button */}
              <button
                type="button"
                className="btn-primary"
                onClick={handlePublish}
                disabled={isPublishing}
                style={{
                  padding: '14px',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(255, 69, 0, 0.4)',
                  marginTop: '8px'
                }}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>{uploadStatus || 'Submitting report...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Citizen Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
