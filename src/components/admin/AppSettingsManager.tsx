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
  Shield,
  RefreshCw
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

    const updatedCategories = [...currentSettings.categories, newCategory];
    const updated = { ...currentSettings, categories: updatedCategories };
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
          gap: '16px',
          background: '#0f172a',
          padding: '22px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Settings size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              App Settings & Admin Permissions (செயலி அமைப்புகள்)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Configure app branding, categories, location zones, push alerts, ad rules, social feeds, and admin roles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <CheckCircle2 size={16} />
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
              padding: '11px 22px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
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
          background: '#ffffff',
          padding: '10px 12px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isSelected ? '#ea580c' : '#e2e8f0',
                background: isSelected ? '#ea580c' : '#f8fafc',
                color: isSelected ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={15} color={isSelected ? '#ffffff' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        {/* =========================================
            SECTION 1: APP NAME & LOGO
        ========================================= */}
        {activeSection === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                App Name & Branding (செயலி பெயர் மற்றும் சின்னம்)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Customize application title, slogans, official brand color and contact channels.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                      border: '1px solid #cbd5e1',
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
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  News Categories (செய்திப் பிரிவுகள்)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
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
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>Add Category</span>
              </button>
            </div>

            {/* Add Category Drawer */}
            {showAddCategory && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  alignItems: 'end'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Key (Slug)
                  </label>
                  <input
                    type="text"
                    value={newCatKey}
                    onChange={(e) => setNewCatKey(e.target.value)}
                    placeholder="e.g. politics, education"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Tamil Name (தமிழ் பெயர்)
                  </label>
                  <input
                    type="text"
                    value={newCatTamil}
                    onChange={(e) => setNewCatTamil(e.target.value)}
                    placeholder="எ.கா: அரசியல், கல்வி"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    English Name
                  </label>
                  <input
                    type="text"
                    value={newCatEnglish}
                    onChange={(e) => setNewCatEnglish(e.target.value)}
                    placeholder="e.g. Politics, Education"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '6px',
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
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
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
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {cat.nameTamil} <span style={{ color: '#64748b', fontWeight: 500 }}>({cat.nameEnglish})</span>
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
                        borderColor: cat.enabled ? '#a7f3d0' : '#cbd5e1',
                        background: cat.enabled ? '#ecfdf5' : '#f1f5f9',
                        color: cat.enabled ? '#047857' : '#64748b',
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
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          color: '#dc2626',
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
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Location Settings (அமைவிட அமைப்புகள்)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Coverage zones across Tamil Nadu districts, default center point, and radius limits.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Configured Districts & Taluks Hierarchy */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                Configured Districts & Coverage Hierarchy
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {currentSettings.locations.districts.map((dist) => (
                  <div
                    key={dist.name}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MapPin size={15} color="#ea580c" />
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {dist.name} District
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {dist.taluks.map((t) => (
                        <span
                          key={t.name}
                          style={{
                            fontSize: '11px',
                            background: '#ffffff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            color: '#334155'
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
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Notification Settings (அறிவிப்பு அமைப்புகள்)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Configure push notifications and alerts triggered for breaking stories and reporter payouts.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
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
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isChecked ? '#a7f3d0' : '#cbd5e1',
                        background: isChecked ? '#ecfdf5' : '#f1f5f9',
                        color: isChecked ? '#047857' : '#64748b',
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
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Advertisement Settings (விளம்பர அமைப்புகள்)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Global switches, session frequency caps, and video ad interstitial controls.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Global Ads Switch
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
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
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: currentSettings.advertisements.globalAdsEnabled ? '#a7f3d0' : '#cbd5e1',
                    background: currentSettings.advertisements.globalAdsEnabled ? '#ecfdf5' : '#f1f5f9',
                    color: currentSettings.advertisements.globalAdsEnabled ? '#047857' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {currentSettings.advertisements.globalAdsEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Spots (Reels) Ad Interstitials
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
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
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: currentSettings.advertisements.enableVideoInterstitialInSpots ? '#a7f3d0' : '#cbd5e1',
                    background: currentSettings.advertisements.enableVideoInterstitialInSpots ? '#ecfdf5' : '#f1f5f9',
                    color: currentSettings.advertisements.enableVideoInterstitialInSpots ? '#047857' : '#64748b',
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
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Social Media Content Import Settings (சமூக வலைத்தள செய்தி இறக்குமதி)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Configure automatic feed channels and handles for YouTube, Twitter/X, Instagram, and RSS feeds.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
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
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                API Settings & Integration Health (API அமைப்புகள்)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Infrastructure connections status: Cloudflare R2 CDN, Supabase PostgreSQL, and Google OAuth.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Cloudflare R2 */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Cloudflare R2 Media Bucket</span>
                  <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 800 }}>CONNECTED</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  Bucket: <code style={{ color: '#c2410c', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>spotlight-media</code><br />
                  Public CDN: <code style={{ color: '#0369a1', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>pub-5051362230a34232ba4afb2cf7ac345c.r2.dev</code>
                </div>
              </div>

              {/* Supabase PostgreSQL */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Supabase PostgreSQL</span>
                  <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 800 }}>CONFIGURED</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  Region: <code style={{ color: '#c2410c', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>ap-southeast-1</code><br />
                  Pooling: <code style={{ color: '#0369a1', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Connection Pooler (Port 5432)</code>
                </div>
              </div>

              {/* Google OAuth */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Google OAuth 2.0 Client</span>
                  <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontWeight: 800 }}>READY</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  Client ID: <code style={{ color: '#c2410c', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>457891409432...googleusercontent.com</code>
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Admin Users & Permissions (நிர்வாகப் பொறுப்புகள் & அனுமதிகள்)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
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
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
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
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#c2410c' }}>
                  Official Roles & Permissions Matrix (அனுமதி அட்டவணை):
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: '#e2e8f0' }}>
                {[
                  { role: 'Super Admin', access: 'Full access (அனைத்து அணுகல்)', desc: 'News approval, Delete Videos & Feeds, Treasury Payouts, Advertisements, Analytics, Settings, Admin management', color: '#ea580c' },
                  { role: 'Editor', access: 'News create / edit / publish / delete', desc: 'Create editorial stories, calibrate geotag/RPM, publish and delete news videos & feeds', color: '#0284c7' },
                  { role: 'Moderator', access: 'Review / approve & delete content', desc: 'Review citizen dispatches, approve/reject reports, and delete inappropriate videos & feeds', color: '#7c3aed' },
                  { role: 'Ad Manager', access: 'Advertisements மட்டும்', desc: 'Commercial campaigns, ad creation, targeting, scheduling, and ad analytics only (No feed deletion)', color: '#059669' }
                ].map((item) => (
                  <div key={item.role} style={{ background: '#ffffff', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{item.role}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>
                      {item.access}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
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
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
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
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#9a3412' }}>
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
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: currentSimulatedRole === r.role ? '#ea580c' : '#fed7aa',
                        background: currentSimulatedRole === r.role ? '#ea580c' : '#ffffff',
                        color: currentSimulatedRole === r.role ? '#ffffff' : '#9a3412',
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
                  background: '#f8fafc',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  alignItems: 'end'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. ramesh@spotlight.local"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Role (பொறுப்பு)
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRoleType)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px' }}
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
                      borderRadius: '6px',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
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
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
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
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
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
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 600
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
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: user.status === 'active' ? '#a7f3d0' : '#cbd5e1',
                        background: user.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                        color: user.status === 'active' ? '#047857' : '#64748b',
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
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: '6px',
                        color: '#dc2626',
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
