import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Info,
  Clock,
  CheckCheck,
  ExternalLink,
  Ban
} from 'lucide-react';
import type { AppNotification } from '../../types';
import { apiClient } from '../../services/apiClient';
import { getStoredNotifications, saveStoredNotifications } from '../../services/storageService';

interface NotificationModalProps {
  onClose: () => void;
  userId?: string;
  onRefreshUser?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  onClose,
  userId = 'usr_tn_001',
  onRefreshUser
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [filter, setFilter] = useState<'all' | 'strikes' | 'unread'>('all');

  useEffect(() => {
    apiClient.getNotifications(userId).then((serverNotifs) => {
      if (serverNotifs && serverNotifs.length > 0) {
        setNotifications(serverNotifs);
        saveStoredNotifications(serverNotifs);
      }
    }).catch(() => {});
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
    try {
      await apiClient.markNotificationRead(id);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
    try {
      await apiClient.markAllNotificationsRead(userId);
    } catch {}
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'strikes') return n.type === 'copyright_strike' || n.type === 'upload_blocked';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 2200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                Notifications & Bureau Alerts
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                <span>Mark Read</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            gap: '8px'
          }}
        >
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'strikes', label: 'Copyright & Strikes' },
            { id: 'unread', label: `Unread (${unreadCount})` }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: filter === f.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: filter === f.id ? '#0f172a' : '#ffffff',
                color: filter === f.id ? '#ffffff' : '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List of Notifications */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>No Notifications</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                You have no pending alerts or violation notices.
              </div>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isStrike = notif.type === 'copyright_strike' || notif.type === 'upload_blocked';
              const isBlocked = notif.type === 'upload_blocked';

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  style={{
                    background: notif.read ? '#ffffff' : isBlocked ? '#fef2f2' : isStrike ? '#fff7ed' : '#f0fdf4',
                    border: `1.5px solid ${
                      isBlocked
                        ? '#fecaca'
                        : isStrike
                        ? '#fed7aa'
                        : notif.read
                        ? '#e2e8f0'
                        : '#bbf7d0'
                    }`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: notif.read ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isBlocked
                          ? '#dc2626'
                          : isStrike
                          ? '#ea580c'
                          : '#10b981',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {isBlocked ? (
                        <Ban size={16} />
                      ) : isStrike ? (
                        <ShieldAlert size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: isBlocked ? '#991b1b' : isStrike ? '#c2410c' : '#0f172a'
                          }}
                        >
                          {notif.title}
                        </div>
                        {!notif.read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              flexShrink: 0
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#475569',
                          lineHeight: 1.45,
                          marginTop: '4px'
                        }}
                      >
                        {notif.message}
                      </div>

                      {notif.metadata?.expiresAt && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} />
                          <span>Strike expires on: {new Date(notif.metadata.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} (90 days)</span>
                        </div>
                      )}

                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
