import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  Calendar,
  MapPin,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Image as ImageIcon,
  Video,
  LayoutTemplate,
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
  onRefreshAds,
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
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

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
      setDeletingAdId(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid rgba(249, 115, 22, 0.3)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Megaphone size={18} />
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
            padding: '11px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={18} />
          <span>➕ Create Advertisement (புதிய விளம்பரம்)</span>
        </button>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Campaigns
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>{activeCount}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>of {ads.length} total</span>
          </div>
        </div>

        <div
          style={{
            background: stoppedCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(30, 41, 59, 0.6)',
            border: stoppedCount > 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '11px', color: stoppedCount > 0 ? '#fca5a5' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PauseCircle size={12} color={stoppedCount > 0 ? '#ef4444' : '#94a3b8'} />
            Auto-Stopped (Reach Limit)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: stoppedCount > 0 ? '#ef4444' : '#64748b' }}>{stoppedCount}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>limit reached</span>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Impressions (பார்வைகள்)
          </span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
            {totalImpressions.toLocaleString()}
          </span>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Clicks (கிளிக்குகள்)
          </span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#fb923c' }}>
            {totalClicks.toLocaleString()}
          </span>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Avg. CTR (கிளிக் விகிதம்)
          </span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa' }}>
            {averageCTR}
          </span>
        </div>
      </div>

      {/* 3. Feed Interleaving Simulation Explainer Banner */}
      <div
        style={{
          background: 'rgba(234, 88, 12, 0.08)',
          border: '1px dashed rgba(234, 88, 12, 0.4)',
          borderRadius: '14px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} color="#ea580c" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fdba74' }}>
            Live Feed Slot Pattern:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#ffffff', fontWeight: 700 }}>
            <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>News 1</span>
            <span>→</span>
            <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>News 2</span>
            <span>→</span>
            <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>News 3</span>
            <span>→</span>
            <span style={{ background: '#ea580c', padding: '2px 8px', borderRadius: '6px', color: '#fff' }}>📢 AD</span>
            <span>→</span>
            <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>News 4</span>
            <span>→</span>
            <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '6px' }}>News 5</span>
            <span>→</span>
            <span style={{ background: '#ea580c', padding: '2px 8px', borderRadius: '6px', color: '#fff' }}>📢 AD</span>
          </div>
        </div>

        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
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
          background: 'rgba(30, 41, 59, 0.4)',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, advertisers, locations..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
                  background: statusFilter === s ? (s === 'stopped' ? '#ef4444' : '#ea580c') : 'transparent',
                  color: statusFilter === s ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {s === 'stopped' && <AlertTriangle size={11} />}
                <span>{s === 'stopped' ? `Stopped (${stoppedCount})` : s}</span>
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
                  color: typeFilter === t ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
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
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.3)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Megaphone size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
            No Advertisements Found
          </h4>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>
            No advertisements match your current search or filter criteria.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
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
                  background: isStopped
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(30, 41, 59, 0.6) 100%)'
                    : 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid',
                  borderColor: isStopped
                    ? 'rgba(239, 68, 68, 0.4)'
                    : isActive
                    ? 'rgba(234, 88, 12, 0.25)'
                    : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s'
                }}
              >
                {/* Left: Media Thumbnail + Basic Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px', minWidth: 0 }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#090d16',
                      flexShrink: 0,
                      position: 'relative',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
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
                              background: 'rgba(0,0,0,0.4)',
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
                          color: '#64748b'
                        }}
                      >
                        <Megaphone size={20} />
                      </div>
                    )}
                  </div>

                  {/* Title & Advertiser */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {/* Type badge */}
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: isVideo ? 'rgba(56, 189, 248, 0.2)' : isBanner ? 'rgba(168, 85, 247, 0.2)' : 'rgba(234, 88, 12, 0.2)',
                          color: isVideo ? '#38bdf8' : isBanner ? '#c084fc' : '#fb923c',
                          textTransform: 'uppercase'
                        }}
                      >
                        {ad.adType}
                      </span>

                      {isStopped && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            textTransform: 'uppercase'
                          }}
                        >
                          <AlertTriangle size={10} /> Auto-Stopped
                        </span>
                      )}

                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                        {ad.advertiserName}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#f8fafc',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={ad.title}
                    >
                      {ad.title}
                    </h4>

                    {/* Meta tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={11} color="#ea580c" />
                        <span>{ad.targetLocation.district || 'All'}</span>
                        {ad.targetLocation.taluk && <span>• {ad.targetLocation.taluk}</span>}
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Layers size={11} color="#38bdf8" />
                        <span>{formatPositionLabel(ad.position)}</span>
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} color="#a855f7" />
                        <span>{ad.startDate} - {ad.endDate}</span>
                      </span>

                      {hasReachLimit && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: isLimitReached ? '#f87171' : '#38bdf8' }}>
                          <Target size={11} color={isLimitReached ? '#ef4444' : '#38bdf8'} />
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
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ textAlign: 'center', minWidth: hasReachLimit ? '130px' : 'auto' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span>Impressions</span>
                      {hasReachLimit && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: isLimitReached ? '#ef4444' : reachPercent >= 80 ? '#fb923c' : '#38bdf8' }}>
                          ({reachPercent}%)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isLimitReached ? '#ef4444' : '#38bdf8' }}>
                      {(ad.impressions || 0).toLocaleString()}
                      {hasReachLimit && (
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                          {' '}/ {ad.reachLimit!.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {hasReachLimit && (
                      <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.1)', marginTop: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${reachPercent}%`,
                            height: '100%',
                            borderRadius: '2px',
                            background: isLimitReached
                              ? '#ef4444'
                              : reachPercent >= 80
                              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                              : 'linear-gradient(90deg, #0284c7, #38bdf8)'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Clicks</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fb923c' }}>
                      {(ad.clicks || 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>CTR</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e' }}>
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
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isStopped ? '#ef4444' : isActive ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                      background: isStopped ? 'rgba(239, 68, 68, 0.15)' : isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isStopped ? '#f87171' : isActive ? '#4ade80' : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
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
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
                        border: '1px solid rgba(234, 88, 12, 0.5)',
                        color: '#fdba74',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Reach limit reached. Extend limit or adjust settings to resume."
                    >
                      <TrendingUp size={12} color="#fb923c" />
                      <span>Extend Limit</span>
                    </button>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewAd(ad)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Live Preview"
                  >
                    <Eye size={14} color="#38bdf8" />
                    <span>Preview</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingAd(ad)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Edit Campaign"
                  >
                    <Edit2 size={14} color="#fb923c" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(ad.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
