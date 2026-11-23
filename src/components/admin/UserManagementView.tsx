import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Eye,
  Coins,
  Film,
  Shield,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Star,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import type { AdminManagedUser, VideoPost } from '../../types';
import { apiClient } from '../../services/apiClient';
import { PRESET_LOCATIONS } from '../../services/geoService';

interface UserManagementViewProps {
  onRefreshData?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onRefreshData }) => {
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'points' | 'videos' | 'name'>('newest');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [userDetailsData, setUserDetailsData] = useState<{ user: AdminManagedUser; videos: VideoPost[]; copyrightReports: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminManagedUser | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminManagedUser | null>(null);

  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [pointsTargetUser, setPointsTargetUser] = useState<AdminManagedUser | null>(null);
  const [pointsAmount, setPointsAmount] = useState<number>(50);
  const [pointsReason, setPointsReason] = useState('Admin points grant');
  const [isCredit, setIsCredit] = useState(true);

  // Form state for creating user
  const [createForm, setCreateForm] = useState({
    displayName: '',
    handle: '',
    email: '',
    phone: '',
    role: 'creator',
    district: 'Chennai',
    placeName: 'Chennai Central',
    bio: '',
    verified: false,
    initialPoints: 0
  });

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAppUsers();
      setUsers(data);
    } catch (err: any) {
      console.warn('Failed to load users:', err);
      showToast('⚠️ Error loading users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    if (onRefreshData) onRefreshData();
  };

  // View full details of user
  const handleOpenViewDetails = async (user: AdminManagedUser) => {
    setSelectedUser(user);
    setViewDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const data = await apiClient.getAppUserById(user.id);
      if (data) {
        setUserDetailsData(data);
      } else {
        setUserDetailsData({ user, videos: [], copyrightReports: [] });
      }
    } catch {
      setUserDetailsData({ user, videos: [], copyrightReports: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Edit user
  const handleOpenEdit = (user: AdminManagedUser) => {
    setEditingUser({ ...user });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await apiClient.updateAppUser(editingUser.id, editingUser);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
      showToast('✓ User updated successfully!');
      setEditModalOpen(false);
    } catch (err: any) {
      showToast(`⚠️ Update failed: ${err.message}`);
    }
  };

  // Quick 1-click verify toggle
  const handleToggleVerify = async (user: AdminManagedUser) => {
    try {
      const newStatus = await apiClient.toggleUserVerification(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, verified: newStatus } : u)));
      showToast(newStatus ? `✓ @${user.handle} marked as Verified Creator!` : `Unverified @${user.handle}`);
    } catch (err: any) {
      showToast(`⚠️ Failed to toggle verification: ${err.message}`);
    }
  };

  // Quick 1-click toggle suspend / block
  const handleToggleStatus = async (user: AdminManagedUser) => {
    const isCurrentlyBlocked = user.uploadBlocked || user.accountStatus === 'suspended';
    const reason = isCurrentlyBlocked ? '' : 'Violations reported / Restricted by admin';
    try {
      const res = await apiClient.toggleUserStatus(user.id, reason);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                uploadBlocked: res.uploadBlocked,
                accountStatus: res.status as any,
                uploadBlockedReason: reason
              }
            : u
        )
      );
      showToast(
        res.uploadBlocked
          ? `🚫 @${user.handle} has been Suspended!`
          : `✓ @${user.handle} account restored to Active.`
      );
    } catch (err: any) {
      showToast(`⚠️ Status update failed: ${err.message}`);
    }
  };

  // Delete user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiClient.deleteAppUser(userToDelete.id);
      setUsers((prev) => prev.map((u) => u).filter((u) => u.id !== userToDelete.id));
      showToast(`🗑️ User @${userToDelete.handle} deleted successfully`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      showToast(`⚠️ Delete failed: ${err.message}`);
    }
  };

  // Points adjustment
  const handlePointsSubmit = async () => {
    if (!pointsTargetUser) return;
    const finalAmount = isCredit ? Math.abs(pointsAmount) : -Math.abs(pointsAmount);
    try {
      await apiClient.adjustUserPoints(pointsTargetUser.id, finalAmount, pointsReason);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === pointsTargetUser.id) {
            const cur = u.walletBalance || 0;
            return { ...u, walletBalance: Math.max(0, cur + finalAmount) };
          }
          return u;
        })
      );
      showToast(`✓ Points updated: ${finalAmount > 0 ? '+' : ''}${finalAmount} pts to @${pointsTargetUser.handle}`);
      setPointsModalOpen(false);
    } catch (err: any) {
      showToast(`⚠️ Failed to adjust points: ${err.message}`);
    }
  };

  // Create new user submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.displayName || !createForm.handle) {
      showToast('⚠️ Display Name and Handle are required');
      return;
    }
    try {
      const newUser = await apiClient.createAppUser(createForm);
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
        showToast(`✓ User @${newUser.handle} created successfully!`);
        setCreateModalOpen(false);
        setCreateForm({
          displayName: '',
          handle: '',
          email: '',
          phone: '',
          role: 'creator',
          district: 'Chennai',
          placeName: 'Chennai Central',
          bio: '',
          verified: false,
          initialPoints: 0
        });
      }
    } catch (err: any) {
      showToast(`⚠️ Failed to create user: ${err.message}`);
    }
  };

  // Filter & sort logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = u.displayName?.toLowerCase().includes(q);
          const matchHandle = u.handle?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          const matchPhone = u.phone?.includes(q);
          const matchLoc =
            u.homeLocation?.district?.toLowerCase().includes(q) ||
            u.homeLocation?.placeName?.toLowerCase().includes(q);
          if (!matchName && !matchHandle && !matchEmail && !matchPhone && !matchLoc) {
            return false;
          }
        }

        // Role filter
        if (roleFilter !== 'all') {
          if ((u.role || 'user').toLowerCase() !== roleFilter.toLowerCase()) return false;
        }

        // Status filter
        if (statusFilter === 'active') {
          if (u.uploadBlocked || u.accountStatus === 'suspended') return false;
        } else if (statusFilter === 'suspended') {
          if (!u.uploadBlocked && u.accountStatus !== 'suspended') return false;
        }

        // Verified filter
        if (verifiedFilter === 'verified' && !u.verified) return false;
        if (verifiedFilter === 'unverified' && u.verified) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'points') return (b.walletBalance || 0) - (a.walletBalance || 0);
        if (sortBy === 'videos') return (b.videoCount || 0) - (a.videoCount || 0);
        if (sortBy === 'name') return (a.displayName || '').localeCompare(b.displayName || '');
        // newest first (default)
        return (
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      });
  }, [users, searchQuery, roleFilter, statusFilter, verifiedFilter, sortBy]);

  // Summary KPI Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const verifiedCount = users.filter((u) => u.verified).length;
    const activeCount = users.filter((u) => !u.uploadBlocked && u.accountStatus !== 'suspended').length;
    const suspendedCount = users.filter((u) => u.uploadBlocked || u.accountStatus === 'suspended').length;
    const totalPoints = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
    return { total, verifiedCount, activeCount, suspendedCount, totalPoints };
  }, [users]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 1. Header & Summary KPI Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={22} color="#ea580c" />
            <span>User & Creator Management</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Manage registered citizen journalists, verified field reporters, creator points & accounts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
            }}
          >
            <UserPlus size={16} />
            <span>+ Add New User</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}
      >
        {/* Total Users */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>TOTAL USERS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Users size={17} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Registered platform accounts</div>
        </div>

        {/* Verified Creators */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>VERIFIED CREATORS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>{stats.verifiedCount}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Field reporters with blue badge</div>
        </div>

        {/* Active Accounts */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>ACTIVE STATUS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <Shield size={17} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{stats.activeCount}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Unrestricted uploading accounts</div>
        </div>

        {/* Suspended Accounts */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>SUSPENDED / BLOCKED</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <ShieldAlert size={17} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: stats.suspendedCount > 0 ? '#dc2626' : '#64748b' }}>
            {stats.suspendedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Accounts restricted by admin</div>
        </div>

        {/* Creator Points in Circulation */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>POINTS IN WALLETS</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Coins size={17} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{stats.totalPoints.toLocaleString()} Pts</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Active creator points</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Search Input */}
          <div
            style={{
              flex: '1 1 280px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search user by Name, @handle, Email, Phone, District..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Sort: Newest Joined</option>
              <option value="points">Sort: Highest Points</option>
              <option value="videos">Sort: Most Video Reports</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '6px',
            borderTop: '1px solid #f1f5f9'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            Filter Role:
          </span>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'creator', label: 'Creators' },
            { id: 'user', label: 'Citizens' },
            { id: 'admin', label: 'Admins' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: roleFilter === r.id ? 'none' : '1px solid #e2e8f0',
                background: roleFilter === r.id ? '#ea580c' : '#f8fafc',
                color: roleFilter === r.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {r.label}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 4px 0 12px' }}>
            Status:
          </span>
          {[
            { id: 'all', label: 'All Status' },
            { id: 'active', label: 'Active Only' },
            { id: 'suspended', label: 'Suspended Only' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: statusFilter === s.id ? 'none' : '1px solid #e2e8f0',
                background: statusFilter === s.id ? (s.id === 'suspended' ? '#dc2626' : '#16a34a') : '#f8fafc',
                color: statusFilter === s.id ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 4px 0 12px' }}>
            Badge:
          </span>
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'verified', label: 'Verified Badge Only' },
            { id: 'unverified', label: 'Unverified' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setVerifiedFilter(v.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: verifiedFilter === v.id ? 'none' : '1px solid #e2e8f0',
                background: verifiedFilter === v.id ? '#2563eb' : '#f8fafc',
                color: verifiedFilter === v.id ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Users Table & Directory */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>
            User Directory ({filteredUsers.length} Users Found)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', color: '#ea580c' }} />
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Loading Users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <Users size={32} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              No users matching criteria
            </div>
            <p style={{ fontSize: '13px', margin: 0 }}>Try clearing search keywords or filter pills.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>USER / PROFILE</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>VERIFIED BADGE</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>ROLE</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>LOCATION</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>CONTACT</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>ACTIVITY & POINTS</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isBlocked = user.uploadBlocked || user.accountStatus === 'suspended';
                  const locText =
                    user.homeLocation?.district ||
                    user.homeLocation?.placeName ||
                    'Chennai';
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fcfdfe')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* User Profile */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`}
                            alt=""
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: user.verified ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                {user.displayName || 'Anonymous User'}
                              </span>
                              {user.verified && (
                                <CheckCircle2 size={14} color="#2563eb" fill="#2563eb" style={{ color: '#ffffff' }} />
                              )}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                              @{user.handle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Verified Badge Column */}
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleVerify(user)}
                          title="Click to toggle Verified Badge on/off"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: user.verified ? '#eff6ff' : '#f1f5f9',
                            color: user.verified ? '#2563eb' : '#64748b'
                          }}
                        >
                          {user.verified ? (
                            <>
                              <CheckCircle2 size={12} color="#2563eb" />
                              <span>Verified Creator</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} color="#94a3b8" />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background:
                              user.role === 'admin'
                                ? '#f3e8ff'
                                : user.role === 'creator'
                                ? '#fff7ed'
                                : '#f0fdf4',
                            color:
                              user.role === 'admin'
                                ? '#7e22ce'
                                : user.role === 'creator'
                                ? '#ea580c'
                                : '#15803d'
                          }}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                          <MapPin size={13} color="#ea580c" />
                          <span>{locText}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11.5px', color: '#334155' }}>
                            {user.email || '—'}
                          </span>
                          {user.phone && (
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Activity & Points */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Film size={13} color="#64748b" />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                              {user.videoCount || 0}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>reels</span>
                          </div>
                          <div
                            onClick={() => {
                              setPointsTargetUser(user);
                              setPointsModalOpen(true);
                            }}
                            title="Click to adjust Creator Points"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              background: '#fffbeb',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            <Coins size={13} color="#d97706" />
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#d97706' }}>
                              {user.walletBalance || 0}
                            </span>
                            <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 700 }}>Pts</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isBlocked ? '#fef2f2' : '#f0fdf4',
                            color: isBlocked ? '#dc2626' : '#16a34a'
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isBlocked ? '#dc2626' : '#16a34a'
                            }}
                          />
                          {isBlocked ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View details */}
                          <button
                            onClick={() => handleOpenViewDetails(user)}
                            title="View Full Profile & Reels"
                            style={{
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '8px',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#334155'
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User Details"
                            style={{
                              background: '#eff6ff',
                              border: 'none',
                              borderRadius: '8px',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#2563eb'
                            }}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Suspend / Activate toggle */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={isBlocked ? 'Activate User' : 'Suspend User'}
                            style={{
                              background: isBlocked ? '#f0fdf4' : '#fff7ed',
                              border: 'none',
                              borderRadius: '8px',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: isBlocked ? '#16a34a' : '#ea580c'
                            }}
                          >
                            {isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete User"
                            style={{
                              background: '#fef2f2',
                              border: 'none',
                              borderRadius: '8px',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW FULL DETAILS & ACTIVITY                    */}
      {/* ======================================================== */}
      {viewDetailsModalOpen && selectedUser && (
        <div className="bottom-sheet-backdrop" onClick={() => setViewDetailsModalOpen(false)} style={{ zIndex: 120 }}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '680px',
              width: '100%',
              margin: 'auto',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.handle}`}
                  alt=""
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ea580c' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      {selectedUser.displayName}
                    </h3>
                    {selectedUser.verified && (
                      <CheckCircle2 size={16} color="#2563eb" fill="#2563eb" style={{ color: '#fff' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>@{selectedUser.handle}</span>
                </div>
              </div>

              <button
                onClick={() => setViewDetailsModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Badges & Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ROLE & TIER</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                  {selectedUser.role} ({selectedUser.creatorTier || 'bronze'})
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>HOME DISTRICT</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ea580c' }}>
                  📍 {selectedUser.homeLocation?.district || selectedUser.homeLocation?.placeName || 'Chennai'}
                </div>
              </div>

              <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700 }}>WALLET POINTS</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#b45309' }}>
                  🪙 {selectedUser.walletBalance || 0} Pts
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div style={{ background: '#f1f5f9', padding: '12px 14px', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', color: '#334155' }}>
                <strong>Bio:</strong> {selectedUser.bio}
              </div>
            )}

            {/* Uploaded Videos Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Uploaded Reels & Ground Reports ({userDetailsData?.videos?.length || 0})
              </h4>

              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  <RefreshCw size={18} className="spin" />
                </div>
              ) : userDetailsData?.videos && userDetailsData.videos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {userDetailsData.videos.map((vid) => (
                    <div
                      key={vid.id}
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        background: '#000',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={vid.thumbnailUrl}
                        alt=""
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '6px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                          color: '#fff'
                        }}
                      >
                        <div style={{ fontSize: '10.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {vid.headline}
                        </div>
                        <div style={{ fontSize: '9px', color: '#f97316' }}>
                          👀 {vid.viewCount} views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                  No video reports uploaded yet.
                </div>
              )}
            </div>

            {/* Quick Actions in modal */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                onClick={() => {
                  setViewDetailsModalOpen(false);
                  handleOpenEdit(selectedUser);
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER DETAILS                               */}
      {/* ======================================================== */}
      {editModalOpen && editingUser && (
        <div className="bottom-sheet-backdrop" onClick={() => setEditModalOpen(false)} style={{ zIndex: 120 }}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              margin: 'auto',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                ✏️ Edit User: {editingUser.displayName} (@{editingUser.handle})
              </h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Display Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Handle */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Handle / Username
                </label>
                <input
                  type="text"
                  value={editingUser.handle || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, handle: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              {/* Role & District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Platform Role
                  </label>
                  <select
                    value={editingUser.role || 'creator'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                  >
                    <option value="creator">Creator (News Videos & Reels)</option>
                    <option value="user">Citizen / Viewer</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Home District
                  </label>
                  <select
                    value={editingUser.homeLocation?.district || 'Chennai'}
                    onChange={(e) => {
                      const dist = e.target.value;
                      const preset = PRESET_LOCATIONS.find((l) => l.district === dist) || PRESET_LOCATIONS[0];
                      setEditingUser({
                        ...editingUser,
                        homeLocation: {
                          ...editingUser.homeLocation,
                          district: dist,
                          placeName: preset.placeName,
                          lat: preset.lat,
                          lng: preset.lng
                        }
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Tiruvallur">Tiruvallur</option>
                    <option value="Kanchipuram">Kanchipuram</option>
                    <option value="Chengalpattu">Chengalpattu</option>
                    <option value="Vellore">Vellore</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Biography / Credential Info
                </label>
                <textarea
                  rows={2}
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* Verified Creator Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#eff6ff',
                  borderRadius: '12px',
                  border: '1px solid #bfdbfe'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#2563eb" />
                    <span>Verified Creator Badge</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#60a5fa' }}>
                    Grants official verification checkmark next to creator profile
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(editingUser.verified)}
                  onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
              </div>

              {/* Account Suspension & Upload Block */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  background: editingUser.uploadBlocked ? '#fef2f2' : '#f8fafc',
                  borderRadius: '12px',
                  border: editingUser.uploadBlocked ? '1px solid #fecaca' : '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: editingUser.uploadBlocked ? '#dc2626' : '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={15} color={editingUser.uploadBlocked ? '#dc2626' : '#64748b'} />
                      <span>Suspend User / Block Video Uploads</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Prevents user from publishing video reels and claiming rewards
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(editingUser.uploadBlocked)}
                    onChange={(e) => setEditingUser({ ...editingUser, uploadBlocked: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#dc2626' }}
                  />
                </div>

                {editingUser.uploadBlocked && (
                  <input
                    type="text"
                    placeholder="Reason for suspension (visible to admin)"
                    value={editingUser.uploadBlockedReason || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, uploadBlockedReason: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '12px', background: '#fff' }}
                  />
                )}
              </div>
            </div>

            {/* Modal Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE NEW USER                                 */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="bottom-sheet-backdrop" onClick={() => setCreateModalOpen(false)} style={{ zIndex: 120 }}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '540px',
              width: '100%',
              margin: 'auto',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                <UserPlus size={18} style={{ display: 'inline', marginRight: '6px', color: '#ea580c' }} />
                Add New User / Field Reporter
              </h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Full Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Username / Handle * (without @)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ramesh_reports"
                  value={createForm.handle}
                  onChange={(e) => setCreateForm({ ...createForm, handle: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="reporter@gmail.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Role
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                  >
                    <option value="creator">Creator (Video Reports & Reels)</option>
                    <option value="user">Citizen / User</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    District Assignment
                  </label>
                  <select
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff' }}
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Tiruvallur">Tiruvallur</option>
                    <option value="Kanchipuram">Kanchipuram</option>
                    <option value="Chengalpattu">Chengalpattu</option>
                    <option value="Vellore">Vellore</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Initial Points Grant
                  </label>
                  <input
                    type="number"
                    value={createForm.initialPoints}
                    onChange={(e) => setCreateForm({ ...createForm, initialPoints: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                  <input
                    type="checkbox"
                    id="new_verified"
                    checked={createForm.verified}
                    onChange={(e) => setCreateForm({ ...createForm, verified: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <label htmlFor="new_verified" style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e40af', cursor: 'pointer' }}>
                    Verified Creator Badge
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Bio / Reporting Beats
                </label>
                <input
                  type="text"
                  placeholder="e.g. Civic and traffic reporter for Tiruvallur district"
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: POINTS ADJUSTMENT MODAL                         */}
      {/* ======================================================== */}
      {pointsModalOpen && pointsTargetUser && (
        <div className="bottom-sheet-backdrop" onClick={() => setPointsModalOpen(false)} style={{ zIndex: 120 }}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              margin: 'auto',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} color="#d97706" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Adjust Creator Points
                </h3>
              </div>
              <button onClick={() => setPointsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Target User: <strong>@{pointsTargetUser.handle}</strong> ({pointsTargetUser.displayName})<br />
              Current Balance: <strong style={{ color: '#d97706' }}>{pointsTargetUser.walletBalance || 0} Points</strong>
            </div>

            {/* Type toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setIsCredit(true)}
                style={{
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isCredit ? '#16a34a' : '#f1f5f9',
                  color: isCredit ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Credit Points
              </button>
              <button
                type="button"
                onClick={() => setIsCredit(false)}
                style={{
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: !isCredit ? '#dc2626' : '#f1f5f9',
                  color: !isCredit ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                - Deduct Points
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Points Amount
              </label>
              <input
                type="number"
                min="1"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(Number(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700 }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Reason / Note
              </label>
              <input
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPointsModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handlePointsSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isCredit ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isCredit ? 'Credit Points' : 'Deduct Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: DELETE USER CONFIRMATION                        */}
      {/* ======================================================== */}
      {deleteModalOpen && userToDelete && (
        <div className="bottom-sheet-backdrop" onClick={() => setDeleteModalOpen(false)} style={{ zIndex: 120 }}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              margin: 'auto',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Delete User Account?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{userToDelete.displayName}</strong> (@{userToDelete.handle})?
              This action will remove their account and associated wallet balance.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
