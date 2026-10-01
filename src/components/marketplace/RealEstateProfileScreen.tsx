import React, { useState } from 'react';
import {
  User as UserIcon,
  Home,
  Building,
  Key,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bookmark,
  MessageCircle,
  Plus,
  ArrowLeft,
  Settings,
  Edit3,
  ExternalLink,
  Trash2,
  RefreshCw,
  Phone
} from 'lucide-react';
import type { User } from '../../types';
import type { MarketplaceProperty } from '../../types/marketplace';
import { getStoredProperties } from '../../services/marketplaceService';

interface RealEstateProfileScreenProps {
  user: User;
  onOpenPostProperty: () => void;
  onBackToMain?: () => void;
  onSelectProperty?: (prop: MarketplaceProperty) => void;
}

export const RealEstateProfileScreen: React.FC<RealEstateProfileScreenProps> = ({
  user,
  onOpenPostProperty,
  onBackToMain,
  onSelectProperty
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'rented' | 'sold' | 'saved'>('active');

  const allProperties = getStoredProperties();
  const savedProperties = allProperties.filter((p) => p.isSaved);

  // User properties (fallback to sample set for rich display)
  const myProperties = [
    {
      id: 'my-prop-1',
      title: 'Modern 2 BHK Gated Community Apartment',
      price: '₹28,000/mo',
      location: 'Avadi Main Road, Chennai',
      bhk: '2 BHK',
      areaSqFt: 1150,
      listingType: 'Rent',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
      postedDate: '5 days ago',
      views: 48,
      enquiries: 6
    },
    {
      id: 'my-prop-2',
      title: 'Commercial Office Space 1200 Sq.Ft',
      price: '₹55,000/mo',
      location: 'Ambattur Industrial Estate',
      bhk: 'Office',
      areaSqFt: 1200,
      listingType: 'Commercial',
      status: 'rented',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      postedDate: '3 weeks ago',
      views: 112,
      enquiries: 14
    }
  ];

  const activeListings = myProperties.filter((p) => p.status === 'active');
  const rentedListings = myProperties.filter((p) => p.status === 'rented');
  const soldListings = myProperties.filter((p) => p.status === 'sold');

  return (
    <div className="realestate-profile-screen" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header Row with Back button */}
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
              title="Back to LocalPlus Main"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Real Estate Portfolio
          </h2>
        </div>

        <button
          onClick={onOpenPostProperty}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
          }}
        >
          <Plus size={14} strokeWidth={2.6} />
          <span>Post Property</span>
        </button>
      </div>

      {/* User Identity Card */}
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
                width: '62px',
                height: '62px',
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
            >
              <ShieldCheck size={11} color="#ffffff" strokeWidth={3} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {user.displayName || user.handle || 'Property Owner'}
              </h3>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                Verified Owner
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', color: '#64748b', fontSize: '12px' }}>
              <MapPin size={12} color="#ea580c" />
              <span>{user.homeLocation?.neighborhood || user.homeLocation?.placeName || 'Chennai, Tamil Nadu'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span
                style={{
                  background: '#fff7ed',
                  color: '#ea580c',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                Direct Owner / Local Host
              </span>
            </div>
          </div>
        </div>

        {/* Contact details row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b' }}>
          <div>
            <span>Contact: <strong>+91 98401 23456</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => alert('Account Settings & Privacy...')}
              style={{ background: 'transparent', border: 'none', color: '#ea580c', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '10px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#ea580c' }}>
            {myProperties.length}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Listings
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '10px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#10b981' }}>
            {activeListings.length}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Active
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '10px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#3b82f6' }}>
            {savedProperties.length}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Saved
          </p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '10px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#8b5cf6' }}>
            20
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
            Enquiries
          </p>
        </div>
      </div>

      {/* Tabs: Active Listings | Rented | Sold | Saved */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: '#e2e8f0',
          padding: '3px',
          borderRadius: '10px',
          marginBottom: '14px'
        }}
      >
        <button
          onClick={() => setActiveTab('active')}
          style={{
            flex: 1,
            padding: '6px 4px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'active' ? '#ffffff' : 'transparent',
            color: activeTab === 'active' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Active ({activeListings.length})
        </button>

        <button
          onClick={() => setActiveTab('rented')}
          style={{
            flex: 1,
            padding: '6px 4px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'rented' ? '#ffffff' : 'transparent',
            color: activeTab === 'rented' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Rented ({rentedListings.length})
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          style={{
            flex: 1,
            padding: '6px 4px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'sold' ? '#ffffff' : 'transparent',
            color: activeTab === 'sold' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Sold ({soldListings.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          style={{
            flex: 1,
            padding: '6px 4px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'saved' ? '#ffffff' : 'transparent',
            color: activeTab === 'saved' ? '#0f172a' : '#64748b',
            fontWeight: 700,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Saved ({savedProperties.length})
        </button>
      </div>

      {/* Property Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeTab === 'saved' ? (
          savedProperties.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <Bookmark size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No saved properties. Browse properties and tap bookmark to save.</p>
            </div>
          ) : (
            savedProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => onSelectProperty?.(prop)}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#ea580c' }}>{prop.price}</div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>{prop.title}</h4>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{prop.location}</div>
                </div>
              </div>
            ))
          )
        ) : (
          (activeTab === 'active' ? activeListings : activeTab === 'rented' ? rentedListings : soldListings).map((p) => (
            <div
              key={p.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
              }}
            >
              <img
                src={p.image}
                alt={p.title}
                style={{ width: '84px', height: '84px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>{p.price}</div>
                    <span style={{ fontSize: '10px', fontWeight: 700, background: p.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: p.status === 'active' ? '#059669' : '#64748b', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                      {p.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </h4>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {p.bhk} • {p.areaSqFt} Sq.Ft • {p.location}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                  <span>{p.enquiries} buyer enquiries</span>
                  <button
                    onClick={() => alert('Manage property options...')}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
