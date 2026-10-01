import React, { useState, useEffect, useMemo } from 'react';
import { BottomNav, MainBottomNav } from './components/layout/BottomNav';
import { OlxBottomNav, OlxTabType } from './components/layout/OlxBottomNav';
import { JobsBottomNav, JobsTabType } from './components/layout/JobsBottomNav';
import { RealEstateBottomNav, RealEstateTabType } from './components/layout/RealEstateBottomNav';
import { ContextualBottomNav, AppModule } from './components/layout/ContextualBottomNav';
import { Header } from './components/layout/Header';
import { BreakingBanner } from './components/feed/BreakingBanner';
import { CategoryFilter } from './components/feed/CategoryFilter';
import { NewsCard } from './components/feed/NewsCard';
import { SpotsPlayer } from './components/spots/SpotsPlayer';
import { SearchScreen } from './components/search/SearchScreen';
import { MonetizationScreen } from './components/monetization/MonetizationScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { CreateModal } from './components/create/CreateModal';
import { CommentsDrawer } from './components/spots/CommentsDrawer';
import { AdminPage } from './components/admin/AdminPage';
import { AuthPage } from './components/auth/AuthPage';
import { ProfileOnboarding } from './components/auth/ProfileOnboarding';
import { AdminAuth } from './components/admin/AdminAuth';
import { FeedAdCard } from './components/feed/FeedAdCard';
import { CopyrightReportModal } from './components/copyright/CopyrightReportModal';
import { NotificationModal } from './components/notifications/NotificationModal';
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, MainNavSection } from './components/layout/Sidebar';
import { MarketplaceTabs, MarketplaceNavTab } from './components/marketplace/MarketplaceTabs';
import { MarketplaceHomeScreen } from './components/marketplace/MarketplaceHomeScreen';
import { OlxProfileScreen } from './components/marketplace/OlxProfileScreen';
import { OlxExploreScreen } from './components/marketplace/OlxExploreScreen';
import { OlxAlertsScreen } from './components/marketplace/OlxAlertsScreen';
import { ProductDetailsPanel } from './components/marketplace/ProductDetailsPanel';
import { PropertyDetailsPanel } from './components/marketplace/PropertyDetailsPanel';
import { PostAdModal } from './components/marketplace/PostAdModal';
import { MyAdsModal } from './components/marketplace/MyAdsModal';
import { JobsMarketplace } from './components/marketplace/JobsMarketplace';
import { JobsProfileScreen } from './components/marketplace/JobsProfileScreen';
import { JobsApplicationsScreen } from './components/marketplace/JobsApplicationsScreen';
import { JobsSearchScreen } from './components/marketplace/JobsSearchScreen';
import { PostJobModal } from './components/marketplace/PostJobModal';
import { RealEstateMarketplace } from './components/marketplace/RealEstateMarketplace';
import { RealEstateProfileScreen } from './components/marketplace/RealEstateProfileScreen';
import { RealEstateExploreScreen } from './components/marketplace/RealEstateExploreScreen';
import { RealEstateSavedScreen } from './components/marketplace/RealEstateSavedScreen';
import { PostPropertyModal } from './components/marketplace/PostPropertyModal';
import { SavedItemsModal } from './components/marketplace/SavedItemsModal';
import { SellerProfileModal } from './components/marketplace/SellerProfileModal';
import './components/marketplace/marketplace.css';
import {
  getStoredProducts,
  fetchProductsFromSupabase,
  fetchPropertiesFromSupabase,
  getStoredJobs,
  getStoredProperties,
  toggleStoredProductFavorite,
  toggleStoredPropertySaved
} from './services/marketplaceService';
import type { MarketplaceProduct, ProductSeller, MarketplaceProperty } from './types/marketplace';
import { Newspaper, Plus, Compass, ShieldCheck, WifiOff, ArrowLeft } from 'lucide-react';
import type {
  VideoPost,
  User,
  Wallet,
  Transaction,
  LocationCoordinates,
  NewsCategory,
  TabType,
  Advertisement
} from './types';
import {
  getStoredPosts,
  savePosts,
  getStoredUser,
  saveUser,
  getStoredWallet,
  getStoredTransactions,
  getStoredComments,
  addComment,
  toggleLikePost,
  toggleSavePost,
  requestPayout,
  sendTip,
  getActiveLocation,
  saveActiveLocation,
  approveAdminPayout,
  getStoredAds,
  saveStoredAds,
  trackStoredAdImpression,
  trackStoredAdClick,
  getStoredNotifications
} from './services/storageService';
import { calculateDistanceKm, isLocationMatch } from './services/geoService';
import { apiClient } from './services/apiClient';

export const AppContent: React.FC = () => {
  const { user: authUser, isAuthenticated, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('spots');
  const [posts, setPosts] = useState<VideoPost[]>(getStoredPosts());
  const [ads, setAds] = useState<Advertisement[]>(getStoredAds());
  const [user, setUser] = useState<User>(() => authUser || getStoredUser());
  const [wallet, setWallet] = useState<Wallet>(getStoredWallet());
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions());
  const [activeLocation, setActiveLocation] = useState<LocationCoordinates>(getActiveLocation());

  // Sync authenticated user into app user state
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      saveUser(authUser);
    }
  }, [authUser]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'following'>('all');

  // Modals & Navigation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedSpotPostId, setSelectedSpotPostId] = useState<string | undefined>(undefined);
  const [commentsDrawerPost, setCommentsDrawerPost] = useState<VideoPost | null>(null);
  const [reportCopyrightPost, setReportCopyrightPost] = useState<VideoPost | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Navigation History Tracking for seamless natural Back button flow inside mobile app shell
  const [previousTab, setPreviousTab] = useState<TabType>('spots');
  const [previousView, setPreviousView] = useState<'spots' | 'feed' | 'monetization' | 'profile' | 'olx' | 'jobs' | 'real_estate'>('spots');
  const [activeView, setActiveView] = useState<'spots' | 'feed' | 'monetization' | 'profile' | 'olx' | 'jobs' | 'real_estate'>('spots');
  // Module Navigation: 'main' | 'olx' | 'jobs' | 'realEstate'
  const [activeModule, setActiveModule] = useState<AppModule>('main');
  const [olxTab, setOlxTab] = useState<OlxTabType>('home');
  const [jobsTab, setJobsTab] = useState<JobsTabType>('jobsHome');
  const [realEstateTab, setRealEstateTab] = useState<RealEstateTabType>('home');
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showPostPropertyModal, setShowPostPropertyModal] = useState(false);
  const [navSection, setNavSection] = useState<MainNavSection>('home');
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(() => getStoredProducts());
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<MarketplaceProperty | null>(null);
  const [showPostAdModal, setShowPostAdModal] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<ProductSeller | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const currentMarketplaceTab: MarketplaceNavTab = useMemo(() => {
    if (activeView === 'jobs' || navSection === 'jobs') return 'jobs';
    if (activeView === 'real_estate' || navSection === 'real_estate') return 'real_estate';
    return 'olx';
  }, [activeView, navSection]);

  const handleSidebarSelect = (section: MainNavSection) => {
    if (activeView === 'spots' || activeView === 'feed' || activeView === 'profile' || activeView === 'monetization') {
      setPreviousView(activeView);
      setPreviousTab(activeTab);
    }
    if (section === 'saved') {
      setShowSavedModal(true);
      setIsSidebarOpenMobile(false);
      return;
    }
    if (section === 'home') {
      setActiveModule('main');
      setActiveView('spots');
      setActiveTab('spots');
      setNavSection('home');
      setSelectedProperty(null);
    } else if (section === 'news_feed') {
      setActiveModule('main');
      setActiveView('feed');
      setActiveTab('home');
      setNavSection('news_feed');
      setSelectedProperty(null);
    } else if (section === 'profile') {
      setActiveModule('main');
      setActiveView('profile');
      setActiveTab('profile');
      setNavSection('profile');
      setSelectedProperty(null);
    } else if (section === 'olx' || section === 'services' || section === 'vehicles' || section === 'local_businesses') {
      setSelectedProduct(null);
      setSelectedProperty(null);
      setActiveModule('olx');
      setOlxTab('home');
      setActiveView('olx');
      setNavSection(section);
    } else if (section === 'jobs') {
      setSelectedProduct(null);
      setSelectedProperty(null);
      setActiveModule('jobs');
      setJobsTab('jobsHome');
      setActiveView('jobs');
      setNavSection('jobs');
    } else if (section === 'real_estate') {
      setSelectedProduct(null);
      setSelectedProperty(null);
      setActiveModule('realEstate');
      setRealEstateTab('home');
      setActiveView('real_estate');
      setNavSection('real_estate');
    } else if (section === 'events') {
      setActiveModule('main');
      setActiveView('feed');
      setActiveTab('home');
      setCategoryFilter('all');
      setSelectedProperty(null);
    }
    setIsSidebarOpenMobile(false);
  };

  const handleToggleProductFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleStoredProductFavorite(id);
    const updated = getStoredProducts();
    setMarketplaceProducts(updated);
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(updated.find((p) => p.id === id) || null);
    }
  };

  const handleTogglePropertySaved = (id: string) => {
    toggleStoredPropertySaved(id);
    if (selectedProperty && selectedProperty.id === id) {
      const updatedList = getStoredProperties();
      setSelectedProperty(updatedList.find((p) => p.id === id) || null);
    }
  };

  const handleAdPublished = (newProd: MarketplaceProduct) => {
    const updated = getStoredProducts();
    setMarketplaceProducts(updated);
    setSelectedProduct(newProd);
    setActiveModule('olx');
    setOlxTab('profile');
  };

  // Dedicated URL Routing (supports / and /admin)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const refreshAppData = async () => {
    try {
      const serverPosts = await apiClient.getPosts();
      if (Array.isArray(serverPosts)) {
        setPosts(serverPosts);
        savePosts(serverPosts);
      } else {
        setPosts(getStoredPosts());
      }
    } catch {
      setPosts(getStoredPosts());
    }

    try {
      const serverAds = await apiClient.getAds();
      if (serverAds && serverAds.length > 0) {
        setAds(serverAds);
        saveStoredAds(serverAds);
      } else {
        setAds(getStoredAds());
      }
    } catch {
      setAds(getStoredAds());
    }

    setWallet(getStoredWallet());
    setTransactions(getStoredTransactions());
    setUser(getStoredUser());
    refreshNotificationsCount();
  };

  const refreshNotificationsCount = async () => {
    try {
      const notifs = await apiClient.getNotifications(user.id);
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadNotificationsCount(unread);
    } catch {
      const localNotifs = getStoredNotifications();
      const userNotifs = localNotifs.filter((n) => n.userId === user.id);
      const unread = userNotifs.filter((n) => !n.read).length;
      setUnreadNotificationsCount(unread);
    }
  };

  // Fetch real posts from Supabase PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    refreshNotificationsCount();
    async function loadServerPosts() {
      try {
        const serverPosts = await apiClient.getPosts();
        if (isMounted && serverPosts && serverPosts.length > 0) {
          setPosts(serverPosts);
          savePosts(serverPosts);
        }
      } catch (err) {
        console.warn('[App] Could not fetch server posts, using local cache:', err);
      }
    }

    async function loadServerAds() {
      try {
        const serverAds = await apiClient.getAds();
        if (isMounted && serverAds && serverAds.length > 0) {
          setAds(serverAds);
          saveStoredAds(serverAds);
        }
      } catch (err) {
        console.warn('[App] Could not fetch server ads, using local cache:', err);
      }
    }

    async function loadServerMarketplace() {
      try {
        const serverProducts = await fetchProductsFromSupabase();
        if (isMounted && serverProducts && serverProducts.length > 0) {
          setMarketplaceProducts(serverProducts);
        }
        await fetchPropertiesFromSupabase();
      } catch (err) {
        console.warn('[App] Could not fetch marketplace from Supabase:', err);
      }
    }

    loadServerPosts();
    loadServerAds();
    loadServerMarketplace();
    return () => { isMounted = false; };
  }, []);

  // Monitor network online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Recalculate distances relative to active location
  const postsWithDistance = useMemo(() => {
    return posts.map((post) => {
      const dist = calculateDistanceKm(
        activeLocation.lat,
        activeLocation.lng,
        post.location.lat,
        post.location.lng
      );
      return { ...post, distanceKm: dist };
    });
  }, [posts, activeLocation]);

  // A post is public ONLY after the Bureau Editorial Desk approves it
  const isPostPublic = (post: VideoPost): boolean => {
    if (post.status === 'copyright_takedown') {
      return false;
    }
    if (post.adminReviewStatus) {
      return post.adminReviewStatus === 'verified_approved' || post.adminReviewStatus === 'bounty_awarded';
    }
    return post.status === 'published';
  };

  // Public approved posts for distribution
  const publicPostsWithDistance = useMemo(() => {
    return postsWithDistance.filter(isPostPublic);
  }, [postsWithDistance]);

  // Filtered posts for Home Feed (all approved posts, filtered by category)
  const feedPosts = useMemo(() => {
    return publicPostsWithDistance.filter((post) => {
      // Category filter
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'following') {
        return false;
      }
      return post.category === categoryFilter;
    });
  }, [publicPostsWithDistance, categoryFilter]);

  // Active, scheduled, location-targeted advertisements
  const eligibleAds = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return ads.filter((ad) => {
      if (ad.status !== 'active') return false;
      if (ad.reachLimit && ad.reachLimit > 0 && (ad.impressions || 0) >= ad.reachLimit) return false;
      if (ad.startDate && ad.startDate > todayStr) return false;
      if (ad.endDate && ad.endDate < todayStr) return false;

      // Location targeting
      if (ad.targetLocation.district && ad.targetLocation.district !== 'All') {
        const adDist = ad.targetLocation.district.toLowerCase();
        const userDist = (activeLocation.district || '').toLowerCase();
        const userPlace = (activeLocation.placeName || '').toLowerCase();
        if (!userDist.includes(adDist) && !userPlace.includes(adDist)) {
          return false;
        }
      }
      return true;
    });
  }, [ads, activeLocation]);

  // Interleaved Feed Items: News 1 -> News 2 -> News 3 -> AD -> News 4 -> News 5 -> AD
  type FeedItem =
    | { type: 'post'; data: VideoPost }
    | { type: 'ad'; data: Advertisement };

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];
    if (feedPosts.length === 0) return items;
    if (eligibleAds.length === 0) {
      return feedPosts.map((p) => ({ type: 'post', data: p }));
    }

    let adCursor = 0;
    feedPosts.forEach((post, index) => {
      items.push({ type: 'post', data: post });
      const newsNumber = index + 1;

      // Check if an advertisement targets this position slot
      const matchingAd = eligibleAds.find((ad) => {
        if (ad.position === `after_${newsNumber}`) return true;
        if (ad.position === 'interval_3' && newsNumber % 3 === 0) return true;
        if (ad.position === 'interval_5' && newsNumber % 5 === 0) return true;
        return false;
      });

      if (matchingAd) {
        items.push({ type: 'ad', data: matchingAd });
      } else if (newsNumber === 3 && eligibleAds.length > 0) {
        const ad = eligibleAds[adCursor % eligibleAds.length];
        items.push({ type: 'ad', data: ad });
        adCursor++;
      } else if (newsNumber === 5 && eligibleAds.length > 1) {
        const ad = eligibleAds[adCursor % eligibleAds.length];
        items.push({ type: 'ad', data: ad });
        adCursor++;
      }
    });

    return items;
  }, [feedPosts, eligibleAds]);

  // Spots dispatches: Spotlight Rule: ONLY video/reel posts, STRICTLY filtered by user's current location
  const spotsPosts = useMemo(() => {
    return publicPostsWithDistance.filter((p) => {
      // 1. Show ONLY reel or video posts (strictly no images, no text fallback)
      if (p.type !== 'video') return false;

      // 2. Filtered strictly by user's current location
      return isLocationMatch(p.location, activeLocation, p.distanceKm);
    });
  }, [publicPostsWithDistance, activeLocation]);

  // Urgent breaking post (public approved)
  const breakingPost = useMemo(() => {
    return publicPostsWithDistance.find((p) => p.isBreaking);
  }, [publicPostsWithDistance]);

  // Actions
  const handleLike = (postId: string) => {
    const updated = toggleLikePost(postId);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
    }
  };

  const handleSave = (postId: string) => {
    const updated = toggleSavePost(postId);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
    }
  };

  const handleShare = async (post: VideoPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.headline,
          text: `LocalPlus: ${post.headline} (${post.location.placeName})`,
          url: window.location.href
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  const handleAddComment = (postId: string, text: string) => {
    addComment(postId, text, user);
    setPosts(getStoredPosts());
  };

  const handleOpenPostInSpots = (post: VideoPost) => {
    if (post.type === 'video') {
      if (!isLocationMatch(post.location, activeLocation, post.distanceKm)) {
        setActiveLocation(post.location);
        saveActiveLocation(post.location);
      }
      setSelectedSpotPostId(post.id);
      setActiveTab('spots');
    }
  };

  const handleSelectLocation = (loc: LocationCoordinates) => {
    setActiveLocation(loc);
    saveActiveLocation(loc);
  };

  const handlePublishPost = (newPost: VideoPost) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    savePosts(updatedPosts);

    // If the post is submitted for citizen editorial review, keep modal context
    // and do not switch directly to Spots player where unapproved videos are hidden
    if (newPost.status === 'in_review' || newPost.adminReviewStatus === 'pending_review') {
      return;
    }

    if (newPost.type === 'video') {
      setSelectedSpotPostId(newPost.id);
      setActiveTab('spots');
    } else {
      setActiveTab('home');
    }
  };

  const handleRequestPayout = (amt: number, method: string) => {
    const result = requestPayout(amt, method);
    if (result.success) {
      setWallet(getStoredWallet());
      setTransactions(getStoredTransactions());
    }
    return result;
  };

  const handleSendTip = (postId: string, amt: number, creatorName: string) => {
    sendTip(postId, amt, creatorName);
    setTransactions(getStoredTransactions());
  };

  const handleAdminApprovePayout = (postId: string, payoutAmt: number, bountyAmt: number) => {
    approveAdminPayout(postId, payoutAmt, bountyAmt);
    setPosts(getStoredPosts());
    setWallet(getStoredWallet());
    setTransactions(getStoredTransactions());
  };

  const handleUpdateUser = (updated: User) => {
    setUser(updated);
    saveUser(updated);
  };

  // Loading state while verifying token with Supabase
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 60%, #020617 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4500 0%, #f59e0b 100%)',
            boxShadow: '0 0 30px #ff4500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffffff' }} />
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>LocalPlus</div>
        <div style={{ fontSize: '12px', color: '#fb923c', fontWeight: 700, marginTop: '2px', letterSpacing: '0.04em' }}>Connect • Buy • Sell • Grow</div>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '6px' }}>
          Verifying secure session (Supabase & Cloudflare R2)...
        </div>
      </div>
    );
  }

  // Mandatory Authentication: Must Login before using the application
  if (!isAuthenticated) {
    if (currentPath === '/admin' || currentPath === '/admin/login') {
      return (
        <AdminAuth
          onLoginSuccess={() => navigateTo('/admin')}
          onReturnHome={() => navigateTo('/')}
        />
      );
    }
    return (
      <AuthPage
        onSuccess={() => navigateTo('/')}
        onAdminSuccess={() => navigateTo('/admin')}
        onNewUser={() => navigateTo('/')}
      />
    );
  }

  // Dedicated Separate /admin Route with Authentication
  if (currentPath === '/admin' || currentPath === '/admin/login') {
    return (
      <AdminPage
        posts={posts}
        onRefreshData={refreshAppData}
        onNavigateHome={() => navigateTo('/')}
      />
    );
  }

  // New User Onboarding: Must complete profile before accessing main app
  if (!isAdmin && (authUser?.onboardingCompleted === false || user.onboardingCompleted === false)) {
    return (
      <ProfileOnboarding
        initialUser={authUser || user}
        onComplete={(completedUser) => {
          setUser(completedUser);
          saveUser(completedUser);
          navigateTo('/');
        }}
      />
    );
  }

  // Shared Modals and Overlays
  const renderGlobalModals = () => (
    <>
      {/* 1. Post Ad Multi-Step Modal */}
      <PostAdModal
        isOpen={showPostAdModal}
        initialType={activeModule === 'olx' ? 'sell_something' : undefined}
        onClose={() => setShowPostAdModal(false)}
        onAdPublished={(newProd) => {
          handleAdPublished(newProd);
          setShowMyAdsModal(true);
        }}
        currentUserDefaultLocation={activeLocation.neighborhood || activeLocation.placeName || 'Avadi / Ambattur, Chennai'}
      />

      {/* 2. My Ads Modal */}
      <MyAdsModal
        isOpen={showMyAdsModal}
        onClose={() => setShowMyAdsModal(false)}
        products={marketplaceProducts}
        onRefreshProducts={() => setMarketplaceProducts(getStoredProducts())}
        onViewProduct={(p) => {
          setSelectedProduct(p);
          setActiveView('olx');
        }}
      />

      {/* 3. Saved Items Modal */}
      <SavedItemsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedProducts={marketplaceProducts.filter((p) => p.isFavorite)}
        savedJobs={getStoredJobs().filter((j) => j.isSaved)}
        savedProperties={getStoredProperties().filter((prop) => prop.isSaved)}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setActiveView('olx');
        }}
        onSelectProperty={(prop) => {
          setSelectedProperty(prop);
          setActiveModule('realEstate');
        }}
        onRemoveSavedProduct={(id) => handleToggleProductFavorite(id)}
      />

      {/* 3b. Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onJobPublished={() => {
          setJobsTab('jobsHome');
        }}
      />

      {/* 3c. Post Property Modal */}
      <PostPropertyModal
        isOpen={showPostPropertyModal}
        onClose={() => setShowPostPropertyModal(false)}
        onPropertyPublished={(newProp) => {
          setSelectedProperty(newProp);
          setActiveModule('realEstate');
          setRealEstateTab('home');
        }}
      />

      {/* 4. Seller Profile Modal */}
      {selectedSeller && (
        <SellerProfileModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          sellerProducts={marketplaceProducts.filter((p) => p.seller.id === selectedSeller.id)}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setActiveView('olx');
          }}
        />
      )}

      {/* 5. Search & Interactive Hyperlocal Map Modal */}
      {showSearchModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'var(--bg-app)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <SearchScreen
            posts={postsWithDistance}
            userLocation={activeLocation}
            onOpenPost={(post) => {
              setShowSearchModal(false);
              handleOpenPostInSpots(post);
            }}
            onClose={() => setShowSearchModal(false)}
          />
        </div>
      )}

      {/* 6. Create / Upload Report Modal */}
      {showCreateModal && (
        <CreateModal
          currentUser={user}
          activeLocation={activeLocation}
          onClose={() => setShowCreateModal(false)}
          onPublishPost={handlePublishPost}
        />
      )}

      {/* 7. Global Comments Drawer */}
      {commentsDrawerPost && (
        <CommentsDrawer
          comments={getStoredComments(commentsDrawerPost.id)}
          currentUser={user}
          onClose={() => setCommentsDrawerPost(null)}
          onAddComment={(text) => handleAddComment(commentsDrawerPost.id, text)}
        />
      )}

      {/* 8. DMCA Copyright Infringement Report Modal */}
      {reportCopyrightPost && (
        <CopyrightReportModal
          post={reportCopyrightPost}
          currentUser={user}
          onClose={() => setReportCopyrightPost(null)}
          onSuccess={() => {
            setReportCopyrightPost(null);
            refreshAppData();
          }}
        />
      )}

      {/* 9. User Notifications Drawer */}
      {showNotificationModal && (
        <NotificationModal
          userId={user.id}
          onClose={() => {
            setShowNotificationModal(false);
            refreshAppData();
          }}
        />
      )}

      {/* 10. Global Hyperlocal Hub / Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        activeLocation={activeLocation}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );

  // SINGLE PERSISTENT LOCALPLUS APP SHELL
  return (
    <div className="app-container">
      <div className="app-device-shell">
        {/* Main Top Header with Hamburger Button */}
        <Header
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenAdmin={() => navigateTo('/admin')}
          onOpenNotifications={() => setShowNotificationModal(true)}
          onToggleMenu={() => {
            setPreviousView(activeView);
            setPreviousTab(activeTab);
            setIsSidebarOpenMobile(true);
          }}
          unreadAlertCount={unreadNotificationsCount}
        />

        {/* Offline Warning Banner */}
        {isOffline && (
          <div
            style={{
              background: '#fef2f2',
              color: 'var(--brand-alert)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1px solid #fecaca',
              zIndex: 35
            }}
          >
            <WifiOff size={13} />
            <span>Offline Mode: Browsing cached hyperlocal news stories & listings</span>
          </div>
        )}

        {/* Dynamic App Content Area: Only current page content changes inside the SAME mobile viewport */}
        <div className="app-screen-content">
          {/* SPOTS PLAYER: Reels / Vertical Short Video News */}
          {activeView === 'spots' && (
            <div style={{ height: '100%', width: '100%' }}>
              <SpotsPlayer
                posts={spotsPosts}
                initialPostId={selectedSpotPostId}
                currentUser={user}
                activeLocation={activeLocation}
                onOpenLocationPicker={() => setShowLocationModal(true)}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onAddComment={handleAddComment}
                getCommentsForPost={(id) => getStoredComments(id)}
                onSendTip={handleSendTip}
                onOpenCreate={() => setShowPostAdModal(true)}
                onReportCopyright={(p) => setReportCopyrightPost(p)}
              />
            </div>
          )}

          {/* NEWS FEED */}
          {activeView === 'feed' && (
            <div style={{ padding: '0 0 16px' }}>
              <BreakingBanner
                breakingPost={breakingPost}
                onOpenPost={handleOpenPostInSpots}
              />

              <CategoryFilter
                selectedCategory={categoryFilter}
                onSelectCategory={setCategoryFilter}
              />

              <div style={{ padding: '8px 0' }}>
                {feedPosts.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      margin: '10px 0'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: '#fff7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: 'var(--brand-primary)',
                        border: '1px solid #ffedd5'
                      }}
                    >
                      <Newspaper size={32} />
                    </div>

                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '6px'
                      }}
                    >
                      No Reports Found
                    </h3>

                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        maxWidth: '320px',
                        margin: '0 auto 20px'
                      }}
                    >
                      {categoryFilter !== 'all'
                        ? `No stories found under "${categoryFilter}".`
                        : `There are currently no citizen news dispatches available.`}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '11px 16px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      >
                        <Plus size={16} />
                        <span>File First Local Report</span>
                      </button>

                      {categoryFilter !== 'all' && (
                        <button
                          onClick={() => setCategoryFilter('all')}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                          }}
                        >
                          View All Categories
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  feedItems.map((item, idx) => {
                    if (item.type === 'ad') {
                      return (
                        <FeedAdCard
                          key={`ad_${item.data.id}_${idx}`}
                          ad={item.data}
                          onAdClick={(ad) => {
                            trackStoredAdClick(ad.id);
                            apiClient.trackAdClick(ad.id);
                          }}
                          onAdImpression={(ad) => {
                            trackStoredAdImpression(ad.id);
                            apiClient.trackAdImpression(ad.id);
                          }}
                        />
                      );
                    }
                    return (
                      <NewsCard
                        key={item.data.id}
                        post={item.data}
                        onLike={handleLike}
                        onSave={handleSave}
                        onOpenComments={(p) => setCommentsDrawerPost(p)}
                        onOpenSpots={handleOpenPostInSpots}
                        onShare={handleShare}
                        onReportCopyright={(p) => setReportCopyrightPost(p)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* CREATOR MONETIZATION */}
          {activeView === 'monetization' && (
            <div style={{ padding: '0 0 16px' }}>
              <MonetizationScreen
                user={user}
                wallet={wallet}
                transactions={transactions}
                userPosts={posts.filter((p) => p.creatorId === user.id)}
                allPosts={postsWithDistance}
                onRequestPayout={handleRequestPayout}
                onAdminApprovePayout={handleAdminApprovePayout}
              />
            </div>
          )}

          {/* PROFILE: Preserves existing UI inside the SAME app viewport */}
          {activeView === 'profile' && (
            <div>
              <ProfileScreen
                user={user}
                posts={postsWithDistance}
                onOpenPost={handleOpenPostInSpots}
                onNavigateToMonetization={() => {
                  setActiveTab('monetization');
                  setActiveView('monetization');
                }}
                onUpdateUser={handleUpdateUser}
                onOpenAdmin={() => navigateTo('/admin')}
                onToggleMenu={() => {
                  setPreviousView('profile');
                  setPreviousTab('profile');
                  setIsSidebarOpenMobile(true);
                }}
                onOpenPostAd={() => setShowPostAdModal(true)}
                onOpenProduct={(p) => {
                  setPreviousView('profile');
                  setPreviousTab('profile');
                  setSelectedProduct(p);
                  setActiveModule('olx');
                  setActiveView('olx');
                }}
                onNavigateToMarketplace={() => {
                  setPreviousView('profile');
                  setPreviousTab('profile');
                  setSelectedProduct(null);
                  setActiveModule('olx');
                  setOlxTab('home');
                  setActiveView('olx');
                }}
              />
            </div>
          )}

          {/* OLX / BUY & SELL: Renders inside the SAME app viewport */}
          {activeView === 'olx' && (
            <div>
              {olxTab === 'home' && (
                <MarketplaceHomeScreen
                  products={marketplaceProducts}
                  selectedProduct={selectedProduct}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onToggleFavorite={handleToggleProductFavorite}
                  onOpenPostAd={() => setShowPostAdModal(true)}
                  onNavigateHome={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                    setSelectedProduct(null);
                  }}
                  onOpenNotifications={() => setShowNotificationModal(true)}
                  onNavigateProfile={() => {
                    setOlxTab('profile');
                  }}
                />
              )}

              {olxTab === 'explore' && (
                <OlxExploreScreen
                  products={marketplaceProducts}
                  selectedProduct={selectedProduct}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onToggleFavorite={handleToggleProductFavorite}
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                    setSelectedProduct(null);
                  }}
                />
              )}

              {olxTab === 'alerts' && (
                <OlxAlertsScreen
                  products={marketplaceProducts}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                    setSelectedProduct(null);
                  }}
                />
              )}

              {olxTab === 'profile' && (
                <OlxProfileScreen
                  user={user}
                  products={marketplaceProducts}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onOpenPostAd={() => setShowPostAdModal(true)}
                  onRefreshProducts={() => setMarketplaceProducts(getStoredProducts())}
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                    setSelectedProduct(null);
                  }}
                  onOpenSettings={() => {
                    setActiveModule('main');
                    setActiveView('profile');
                    setActiveTab('profile');
                  }}
                  onOpenSavedItems={() => setShowSavedModal(true)}
                />
              )}
            </div>
          )}

          {/* JOBS: Renders inside the SAME app viewport */}
          {activeView === 'jobs' && (
            <div>
              {jobsTab === 'jobsHome' && (
                <div>
                  <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setActiveModule('main');
                        setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                        setActiveTab(previousTab || 'spots');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: 'var(--lp-slate-body)',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  </div>
                  <JobsMarketplace
                    currentLocationName={activeLocation.neighborhood || activeLocation.placeName || 'Chennai'}
                  />
                </div>
              )}

              {jobsTab === 'search' && (
                <JobsSearchScreen
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                />
              )}

              {jobsTab === 'applications' && (
                <JobsApplicationsScreen
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                />
              )}

              {jobsTab === 'profile' && (
                <JobsProfileScreen
                  user={user}
                  onOpenPostJob={() => setShowPostJobModal(true)}
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                />
              )}
            </div>
          )}

          {/* REAL ESTATE: Renders inside the SAME app viewport */}
          {activeView === 'real_estate' && (
            <div>
              {realEstateTab === 'home' && (
                <div>
                  <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setActiveModule('main');
                        setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                        setActiveTab(previousTab || 'spots');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: 'var(--lp-slate-body)',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  </div>
                  <RealEstateMarketplace
                    currentLocationName={activeLocation.neighborhood || activeLocation.placeName || 'Chennai'}
                    onSelectProperty={(prop) => setSelectedProperty(prop)}
                    onToggleSave={handleTogglePropertySaved}
                  />
                </div>
              )}

              {realEstateTab === 'explore' && (
                <RealEstateExploreScreen
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                />
              )}

              {realEstateTab === 'saved' && (
                <RealEstateSavedScreen
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                />
              )}

              {realEstateTab === 'profile' && (
                <RealEstateProfileScreen
                  user={user}
                  onOpenPostProperty={() => setShowPostPropertyModal(true)}
                  onBackToMain={() => {
                    setActiveModule('main');
                    setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                    setActiveTab(previousTab || 'spots');
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Contextual Bottom Navigation across all 4 modules: Main, OLX, Jobs, Real Estate */}
        <ContextualBottomNav
          activeModule={activeModule}
          mainTab={activeTab}
          onChangeMainTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'spots') setActiveView('spots');
            else if (tab === 'home') setActiveView('feed');
            else if (tab === 'monetization') setActiveView('monetization');
            else if (tab === 'profile') setActiveView('profile');
            setSelectedProduct(null);
            setSelectedProperty(null);
          }}
          onOpenMainCreate={() => setShowCreateModal(true)}
          olxTab={olxTab}
          onChangeOlxTab={(tab) => {
            setOlxTab(tab);
            setSelectedProduct(null);
            setSelectedProperty(null);
          }}
          onOpenOlxPostAd={() => setShowPostAdModal(true)}
          olxUnreadAlertsCount={2}
          jobsTab={jobsTab}
          onChangeJobsTab={(tab) => {
            setJobsTab(tab);
            setSelectedProduct(null);
            setSelectedProperty(null);
          }}
          onOpenJobsPostJob={() => setShowPostJobModal(true)}
          jobsApplicationsCount={3}
          realEstateTab={realEstateTab}
          onChangeRealEstateTab={(tab) => {
            setRealEstateTab(tab);
            setSelectedProduct(null);
            setSelectedProperty(null);
          }}
          onOpenRealEstatePostProperty={() => setShowPostPropertyModal(true)}
          realEstateSavedCount={getStoredProperties().filter((p) => p.isSaved).length}
        />

        {/* Product Details Panel overlay INSIDE the app-device-shell if selectedProduct */}
        {selectedProduct && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 60,
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <ProductDetailsPanel
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onToggleFavorite={(id) => handleToggleProductFavorite(id)}
              onViewSellerProfile={(seller) => setSelectedSeller(seller)}
            />
          </div>
        )}

        {/* Property Details Panel overlay INSIDE the app-device-shell if selectedProperty */}
        {selectedProperty && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 60,
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <PropertyDetailsPanel
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onToggleSave={handleTogglePropertySaved}
              isSaved={selectedProperty.isSaved}
            />
          </div>
        )}

        {/* Mobile Navigation Drawer INSIDE the App Device Shell */}
        <Sidebar
          activeSection={
            activeView === 'spots'
              ? 'home'
              : activeView === 'feed'
              ? 'news_feed'
              : activeView === 'profile'
              ? 'profile'
              : activeView === 'jobs'
              ? 'jobs'
              : activeView === 'real_estate'
              ? 'real_estate'
              : 'olx'
          }
          onSelectSection={handleSidebarSelect}
          isOpen={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />
      </div>

      {renderGlobalModals()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
