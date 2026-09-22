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
  ShieldCheck,
  UserPlus,
  Users,
  UserCheck,
  Check,
  X
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
  addStoredSpotlight360Videos,
  getStoredCreators,
  saveStoredCreator,
  DEFAULT_CREATORS,
  CreatorItem
} from '../../../services/storageService';

// Sample demo videos for instant testing if admin doesn't have local MP4 files handy
const DEMO_TEST_VIDEOS = [
  {
    fileName: 'ponneri_jewellery_ad.mp4',
    title: 'Ponneri Royal Jewellery Mega Festival',
    description: 'Exclusive 0% making charges this week only. Visit our Ponneri High Road showroom!',
    mediaUrl: 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1790055069322_p0l98f.mp4',
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
    mediaUrl: 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789997093458_sk5cm0.mp4',
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
    mediaUrl: 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789996953775_f7x7uj.mp4',
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
    mediaUrl: 'https://pub-5051362230a34232ba4afb2cf7ac345c.r2.dev/videos/1789995126975_l0csk7.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    location: SPOTLIGHT_PRESET_LOCATIONS[3], // Gummidipoondi
    category: 'business',
    campaignName: 'Industrial Growth Drive',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    cta: { type: 'learn_more' as const, label: 'Book Space', actionUrl: 'https://spotlight.local/logistics' }
  }
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200',
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'
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

  // Creators / Reporters Directory
  const [creators, setCreators] = useState<CreatorItem[]>(() => getStoredCreators());
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [quickCreateTargetItemId, setQuickCreateTargetItemId] = useState<string | null>(null);
  const [newReporterName, setNewReporterName] = useState('');
  const [newReporterHandle, setNewReporterHandle] = useState('');
  const [newReporterHandleEdited, setNewReporterHandleEdited] = useState(false);
  const [newReporterVerified, setNewReporterVerified] = useState(true);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [isCreatingCreator, setIsCreatingCreator] = useState(false);
  const [bulkNewUserName, setBulkNewUserName] = useState('');
  const [bulkNewUserHandle, setBulkNewUserHandle] = useState('');
  const [bulkNewUserAvatar, setBulkNewUserAvatar] = useState(PRESET_AVATARS[0]);
  const [bulkNewUserVerified, setBulkNewUserVerified] = useState(true);

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

    apiClient.getCreators().then((serverCreators) => {
      if (serverCreators && serverCreators.length > 0) {
        setCreators(serverCreators);
        serverCreators.forEach((c) => saveStoredCreator(c));
      }
    }).catch(() => {});
  }, []);

  // Quick Create a new reporter / creator from admin dashboard
  const handleSaveQuickCreator = async () => {
    if (!newReporterName.trim()) {
      alert('Please enter a reporter / creator name');
      return;
    }
    const cleanHandle = newReporterHandle.trim().startsWith('@')
      ? newReporterHandle.trim()
      : `@${newReporterHandle.trim() || newReporterName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    setIsCreatingCreator(true);
    try {
      const created = await apiClient.createCreator({
        name: newReporterName.trim(),
        handle: cleanHandle,
        avatar: selectedAvatarUrl,
        verified: newReporterVerified
      });

      const finalCreator: CreatorItem = created || {
        id: `usr_${Date.now()}`,
        name: newReporterName.trim(),
        handle: cleanHandle,
        avatar: selectedAvatarUrl,
        verified: newReporterVerified
      };

      saveStoredCreator(finalCreator);
      setCreators((prev) => [finalCreator, ...prev.filter((c) => c.id !== finalCreator.id)]);

      // If this quick-create was triggered from a specific video item row:
      if (quickCreateTargetItemId) {
        setUploadQueue((prev) =>
          prev.map((it) =>
            it.id === quickCreateTargetItemId
              ? {
                  ...it,
                  creatorId: finalCreator.id,
                  creatorName: finalCreator.name,
                  creatorHandle: finalCreator.handle,
                  creatorAvatar: finalCreator.avatar,
                  creatorVerified: finalCreator.verified
                }
              : it
          )
        );
      }

      // Reset modal state
      setShowQuickCreateModal(false);
      setQuickCreateTargetItemId(null);
      setNewReporterName('');
      setNewReporterHandle('');
      setNewReporterHandleEdited(false);
    } catch (err: any) {
      alert(`Failed to create reporter: ${err.message || 'Unknown error'}`);
    } finally {
      setIsCreatingCreator(false);
    }
  };

  // Create and apply a new user to all checked queue items
  const handleApplyBulkAssignCreator = () => {
    if (!bulkNewUserName.trim()) {
      alert('Please enter the user / reporter name');
      return;
    }
    const cleanHandle = bulkNewUserHandle.trim().startsWith('@')
      ? bulkNewUserHandle.trim()
      : `@${bulkNewUserHandle.trim() || bulkNewUserName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')}`;

    const newCreatorId = `usr_${cleanHandle.replace(/^@/, '') || Date.now()}`;
    const newCreator: CreatorItem = {
      id: newCreatorId,
      name: bulkNewUserName.trim(),
      handle: cleanHandle,
      avatar: bulkNewUserAvatar,
      verified: bulkNewUserVerified
    };

    saveStoredCreator(newCreator);
    setCreators((prev) => [newCreator, ...prev.filter((c) => c.id !== newCreator.id)]);
    apiClient.createCreator(newCreator).catch(() => {});

    setUploadQueue((prev) =>
      prev.map((it) => {
        if (!selectedQueueIds.has(it.id)) return it;
        return {
          ...it,
          creatorId: newCreator.id,
          creatorName: newCreator.name,
          creatorHandle: newCreator.handle,
          creatorAvatar: newCreator.avatar,
          creatorVerified: newCreator.verified
        };
      })
    );

    setShowBulkAssignModal(false);
    setBulkNewUserName('');
    setBulkNewUserHandle('');
  };

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
      const defaultCreator = (creators.length > 0 ? creators[i % creators.length] : null) || DEFAULT_CREATORS[i % DEFAULT_CREATORS.length];

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
        creatorId: defaultCreator?.id || 'usr_newsdesk',
        creatorName: defaultCreator?.name || 'Tamil News 24/7',
        creatorHandle: defaultCreator?.handle || '@tamilnews247',
        creatorAvatar: defaultCreator?.avatar || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150',
        creatorVerified: defaultCreator?.verified ?? true,
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

    // Asynchronously extract thumbnails & execute real Cloudflare R2 upload pipeline
    for (const item of newItems) {
      if (item.file) {
        // Real upload to Cloudflare R2 with progress tracking
        uploadVideoItemToR2(item);
      }
    }
  };

  // Real upload pipeline: Uploading Video to Cloudflare R2 -> Generate & Upload Thumbnail -> Ready
  const uploadVideoItemToR2 = async (item: BulkUploadVideoItem): Promise<{ mediaUrl: string; thumbnailUrl: string }> => {
    if (!item.file) {
      return { mediaUrl: item.mediaUrl, thumbnailUrl: item.thumbnailUrl || item.mediaUrl };
    }

    try {
      // 1. Stage: Uploading Video
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, uploadStage: 'uploading', uploadProgress: 10 } : it))
      );

      const ext = item.file.name.split('.').pop() || 'mp4';
      const videoFilename = `sp360_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

      const r2VideoUrl = await apiClient.uploadFileToR2(
        item.file,
        videoFilename,
        'videos',
        (percent) => {
          setUploadQueue((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, uploadProgress: Math.min(85, Math.max(10, percent)) } : it))
          );
        }
      );

      // 2. Stage: Thumbnail
      setUploadQueue((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, mediaUrl: r2VideoUrl, uploadStage: 'thumbnail', uploadProgress: 90 } : it))
      );

      let r2ThumbUrl = item.thumbnailUrl;
      try {
        const thumbDataUrl = await generateVideoThumbnail(item.file);
        const res = await fetch(thumbDataUrl);
        const thumbBlob = await res.blob();
        const thumbFilename = `thumb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
        r2ThumbUrl = await apiClient.uploadFileToR2(thumbBlob, thumbFilename, 'thumbnails');
      } catch (thumbErr) {
        console.warn('[Thumbnail R2 Upload notice in Spotlight360]:', thumbErr);
        if (!r2ThumbUrl || r2ThumbUrl.startsWith('data:')) {
          r2ThumbUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400';
        }
      }

      // 3. Stage: Ready
      setUploadQueue((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                mediaUrl: r2VideoUrl,
                thumbnailUrl: r2ThumbUrl,
                uploadStage: 'ready',
                uploadProgress: 100
              }
            : it
        )
      );

      return { mediaUrl: r2VideoUrl, thumbnailUrl: r2ThumbUrl };
    } catch (uploadErr: any) {
      console.error(`[R2 Bulk Upload Error for ${item.fileName}]:`, uploadErr);
      setUploadQueue((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                uploadStage: 'error',
                uploadProgress: 0,
                errorMessage: uploadErr.message || 'Upload failed'
              }
            : it
        )
      );
      throw uploadErr;
    }
  };

  // Load sample demo videos for testing
  const handleLoadSampleVideos = () => {
    const demoItems: BulkUploadVideoItem[] = DEMO_TEST_VIDEOS.map((demo, idx) => {
      const assignedCreator = (creators.length > 0 ? creators[idx % creators.length] : null) || DEFAULT_CREATORS[idx % DEFAULT_CREATORS.length];
      return {
        id: `demo_${Date.now()}_${idx}`,
        fileName: demo.fileName,
        fileSizeBytes: 12500000,
        fileSizeFormatted: '12.5 MB',
        title: demo.title,
        description: demo.description,
        category: demo.category,
        mediaUrl: demo.mediaUrl,
        thumbnailUrl: demo.thumbnailUrl,
        creatorId: assignedCreator?.id || 'usr_newsdesk',
        creatorName: assignedCreator?.name || 'Tamil News 24/7',
        creatorHandle: assignedCreator?.handle || '@tamilnews247',
        creatorAvatar: assignedCreator?.avatar || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150',
        creatorVerified: assignedCreator?.verified ?? true,
        location: { ...demo.location, radiusKm: 5 as SpotlightRadiusKm },
        startDate: demo.startDate,
        endDate: demo.endDate,
        campaignName: demo.campaignName,
        cta: demo.cta,
        status: 'active',
        uploadProgress: 100,
        uploadStage: 'ready'
      };
    });

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
          ...(updates.cta ? { cta: updates.cta } : {}),
          ...(updates.creator ? {
            creatorId: updates.creator.id,
            creatorName: updates.creator.name,
            creatorHandle: updates.creator.handle,
            creatorAvatar: updates.creator.avatar,
            creatorVerified: updates.creator.verified
          } : {})
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

    try {
      // 1. Ensure all items have finished Cloudflare R2 upload (never publish temporary blob: URLs)
      const convertedVideos: Spotlight360Video[] = [];

      for (const it of itemsToPublish) {
        let finalMediaUrl = it.mediaUrl;
        let finalThumbnailUrl = it.thumbnailUrl;

        // If video still has temporary local blob URL or uncompleted upload, execute R2 upload now
        if (it.file && (!finalMediaUrl || finalMediaUrl.startsWith('blob:') || it.uploadStage !== 'ready')) {
          const uploaded = await uploadVideoItemToR2(it);
          finalMediaUrl = uploaded.mediaUrl;
          finalThumbnailUrl = uploaded.thumbnailUrl;
        }

        // Fallback safeguard: if somehow it is still a blob URL (e.g. without file object), reject or warn
        if (finalMediaUrl.startsWith('blob:')) {
          throw new Error(`Video "${it.fileName}" is not uploaded to cloud storage yet. Please re-select the file.`);
        }

        convertedVideos.push({
          id: it.id,
          title: it.title,
          description: it.description,
          category: it.category,
          mediaUrl: finalMediaUrl,
          thumbnailUrl: finalThumbnailUrl || finalMediaUrl,
          creatorId: it.creatorId || 'usr_newsdesk',
          creatorName: it.creatorName || adminName,
          creatorHandle: it.creatorHandle || '@tn_spotlight',
          creatorAvatar: it.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          creatorVerified: it.creatorVerified ?? true,
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
        });
      }

      // 2. Send to Backend API
      await apiClient.createSpotlight360Videos(convertedVideos);

      // 3. Persist in LocalStorage
      addStoredSpotlight360Videos(convertedVideos);
      setPublishedVideos((prev) => [...convertedVideos, ...prev]);

      // 4. Remove published items from upload queue
      const publishedIds = new Set(itemsToPublish.map((it) => it.id));
      setUploadQueue((prev) => prev.filter((it) => !publishedIds.has(it.id)));
      setSelectedQueueIds(new Set());

      // 5. Refresh global app state
      if (onRefreshData) onRefreshData();

      setPublishSuccessMessage(`Successfully published ${convertedVideos.length} Spotlight360 video reels to cloud CDN!`);
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

                  {/* Create User for Selected Button */}
                  <button
                    type="button"
                    disabled={selectedQueueIds.size === 0}
                    onClick={() => {
                      setBulkNewUserName('');
                      setBulkNewUserHandle('');
                      setShowBulkAssignModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: selectedQueueIds.size > 0 ? '#fdf4ff' : '#f1f5f9',
                      color: selectedQueueIds.size > 0 ? '#9333ea' : '#94a3b8',
                      border: selectedQueueIds.size > 0 ? '1px solid #f0abfc' : '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: selectedQueueIds.size > 0 ? 'pointer' : 'not-allowed'
                    }}
                    title="Create and set a new user for all selected videos"
                  >
                    <UserPlus size={14} />
                    <span>Create User for Selected ({selectedQueueIds.size})</span>
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
                      <th style={{ padding: '12px 12px', minWidth: '220px' }}>Creator / Reporter (Create User)</th>
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

                          {/* Creator / Reporter (Create User Directly) */}
                          <td style={{ padding: '10px 12px', minWidth: '230px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {/* User Display Name Input */}
                              <input
                                type="text"
                                placeholder="Create User / Channel Name"
                                value={item.creatorName || ''}
                                onChange={(e) => {
                                  const name = e.target.value;
                                  const slug = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                                  setUploadQueue((prev) =>
                                    prev.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            creatorName: name,
                                            creatorHandle: it.creatorHandle && it.creatorHandle !== '@reporter' ? it.creatorHandle : (slug ? `@${slug}` : '@reporter'),
                                            creatorId: `usr_${slug || Date.now()}`
                                          }
                                        : it
                                    )
                                  );
                                }}
                                style={{
                                  width: '100%',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                  background: '#ffffff'
                                }}
                              />

                              {/* Handle & Avatar Row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {/* Avatar Click to Cycle */}
                                <div
                                  onClick={() => {
                                    const currIdx = PRESET_AVATARS.indexOf(item.creatorAvatar || '');
                                    const nextAvatar = PRESET_AVATARS[(currIdx + 1) % PRESET_AVATARS.length];
                                    setUploadQueue((prev) =>
                                      prev.map((it) => (it.id === item.id ? { ...it, creatorAvatar: nextAvatar } : it))
                                    );
                                  }}
                                  title="Click to cycle avatar"
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '2px solid var(--brand-primary)',
                                    flexShrink: 0
                                  }}
                                >
                                  <img
                                    src={item.creatorAvatar || PRESET_AVATARS[0]}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>

                                {/* Handle input */}
                                <input
                                  type="text"
                                  placeholder="@handle"
                                  value={item.creatorHandle || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const clean = val.startsWith('@') ? val : `@${val}`;
                                    setUploadQueue((prev) =>
                                      prev.map((it) => (it.id === item.id ? { ...it, creatorHandle: clean } : it))
                                    );
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    background: '#ffffff',
                                    minWidth: 0
                                  }}
                                />

                                {/* Verified Toggle */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadQueue((prev) =>
                                      prev.map((it) =>
                                        it.id === item.id ? { ...it, creatorVerified: !it.creatorVerified } : it
                                      )
                                    );
                                  }}
                                  title={item.creatorVerified ? 'Verified Badge (Active)' : 'Unverified (Click to enable)'}
                                  style={{
                                    border: 'none',
                                    background: item.creatorVerified ? '#e0f2fe' : '#f1f5f9',
                                    color: item.creatorVerified ? '#0284c7' : '#94a3b8',
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    flexShrink: 0
                                  }}
                                >
                                  <CheckCircle2 size={12} color={item.creatorVerified ? '#0284c7' : '#94a3b8'} />
                                </button>
                              </div>
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
                                  onClick={() => uploadVideoItemToR2(item)}
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
          creators={creators}
          onClose={() => setShowBulkEditModal(false)}
          onApply={handleApplyBulkUpdates}
        />
      )}

      {/* Quick Create Reporter Modal */}
      {showQuickCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowQuickCreateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Create Reporter / Channel
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                    Videos will stream across user feeds under this creator identity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickCreateModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Avatar Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Select Reporter Avatar
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_AVATARS.map((avatar, idx) => {
                    const isSelected = selectedAvatarUrl === avatar;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedAvatarUrl(avatar)}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          border: isSelected ? '3px solid var(--brand-primary)' : '2px solid transparent',
                          padding: '2px',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img
                          src={avatar}
                          alt="Avatar option"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: 'var(--brand-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px'
                            }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reporter Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Channel / Reporter Display Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN Health Desk, Priya S, Citizen Voice Ponneri"
                  value={newReporterName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewReporterName(name);
                    if (!newReporterHandleEdited) {
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                      setNewReporterHandle(slug ? `@${slug}` : '');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Handle */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Reporter @Handle <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. @tnhealthdesk"
                  value={newReporterHandle}
                  onChange={(e) => {
                    setNewReporterHandleEdited(true);
                    setNewReporterHandle(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Verified Badge Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd'
                }}
              >
                <input
                  type="checkbox"
                  checked={newReporterVerified}
                  onChange={(e) => setNewReporterVerified(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#0284c7" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                    Grant Bureau Verified Badge (Blue Checkmark)
                  </span>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => setShowQuickCreateModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCreatingCreator || !newReporterName.trim()}
                onClick={handleSaveQuickCreator}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: !isCreatingCreator && newReporterName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 8px rgba(255, 69, 0, 0.3)'
                }}
              >
                {isCreatingCreator ? 'Saving...' : 'Save & Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create & Set New User for Selected Videos Modal */}
      {showBulkAssignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowBulkAssignModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#fdf4ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Create User for {selectedQueueIds.size} Videos
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                    Videos will be published under this newly created user identity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkAssignModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Avatar Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Select Avatar
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_AVATARS.map((avatar, idx) => {
                    const isSelected = bulkNewUserAvatar === avatar;
                    return (
                      <div
                        key={idx}
                        onClick={() => setBulkNewUserAvatar(avatar)}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: isSelected ? '3px solid #9333ea' : '2px solid transparent',
                          padding: '2px',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img
                          src={avatar}
                          alt="Avatar option"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#9333ea',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px'
                            }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Creator Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  User / Channel Display Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai News Desk, Priya S, Citizen Voice"
                  value={bulkNewUserName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setBulkNewUserName(name);
                    const slug = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setBulkNewUserHandle(slug ? `@${slug}` : '');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Handle */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  User @Handle <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. @chennainews"
                  value={bulkNewUserHandle}
                  onChange={(e) => setBulkNewUserHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Verified Badge Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd'
                }}
              >
                <input
                  type="checkbox"
                  checked={bulkNewUserVerified}
                  onChange={(e) => setBulkNewUserVerified(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#0284c7" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
                    Grant Bureau Verified Badge (Blue Checkmark)
                  </span>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => setShowBulkAssignModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!bulkNewUserName.trim()}
                onClick={handleApplyBulkAssignCreator}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: bulkNewUserName.trim() ? '#9333ea' : '#cbd5e1',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: bulkNewUserName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: bulkNewUserName.trim() ? '0 2px 8px rgba(147, 51, 234, 0.3)' : 'none'
                }}
              >
                Create & Set on {selectedQueueIds.size} Videos
              </button>
            </div>
          </div>
        </div>
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
