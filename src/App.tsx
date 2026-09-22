import React, { useState, useEffect, useMemo } from 'react';
import { BottomNav } from './components/layout/BottomNav';
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
import { Newspaper, Plus, Compass, ShieldCheck, WifiOff } from 'lucide-react';
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
      if (serverPosts && serverPosts.length > 0) {
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

    loadServerPosts();
    loadServerAds();
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
          text: `LocalPulse: ${post.headline} (${post.location.placeName})`,
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
        <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>LocalPulse Spotlight</div>
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

  return (
    <div className="app-container">
      <div className="app-device-shell">
        {/* Offline Warning Banner */}
        {isOffline && (
          <div
            style={{
              background: '#fef2f2',
              color: 'var(--brand-alert)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1px solid #fecaca',
              zIndex: 100
            }}
          >
            <WifiOff size={13} />
            <span>Offline Mode: Browsing cached hyperlocal news stories</span>
          </div>
        )}

        {/* Top Header (Shown on Home, Monetization, Profile; Hidden in Spots for full immersion) */}
        {activeTab !== 'spots' && (
          <Header
            activeLocation={activeLocation}
            onSelectLocation={handleSelectLocation}
            onOpenSearch={() => setShowSearchModal(true)}
            onOpenAdmin={() => navigateTo('/admin')}
            unreadAlertCount={unreadNotificationsCount}
            onOpenNotifications={() => setShowNotificationModal(true)}
          />
        )}

        {/* Main App Screens */}
        <main className="app-screen-content">
          {/* TAB 1: HOME (News Feed) */}
          {activeTab === 'home' && (
            <div>
              {/* Breaking Alert Banner */}
              <BreakingBanner
                breakingPost={breakingPost}
                onOpenPost={handleOpenPostInSpots}
              />

              {/* Category Filter */}
              <CategoryFilter
                selectedCategory={categoryFilter}
                onSelectCategory={setCategoryFilter}
              />

              {/* Feed Cards List */}
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

                    <div
                      style={{
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      <ShieldCheck size={13} color="#059669" />
                      <span>Admin treasury pays ₹50 - ₹500 for verified video reports</span>
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

          {/* TAB 2: SPOTS (Vertical Reels) */}
          {activeTab === 'spots' && (
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
              onOpenCreate={() => setShowCreateModal(true)}
              onReportCopyright={(p) => setReportCopyrightPost(p)}
            />
          )}

          {/* TAB 3: MONETIZATION */}
          {activeTab === 'monetization' && (
            <MonetizationScreen
              user={user}
              wallet={wallet}
              transactions={transactions}
              userPosts={posts.filter((p) => p.creatorId === user.id)}
              allPosts={postsWithDistance}
              onRequestPayout={handleRequestPayout}
              onAdminApprovePayout={handleAdminApprovePayout}
            />
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileScreen
              user={user}
              posts={postsWithDistance}
              onOpenPost={handleOpenPostInSpots}
              onNavigateToMonetization={() => setActiveTab('monetization')}
              onUpdateUser={handleUpdateUser}
              onOpenAdmin={() => navigateTo('/admin')}
            />
          )}
        </main>

        {/* Bottom Navigation (4 Tabs + Center [+] FAB: Home, Spots, (+), Earnings, Profile) */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'spots') {
              setSelectedSpotPostId(undefined);
            }
            setActiveTab(tab);
          }}
          onOpenCreate={() => setShowCreateModal(true)}
        />

        {/* Search & Interactive Hyperlocal Map Modal (Triggered via Top Header Search Button) */}
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

        {/* Create / Upload Report Modal */}
        {showCreateModal && (
          <CreateModal
            currentUser={user}
            activeLocation={activeLocation}
            onClose={() => setShowCreateModal(false)}
            onPublishPost={handlePublishPost}
          />
        )}

        {/* Global Comments Drawer (when opened from Home feed) */}
        {commentsDrawerPost && (
          <CommentsDrawer
            comments={getStoredComments(commentsDrawerPost.id)}
            currentUser={user}
            onClose={() => setCommentsDrawerPost(null)}
            onAddComment={(text) => handleAddComment(commentsDrawerPost.id, text)}
          />
        )}

        {/* DMCA Copyright Infringement Report Modal */}
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

        {/* User Notifications Drawer */}
        {showNotificationModal && (
          <NotificationModal
            userId={user.id}
            onClose={() => {
              setShowNotificationModal(false);
              refreshAppData();
            }}
          />
        )}

        {/* Global Hyperlocal Hub / Location Picker Modal */}
        <LocationPickerModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
        />
      </div>
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
