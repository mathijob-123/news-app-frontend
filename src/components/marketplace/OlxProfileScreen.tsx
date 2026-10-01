import React, { useState } from 'react';
import {
  User as UserIcon,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Package,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  Settings,
  Edit3,
  Plus,
  MoreVertical,
  ExternalLink,
  Trash2,
  RefreshCw,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import type { User } from '../../types';
import type { MarketplaceProduct } from '../../types/marketplace';
import {
  deleteStoredProduct,
  markStoredProductSold,
  renewStoredProduct
} from '../../services/marketplaceService';

interface OlxProfileScreenProps {
  user: User;
  products: MarketplaceProduct[];
  onSelectProduct: (product: MarketplaceProduct) => void;
  onOpenPostAd: () => void;
  onRefreshProducts: () => void;
  onBackToMain?: () => void;
  onOpenSettings?: () => void;
  onOpenSavedItems?: () => void;
}

export const OlxProfileScreen: React.FC<OlxProfileScreenProps> = ({
  user,
  products,
  onSelectProduct,
  onOpenPostAd,
  onRefreshProducts,
  onBackToMain,
  onOpenSettings,
  onOpenSavedItems
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'sold' | 'expired'>('active');
  const [openManageId, setOpenManageId] = useState<string | null>(null);

  // Consider listings posted by user or marked isMine; fallback to all if none marked mine yet
  const userListings = products.filter((p) => p.isMine || p.seller?.id === user.id);
  const displayListings = userListings.length > 0 ? userListings : products.slice(0, 5);

  const activeAds = displayListings.filter((p) => (p.status || 'active') === 'active');
  const soldAds = displayListings.filter((p) => p.status === 'sold');
  const expiredAds = displayListings.filter((p) => p.status === 'expired');

  const filteredByTab = displayListings.filter((p) => {
    if (activeSubTab === 'active') return (p.status || 'active') === 'active';
    if (activeSubTab === 'sold') return p.status === 'sold';
    if (activeSubTab === 'expired') return p.status === 'expired';
    return true;
  });

  const savedCount = products.filter((p) => p.isFavorite).length;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteStoredProduct(id);
      onRefreshProducts();
      setOpenManageId(null);
    }
  };

  const handleMarkAsSold = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markStoredProductSold(id);
    onRefreshProducts();
    setOpenManageId(null);
  };

  const handleRenew = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    renewStoredProduct(id);
    onRefreshProducts();
    setOpenManageId(null);
  };

  return (
    <div className="olx-profile-page-content" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header Row with Back button and Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Back to LocalPlus Main Feed"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            OLX Seller Profile
          </h2>
        </div>

        <button
          onClick={onOpenPostAd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Post Ad</span>
        </button>
      </div>

      {/* Seller Identity Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.displayName || user.handle}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #ea580c'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#10b981',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}
              title="Verified User"
            >
              <ShieldCheck size={11} color="#ffffff" strokeWidth={3} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {user.displayName || user.handle || 'LocalPlus User'}
              </h3>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <ShieldCheck size={10} /> Verified
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', color: '#64748b', fontSize: '12px' }}>
              <MapPin size={12} color="#ea580c" />
              <span>{user.homeLocation?.neighborhood || user.homeLocation?.placeName || 'Chennai, Tamil Nadu'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span
                style={{
                  background: '#fff7ed',
                  color: '#ea580c',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Award size={11} /> Top Rated Seller
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Trust Score: {user.trustScore || 98}%</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons row: Edit Profile & Settings */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={onOpenSettings}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Edit3 size={13} />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onOpenSettings}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Settings size={13} />
            <span>Account Settings</span>
          </button>
        </div>
      </div>

      {/* Seller Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
            {displayListings.length}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Total Ads
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
            {activeAds.length}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Active Ads
          </p>
        </div>

        <div
          onClick={onOpenSavedItems}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
            {savedCount || 3}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Saved Items
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#8b5cf6' }}>
            8
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Enquiries
          </p>
        </div>
      </div>

      {/* Section: My Ads */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Ads
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {filteredByTab.length} listed
          </span>
        </div>

        {/* Subtabs: Active (count) | Sold (count) | Expired (count) */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: '#e2e8f0',
            padding: '3px',
            borderRadius: '10px',
            marginBottom: '12px'
          }}
        >
          <button
            onClick={() => setActiveSubTab('active')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'active' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'active' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'active' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>Active</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '9999px',
                background: activeSubTab === 'active' ? '#ecfdf5' : '#f1f5f9',
                color: activeSubTab === 'active' ? '#059669' : '#64748b'
              }}
            >
              {activeAds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sold')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'sold' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'sold' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'sold' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>Sold</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '9999px',
                background: activeSubTab === 'sold' ? '#f1f5f9' : '#f8fafc',
                color: '#64748b'
              }}
            >
              {soldAds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('expired')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'expired' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'expired' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer',
              boxShadow: activeSubTab === 'expired' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>Expired</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '9999px',
                background: activeSubTab === 'expired' ? '#fff7ed' : '#f1f5f9',
                color: activeSubTab === 'expired' ? '#ea580c' : '#64748b'
              }}
            >
              {expiredAds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Listings Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredByTab.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '32px 16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}
          >
            <Package size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No {activeSubTab} ads found
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>
              {activeSubTab === 'active'
                ? 'You do not have any active ads right now. Post your first product to start receiving enquiries!'
                : `No items marked as ${activeSubTab}.`}
            </p>
            {activeSubTab === 'active' && (
              <button
                onClick={onOpenPostAd}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Post an Ad
              </button>
            )}
          </div>
        ) : (
          filteredByTab.map((prod) => {
            const isMenuOpen = openManageId === prod.id;
            const statusColor =
              prod.status === 'sold'
                ? { bg: '#f1f5f9', text: '#64748b', label: 'Sold' }
                : prod.status === 'expired'
                ? { bg: '#fef3c7', text: '#d97706', label: 'Expired' }
                : { bg: '#ecfdf5', text: '#059669', label: 'Active' };

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Product Image */}
                <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
                  <img
                    src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: statusColor.bg,
                      color: statusColor.text,
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {statusColor.label}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                      <h4
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: 0,
                          lineHeight: '1.25',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {prod.title}
                      </h4>

                      {/* Manage Dropdown Toggle */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenManageId(isMenuOpen ? null : prod.id);
                          }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '3px 6px',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <span>Manage</span>
                          <MoreVertical size={12} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: '28px',
                              right: 0,
                              background: '#ffffff',
                              borderRadius: '10px',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                              border: '1px solid #e2e8f0',
                              zIndex: 30,
                              minWidth: '140px',
                              padding: '4px'
                            }}
                          >
                            {prod.status !== 'sold' && (
                              <button
                                onClick={(e) => handleMarkAsSold(prod.id, e)}
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: '#059669',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Mark Sold</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleRenew(prod.id, e)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: '#2563eb',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              <RefreshCw size={13} />
                              <span>Renew Ad</span>
                            </button>
                            <button
                              onClick={(e) => handleDelete(prod.id, e)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', marginTop: '3px' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} color="#94a3b8" />
                      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.location}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} color="#94a3b8" />
                      <span>{prod.postedAt || 'Recently'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
