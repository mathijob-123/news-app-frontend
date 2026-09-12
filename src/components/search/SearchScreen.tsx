import React, { useState, useMemo } from 'react';
import {
  Search,
  Map as MapIcon,
  List,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  X,
  Users,
  Newspaper
} from 'lucide-react';
import type { VideoPost, LocationCoordinates, RadiusFilter } from '../../types';
import { NewsMapView } from './NewsMapView';
import { formatDistance } from '../../services/geoService';

interface SearchScreenProps {
  posts: VideoPost[];
  userLocation: LocationCoordinates;
  radiusKm: RadiusFilter;
  onSelectRadius: (radius: RadiusFilter) => void;
  onOpenPost: (post: VideoPost) => void;
  onClose?: () => void;
}

type SearchTab = 'news' | 'creators' | 'locations' | 'topics';

export const SearchScreen: React.FC<SearchScreenProps> = ({
  posts,
  userLocation,
  radiusKm,
  onSelectRadius,
  onOpenPost,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('news');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter posts based on query and radius
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchQuery =
        !query.trim() ||
        post.headline.toLowerCase().includes(query.toLowerCase()) ||
        post.caption.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase()) ||
        post.location.placeName.toLowerCase().includes(query.toLowerCase()) ||
        (post.location.neighborhood &&
          post.location.neighborhood.toLowerCase().includes(query.toLowerCase())) ||
        post.creatorName.toLowerCase().includes(query.toLowerCase()) ||
        post.creatorHandle.toLowerCase().includes(query.toLowerCase());

      const matchRadius =
        post.distanceKm === undefined || radiusKm === 100 || post.distanceKm <= radiusKm;

      return matchQuery && matchRadius;
    });
  }, [posts, query, radiusKm]);

  // Unique creators in current scope
  const uniqueCreators = useMemo(() => {
    const map = new Map<string, VideoPost>();
    posts.forEach((p) => {
      if (!map.has(p.creatorId)) {
        map.set(p.creatorId, p);
      }
    });
    return Array.from(map.values()).filter((c) =>
      !query.trim() ||
      c.creatorName.toLowerCase().includes(query.toLowerCase()) ||
      c.creatorHandle.toLowerCase().includes(query.toLowerCase())
    );
  }, [posts, query]);

  // Unique neighborhoods
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    posts.forEach((p) => {
      if (p.location.neighborhood) locs.add(p.location.neighborhood);
      locs.add(p.location.placeName);
    });
    return Array.from(locs).filter((l) =>
      !query.trim() || l.toLowerCase().includes(query.toLowerCase())
    );
  }, [posts, query]);

  // Dynamic trending topics from active posts
  const trendingTopics = useMemo(() => {
    const counts = new Map<string, { tag: string; count: number; category: string }>();
    posts.forEach((p) => {
      const tag = `#${p.category.toUpperCase()}`;
      const existing = counts.get(tag);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(tag, { tag, count: 1, category: p.category });
      }
    });
    return Array.from(counts.values()).filter((t) =>
      !query.trim() || t.tag.toLowerCase().includes(query.toLowerCase())
    );
  }, [posts, query]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* 1. Top Search Header */}
      <div
        style={{
          background: '#ffffff',
          padding: '12px 16px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search news, places, creators, #tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                background: '#f1f5f9',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={14} />
              <span>Done</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle (List vs Map) & Radius Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px'
          }}
        >
          {/* List vs Map Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                background: viewMode === 'map' ? '#ffffff' : 'transparent',
                color: viewMode === 'map' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <MapIcon size={13} />
              <span>Hyperlocal Map</span>
            </button>
          </div>

          {/* Radius Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SlidersHorizontal size={11} color="var(--brand-primary)" />
            {([1, 5, 25, 100] as RadiusFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => onSelectRadius(r)}
                style={{
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: radiusKm === r ? 'var(--brand-primary)' : '#ffffff',
                  color: radiusKm === r ? '#ffffff' : 'var(--text-secondary)',
                  border: radiusKm === r ? 'none' : '1px solid var(--border-subtle)'
                }}
              >
                {r === 100 ? 'City' : `${r}km`}
              </button>
            ))}
          </div>
        </div>

        {/* Search Result Category Tabs */}
        {viewMode === 'list' && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '10px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '8px'
            }}
          >
            {(['news', 'creators', 'locations', 'topics'] as SearchTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Search Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {viewMode === 'map' ? (
          <NewsMapView
            posts={filteredPosts}
            userLocation={userLocation}
            radiusKm={radiusKm}
            onSelectPost={onOpenPost}
          />
        ) : (
          <div style={{ padding: '12px 16px' }}>
            {/* TAB 1: News Stories */}
            {activeTab === 'news' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}
                >
                  {filteredPosts.length} Local News Stories Found
                </div>

                {filteredPosts.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      margin: '12px 0'
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
                      <Search size={28} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {query.trim() ? `No Stories Matching "${query}"` : 'No News Reports Indexed'}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      {query.trim()
                        ? 'Try searching by a broader locality, neighborhood, or category tag.'
                        : `No ground news reports found within ${radiusKm === 100 ? 'the district' : `${radiusKm}km`}.`}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => onOpenPost(post)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                        }}
                      >
                        <img
                          src={post.thumbnailUrl}
                          alt={post.headline}
                          style={{
                            width: '74px',
                            height: '74px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span className={`category-tag-badge ${post.category}`}>
                                {post.category}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                                {post.distanceKm !== undefined ? formatDistance(post.distanceKm) : ''}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {post.headline}
                            </h4>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            By @{post.creatorHandle} • {post.viewCount.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Creators */}
            {activeTab === 'creators' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}
                >
                  Verified Citizen Reporters Near You
                </div>
                {uniqueCreators.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      margin: '12px 0'
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
                      <Users size={28} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Citizen Reporters Found
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      {query.trim()
                        ? `No citizen reporters match "${query}".`
                        : 'Reporters across Chennai & Tiruvallur will be listed here as reports are filed.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uniqueCreators.map((creator) => (
                      <div
                        key={creator.creatorId}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={creator.creatorAvatar}
                            alt={creator.creatorName}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '13px' }}>
                              <span>{creator.creatorName}</span>
                              {creator.creatorVerified && (
                                <CheckCircle2 size={13} color="var(--brand-primary)" fill="#ffedd5" />
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              @{creator.creatorHandle} • {creator.location.neighborhood || 'Metro Hub'}
                            </div>
                          </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Locations */}
            {activeTab === 'locations' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}
                >
                  Active News Hotspots
                </div>
                {uniqueLocations.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      margin: '12px 0'
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
                      <MapPin size={28} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Active Hotspots Yet
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      {query.trim()
                        ? `No active areas match "${query}".`
                        : 'Localities across North Tamil Nadu will appear here as news reports are filed.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uniqueLocations.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => setQuery(loc)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#fff7ed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--brand-primary)'
                            }}
                          >
                            <MapPin size={16} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {loc}
                          </span>
                        </div>
                        <ArrowRight size={14} color="var(--text-tertiary)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Trending Topics */}
            {activeTab === 'topics' && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <TrendingUp size={13} color="var(--brand-primary)" />
                  <span>Trending In Your City Right Now</span>
                </div>
                {trendingTopics.length === 0 ? (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      margin: '12px 0'
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
                      <TrendingUp size={28} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No Trending Topics Yet
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '280px', margin: '0 auto' }}>
                      Trending hashtags and civic topic clusters will generate dynamically once stories are filed.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {trendingTopics.map((t) => (
                      <div
                        key={t.tag}
                        onClick={() => {
                          setQuery(t.tag.replace('#', ''));
                          setActiveTab('news');
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-primary)' }}>
                            {t.tag}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {t.count} citizen report{t.count > 1 ? 's' : ''} filed
                          </div>
                        </div>
                        <span className={`category-tag-badge ${t.category}`}>{t.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
