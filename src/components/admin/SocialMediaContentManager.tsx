import React, { useState, useMemo } from 'react';
import {
  Share2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Check,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Clock,
  Layers,
  Globe,
  Film
} from 'lucide-react';
import type { SocialMediaPost, SocialPlatform } from '../../types';
import { ImportSocialModal } from './ImportSocialModal';
import { AiEditorialModal } from './AiEditorialModal';
import { PlatformIcon } from './PlatformIcon';

interface SocialMediaContentManagerProps {
  posts: SocialMediaPost[];
  onRefreshPosts: () => void;
  onApprovePublish: (id: string, editorialData: any) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFetchContent: (params: {
    platform: string;
    source: string;
    dateRange: string;
    location: string;
    category: string;
    limit?: number;
  }) => Promise<{ newlyFetched: SocialMediaPost[]; totalStaged: number; duplicatesFound: number }>;
  onAiEnhance: (id: string, customPrompt?: string) => Promise<SocialMediaPost>;
}

export const SocialMediaContentManager: React.FC<SocialMediaContentManagerProps> = ({
  posts,
  onRefreshPosts,
  onApprovePublish,
  onReject,
  onDelete,
  onFetchContent,
  onAiEnhance
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'staged_pending' | 'approved_published' | 'rejected' | 'duplicates'>('staged_pending');
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [editorialPost, setEditorialPost] = useState<SocialMediaPost | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered list
  const filteredPosts = useMemo(() => {
    return posts.filter((item) => {
      // Status Filter
      if (statusFilter === 'duplicates') {
        if (!item.isDuplicate) return false;
      } else if (statusFilter !== 'all') {
        if (item.status !== statusFilter) return false;
      }

      // Platform Filter
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const headline = (item.aiHeadline || item.rawTitle).toLowerCase();
        const content = (item.aiSummary || item.rawContent).toLowerCase();
        const source = item.sourceName.toLowerCase() + ' ' + item.sourceHandle.toLowerCase();
        return headline.includes(q) || content.includes(q) || source.includes(q);
      }

      return true;
    });
  }, [posts, statusFilter, platformFilter, searchQuery]);

  // KPI Metrics
  const stagedCount = useMemo(() => posts.filter((p) => p.status === 'staged_pending').length, [posts]);
  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'approved_published').length, [posts]);
  const duplicatesCount = useMemo(() => posts.filter((p) => p.isDuplicate).length, [posts]);
  const uniqueCount = useMemo(() => posts.filter((p) => !p.isDuplicate && p.status === 'staged_pending').length, [posts]);

  const getPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case 'youtube':
        return { label: 'YouTube', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'twitter':
        return { label: 'Twitter / X', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'instagram':
        return { label: 'Instagram', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' };
      case 'rss':
        return { label: 'News RSS', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { label: 'Web', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  const handleDeleteDispatch = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this social dispatch from staging?')) {
      await onDelete(id);
      showToast('Dispatch deleted from staging.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Bar with Import Action */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Social Media Content (சமூக ஊடக உள்ளடக்கம்)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Import, duplicate-check, and AI-enhance dispatches from official government and news channels. Strict editorial approval required before publishing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onRefreshPosts}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Refresh staged list"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
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
            <span>➕ Import Content (உள்ளடக்கம் இறக்குமதி செய்)</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        {/* Metric 1: Staged for Review */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c', marginBottom: '4px' }}>
            <Clock size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Staged for Review</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {stagedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#ea580c', marginTop: '2px', fontWeight: 600 }}>
            மதிப்பாய்வு நிலுவையில்
          </div>
        </div>

        {/* Metric 2: Unique Verified */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', marginBottom: '4px' }}>
            <CheckCircle2 size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Unique Verified</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {uniqueCount}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px', fontWeight: 600 }}>
            தனித்துவ புதிய பதிவுகள்
          </div>
        </div>

        {/* Metric 3: Duplicates Flagged */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: duplicatesCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', marginBottom: '4px' }}>
            <AlertTriangle size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Duplicates Detected</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: duplicatesCount > 0 ? '#ef4444' : '#ffffff' }}>
            {duplicatesCount}
          </div>
          <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px', fontWeight: 600 }}>
            நகல்கள் கண்டறியப்பட்டது
          </div>
        </div>

        {/* Metric 4: Approved & Published */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Approved to News</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {publishedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
            செய்தியாக வெளியிடப்பட்டது
          </div>
        </div>

      </div>

      {/* 3. Filters & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '14px 18px'
        }}
      >
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'staged_pending', label: 'Pending Review (நிலுவையில்)', count: stagedCount },
            { id: 'duplicates', label: 'Duplicates (நகல்கள்)', count: duplicatesCount },
            { id: 'approved_published', label: 'Approved (வெளியிடப்பட்டது)', count: publishedCount },
            { id: 'rejected', label: 'Rejected (நிராகரிப்பு)', count: posts.filter(p => p.status === 'rejected').length },
            { id: 'all', label: 'All Imports (அனைத்தும்)', count: posts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: statusFilter === tab.id ? '#ea580c' : 'rgba(255, 255, 255, 0.1)',
                background: statusFilter === tab.id ? '#ea580c' : 'rgba(15, 23, 42, 0.6)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: statusFilter === tab.id ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '6px',
                  background: statusFilter === tab.id ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Platform Selector & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', justifyContent: 'flex-end' }}>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '12px'
            }}
          >
            <option value="all">All Platforms (அனைத்து தளம்)</option>
            <option value="twitter">Twitter / X</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="rss">News RSS Feeds</option>
          </select>

          <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dispatches..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
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
      </div>

      {/* 4. Staged Dispatches Grid */}
      {filteredPosts.length === 0 ? (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.3)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <Share2 size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
            No Social Dispatches Found (பதிவுகள் ஏதுமில்லை)
          </h3>
          <p style={{ margin: '6px auto 16px', fontSize: '12px', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.5 }}>
            No items match the current filter. Use the <strong>Import Content</strong> button to fetch real dispatches from official Twitter/X, YouTube, or RSS agency sources.
          </p>
          <button
            onClick={() => setShowImportModal(true)}
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
            ➕ Import Content Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredPosts.map((item) => {
            const badge = getPlatformBadge(item.platform);
            const displayTitle = item.aiHeadline || item.rawTitle;
            const displayContent = item.aiSummary || item.rawContent;

            return (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  borderRadius: '16px',
                  border: item.isDuplicate
                    ? '1.5px solid rgba(239, 68, 68, 0.5)'
                    : item.status === 'approved_published'
                    ? '1.5px solid rgba(34, 197, 94, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Duplicate Alert Ribbon */}
                {item.isDuplicate && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      borderBottom: '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '7px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fca5a5'
                    }}
                  >
                    <AlertTriangle size={14} color="#ef4444" />
                    <span>நகல் கண்டறியப்பட்டது (Duplicate Detected • {item.duplicateScore}% Match)</span>
                  </div>
                )}

                {/* Card Header: Platform badge, Source info, Published Date */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.sourceAvatar ? (
                      <img
                        src={item.sourceAvatar}
                        alt={item.sourceName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlatformIcon platform={item.platform} size={16} color={badge.color} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                        {item.sourceName}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {item.sourceHandle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color,
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <PlatformIcon platform={item.platform} size={12} color={badge.color} />
                      <span>{badge.label}</span>
                    </span>

                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Open original post in new tab"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Media Preview Player */}
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    background: '#090d16',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.mediaType === 'video' || item.mediaUrl?.match(/\.(mp4|webm|mov)/i) ? (
                    <video
                      src={item.mediaUrl}
                      controls
                      poster={item.thumbnailUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <img
                      src={item.mediaUrl || item.thumbnailUrl}
                      alt="News media"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600';
                      }}
                    />
                  )}

                  <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                    <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {item.mediaType}
                    </span>
                    {item.aiProcessed && (
                      <span style={{ background: 'rgba(56, 189, 248, 0.9)', color: '#0f172a', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={10} />
                        <span>AI Cleaned</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Narrative Body */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Category & Location Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(234, 88, 12, 0.15)',
                        color: '#fb923c',
                        textTransform: 'uppercase'
                      }}
                    >
                      {item.aiCategory || 'CIVIC'}
                    </span>

                    {item.aiLocation?.placeName && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <MapPin size={11} color="#ea580c" />
                        <span>{item.aiLocation.placeName}</span>
                      </span>
                    )}

                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>
                      {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.4 }}>
                    {displayTitle}
                  </h4>

                  {/* Summary */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#cbd5e1',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {displayContent}
                  </p>

                  {/* Status Indicator Bar */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {item.status === 'staged_pending' ? (
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        <span>Staged (Direct publish blocked)</span>
                      </span>
                    ) : item.status === 'approved_published' ? (
                      <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        <span>Published to News Feed (Ref #{item.publishedPostId})</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={13} />
                        <span>Rejected ({item.rejectionReason})</span>
                      </span>
                    )}
                  </div>

                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <button
                    onClick={() => setEditorialPost(item)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                    title="Open AI news calibration modal"
                  >
                    <Sparkles size={13} />
                    <span>AI Edit & Calibrate</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.status === 'staged_pending' && (
                      <button
                        onClick={() => setEditorialPost(item)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={13} />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDispatch(item.id)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#fca5a5',
                        cursor: 'pointer'
                      }}
                      title="Delete staged dispatch"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportSocialModal
          onClose={() => setShowImportModal(false)}
          onFetchContent={onFetchContent}
          onFetchSuccess={(res) => {
            onRefreshPosts();
            showToast(`Successfully fetched ${res.newlyFetched.length} dispatches! (${res.duplicatesFound} duplicates flagged)`);
          }}
        />
      )}

      {/* AI Editorial & Calibration Modal */}
      {editorialPost && (
        <AiEditorialModal
          post={editorialPost}
          onClose={() => setEditorialPost(null)}
          onApprovePublish={async (id, data) => {
            await onApprovePublish(id, data);
            onRefreshPosts();
            showToast('Dispatch successfully approved and published to public news feed!');
          }}
          onReject={async (id, reason) => {
            await onReject(id, reason);
            onRefreshPosts();
            showToast('Dispatch rejected.');
          }}
          onAiEnhance={onAiEnhance}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(234, 88, 12, 0.4)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
