import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  LayoutTemplate,
  Calendar,
  MapPin,
  Layers,
  Link,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import type { Advertisement, AdType, AdPosition } from '../../types';
import { apiClient } from '../../services/apiClient';

interface CreateEditAdModalProps {
  initialAd?: Advertisement | null;
  onSave: (ad: Advertisement) => Promise<void> | void;
  onClose: () => void;
}

// Preset Tamil Nadu Districts & Taluks
const DISTRICT_OPTIONS: Record<string, { taluks: string[]; areas: string[] }> = {
  All: { taluks: ['All'], areas: ['All'] },
  Chennai: {
    taluks: ['All', 'Chennai Central', 'Mylapore', 'Guindy', 'Ambattur', 'T. Nagar', 'Egmore'],
    areas: ['All', 'Parrys', 'Anna Salai', 'Pondy Bazaar', 'George Town', 'Mylapore Tank', 'Velachery']
  },
  Tiruvallur: {
    taluks: ['All', 'Ponneri', 'Avadi', 'Tiruvallur Town', 'Poonamallee', 'Gummidipoondi'],
    areas: ['All', 'Ponneri Bazaar', 'Minjur', 'Kavaraipettai', 'Pattabiram', 'Red Hills', 'Collectorate']
  },
  Chengalpattu: {
    taluks: ['All', 'Tambaram', 'Chengalpattu', 'Pallavaram', 'Thiruporur'],
    areas: ['All', 'Tambaram Sanatorium', 'Chromepet', 'Guduvanchery', 'Maraimalai Nagar']
  },
  Kanchipuram: {
    taluks: ['All', 'Kanchipuram', 'Sriperumbudur', 'Walajabad'],
    areas: ['All', 'Silk Town', 'SIPCOT Industrial Park', 'Bus Terminus']
  }
};

export const CreateEditAdModal: React.FC<CreateEditAdModalProps> = ({
  initialAd,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialAd);

  const [adType, setAdType] = useState<AdType>(initialAd?.adType || 'image');
  const [title, setTitle] = useState(initialAd?.title || '');
  const [advertiserName, setAdvertiserName] = useState(initialAd?.advertiserName || '');
  const [mediaUrl, setMediaUrl] = useState(initialAd?.mediaUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialAd?.thumbnailUrl || '');
  const [targetUrl, setTargetUrl] = useState(initialAd?.targetUrl || '');
  const [callToAction, setCallToAction] = useState(initialAd?.callToAction || 'விவரங்களை அறிக');
  const [startDate, setStartDate] = useState(
    initialAd?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialAd?.endDate ||
      new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // Target location
  const [district, setDistrict] = useState(initialAd?.targetLocation.district || 'All');
  const [taluk, setTaluk] = useState(initialAd?.targetLocation.taluk || 'All');
  const [area, setArea] = useState(initialAd?.targetLocation.area || 'All');

  // Position
  const [position, setPosition] = useState<AdPosition | string>(
    initialAd?.position || 'after_3'
  );

  // Status
  const [status, setStatus] = useState<'active' | 'inactive' | 'stopped'>(
    initialAd?.status || 'active'
  );

  // Reach Limit & Auto-Stop State
  const [hasReachLimit, setHasReachLimit] = useState<boolean>(
    Boolean(initialAd?.reachLimit && initialAd.reachLimit > 0)
  );
  const [reachLimit, setReachLimit] = useState<string>(
    initialAd?.reachLimit ? String(initialAd.reachLimit) : '10000'
  );
  const [autoStop, setAutoStop] = useState<boolean>(
    initialAd?.autoStop !== undefined ? initialAd.autoStop : true
  );

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle District Change -> reset taluk & area
  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setTaluk('All');
    setArea('All');
  };

  // Media file upload handler (Cloudflare R2 or direct)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const publicUrl = await apiClient.uploadFileToR2(
        file,
        file.name,
        adType === 'video' ? 'videos' : 'thumbnails'
      );
      setMediaUrl(publicUrl);
      if (adType === 'video') {
        setThumbnailUrl(publicUrl);
      }
    } catch (err: any) {
      console.warn('R2 upload failed, using local blob object URL fallback:', err);
      const localUrl = URL.createObjectURL(file);
      setMediaUrl(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !advertiserName.trim() || !mediaUrl.trim()) {
      setUploadError('Please fill in Ad Title, Advertiser Name, and Media URL');
      return;
    }

    setIsSubmitting(true);
    const parsedLimit = hasReachLimit && reachLimit ? Math.max(1, parseInt(reachLimit, 10)) : undefined;
    const adData: Advertisement = {
      id: initialAd?.id || `ad_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      advertiserName: advertiserName.trim(),
      adType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || mediaUrl.trim(),
      targetUrl: targetUrl.trim(),
      callToAction: callToAction.trim() || 'Learn More',
      startDate,
      endDate,
      targetLocation: {
        district,
        taluk: taluk !== 'All' ? taluk : undefined,
        area: area !== 'All' ? area : undefined
      },
      position,
      status,
      impressions: initialAd?.impressions || 0,
      reachLimit: parsedLimit,
      autoStop: hasReachLimit ? autoStop : true,
      clicks: initialAd?.clicks || 0,
      createdAt: initialAd?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(adData);
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const talukOptions = DISTRICT_OPTIONS[district]?.taluks || ['All'];
  const areaOptions = DISTRICT_OPTIONS[district]?.areas || ['All'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          background: '#0f172a',
          border: '1px solid rgba(249, 115, 22, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(234, 88, 12, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#ffffff'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.6)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {isEditing ? 'விளம்பரத்தை திருத்து (Edit Advertisement)' : '➕ புதிய விளம்பரம் உருவாக்கு (Create Advertisement)'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Targeted Hyperlocal Commercial Ads for Spotlight Feed & Spots
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {uploadError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '12px'
              }}
            >
              <AlertCircle size={15} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 1. Ad Type Selector Cards */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              Ad Type (விளம்பர வகை) <span style={{ color: '#ea580c' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { type: 'image' as AdType, label: 'Image Ad', tamil: 'பட விளம்பரம்', icon: ImageIcon },
                { type: 'video' as AdType, label: 'Video Ad', tamil: 'வீடியோ விளம்பரம்', icon: Video },
                { type: 'banner' as AdType, label: 'Banner Ad', tamil: 'பேனர் விளம்பரம்', icon: LayoutTemplate }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = adType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setAdType(item.type)}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid',
                      borderColor: isSelected ? '#ea580c' : 'rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(234, 88, 12, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? '#ea580c' : '#94a3b8'}
                      style={{ margin: '0 auto 6px' }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#fb923c' : '#f8fafc' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      {item.tamil}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Media Upload & URL input */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              Upload Media or Provide URL (மீடியா பதிவேற்றம்) <span style={{ color: '#ea580c' }}>*</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={adType === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'rgba(234, 88, 12, 0.2)',
                  border: '1px solid rgba(234, 88, 12, 0.4)',
                  color: '#fb923c',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>Uploading to R2...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload {adType === 'video' ? 'Video' : 'Image'}</span>
                  </>
                )}
              </button>

              <span style={{ fontSize: '12px', color: '#64748b' }}>or paste public media URL below</span>
            </div>

            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={adType === 'video' ? 'https://example.com/ad_video.mp4' : 'https://example.com/ad_banner.jpg'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />

            {mediaUrl && (
              <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', maxHeight: '140px', background: '#000' }}>
                {adType === 'video' ? (
                  <video src={mediaUrl} style={{ width: '100%', height: '140px', objectFit: 'contain' }} controls />
                ) : (
                  <img src={mediaUrl} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                )}
              </div>
            )}
          </div>

          {/* 3. Title & Advertiser Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Ad Title (விளம்பர தலைப்பு) <span style={{ color: '#ea580c' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="எ.கா: சிறப்பு பட்டுப் புடவை தள்ளுபடி"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Advertiser Name (விளம்பரதாரர் பெயர்) <span style={{ color: '#ea580c' }}>*</span>
              </label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="எ.கா: The Chennai Silks, Ponneri Motors"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 4. Dates (Start / End Date) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Calendar size={13} color="#ea580c" />
                <span>Start Date (தொடக்க தேதி)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Calendar size={13} color="#ea580c" />
                <span>End Date (முடிவு தேதி)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 5. Target Location (District, Taluk, Area) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <MapPin size={15} color="#ea580c" />
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Target Location (இலக்கு அமைவிடம்)
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  District (மாவட்டம்)
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                >
                  {Object.keys(DISTRICT_OPTIONS).map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Tamil Nadu (அனைத்தும்)' : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taluk */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  Taluk (வட்டம்)
                </label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  disabled={district === 'All'}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '12px',
                    opacity: district === 'All' ? 0.6 : 1
                  }}
                >
                  {talukOptions.map((t) => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'All Taluks (அனைத்து வட்டங்கள்)' : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  Area (பகுதி)
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={district === 'All'}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '12px',
                    opacity: district === 'All' ? 0.6 : 1
                  }}
                >
                  {areaOptions.map((a) => (
                    <option key={a} value={a}>
                      {a === 'All' ? 'All Areas (அனைத்து பகுதிகள்)' : a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 6. Position Selector & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Layers size={13} color="#ea580c" />
                <span>Placement Position (இடம்)</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              >
                <option value="after_3">News 3க்கு பிறகு (After News 3)</option>
                <option value="after_5">News 5க்கு பிறகு (After News 5)</option>
                <option value="after_7">News 7க்கு பிறகு (After News 7)</option>
                <option value="interval_3">ஒவ்வொரு 3 செய்திகளுக்கும் (Every 3 News - 3, 6, 9...)</option>
                <option value="interval_5">ஒவ்வொரு 5 செய்திகளுக்கும் (Every 5 News - 5, 10...)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Status (நிலை)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: status === 'active' ? '#22c55e' : 'rgba(255, 255, 255, 0.1)',
                    background: status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                    color: status === 'active' ? '#4ade80' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('stopped')}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: status === 'stopped' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                    background: status === 'stopped' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                    color: status === 'stopped' ? '#fbbf24' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Stopped
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: status === 'inactive' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                    background: status === 'inactive' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                    color: status === 'inactive' ? '#f87171' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Ad Reach Limit & Auto-Stop Settings */}
          <div
            style={{
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.25)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="#fb923c" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#fed7aa' }}>
                  Campaign Reach Limit (இம்ப்ரஷன் ரீச் வரம்பு)
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={hasReachLimit}
                  onChange={(e) => setHasReachLimit(e.target.checked)}
                  style={{ accentColor: '#ea580c', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>Set Maximum Reach Limit</span>
              </label>
            </div>

            {hasReachLimit ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                    Target Impressions / Total Reader Views (அதிகபட்ச பார்வைகள்)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={reachLimit}
                    onChange={(e) => setReachLimit(e.target.value)}
                    placeholder="e.g. 10000"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#0f172a',
                      border: '1px solid rgba(234, 88, 12, 0.4)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Preset Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quick Presets:</span>
                  {[
                    { label: '1K', val: '1000' },
                    { label: '5K', val: '5000' },
                    { label: '10K', val: '10000' },
                    { label: '25K', val: '25000' },
                    { label: '50K', val: '50000' },
                    { label: '100K', val: '100000' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setReachLimit(preset.val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: reachLimit === preset.val ? '#ea580c' : 'rgba(255, 255, 255, 0.08)',
                        color: reachLimit === preset.val ? '#ffffff' : '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Auto-Stop Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                      Auto-Stop on Limit (தானியங்கி நிறுத்தம்)
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      Automatically switches campaign to STOPPED status and suppresses it from live feed.
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoStop}
                      onChange={(e) => setAutoStop(e.target.checked)}
                      style={{ accentColor: '#22c55e', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: autoStop ? '#4ade80' : '#94a3b8' }}>
                      {autoStop ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                Campaign will run continuously without any maximum impression cap until the scheduled end date or manual deactivation.
              </div>
            )}
          </div>

          {/* 7. Call To Action & Target URL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                CTA Button Text
              </label>
              <select
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              >
                <option value="விவரங்களை அறிக">விவரங்களை அறிக (Learn More)</option>
                <option value="இப்போதே வாங்குங்கள்">இப்போதே வாங்குங்கள் (Buy Now)</option>
                <option value="தொடர்பு கொள்ள">தொடர்பு கொள்ள (Contact Us)</option>
                <option value="வாட்ஸ்அப்பில் பேசுக">வாட்ஸ்அப்பில் பேசுக (Chat on WhatsApp)</option>
                <option value="அழைக்க (Call Now)">அழைக்க (Call Now)</option>
                <option value="பதிவு செய்க">பதிவு செய்க (Register Now)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Link size={13} color="#ea580c" />
                <span>Destination Target Link (இணைப்பு முகவரி)</span>
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com or https://wa.me/919840123456"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSubmitting || isUploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Saving Advertisement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Publish Advertisement'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
