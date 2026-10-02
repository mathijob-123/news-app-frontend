import React, { useState, useMemo } from 'react';
import {
  Home,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Sparkles,
  Play,
  X,
  RefreshCw,
  Building2,
  DollarSign
} from 'lucide-react';
import type { AdminProperty } from '../../../services/marketplaceAdminService';

interface RealEstateAdminManagerProps {
  properties: AdminProperty[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: AdminProperty['status'], notes?: string, reason?: string) => Promise<void>;
  onToggleVerify: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canModerate: boolean;
  canDelete: boolean;
}

export const RealEstateAdminManager: React.FC<RealEstateAdminManagerProps> = ({
  properties,
  onRefresh,
  onUpdateStatus,
  onToggleVerify,
  onDelete,
  canModerate,
  canDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'suspended' | 'reported'>('all');
  const [listingTypeFilter, setListingTypeFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
  const [isVideoPreview, setIsVideoPreview] = useState<boolean>(false);

  const listingTypes = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.listingType) set.add(p.listingType);
    });
    return Array.from(set);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'reported') {
          if ((p.reportsCount || 0) === 0) return false;
        } else if (p.status !== statusFilter) {
          return false;
        }
      }
      if (listingTypeFilter !== 'all' && p.listingType !== listingTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.propertyType.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.contactName && p.contactName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [properties, statusFilter, listingTypeFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search & Filter Header */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by property title, type, location, owner, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Listing Type & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Category:</span>
            <select
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All (Rent / Buy / Commercial / Land)</option>
              {listingTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={onRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Refresh Properties"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: `All (${properties.length})` },
            { id: 'active', label: `Active (${properties.filter((p) => p.status === 'active').length})` },
            { id: 'pending', label: `Pending (${properties.filter((p) => p.status === 'pending').length})` },
            { id: 'sold', label: `Sold / Rented (${properties.filter((p) => p.status === 'sold').length})` },
            { id: 'suspended', label: `Suspended (${properties.filter((p) => p.status === 'suspended').length})` },
            { id: 'reported', label: `Reported (${properties.filter((p) => (p.reportsCount || 0) > 0).length})` }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === pill.id ? '#ff4500' : '#f1f5f9',
                color: statusFilter === pill.id ? '#ffffff' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Property</th>
                <th style={{ padding: '12px 16px' }}>Type & Area</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Contact / Owner</th>
                <th style={{ padding: '12px 16px' }}>Media</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <Home size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#475569' }}>No real estate properties found</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your filters or search terms.</div>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((p) => {
                  const allMedia = [...(p.photos || []), ...(p.images || [])];
                  const thumb = allMedia.length > 0 ? allMedia[0] : (p.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=150&q=80');
                  const videoCount = (p.videos || []).length;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Property Thumbnail & Title */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={thumb}
                            alt={p.title}
                            style={{
                              width: '52px',
                              height: '42px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              background: '#e2e8f0',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>ID: {p.id}</span>
                              {p.isVerified && (
                                <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                                  <ShieldCheck size={12} /> Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Area */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          {p.listingType} • {p.propertyType}
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                          {p.areaSqFt > 0 ? `${p.areaSqFt} Sq.Ft` : 'Plot area available'}
                          {p.bedrooms > 0 ? ` • ${p.bedrooms} BHK` : ''}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.price}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.furnishing || 'Unfurnished'}</div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#334155', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.location}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.district || 'Chennai'}</div>
                      </td>

                      {/* Contact / Owner */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {p.contactName || p.owner?.name || 'Property Owner'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {p.sellerType || p.owner?.role || 'Owner'} • {p.contactNumber || p.owner?.phone || 'Direct'}
                        </div>
                      </td>

                      {/* Media Counter */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                          {allMedia.length} Photos
                        </div>
                        {videoCount > 0 && (
                          <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Play size={10} /> {videoCount} Video(s)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background:
                              p.status === 'active' ? '#dcfce7' :
                              p.status === 'pending' ? '#fef3c7' :
                              p.status === 'sold' ? '#e0f2fe' : '#fee2e2',
                            color:
                              p.status === 'active' ? '#15803d' :
                              p.status === 'pending' ? '#b45309' :
                              p.status === 'sold' ? '#0369a1' : '#b91c1c',
                            textTransform: 'uppercase'
                          }}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedProperty(p);
                              const media = [...(p.photos || []), ...(p.images || [])];
                              if (media.length > 0) {
                                setPreviewMediaUrl(media[0]);
                                setIsVideoPreview(false);
                              } else if (p.videos && p.videos.length > 0) {
                                setPreviewMediaUrl(p.videos[0]);
                                setIsVideoPreview(true);
                              }
                            }}
                            style={{
                              background: '#f1f5f9',
                              border: 'none',
                              color: '#334155',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                            title="Inspect property media & details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {canModerate && p.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStatus(p.id, 'active')}
                              style={{
                                background: '#16a34a',
                                border: 'none',
                                color: '#ffffff',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {canModerate && p.status === 'active' && (
                            <button
                              onClick={() => onUpdateStatus(p.id, 'suspended')}
                              style={{
                                background: '#f59e0b',
                                border: 'none',
                                color: '#ffffff',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            >
                              Suspend
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently delete "${p.title}"?`)) {
                                  onDelete(p.id);
                                }
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Details & Full Media Gallery Modal */}
      {selectedProperty && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a',
                color: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(255, 69, 0, 0.2)',
                    border: '1px solid rgba(255, 69, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff4500'
                  }}
                >
                  <Home size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    {selectedProperty.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {selectedProperty.listingType} • {selectedProperty.propertyType} • ID: {selectedProperty.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Media Gallery Section */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  Uploaded Media Gallery (All Property Photos & Videos)
                </h4>

                {/* Primary Preview Box */}
                <div
                  style={{
                    width: '100%',
                    height: '300px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}
                >
                  {isVideoPreview ? (
                    <video
                      controls
                      autoPlay
                      src={previewMediaUrl}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  ) : previewMediaUrl ? (
                    <img
                      src={previewMediaUrl}
                      alt="Property media"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: '#94a3b8' }}>No media uploaded for this property</span>
                  )}
                </div>

                {/* Media Thumbnails Grid */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {[...(selectedProperty.photos || []), ...(selectedProperty.images || [])].map((img, idx) => (
                    <button
                      key={`img-${idx}`}
                      onClick={() => {
                        setPreviewMediaUrl(img);
                        setIsVideoPreview(false);
                      }}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: !isVideoPreview && previewMediaUrl === img ? '2.5px solid #ff4500' : '2px solid transparent',
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}

                  {(selectedProperty.videos || []).map((vid, vIdx) => (
                    <button
                      key={`vid-${vIdx}`}
                      onClick={() => {
                        setPreviewMediaUrl(vid);
                        setIsVideoPreview(true);
                      }}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isVideoPreview && previewMediaUrl === vid ? '2.5px solid #ff4500' : '2px solid transparent',
                        background: '#0f172a',
                        color: '#ff4500',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: '4px'
                      }}
                    >
                      <Play size={20} />
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff' }}>VIDEO</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Price:</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>{selectedProperty.price}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Area / Super Built-up:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedProperty.areaSqFt} Sq.Ft</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Bedrooms / Bathrooms:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedProperty.bedrooms} BHK • {selectedProperty.bathrooms} Baths</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Furnishing:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedProperty.furnishing || 'Unfurnished'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Location:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedProperty.location}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>District / Taluk / Area:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {[selectedProperty.district, selectedProperty.taluk, selectedProperty.area].filter(Boolean).join(' • ') || 'Chennai Hub'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Description</h4>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {selectedProperty.description || 'No description provided.'}
                </div>
              </div>

              {/* Owner / Agent / Builder Contacts */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Owner / Agent Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Contact Name: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedProperty.contactName || selectedProperty.owner?.name || 'Owner'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Role: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedProperty.sellerType || selectedProperty.owner?.role || 'Owner'}</strong>
                  </div>
                  {(selectedProperty.contactNumber || selectedProperty.owner?.phone) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#059669" />
                      <a href={`tel:${selectedProperty.contactNumber || selectedProperty.owner?.phone}`} style={{ color: '#0f172a', fontWeight: 600 }}>
                        {selectedProperty.contactNumber || selectedProperty.owner?.phone}
                      </a>
                    </div>
                  )}
                  {(selectedProperty.whatsappNumber || selectedProperty.owner?.whatsapp) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={14} color="#25d366" />
                      <a href={`https://wa.me/${selectedProperty.whatsappNumber || selectedProperty.owner?.whatsapp}`} target="_blank" rel="noreferrer" style={{ color: '#0f172a', fontWeight: 600 }}>
                        WhatsApp Contact
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {canModerate && (
                  <button
                    onClick={() => {
                      onToggleVerify(selectedProperty.id, selectedProperty.isVerified);
                      setSelectedProperty({ ...selectedProperty, isVerified: !selectedProperty.isVerified });
                    }}
                    style={{
                      background: selectedProperty.isVerified ? '#f1f5f9' : '#0284c7',
                      color: selectedProperty.isVerified ? '#475569' : '#ffffff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedProperty.isVerified ? 'Remove Verified' : 'Mark Verified Property'}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this property listing?')) {
                        onDelete(selectedProperty.id);
                        setSelectedProperty(null);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {canModerate && selectedProperty.status !== 'active' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedProperty.id, 'active');
                      setSelectedProperty(null);
                    }}
                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Approve Property
                  </button>
                )}
                {canModerate && selectedProperty.status === 'active' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedProperty.id, 'suspended');
                      setSelectedProperty(null);
                    }}
                    style={{ background: '#f59e0b', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Suspend Property
                  </button>
                )}
                <button
                  onClick={() => setSelectedProperty(null)}
                  style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
