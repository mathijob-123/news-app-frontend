import React, { useState } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Layers,
  MapPin,
  Bell,
  Megaphone,
  Share2,
  Key,
  Users,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  Database
} from 'lucide-react';
import type {
  AppSettings,
  AdminUser,
  AdminRoleType,
  NewsCategorySetting
} from '../../types';

interface AppSettingsManagerProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => Promise<void> | void;
  onSaveAdminUser: (user: Partial<AdminUser>) => Promise<void> | void;
  onDeleteAdminUser: (userId: string) => Promise<void> | void;
  onSwitchSimulatedRole?: (role: AdminRoleType) => void;
  currentSimulatedRole?: AdminRoleType;
}

type SettingsSection =
  | 'branding'
  | 'categories'
  | 'locations'
  | 'notifications'
  | 'advertisements'
  | 'socialImport'
  | 'api'
  | 'adminUsers';

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({
  settings,
  onSaveSettings,
  onSaveAdminUser,
  onDeleteAdminUser,
  onSwitchSimulatedRole,
  currentSimulatedRole = 'super_admin'
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('branding');
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Category State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatKey, setNewCatKey] = useState('');
  const [newCatTamil, setNewCatTamil] = useState('');
  const [newCatEnglish, setNewCatEnglish] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ea580c');

  // New Admin User State
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRoleType>('editor');

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveSettings(currentSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = () => {
    if (!newCatKey.trim() || !newCatTamil.trim()) return;
    const newCategory: NewsCategorySetting = {
      id: `cat_${Date.now()}`,
      key: newCatKey.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      nameTamil: newCatTamil.trim(),
      nameEnglish: newCatEnglish.trim() || newCatKey.trim(),
      icon: 'Compass',
      color: newCatColor,
      enabled: true,
      sortOrder: currentSettings.categories.length + 1
    };

    const updated = {
      ...currentSettings,
      categories: [...currentSettings.categories, newCategory]
    };
    setCurrentSettings(updated);
    onSaveSettings(updated);
    setNewCatKey('');
    setNewCatTamil('');
    setNewCatEnglish('');
    setShowAddCategory(false);
  };

  const handleToggleCategory = (catId: string) => {
    const updatedCategories = currentSettings.categories.map((c) =>
      c.id === catId ? { ...c, enabled: !c.enabled } : c
    );
    const updated = { ...currentSettings, categories: updatedCategories };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    const updatedCategories = currentSettings.categories.filter((c) => c.id !== catId);
    const updated = { ...currentSettings, categories: updatedCategories };
    setCurrentSettings(updated);
    onSaveSettings(updated);
  };

  // Admin User Handlers
  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    await onSaveAdminUser({
      name: newAdminName.trim(),
      email: newAdminEmail.trim().toLowerCase(),
      role: newAdminRole,
      status: 'active'
    });

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminRole('editor');
    setShowAddAdmin(false);
  };

  const handleToggleAdminStatus = async (user: AdminUser) => {
    await onSaveAdminUser({
      id: user.id,
      status: user.status === 'active' ? 'inactive' : 'active'
    });
  };

  const handleChangeAdminRole = async (userId: string, newRole: AdminRoleType) => {
    await onSaveAdminUser({ id: userId, role: newRole });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header with Save Action */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid rgba(249, 115, 22, 0.3)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Settings size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              App Settings & Admin Permissions (செயலி அமைப்புகள்)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Configure app branding, categories, location zones, push alerts, ad rules, social feeds, and admin roles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saveSuccess && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#4ade80',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={15} />
              <span>Settings Saved!</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)'
            }}
          >
            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Pills / Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'rgba(30, 41, 59, 0.4)',
          padding: '8px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {[
          { key: 'branding', label: 'App Name & Logo', icon: ImageIcon },
          { key: 'categories', label: 'News Categories', icon: Layers },
          { key: 'locations', label: 'Location Settings', icon: MapPin },
          { key: 'notifications', label: 'Notification Settings', icon: Bell },
          { key: 'advertisements', label: 'Advertisement Settings', icon: Megaphone },
          { key: 'socialImport', label: 'Social Content Import', icon: Share2 },
          { key: 'api', label: 'API Settings', icon: Key },
          { key: 'adminUsers', label: 'Admin Users & Permissions', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as SettingsSection)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isSelected ? '#ea580c' : 'transparent',
                background: isSelected ? 'rgba(234, 88, 12, 0.2)' : 'transparent',
                color: isSelected ? '#fb923c' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={15} color={isSelected ? '#ea580c' : '#94a3b8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px'
        }}
      >
        {/* =========================================
            SECTION 1: APP NAME & LOGO
        ========================================= */}
        {activeSection === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              App Name & Branding (செயலி பெயர் மற்றும் சின்னம்)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Application Name (செயலி பெயர்)
                </label>
                <input
                  type="text"
                  value={currentSettings.branding.appName}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      branding: { ...currentSettings.branding, appName: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Tagline (முழக்க வரி)
                </label>
                <input
                  type="text"
                  value={currentSettings.branding.tagline}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      branding: { ...currentSettings.branding, tagline: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Logo URL (லோகோ படம்)
                </label>
                <input
                  type="text"
                  value={currentSettings.branding.logoUrl}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      branding: { ...currentSettings.branding, logoUrl: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Primary Brand Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={currentSettings.branding.primaryColor}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        branding: { ...currentSettings.branding, primaryColor: e.target.value }
                      })
                    }
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                  />
                  <input
                    type="text"
                    value={currentSettings.branding.primaryColor}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        branding: { ...currentSettings.branding, primaryColor: e.target.value }
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={currentSettings.branding.supportEmail}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      branding: { ...currentSettings.branding, supportEmail: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Support Contact Phone
                </label>
                <input
                  type="text"
                  value={currentSettings.branding.supportPhone}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      branding: { ...currentSettings.branding, supportPhone: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 2: NEWS CATEGORIES
        ========================================= */}
        {activeSection === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                  News Categories (செய்திப் பிரிவுகள்)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Manage categories visible in the Home Feed header and reporting tags.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(234, 88, 12, 0.2)',
                  border: '1px solid rgba(234, 88, 12, 0.4)',
                  color: '#fb923c',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                <span>Add Category</span>
              </button>
            </div>

            {/* Add Category Drawer */}
            {showAddCategory && (
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(234, 88, 12, 0.4)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  alignItems: 'end'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Key (Slug)
                  </label>
                  <input
                    type="text"
                    value={newCatKey}
                    onChange={(e) => setNewCatKey(e.target.value)}
                    placeholder="e.g. politics, education"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Tamil Name (தமிழ் பெயர்)
                  </label>
                  <input
                    type="text"
                    value={newCatTamil}
                    onChange={(e) => setNewCatTamil(e.target.value)}
                    placeholder="எ.கா: அரசியல், கல்வி"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    English Name
                  </label>
                  <input
                    type="text"
                    value={newCatEnglish}
                    onChange={(e) => setNewCatEnglish(e.target.value)}
                    placeholder="e.g. Politics, Education"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save Category
                  </button>
                </div>
              </div>
            )}

            {/* Categories Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentSettings.categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: cat.color || '#ea580c'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {cat.nameTamil} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({cat.nameEnglish})</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>key: {cat.key}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: cat.enabled ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                        background: cat.enabled ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        color: cat.enabled ? '#4ade80' : '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {cat.key !== 'all' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#f87171',
                          padding: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 3: LOCATION SETTINGS
        ========================================= */}
        {activeSection === 'locations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              Location Settings (அமைவிட அமைப்புகள்)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Coverage zones across Tamil Nadu districts, default center point, and radius limits.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Default Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={currentSettings.locations.defaultLat}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      locations: { ...currentSettings.locations, defaultLat: parseFloat(e.target.value) || 13.0827 }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Default Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={currentSettings.locations.defaultLng}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      locations: { ...currentSettings.locations, defaultLng: parseFloat(e.target.value) || 80.2707 }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Default Radius Filter (km)
                </label>
                <input
                  type="number"
                  value={currentSettings.locations.defaultRadiusKm}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      locations: { ...currentSettings.locations, defaultRadiusKm: parseInt(e.target.value) || 25 }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Configured Districts & Taluks Hierarchy */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>
                Configured Districts & Coverage Hierarchy
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {currentSettings.locations.districts.map((dist) => (
                  <div
                    key={dist.name}
                    style={{
                      background: '#0f172a',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MapPin size={14} color="#ea580c" />
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                        {dist.name} District
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {dist.taluks.map((t) => (
                        <span
                          key={t.name}
                          style={{
                            fontSize: '10px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: '#94a3b8'
                          }}
                        >
                          {t.name} ({t.areas.length} areas)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 4: NOTIFICATION SETTINGS
        ========================================= */}
        {activeSection === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              Notification Settings (அறிவிப்பு அமைப்புகள்)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'pushAlertsEnabled', label: 'Push Alerts Master Switch', desc: 'Enable browser and mobile push alerts' },
                { key: 'breakingNewsAlerts', label: 'Breaking News Alerts', desc: 'Auto-broadcast instant notifications when admin flags breaking news' },
                { key: 'reportApprovalAlerts', label: 'Citizen Report Approval Alerts', desc: 'Notify reporters when their dispatches are verified & paid' },
                { key: 'payoutAlerts', label: 'Payout Disbursement Alerts', desc: 'Notify creators when bank transfer/UPI payout clears' },
                { key: 'soundEnabled', label: 'Alert Audio Chime', desc: 'Play notification sound on citizen dispatches' }
              ].map((item) => {
                const isChecked = Boolean((currentSettings.notifications as any)[item.key]);
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {item.desc}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentSettings({
                          ...currentSettings,
                          notifications: {
                            ...currentSettings.notifications,
                            [item.key]: !isChecked
                          }
                        })
                      }
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isChecked ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                        background: isChecked ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                        color: isChecked ? '#4ade80' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isChecked ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 5: ADVERTISEMENT SETTINGS
        ========================================= */}
        {activeSection === 'advertisements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              Advertisement Settings (விளம்பர அமைப்புகள்)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    Global Ads Switch
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Enable/disable commercial ad insertions
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentSettings({
                      ...currentSettings,
                      advertisements: {
                        ...currentSettings.advertisements,
                        globalAdsEnabled: !currentSettings.advertisements.globalAdsEnabled
                      }
                    })
                  }
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentSettings.advertisements.globalAdsEnabled ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                    background: currentSettings.advertisements.globalAdsEnabled ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                    color: currentSettings.advertisements.globalAdsEnabled ? '#4ade80' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {currentSettings.advertisements.globalAdsEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Sponsored Badge Label Text
                </label>
                <input
                  type="text"
                  value={currentSettings.advertisements.sponsoredBadgeText}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      advertisements: { ...currentSettings.advertisements, sponsoredBadgeText: e.target.value }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Max Ads Per Viewer Session
                </label>
                <input
                  type="number"
                  value={currentSettings.advertisements.maxAdsPerSession}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      advertisements: { ...currentSettings.advertisements, maxAdsPerSession: parseInt(e.target.value) || 8 }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    Spots (Reels) Ad Interstitials
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Show sponsored videos in vertical reels
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentSettings({
                      ...currentSettings,
                      advertisements: {
                        ...currentSettings.advertisements,
                        enableVideoInterstitialInSpots: !currentSettings.advertisements.enableVideoInterstitialInSpots
                      }
                    })
                  }
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentSettings.advertisements.enableVideoInterstitialInSpots ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                    background: currentSettings.advertisements.enableVideoInterstitialInSpots ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                    color: currentSettings.advertisements.enableVideoInterstitialInSpots ? '#4ade80' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {currentSettings.advertisements.enableVideoInterstitialInSpots ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 6: SOCIAL MEDIA CONTENT IMPORT
        ========================================= */}
        {activeSection === 'socialImport' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              Social Media Content Import Settings (சமூக வலைத்தள செய்தி இறக்குமதி)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Configure automatic feed channels and handles for YouTube, Twitter/X, Instagram, and RSS feeds.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  YouTube Channels (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentSettings.socialImport.youtubeChannels.join(', ')}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      socialImport: {
                        ...currentSettings.socialImport,
                        youtubeChannels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Twitter / X Handles (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentSettings.socialImport.twitterHandles.join(', ')}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      socialImport: {
                        ...currentSettings.socialImport,
                        twitterHandles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Instagram Pages (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentSettings.socialImport.instagramPages.join(', ')}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      socialImport: {
                        ...currentSettings.socialImport,
                        instagramPages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  RSS Feed URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentSettings.socialImport.rssFeeds.join(', ')}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      socialImport: {
                        ...currentSettings.socialImport,
                        rssFeeds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      }
                    })
                  }
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 7: API SETTINGS
        ========================================= */}
        {activeSection === 'api' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
              API Settings & Integration Health (API அமைப்புகள்)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Cloudflare R2 */}
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Cloudflare R2 Media Bucket</span>
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800 }}>CONNECTED</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Bucket: <code style={{ color: '#fb923c' }}>spotlight-media</code><br />
                  Public CDN: <code style={{ color: '#38bdf8' }}>pub-5051362230a34232ba4afb2cf7ac345c.r2.dev</code>
                </div>
              </div>

              {/* Supabase PostgreSQL */}
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Supabase PostgreSQL</span>
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800 }}>CONFIGURED</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Region: <code style={{ color: '#fb923c' }}>ap-southeast-1</code><br />
                  Pooling: <code style={{ color: '#38bdf8' }}>Connection Pooler (Port 5432)</code>
                </div>
              </div>

              {/* Google OAuth */}
              <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>Google OAuth 2.0 Client</span>
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800 }}>READY</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                  Client ID: <code style={{ color: '#fb923c' }}>457891409432...googleusercontent.com</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            SECTION 8: ADMIN USERS & PERMISSIONS (RBAC)
        ========================================= */}
        {activeSection === 'adminUsers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                  Admin Users & Permissions (நிர்வாகப் பொறுப்புகள் & அனுமதிகள்)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Role-based access control across Super Admin, Editor, Moderator, and Ad Manager.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAdmin(!showAddAdmin)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>Add Admin User</span>
              </button>
            </div>

            {/* Role Permissions Matrix Table (Requirement Specification) */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fdba74' }}>
                  Official Roles & Permissions Matrix (அனுமதி அட்டவணை):
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255, 255, 255, 0.05)' }}>
                {[
                  { role: 'Super Admin', access: 'Full access (அனைத்து அணுகல்)', desc: 'News approval, Delete Videos & Feeds, Treasury Payouts, Advertisements, Analytics, Settings, Admin management', color: '#ea580c' },
                  { role: 'Editor', access: 'News create / edit / publish / delete', desc: 'Create editorial stories, calibrate geotag/RPM, publish and delete news videos & feeds', color: '#38bdf8' },
                  { role: 'Moderator', access: 'Review / approve & delete content', desc: 'Review citizen dispatches, approve/reject reports, and delete inappropriate videos & feeds', color: '#a855f7' },
                  { role: 'Ad Manager', access: 'Advertisements மட்டும்', desc: 'Commercial campaigns, ad creation, targeting, scheduling, and ad analytics only (No feed deletion)', color: '#22c55e' }
                ].map((item) => (
                  <div key={item.role} style={{ background: '#0f172a', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>{item.role}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>
                      {item.access}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Switcher / Simulator for testing */}
            {onSwitchSimulatedRole && (
              <div
                style={{
                  background: 'rgba(234, 88, 12, 0.1)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} color="#ea580c" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>
                    Admin View Simulator (பார்வை உருவகப்படுத்துதல்):
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { role: 'super_admin' as AdminRoleType, label: 'Super Admin' },
                    { role: 'editor' as AdminRoleType, label: 'Editor' },
                    { role: 'moderator' as AdminRoleType, label: 'Moderator' },
                    { role: 'ad_manager' as AdminRoleType, label: 'Ad Manager (Ads Only)' }
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => onSwitchSimulatedRole(r.role)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: currentSimulatedRole === r.role ? '#ea580c' : 'rgba(255, 255, 255, 0.15)',
                        background: currentSimulatedRole === r.role ? '#ea580c' : 'rgba(0, 0, 0, 0.3)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Admin Form Drawer */}
            {showAddAdmin && (
              <form
                onSubmit={handleCreateAdminUser}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(234, 88, 12, 0.4)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  alignItems: 'end'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. ramesh@spotlight.local"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    Role (பொறுப்பு)
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRoleType)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px' }}
                  >
                    <option value="super_admin">Super Admin (Full access)</option>
                    <option value="editor">Editor (News create/edit/publish)</option>
                    <option value="moderator">Moderator (Review/approve content)</option>
                    <option value="ad_manager">Ad Manager (Advertisements மட்டும்)</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Add Admin
                  </button>
                </div>
              </form>
            )}

            {/* Admin Users Directory List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentSettings.adminUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ea580c',
                        fontWeight: 800,
                        fontSize: '14px'
                      }}
                    >
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Role Selector & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeAdminRole(user.id, e.target.value as AdminRoleType)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fb923c',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="editor">Editor</option>
                      <option value="moderator">Moderator</option>
                      <option value="ad_manager">Ad Manager</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleToggleAdminStatus(user)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: user.status === 'active' ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                        background: user.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        color: user.status === 'active' ? '#4ade80' : '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteAdminUser(user.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#f87171',
                        padding: '6px',
                        cursor: 'pointer'
                      }}
                      title="Delete Admin"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
