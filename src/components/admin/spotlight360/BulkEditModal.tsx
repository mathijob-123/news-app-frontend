import React, { useState } from 'react';
import {
  X,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  Radio,
  Sliders,
  Phone,
  Link
} from 'lucide-react';
import type {
  Spotlight360Location,
  SpotlightRadiusKm,
  Spotlight360Cta,
  NewsCategory
} from '../../../types';

export const SPOTLIGHT_PRESET_LOCATIONS: {
  area: string;
  city: string;
  district: string;
  pincode: string;
  lat: number;
  lng: number;
}[] = [
  { area: 'Ponneri', city: 'Ponneri', district: 'Tiruvallur', pincode: '601204', lat: 13.3331, lng: 80.1989 },
  { area: 'Minjur', city: 'Minjur', district: 'Tiruvallur', pincode: '601203', lat: 13.2842, lng: 80.2625 },
  { area: 'Tiruvallur Town', city: 'Tiruvallur', district: 'Tiruvallur', pincode: '602001', lat: 13.1438, lng: 79.9083 },
  { area: 'Gummidipoondi', city: 'Gummidipoondi', district: 'Tiruvallur', pincode: '601201', lat: 13.4072, lng: 80.1306 },
  { area: 'Avadi', city: 'Avadi', district: 'Tiruvallur', pincode: '600054', lat: 13.1147, lng: 80.1017 },
  { area: 'Anna Nagar', city: 'Chennai', district: 'Chennai', pincode: '600040', lat: 13.0850, lng: 80.2101 },
  { area: 'T. Nagar', city: 'Chennai', district: 'Chennai', pincode: '600017', lat: 13.0418, lng: 80.2341 },
  { area: 'Chennai Central / Ripon', city: 'Chennai', district: 'Chennai', pincode: '600003', lat: 13.0827, lng: 80.2707 }
];

interface BulkEditModalProps {
  selectedCount: number;
  onClose: () => void;
  onApply: (updates: {
    location?: Spotlight360Location;
    startDate?: string;
    endDate?: string;
    category?: string;
    campaignName?: string;
    status?: 'draft' | 'scheduled' | 'active';
    cta?: Spotlight360Cta;
  }) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  selectedCount,
  onClose,
  onApply
}) => {
  // Enabled fields checkboxes
  const [applyLocation, setApplyLocation] = useState(true);
  const [applyDates, setApplyDates] = useState(false);
  const [applyCategory, setApplyCategory] = useState(false);
  const [applyCampaign, setApplyCampaign] = useState(false);
  const [applyStatus, setApplyStatus] = useState(false);
  const [applyCta, setApplyCta] = useState(false);

  // Form values
  const [selectedArea, setSelectedArea] = useState('Ponneri');
  const [district, setDistrict] = useState('Tiruvallur');
  const [pincode, setPincode] = useState('601204');
  const [lat, setLat] = useState(13.3331);
  const [lng, setLng] = useState(80.1989);
  const [radiusKm, setRadiusKm] = useState<SpotlightRadiusKm>(5);

  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [category, setCategory] = useState<NewsCategory | string>('business');
  const [campaignName, setCampaignName] = useState('Hyperlocal Spotlight Campaign');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'active'>('active');

  const [ctaType, setCtaType] = useState<Spotlight360Cta['type']>('call_now');
  const [ctaLabel, setCtaLabel] = useState('Call Now');
  const [ctaActionUrl, setCtaActionUrl] = useState('tel:+919840000000');

  const handleSelectPreset = (preset: typeof SPOTLIGHT_PRESET_LOCATIONS[0]) => {
    setSelectedArea(preset.area);
    setDistrict(preset.district);
    setPincode(preset.pincode);
    setLat(preset.lat);
    setLng(preset.lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};

    if (applyLocation) {
      updates.location = {
        area: selectedArea,
        city: district,
        district,
        pincode,
        lat,
        lng,
        radiusKm
      };
    }

    if (applyDates) {
      updates.startDate = startDate;
      updates.endDate = endDate;
    }

    if (applyCategory) {
      updates.category = category;
    }

    if (applyCampaign) {
      updates.campaignName = campaignName;
    }

    if (applyStatus) {
      updates.status = status;
    }

    if (applyCta) {
      updates.cta = {
        type: ctaType,
        label: ctaLabel,
        actionUrl: ctaActionUrl
      };
    }

    onApply(updates);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff4500, #ea580c)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Bulk Edit ({selectedCount} Videos Selected)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                ஒரே நேரத்தில் அனைத்து தேர்ந்தெடுக்கப்பட்ட வீடியோக்களுக்கும் விவரங்களைப் பயன்படுத்துங்கள்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SECTION 1: Location & Radius Targeting */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={applyLocation}
                  onChange={(e) => setApplyLocation(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
                />
                <MapPin size={16} color="var(--brand-primary)" />
                <span>Hyperlocal Location & Radius Targeting</span>
              </label>
            </div>

            {applyLocation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    Quick Presets (Chennai & Tiruvallur Hubs):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {SPOTLIGHT_PRESET_LOCATIONS.map((preset) => (
                      <button
                        key={preset.area}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '11px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          background: selectedArea === preset.area ? 'var(--brand-primary)' : '#ffffff',
                          color: selectedArea === preset.area ? '#ffffff' : 'var(--text-primary)',
                          border: selectedArea === preset.area ? '1px solid var(--brand-primary)' : '1px solid #cbd5e1',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.area}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Area / Town</label>
                    <input
                      type="text"
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Radius Picker */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Targeting Broadcast Radius:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    {([1, 3, 5, 10, 25] as SpotlightRadiusKm[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRadiusKm(r)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          background: radiusKm === r ? '#fff7ed' : '#ffffff',
                          color: radiusKm === r ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          border: radiusKm === r ? '1.5px solid var(--brand-primary)' : '1px solid #cbd5e1',
                          cursor: 'pointer'
                        }}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    🎯 Only citizens within {radiusKm} km of {selectedArea} will be served these videos in Spots/Reels.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Category & Campaign */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '6px' }}>
                  <input
                    type="checkbox"
                    checked={applyCategory}
                    onChange={(e) => setApplyCategory(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Category</span>
                </label>
                <select
                  disabled={!applyCategory}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff'
                  }}
                >
                  <option value="business">Business & Commerce</option>
                  <option value="civic">Civic & Public Notices</option>
                  <option value="community">Community & Culture</option>
                  <option value="safety">Safety & Emergency</option>
                  <option value="traffic">Traffic & Transport</option>
                  <option value="weather">Weather & Alerts</option>
                  <option value="sports">Sports & Events</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '6px' }}>
                  <input
                    type="checkbox"
                    checked={applyCampaign}
                    onChange={(e) => setApplyCampaign(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Campaign Group</span>
                </label>
                <input
                  type="text"
                  disabled={!applyCampaign}
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Ponneri Gold Festival"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Schedule Dates & Status */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '6px' }}>
                  <input
                    type="checkbox"
                    checked={applyDates}
                    onChange={(e) => setApplyDates(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  disabled={!applyDates}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  disabled={!applyDates}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '6px' }}>
                  <input
                    type="checkbox"
                    checked={applyStatus}
                    onChange={(e) => setApplyStatus(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--brand-primary)' }}
                  />
                  <span>Status</span>
                </label>
                <select
                  disabled={!applyStatus}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    background: '#ffffff'
                  }}
                >
                  <option value="active">Active (Live)</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Call to Action (CTA) */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={applyCta}
                onChange={(e) => setApplyCta(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
              />
              <Sparkles size={16} color="var(--brand-primary)" />
              <span>Interactive Call to Action (CTA) Button</span>
            </label>

            {applyCta && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</label>
                  <select
                    value={ctaType}
                    onChange={(e) => {
                      const t = e.target.value as Spotlight360Cta['type'];
                      setCtaType(t);
                      if (t === 'call_now') setCtaLabel('Call Now');
                      else if (t === 'shop_now') setCtaLabel('Shop Now');
                      else if (t === 'whatsapp') setCtaLabel('WhatsApp');
                      else setCtaLabel('Learn More');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      marginTop: '4px',
                      background: '#ffffff'
                    }}
                  >
                    <option value="call_now">Call Now</option>
                    <option value="shop_now">Shop Now</option>
                    <option value="learn_more">Learn More</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visit_location">Visit Store</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Button Label</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      marginTop: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Action URL or Phone</label>
                  <input
                    type="text"
                    value={ctaActionUrl}
                    onChange={(e) => setCtaActionUrl(e.target.value)}
                    placeholder="tel:+91... or https://..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      marginTop: '4px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #ff4500, #ea580c)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 69, 0, 0.35)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Apply to {selectedCount} Videos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
