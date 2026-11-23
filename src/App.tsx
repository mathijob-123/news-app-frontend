import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { MarketplaceLandingPage } from './components/marketplace/MarketplaceLandingPage';
import { ShareModal } from './components/common/ShareModal';
import { Share } from '@capacitor/share';
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
import { Newspaper, Plus, Compass, ShieldCheck, WifiOff, ArrowLeft, Bookmark } from 'lucide-react';
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
import {
  generateSmartVideoFeed,
  getEffectiveUserId,
  getLocalWatchedSet,
  recordVideoWatch,
  syncRemoteWatchHistory
} from './services/smartVideoFeedService';

export const AppContent: React.FC = () => {
  const { user: authUser, isAuthenticated, isAdmin, loading } = useAuth();

  const getInitialNav = () => {
    let deepPostId: string | undefined = undefined;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      deepPostId = sp.get('post') || sp.get('spot') || sp.get('video') || undefined;
    }
    if (deepPostId) {
      return { view: 'spots' as const, tab: 'spots' as TabType, module: 'main' as AppModule, deepPostId };
    }
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path === '/marketplace') {
      return { view: 'marketplace' as const, tab: 'marketplace' as TabType, module: 'main' as AppModule, deepPostId: undefined };
    }
    if (path === '/olx' || path === '/marketplace/olx') {
      return { view: 'olx' as const, tab: 'marketplace' as TabType, module: 'olx' as AppModule, deepPostId: undefined };
    }
    if (path === '/jobs' || path === '/marketplace/jobs') {
      return { view: 'jobs' as const, tab: 'marketplace' as TabType, module: 'jobs' as AppModule, deepPostId: undefined };
    }
    if (path === '/real-estate' || path === '/marketplace/real-estate') {
      return { view: 'real_estate' as const, tab: 'marketplace' as TabType, module: 'realEstate' as AppModule, deepPostId: undefined };
    }
    if (path === '/points') {
      return { view: 'monetization' as const, tab: 'spots' as TabType, module: 'main' as AppModule, deepPostId: undefined };
    }
    if (path === '/profile') {
      return { view: 'profile' as const, tab: 'profile' as TabType, module: 'main' as AppModule, deepPostId: undefined };
    }
    return { view: 'spots' as const, tab: 'spots' as TabType, module: 'main' as AppModule, deepPostId: undefined };
  };

  const initialNav = useMemo(() => getInitialNav(), []);
  const [activeTab, setActiveTab] = useState<TabType>(initialNav.tab);
  const [selectedSpotPostId, setSelectedSpotPostId] = useState<string | undefined>(initialNav.deepPostId);
  const [posts, setPosts] = useState<VideoPost[]>(getStoredPosts());
  const [ads, setAds] = useState<Advertisement[]>(getStoredAds());
  const [user, setUser] = useState<User>(() => authUser || getStoredUser());
  const [wallet, setWallet] = useState<Wallet>(getStoredWallet());
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions());
  const [activeLocation, setActiveLocation] = useState<LocationCoordinates>(getActiveLocation());

  // SMART RANDOM VIDEO FEED: Persistent User / Guest Device ID, Watch History & Session Shuffling
  const effectiveUserId = useMemo(() => {
    return getEffectiveUserId(user);
  }, [user?.id]);

  const [watchedPostIds, setWatchedPostIds] = useState<Set<string>>(() => {
    return getLocalWatchedSet(getEffectiveUserId(user));
  });

  const [feedSessionKey, setFeedSessionKey] = useState<number>(() => Date.now());

  // Background sync of watch history from Supabase / cloud
  useEffect(() => {
    syncRemoteWatchHistory(effectiveUserId).then((cloudSet) => {
      setWatchedPostIds(new Set(cloudSet));
    }).catch(() => {});
  }, [effectiveUserId]);

  const handleVideoWatched = useCallback((postId: string) => {
    recordVideoWatch(effectiveUserId, postId);
    setWatchedPostIds((prev) => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
  }, [effectiveUserId]);

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
  const [commentsDrawerPost, setCommentsDrawerPost] = useState<VideoPost | null>(null);
  const [shareModalPost, setShareModalPost] = useState<VideoPost | null>(null);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);
  const [reportCopyrightPost, setReportCopyrightPost] = useState<VideoPost | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Navigation History Tracking for seamless natural Back button flow inside mobile app shell
  const [previousTab, setPreviousTab] = useState<TabType>('spots');
  const [previousView, setPreviousView] = useState<'spots' | 'feed' | 'marketplace' | 'monetization' | 'profile' | 'olx' | 'jobs' | 'real_estate'>('spots');
  const [activeView, setActiveView] = useState<'spots' | 'feed' | 'marketplace' | 'monetization' | 'profile' | 'olx' | 'jobs' | 'real_estate'>(initialNav.view);
  // Module Navigation: 'main' | 'olx' | 'jobs' | 'realEstate'
  const [activeModule, setActiveModule] = useState<AppModule>(initialNav.module);
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
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [isRefreshingMarketplace, setIsRefreshingMarketplace] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

  useEffect(() => {
    if (saveToastMessage) {
      const timer = setTimeout(() => {
        setSaveToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveToastMessage]);

  const handleRefreshFeed = async () => {
    setIsRefreshingFeed(true);
    setFeedSessionKey(Date.now());
    try {
      await refreshAppData();
    } finally {
      setTimeout(() => setIsRefreshingFeed(false), 500);
    }
  };

  const handleRefreshMarketplace = async () => {
    setIsRefreshingMarketplace(true);
    try {
      const fresh = await fetchProductsFromSupabase();
      setMarketplaceProducts(fresh);
    } catch {
      setMarketplaceProducts(getStoredProducts());
    } finally {
      setTimeout(() => setIsRefreshingMarketplace(false), 500);
    }
  };

  const handleSelectProduct = (product: MarketplaceProduct | null) => {
    if (!product) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(product);
  };

  const handleProductUpdated = (updated: MarketplaceProduct) => {
    setMarketplaceProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct?.id === updated.id) {
      setSelectedProduct(updated);
    }
  };
  const [selectedSeller, setSelectedSeller] = useState<ProductSeller | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const isAnyModalOpen = Boolean(
    showCreateModal ||
    showPostAdModal ||
    showPostJobModal ||
    showPostPropertyModal ||
    showLocationModal ||
    showSearchModal ||
    showNotificationModal ||
    showMyAdsModal ||
    showSavedModal ||
    reportCopyrightPost ||
    commentsDrawerPost ||
    isSidebarOpenMobile
  );

  // When any modal opens (or when switching away from spots/feed), pause and mute all background videos immediately
  useEffect(() => {
    if (isAnyModalOpen || (activeView !== 'spots' && activeView !== 'feed')) {
      window.dispatchEvent(new CustomEvent('lp:pause-all-videos'));
      document.querySelectorAll('video').forEach((v) => {
        if (!v.closest('.bottom-sheet-content')) {
          try {
            v.pause();
            v.muted = true;
          } catch {
            // ignore
          }
        }
      });
    }
  }, [isAnyModalOpen, activeView]);

  const currentMarketplaceTab: MarketplaceNavTab = useMemo(() => {
    if (activeView === 'jobs' || navSection === 'jobs') return 'jobs';
    if (activeView === 'real_estate' || navSection === 'real_estate') return 'real_estate';
    return 'olx';
  }, [activeView, navSection]);

  const handleSidebarSelect = (section: MainNavSection) => {
    if (activeView === 'spots' || activeView === 'feed' || activeView === 'marketplace' || activeView === 'profile' || activeView === 'monetization') {
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
      navigateTo('/');
    } else if (section === 'monetization') {
      setActiveModule('main');
      setActiveView('monetization');
      setNavSection('monetization');
      setSelectedProperty(null);
      navigateTo('/points');
    } else if (section === 'news_feed') {
      setActiveModule('main');
      setActiveView('feed');
      setActiveTab('home');
      setNavSection('news_feed');
      setSelectedProperty(null);
      navigateTo('/');
    } else if (section === 'profile') {
      setActiveModule('main');
      setActiveView('profile');
      setActiveTab('profile');
      setNavSection('profile');
      setSelectedProperty(null);
      navigateTo('/profile');
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
    } else if (section === 'admin') {
      navigateTo('/admin');
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
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/marketplace') {
        setActiveModule('main');
        setActiveView('marketplace');
        setActiveTab('marketplace');
      } else if (path === '/olx' || path === '/marketplace/olx') {
        setActiveModule('olx');
        setOlxTab('home');
        setActiveView('olx');
      } else if (path === '/jobs' || path === '/marketplace/jobs') {
        setActiveModule('jobs');
        setJobsTab('jobsHome');
        setActiveView('jobs');
      } else if (path === '/real-estate' || path === '/marketplace/real-estate') {
        setActiveModule('realEstate');
        setRealEstateTab('home');
        setActiveView('real_estate');
      } else if (path === '/points') {
        setActiveModule('main');
        setActiveView('monetization');
      } else if (path === '/profile') {
        setActiveModule('main');
        setActiveView('profile');
        setActiveTab('profile');
      } else if (path === '/' || path === '') {
        setActiveModule('main');
        setActiveView('spots');
        setActiveTab('spots');
      }
    };
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
      if (Array.isArray(serverPosts) && serverPosts.length > 0) {
        setPosts(serverPosts);
        savePosts(serverPosts);
      } else {
        const stored = getStoredPosts();
        if (stored.length > 0) setPosts(stored);
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
      const cleaned = (notifs || []).filter(
        (n) => n.id !== 'notif_welcome' && !n.title?.includes('Community Standing Notice')
      );
      const unread = cleaned.filter((n) => !n.read).length;
      setUnreadNotificationsCount(unread);
    } catch {
      const localNotifs = getStoredNotifications();
      const userNotifs = localNotifs.filter(
        (n) => (n.userId === user.id || n.userId === 'all') &&
          n.id !== 'notif_welcome' &&
          !n.title?.includes('Community Standing Notice')
      );
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

  // Periodic background sync for real-time posts across all users (every 6 seconds)
  useEffect(() => {
    const syncPosts = () => {
      apiClient.getPosts().then((serverPosts) => {
        if (serverPosts && serverPosts.length > 0) {
          setPosts((prevPosts) => {
            // Only update state if count or first/last post IDs changed to prevent periodic re-renders
            if (
              prevPosts.length === serverPosts.length &&
              prevPosts[0]?.id === serverPosts[0]?.id &&
              prevPosts[prevPosts.length - 1]?.id === serverPosts[serverPosts.length - 1]?.id
            ) {
              return prevPosts;
            }
            savePosts(serverPosts);
            return serverPosts;
          });
        }
      }).catch(() => {});
    };

    const postSyncTimer = setInterval(syncPosts, 6000);

    const handleSyncedEvent = () => {
      syncPosts();
    };
    window.addEventListener('spotlight_posts_synced', handleSyncedEvent);

    return () => {
      clearInterval(postSyncTimer);
      window.removeEventListener('spotlight_posts_synced', handleSyncedEvent);
    };
  }, []);

  // Deep linking handler: if user arrives with ?post=<id> or ?spot=<id>, load and jump directly to that reel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const deepPostId = sp.get('post') || sp.get('spot') || sp.get('video');
    if (!deepPostId) return;

    setSelectedSpotPostId(deepPostId);
    setActiveTab('spots');
    setActiveView('spots');
    setActiveModule('main');

    apiClient.getPostById(deepPostId).then((targetPost) => {
      if (targetPost) {
        if (targetPost.location) {
          setActiveLocation(targetPost.location);
          saveActiveLocation(targetPost.location);
        }
        setPosts((prev) => {
          if (prev.some((p) => p.id === targetPost.id)) {
            return prev;
          }
          const updated = [targetPost, ...prev];
          savePosts(updated);
          return updated;
        });
      }
    }).catch((err) => {
      console.warn('[Deep Link] Failed to fetch shared post:', err);
    });
  }, []);

  // Real-time comment synchronization: update post comment count across all views when any user comments
  useEffect(() => {
    const handleCommentAdded = (e: any) => {
      const postId = e.detail?.postId;
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              commentCount: Math.max(0, Number(p.commentCount) || 0) + 1
            };
          }
          return p;
        })
      );
    };
    window.addEventListener('spotlight_comment_added', handleCommentAdded);
    return () => window.removeEventListener('spotlight_comment_added', handleCommentAdded);
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

  // Real-time synchronization for Marketplace products across tabs, users and windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotlight_marketplace_products') {
        setMarketplaceProducts(getStoredProducts());
      }
    };
    const handleCustomUpdate = (e: Event) => {
      const custom = e as CustomEvent<MarketplaceProduct[]>;
      if (custom.detail) {
        setMarketplaceProducts(custom.detail);
      } else {
        setMarketplaceProducts(getStoredProducts());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('marketplace_products_updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('marketplace_products_updated', handleCustomUpdate);
    };
  }, []);

  // Auto-fetch fresh products and properties from database when viewing marketplace so all users see live updates across all devices
  useEffect(() => {
    if (activeView === 'olx' || activeModule === 'olx' || activeView === 'marketplace' || activeView === 'real_estate') {
      fetchProductsFromSupabase().then((serverProducts) => {
        if (serverProducts && serverProducts.length > 0) {
          setMarketplaceProducts(serverProducts);
        }
      }).catch(() => {});
      fetchPropertiesFromSupabase().catch(() => {});

      const pollTimer = setInterval(() => {
        fetchProductsFromSupabase().then((serverProducts) => {
          if (serverProducts && serverProducts.length > 0) {
            setMarketplaceProducts(serverProducts);
          }
        }).catch(() => {});
        fetchPropertiesFromSupabase().catch(() => {});
      }, 10000);

      return () => clearInterval(pollTimer);
    }
  }, [activeView, activeModule, olxTab, realEstateTab]);

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

  // A post is public if approved, or if created by current user so they can inspect their own content
  const isPostPublic = (post: VideoPost): boolean => {
    if (post.status === 'copyright_takedown') {
      return false;
    }
    if (user?.id && post.creatorId === user.id) {
      return true;
    }
    if (post.adminReviewStatus) {
      return post.adminReviewStatus === 'verified_approved' || post.adminReviewStatus === 'bounty_awarded' || post.status === 'published';
    }
    return post.status === 'published';
  };

  // Public approved posts for distribution
  const publicPostsWithDistance = useMemo(() => {
    return postsWithDistance.filter(isPostPublic);
  }, [postsWithDistance, user?.id]);

  // Filtered posts for Home Feed (strictly filtered by active location hub & category)
  const feedPosts = useMemo(() => {
    return publicPostsWithDistance.filter((post) => {
      // 1. Strict Hyperlocal Location Filter:
      // Ponneri posts ONLY show in Ponneri; Tiruvallur posts ONLY show in Tiruvallur!
      if (!isLocationMatch(post.location, activeLocation, post.distanceKm)) {
        return false;
      }

      // 2. Category filter
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'following') {
        return false;
      }
      return post.category === categoryFilter;
    });
  }, [publicPostsWithDistance, categoryFilter, activeLocation]);

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
    const patternMode = localStorage.getItem('spotlight_ad_feed_pattern') || 'standard';
    const firstSlot = patternMode === 'frequent' ? 2 : patternMode === 'relaxed' ? 4 : 3;
    const secondSlot = patternMode === 'frequent' ? 4 : patternMode === 'relaxed' ? 8 : 5;

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
      } else if (newsNumber === firstSlot && eligibleAds.length > 0) {
        const ad = eligibleAds[adCursor % eligibleAds.length];
        items.push({ type: 'ad', data: ad });
        adCursor++;
      } else if (newsNumber === secondSlot && eligibleAds.length > 1) {
        const ad = eligibleAds[adCursor % eligibleAds.length];
        items.push({ type: 'ad', data: ad });
        adCursor++;
      }
    });

    return items;
  }, [feedPosts, eligibleAds]);

  // DETERMINISTIC VIDEO FEED: Prioritized & Consistent Recommendation Engine
  // 1. Breaking / Urgent videos first
  // 2. Unwatched videos in strict chronological feed order (newest first)
  // 3. Previously watched videos placed at the end (newest first)
  // Zero random selection, zero random shuffling. 100% predictable like Instagram Reels.
  const spotsPosts = useMemo(() => {
    const { feed } = generateSmartVideoFeed({
      posts: publicPostsWithDistance,
      userLocation: activeLocation,
      userId: effectiveUserId,
      watchedSet: watchedPostIds
    });
    // If a specific video is opened via deep-link or share, ensure it is available in the feed
    if (selectedSpotPostId) {
      const exists = feed.some((p) => p.id === selectedSpotPostId);
      if (!exists) {
        const target = publicPostsWithDistance.find((p) => p.id === selectedSpotPostId);
        if (target) {
          return [target, ...feed];
        }
      }
    }
    return feed;
  }, [publicPostsWithDistance, activeLocation, effectiveUserId, feedSessionKey, selectedSpotPostId]);

  // Urgent breaking post for active location (public approved)
  const breakingPost = useMemo(() => {
    return publicPostsWithDistance.find((p) => p.isBreaking && isLocationMatch(p.location, activeLocation, p.distanceKm));
  }, [publicPostsWithDistance, activeLocation]);

  // Actions
  const handleLike = (postId: string) => {
    let nextIsLiked = false;
    let nextLikeCount = 0;

    // 1. Immediate optimistic UI update directly on memory state
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          nextIsLiked = !p.isLiked;
          const currentCount = Math.max(0, Number(p.likeCount) || 0);
          nextLikeCount = Math.max(0, currentCount + (nextIsLiked ? 1 : -1));
          return {
            ...p,
            isLiked: nextIsLiked,
            likeCount: nextLikeCount
          };
        }
        return p;
      })
    );

    // 2. Persist to storage
    toggleLikePost(postId, posts);

    // 3. Persist to Supabase database & backend asynchronously
    apiClient.toggleLikePost(postId, nextIsLiked, nextLikeCount, user?.id);
  };

  const handleSave = (postId: string) => {
    let nextIsSaved = false;

    // 1. Immediate optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          nextIsSaved = !p.isSaved;
          return {
            ...p,
            isSaved: nextIsSaved
          };
        }
        return p;
      })
    );

    // 2. Persist to storage
    toggleSavePost(postId, posts);

    // 3. User feedback toast showing exact location of saved item
    setSaveToastMessage(
      nextIsSaved
        ? 'Saved! View anytime in Profile > Saved'
        : 'Removed from Saved'
    );
  };

  const handleShare = (post: VideoPost) => {
    // Open the comprehensive ShareModal (WhatsApp, Instagram, Telegram, More Apps / Native Share, Copy Link)
    setShareModalPost(post);
  };

  const handleAddComment = (postId: string, _text: string) => {
    // 1. Immediate optimistic UI update on posts state
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentCount: Math.max(0, Number(p.commentCount) || 0) + 1
          };
        }
        return p;
      })
    );
  };

  const handleOpenPostInSpots = (post: VideoPost) => {
    if (post.type === 'video') {
      if (!isLocationMatch(post.location, activeLocation, post.distanceKm)) {
        setActiveLocation(post.location);
        saveActiveLocation(post.location);
      }
      setSelectedSpotPostId(post.id);
      setActiveTab('spots');
      setActiveView('spots');
      setActiveModule('main');
    }
  };

  const handleSelectLocation = (loc: LocationCoordinates) => {
    setActiveLocation(loc);
    saveActiveLocation(loc);
    setFeedSessionKey(Date.now());
    // Instantly sync latest posts from Supabase so location changes always reflect live database updates
    apiClient.getPosts().then((serverPosts) => {
      if (serverPosts && serverPosts.length > 0) {
        setPosts(serverPosts);
        savePosts(serverPosts);
      }
    }).catch(() => {});
  };

  const handlePublishPost = (newPost: VideoPost) => {
    const updatedPosts = [newPost, ...posts.filter((p) => p.id !== newPost.id)];
    setPosts(updatedPosts);
    savePosts(updatedPosts);

    // If the post was published to a specific hub (e.g. Ponneri), switch active location to that hub so user sees it live
    if (newPost.location && !isLocationMatch(newPost.location, activeLocation)) {
      setActiveLocation(newPost.location);
      saveActiveLocation(newPost.location);
    }
    setFeedSessionKey(Date.now());

    if (newPost.type === 'video') {
      setSelectedSpotPostId(newPost.id);
      setActiveTab('spots');
    } else {
      setActiveTab('home');
    }

    // Trigger immediate refresh from Supabase/server so state is 100% synchronized
    setTimeout(() => {
      apiClient.getPosts().then((serverPosts) => {
        if (serverPosts && serverPosts.length > 0) {
          setPosts(serverPosts);
          savePosts(serverPosts);
        }
      }).catch(() => {});
    }, 400);
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
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <img src="/logo.png" alt="Spotlight360" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>Spotlight360</div>
        <div style={{ fontSize: '12px', color: '#fb923c', fontWeight: 700, marginTop: '2px', letterSpacing: '0.04em' }}>Hyperlocal News & Marketplace</div>
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '6px' }}>
          Verifying secure session (Supabase & Cloudflare R2)...
        </div>
      </div>
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

  // New User Onboarding: Must complete profile before accessing main app (only for authenticated users)
  if (isAuthenticated && !isAdmin && (authUser?.onboardingCompleted === false || user.onboardingCompleted === false)) {
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
        editingProduct={editingProduct}
        onProductUpdated={(updated) => {
          handleProductUpdated(updated);
        }}
        onClose={() => {
          setShowPostAdModal(false);
          setEditingProduct(null);
        }}
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
          handleSelectProduct(p);
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
          handleSelectProduct(p);
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
            handleSelectProduct(p);
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
          postId={commentsDrawerPost.id}
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

      {/* 11. Native-Style Share Modal Sheet */}
      {shareModalPost && (
        <ShareModal
          post={shareModalPost}
          onClose={() => setShareModalPost(null)}
        />
      )}

      {/* 12. Floating Bookmark / Save Toast Pill */}
      {saveToastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
            zIndex: 9999,
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            whiteSpace: 'nowrap'
          }}
        >
          <Bookmark size={15} fill="#ea580c" color="#ea580c" />
          <span>{saveToastMessage}</span>
        </div>
      )}
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
          onOpenProfile={() => {
            setActiveTab('profile');
            setActiveView('profile');
          }}
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
        <div className={`app-screen-content ${activeView === 'spots' ? 'spots-active-view' : ''}`}>
          {/* SPOTS PLAYER: Reels / Vertical Short Video News (Kept in DOM so feed position & playback state are preserved across tab switches) */}
          <div
            style={{
              height: '100%',
              width: '100%',
              display: activeView === 'spots' ? 'block' : 'none'
            }}
          >
            <SpotsPlayer
              posts={spotsPosts}
              initialPostId={selectedSpotPostId}
              isPaused={isAnyModalOpen || activeView !== 'spots'}
              currentUser={user}
              activeLocation={activeLocation}
              onOpenLocationPicker={() => setShowLocationModal(true)}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onAddComment={handleAddComment}
              getCommentsForPost={(id) => getStoredComments(id)}
              onOpenCreate={() => setShowCreateModal(true)}
              onReportCopyright={(p) => setReportCopyrightPost(p)}
              onVideoWatched={handleVideoWatched}
              onRefresh={handleRefreshFeed}
              isRefreshing={isRefreshingFeed}
            />
          </div>

          {/* NEWS FEED */}
          {activeView === 'feed' && (
            <div style={{ padding: '0 0 16px', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
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
                        maxWidth: '340px',
                        margin: '0 auto 20px'
                      }}
                    >
                      {categoryFilter !== 'all'
                        ? `No stories found under "${categoryFilter}" for ${activeLocation.neighborhood || activeLocation.placeName}.`
                        : `No reports published in ${activeLocation.neighborhood || activeLocation.placeName} yet. Spotlight strictly isolates content to your active hub.`}
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
                        <span>Post First Report in {activeLocation.neighborhood || 'This Hub'}</span>
                      </button>

                      <button
                        onClick={() => setShowLocationModal(true)}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          background: '#f8fafc',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Switch Local Hub
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

          {/* PROFILE: If guest (new person), shows Register/Login; if already registered, shows actual Profile */}
          {activeView === 'profile' && (
            <div>
              {!isAuthenticated ? (
                <AuthPage
                  initialMode="register"
                  onSuccess={() => {
                    refreshAppData();
                  }}
                  onAdminSuccess={() => navigateTo('/admin')}
                  onNewUser={() => {
                    refreshAppData();
                  }}
                  onClose={() => {
                    setActiveView(previousView === 'profile' ? 'spots' : previousView);
                    setActiveTab(previousTab === 'profile' ? 'spots' : previousTab);
                  }}
                />
              ) : (
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
                    handleSelectProduct(p);
                    setActiveModule('olx');
                    setActiveView('olx');
                  }}
                  onNavigateToMarketplace={() => {
                    setPreviousView('profile');
                    setPreviousTab('profile');
                    setSelectedProduct(null);
                    setActiveModule('main');
                    setActiveTab('marketplace');
                    setActiveView('marketplace');
                    navigateTo('/marketplace');
                  }}
                />
              )}
            </div>
          )}

          {/* MARKETPLACE LANDING PAGE */}
          {activeView === 'marketplace' && (
            <MarketplaceLandingPage
              onSelectBuyAndSell={() => {
                setPreviousView('marketplace');
                setSelectedProduct(null);
                setSelectedProperty(null);
                setActiveModule('olx');
                setOlxTab('home');
                setActiveView('olx');
                navigateTo('/olx');
              }}
              onSelectRealEstate={() => {
                setPreviousView('marketplace');
                setSelectedProduct(null);
                setSelectedProperty(null);
                setActiveModule('realEstate');
                setRealEstateTab('home');
                setActiveView('real_estate');
                navigateTo('/real-estate');
              }}
              onSelectJobs={() => {
                setPreviousView('marketplace');
                setSelectedProduct(null);
                setSelectedProperty(null);
                setActiveModule('jobs');
                setJobsTab('jobsHome');
                setActiveView('jobs');
                navigateTo('/jobs');
              }}
              locationName={activeLocation.neighborhood || activeLocation.placeName || 'Chennai & Tiruvallur'}
              totalProductsCount={marketplaceProducts.length}
              totalPropertiesCount={getStoredProperties().length}
              totalJobsCount={getStoredJobs().length}
            />
          )}

          {/* OLX / BUY & SELL: Renders inside the SAME app viewport */}
          {activeView === 'olx' && (
            <div>
              {olxTab === 'home' && (
                <MarketplaceHomeScreen
                  products={marketplaceProducts}
                  selectedProduct={selectedProduct}
                  onSelectProduct={(p) => handleSelectProduct(p)}
                  onToggleFavorite={handleToggleProductFavorite}
                  onOpenPostAd={() => setShowPostAdModal(true)}
                  onRefresh={handleRefreshMarketplace}
                  isRefreshing={isRefreshingMarketplace}
                  onNavigateHome={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
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
                  onSelectProduct={(p) => handleSelectProduct(p)}
                  onToggleFavorite={handleToggleProductFavorite}
                  onRefresh={handleRefreshMarketplace}
                  isRefreshing={isRefreshingMarketplace}
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                    setSelectedProduct(null);
                  }}
                />
              )}

              {olxTab === 'alerts' && (
                <OlxAlertsScreen
                  products={marketplaceProducts}
                  onSelectProduct={(p) => handleSelectProduct(p)}
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                    setSelectedProduct(null);
                  }}
                />
              )}

              {olxTab === 'profile' && (
                <OlxProfileScreen
                  user={user}
                  products={marketplaceProducts}
                  onSelectProduct={(p) => handleSelectProduct(p)}
                  onOpenPostAd={() => setShowPostAdModal(true)}
                  onRefreshProducts={() => setMarketplaceProducts(getStoredProducts())}
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
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
                        if (previousView === 'marketplace') {
                          setActiveModule('main');
                          setActiveView('marketplace');
                          setActiveTab('marketplace');
                          navigateTo('/marketplace');
                        } else {
                          setActiveModule('main');
                          setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                          setActiveTab(previousTab || 'spots');
                          navigateTo('/');
                        }
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
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                  }}
                />
              )}

              {jobsTab === 'applications' && (
                <JobsApplicationsScreen
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                  }}
                />
              )}

              {jobsTab === 'profile' && (
                <JobsProfileScreen
                  user={user}
                  onOpenPostJob={() => setShowPostJobModal(true)}
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
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
                        if (previousView === 'marketplace') {
                          setActiveModule('main');
                          setActiveView('marketplace');
                          setActiveTab('marketplace');
                          navigateTo('/marketplace');
                        } else {
                          setActiveModule('main');
                          setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                          setActiveTab(previousTab || 'spots');
                          navigateTo('/');
                        }
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
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                  }}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                />
              )}

              {realEstateTab === 'saved' && (
                <RealEstateSavedScreen
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
                  }}
                  onSelectProperty={(prop) => setSelectedProperty(prop)}
                />
              )}

              {realEstateTab === 'profile' && (
                <RealEstateProfileScreen
                  user={user}
                  onOpenPostProperty={() => setShowPostPropertyModal(true)}
                  onBackToMain={() => {
                    if (previousView === 'marketplace') {
                      setActiveModule('main');
                      setActiveView('marketplace');
                      setActiveTab('marketplace');
                      navigateTo('/marketplace');
                    } else {
                      setActiveModule('main');
                      setActiveView(previousView === 'profile' ? 'profile' : previousView === 'feed' ? 'feed' : 'spots');
                      setActiveTab(previousTab || 'spots');
                      navigateTo('/');
                    }
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
            if (tab === 'spots') {
              if (activeView === 'spots') {
                window.dispatchEvent(new CustomEvent('lp:spots-scroll-top'));
              }
              setSelectedSpotPostId(undefined);
              setActiveView('spots');
              navigateTo('/');
            } else if (tab === 'home') {
              setActiveView('feed');
              navigateTo('/');
            } else if (tab === 'marketplace') {
              setActiveView('marketplace');
              navigateTo('/marketplace');
            } else if (tab === 'monetization') {
              setActiveView('monetization');
              navigateTo('/points');
            } else if (tab === 'profile') {
              setActiveView('profile');
              navigateTo('/profile');
            }
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
              onEditProduct={(prod) => {
                setEditingProduct(prod);
                setShowPostAdModal(true);
                setSelectedProduct(null);
              }}
              onDeleteProduct={(id) => {
                setMarketplaceProducts((prev) => prev.filter((p) => p.id !== id));
                setSelectedProduct(null);
              }}
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
              ? 'home'
              : activeView === 'monetization'
              ? 'monetization'
              : activeView === 'profile'
              ? 'profile'
              : 'home'
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
