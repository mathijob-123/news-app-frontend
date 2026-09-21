import React, { useState } from 'react';
import {
  X,
  Share2,
  DownloadCloud,
  Layers,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { SocialPlatform } from '../../types';
import { PlatformIcon } from './PlatformIcon';

interface ImportSocialModalProps {
  onClose: () => void;
  onFetchSuccess: (data: { newlyFetched: any[]; totalStaged: number; duplicatesFound: number }) => void;
  onFetchContent: (params: {
    platform: string;
    source: string;
    dateRange: string;
    location: string;
    category: string;
    limit?: number;
  }) => Promise<{ newlyFetched: any[]; totalStaged: number; duplicatesFound: number }>;
}

export const ImportSocialModal: React.FC<ImportSocialModalProps> = ({
  onClose,
  onFetchSuccess,
  onFetchContent
}) => {
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>('all');
  const [sourcePreset, setSourcePreset] = useState<string>('all');
  const [customHandle, setCustomHandle] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [location, setLocation] = useState<string>('All');
  const [category, setCategory] = useState<string>('all');
  const [limit, setLimit] = useState<number>(5);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Official Tamil Nadu Agency and News Presets
  const officialSourcePresets = [
    { id: 'all', name: 'All Official Sources (அனைத்து செய்தி மூலங்கள்)', handle: 'all' },
    { id: 'gcc', name: 'Greater Chennai Corporation (மாநகராட்சி)', handle: '@chennaicorp', platform: 'twitter' },
    { id: 'cctp', name: 'Greater Chennai Traffic Police (போக்குவரத்து காவல்)', handle: '@ChennaiTraffic', platform: 'twitter' },
    { id: 'tnsdma', name: 'Tamil Nadu Disaster Mgmt (பேரிடர் மேலாண்மை)', handle: '@TNSDMA', platform: 'twitter' },
    { id: 'cmrl', name: 'Chennai Metro Rail Ltd (மெட்ரோ ரயில்)', handle: '@CMRL_Official', platform: 'twitter' },
    { id: 'thanthi', name: 'Thanthi TV (தந்தி டிவி)', handle: '@ThanthiTVNews', platform: 'youtube' },
    { id: 'pttv', name: 'Puthiya Thalaimurai (புதிய தலைமுறை)', handle: '@PTTVOnlineNews', platform: 'rss' },
    { id: 'dinamalar', name: 'Dinamalar Online (தினமலர்)', handle: '@dinamalar_news', platform: 'rss' }
  ];

  const handleExecuteFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFetchError(null);

    try {
      const selectedSource = customHandle.trim() || sourcePreset;
      const result = await onFetchContent({
        platform,
        source: selectedSource,
        dateRange,
        location,
        category,
        limit
      });

      onFetchSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'Failed to fetch social dispatches. Please retry.');
    } finally {
      setIsLoading(false);
    }
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
      onClick={() => !isLoading && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(234, 88, 12, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(234, 88, 12, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)'
              }}
            >
              <DownloadCloud size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                Import Content (உள்ளடக்கம் இறக்குமதி செய்)
              </h2>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Official Government, Police & Media APIs • Staged for Editorial Review
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleExecuteFetch} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Important Gatekeeping Notice */}
          <div
            style={{
              background: 'rgba(234, 88, 12, 0.1)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <Sparkles size={20} color="#ea580c" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: '#fed7aa', lineHeight: 1.45 }}>
              <strong>நேரடி வெளியீடு கிடையாது (No Direct Publish):</strong> இறக்குமதி செய்யப்படும் பதிவுகள் அனைத்தும் வரைவுப் பட்டியலில் (Staging Queue) வைக்கப்படும். போலி சரிபார்ப்பு மற்றும் AI திருத்தத்திற்குப் பின் உங்கள் அனுமதியுடன் மட்டுமே செய்தியாக வெளியாகும்.
            </div>
          </div>

          {/* 1. Platform Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              1. Select Platform (சமூக ஊடக தளம்)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {[
                { id: 'all', label: 'All Platforms', color: '#ea580c' },
                { id: 'twitter', label: 'Twitter / X', color: '#38bdf8' },
                { id: 'youtube', label: 'YouTube', color: '#ef4444' },
                { id: 'instagram', label: 'Instagram', color: '#ec4899' },
                { id: 'rss', label: 'News RSS', color: '#f59e0b' }
              ].map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as any)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.id === 'all' ? (
                      <Globe size={20} color={p.color} />
                    ) : (
                      <PlatformIcon platform={p.id} size={20} color={p.color} />
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Source / Page Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>
              2. Source / Page / Channel (அதிகாரப்பூர்வ பக்கம் / செய்தி தளம்)
            </label>
            <select
              value={sourcePreset}
              onChange={(e) => setSourcePreset(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '13px',
                marginBottom: '8px'
              }}
            >
              {officialSourcePresets.map((s) => (
                <option key={s.id} value={s.handle}>
                  {s.name} ({s.handle})
                </option>
              ))}
            </select>

            {/* Custom Input */}
            <input
              type="text"
              value={customHandle}
              onChange={(e) => setCustomHandle(e.target.value)}
              placeholder="Or enter custom handle / channel URL (எ.கா: @chennaicorp அல்லது YouTube URL)"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 3. Grid: Date Range, Location, Category */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            
            {/* Date Range */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Date Range (தேதி வரம்பு)
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <option value="today">Today (இன்று)</option>
                <option value="24h">Last 24 Hours (கடந்த 24 மணிநேரம்)</option>
                <option value="7d">Last 7 Days (கடந்த 7 நாட்கள்)</option>
                <option value="30d">Last 30 Days (30 நாட்கள்)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Target Region (பகுதி)
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <option value="All">All Tamil Nadu (அனைத்து பகுதி)</option>
                <option value="Chennai">Chennai (சென்னை மாவட்டம்)</option>
                <option value="Tiruvallur">Tiruvallur (திருவள்ளூர் மாவட்டம்)</option>
                <option value="Chengalpattu">Chengalpattu (செங்கல்பட்டு)</option>
                <option value="Kanchipuram">Kanchipuram (காஞ்சிபுரம்)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Category (பிரிவு)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <option value="all">All Categories (அனைத்தும்)</option>
                <option value="civic">Civic (குடிமை)</option>
                <option value="traffic">Traffic (போக்குவரத்து)</option>
                <option value="weather">Weather (வானிலை & மழை)</option>
                <option value="crime">Crime (குற்றம் & சட்டம்)</option>
                <option value="community">Community (சமூகம்)</option>
              </select>
            </div>

            {/* Fetch Limit */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                <Layers size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Fetch Limit (பதிவுகள் எண்ணிக்கை)
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <option value={3}>3 Dispatches (3 பதிவுகள்)</option>
                <option value={5}>5 Dispatches (5 பதிவுகள்)</option>
                <option value={10}>10 Dispatches (10 பதிவுகள்)</option>
              </select>
            </div>

          </div>

          {/* Error notice if any */}
          {fetchError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertTriangle size={16} />
              <span>{fetchError}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel (ரத்து)
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: isLoading
                  ? 'rgba(234, 88, 12, 0.5)'
                  : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>Fetching Official APIs...</span>
                </>
              ) : (
                <>
                  <DownloadCloud size={16} />
                  <span>Fetch & Stage Dispatches (பதிவுகளை எடு)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
