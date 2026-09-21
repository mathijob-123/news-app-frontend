import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Film,
  CreditCard,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  MapPin,
  Check,
  Search,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  Send,
  Eye,
  FileVideo,
  ChevronRight,
  ExternalLink,
  LogOut,
  X,
  RefreshCw,
  MessageSquare,
  Heart,
  Share2,
  Compass,
  Megaphone,
  Settings,
  Shield,
  ShieldAlert,
  Trash2,
  Globe,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoPost, AdminReviewStatus, Advertisement, AppSettings, AdminUser, AdminRoleType, SocialMediaPost, NewsCategory, LocationCoordinates } from '../../types';
import {
  approveAdminPayout,
  updatePostReviewStatus,
  acceptAndPublishPostByAdmin,
  rejectPost,
  getAdminDashboardStats,
  getStoredAds,
  saveStoredAds,
  createStoredAd,
  updateStoredAd,
  deleteStoredAd,
  deletePost as deleteStoredPost,
  bulkUpdateStoredPosts,
  getStoredAppSettings,
  saveStoredAppSettings,
  getStoredSocialImports,
  saveStoredSocialImports,
  updateStoredSocialImport,
  deleteStoredSocialImport
} from '../../services/storageService';
import { PRESET_LOCATIONS } from '../../services/geoService';
import { apiClient } from '../../services/apiClient';
import { formatINR } from '../../services/monetizationEngine';
import { AdvertisementManager } from './AdvertisementManager';
import { AppSettingsManager } from './AppSettingsManager';
import { SocialMediaContentManager } from './SocialMediaContentManager';
import { CopyrightManager } from './CopyrightManager';
import { Spotlight360Manager } from './spotlight360/Spotlight360Manager';

interface AdminPanelProps {
  posts: VideoPost[];
  onClose: () => void;
  onRefreshData: () => void;
  onLogout?: () => void;
  adminUser?: { id: string; name: string; role: string };
}

type AdminTab = 'requests' | 'social_media' | 'payouts' | 'advertisements' | 'analytics' | 'settings' | 'copyright' | 'spotlight360';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  onClose,
  onRefreshData,
  onLogout,
  adminUser
}) => {
  const [simulatedRole, setSimulatedRole] = useState<AdminRoleType>(() => {
    const r = (adminUser?.role || 'super_admin').toLowerCase();
    if (r.includes('ad')) return 'ad_manager';
    if (r.includes('editor')) return 'editor';
    if (r.includes('moderator')) return 'moderator';
    return 'super_admin';
  });

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (adminUser?.role?.toLowerCase().includes('ad')) return 'advertisements';
    return 'requests';
  });

  // Ads, App Settings & Social Imports State
  const [ads, setAds] = useState<Advertisement[]>(getStoredAds());
  const [appSettings, setAppSettings] = useState<AppSettings>(getStoredAppSettings());
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>(() => getStoredSocialImports());

  // Load latest ads, settings, and social imports from server
  React.useEffect(() => {
    apiClient.getAds().then((serverAds) => {
      if (serverAds && serverAds.length > 0) {
        setAds(serverAds);
        saveStoredAds(serverAds);
      }
    }).catch(() => {});

    apiClient.getSettings().then((serverSettings) => {
      if (serverSettings) {
        setAppSettings(serverSettings);
        saveStoredAppSettings(serverSettings);
      }
    }).catch(() => {});

    apiClient.getSocialImports().then((serverSocials) => {
      if (serverSocials && serverSocials.length > 0) {
        setSocialPosts(serverSocials);
        saveStoredSocialImports(serverSocials);
      }
    }).catch(() => {});
  }, []);

  // Pending copyright claims counter for tab badge
  const [pendingCopyrightCount, setPendingCopyrightCount] = useState<number>(0);

  React.useEffect(() => {
    apiClient.getCopyrightReports('pending').then((reps) => {
      if (reps) setPendingCopyrightCount(reps.length);
    }).catch(() => {});
  }, [activeTab]);

  // Sync activeTab when simulatedRole changes if current tab is not permitted
  const isTabAllowed = (tab: AdminTab, role: AdminRoleType): boolean => {
    if (role === 'super_admin') return true;
    if (role === 'ad_manager') return tab === 'advertisements' || tab === 'spotlight360' || tab === 'analytics';
    if (role === 'editor' || role === 'moderator') return tab === 'requests' || tab === 'social_media' || tab === 'spotlight360' || tab === 'analytics' || tab === 'copyright';
    return true;
  };

  const handleSwitchSimulatedRole = (newRole: AdminRoleType) => {
    setSimulatedRole(newRole);
    if (!isTabAllowed(activeTab, newRole)) {
      if (newRole === 'ad_manager') setActiveTab('advertisements');
      else setActiveTab('requests');
    }
  };

  // Ads Handlers
  const handleSaveAd = async (ad: Advertisement) => {
    const existingIdx = ads.findIndex((a) => a.id === ad.id);
    let updatedAds: Advertisement[];
    if (existingIdx >= 0) {
      updatedAds = ads.map((a) => (a.id === ad.id ? ad : a));
      updateStoredAd(ad.id, ad);
      try { await apiClient.updateAd(ad.id, ad); } catch {}
    } else {
      updatedAds = [ad, ...ads];
      createStoredAd(ad);
      try { await apiClient.createAd(ad); } catch {}
    }
    setAds(updatedAds);
  };

  const handleDeleteAd = async (adId: string) => {
    const updatedAds = ads.filter((a) => a.id !== adId);
    setAds(updatedAds);
    deleteStoredAd(adId);
    try { await apiClient.deleteAd(adId); } catch {}
  };

  const handleToggleAdStatus = async (adId: string, currentStatus: 'active' | 'inactive' | 'stopped') => {
    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    const updatedAds = ads.map((a) => (a.id === adId ? { ...a, status: newStatus } : a));
    setAds(updatedAds);
    updateStoredAd(adId, { status: newStatus });
    try { await apiClient.updateAd(adId, { status: newStatus }); } catch {}
  };

  // Settings Handlers
  const handleSaveAppSettings = async (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveStoredAppSettings(newSettings);
    try { await apiClient.updateSettings(newSettings); } catch {}
  };

  const handleSaveAdminUser = async (userUpdates: Partial<AdminUser>) => {
    const currentAdmins = appSettings.adminUsers;
    let updatedAdmins: AdminUser[];
    if (userUpdates.id) {
      updatedAdmins = currentAdmins.map((u) => (u.id === userUpdates.id ? { ...u, ...userUpdates } as AdminUser : u));
      try { await apiClient.updateAdminUser(userUpdates.id, userUpdates); } catch {}
    } else {
      const newAdmin: AdminUser = {
        id: `adm_${Date.now().toString(36)}`,
        name: userUpdates.name || 'Staff Admin',
        email: userUpdates.email || 'admin@spotlight.local',
        role: userUpdates.role || 'editor',
        status: userUpdates.status || 'active',
        createdAt: new Date().toISOString()
      };
      updatedAdmins = [...currentAdmins, newAdmin];
      try { await apiClient.createAdminUser(newAdmin); } catch {}
    }
    const updatedSettings = { ...appSettings, adminUsers: updatedAdmins };
    setAppSettings(updatedSettings);
    saveStoredAppSettings(updatedSettings);
  };

  const handleDeleteAdminUser = async (userId: string) => {
    const updatedAdmins = appSettings.adminUsers.filter((u) => u.id !== userId);
    const updatedSettings = { ...appSettings, adminUsers: updatedAdmins };
    setAppSettings(updatedSettings);
    saveStoredAppSettings(updatedSettings);
    try { await apiClient.deleteAdminUser(userId); } catch {}
  };

  // Social Media Imports Handlers
  const handleRefreshSocialPosts = async () => {
    try {
      const serverSocials = await apiClient.getSocialImports();
      if (serverSocials && serverSocials.length > 0) {
        setSocialPosts(serverSocials);
        saveStoredSocialImports(serverSocials);
      } else {
        setSocialPosts(getStoredSocialImports());
      }
    } catch {
      setSocialPosts(getStoredSocialImports());
    }
  };

  const handleFetchSocialContent = async (params: {
    platform: string;
    source: string;
    dateRange: string;
    location: string;
    category: string;
    limit?: number;
  }): Promise<{ newlyFetched: SocialMediaPost[]; totalStaged: number; duplicatesFound: number }> => {
    try {
      const res = await apiClient.fetchSocialContent(params);
      if (res && res.newlyFetched) {
        const updated = [...res.newlyFetched, ...socialPosts.filter((p: SocialMediaPost) => !res.newlyFetched.some((f: SocialMediaPost) => f.id === p.id))];
        setSocialPosts(updated);
        saveStoredSocialImports(updated);
        return res;
      }
    } catch (err) {
      console.warn('API fetchSocialContent error:', err);
    }
    return { newlyFetched: [], totalStaged: socialPosts.length, duplicatesFound: 0 };
  };

  const handleAiEnhanceSocial = async (id: string, prompt?: string): Promise<SocialMediaPost> => {
    try {
      const enhanced = await apiClient.aiEnhanceSocialPost(id, prompt);
      if (enhanced) {
        const updated = socialPosts.map(p => p.id === id ? enhanced : p);
        setSocialPosts(updated);
        updateStoredSocialImport(id, enhanced);
        return enhanced;
      }
    } catch (err) {
      console.warn('AI enhance error:', err);
    }
    const current = socialPosts.find(p => p.id === id);
    if (current) return current;
    throw new Error('Post not found');
  };

  const handleApproveSocialPublish = async (id: string, overrides?: any): Promise<void> => {
    try {
      const result = await apiClient.approveSocialPost(id, overrides);
      if (result && result.post) {
        const updated = socialPosts.map(p => p.id === id ? result.post : p);
        setSocialPosts(updated);
        updateStoredSocialImport(id, result.post);
        // Refresh citizen news feed so the newly approved news item shows immediately
        onRefreshData();
      }
    } catch (err) {
      console.warn('Approve social post error:', err);
      throw err;
    }
  };

  const handleRejectSocial = async (id: string, reason: string): Promise<void> => {
    try {
      const rejected = await apiClient.rejectSocialPost(id, reason);
      if (rejected) {
        const updated = socialPosts.map(p => p.id === id ? rejected : p);
        setSocialPosts(updated);
        updateStoredSocialImport(id, rejected);
      }
    } catch (err) {
      console.warn('Reject social post error:', err);
      throw err;
    }
  };

  const handleDeleteSocial = async (id: string): Promise<void> => {
    try {
      await apiClient.deleteSocialPost(id);
    } catch {}
    const updated = socialPosts.filter(p => p.id !== id);
    setSocialPosts(updated);
    deleteStoredSocialImport(id);
  };

  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);

  // Bulk selection and batch update state
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkSuccessNotice, setBulkSuccessNotice] = useState<string | null>(null);

  // Full Post Inspection Popup Tab Modal State
  const [inspectingPost, setInspectingPost] = useState<VideoPost | null>(null);
  const [inspectTab, setInspectTab] = useState<'story' | 'geotag' | 'economics'>('story');

  // Reject Modal state
  const [rejectingPost, setRejectingPost] = useState<VideoPost | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Unverified or duplicate footage');

  // Delete Post & Feed Modal State & Permissions
  const [deletingPost, setDeletingPost] = useState<VideoPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Role-based delete permissions:
  // Super Admin, Editor, and Moderator have permission to delete videos and feeds.
  // Ad Manager is restricted to advertisements only and cannot delete news feeds.
  const canDeletePosts = simulatedRole === 'super_admin' || simulatedRole === 'editor' || simulatedRole === 'moderator';

  // Payout Drawer / Modal state
  const [payoutTargetPost, setPayoutTargetPost] = useState<VideoPost | null>(null);
  const [customGrantAmount, setCustomGrantAmount] = useState<number>(100);
  const [bountyBonus, setBountyBonus] = useState<number>(0);
  const [payoutFeedback, setPayoutFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Editorial Step 2 Review & Accept Modal State
  const [acceptingPost, setAcceptingPost] = useState<VideoPost | null>(null);
  const [editorialLandmark, setEditorialLandmark] = useState('');
  const [editorialNeighborhood, setEditorialNeighborhood] = useState('');
  const [editorialLat, setEditorialLat] = useState<number>(13.0827);
  const [editorialLng, setEditorialLng] = useState<number>(80.2707);
  const [editorialRadius, setEditorialRadius] = useState<number>(4000);
  const [editorialCitation, setEditorialCitation] = useState('');
  const [editorialBreaking, setEditorialBreaking] = useState(false);
  const [editorialPriceAward, setEditorialPriceAward] = useState<number>(100);
  const [editorialRpm, setEditorialRpm] = useState<number>(350);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Derive Admin Stats dynamically
  const stats = useMemo(() => getAdminDashboardStats(), [posts]);

  // Handlers for Step 2 Accept
  const openAcceptModal = (post: VideoPost, isBreakingDefault: boolean = false) => {
    setAcceptingPost(post);
    setEditorialLandmark(post.location.placeName || 'Chennai Hub');
    setEditorialNeighborhood(post.location.neighborhood || 'Chennai');
    setEditorialLat(post.location.lat || 13.0827);
    setEditorialLng(post.location.lng || 80.2707);
    setEditorialRadius(post.location.radiusMeters || 4000);
    setEditorialCitation(
      post.sourceCitation && post.sourceCitation !== 'Citizen on-ground eyewitness dispatch'
        ? post.sourceCitation
        : 'Direct citizen eyewitness dispatch verified by Bureau Desk'
    );
    setEditorialBreaking(isBreakingDefault || post.isBreaking || false);
    setEditorialPriceAward(post.priceAward || (isBreakingDefault ? 250 : 100));
    setEditorialRpm(post.rpmRate || (isBreakingDefault ? 500 : 350));
  };

  const handleConfirmAccept = async () => {
    if (!acceptingPost) return;
    setIsSubmittingApproval(true);

    const editorialData = {
      landmark: editorialLandmark.trim() || 'Chennai Hub',
      neighborhood: editorialNeighborhood.trim() || 'Chennai',
      lat: editorialLat,
      lng: editorialLng,
      radiusMeters: editorialRadius,
      sourceCitation: editorialCitation.trim() || 'Verified by LocalPulse Bureau Desk',
      isBreaking: editorialBreaking,
      priceAward: editorialPriceAward,
      grantAmount: editorialPriceAward,
      rpmRate: editorialRpm,
      reviewerDesk: adminUser?.name ? `${adminUser.name} Desk` : 'Chennai & Tiruvallur Admin Bureau'
    };

    // 1. Local update & wallet grant
    acceptAndPublishPostByAdmin(acceptingPost.id, editorialData);

    // 2. Sync to Supabase PostgreSQL database
    try {
      await apiClient.updatePost(acceptingPost.id, {
        location: {
          placeName: editorialData.landmark,
          neighborhood: editorialData.neighborhood,
          lat: editorialData.lat,
          lng: editorialData.lng,
          radiusMeters: editorialData.radiusMeters
        },
        sourceCitation: editorialData.sourceCitation,
        isBreaking: editorialData.isBreaking,
        adminReviewStatus: editorialData.isBreaking ? 'bounty_awarded' : 'verified_approved',
        status: 'published',
        adminPayoutAmount: editorialData.priceAward,
        priceAward: editorialData.priceAward,
        rpmRate: editorialData.rpmRate,
        adminDisbursedDate: new Date().toISOString(),
        adminReviewerDesk: editorialData.reviewerDesk
      });
    } catch (syncErr) {
      console.warn('[Sync to Supabase warning]:', syncErr);
    }

    setIsSubmittingApproval(false);
    setAcceptingPost(null);
    onRefreshData();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPost) return;
    if (!canDeletePosts) {
      alert('Access Denied: Ad Managers do not have permission to delete news videos and feeds.');
      setDeletingPost(null);
      return;
    }

    const targetId = deletingPost.id;
    const targetTitle = deletingPost.headline;
    setIsDeletingPost(true);

    try {
      // 1. Delete from local storage
      deleteStoredPost(targetId);

      // 2. Delete from server backend & PostgreSQL
      await apiClient.deletePost(targetId);

      // 3. Close inspect modal if currently inspecting this deleted post
      if (inspectingPost?.id === targetId) {
        setInspectingPost(null);
      }

      // 4. Trigger parent app refresh so feeds update instantly
      onRefreshData();

      setDeleteNotice(`Post "${targetTitle}" was permanently deleted from feeds and database.`);
      setTimeout(() => setDeleteNotice(null), 4500);
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setIsDeletingPost(false);
      setDeletingPost(null);
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return posts.filter((post) => {
      // Status filter
      if (requestFilter === 'pending') {
        if (post.adminReviewStatus && post.adminReviewStatus !== 'pending_review') return false;
      } else if (requestFilter === 'approved') {
        if (post.adminReviewStatus !== 'verified_approved' && post.adminReviewStatus !== 'bounty_awarded') return false;
      } else if (requestFilter === 'rejected') {
        if (post.adminReviewStatus !== 'rejected') return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          post.headline.toLowerCase().includes(q) ||
          post.creatorName.toLowerCase().includes(q) ||
          post.creatorHandle.toLowerCase().includes(q) ||
          post.location.placeName.toLowerCase().includes(q) ||
          (post.location.neighborhood && post.location.neighborhood.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [posts, requestFilter, searchQuery]);

  // Posts eligible for payout (approved video reports)
  const payoutQueue = useMemo(() => {
    return posts.filter(
      (p) =>
        p.adminReviewStatus === 'verified_approved' ||
        p.adminReviewStatus === 'bounty_awarded' ||
        p.adminReviewStatus === 'pending_review'
    );
  }, [posts]);

  // Handlers
  const handleApprove = (postId: string, isBreaking: boolean = false) => {
    updatePostReviewStatus(postId, isBreaking ? 'bounty_awarded' : 'verified_approved', isBreaking);
    onRefreshData();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPost) return;
    rejectPost(rejectingPost.id, rejectionReason);
    setRejectingPost(null);
    onRefreshData();
  };

  const handleDisburseGrant = (postId: string) => {
    const result = approveAdminPayout(
      postId,
      customGrantAmount,
      bountyBonus,
      'Chennai & Tiruvallur Admin Bureau'
    );
    setPayoutFeedback(result);
    if (result.success) {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 }
      });
      onRefreshData();
      setTimeout(() => {
        setPayoutTargetPost(null);
        setPayoutFeedback(null);
        setBountyBonus(0);
      }, 2000);
    }
  };

  const toggleSelectPost = (postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const isAllSelected = filteredRequests.length > 0 && selectedPostIds.size === filteredRequests.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(filteredRequests.map((p) => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedPostIds);
    if (ids.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    try {
      await apiClient.bulkUpdatePosts({ postIds: ids, action: 'approve' });
      bulkUpdateStoredPosts(ids, 'approve');
      setSelectedPostIds(new Set());
      onRefreshData();
      setBulkSuccessNotice(`Successfully approved ${ids.length} video reports!`);
      setTimeout(() => setBulkSuccessNotice(null), 4000);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert(`Bulk approval failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedPostIds);
    if (ids.length === 0 || isBulkProcessing) return;
    const reason = window.prompt(
      `Reject ${ids.length} selected video posts? Enter reason:`,
      'Unverified or duplicate citizen footage'
    );
    if (reason === null) return;
    setIsBulkProcessing(true);
    try {
      await apiClient.bulkUpdatePosts({ postIds: ids, action: 'reject', updates: { rejectionReason: reason } });
      bulkUpdateStoredPosts(ids, 'reject', { rejectionReason: reason });
      setSelectedPostIds(new Set());
      onRefreshData();
      setBulkSuccessNotice(`${ids.length} video posts rejected.`);
      setTimeout(() => setBulkSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Bulk rejection failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedPostIds);
    if (ids.length === 0 || isBulkProcessing) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected video posts? This cannot be undone.`)) {
      return;
    }
    setIsBulkProcessing(true);
    try {
      await apiClient.bulkUpdatePosts({ postIds: ids, action: 'delete' });
      bulkUpdateStoredPosts(ids, 'delete');
      setSelectedPostIds(new Set());
      onRefreshData();
      setBulkSuccessNotice(`${ids.length} video posts permanently deleted.`);
      setTimeout(() => setBulkSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Bulk delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkUpdateCategory = async (category: NewsCategory) => {
    const ids = Array.from(selectedPostIds);
    if (ids.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    try {
      await apiClient.bulkUpdatePosts({ postIds: ids, action: 'update', updates: { category } });
      bulkUpdateStoredPosts(ids, 'update', { category });
      setSelectedPostIds(new Set());
      onRefreshData();
      setBulkSuccessNotice(`Updated category to "${category}" for ${ids.length} videos.`);
      setTimeout(() => setBulkSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Bulk update category failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkUpdateLocation = async (loc: LocationCoordinates) => {
    const ids = Array.from(selectedPostIds);
    if (ids.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);
    try {
      await apiClient.bulkUpdatePosts({ postIds: ids, action: 'update', updates: { location: loc } });
      bulkUpdateStoredPosts(ids, 'update', { location: loc });
      setSelectedPostIds(new Set());
      onRefreshData();
      setBulkSuccessNotice(`Updated location to "${loc.neighborhood || loc.placeName}" for ${ids.length} videos.`);
      setTimeout(() => setBulkSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Bulk update location failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="admin-page-root">
      {/* 1. Official Admin Top Bar */}
      <div className="admin-header-outer">
        <div className="admin-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 69, 0, 0.2)',
                border: '1px solid rgba(255, 69, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
                  Spotlight Bureau Desk
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background:
                      simulatedRole === 'super_admin' ? '#ea580c' :
                      simulatedRole === 'editor' ? '#0284c7' :
                      simulatedRole === 'moderator' ? '#7c3aed' : '#059669',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}
                >
                  {simulatedRole === 'super_admin' ? 'SUPER ADMIN' :
                   simulatedRole === 'editor' ? 'EDITOR' :
                   simulatedRole === 'moderator' ? 'MODERATOR' : 'AD MANAGER'}
                </span>

                {/* Role Switcher Simulator */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Role:</span>
                  <select
                    value={simulatedRole}
                    onChange={(e) => handleSwitchSimulatedRole(e.target.value as AdminRoleType)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fb923c',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    title="Simulate / test role access"
                  >
                    <option value="super_admin" style={{ background: '#0f172a', color: '#fff' }}>Super Admin (Full)</option>
                    <option value="editor" style={{ background: '#0f172a', color: '#fff' }}>Editor (News)</option>
                    <option value="moderator" style={{ background: '#0f172a', color: '#fff' }}>Moderator (Review)</option>
                    <option value="ad_manager" style={{ background: '#0f172a', color: '#fff' }}>Ad Manager (Ads Only)</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '2px' }}>
                {adminUser?.name ? `${adminUser.name} • Chennai & Tiruvallur Bureau` : 'Chennai & Tiruvallur Editorial Authority'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                title="Sign Out of Bureau Desk"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              <ArrowLeft size={14} />
              <span>Citizen App (/)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="admin-tabs-outer">
        <div className="admin-tabs-inner">
          {/* TAB 1: Requests (Super Admin, Editor, Moderator) */}
          {isTabAllowed('requests', simulatedRole) && (
            <button
              onClick={() => setActiveTab('requests')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'requests' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'requests' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <Film size={16} />
              <span>Video Requests</span>
              {stats.pendingReviewCount > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#ea580c',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {stats.pendingReviewCount}
                </span>
              )}
            </button>
          )}

          {/* TAB: Social Media Content (Super Admin, Editor, Moderator) */}
          {isTabAllowed('social_media', simulatedRole) && (
            <button
              onClick={() => setActiveTab('social_media')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'social_media' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'social_media' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <Globe size={16} />
              <span>Social Media Content (சமூக ஊடக உள்ளடக்கம்)</span>
              {socialPosts.filter((p) => p.status === 'staged_pending').length > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#ea580c',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {socialPosts.filter((p) => p.status === 'staged_pending').length}
                </span>
              )}
            </button>
          )}

          {/* TAB 2: Payouts (Super Admin only) */}
          {isTabAllowed('payouts', simulatedRole) && (
            <button
              onClick={() => setActiveTab('payouts')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'payouts' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'payouts' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <CreditCard size={16} />
              <span>Payment Approval</span>
            </button>
          )}

          {/* TAB: SPOTLIGHT 360 (Bulk Video Upload, Hyperlocal Radius Targeting & Campaigns) */}
          {isTabAllowed('spotlight360', simulatedRole) && (
            <button
              onClick={() => setActiveTab('spotlight360')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'spotlight360' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'spotlight360' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <Sparkles size={16} />
              <span>Spotlight360</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  letterSpacing: '0.4px'
                }}
              >
                NEW
              </span>
            </button>
          )}

          {/* TAB 3: Advertisements (Super Admin, Ad Manager) */}
          {isTabAllowed('advertisements', simulatedRole) && (
            <button
              onClick={() => setActiveTab('advertisements')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'advertisements' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'advertisements' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <Megaphone size={16} />
              <span>Advertisements (விளம்பரங்கள்)</span>
              {ads.filter((a) => a.status === 'active').length > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {ads.filter((a) => a.status === 'active').length}
                </span>
              )}
            </button>
          )}

          {/* TAB 4: Statistical Analytics (All permitted roles) */}
          {isTabAllowed('analytics', simulatedRole) && (
            <button
              onClick={() => setActiveTab('analytics')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'analytics' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'analytics' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <BarChart3 size={16} />
              <span>Statistical Dashboard</span>
            </button>
          )}

          {/* TAB 5: App Settings & Admin Roles (Super Admin only) */}
          {isTabAllowed('settings', simulatedRole) && (
            <button
              onClick={() => setActiveTab('settings')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'settings' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'settings' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <Settings size={16} />
              <span>App Settings (அமைப்புகள்)</span>
            </button>
          )}

          {/* TAB 6: Copyright & Strikes (Super Admin, Editor, Moderator) */}
          {isTabAllowed('copyright', simulatedRole) && (
            <button
              onClick={() => setActiveTab('copyright')}
              className="admin-tab-button"
              style={{
                color: activeTab === 'copyright' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'copyright' ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent'
              }}
            >
              <ShieldAlert size={16} />
              <span>Copyright & Strikes (பதிப்புரிமை)</span>
              {pendingCopyrightCount > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}
                >
                  {pendingCopyrightCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Tab Contents */}
      <div className="admin-main-container">
        {/* ============================================================ */}
        {/* TAB 1: VIDEO POST REQUESTS                                  */}
        {/* ============================================================ */}
        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Filter pills & Search input */}
            <div className="admin-filter-bar">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '9px 14px',
                  width: '100%',
                  maxWidth: '380px'
                }}
              >
                <Search size={16} color="var(--text-tertiary)" />
                <input
                  type="text"
                  placeholder="Search reporter, location, or headline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '13px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', flexWrap: 'wrap' }}>
                {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestFilter(st)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      background: requestFilter === st ? 'var(--brand-primary)' : '#ffffff',
                      color: requestFilter === st ? '#ffffff' : 'var(--text-secondary)',
                      border: requestFilter === st ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: requestFilter === st ? 'var(--shadow-sm)' : 'none',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {st === 'all'
                      ? `All Requests (${posts.length})`
                      : st === 'pending'
                      ? `Pending (${stats.pendingReviewCount})`
                      : st === 'approved'
                      ? `Approved (${stats.approvedCount})`
                      : `Rejected (${stats.rejectedCount})`}
                  </button>
                ))}

                {filteredRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: isAllSelected ? '#fff7ed' : '#ffffff',
                      color: isAllSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      border: isAllSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      boxShadow: isAllSelected ? 'var(--shadow-sm)' : 'none',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Select/Deselect all videos in current view"
                  >
                    <CheckSquare size={13} />
                    <span>{isAllSelected ? 'Deselect All' : `Select All (${filteredRequests.length})`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Request cards list */}
            {filteredRequests.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '50px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  maxWidth: '640px',
                  margin: '30px auto',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: 'var(--brand-primary)',
                    border: '1px solid #ffedd5'
                  }}
                >
                  <FileVideo size={28} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {posts.length === 0
                    ? 'No Video Requests Submitted'
                    : `No ${requestFilter === 'all' ? '' : requestFilter.charAt(0).toUpperCase() + requestFilter.slice(1) + ' '}Video Requests`}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '340px', margin: '0 auto' }}>
                  {posts.length === 0
                    ? 'Citizen journalists have not submitted any news video dispatches yet across Chennai & Tiruvallur Districts. When news reels are submitted from the field, they will appear here for editorial review and verification.'
                    : requestFilter === 'pending'
                    ? 'All incoming citizen video dispatches have been moderated and reviewed.'
                    : 'No video reports match the selected queue filter.'}
                </p>
              </div>
            ) : (
              <div className="admin-responsive-grid">
                {filteredRequests.map((post) => {
                const isPlaying = playingPostId === post.id;
                const isPending = !post.adminReviewStatus || post.adminReviewStatus === 'pending_review';

                return (
                  <div
                    key={post.id}
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
                    {/* Reporter Header */}
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedPostIds.has(post.id)}
                          onChange={() => toggleSelectPost(post.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: 'var(--brand-primary)'
                          }}
                          title="Select video for bulk update"
                        />
                        <img
                          src={post.creatorAvatar}
                          alt={post.creatorName}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const name = post.creatorName || 'User';
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="%232563eb"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">${encodeURIComponent(name.slice(0, 2).toUpperCase())}</text></svg>`;
                          }}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                            <span>{post.creatorName}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>@{post.creatorHandle}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={10} color="var(--brand-primary)" />
                            <span>{post.location.neighborhood || post.location.placeName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {post.adminReviewStatus === 'bounty_awarded' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#ecfdf5',
                              color: '#047857',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 800
                            }}
                          >
                            <Award size={11} />
                            <span>Bounty Awarded</span>
                          </span>
                        ) : post.adminReviewStatus === 'verified_approved' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#f0fdf4',
                              color: '#15803d',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <CheckCircle2 size={11} />
                            <span>Approved</span>
                          </span>
                        ) : post.adminReviewStatus === 'rejected' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <XCircle size={11} />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#fff7ed',
                              color: '#ea580c',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            <Clock size={11} />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Media Preview & Headline */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Video / Thumbnail Container */}
                        <div
                          style={{
                            width: '104px',
                            height: '134px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative',
                            background: '#090d16',
                            flexShrink: 0,
                            cursor: 'pointer',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                          onClick={() => setInspectingPost(post)}
                          title="Click to inspect entire post in popup"
                        >
                          <img
                            src={post.thumbnailUrl || post.mediaUrl}
                            alt={post.headline}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400';
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(0,0,0,0.32)',
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'rgba(255, 69, 0, 0.92)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                              }}
                            >
                              <Eye size={16} />
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#ffffff',
                                fontWeight: 800,
                                marginTop: '4px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                              }}
                            >
                              Inspect
                            </span>
                          </div>
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '4px',
                              right: '4px',
                              fontSize: '9px',
                              fontWeight: 800,
                              background: 'rgba(0,0,0,0.75)',
                              color: '#ffffff',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}
                          >
                            {post.type === 'image' ? 'PHOTO' : 'VIDEO'}
                          </span>
                        </div>

                        {/* Text and context */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span className={`category-tag-badge ${post.category}`}>
                                {post.category}
                              </span>
                              {post.isBreaking && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 800,
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '1px 5px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Breaking
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => setInspectingPost(post)}
                              title="Click to inspect entire post in popup"
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                lineHeight: 1.35,
                                marginBottom: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {post.headline}
                            </h3>

                            <p
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {post.caption}
                            </p>
                          </div>

                          {post.sourceCitation && (
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                              Source: {post.sourceCitation}
                            </div>
                          )}

                          {post.rejectionReason && (
                            <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
                              Reason: {post.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Editorial Action Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px',
                          paddingTop: '10px',
                          borderTop: '1px solid #f1f5f9',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}
                      >
                        <button
                          onClick={() => setInspectingPost(post)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            color: 'var(--text-primary)',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} color="var(--brand-primary)" />
                          <span>Inspect Full Post</span>
                        </button>

                        {isPending ? (
                          <>
                            <button
                              onClick={() => openAcceptModal(post, false)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: '#10b981',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={14} />
                              <span>Calibrate & Approve (Step 2)</span>
                            </button>

                            <button
                              onClick={() => openAcceptModal(post, true)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Award size={14} />
                              <span>Mark Breaking</span>
                            </button>

                            <button
                              onClick={() => setRejectingPost(post)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : post.adminReviewStatus === 'verified_approved' || post.adminReviewStatus === 'bounty_awarded' ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => openAcceptModal(post, false)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Sliders size={13} />
                              <span>Re-Calibrate Geotag & RPM</span>
                            </button>
                          </div>
                        ) : null}

                        {canDeletePosts && (
                          <button
                            type="button"
                            onClick={() => setDeletingPost(post)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #fecdd3',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              marginLeft: 'auto'
                            }}
                            title="Delete video post & feed"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Bulk Success Notice Toast */}
            {bulkSuccessNotice && (
              <div
                style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  zIndex: 1000,
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>{bulkSuccessNotice}</span>
              </div>
            )}

            {/* Floating Bulk Action Bar (Visible only when videos are selected) */}
            {selectedPostIds.size > 0 && (
              <div
                style={{
                  position: 'fixed',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 999,
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 69, 0, 0.4)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                  borderRadius: '16px',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  maxWidth: '94vw'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {selectedPostIds.size} Selected
                  </span>
                </div>

                <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

                {/* Bulk Approve */}
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  disabled={isBulkProcessing}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: isBulkProcessing ? 'wait' : 'pointer',
                    opacity: isBulkProcessing ? 0.7 : 1
                  }}
                  title="Approve all selected videos"
                >
                  <Check size={14} />
                  <span>Bulk Approve</span>
                </button>

                {/* Bulk Reject */}
                <button
                  type="button"
                  onClick={handleBulkReject}
                  disabled={isBulkProcessing}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: isBulkProcessing ? 'wait' : 'pointer',
                    opacity: isBulkProcessing ? 0.7 : 1
                  }}
                  title="Reject all selected videos"
                >
                  <XCircle size={14} />
                  <span>Bulk Reject</span>
                </button>

                {/* Bulk Category dropdown */}
                <select
                  disabled={isBulkProcessing}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdateCategory(e.target.value as NewsCategory);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Change category for selected videos"
                >
                  <option value="">Bulk Category...</option>
                  <option value="civic">Civic & Infrastructure</option>
                  <option value="traffic">Traffic & Transit</option>
                  <option value="safety">Safety & Emergency</option>
                  <option value="weather">Weather & Rain</option>
                  <option value="community">Community & Life</option>
                  <option value="business">Markets & Commerce</option>
                  <option value="sports">Sports & Events</option>
                </select>

                {/* Bulk Location Hub dropdown */}
                <select
                  disabled={isBulkProcessing}
                  onChange={(e) => {
                    if (e.target.value) {
                      const found = PRESET_LOCATIONS.find((l) => l.placeName === e.target.value);
                      if (found) handleBulkUpdateLocation(found);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Change location hub for selected videos"
                >
                  <option value="">Bulk Location...</option>
                  {PRESET_LOCATIONS.map((l) => (
                    <option key={l.placeName} value={l.placeName}>
                      {l.neighborhood || l.placeName}
                    </option>
                  ))}
                </select>

                {/* Bulk Delete */}
                {canDeletePosts && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={isBulkProcessing}
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'transparent',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: isBulkProcessing ? 'wait' : 'pointer',
                      opacity: isBulkProcessing ? 0.7 : 1
                    }}
                    title="Permanently delete selected videos"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}

                {/* Deselect / Cancel */}
                <button
                  type="button"
                  onClick={() => setSelectedPostIds(new Set())}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: VIDEO PAYMENT APPROVAL                                */}
        {/* ============================================================ */}
        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Treasury summary box */}
            <div className="admin-treasury-banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                    Admin Treasury UPI Disbursements
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    Direct UPI Rails Active
                  </span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {formatINR(stats.totalDisbursedINR)}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>
                  Disbursed to citizen journalists across Chennai & Tiruvallur Districts
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Pending Disbursement</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{payoutQueue.length} reports</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Settlement Rails</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>Instant NPCI / UPI</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Approved Video Reports Ready For Grant Disbursement ({payoutQueue.length})
            </div>

            {payoutQueue.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '50px 24px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  maxWidth: '640px',
                  margin: '30px auto',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: posts.length === 0 ? '#f8fafc' : '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: posts.length === 0 ? 'var(--brand-primary)' : '#059669',
                    border: posts.length === 0 ? '1px solid var(--border-subtle)' : '1px solid #a7f3d0'
                  }}
                >
                  {posts.length === 0 ? <CreditCard size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {posts.length === 0 ? 'No Video Reports Awaiting Payment' : 'All Video Grants Settled'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '340px', margin: '0 auto' }}>
                  {posts.length === 0
                    ? 'No citizen video dispatches have been submitted yet. Once citizen news videos are approved by the editorial desk, they will appear here for 1-click UPI grant disbursement.'
                    : 'All eligible citizen video dispatches have received their approved UPI treasury payouts.'}
                </p>
              </div>
            ) : (
              <div className="admin-responsive-grid">
                {payoutQueue.map((post) => {
                  const totalPaidSoFar = (post.adminPayoutAmount || 0) + (post.adminBountyAwarded || 0);

                  return (
                    <div
                      key={post.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <img
                          src={post.thumbnailUrl}
                          alt={post.headline}
                          style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '4px' }}>
                            {post.headline}
                          </h4>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>By @{post.creatorHandle}</span>
                            <span>•</span>
                            <span>{post.qualifiedViewCount} qualified views</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #f1f5f9'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Disbursed:</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-primary)', marginLeft: '4px' }}>
                            {formatINR(totalPaidSoFar)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setInspectingPost(post)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={() => setPayoutTargetPost(post)}
                            className="btn-primary"
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CreditCard size={13} />
                            <span>Disburse Payout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: STATISTICAL DASHBOARD                                 */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top 4 KPI Cards */}
            <div className="admin-kpi-grid">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-primary)', marginBottom: '6px' }}>
                  <DollarSign size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Disbursed</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatINR(stats.totalDisbursedINR)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
                  Admin UPI Treasury
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea580c', marginBottom: '6px' }}>
                  <Film size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Submitted Videos</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.totalVideosSubmitted}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Short News Reels
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', marginBottom: '6px' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending Review</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.pendingReviewCount}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Awaiting Verification
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', marginBottom: '6px' }}>
                  <Users size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Reporters</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.activeReportersCount}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Citizen Journalists
                </div>
              </div>
            </div>

            {/* Analytics Dashboard Grid (2 columns on desktop) */}
            <div className="admin-analytics-grid">
              {/* Geographic Coverage: Chennai vs Tiruvallur */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <MapPin size={18} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>North Tamil Nadu District Coverage</h3>
                </div>

                {stats.totalVideosSubmitted === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed var(--border-subtle)'
                    }}
                  >
                    <MapPin size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No District Telemetry Yet
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      Geographic reporting distribution between Chennai and Tiruvallur will update automatically once citizen news videos are submitted.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Chennai District</span>
                        <span>
                          {stats.districtBreakdown.chennai} reports (
                          {Math.round((stats.districtBreakdown.chennai / stats.totalVideosSubmitted) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--brand-primary)',
                            width: `${(stats.districtBreakdown.chennai / stats.totalVideosSubmitted) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Tiruvallur District</span>
                        <span>
                          {stats.districtBreakdown.tiruvallur} reports (
                          {Math.round((stats.districtBreakdown.tiruvallur / stats.totalVideosSubmitted) * 100)}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: '#ea580c',
                            width: `${(stats.districtBreakdown.tiruvallur / stats.totalVideosSubmitted) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={18} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Category Breakdown</h3>
                </div>

                {Object.keys(stats.categoryBreakdown).length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 16px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px dashed var(--border-subtle)'
                    }}
                  >
                    <TrendingUp size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Category Telemetry Yet
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      Categorical distribution (Civic, Traffic, Weather, Crime, Community) will display here as stories are uploaded.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span className={`category-tag-badge ${cat}`}>{cat}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{count} {count === 1 ? 'story' : 'stories'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editorial Performance & Treasury Health (Spans 2 columns on desktop) */}
              <div
                className="admin-analytics-fullwidth"
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                  Editorial Performance & Treasury Health
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Approval Rate</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: stats.totalVideosSubmitted > 0 ? '#059669' : 'var(--text-tertiary)' }}>
                      {stats.totalVideosSubmitted > 0 ? `${stats.approvalRatePercent}%` : '0% (No reviews yet)'}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Editorial Turnaround</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {stats.pendingReviewCount > 0 ? '~15 Mins (Active Queue)' : 'Instant (Queue Empty)'}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Disbursement Gateway</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      Admin UPI Treasury Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: SOCIAL MEDIA CONTENT (சமூக ஊடக உள்ளடக்கம்)               */}
        {/* ============================================================ */}
        {activeTab === 'social_media' && (
          <SocialMediaContentManager
            posts={socialPosts}
            onRefreshPosts={handleRefreshSocialPosts}
            onFetchContent={handleFetchSocialContent}
            onAiEnhance={handleAiEnhanceSocial}
            onApprovePublish={handleApproveSocialPublish}
            onReject={handleRejectSocial}
            onDelete={handleDeleteSocial}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 4: ADVERTISEMENTS MANAGEMENT (Admin -> Advertisements)   */}
        {/* ============================================================ */}
        {activeTab === 'advertisements' && (
          <AdvertisementManager
            ads={ads}
            onRefreshAds={() => {
              apiClient.getAds().then((serverAds) => {
                if (serverAds && serverAds.length > 0) {
                  setAds(serverAds);
                  saveStoredAds(serverAds);
                } else {
                  setAds(getStoredAds());
                }
              }).catch(() => setAds(getStoredAds()));
            }}
            onSaveAd={handleSaveAd}
            onDeleteAd={handleDeleteAd}
            onToggleStatus={handleToggleAdStatus}
          />
        )}

        {/* ============================================================ */}
        {/* TAB: SPOTLIGHT 360 & BULK VIDEO UPLOAD                       */}
        {/* ============================================================ */}
        {activeTab === 'spotlight360' && (
          <Spotlight360Manager
            onRefreshData={onRefreshData}
            adminName={adminUser?.name || 'Chennai & Tiruvallur Bureau'}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 5: APP SETTINGS & ADMIN PERMISSIONS                      */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <AppSettingsManager
            settings={appSettings}
            onSaveSettings={handleSaveAppSettings}
            onSaveAdminUser={handleSaveAdminUser}
            onDeleteAdminUser={handleDeleteAdminUser}
            onSwitchSimulatedRole={handleSwitchSimulatedRole}
            currentSimulatedRole={simulatedRole}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 6: COPYRIGHT & STRIKE MODERATION (YouTube 3-Strike System) */}
        {/* ============================================================ */}
        {activeTab === 'copyright' && (
          <CopyrightManager
            posts={posts}
            onRefreshData={() => {
              onRefreshData();
              apiClient.getCopyrightReports('pending').then((reps) => {
                if (reps) setPendingCopyrightCount(reps.length);
              }).catch(() => {});
            }}
            adminName={adminUser?.name || 'SuperAdmin Bureau Desk'}
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: Delete Video & Feed Confirmation                      */}
      {/* ============================================================ */}
      {deletingPost && (
        <div className="admin-modal-overlay" onClick={() => !isDeletingPost && setDeletingPost(null)}>
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', border: '1.5px solid #fecdd3' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#b91c1c', margin: 0 }}>
                    Delete Video Post & Feed?
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Admin Permission Action • {simulatedRole.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => !isDeletingPost && setDeletingPost(null)}
                disabled={isDeletingPost}
                style={{ border: 'none', background: 'transparent', cursor: isDeletingPost ? 'not-allowed' : 'pointer' }}
              >
                <X size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Post preview thumbnail & info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#000000',
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
                {deletingPost.type === 'image' || !deletingPost.mediaUrl?.match(/\.(mp4|webm|mov|m4v)/i) ? (
                  <img
                    src={deletingPost.mediaUrl || deletingPost.thumbnailUrl}
                    alt={deletingPost.headline}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400';
                    }}
                  />
                ) : (
                  <video
                    src={deletingPost.mediaUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span className={`category-tag-badge ${deletingPost.category}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {deletingPost.category}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    ID: {deletingPost.id}
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {deletingPost.headline}
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  By @{deletingPost.creatorHandle} ({deletingPost.creatorName})
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                gap: '10px'
              }}
            >
              <AlertTriangle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#9f1239', lineHeight: 1.5 }}>
                <strong>Permanent Deletion Warning:</strong> This will remove this video item completely from the public feed, citizen timelines, comments, and database storage. This action cannot be reversed.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                disabled={isDeletingPost}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: isDeletingPost ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeletePost}
                disabled={isDeletingPost}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: isDeletingPost ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                <Trash2 size={15} />
                <span>{isDeletingPost ? 'Deleting Video...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Reject Post with Reason                               */}
      {/* ============================================================ */}
      {rejectingPost && (
        <div className="admin-modal-overlay" onClick={() => setRejectingPost(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-alert)' }}>
                Reject Video Submission
              </h3>
              <button onClick={() => setRejectingPost(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <XCircle size={18} color="var(--text-secondary)" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please provide a clear editorial reason for rejecting <strong>"{rejectingPost.headline}"</strong>:
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Unverified or duplicate footage',
                'Low video resolution / inaudible audio',
                'Outside Chennai & Tiruvallur coverage zone',
                'Violates community safety guidelines'
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: rejectionReason === reason ? '#fff1f2' : '#f8fafc',
                    border: rejectionReason === reason ? '1px solid #fecdd3' : '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    style={{ accentColor: '#e11d48' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirm Video Rejection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Payout Grant Disbursement                             */}
      {/* ============================================================ */}
      {payoutTargetPost && (
        <div className="admin-modal-overlay" onClick={() => setPayoutTargetPost(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Disburse Video Grant (₹)</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Platform Admin Treasury to @{payoutTargetPost.creatorHandle}
                </div>
              </div>
              <button onClick={() => setPayoutTargetPost(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <XCircle size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {payoutFeedback ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={44} color="var(--color-success)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Grant Disbursed Successfully!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {payoutFeedback.message}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Select Video Grant Tier
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCustomGrantAmount(amt)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '8px',
                          background: customGrantAmount === amt ? '#fff7ed' : '#f8fafc',
                          border: customGrantAmount === amt ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          color: customGrantAmount === amt ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Add Breaking News Bounty Bonus (Optional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[0, 150, 300].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBountyBonus(b)}
                        style={{
                          padding: '8px 6px',
                          borderRadius: '8px',
                          background: bountyBonus === b ? '#ecfdf5' : '#f8fafc',
                          border: bountyBonus === b ? '2px solid #059669' : '1px solid var(--border-subtle)',
                          color: bountyBonus === b ? '#059669' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {b === 0 ? 'No Bounty' : `+₹${b}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Disbursement:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {formatINR(customGrantAmount + bountyBonus)}
                  </span>
                </div>

                <button
                  onClick={() => handleDisburseGrant(payoutTargetPost.id)}
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={15} />
                  <span>Execute UPI Transfer ({formatINR(customGrantAmount + bountyBonus)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2 MODAL: Bureau Review, Price Award & RPM Allocation   */}
      {/* ============================================================ */}
      {acceptingPost && (
        <div
          className="admin-modal-overlay"
          onClick={() => !isSubmittingApproval && setAcceptingPost(null)}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '14px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: editorialBreaking ? '#fef2f2' : '#ecfdf5',
                    color: editorialBreaking ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Step 2: Editorial Review & Public Launch
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 7px',
                        borderRadius: '6px'
                      }}
                    >
                      Admin Desk
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Allocate Price Award, RPM rate, and calibrate broadcast zone for @{acceptingPost.creatorHandle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => !isSubmittingApproval && setAcceptingPost(null)}
                disabled={isSubmittingApproval}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: isSubmittingApproval ? 'not-allowed' : 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Media & Dispatch Preview Snippet */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#000000',
                  flexShrink: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {acceptingPost.type === 'image' ||
                !acceptingPost.mediaUrl?.match(/\.(mp4|webm|mov|m4v)/i) ? (
                  <img
                    src={acceptingPost.mediaUrl || acceptingPost.thumbnailUrl}
                    alt="Citizen dispatch"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400';
                    }}
                  />
                ) : (
                  <video
                    src={acceptingPost.mediaUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '3px',
                    right: '3px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    textTransform: 'uppercase'
                  }}
                >
                  {acceptingPost.type === 'image' ? 'Photo' : 'Video'}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {acceptingPost.headline}
                </h4>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    margin: '3px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}
                >
                  {acceptingPost.caption}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginTop: '4px'
                  }}
                >
                  <span>
                    By <strong>{acceptingPost.creatorName}</strong> (@{acceptingPost.creatorHandle})
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(acceptingPost.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields: Price Award, RPM, Geotag, Radius, Citation, Breaking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 1. Price Award Allocation */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <DollarSign size={16} color="#16a34a" />
                    <span>1. Price Award Allocation (Instant Cash Grant)</span>
                  </label>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>
                    {formatINR(editorialPriceAward)}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#166534', marginBottom: '10px' }}>
                  Credited immediately to @{acceptingPost.creatorHandle}'s Spotlight Wallet upon approval.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { amt: 50, label: 'Tip (₹50)' },
                    { amt: 100, label: 'Standard (₹100)' },
                    { amt: 250, label: 'Bounty (₹250)' },
                    { amt: 500, label: 'Exclusive (₹500)' }
                  ].map((t) => (
                    <button
                      key={t.amt}
                      type="button"
                      onClick={() => setEditorialPriceAward(t.amt)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: editorialPriceAward === t.amt ? '2px solid #16a34a' : '1px solid #dcfce7',
                        background: editorialPriceAward === t.amt ? '#ffffff' : '#f0fdf4',
                        color: editorialPriceAward === t.amt ? '#15803d' : '#166534',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#166534' }}>Custom Price Award:</span>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={editorialPriceAward}
                      onChange={(e) => setEditorialPriceAward(Math.max(0, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        padding: '6px 8px 6px 22px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid #86efac',
                        background: '#ffffff',
                        color: '#15803d',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. RPM Allocation */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <TrendingUp size={16} color="#2563eb" />
                    <span>2. RPM Allocation (Revenue Per 1,000 Views)</span>
                  </label>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#1d4ed8' }}>
                    ₹{editorialRpm} / 1k views
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#1e40af', marginBottom: '10px' }}>
                  Citizen creator earns this rate for every 1,000 verified qualified views on this story.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { rpm: 150, label: 'Community (₹150)' },
                    { rpm: 250, label: 'Standard (₹250)' },
                    { rpm: 350, label: 'Verified (₹350)' },
                    { rpm: 500, label: 'High Viral (₹500)' }
                  ].map((r) => (
                    <button
                      key={r.rpm}
                      type="button"
                      onClick={() => setEditorialRpm(r.rpm)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: editorialRpm === r.rpm ? '2px solid #2563eb' : '1px solid #dbeafe',
                        background: editorialRpm === r.rpm ? '#ffffff' : '#eff6ff',
                        color: editorialRpm === r.rpm ? '#1d4ed8' : '#1e40af',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#1e40af' }}>Custom RPM Rate:</span>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>₹</span>
                    <input
                      type="number"
                      min="50"
                      step="25"
                      value={editorialRpm}
                      onChange={(e) => setEditorialRpm(Math.max(10, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        padding: '6px 8px 6px 22px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Landmark & Neighborhood Geotag */}
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}
                >
                  <MapPin size={14} color="var(--brand-primary)" />
                  <span>3. Hyperlocal Landmark & Neighborhood Geotag</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Primary Landmark / Junction
                    </label>
                    <input
                      type="text"
                      value={editorialLandmark}
                      onChange={(e) => setEditorialLandmark(e.target.value)}
                      placeholder="e.g. Koyambedu Wholesale Market"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                      Neighborhood / Ward Zone
                    </label>
                    <input
                      type="text"
                      value={editorialNeighborhood}
                      onChange={(e) => setEditorialNeighborhood(e.target.value)}
                      placeholder="e.g. Zone 8 Anna Nagar, Chennai"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Chennai Coordinates Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Presets:</span>
                  {[
                    { label: 'Central (13.08, 80.27)', lat: 13.0827, lng: 80.2707, name: 'Central Chennai Hub', ward: 'Zone 5' },
                    { label: 'South / OMR (12.98, 80.25)', lat: 12.9815, lng: 80.2512, name: 'OMR Tech Corridor', ward: 'Zone 13 Adyar' },
                    { label: 'North / Port (13.11, 80.28)', lat: 13.1147, lng: 80.2872, name: 'Royapuram / Port', ward: 'Zone 4' },
                    { label: 'West / Koyambedu (13.07, 80.19)', lat: 13.0694, lng: 80.1948, name: 'Koyambedu Hub', ward: 'Zone 8' },
                    { label: 'Tiruvallur (13.14, 79.90)', lat: 13.1444, lng: 79.9079, name: 'Tiruvallur Collectorate', ward: 'Tiruvallur West' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEditorialLat(preset.lat);
                        setEditorialLng(preset.lng);
                        if (!editorialLandmark || editorialLandmark === 'Chennai Hub') setEditorialLandmark(preset.name);
                        if (!editorialNeighborhood || editorialNeighborhood === 'Chennai') setEditorialNeighborhood(preset.ward);
                      }}
                      style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: (editorialLat === preset.lat && editorialLng === preset.lng) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                        background: (editorialLat === preset.lat && editorialLng === preset.lng) ? '#eff6ff' : '#ffffff',
                        color: (editorialLat === preset.lat && editorialLng === preset.lng) ? '#2563eb' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Broadcast Coverage Radius */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sliders size={14} color="var(--brand-primary)" />
                    <span>4. Hyperlocal Broadcast Perimeter</span>
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {(editorialRadius / 1000).toFixed(1)} km radius
                  </span>
                </div>

                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={500}
                  value={editorialRadius}
                  onChange={(e) => setEditorialRadius(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {[
                    { label: '2 km • Local', meters: 2000 },
                    { label: '5 km • Ward', meters: 5000 },
                    { label: '15 km • Zone', meters: 15000 },
                    { label: '35 km • City', meters: 35000 }
                  ].map((r) => (
                    <button
                      key={r.meters}
                      type="button"
                      onClick={() => setEditorialRadius(r.meters)}
                      style={{
                        padding: '5px 4px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textAlign: 'center',
                        border: editorialRadius === r.meters ? '1.5px solid var(--brand-primary)' : '1px solid #e2e8f0',
                        background: editorialRadius === r.meters ? '#fff7ed' : '#ffffff',
                        color: editorialRadius === r.meters ? 'var(--brand-primary)' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Bureau Source Citation */}
              <div>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}
                >
                  <ShieldCheck size={14} color="#0284c7" />
                  <span>5. Bureau Source Citation & Provenance</span>
                </label>
                <input
                  type="text"
                  value={editorialCitation}
                  onChange={(e) => setEditorialCitation(e.target.value)}
                  placeholder="e.g. Direct citizen eyewitness dispatch verified by Bureau Desk"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Suggested:</span>
                  {[
                    'Direct citizen eyewitness dispatch verified by Bureau Desk',
                    'Cross-verified with GCC Disaster Management Control Room',
                    'Confirmed with Chennai City Traffic Police (CCTP)',
                    'On-ground reporter corroborated dispatch'
                  ].map((cit) => (
                    <button
                      key={cit}
                      type="button"
                      onClick={() => setEditorialCitation(cit)}
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: editorialCitation === cit ? '#f0f9ff' : '#ffffff',
                        color: editorialCitation === cit ? '#0284c7' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cit.length > 28 ? cit.slice(0, 26) + '...' : cit}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Priority / Breaking News Toggle */}
              <div
                onClick={() => setEditorialBreaking(!editorialBreaking)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: editorialBreaking ? '1.5px solid #fecdd3' : '1px solid #e2e8f0',
                  background: editorialBreaking ? '#fff1f2' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: editorialBreaking ? '#e11d48' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Award size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: editorialBreaking ? '#be123c' : 'var(--text-primary)'
                      }}
                    >
                      Mark as Urgent Breaking News Dispatch
                    </div>
                    <div style={{ fontSize: '10px', color: editorialBreaking ? '#9f1239' : 'var(--text-tertiary)' }}>
                      Pins post to the top of citizen feeds and adds high-urgency flashing beacon
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editorialBreaking}
                  onChange={(e) => setEditorialBreaking(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#e11d48', cursor: 'pointer' }}
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <button
                type="button"
                onClick={() => setAcceptingPost(null)}
                disabled={isSubmittingApproval}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: isSubmittingApproval ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={isSubmittingApproval}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: isSubmittingApproval ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                {isSubmittingApproval ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Publishing & Disbursing...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Approve & Publish Public (₹{editorialPriceAward} • ₹{editorialRpm} RPM)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FULL POST INSPECTION POPUP TAB MODAL                         */}
      {/* ============================================================ */}
      {inspectingPost && (
        <div
          className="admin-modal-overlay"
          onClick={() => setInspectingPost(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              background: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.9)'
            }}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'var(--brand-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Eye size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Editorial Inspection Bureau
                    </h3>
                    <span className={`category-tag-badge ${inspectingPost.category}`}>
                      {inspectingPost.category}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#e2e8f0',
                        color: '#334155',
                        textTransform: 'uppercase'
                      }}
                    >
                      {inspectingPost.type === 'image' ? 'Photo Dispatch' : 'Video Dispatch'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Post ID: <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{inspectingPost.id}</span> • Submitted {new Date(inspectingPost.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {inspectingPost.adminReviewStatus === 'bounty_awarded' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#ecfdf5',
                      color: '#047857',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    <Award size={12} />
                    <span>Bounty Awarded (₹{inspectingPost.priceAward || 0})</span>
                  </span>
                ) : inspectingPost.adminReviewStatus === 'verified_approved' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f0fdf4',
                      color: '#15803d',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Verified & Published</span>
                  </span>
                ) : inspectingPost.adminReviewStatus === 'rejected' ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <XCircle size={12} />
                    <span>Rejected</span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fff7ed',
                      color: '#ea580c',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <Clock size={12} />
                    <span>Pending Bureau Review</span>
                  </span>
                )}

                <button
                  onClick={() => setInspectingPost(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px'
                  }}
                  title="Close inspection popup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tab Navigation Strip */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                padding: '0 20px',
                gap: '20px'
              }}
            >
              {[
                { id: 'story' as const, label: 'Story & Dispatch Media', icon: Film },
                { id: 'geotag' as const, label: 'Hyperlocal Geotag & Radar', icon: MapPin },
                { id: 'economics' as const, label: 'Economics & Monetization', icon: TrendingUp }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = inspectTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 4px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      borderBottom: isActive ? '2.5px solid var(--brand-primary)' : '2.5px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={15} color={isActive ? 'var(--brand-primary)' : 'currentColor'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Container (Scrollable) */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* TAB 1: STORY & MEDIA */}
              {inspectTab === 'story' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Full Size Media Container */}
                  <div
                    style={{
                      background: '#090d16',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxHeight: '440px',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    {inspectingPost.type === 'image' || !inspectingPost.mediaUrl?.match(/\.(mp4|webm|mov|m4v)/i) ? (
                      <img
                        src={inspectingPost.mediaUrl || inspectingPost.thumbnailUrl}
                        alt={inspectingPost.headline}
                        style={{
                          width: '100%',
                          maxHeight: '440px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
                        }}
                      />
                    ) : (
                      <video
                        src={inspectingPost.mediaUrl}
                        controls
                        autoPlay
                        playsInline
                        poster={inspectingPost.thumbnailUrl}
                        style={{
                          width: '100%',
                          maxHeight: '440px',
                          objectFit: 'contain'
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        display: 'flex',
                        gap: '6px'
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {inspectingPost.type === 'image' ? 'ORIGINAL PHOTO' : '1080p HD VIDEO'}
                      </span>
                      {inspectingPost.isBreaking && (
                        <span
                          style={{
                            background: '#e11d48',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          BREAKING DISPATCH
                        </span>
                      )}
                    </div>

                    <a
                      href={inspectingPost.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                      title="Open full media in new tab"
                    >
                      <ExternalLink size={12} />
                      <span>Original Raw Asset</span>
                    </a>
                  </div>

                  {/* Complete Headline & Story Narrative */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span className={`category-tag-badge ${inspectingPost.category}`}>
                        {inspectingPost.category}
                      </span>
                      {inspectingPost.isBreaking && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          Breaking News
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                        {new Date(inspectingPost.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1.35,
                        marginBottom: '10px'
                      }}
                    >
                      {inspectingPost.headline}
                    </h2>

                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: '#334155',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {inspectingPost.caption}
                    </div>

                    {/* Hashtags */}
                    {(() => {
                      const tags = inspectingPost.caption?.match(/#[a-zA-Z0-9_]+/g) || [];
                      if (tags.length === 0) return null;
                      return (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--brand-primary)',
                                background: '#fff7ed',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid #fed7aa'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Citizen Journalist Profile & Live Engagement Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    
                    {/* Reporter Card */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <img
                        src={inspectingPost.creatorAvatar}
                        alt={inspectingPost.creatorName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const name = inspectingPost.creatorName || 'User';
                          (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="22" fill="%232563eb"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="16" font-weight="bold">${encodeURIComponent(name.slice(0, 2).toUpperCase())}</text></svg>`;
                        }}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {inspectingPost.creatorName}
                          </span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}
                          >
                            VERIFIED
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          @{inspectingPost.creatorHandle} • ID: {inspectingPost.creatorId?.slice(0, 10)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                          Citizen Trust Index: {inspectingPost.creatorVerified ? '98/100' : '94/100'}
                        </div>
                      </div>
                    </div>

                    {/* Real-time Audience Engagement Bar */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '6px',
                        textAlign: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <Eye size={12} /> Views
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {(inspectingPost.viewCount || 0).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <Heart size={12} color="#ef4444" /> Likes
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                          {(inspectingPost.likeCount || 0).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <MessageSquare size={12} /> Comments
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {(inspectingPost.commentCount || 0).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <Share2 size={12} /> Shares
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {(inspectingPost.shareCount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: HYPERLOCAL GEOTAG & RADAR */}
              {inspectTab === 'geotag' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Landmark & Coordinates Hero Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(255, 69, 0, 0.2)',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Compass size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800 }}>
                            {inspectingPost.location.placeName || 'Chennai Hub'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                            {inspectingPost.location.neighborhood || 'Chennai Zone'}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://maps.google.com/?q=${inspectingPost.location.lat},${inspectingPost.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          color: '#ffffff',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Latitude</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {inspectingPost.location.lat?.toFixed(5) || '13.08270'}° N
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Longitude</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {inspectingPost.location.lng?.toFixed(5) || '80.27070'}° E
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Coverage Perimeter</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                          {((inspectingPost.location.radiusMeters || 4000) / 1000).toFixed(1)} km radius
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Geotag Radar Details & Provenance */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="var(--brand-primary)" />
                        <span>Hyperlocal Perimeter Radius</span>
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        This report is geo-anchored to <strong>{inspectingPost.location.placeName}</strong> with a distribution radius of <strong>{((inspectingPost.location.radiusMeters || 4000) / 1000).toFixed(1)} km</strong>. Citizens in this perimeter receive urgent push notifications and primary feed prioritization.
                      </p>
                    </div>

                    <div
                      style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0369a1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={15} color="#0284c7" />
                        <span>Bureau Provenance & Citation</span>
                      </h4>
                      <p style={{ fontSize: '12px', color: '#075985', lineHeight: 1.5, margin: 0 }}>
                        <strong>Source:</strong> {inspectingPost.sourceCitation || 'Direct citizen eyewitness dispatch verified by Bureau Desk'}.
                      </p>
                      <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '6px', fontWeight: 600 }}>
                        ✓ Authenticated within Chennai & Tiruvallur administrative limits.
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: ECONOMICS & MONETIZATION */}
              {inspectTab === 'economics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Economics Highlights Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    
                    {/* Price Award */}
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '14px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={14} color="#16a34a" /> Instant Price Award
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                        {formatINR(inspectingPost.priceAward || inspectingPost.adminPayoutAmount || 0)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#166534', marginTop: '2px' }}>
                        {inspectingPost.adminReviewStatus === 'verified_approved' || inspectingPost.adminReviewStatus === 'bounty_awarded'
                          ? 'Credited to Creator Wallet'
                          : 'Allocated upon Admin Approval'}
                      </div>
                    </div>

                    {/* RPM Rate */}
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1.5px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '14px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} color="#2563eb" /> Allocated RPM
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>
                        ₹{inspectingPost.rpmRate || 350} <span style={{ fontSize: '11px', fontWeight: 600 }}>/ 1k views</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '2px' }}>
                        Qualified Organic View Monetization
                      </div>
                    </div>

                    {/* Total Disbursed */}
                    <div
                      style={{
                        background: '#faf5ff',
                        border: '1.5px solid #e9d5ff',
                        borderRadius: '12px',
                        padding: '14px'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={14} color="#9333ea" /> Total Disbursed
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>
                        {formatINR((inspectingPost.adminPayoutAmount || 0) + (inspectingPost.adminBountyAwarded || 0))}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b21a8', marginTop: '2px' }}>
                        Direct UPI Treasury Rails
                      </div>
                    </div>

                  </div>

                  {/* Revenue Projection Table */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                      Audience Revenue Projections (Based on ₹{inspectingPost.rpmRate || 350} RPM)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {[
                        { views: '1,000', rev: ((inspectingPost.rpmRate || 350) * 1) },
                        { views: '10,000', rev: ((inspectingPost.rpmRate || 350) * 10) },
                        { views: '50,000', rev: ((inspectingPost.rpmRate || 350) * 50) },
                        { views: '100,000', rev: ((inspectingPost.rpmRate || 350) * 100) }
                      ].map((tier) => (
                        <div
                          key={tier.views}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '10px',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tier.views} Views</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '2px' }}>
                            {formatINR(tier.rev)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editorial Audit Details */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div><strong>Review Desk:</strong> {inspectingPost.adminReviewerDesk || 'Chennai & Tiruvallur Admin Bureau'}</div>
                    <div><strong>Status:</strong> {inspectingPost.adminReviewStatus}</div>
                    {inspectingPost.adminDisbursedDate && (
                      <div><strong>Disbursement Date:</strong> {new Date(inspectingPost.adminDisbursedDate).toLocaleString()}</div>
                    )}
                    {inspectingPost.rejectionReason && (
                      <div style={{ color: '#b91c1c' }}><strong>Rejection Reason:</strong> {inspectingPost.rejectionReason}</div>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInspectingPost(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: 'var(--text-secondary)',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Close Inspection
                </button>

                {canDeletePosts && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectingPost;
                      setDeletingPost(target);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#fff1f2',
                      color: '#e11d48',
                      border: '1px solid #fecdd3',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                    title="Permanently delete this video dispatch and feed"
                  >
                    <Trash2 size={15} />
                    <span>Delete Video / Feed</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {inspectingPost.adminReviewStatus === 'pending_review' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingPost;
                        setInspectingPost(null);
                        setRejectingPost(target);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecdd3',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle size={15} />
                      <span>Reject Submission</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingPost;
                        setInspectingPost(null);
                        openAcceptModal(target, true);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fecdd3',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Award size={15} />
                      <span>Mark Breaking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingPost;
                        setInspectingPost(null);
                        openAcceptModal(target, false);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Check size={16} />
                      <span>Calibrate & Approve (Step 2)</span>
                    </button>
                  </>
                ) : inspectingPost.adminReviewStatus === 'verified_approved' || inspectingPost.adminReviewStatus === 'bounty_awarded' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingPost;
                        setInspectingPost(null);
                        setPayoutTargetPost(target);
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        color: 'var(--text-primary)',
                        border: '1px solid #cbd5e1',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <CreditCard size={15} />
                      <span>Disburse Extra Grant</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = inspectingPost;
                        setInspectingPost(null);
                        openAcceptModal(target, false);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      <Sliders size={15} />
                      <span>Re-Calibrate Geotag & RPM</span>
                    </button>
                  </>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Action / Deletion Feedback Toast */}
      {deleteNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{deleteNotice}</span>
        </div>
      )}
    </div>
  );
};
