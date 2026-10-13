import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Check,
  Play,
  Pause,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  marketplaceAdminService,
  MarketplacePromoBanner
} from '../../../services/marketplaceAdminService';
import { compressImageToBase64 } from '../../../services/marketplaceService';
import type { MarketplaceCategory } from '../../../types/marketplace';

interface MarketplaceBannersManagerProps {
  canModerate?: boolean;
}

const GRADIENT_PRESETS = [
  {
    name: 'Ice Blue & Warm Glow (Original)',
    value: 'linear-gradient(135deg, #e0edfb 0%, #edf5fc 45%, #fff1e5 100%)',
    textColor: '#0f172a'
  },
  {
    name: 'Mint Fresh & Tech Cyan',
    value: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)',
    textColor: '#0f172a'
  },
  {
    name: 'Rose Peach & Sunrise',
    value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 45%, #ffedd5 100%)',
    textColor: '#0f172a'
  },
  {
    name: 'Royal Violet Tech',
    value: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #fce7f3 100%)',
    textColor: '#0f172a'
  },
  {
    name: 'Warm Amber Gold',
    value: 'linear-gradient(135deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)',
    textColor: '#0f172a'
  },
  {
    name: 'Midnight Dark Sleek',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    textColor: '#ffffff'
  }
];

const IMAGE_PRESETS = [
  {
    label: 'Marketplace Gadgets (Default Cluster)',
    url: '/images/marketplace_banner.jpg'
  },
  {
    label: 'Tech Gadgets & Laptops',
    url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Sell Locally Fast',
    url: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Home & Living',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Cars & Mobility',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
  }
];

const VIDEO_PRESETS = [
  {
    label: 'Tech Gadgets & Smartphone Video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41159-large.mp4'
  },
  {
    label: 'Luxury Apartment & Property Tour',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-with-a-sofa-and-large-windows-44160-large.mp4'
  },
  {
    label: 'Local Delivery & Commerce Process',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-online-shopping-and-order-packaging-process-42994-large.mp4'
  }
];

const CATEGORY_OPTIONS: Array<{ id: MarketplaceCategory; label: string }> = [
  { id: 'services', label: 'Services (Home & Repairs)' },
  { id: 'electronics', label: 'Electronics & Laptops' },
  { id: 'mobiles', label: 'Mobile Phones & Tablets' },
  { id: 'vehicles', label: 'Vehicles & Bikes' },
  { id: 'furniture', label: 'Furniture & Decor' },
  { id: 'fashion', label: 'Fashion & Clothing' },
  { id: 'home_kitchen', label: 'Home & Kitchen' },
  { id: 'property', label: 'Real Estate & Property' }
];

const COLOR_PRESETS = [
  '#ff5722',
  '#ff6b00',
  '#059669',
  '#0284c7',
  '#e11d48',
  '#7c3aed',
  '#d97706',
  '#0f172a'
];

export const MarketplaceBannersManager: React.FC<MarketplaceBannersManagerProps> = ({
  canModerate = true
}) => {
  const [banners, setBanners] = useState<MarketplacePromoBanner[]>([]);
  const [isSectionEnabled, setIsSectionEnabled] = useState(true);
  const [bannerPlacement, setBannerPlacement] = useState<'top' | 'between' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Carousel Preview State
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<MarketplacePromoBanner> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const [data, sectionStatus, placement] = await Promise.all([
        marketplaceAdminService.getBanners(),
        marketplaceAdminService.getSectionStatus(),
        marketplaceAdminService.getPlacementStatus()
      ]);
      setBanners(data);
      setIsSectionEnabled(sectionStatus);
      setBannerPlacement(placement);
    } catch (err: any) {
      setErrorMsg('Failed to load promotional banners: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const activeBanners = banners.filter((b) => b.isActive);

  // Auto-play live preview carousel (2.8s)
  useEffect(() => {
    if (!isAutoPlay || activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeBanners.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isAutoPlay, activeBanners.length]);

  // Adjust preview index if banners count changes
  useEffect(() => {
    if (previewIndex >= activeBanners.length && activeBanners.length > 0) {
      setPreviewIndex(0);
    }
  }, [activeBanners.length, previewIndex]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Toggle Global Promo Banner Section ON/OFF
  const handleToggleSectionStatus = async () => {
    try {
      const nextStatus = !isSectionEnabled;
      await marketplaceAdminService.toggleSection(nextStatus);
      setIsSectionEnabled(nextStatus);
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification(
        `Promotional Banner Section is now ${nextStatus ? 'Live & Visible on Marketplace' : 'Completely Hidden from Users'}`
      );
    } catch {
      showNotification('Failed to toggle section status', true);
    }
  };

  // Update Global Banner Placement (Top vs In-Between Products Feed vs Both)
  const handleUpdatePlacement = async (nextPlacement: 'top' | 'between' | 'both') => {
    try {
      const updated = await marketplaceAdminService.updatePlacement(nextPlacement);
      setBannerPlacement(updated);
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification(
        `Banner position updated: ${
          nextPlacement === 'between'
            ? 'In-Between Products Feed'
            : nextPlacement === 'top'
            ? 'Top of Section Only'
            : 'Both (Top & In-Between Feed)'
        }`
      );
    } catch {
      showNotification('Failed to update banner placement', true);
    }
  };

  // Reorder Handler
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    setBanners(reordered);
    const ids = reordered.map((b) => b.id);
    try {
      await marketplaceAdminService.reorderBanners(ids);
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification('Banner order updated!');
    } catch {
      showNotification('Failed to update order on server', true);
      loadBanners();
    }
  };

  // Toggle Active Handler
  const handleToggleActive = async (banner: MarketplacePromoBanner) => {
    try {
      const updated = await marketplaceAdminService.updateBanner(banner.id, {
        isActive: !banner.isActive
      });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification(
        `Banner "${banner.title}" is now ${!banner.isActive ? 'Active (Live)' : 'Disabled'}`
      );
    } catch {
      showNotification('Failed to update status', true);
    }
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingBanner({
      id: '',
      bannerStyle: 'full_poster',
      badge: 'SPECIAL OFFER',
      title: 'Promotional Banner',
      subtitle: '',
      buttonText: 'Explore Now',
      buttonLink: '',
      actionType: 'category',
      actionPayload: 'services',
      mediaType: 'image',
      imageUrl: '',
      videoUrl: '',
      targetScreen: 'all',
      bgGradient: 'linear-gradient(135deg, #e0edfb 0%, #edf5fc 45%, #fff1e5 100%)',
      badgeBg: '#ff5722',
      btnBg: '#ff6b00',
      isActive: true,
      orderIndex: banners.length
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (banner: MarketplacePromoBanner) => {
    setEditingBanner({
      ...banner,
      bannerStyle: banner.bannerStyle || 'split_template',
      mediaType: banner.mediaType || (banner.videoUrl ? 'video' : 'image'),
      videoUrl: banner.videoUrl || '',
      targetScreen: banner.targetScreen || 'all'
    });
    setIsModalOpen(true);
  };

  // Video Upload Handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setEditingBanner((prev) =>
          prev
            ? {
                ...prev,
                bannerStyle: 'full_poster',
                mediaType: 'video',
                videoUrl: result
              }
            : prev
        );
        showNotification('Video clip loaded! Switched to Full Poster view.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Failed to process video: ' + err.message, true);
    }
  };

  // Save Modal Form
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const bannerTitle =
      editingBanner.title?.trim() ||
      (editingBanner.bannerStyle === 'full_poster' ? 'Custom Promo Poster' : '');
    if (!bannerTitle) {
      showNotification('Banner title or reference name is required', true);
      return;
    }

    setIsSaving(true);
    try {
      const bannerToSave = {
        ...editingBanner,
        title: bannerTitle,
        bannerStyle: editingBanner.bannerStyle || 'split_template',
        mediaType: editingBanner.mediaType || 'image',
        videoUrl: editingBanner.mediaType === 'video' ? editingBanner.videoUrl : '',
        imageUrl: editingBanner.imageUrl || ''
      };

      if (editingBanner.id) {
        // Update
        const updated = await marketplaceAdminService.updateBanner(
          editingBanner.id,
          bannerToSave
        );
        setBanners((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? updated : b))
        );
        showNotification('Banner updated successfully!');
      } else {
        // Create
        const created = await marketplaceAdminService.createBanner(bannerToSave);
        setBanners((prev) => [...prev, created]);
        showNotification('New banner created successfully!');
      }
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      setIsModalOpen(false);
      setEditingBanner(null);
    } catch (err: any) {
      showNotification('Failed to save banner: ' + err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await marketplaceAdminService.deleteBanner(deleteTargetId);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTargetId));
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification('Banner deleted permanently');
      setDeleteTargetId(null);
    } catch {
      showNotification('Failed to delete banner', true);
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        'Reset all banners to initial defaults? Any custom banners will be overwritten.'
      )
    ) {
      return;
    }
    try {
      const defaults = await marketplaceAdminService.resetBanners();
      setBanners(defaults);
      window.dispatchEvent(new Event('spotlight_banners_updated'));
      showNotification('Banners reset to standard defaults!');
    } catch {
      showNotification('Failed to reset banners', true);
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImageToBase64(file, 1400, 1400, 0.85);
      setEditingBanner((prev) =>
        prev
          ? {
              ...prev,
              bannerStyle: 'full_poster',
              mediaType: 'image',
              imageUrl: base64,
              videoUrl: '' // clear any previous video url
            }
          : prev
      );
      showNotification('Design image uploaded! Switched to Full Poster view.');
    } catch (err: any) {
      showNotification('Failed to process image: ' + err.message, true);
    }
  };

  const currentPreviewBanner = activeBanners[previewIndex] || banners[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notifications */}
      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Banner Control Panel */}
      <div
        style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Promotional Banners Carousel
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Add unlimited sliding banners, configure auto-play animations, CTA links, and badge discounts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#f1f5f9',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Total Banners: <strong>{banners.length}</strong>
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Active Live: <strong>{activeBanners.length}</strong>
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Auto-Slide: <strong>2.8 Seconds</strong>
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: isSectionEnabled ? '#dcfce7' : '#fee2e2',
                color: isSectionEnabled ? '#15803d' : '#b91c1c',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              Section Visibility: <strong>{isSectionEnabled ? 'ON (Live)' : 'OFF (Hidden)'}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Master ON/OFF Switch Button */}
          <button
            type="button"
            onClick={handleToggleSectionStatus}
            title={isSectionEnabled ? 'Turn OFF banner section across the entire app' : 'Turn ON banner section'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '9px',
              border: isSectionEnabled ? '1px solid #86efac' : '1px solid #fca5a5',
              background: isSectionEnabled ? '#f0fdf4' : '#fef2f2',
              color: isSectionEnabled ? '#15803d' : '#b91c1c',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isSectionEnabled ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>Banner Section: {isSectionEnabled ? 'Active (ON)' : 'Hidden (OFF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Restore Defaults</span>
          </button>

          {canModerate && (
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6b00, #ea580c)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}
            >
              <Plus size={16} />
              <span>Add New Banner</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Feed Position / Placement Switcher */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Banner Feed Placement (Where Ads Appear)
            </h4>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Select whether promotional banners display in-between product listings, at the top, or in both places.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px'
          }}
        >
          <button
            type="button"
            onClick={() => handleUpdatePlacement('between')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: bannerPlacement === 'between' ? '1px solid #ea580c' : '1px solid transparent',
              background: bannerPlacement === 'between' ? '#ffffff' : 'transparent',
              color: bannerPlacement === 'between' ? '#ea580c' : '#475569',
              fontSize: '12px',
              fontWeight: bannerPlacement === 'between' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: bannerPlacement === 'between' ? '0 1px 4px rgba(234, 88, 12, 0.15)' : 'none'
            }}
          >
            📑 In-Between Products Feed
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePlacement('top')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: bannerPlacement === 'top' ? '1px solid #ea580c' : '1px solid transparent',
              background: bannerPlacement === 'top' ? '#ffffff' : 'transparent',
              color: bannerPlacement === 'top' ? '#ea580c' : '#475569',
              fontSize: '12px',
              fontWeight: bannerPlacement === 'top' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: bannerPlacement === 'top' ? '0 1px 4px rgba(234, 88, 12, 0.15)' : 'none'
            }}
          >
            📌 Top Banner Only
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePlacement('both')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: bannerPlacement === 'both' ? '1px solid #ea580c' : '1px solid transparent',
              background: bannerPlacement === 'both' ? '#ffffff' : 'transparent',
              color: bannerPlacement === 'both' ? '#ea580c' : '#475569',
              fontSize: '12px',
              fontWeight: bannerPlacement === 'both' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: bannerPlacement === 'both' ? '0 1px 4px rgba(234, 88, 12, 0.15)' : 'none'
            }}
          >
            🌟 Both (Top & In-Between)
          </button>
        </div>
      </div>

      {/* Prominent warning when banner section is disabled */}
      {!isSectionEnabled && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(190, 18, 60, 0.08)'
          }}
        >
          <AlertTriangle size={20} color="#e11d48" style={{ flexShrink: 0 }} />
          <div>
            <strong>Notice: Promotional Banner Section is turned OFF by Admin.</strong>
            <div style={{ marginTop: '2px', fontSize: '12px', opacity: 0.9 }}>
              No promotional banners are visible to customers on OLX Marketplace or Real Estate pages. Click "Banner Section: Hidden (OFF)" above anytime to make it live.
            </div>
          </div>
        </div>
      )}

      {/* Live Interactive Carousel Preview */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} color="#2563eb" />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Live User Preview (What Customers See on Marketplace)
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              title={isAutoPlay ? 'Pause auto-play' : 'Resume auto-play'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: isAutoPlay ? '#f0fdf4' : '#f8fafc',
                color: isAutoPlay ? '#15803d' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isAutoPlay ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoPlay ? 'Auto-Moving' : 'Paused'}</span>
            </button>

            {activeBanners.length > 1 && (
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Slide {previewIndex + 1} of {activeBanners.length}
              </span>
            )}
          </div>
        </div>

        {activeBanners.length === 0 ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              color: '#64748b'
            }}
          >
            No active banners currently published. Turn on or create a banner below!
          </div>
        ) : currentPreviewBanner.bannerStyle === 'full_poster' ? (
          <div
            style={{
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              background: currentPreviewBanner.bgGradient || '#0f172a',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
              border: '1px solid #bfdbfe',
              transition: 'all 0.4s ease'
            }}
          >
            {currentPreviewBanner.mediaType === 'video' && currentPreviewBanner.videoUrl ? (
              <video
                key={currentPreviewBanner.videoUrl}
                src={currentPreviewBanner.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '420px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            ) : currentPreviewBanner.imageUrl ? (
              <img
                src={currentPreviewBanner.imageUrl}
                alt={currentPreviewBanner.title || 'Promo Banner'}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '420px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                No image uploaded for this poster banner.
              </div>
            )}

            {/* Next / Prev Controls */}
            {activeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex(
                      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                    )
                  }
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronLeft size={16} color="#0f172a" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev + 1) % activeBanners.length)
                  }
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronRight size={16} color="#0f172a" />
                </button>
              </>
            )}

            {/* Indicator Dots */}
            {activeBanners.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 6
                }}
              >
                {activeBanners.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    onClick={() => setPreviewIndex(dotIdx)}
                    style={{
                      height: '6px',
                      width: previewIndex === dotIdx ? '22px' : '6px',
                      borderRadius: previewIndex === dotIdx ? '4px' : '50%',
                      background:
                        previewIndex === dotIdx
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.45)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              background: currentPreviewBanner.bgGradient || 'linear-gradient(135deg, #e0edfb 0%, #edf5fc 45%, #fff1e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 32px',
              minHeight: '160px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
              border: '1px solid #bfdbfe',
              transition: 'all 0.4s ease'
            }}
          >
            {/* Left Text Block */}
            <div style={{ maxWidth: '58%', zIndex: 2 }}>
              {currentPreviewBanner.badge && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    background: currentPreviewBanner.badgeBg || '#ff5722',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}
                >
                  {currentPreviewBanner.badge}
                </span>
              )}

              <h3
                style={{
                  margin: '4px 0 0 0',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.18,
                  whiteSpace: 'pre-line'
                }}
              >
                {currentPreviewBanner.title}
              </h3>

              {currentPreviewBanner.subtitle && (
                <p
                  style={{
                    margin: '6px 0 0 0',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {currentPreviewBanner.subtitle}
                </p>
              )}

              {currentPreviewBanner.buttonText && (
                <button
                  type="button"
                  style={{
                    marginTop: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: currentPreviewBanner.btnBg || '#ff6b00',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 107, 0, 0.35)'
                  }}
                >
                  <span>{currentPreviewBanner.buttonText}</span>
                  {currentPreviewBanner.actionType === 'external' ? (
                    <ExternalLink size={13} />
                  ) : null}
                </button>
              )}
            </div>

            {/* Right Background Graphic / Video / Cluster */}
            {currentPreviewBanner.mediaType === 'video' && currentPreviewBanner.videoUrl ? (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '52%',
                  overflow: 'hidden',
                  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                  maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
                }}
              >
                <video
                  key={currentPreviewBanner.videoUrl}
                  src={currentPreviewBanner.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : currentPreviewBanner.imageUrl ? (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '52%',
                  backgroundImage: `url(${currentPreviewBanner.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.95,
                  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                  maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
                }}
              />
            ) : null}

            {/* Next / Prev Controls */}
            {activeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex(
                      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                    )
                  }
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronLeft size={16} color="#0f172a" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev + 1) % activeBanners.length)
                  }
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  <ChevronRight size={16} color="#0f172a" />
                </button>
              </>
            )}

            {/* Indicator Dots */}
            {activeBanners.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 6
                }}
              >
                {activeBanners.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    onClick={() => setPreviewIndex(dotIdx)}
                    style={{
                      height: '6px',
                      width: previewIndex === dotIdx ? '22px' : '6px',
                      borderRadius: previewIndex === dotIdx ? '4px' : '50%',
                      background:
                        previewIndex === dotIdx
                          ? currentPreviewBanner.badgeBg || '#ff5722'
                          : 'rgba(15, 23, 42, 0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banners List / Management Grid */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              All Configured Banners ({banners.length})
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Reorder using the up/down arrows. Toggle to hide or show on the home page.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              color: '#64748b'
            }}
          >
            No banners found. Click "+ Add New Banner" to create your first promotion!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {banners.map((banner, index) => {
              return (
                <div
                  key={banner.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: banner.isActive ? '#ffffff' : '#f8fafc',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    opacity: banner.isActive ? 1 : 0.72,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Order & Reorder Controls */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Move Up"
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        opacity: index === 0 ? 0.3 : 1
                      }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Move Down"
                      style={{
                        padding: '3px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: index === banners.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: index === banners.length - 1 ? 0.3 : 1
                      }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Thumbnail / Image / Video Preview */}
                  <div
                    style={{
                      width: '74px',
                      height: '52px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: banner.bgGradient || '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0,
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {banner.mediaType === 'video' && banner.videoUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video
                          src={banner.videoUrl}
                          muted
                          playsInline
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
                            color: '#ffffff'
                          }}
                        >
                          <Play size={15} fill="#ffffff" />
                        </div>
                      </div>
                    ) : banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImageIcon size={20} color="#94a3b8" />
                    )}
                  </div>

                  {/* Info details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {banner.badge && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: banner.badgeBg || '#ff5722',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800
                          }}
                        >
                          {banner.badge}
                        </span>
                      )}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: 800,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {banner.title}
                      </h4>

                      <span
                        style={{
                          padding: '1px 7px',
                          borderRadius: '6px',
                          background: banner.mediaType === 'video' ? '#f3e8ff' : '#e0f2fe',
                          color: banner.mediaType === 'video' ? '#7e22ce' : '#0369a1',
                          fontWeight: 700,
                          fontSize: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        {banner.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                      </span>

                      <span
                        style={{
                          padding: '1px 7px',
                          borderRadius: '6px',
                          background:
                            banner.bannerStyle === 'full_poster' ? '#dcfce7' : '#ede9fe',
                          color:
                            banner.bannerStyle === 'full_poster' ? '#15803d' : '#6d28d9',
                          fontWeight: 700,
                          fontSize: '10px'
                        }}
                      >
                        {banner.bannerStyle === 'full_poster' ? '🖼️ Full Poster' : '📝 Split Template'}
                      </span>

                      <span
                        style={{
                          padding: '1px 7px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 700,
                          fontSize: '10px'
                        }}
                      >
                        {banner.targetScreen === 'real_estate'
                          ? '🏠 Real Estate'
                          : banner.targetScreen === 'olx'
                          ? '🛍️ OLX Only'
                          : '🌐 All Screens'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: '#64748b',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span>
                        Button: <strong>{banner.buttonText || 'Book Now'}</strong>
                      </span>
                      <span>
                        Action:{' '}
                        <strong>
                          {banner.actionType === 'category'
                            ? `Category (${banner.actionPayload || 'services'})`
                            : banner.actionType === 'post_ad'
                            ? 'Open Post Ad'
                            : banner.actionType === 'external'
                            ? 'External Link'
                            : 'None'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: banner.isActive ? '#dcfce7' : '#f1f5f9',
                        color: banner.isActive ? '#15803d' : '#64748b',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {banner.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span>{banner.isActive ? 'Active (Live)' : 'Disabled'}</span>
                    </button>
                  </div>

                  {/* Action buttons (Edit & Delete) */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      title="Edit Banner"
                      style={{
                        padding: '7px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0284c7',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(banner.id)}
                      title="Delete Banner"
                      style={{
                        padding: '7px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fff5f5',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT BANNER MODAL */}
      {isModalOpen && editingBanner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  {editingBanner.id ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBanner} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Live Preview Box inside Modal */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Live Preview:
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: editingBanner.bannerStyle === 'full_poster' ? '#dcfce7' : '#e0f2fe',
                      color: editingBanner.bannerStyle === 'full_poster' ? '#15803d' : '#0369a1'
                    }}
                  >
                    {editingBanner.bannerStyle === 'full_poster'
                      ? '🖼️ Full Poster Mode (Your Design Only)'
                      : '📝 Split Template (Text + Graphic)'}
                  </span>
                </div>

                {editingBanner.bannerStyle === 'full_poster' ? (
                  /* Full Poster Live Preview (100% width, adapts dynamically to image aspect ratio with zero cropping) */
                  <div
                    style={{
                      marginTop: '6px',
                      borderRadius: '14px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: editingBanner.bgGradient || '#0f172a',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      border: '2px solid #22c55e'
                    }}
                  >
                    {editingBanner.mediaType === 'video' && editingBanner.videoUrl ? (
                      <video
                        key={editingBanner.videoUrl}
                        src={editingBanner.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '420px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    ) : editingBanner.imageUrl ? (
                      <img
                        src={editingBanner.imageUrl}
                        alt="Full poster preview"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '420px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                        📸 Upload your poster image below to view it here in 100% full width
                      </div>
                    )}
                  </div>
                ) : (
                  /* Split Template Live Preview */
                  <div
                    style={{
                      marginTop: '6px',
                      borderRadius: '14px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: editingBanner.bgGradient || 'linear-gradient(135deg, #e0edfb 0%, #edf5fc 45%, #fff1e5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 24px',
                      minHeight: '130px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <div style={{ maxWidth: '60%', zIndex: 2 }}>
                      {editingBanner.badge && (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            background: editingBanner.badgeBg || '#ff5722',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            marginBottom: '6px'
                          }}
                        >
                          {editingBanner.badge}
                        </span>
                      )}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '18px',
                          fontWeight: 800,
                          color: '#0f172a',
                          lineHeight: 1.2,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {editingBanner.title || 'Enter your headline title...'}
                      </h4>
                      {editingBanner.subtitle && (
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '11px',
                            color: '#475569',
                            fontWeight: 600,
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {editingBanner.subtitle}
                        </p>
                      )}
                      {editingBanner.buttonText && (
                        <button
                          type="button"
                          style={{
                            marginTop: '8px',
                            background: editingBanner.btnBg || '#ff6b00',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {editingBanner.buttonText}
                        </button>
                      )}
                    </div>

                    {editingBanner.mediaType === 'video' && editingBanner.videoUrl ? (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '50%',
                          overflow: 'hidden',
                          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
                        }}
                      >
                        <video
                          key={editingBanner.videoUrl}
                          src={editingBanner.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ) : editingBanner.imageUrl ? (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '50%',
                          backgroundImage: `url(${editingBanner.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 0.95,
                          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))',
                          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0))'
                        }}
                      />
                    ) : null}
                  </div>
                )}
              </div>

              {/* Banner Design Mode Selector */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  🎨 Choose Banner Display Style:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner({ ...editingBanner, bannerStyle: 'full_poster' })
                    }
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border:
                        editingBanner.bannerStyle === 'full_poster'
                          ? '2px solid #16a34a'
                          : '1px solid #cbd5e1',
                      background:
                        editingBanner.bannerStyle === 'full_poster' ? '#f0fdf4' : '#ffffff',
                      color:
                        editingBanner.bannerStyle === 'full_poster' ? '#15803d' : '#475569',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>🖼️ Full-Width Poster</span>
                      {editingBanner.bannerStyle === 'full_poster' && <Check size={16} color="#16a34a" />}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85, lineHeight: 1.35 }}>
                      Your uploaded design IS the banner (100% width, clean design, zero text overlay). Recommended for Canva / Photoshop banners.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner({ ...editingBanner, bannerStyle: 'split_template' })
                    }
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border:
                        editingBanner.bannerStyle !== 'full_poster'
                          ? '2px solid #2563eb'
                          : '1px solid #cbd5e1',
                      background:
                        editingBanner.bannerStyle !== 'full_poster' ? '#eff6ff' : '#ffffff',
                      color:
                        editingBanner.bannerStyle !== 'full_poster' ? '#1d4ed8' : '#475569',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📝 Split Template</span>
                      {editingBanner.bannerStyle !== 'full_poster' && <Check size={16} color="#2563eb" />}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85, lineHeight: 1.35 }}>
                      Built-in layout: headline & button on left, graphic image on right.
                    </div>
                  </button>
                </div>
              </div>

              {/* MEDIA UPLOAD SECTION (Prominent for Full Poster mode) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  {editingBanner.bannerStyle === 'full_poster'
                    ? '1. Poster Media (Upload your ready banner design) *'
                    : 'Banner Media Format & Graphic'}
                </label>

                {/* Media Type Toggle: Image vs Video */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner({
                        ...editingBanner,
                        mediaType: 'image',
                        videoUrl: ''
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border:
                        editingBanner.mediaType !== 'video'
                          ? '2px solid #2563eb'
                          : '1px solid #cbd5e1',
                      background:
                        editingBanner.mediaType !== 'video' ? '#eff6ff' : '#ffffff',
                      color:
                        editingBanner.mediaType !== 'video' ? '#1d4ed8' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ImageIcon size={16} />
                    <span>Static Image / Photo Design</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner({
                        ...editingBanner,
                        mediaType: 'video',
                        videoUrl:
                          editingBanner.videoUrl || VIDEO_PRESETS[0].url
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border:
                        editingBanner.mediaType === 'video'
                          ? '2px solid #7c3aed'
                          : '1px solid #cbd5e1',
                      background:
                        editingBanner.mediaType === 'video' ? '#f5f3ff' : '#ffffff',
                      color:
                        editingBanner.mediaType === 'video' ? '#6d28d9' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Play size={16} />
                    <span>Video Animation / Clip</span>
                  </button>
                </div>

                {/* Conditional Media Input: Video vs Image */}
                {editingBanner.mediaType === 'video' ? (
                  <div
                    style={{
                      background: '#faf5ff',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid #e9d5ff',
                      marginTop: '10px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px'
                      }}
                    >
                      <label
                        style={{ fontSize: '13px', fontWeight: 800, color: '#6b21a8' }}
                      >
                        🎥 Video Clip URL or Upload
                      </label>
                      <span
                        style={{ fontSize: '11px', color: '#7e22ce', fontWeight: 600 }}
                      >
                        Auto-loops muted & fits banner perfectly
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={editingBanner.videoUrl || ''}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            videoUrl: e.target.value
                          })
                        }
                        placeholder="Paste MP4 or WebM video URL, or choose preset below"
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #d8b4fe',
                          fontSize: '13px',
                          background: '#ffffff'
                        }}
                      />
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        style={{ display: 'none' }}
                        onChange={handleVideoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                        }}
                      >
                        <Upload size={14} />
                        <span>Upload Video</span>
                      </button>
                    </div>

                    {/* Video Presets */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '10px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {VIDEO_PRESETS.map((vid) => (
                        <button
                          key={vid.label}
                          type="button"
                          onClick={() =>
                            setEditingBanner({ ...editingBanner, videoUrl: vid.url })
                          }
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border:
                              editingBanner.videoUrl === vid.url
                                ? '1px solid #7c3aed'
                                : '1px solid #e9d5ff',
                            background:
                              editingBanner.videoUrl === vid.url ? '#ede9fe' : '#ffffff',
                            color:
                              editingBanner.videoUrl === vid.url ? '#5b21b6' : '#6b21a8',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ▶ {vid.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Static Image Graphic Section */
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        value={editingBanner.imageUrl || ''}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, imageUrl: e.target.value })
                        }
                        placeholder="Image URL or upload custom photo design..."
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #ff6b00, #ea580c)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                        }}
                      >
                        <Upload size={14} />
                        <span>Upload Photo Design</span>
                      </button>
                    </div>

                    {/* Preset image buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {IMAGE_PRESETS.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() =>
                            setEditingBanner({ ...editingBanner, imageUrl: img.url })
                          }
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border:
                              editingBanner.imageUrl === img.url
                                ? '1px solid #2563eb'
                                : '1px solid #e2e8f0',
                            background:
                              editingBanner.imageUrl === img.url ? '#eff6ff' : '#ffffff',
                            color:
                              editingBanner.imageUrl === img.url ? '#1d4ed8' : '#475569',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Title / Name */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  {editingBanner.bannerStyle === 'full_poster'
                    ? '2. Banner Reference Name (For Admin identification only)'
                    : 'Main Banner Title *'}
                </label>
                <input
                  type="text"
                  required={editingBanner.bannerStyle !== 'full_poster'}
                  value={editingBanner.title || ''}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder={
                    editingBanner.bannerStyle === 'full_poster'
                      ? 'e.g. Computer Institute Admission Banner'
                      : 'e.g. Exclusive discounts on home service'
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '4px',
                    fontSize: '13px'
                  }}
                />
                {editingBanner.bannerStyle === 'full_poster' && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                    ℹ️ This title is for your admin list reference only. It will <strong>NOT</strong> be printed over your photo.
                  </p>
                )}
              </div>

              {/* Template Mode Only Fields: Badge, Subtitle, CTA Button */}
              {editingBanner.bannerStyle !== 'full_poster' && (
                <>
                  {/* Title & Badge Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Badge Tag (e.g., SAVE 25% TODAY!)
                      </label>
                      <input
                        type="text"
                        value={editingBanner.badge || ''}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, badge: e.target.value })
                        }
                        placeholder="e.g. SAVE 25% TODAY!"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Badge Background Color
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="color"
                          value={editingBanner.badgeBg || '#ff5722'}
                          onChange={(e) =>
                            setEditingBanner({ ...editingBanner, badgeBg: e.target.value })
                          }
                          style={{
                            width: '38px',
                            height: '38px',
                            padding: 0,
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {COLOR_PRESETS.map((c) => (
                            <div
                              key={c}
                              onClick={() => setEditingBanner({ ...editingBanner, badgeBg: c })}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: c,
                                cursor: 'pointer',
                                border: editingBanner.badgeBg === c ? '2px solid #000' : '1px solid #ccc'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Subtitle / Promo Headline (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={editingBanner.subtitle || ''}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                      }
                      placeholder="e.g. VIBRANT GADGETS & ELECTRONICS MARKETPLACE&#10;YOUR ULTIMATE TECH DESTINATION!"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        marginTop: '4px',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  {/* Button Text & Button Color */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Button CTA Text
                      </label>
                      <input
                        type="text"
                        value={editingBanner.buttonText || ''}
                        onChange={(e) =>
                          setEditingBanner({ ...editingBanner, buttonText: e.target.value })
                        }
                        placeholder="e.g. Book Now / Shop Deals"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Button CTA Color
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="color"
                          value={editingBanner.btnBg || '#ff6b00'}
                          onChange={(e) =>
                            setEditingBanner({ ...editingBanner, btnBg: e.target.value })
                          }
                          style={{
                            width: '38px',
                            height: '38px',
                            padding: 0,
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {COLOR_PRESETS.map((c) => (
                            <div
                              key={c}
                              onClick={() => setEditingBanner({ ...editingBanner, btnBg: c })}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: c,
                                cursor: 'pointer',
                                border: editingBanner.btnBg === c ? '2px solid #000' : '1px solid #ccc'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Type & Target */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    {editingBanner.bannerStyle === 'full_poster'
                      ? '3. When User Taps the Poster:'
                      : 'Click Action Type'}
                  </label>
                  <select
                    value={editingBanner.actionType || 'category'}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        actionType: e.target.value as any
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      marginTop: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <option value="category">Filter by Category</option>
                    <option value="post_ad">Open "Post Free Ad" Modal</option>
                    <option value="external">Open Custom Link / URL</option>
                    <option value="none">No Action (Display Only)</option>
                  </select>
                </div>

                <div>
                  {editingBanner.actionType === 'category' ? (
                    <>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Target Category
                      </label>
                      <select
                        value={editingBanner.actionPayload || 'services'}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            actionPayload: e.target.value
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '4px',
                          fontSize: '13px'
                        }}
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : editingBanner.actionType === 'external' ? (
                    <>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        External URL / Web Link
                      </label>
                      <input
                        type="url"
                        value={editingBanner.buttonLink || ''}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            buttonLink: e.target.value
                          })
                        }
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          marginTop: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '26px' }}>
                      Action will be triggered when user clicks the banner.
                    </div>
                  )}
                </div>
              </div>

              {/* Target Screen Placement */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Target Screen Display (Where to Show Banner)
                </label>
                <select
                  value={editingBanner.targetScreen || 'all'}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      targetScreen: e.target.value as any
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '4px',
                    fontSize: '13px',
                    background: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  <option value="all">🌐 Everywhere (OLX Marketplace + Real Estate)</option>
                  <option value="olx">🛍️ OLX Buy & Sell Marketplace Only</option>
                  <option value="real_estate">🏠 Real Estate & Property Screen Only</option>
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  Choose which screens show this banner (or display across both OLX and Real Estate).
                </p>
              </div>

              {/* Background Gradient & Color Theme (Only for Template Mode) */}
              {editingBanner.bannerStyle !== 'full_poster' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    Background Gradient Theme
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                    {GRADIENT_PRESETS.map((p) => {
                      const isSelected = editingBanner.bgGradient === p.value;
                      return (
                        <div
                          key={p.name}
                          onClick={() =>
                            setEditingBanner({ ...editingBanner, bgGradient: p.value })
                          }
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: p.value,
                            border: isSelected ? '2px solid #ff4500' : '1px solid #cbd5e1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? '0 2px 6px rgba(255, 69, 0, 0.25)' : 'none'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: p.textColor
                            }}
                          >
                            {p.name}
                          </span>
                          {isSelected && <Check size={14} color="#ff4500" />}
                        </div>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={editingBanner.bgGradient || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, bgGradient: e.target.value })
                    }
                    placeholder="Custom linear-gradient(...) CSS value"
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      marginTop: '8px',
                      fontSize: '12px'
                    }}
                  />
                </div>
              )}

              {/* Active Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={editingBanner.isActive !== false}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, isActive: e.target.checked })
                  }
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label
                  htmlFor="bannerIsActive"
                  style={{ fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  Publish Immediately (Active on Marketplace Carousel)
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '16px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6b00, #ea580c)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  {isSaving ? 'Saving...' : editingBanner.id ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Delete Promotional Banner?
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              This banner will be permanently removed from the database and user screens.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
