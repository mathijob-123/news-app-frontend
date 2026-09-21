import React, { useState, useEffect } from 'react';
import { AdminAuth } from './AdminAuth';
import { AdminPanel } from './AdminPanel';
import type { VideoPost } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AdminPageProps {
  posts: VideoPost[];
  onRefreshData: () => void;
  onNavigateHome: () => void;
}

const ADMIN_SESSION_KEY = 'lp_admin_session_v1';

export const AdminPage: React.FC<AdminPageProps> = ({
  posts,
  onRefreshData,
  onNavigateHome
}) => {
  const { user: authUser, isAdmin, logout } = useAuth();

  const [adminUser, setAdminUser] = useState<{ id: string; name: string; role: string } | null>(() => {
    if (authUser && isAdmin) {
      return { id: authUser.id, name: authUser.displayName, role: 'SuperAdmin' };
    }
    try {
      const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (authUser && isAdmin) {
      setAdminUser({ id: authUser.id, name: authUser.displayName, role: 'SuperAdmin' });
    }
  }, [authUser, isAdmin]);

  useEffect(() => {
    onRefreshData();
  }, []);

  const handleLoginSuccess = (user: { id: string; name: string; role: string }) => {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save admin session', e);
    }
    setAdminUser(user);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
    setAdminUser(null);
    logout();
    onNavigateHome();
  };

  if (!adminUser) {
    return (
      <AdminAuth
        onLoginSuccess={handleLoginSuccess}
        onReturnHome={onNavigateHome}
      />
    );
  }

  return (
    <AdminPanel
      posts={posts}
      onClose={onNavigateHome}
      onRefreshData={onRefreshData}
      onLogout={handleLogout}
      adminUser={adminUser}
    />
  );
};
