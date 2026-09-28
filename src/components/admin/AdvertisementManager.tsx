import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  Sparkles,
  Calendar,
  MapPin,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Target,
  PauseCircle
} from 'lucide-react';
import type { Advertisement, AdType } from '../../types';
import { AdPreviewModal } from './AdPreviewModal';
import { CreateEditAdModal } from './CreateEditAdModal';

interface AdvertisementManagerProps {
  ads: Advertisement[];
  onRefreshAds: () => void;
  onSaveAd: (ad: Advertisement) => Promise<void> | void;
  onDeleteAd: (adId: string) => Promise<void> | void;
  onToggleStatus: (adId: string, currentStatus: 'active' | 'inactive' | 'stopped') => Promise<void> | void;
}

export const AdvertisementManager: React.FC<AdvertisementManagerProps> = ({
  ads,
  onSaveAd,
  onDeleteAd,
  onToggleStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'stopped' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AdType>('all');

  // Modals
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered ads
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
      if (typeFilter !== 'all' && ad.adType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ad.title.toLowerCase().includes(q) ||
          ad.advertiserName.toLowerCase().includes(q) ||
          ad.targetLocation.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ads, statusFilter, typeFilter, searchQuery]);

  // Aggregate stats
  const totalImpressions = useMemo(
    () => ads.reduce((sum, a) => sum + (a.impressions || 0), 0),
    [ads]
  );
  const totalClicks = useMemo(
    () => ads.reduce((sum, a) => sum + (a.clicks || 0), 0),
    [ads]
  );
  const activeCount = useMemo(
    () => ads.filter((a) => a.status === 'active').length,
    [ads]
  );
  const stoppedCount = useMemo(
    () => ads.filter((a) => a.status === 'stopped').length,
    [ads]
  );
  const averageCTR = useMemo(() => {
    if (totalImpressions === 0) return '0.0%';
    return `${((totalClicks / totalImpressions) * 100).toFixed(1)}%`;
  }, [totalImpressions, totalClicks]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      await onDeleteAd(id);
    }
  };

  const formatPositionLabel = (pos: string) => {
    switch (pos) {
      case 'after_3':
        return 'News 3க்கு பிறகு (Slot 3)';
      case 'after_5':
        return 'News 5க்கு பிறகு (Slot 5)';
      case 'after_7':
        return 'News 7க்கு பிறகு (Slot 7)';
      case 'interval_3':
        return 'ஒவ்வொரு 3 செய்திகளுக்கும் (Every 3)';
      case 'interval_5':
        return 'ஒவ்வொரு 5 செய்திகளுக்கும் (Every 5)';
      default:
        return pos;
    }
  };

  const formatAdDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: '#0f172a',
          padding: '22px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Megaphone size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Advertisements Management (விளம்பர மேலாண்மை)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Configure sponsored image, video, and banner ads with hyperlocal targeting and custom feed slots.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <Plus size={18} />
          <span>Create Advertisement (புதிய விளம்பரம்)</span>
        </button>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Campaigns
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>{activeCount}</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>of {ads.length} total</span>
          </div>
        </div>

        <div
          style={{
            background: stoppedCount > 0 ? '#fff1f2' : '#ffffff',
            border: stoppedCount > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ fontSize: '11px', color: stoppedCount > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <PauseCircle size={13} color={stoppedCount > 0 ? '#dc2626' : '#64748b'} />
            Auto-Stopped (Reach Limit)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: stoppedCount > 0 ? '#dc2626' : '#64748b' }}>{stoppedCount}</span>
            <span style={{ fontSize: '12px', color: stoppedCount > 0 ? '#991b1b' : '#64748b', fontWeight: 500 }}>limit reached</span>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Impressions (பார்வைகள்)
          </span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            {totalImpressions.toLocaleString()}
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Clicks (கிளிக்குகள்)
          </span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            {totalClicks.toLocaleString()}
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avg. CTR (கிளிக் விகிதம்)
          </span>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c' }}>
            {averageCTR}
          </span>
        </div>
      </div>

      {/* 3. Feed Interleaving Simulation Explainer Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#ea580c" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              Live Feed Slot Pattern:
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>News 1</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>News 2</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>News 3</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#ea580c', color: '#ffffff', padding: '3px 8px', borderRadius: '6px' }}>📢 AD</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>News 4</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>News 5</span>
            <span style={{ color: '#94a3b8' }}>→</span>
            <span style={{ background: '#ea580c', color: '#ffffff', padding: '3px 8px', borderRadius: '6px' }}>📢 AD</span>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Filtered dynamically by user location (District / Taluk / Area)
        </span>
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, advertisers, locations..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {(['all', 'active', 'stopped', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  background: statusFilter === s ? (s === 'stopped' ? '#dc2626' : '#ea580c') : 'transparent',
                  color: statusFilter === s ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                {s === 'stopped' && <AlertTriangle size={11} />}
                <span>{s === 'stopped' ? `Stopped (${stoppedCount})` : s}</span>
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {(['all', 'image', 'video', 'banner'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  background: typeFilter === t ? '#ea580c' : 'transparent',
                  color: typeFilter === t ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Advertisement Cards / Table */}
      {filteredAds.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <Megaphone size={40} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            No Advertisements Found
          </h4>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b' }}>
            No advertisements match your current search or filter criteria.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            Create New Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAds.map((ad) => {
            const isVideo = ad.adType === 'video';
            const isBanner = ad.adType === 'banner';
            const isStopped = ad.status === 'stopped';
            const isActive = ad.status === 'active';
            const hasReachLimit = typeof ad.reachLimit === 'number' && ad.reachLimit > 0;
            const reachPercent = hasReachLimit
              ? Math.min(100, Math.round(((ad.impressions || 0) / ad.reachLimit!) * 100))
              : 0;
            const isLimitReached = hasReachLimit && (ad.impressions || 0) >= ad.reachLimit!;

            return (
              <div
                key={ad.id}
                style={{
                  background: isStopped ? '#fffbfb' : '#ffffff',
                  border: '1px solid',
                  borderColor: isStopped ? '#fecdd3' : '#e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
              >
                {/* Left: Media Thumbnail + Basic Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 340px', minWidth: 0 }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      flexShrink: 0,
                      position: 'relative',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {ad.mediaUrl ? (
                      isVideo ? (
                        <>
                          <video
                            src={ad.mediaUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff'
                            }}
                          >
                            <Play size={16} />
                          </div>
                        </>
                      ) : (
                        <img
                          src={ad.mediaUrl}
                          alt={ad.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8'
                        }}
                      >
                        <Megaphone size={22} />
                      </div>
                    )}
                  </div>

                  {/* Title & Advertiser */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {/* Type badge */}
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isVideo ? '#eff6ff' : isBanner ? '#f5f3ff' : '#fff7ed',
                          color: isVideo ? '#1d4ed8' : isBanner ? '#7e22ce' : '#c2410c',
                          border: isVideo ? '1px solid #bfdbfe' : isBanner ? '1px solid #ddd6fe' : '1px solid #fed7aa',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {ad.adType}
                      </span>

                      {isStopped && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecdd3',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          <AlertTriangle size={11} /> Auto-Stopped
                        </span>
                      )}

                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        {ad.advertiserName}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.35,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={ad.title}
                    >
                      {ad.title}
                    </h4>

                    {/* Meta tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#ea580c" />
                        <span style={{ color: '#334155' }}>{ad.targetLocation.district || 'All'}</span>
                        {ad.targetLocation.taluk && <span style={{ color: '#64748b' }}>• {ad.targetLocation.taluk}</span>}
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={13} color="#0284c7" />
                        <span style={{ color: '#334155' }}>{formatPositionLabel(ad.position)}</span>
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#7c3aed" />
                        <span style={{ color: '#334155' }}>{formatAdDate(ad.startDate)} – {formatAdDate(ad.endDate)}</span>
                      </span>

                      {hasReachLimit && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isLimitReached ? '#dc2626' : '#0284c7', fontWeight: 600 }}>
                          <Target size={13} color={isLimitReached ? '#dc2626' : '#0284c7'} />
                          <span>Cap: {ad.reachLimit!.toLocaleString()} {ad.autoStop ? '(Auto-Stop)' : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Performance Counters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ textAlign: 'center', minWidth: hasReachLimit ? '130px' : 'auto' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span>Impressions</span>
                      {hasReachLimit && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: isLimitReached ? '#dc2626' : reachPercent >= 80 ? '#ea580c' : '#0284c7' }}>
                          ({reachPercent}%)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: isLimitReached ? '#dc2626' : '#0f172a' }}>
                      {(ad.impressions || 0).toLocaleString()}
                      {hasReachLimit && (
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                          {' '}/ {ad.reachLimit!.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {hasReachLimit && (
                      <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: '#e2e8f0', marginTop: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${reachPercent}%`,
                            height: '100%',
                            borderRadius: '3px',
                            background: isLimitReached
                              ? '#dc2626'
                              : reachPercent >= 80
                              ? 'linear-gradient(90deg, #f59e0b, #dc2626)'
                              : 'linear-gradient(90deg, #0284c7, #38bdf8)'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Clicks</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {(ad.clicks || 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CTR</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>
                      {ad.impressions ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>

                {/* Right: Status Toggle & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => onToggleStatus(ad.id, ad.status)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isStopped ? '#fecdd3' : isActive ? '#a7f3d0' : '#cbd5e1',
                      background: isStopped ? '#fef2f2' : isActive ? '#ecfdf5' : '#f1f5f9',
                      color: isStopped ? '#b91c1c' : isActive ? '#047857' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                    title={isStopped ? 'Limit reached & auto-stopped. Click to reactivate.' : 'Click to toggle Active / Inactive'}
                  >
                    {isStopped ? <AlertTriangle size={13} /> : isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{isStopped ? 'Stopped' : isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  {/* Extend Limit quick action button when stopped */}
                  {isStopped && (
                    <button
                      onClick={() => setEditingAd(ad)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        color: '#c2410c',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Reach limit reached. Extend limit or adjust settings to resume."
                    >
                      <TrendingUp size={13} color="#c2410c" />
                      <span>Extend Limit</span>
                    </button>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewAd(ad)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                    title="Live Preview"
                  >
                    <Eye size={14} color="#0284c7" />
                    <span>Preview</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingAd(ad)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                    title="Edit Campaign"
                  >
                    <Edit2 size={14} color="#ea580c" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(ad.id)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Delete Advertisement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {previewAd && (
        <AdPreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} />
      )}

      {(showCreateModal || editingAd) && (
        <CreateEditAdModal
          initialAd={editingAd}
          onSave={async (ad) => {
            await onSaveAd(ad);
            setEditingAd(null);
            setShowCreateModal(false);
          }}
          onClose={() => {
            setEditingAd(null);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};
