import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Upload,
  Film,
  Calendar,
  Clock,
  MapPin,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  Trash2,
  Edit2,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  Plus,
  Radio,
  Sliders,
  TrendingUp,
  Tag,
  Share2,
  Target,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type {
  Spotlight360Video,
  Spotlight360SubTab,
  BulkUploadVideoItem,
  Spotlight360Location,
  SpotlightRadiusKm,
  NewsCategory
} from '../../../types';
import { SpotlightReelPreviewModal } from './SpotlightReelPreviewModal';
import { BulkEditModal, SPOTLIGHT_PRESET_LOCATIONS } from './BulkEditModal';
import { CsvImportModal } from './CsvImportModal';
import { apiClient } from '../../../services/apiClient';
import {
  getStoredSpotlight360Videos,
  saveStoredSpotlight360Videos,
  addStoredSpotlight360Videos
} from '../../../services/storageService';

// Sample demo videos for instant testing if admin doesn't have local MP4 files handy
const DEMO_TEST_VIDEOS = [
  {
    fileName: 'ponneri_jewellery_ad.mp4',
    title: 'Ponneri Royal Jewellery Mega Festival',
    description: 'Exclusive 0% making charges this week only. Visit our Ponneri High Road showroom!',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
    location: SPOTLIGHT_PRESET_LOCATIONS[0], // Ponneri
    category: 'business',
    campaignName: 'Ponneri Jewellery Festival',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    cta: { type: 'call_now' as const, label: 'Call Showroom', actionUrl: 'tel:+919840123456' }
  },
  {
    fileName: 'minjur_college_campus.mp4',
    title: 'Minjur Engineering & Tech College Admissions',
    description: 'Admissions open for 2026-27 batch. Top placement records in Chennai & Tiruvallur.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600',
    location: SPOTLIGHT_PRESET_LOCATIONS[1], // Minjur
    category: 'community',
    campaignName: 'College Admissions 2026',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
    cta: { type: 'learn_more' as const, label: 'Apply Online', actionUrl: 'https://spotlight.local/admissions' }
  },
  {
    fileName: 'tiruvallur_monsoon_advisory.mp4',
    title: 'Tiruvallur District Monsoon Public Safety Advisory',
    description: 'Emergency 24/7 disaster control room contact numbers and heavy rain precautions.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600',
    location: SPOTLIGHT_PRESET_LOCATIONS[2], // Tiruvallur Town
    category: 'safety',
    campaignName: 'Monsoon Public Safety',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    cta: { type: 'call_now' as const, label: 'Call 1077 Helpline', actionUrl: 'tel:1077' }
  },
  {
    fileName: 'gummidipoondi_logistics_hub.mp4',
    title: 'Gummidipoondi Mega Logistics Park Opening',
    description: 'New warehouse facilities and logistics hubs open for industrial leasing.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    location: SPOTLIGHT_PRESET_LOCATIONS[3], // Gummidipoondi
    category: 'business',
    campaignName: 'Industrial Growth Drive',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    cta: { type: 'learn_more' as const, label: 'Book Space', actionUrl: 'https://spotlight.local/logistics' }
  }
];

interface Spotlight360ManagerProps {
  onRefreshData?: () => void;
  adminName?: string;
}

export const Spotlight360Manager: React.FC<Spotlight360ManagerProps> = ({
  onRefreshData,
  adminName = 'Editorial Authority'
}) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<Spotlight360SubTab>('bulk_upload');

  // Stored Spotlight360 published videos
  const [publishedVideos, setPublishedVideos] = useState<Spotlight360Video[]>(() =>
    getStoredSpotlight360Videos()
  );

  // Bulk Upload Queue State
  const [uploadQueue, setUploadQueue] = useState<BulkUploadVideoItem[]>([]);
  const [selectedQueueIds, setSelectedQueueIds] = useState<Set<string>>(new Set());
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(200); // Configurable limit: 50MB - 500MB
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  // Modals
  const [previewVideo, setPreviewVideo] = useState<BulkUploadVideoItem | Spotlight360Video | null>(null);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Search & Filter in Videos tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'draft'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from backend on mount
  useEffect(() => {
    apiClient.getSpotlight360Videos().then((serverVideos) => {
      if (serverVideos && serverVideos.length > 0) {
        setPublishedVideos(serverVideos);
        saveStoredSpotlight360Videos(serverVideos);
      }
    }).catch(() => {});
  }, []);

  // Extract thumbnail from video file using HTML5 canvas
  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;
        video.currentTime = 1;

        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 711; // 9:16 ratio
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400');
          }
          URL.revokeObjectURL(video.src);
        };

        video.onerror = () => {
          resolve('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400');
        };
      } catch {
        resolve('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400');
      }
    });
  };

  // Process and add files to upload queue
  const handleAddFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newItems: BulkUploadVideoItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Format check
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['mp4', 'mov', 'webm', 'm4v'].includes(ext || '')) {
        alert(`File "${file.name}" is not a supported video format (MP4, MOV, WebM).`);
        continue;
      }

      // Size check
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxFileSizeMB) {
        alert(`File "${file.name}" (${sizeMB.toFixed(1)} MB) exceeds configured limit of ${maxFileSizeMB} MB.`);
        continue;
      }

      // Default preset location assigned based on index modulo
      const defaultPreset = SPOTLIGHT_PRESET_LOCATIONS[i % SPOTLIGHT_PRESET_LOCATIONS.length];

      // Clean title from filename
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const item: BulkUploadVideoItem = {
        id: `bulk_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        fileName: file.name,
        fileSizeBytes: file.size,
        fileSizeFormatted: `${sizeMB.toFixed(1)} MB`,
        title: cleanTitle,
        description: `Spotlight360 hyperlocal broadcast for ${defaultPreset.area}.`,
        category: 'business',
        mediaUrl: URL.createObjectURL(file),
        thumbnailUrl: '',
        location: { ...defaultPreset, radiusKm: 5 as SpotlightRadiusKm },
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        campaignName: 'Spotlight360 Launch Campaign',
        cta: {
          type: 'call_now',
          label: 'Call Now',
          actionUrl: 'tel:+919840000000'
        },
        status: 'active',
        uploadProgress: 0,
        uploadStage: 'idle'
      };

      newItems.push(item);
    }

    setUploadQueue((prev) => [...newItems, ...prev]);

    // Asynchronously extract thumbnails & simulate upload pipeline
    for (const item of newItems) {
      if (item.file) {
        // Thumbnail generation
        generateVideoThumbnail(item.file).then((thumbUrl) => {
          setUploadQueue((current) =>
            current.map((it) => (it.id === item.id ? { ...it, thumbnailUrl: thumbUrl } : it))
          );
        });

        // Trigger upload pipeline simulation / actual R2 upload
        simulateUploadPipeline(item.id);
      }
    }
  };

  // Upload pipeline: Uploading -> Processing -> Thumbnail -> Ready
  const simulateUploadPipeline = (itemId: string) => {
    // 1. Uploading
    setUploadQueue((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, uploadStage: 'uploading', uploadProgress: 15 } : it))
    );

    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, uploadProgress: 65 } : it))
      );
    }, 400);

    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, uploadProgress: 100, uploadStage: 'processing' } : it))
      );
    }, 800);

    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, uploadStage: 'thumbnail' } : it))
      );
    }, 1200);

    setTimeout(() => {
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, uploadStage: 'ready' } : it))
      );
    }, 1600);
  };

  // Load sample demo videos for testing
  const handleLoadSampleVideos = () => {
    const demoItems: BulkUploadVideoItem[] = DEMO_TEST_VIDEOS.map((demo, idx) => ({
      id: `demo_${Date.now()}_${idx}`,
      fileName: demo.fileName,
      fileSizeBytes: 12500000,
      fileSizeFormatted: '12.5 MB',
      title: demo.title,
      description: demo.description,
      category: demo.category,
      mediaUrl: demo.mediaUrl,
      thumbnailUrl: demo.thumbnailUrl,
      location: { ...demo.location, radiusKm: 5 as SpotlightRadiusKm },
      startDate: demo.startDate,
      endDate: demo.endDate,
      campaignName: demo.campaignName,
      cta: demo.cta,
      status: 'active',
      uploadProgress: 100,
      uploadStage: 'ready'
    }));

    setUploadQueue((prev) => [...demoItems, ...prev]);
    // Pre-select all
    setSelectedQueueIds(new Set(demoItems.map((d) => d.id)));
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Selection
  const toggleSelectQueueItem = (id: string) => {
    setSelectedQueueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllQueue = () => {
    if (selectedQueueIds.size === uploadQueue.length) {
      setSelectedQueueIds(new Set());
    } else {
      setSelectedQueueIds(new Set(uploadQueue.map((it) => it.id)));
    }
  };

  // Bulk Apply updates to selected items
  const handleApplyBulkUpdates = (updates: any) => {
    setUploadQueue((prev) =>
      prev.map((it) => {
        if (!selectedQueueIds.has(it.id)) return it;
        return {
          ...it,
          ...(updates.location ? { location: updates.location } : {}),
          ...(updates.startDate ? { startDate: updates.startDate } : {}),
          ...(updates.endDate ? { endDate: updates.endDate } : {}),
          ...(updates.category ? { category: updates.category } : {}),
          ...(updates.campaignName ? { campaignName: updates.campaignName } : {}),
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.cta ? { cta: updates.cta } : {})
        };
      })
    );
  };

  // Apply CSV Mappings
  const handleApplyCsvMappings = (rows: any[]) => {
    setUploadQueue((prev) => {
      return prev.map((item) => {
        const matchingRow = rows.find(
          (r) => r.fileName.toLowerCase() === item.fileName.toLowerCase()
        );
        if (!matchingRow) return item;

        // Find preset coordinate for locationName
        const foundPreset = SPOTLIGHT_PRESET_LOCATIONS.find(
          (p) => p.area.toLowerCase() === matchingRow.locationName.toLowerCase()
        ) || {
          ...item.location,
          area: matchingRow.locationName
        };

        return {
          ...item,
          title: matchingRow.title || item.title,
          category: matchingRow.category || item.category,
          campaignName: matchingRow.campaignName || item.campaignName,
          startDate: matchingRow.startDate || item.startDate,
          endDate: matchingRow.endDate || item.endDate,
          location: {
            ...foundPreset,
            radiusKm: matchingRow.radiusKm || item.location.radiusKm
          }
        };
      });
    });
  };

  // Remove single item from queue
  const handleRemoveQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((it) => it.id !== id));
    setSelectedQueueIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Publish Selected or All
  const handlePublishVideos = async (onlySelected: boolean) => {
    const itemsToPublish = uploadQueue.filter((it) =>
      onlySelected ? selectedQueueIds.has(it.id) : true
    );

    if (itemsToPublish.length === 0) {
      alert('Please select at least one video to publish.');
      return;
    }

    setIsPublishing(true);

    const convertedVideos: Spotlight360Video[] = itemsToPublish.map((it) => ({
      id: it.id,
      title: it.title,
      description: it.description,
      category: it.category,
      mediaUrl: it.mediaUrl,
      thumbnailUrl: it.thumbnailUrl || it.mediaUrl,
      durationSeconds: 30,
      location: it.location,
      startDate: it.startDate,
      endDate: it.endDate,
      campaignName: it.campaignName,
      advertiserName: adminName,
      cta: it.cta,
      status: it.status,
      views: 0,
      impressions: 0,
      clicks: 0,
      createdAt: new Date().toISOString()
    }));

    try {
      // 1. Send to Backend API
      await apiClient.createSpotlight360Videos(convertedVideos);

      // 2. Persist in LocalStorage
      addStoredSpotlight360Videos(convertedVideos);
      setPublishedVideos((prev) => [...convertedVideos, ...prev]);

      // 3. Remove published items from upload queue
      const publishedIds = new Set(itemsToPublish.map((it) => it.id));
      setUploadQueue((prev) => prev.filter((it) => !publishedIds.has(it.id)));
      setSelectedQueueIds(new Set());

      // 4. Refresh global app state
      if (onRefreshData) onRefreshData();

      setPublishSuccessMessage(`Successfully published ${convertedVideos.length} Spotlight360 video reels!`);
      setTimeout(() => setPublishSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(`Publishing failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtered published videos
  const filteredVideos = useMemo(() => {
    return publishedVideos.filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (locationFilter !== 'all' && v.location.area !== locationFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.title.toLowerCase().includes(q) ||
          v.location.area.toLowerCase().includes(q) ||
          (v.campaignName && v.campaignName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [publishedVideos, statusFilter, locationFilter, searchQuery]);

  // Aggregate stats for Dashboard tab
  const stats = useMemo(() => {
    const totalVideos = publishedVideos.length;
    const activeVideos = publishedVideos.filter((v) => v.status === 'active').length;
    const scheduledVideos = publishedVideos.filter((v) => v.status === 'scheduled').length;
    const totalViews = publishedVideos.reduce((acc, v) => acc + (v.views || 0), 0);
    const totalImpressions = publishedVideos.reduce((acc, v) => acc + (v.impressions || 0), 0);
    const uniqueLocations = new Set(publishedVideos.map((v) => v.location.area)).size;
    const uniqueCampaigns = new Set(publishedVideos.map((v) => v.campaignName).filter(Boolean)).size;

    return {
      totalVideos,
      activeVideos,
      scheduledVideos,
      totalViews,
      totalImpressions,
      uniqueLocations,
      uniqueCampaigns
    };
  }, [publishedVideos]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Spotlight360 Master Top Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #311042 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255, 69, 0, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ff4500, #ea580c)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 69, 0, 0.4)'
            }}
          >
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, letterSpacing: '-0.3px' }}>
                Spotlight360 Studio
              </h2>
              <span
                style={{
                  background: 'rgba(255, 69, 0, 0.25)',
                  color: '#ff7a45',
                  border: '1px solid rgba(255, 69, 0, 0.5)',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}
              >
                Hyperlocal Broadcast Hub
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              10/20/50+ பல வீடியோக்களை ஒரே நேரத்தில் அப்லோட் செய்து, குறிப்பிட்ட ஊர்/ரேடியஸ் வாரியாக ஒளிபரப்புங்கள்.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveSubTab('bulk_upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(90deg, #ff4500, #ea580c)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 69, 0, 0.4)'
            }}
          >
            <Upload size={15} />
            <span>Bulk Video Upload</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {publishSuccessMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 10000,
            background: '#059669',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          <CheckCircle2 size={18} />
          <span>{publishSuccessMessage}</span>
        </div>
      )}

      {/* 2. Sub-Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#ffffff',
          padding: '6px 8px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'bulk_upload', label: 'Bulk Video Upload', icon: Upload, isNew: true },
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'videos', label: `Videos (${publishedVideos.length})`, icon: Film },
          { id: 'scheduled', label: `Scheduled Videos (${stats.scheduledVideos})`, icon: Calendar },
          { id: 'active', label: `Active Videos (${stats.activeVideos})`, icon: Radio },
          { id: 'location_targeting', label: 'Location Targeting', icon: MapPin },
          { id: 'campaigns', label: 'Campaigns', icon: Layers },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as Spotlight360SubTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                background: isActive ? '#fff7ed' : 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)'} />
              <span>{tab.label}</span>
              {tab.isNew && (
                <span
                  style={{
                    background: 'var(--brand-primary)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 900,
                    padding: '1px 5px',
                    borderRadius: '6px',
                    letterSpacing: '0.4px'
                  }}
                >
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: BULK VIDEO UPLOAD (THE CORE NEW ENGINE)                    */}
      {/* ==================================================================== */}
      {activeSubTab === 'bulk_upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              background: '#ffffff',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/mp4,video/quicktime,video/webm,video/m4v"
              onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
              style={{ display: 'none' }}
            />

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: '#fff7ed',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 4px 12px rgba(255, 69, 0, 0.15)'
              }}
            >
              <Upload size={30} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Drag & Drop Videos Here, or Click to Browse
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px' }}>
              ஒரே நேரத்தில் <strong>10 / 20 / 50+ வீடியோக்களை</strong> தேர்ந்தெடுக்கலாம். ஆதரிக்கப்படும் வடிவங்கள்: MP4, MOV, WebM.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>Choose Multiple Video Files</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleVideos}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Loads 4 sample Ponneri, Minjur, Tiruvallur videos for testing"
              >
                <Sparkles size={14} />
                <span>Load Sample Test Videos (4 Files)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCsvModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <FileSpreadsheet size={14} />
                <span>CSV / Excel Bulk Import</span>
              </button>
            </div>

            {/* Configurable Max Size Limit Slider */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '16px',
                padding: '6px 14px',
                background: '#f8fafc',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sliders size={13} color="var(--brand-primary)" />
              <span>Max file size limit:</span>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxFileSizeMB}
                onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                style={{ width: '100px', cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
              />
              <strong style={{ color: 'var(--text-primary)' }}>{maxFileSizeMB} MB</strong>
            </div>
          </div>

          {/* 2. Bulk Details Action Bar & Staged Videos Table */}
          {uploadQueue.length > 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* Batch Action Toolbar */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={toggleSelectAllQueue}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span>
                      {selectedQueueIds.size === uploadQueue.length
                        ? 'Deselect All'
                        : `Select All (${uploadQueue.length})`}
                    </span>
                  </button>

                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {selectedQueueIds.size} Selected
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Bulk Edit Button */}
                  <button
                    type="button"
                    disabled={selectedQueueIds.size === 0}
                    onClick={() => setShowBulkEditModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: selectedQueueIds.size > 0 ? '#eff6ff' : '#f1f5f9',
                      color: selectedQueueIds.size > 0 ? '#1d4ed8' : '#94a3b8',
                      border: selectedQueueIds.size > 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: selectedQueueIds.size > 0 ? 'pointer' : 'not-allowed'
                    }}
                    title="Apply details to all selected videos at once"
                  >
                    <Layers size={14} />
                    <span>Bulk Edit ({selectedQueueIds.size})</span>
                  </button>

                  {/* Publish Selected */}
                  <button
                    type="button"
                    disabled={selectedQueueIds.size === 0 || isPublishing}
                    onClick={() => handlePublishVideos(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: selectedQueueIds.size > 0 ? '#10b981' : '#f1f5f9',
                      color: selectedQueueIds.size > 0 ? '#ffffff' : '#94a3b8',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: selectedQueueIds.size > 0 && !isPublishing ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{isPublishing ? 'Publishing...' : `Publish Selected (${selectedQueueIds.size})`}</span>
                  </button>

                  {/* Publish All */}
                  <button
                    type="button"
                    disabled={uploadQueue.length === 0 || isPublishing}
                    onClick={() => handlePublishVideos(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: !isPublishing ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 8px rgba(255, 69, 0, 0.35)'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Publish All ({uploadQueue.length})</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 14px', width: '36px' }}>
                        <input
                          type="checkbox"
                          checked={selectedQueueIds.size === uploadQueue.length && uploadQueue.length > 0}
                          onChange={toggleSelectAllQueue}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ padding: '12px 10px', width: '70px' }}>Preview</th>
                      <th style={{ padding: '12px 12px' }}>Video / Title</th>
                      <th style={{ padding: '12px 12px' }}>Target Location & Radius</th>
                      <th style={{ padding: '12px 12px' }}>Category & Campaign</th>
                      <th style={{ padding: '12px 12px' }}>Schedule</th>
                      <th style={{ padding: '12px 12px' }}>Upload Progress</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadQueue.map((item) => {
                      const isSelected = selectedQueueIds.has(item.id);

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isSelected ? '#fffbf5' : '#ffffff',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '12px 14px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectQueueItem(item.id)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                            />
                          </td>

                          {/* Thumbnail / Reel Click */}
                          <td style={{ padding: '12px 10px' }}>
                            <div
                              onClick={() => setPreviewVideo(item)}
                              style={{
                                width: '56px',
                                height: '80px',
                                borderRadius: '8px',
                                background: '#090d16',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: 'pointer',
                                border: '1px solid #cbd5e1'
                              }}
                              title="Click to preview Reel"
                            >
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                                  <Film size={18} />
                                </div>
                              )}
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff'
                                }}
                              >
                                <Play size={16} />
                              </div>
                            </div>
                          </td>

                          {/* Title & File details */}
                          <td style={{ padding: '12px 12px', minWidth: '220px' }}>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setUploadQueue((prev) =>
                                  prev.map((it) => (it.id === item.id ? { ...it, title: val } : it))
                                );
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '4px'
                              }}
                            />
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', gap: '8px' }}>
                              <span>📁 {item.fileName}</span>
                              <span>•</span>
                              <span>{item.fileSizeFormatted}</span>
                            </div>
                          </td>

                          {/* Location & Radius */}
                          <td style={{ padding: '12px 12px', minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <MapPin size={13} color="var(--brand-primary)" />
                              <select
                                value={item.location.area}
                                onChange={(e) => {
                                  const found = SPOTLIGHT_PRESET_LOCATIONS.find((p) => p.area === e.target.value);
                                  if (found) {
                                    setUploadQueue((prev) =>
                                      prev.map((it) =>
                                        it.id === item.id
                                          ? { ...it, location: { ...found, radiusKm: it.location.radiusKm } }
                                          : it
                                      )
                                    );
                                  }
                                }}
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  background: '#ffffff'
                                }}
                              >
                                {SPOTLIGHT_PRESET_LOCATIONS.map((preset) => (
                                  <option key={preset.area} value={preset.area}>
                                    {preset.area} ({preset.district})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                              <span style={{ color: 'var(--text-tertiary)' }}>Radius:</span>
                              <select
                                value={item.location.radiusKm}
                                onChange={(e) => {
                                  const r = Number(e.target.value) as SpotlightRadiusKm;
                                  setUploadQueue((prev) =>
                                    prev.map((it) =>
                                      it.id === item.id ? { ...it, location: { ...it.location, radiusKm: r } } : it
                                    )
                                  );
                                }}
                                style={{
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: 'var(--brand-primary)'
                                }}
                              >
                                <option value="1">1 km</option>
                                <option value="3">3 km</option>
                                <option value="5">5 km</option>
                                <option value="10">10 km</option>
                                <option value="25">25 km</option>
                              </select>
                            </div>
                          </td>

                          {/* Category & Campaign */}
                          <td style={{ padding: '12px 12px', minWidth: '160px' }}>
                            <div style={{ marginBottom: '4px' }}>
                              <span
                                style={{
                                  background: '#f1f5f9',
                                  color: 'var(--text-secondary)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {item.category}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {item.campaignName || 'General Campaign'}
                            </div>
                          </td>

                          {/* Schedule */}
                          <td style={{ padding: '12px 12px', minWidth: '140px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                              <Calendar size={11} />
                              <span>{item.startDate}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              <span>to {item.endDate}</span>
                            </div>
                          </td>

                          {/* Upload Progress */}
                          <td style={{ padding: '12px 12px', minWidth: '150px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              {item.uploadStage === 'ready' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#059669', fontSize: '11px', fontWeight: 800 }}>
                                  <CheckCircle2 size={13} />
                                  <span>Ready</span>
                                </span>
                              ) : item.uploadStage === 'error' ? (
                                <button
                                  type="button"
                                  onClick={() => simulateUploadPipeline(item.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecdd3',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <RotateCcw size={11} />
                                  <span>Retry</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                  {item.uploadStage === 'uploading'
                                    ? `Uploading ${item.uploadProgress}%`
                                    : item.uploadStage === 'processing'
                                    ? 'Processing...'
                                    : 'Generating Thumbnail...'}
                                </span>
                              )}
                            </div>

                            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${item.uploadProgress}%`,
                                  background: item.uploadStage === 'ready' ? '#10b981' : 'var(--brand-primary)',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setPreviewVideo(item)}
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Preview Reel"
                              >
                                <Play size={11} />
                                <span>Preview</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveQueueItem(item.id)}
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                                title="Remove video"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: DASHBOARD                                                 */}
      {/* ==================================================================== */}
      {activeSubTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Spotlight360 Videos
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                {stats.totalVideos}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                Across Chennai & Tiruvallur
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Live Reels
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                {stats.activeVideos}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Currently served to citizens
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Scheduled Future Broadcasts
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
                {stats.scheduledVideos}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Pending launch date
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Locations Covered
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '4px' }}>
                {stats.uniqueLocations || SPOTLIGHT_PRESET_LOCATIONS.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Hyperlocal radius hubs
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Need to launch new targeted campaigns across North Tamil Nadu?
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Upload multiple reels at once and apply radius targeting in Ponneri, Minjur, Tiruvallur, or Chennai.
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('bulk_upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 69, 0, 0.35)'
              }}
            >
              <Upload size={16} />
              <span>Go to Bulk Video Upload</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: VIDEOS LIST (ALL SPOTLIGHT360 VIDEOS)                      */}
      {/* ==================================================================== */}
      {(activeSubTab === 'videos' || activeSubTab === 'scheduled' || activeSubTab === 'active') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Filter Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '14px 18px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search videos by title, area, or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  background: 'transparent'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: '#ffffff'
                }}
              >
                <option value="all">All Locations</option>
                {SPOTLIGHT_PRESET_LOCATIONS.map((l) => (
                  <option key={l.area} value={l.area}>
                    {l.area}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: '#ffffff'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (Live)</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <Film size={36} style={{ color: '#94a3b8', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No Spotlight360 Videos Found
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 16px' }}>
                Use the Bulk Video Upload tab to upload multiple campaign reels with hyperlocal targeting.
              </p>
              <button
                onClick={() => setActiveSubTab('bulk_upload')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Upload Videos Now
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Thumbnail / Header */}
                  <div
                    onClick={() => setPreviewVideo(video)}
                    style={{
                      height: '160px',
                      background: '#090d16',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    title="Click to Preview Reel"
                  >
                    <img
                      src={video.thumbnailUrl || video.mediaUrl}
                      alt={video.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(255, 69, 0, 0.9)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Play size={16} />
                      </div>
                    </div>

                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        color: '#38bdf8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <MapPin size={10} />
                      {video.location.area} • {video.location.radiusKm || 5} km
                    </span>

                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: video.status === 'active' ? '#10b981' : '#0284c7',
                        color: '#ffffff',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}
                    >
                      {video.status}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.35 }}>
                        {video.title}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                        {video.description || 'No description provided.'}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          paddingTop: '10px',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: 'var(--text-tertiary)'
                        }}
                      >
                        <span>Campaign: {video.campaignName || 'Spotlight360'}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(video)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--brand-primary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Play size={11} />
                          <span>Preview Reel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 4: LOCATION TARGETING                                        */}
      {/* ==================================================================== */}
      {activeSubTab === 'location_targeting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
              North Tamil Nadu Hyperlocal Coverage & Radius Hubs
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Users within each radius hub will only see videos published with that specific location targeting in Spots/Reels.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {SPOTLIGHT_PRESET_LOCATIONS.map((loc) => {
                const count = publishedVideos.filter((v) => v.location.area === loc.area).length;

                return (
                  <div
                    key={loc.area}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {loc.area}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 700 }}>
                        {loc.district}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Pincode: {loc.pincode} • Lat: {loc.lat}, Lng: {loc.lng}
                    </div>

                    <div
                      style={{
                        marginTop: '6px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px'
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Active Broadcasts:</span>
                      <strong style={{ color: count > 0 ? '#10b981' : '#94a3b8' }}>
                        {count} {count === 1 ? 'Reel' : 'Reels'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 5: CAMPAIGNS & ANALYTICS                                     */}
      {/* ==================================================================== */}
      {(activeSubTab === 'campaigns' || activeSubTab === 'analytics') && (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
            Spotlight360 Campaign Performance & Citizen Engagement
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Telemetry of impressions, video watch time, and CTA click-through rates across Chennai and Tiruvallur Districts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>Total Impressions</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '4px' }}>
                {stats.totalImpressions.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>Total Reel Views</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                {stats.totalViews.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700 }}>Active Campaigns</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
                {stats.uniqueCampaigns || 1}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reel-Style Vertical Preview Modal */}
      {previewVideo && (
        <SpotlightReelPreviewModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <BulkEditModal
          selectedCount={selectedQueueIds.size}
          onClose={() => setShowBulkEditModal(false)}
          onApply={handleApplyBulkUpdates}
        />
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <CsvImportModal
          currentVideos={uploadQueue}
          onClose={() => setShowCsvModal(false)}
          onApplyCsvData={handleApplyCsvMappings}
        />
      )}
    </div>
  );
};
