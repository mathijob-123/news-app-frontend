import React, { useState } from 'react';
import {
  X,
  Building,
  Home,
  MapPin,
  CheckCircle2,
  Camera,
  Video,
  UploadCloud,
  DollarSign,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Phone,
  MessageCircle,
  FileText,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import type { MarketplaceProperty, PropertyListingType, PropertyType } from '../../types/marketplace';
import { getStoredProperties, saveStoredProperties, addStoredProperty, uploadMarketplaceMediaToR2 } from '../../services/marketplaceService';

interface PostPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyPublished?: (newProp: MarketplaceProperty) => void;
}

export const PostPropertyModal: React.FC<PostPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyPublished
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProperty, setCreatedProperty] = useState<MarketplaceProperty | null>(null);

  // Step 1: Property Details
  const [listingType, setListingType] = useState<'Sell' | 'Rent' | 'Lease'>('Rent');
  const [propertyCategory, setPropertyCategory] = useState<'Residential' | 'Commercial' | 'Land / Plot' | 'New Project'>('Residential');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('₹28,000/mo');
  const [location, setLocation] = useState('Avadi Main Road, Chennai');
  const [superBuiltUpArea, setSuperBuiltUpArea] = useState('1150');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [furnishing, setFurnishing] = useState('Semi-Furnished');
  const [propertyAge, setPropertyAge] = useState('1-3 Years');
  const [floor, setFloor] = useState('3rd');
  const [totalFloors, setTotalFloors] = useState('8');
  const [parking, setParking] = useState('1 Covered');
  const [description, setDescription] = useState('');
  const [ownerRole, setOwnerRole] = useState<'Owner' | 'Agent' | 'Builder'>('Owner');

  // Step 2: Photos & Videos
  const sampleRealEstatePhotos = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  ];
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  ]);
  const [videos, setVideos] = useState<string[]>([
    'https://assets.mixkit.co/videos/preview/mixkit-modern-interior-of-a-living-room-41525-large.mp4'
  ]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Step 3: Contact Details
  const [contactName, setContactName] = useState('Suresh R.');
  const [contactPhone, setContactPhone] = useState('+91 98401 23456');
  const [whatsappNumber, setWhatsappNumber] = useState('919840123456');
  const [email, setEmail] = useState('suresh.property@localplus.in');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'chat'>('whatsapp');
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(true);
  const [showContactButton, setShowContactButton] = useState(true);
  const [allowChat, setAllowChat] = useState(true);

  if (!isOpen) return null;

  const propertyTypesByCategory = {
    Residential: ['Apartment', 'Independent House', 'Villa', 'Flat', 'PG'],
    Commercial: ['Office', 'Shop', 'Showroom', 'Warehouse', 'Commercial Building'],
    'Land / Plot': ['Residential Plot', 'Agricultural Land', 'Commercial Plot'],
    'New Project': ['Luxury Highrise', 'Gated Community', 'Integrated Township']
  };

  const handleAddPhoto = (url: string) => {
    if (!url.trim()) return;
    if (photos.length >= 20) {
      alert('Maximum 20 photos allowed.');
      return;
    }
    setPhotos([...photos, url.trim()]);
    setNewPhotoUrl('');
  };

  const handleDeletePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (coverPhotoIndex >= updated.length) {
      setCoverPhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMovePhoto = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPhotos(updated);
    if (coverPhotoIndex === index) setCoverPhotoIndex(targetIndex);
    else if (coverPhotoIndex === targetIndex) setCoverPhotoIndex(index);
  };

  const handleAddVideo = (url: string) => {
    if (!url.trim()) return;
    if (videos.length >= 3) {
      alert('Maximum 3 videos allowed.');
      return;
    }
    setVideos([...videos, url.trim()]);
    setNewVideoUrl('');
  };

  const handleDeleteVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    const primaryCover = photos[coverPhotoIndex] || photos[0] || sampleRealEstatePhotos[0];
    const orderedPhotos = [
      primaryCover,
      ...photos.filter((_, i) => i !== coverPhotoIndex)
    ];

    const newProperty: MarketplaceProperty = {
      id: `prop_${Date.now()}`,
      propertyId: `prop_${Date.now()}`,
      sellerId: 'current_user',
      title: title || `${bedrooms} BHK ${propertyType} in ${location}`,
      price,
      numericPrice: parseInt(price.replace(/\D/g, '') || '28000', 10),
      priceUnit: listingType === 'Rent' ? 'month' : 'total',
      listingType: (listingType === 'Lease' ? 'Rent' : listingType) as PropertyListingType,
      propertyCategory,
      propertyType: propertyType as PropertyType,
      location,
      area: parseInt(superBuiltUpArea, 10) || 1150,
      areaSqFt: parseInt(superBuiltUpArea, 10) || 1150,
      bedrooms: parseInt(bedrooms, 10) || 2,
      bathrooms: parseInt(bathrooms, 10) || 2,
      furnishing,
      propertyAge,
      floor,
      totalFloors,
      parking,
      description: description || `Well ventilated ${bedrooms} BHK ${propertyType} with ${superBuiltUpArea} Sq.Ft super built-up area in ${location}. Features 24x7 security, power backup, and modern amenities.`,
      sellerType: ownerRole,
      contactName,
      contactNumber: contactPhone,
      whatsappNumber,
      email,
      photos: orderedPhotos,
      videos,
      coverImage: primaryCover,
      images: orderedPhotos.length > 0 ? orderedPhotos : sampleRealEstatePhotos,
      isVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postedAt: 'Just now',
      specifications: {
        furnishing,
        facing: 'East Facing',
        floor: `${floor} of ${totalFloors} floors`,
        parking,
        carpetArea: `${superBuiltUpArea} Sq.Ft`,
        superArea: `${superBuiltUpArea} Sq.Ft`,
        availableFrom: 'Immediate'
      },
      owner: {
        name: contactName,
        role: ownerRole,
        verified: true,
        phone: contactPhone,
        whatsapp: whatsappNumber
      },
      isSaved: false
    };

    try {
      addStoredProperty(newProperty);
    } catch (err) {
      console.error(err);
    }

    setCreatedProperty(newProperty);
    setIsSuccess(true);
    onPropertyPublished?.(newProperty);
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="m-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%', borderRadius: '18px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header with Title & Step Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Post Property Listing
            </h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Real Estate • Connect with verified buyers & tenants
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        {!isSuccess && (
          <div style={{ padding: '12px 20px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {[
                { num: 1, label: 'Details' },
                { num: 2, label: 'Photos & Videos' },
                { num: 3, label: 'Contact' },
                { num: 4, label: 'Review' }
              ].map((s) => (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num < currentStep) setCurrentStep(s.num as any);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: s.num < currentStep ? 'pointer' : 'default',
                    opacity: currentStep === s.num ? 1 : currentStep > s.num ? 0.9 : 0.5
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: currentStep === s.num ? '#ea580c' : currentStep > s.num ? '#10b981' : '#cbd5e1',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {currentStep > s.num ? <CheckCircle2 size={13} /> : s.num}
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: currentStep === s.num ? 700 : 500, color: currentStep === s.num ? '#0f172a' : '#64748b' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Property Listed Successfully
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.4 }}>
              Your property <strong>"{createdProperty?.title}"</strong> is now live on LocalPlus Real Estate.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  onClose();
                  if (createdProperty && onPropertyPublished) {
                    onPropertyPublished(createdProperty);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View Property
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Manage Property
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {/* STEP 1: PROPERTY DETAILS */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Listing Type */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Listing Type *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['Sell', 'Rent', 'Lease'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setListingType(t)}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: listingType === t ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          background: listingType === t ? '#fff7ed' : '#ffffff',
                          color: listingType === t ? '#ea580c' : '#475569',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Category */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Property Category *
                  </label>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {(['Residential', 'Commercial', 'Land / Plot', 'New Project'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setPropertyCategory(cat);
                          setPropertyType(propertyTypesByCategory[cat][0]);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: propertyCategory === cat ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          background: propertyCategory === cat ? '#fff7ed' : '#ffffff',
                          color: propertyCategory === cat ? '#ea580c' : '#475569',
                          fontWeight: 700,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type Dropdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Specific Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      {propertyTypesByCategory[propertyCategory].map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Expected Price *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹28,000/mo or ₹65,00,000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Property Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 BHK Modern Gated Flat with Covered Parking"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                {/* Location & Super Builtup Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Location / Area *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Avadi Main Road, Chennai"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Built-up Area (Sq.Ft)
                    </label>
                    <input
                      type="number"
                      placeholder="1150"
                      value={superBuiltUpArea}
                      onChange={(e) => setSuperBuiltUpArea(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Bedrooms, Bathrooms, Furnishing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Bedrooms
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Bathrooms
                    </label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                    >
                      <option value="1">1 Bath</option>
                      <option value="2">2 Baths</option>
                      <option value="3">3 Baths</option>
                      <option value="4">4+ Baths</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Furnishing
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                {/* Floor, Total Floors, Parking, Age */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Floor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3rd"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Total Floors
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8"
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Parking
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Covered"
                      value={parking}
                      onChange={(e) => setParking(e.target.value)}
                      style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Poster Role */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    You are:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['Owner', 'Agent', 'Builder'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setOwnerRole(r)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '8px',
                          border: ownerRole === r ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          background: ownerRole === r ? '#fff7ed' : '#ffffff',
                          color: ownerRole === r ? '#ea580c' : '#475569',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Property Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Details about water connection, ventilation, balconies, nearby landmarks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  <span>Next: Photos & Videos</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* STEP 2: PHOTOS & VIDEOS */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                    Add Property Photos & Videos
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Upload clear photos and videos to attract genuine buyers and tenants.
                  </p>
                </div>

                {/* Dedicated Action Buttons: Upload Photos, Upload Videos, Camera, Gallery */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      background: '#fff7ed',
                      border: '1.5px solid #ffedd5',
                      color: '#ea580c',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <UploadCloud size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Upload Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files) {
                          for (const file of Array.from(files)) {
                            try {
                              const r2Url = await uploadMarketplaceMediaToR2(file, file.name, 'realestate');
                              handleAddPhoto(r2Url);
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) handleAddPhoto(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      border: '1.5px solid #dbeafe',
                      color: '#2563eb',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Video size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Upload Videos</span>
                    <input
                      type="file"
                      accept="video/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const r2Url = await uploadMarketplaceMediaToR2(file, file.name, 'realestate');
                            handleAddVideo(r2Url);
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) handleAddVideo(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      color: '#475569',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Camera size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) handleAddPhoto(ev.target.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      sampleRealEstatePhotos.forEach((url) => {
                        if (!photos.includes(url)) handleAddPhoto(url);
                      });
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      color: '#475569',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Layers size={18} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Gallery</span>
                  </button>
                </div>

                {/* Upload Action Bar */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Paste image URL or choose quick preset..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', background: '#fff' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPhoto(newPhotoUrl)}
                      style={{ padding: '7px 14px', borderRadius: '6px', background: '#ea580c', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      + Add
                    </button>
                  </div>

                  {/* Preset quick photo loaders */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Quick add presets:</span>
                    {sampleRealEstatePhotos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddPhoto(url)}
                        style={{ padding: '3px 8px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '10.5px', color: '#475569', cursor: 'pointer' }}
                      >
                        Interior #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photos Grid with Reorder, Delete, Set Cover */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Uploaded Photos ({photos.length})
                    </span>
                    <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600 }}>
                      Tap star to set as COVER image
                    </span>
                  </div>

                  {photos.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <Camera size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No photos added yet. Add at least 1 photo for higher inquiries.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {photos.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            height: '90px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: coverPhotoIndex === idx ? '2.5px solid #ea580c' : '1px solid #cbd5e1'
                          }}
                        >
                          <img src={p} alt={`prop-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                          {/* COVER badge */}
                          {coverPhotoIndex === idx ? (
                            <span
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                background: '#ea580c',
                                color: '#ffffff',
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              COVER
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverPhotoIndex(idx)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                background: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '9px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Star size={9} /> Set Cover
                            </button>
                          )}

                          {/* Actions: delete & move */}
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px', display: 'flex', gap: '3px' }}>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 'left')}
                                style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '3px', color: '#fff', padding: '2px', cursor: 'pointer' }}
                              >
                                <ChevronLeft size={12} />
                              </button>
                            )}
                            {idx < photos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 'right')}
                                style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '3px', color: '#fff', padding: '2px', cursor: 'pointer' }}
                              >
                                <ChevronRight size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(idx)}
                              style={{ background: '#dc2626', border: 'none', borderRadius: '3px', color: '#fff', padding: '2px 4px', cursor: 'pointer' }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos Section */}
                <div style={{ marginTop: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Property Video Tours (Max 3)
                  </label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Paste MP4 or video URL..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddVideo(newVideoUrl)}
                      style={{ padding: '7px 12px', borderRadius: '6px', background: '#3b82f6', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      + Video
                    </button>
                  </div>

                  {videos.map((vid, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '11.5px',
                        marginBottom: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Video size={14} color="#ea580c" />
                        <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vid}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Step Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#ffffff', fontWeight: 700, fontSize: '12.5px', border: 'none', cursor: 'pointer' }}
                  >
                    Next: Contact Details
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT DETAILS */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                    Contact Information
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Control how buyers and tenants connect with you.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                {/* Privacy & Action Toggles */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showWhatsAppButton}
                      onChange={(e) => setShowWhatsAppButton(e.target.checked)}
                      style={{ accentColor: '#ea580c' }}
                    />
                    <span>Show WhatsApp button (protects number from plain-text scrapers)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showContactButton}
                      onChange={(e) => setShowContactButton(e.target.checked)}
                      style={{ accentColor: '#ea580c' }}
                    />
                    <span>Show Call Contact button</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allowChat}
                      onChange={(e) => setAllowChat(e.target.checked)}
                      style={{ accentColor: '#ea580c' }}
                    />
                    <span>Allow in-app private chat with buyers</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#ffffff', fontWeight: 700, fontSize: '12.5px', border: 'none', cursor: 'pointer' }}
                  >
                    Next: Review & Publish
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                    Review Listing Preview
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Please verify your property information before going live.
                  </p>
                </div>

                {/* Card Preview */}
                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ position: 'relative', height: '160px', width: '100%' }}>
                    <img
                      src={photos[coverPhotoIndex] || photos[0] || sampleRealEstatePhotos[0]}
                      alt="Cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#ea580c', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      COVER • {listingType}
                    </span>
                    <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                      {photos.length} Photos {videos.length > 0 && `• ${videos.length} Videos`}
                    </span>
                  </div>

                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
                      {price}
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                      {title || `${bedrooms} BHK ${propertyType} in ${location}`}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <MapPin size={12} color="#ea580c" />
                      <span>{location}</span>
                    </div>

                    {/* Quick Specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '8px', background: '#f8fafc', borderRadius: '8px', fontSize: '11px', color: '#334155' }}>
                      <div><strong>Type:</strong> {propertyType}</div>
                      <div><strong>Area:</strong> {superBuiltUpArea} Sq.Ft</div>
                      <div><strong>BHK:</strong> {bedrooms} BHK</div>
                      <div><strong>Baths:</strong> {bathrooms}</div>
                      <div><strong>Floor:</strong> {floor}</div>
                      <div><strong>Furnished:</strong> {furnishing}</div>
                    </div>

                    {/* Contact & Owner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b' }}>
                      <span>Posted by: <strong>{contactName} ({ownerRole})</strong></span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Verified Contact</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    style={{
                      flex: 2,
                      padding: '11px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(234, 88, 12, 0.35)'
                    }}
                  >
                    Publish Property Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
