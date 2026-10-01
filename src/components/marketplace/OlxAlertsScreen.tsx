import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  TrendingDown,
  BookmarkCheck,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { MarketplaceProduct } from '../../types/marketplace';

interface OlxAlertItem {
  id: string;
  type: 'enquiry' | 'price_drop' | 'saved_search' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  product?: MarketplaceProduct;
  actionLabel?: string;
}

interface OlxAlertsScreenProps {
  products: MarketplaceProduct[];
  onSelectProduct?: (product: MarketplaceProduct) => void;
  onBackToMain?: () => void;
}

export const OlxAlertsScreen: React.FC<OlxAlertsScreenProps> = ({
  products,
  onSelectProduct,
  onBackToMain
}) => {
  const [filter, setFilter] = useState<'all' | 'enquiry' | 'price_drop' | 'saved_search'>('all');

  const [alerts, setAlerts] = useState<OlxAlertItem[]>([
    {
      id: 'alert-1',
      type: 'enquiry',
      title: 'New Buyer Enquiry',
      message: 'Vikram Mehta sent a message: "Is the price negotiable for the iPhone 15? Can pick up today."',
      timestamp: '15m ago',
      isRead: false,
      product: products[0],
      actionLabel: 'Reply to Buyer'
    },
    {
      id: 'alert-2',
      type: 'price_drop',
      title: 'Price Drop Alert',
      message: 'An item in your saved wishlist "MacBook Pro M2" has dropped by ₹4,000!',
      timestamp: '2h ago',
      isRead: false,
      product: products[1] || products[0],
      actionLabel: 'View Deal'
    },
    {
      id: 'alert-3',
      type: 'saved_search',
      title: 'Saved Search Update',
      message: '3 new items posted matching your search for "Electric Scooter in Mumbai".',
      timestamp: '5h ago',
      isRead: true,
      actionLabel: 'View Results'
    },
    {
      id: 'alert-4',
      type: 'enquiry',
      title: 'Buyer Question',
      message: 'Anita Desai asked about warranty details and original purchase bill.',
      timestamp: 'Yesterday',
      isRead: true,
      product: products[2] || products[0],
      actionLabel: 'Reply'
    },
    {
      id: 'alert-5',
      type: 'system',
      title: 'Seller Profile Verified',
      message: 'Your LocalPlus seller identity has been verified. Your listings now get 3x higher visibility!',
      timestamp: '2 days ago',
      isRead: true
    }
  ]);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  return (
    <div className="olx-alerts-page" style={{ padding: '16px 16px 84px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
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
              title="Back"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={20} color="#ea580c" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              OLX Alerts
            </h2>
          </div>
        </div>

        <button
          onClick={markAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: '#ea580c',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '12px',
          scrollbarWidth: 'none'
        }}
      >
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'all' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'all' ? '#fff7ed' : '#ffffff',
            color: filter === 'all' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Alerts
        </button>

        <button
          onClick={() => setFilter('enquiry')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'enquiry' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'enquiry' ? '#fff7ed' : '#ffffff',
            color: filter === 'enquiry' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Enquiries
        </button>

        <button
          onClick={() => setFilter('price_drop')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'price_drop' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'price_drop' ? '#fff7ed' : '#ffffff',
            color: filter === 'price_drop' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Price Drops
        </button>

        <button
          onClick={() => setFilter('saved_search')}
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            border: filter === 'saved_search' ? '1px solid #ea580c' : '1px solid #e2e8f0',
            background: filter === 'saved_search' ? '#fff7ed' : '#ffffff',
            color: filter === 'saved_search' ? '#ea580c' : '#475569',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Saved Searches
        </button>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAlerts.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '36px 16px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}
          >
            <Bell size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              No alerts found
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              You will be notified when buyers enquire or saved searches have updates.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const iconConfig = {
              enquiry: { icon: <MessageSquare size={16} />, color: '#ea580c', bg: '#fff7ed' },
              price_drop: { icon: <TrendingDown size={16} />, color: '#10b981', bg: '#ecfdf5' },
              saved_search: { icon: <BookmarkCheck size={16} />, color: '#3b82f6', bg: '#eff6ff' },
              system: { icon: <ShieldCheck size={16} />, color: '#8b5cf6', bg: '#f5f3ff' }
            }[alert.type];

            return (
              <div
                key={alert.id}
                onClick={() => {
                  if (alert.product && onSelectProduct) {
                    onSelectProduct(alert.product);
                  }
                }}
                style={{
                  background: alert.isRead ? '#ffffff' : '#fffbf7',
                  border: alert.isRead ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: alert.product ? 'pointer' : 'default',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                }}
              >
                {/* Icon Circle */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: iconConfig.bg,
                    color: iconConfig.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {iconConfig.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {alert.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {alert.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 8px', lineHeight: '1.4' }}>
                    {alert.message}
                  </p>

                  {alert.actionLabel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontSize: '11.5px', fontWeight: 700 }}>
                      <span>{alert.actionLabel}</span>
                      <ChevronRight size={13} />
                    </div>
                  )}
                </div>

                {!alert.isRead && (
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#ea580c',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
