import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  Trash2,
  MapPin,
  Tag,
  Smartphone,
  Laptop,
  Car,
  Armchair,
  Shirt,
  Home,
  Building,
  Wrench,
  AlertCircle,
  Video,
  ShoppingBag,
  Briefcase,
  Calendar,
  Sparkles,
  Phone,
  MessageCircle,
  Eye,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import type {
  MarketplaceCategory,
  ProductCondition,
  PostAdFormData,
  MarketplaceProduct
} from '../../types/marketplace';
import { addStoredProduct, updateStoredProduct, uploadMarketplaceMediaToR2 } from '../../services/marketplaceService';

export type PostAdType =
  | 'sell_something'
  | 'post_property'
  | 'post_job'
  | 'offer_service'
  | 'sell_vehicle'
  | 'create_event';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdPublished: (newProduct: MarketplaceProduct) => void;
  onProductUpdated?: (updatedProduct: MarketplaceProduct) => void;
  currentUserDefaultLocation?: string;
  initialType?: PostAdType;
  editingProduct?: MarketplaceProduct | null;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAdPublished,
  onProductUpdated,
  currentUserDefaultLocation = 'Avadi / Ambattur, Chennai',
  initialType,
  editingProduct
}) => {
  const [selectedType, setSelectedType] = useState<PostAdType | null>(initialType || null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [publishedProduct, setPublishedProduct] = useState<MarketplaceProduct | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setSelectedType('sell_something');
        setCurrentStep(2);
        setIsPublishedSuccess(false);
        setErrorMsg('');
        setFormData({
          category: editingProduct.category,
          subcategory: editingProduct.subcategory || '',
          title: editingProduct.title,
          price: editingProduct.price,
          priceNegotiable: editingProduct.priceNegotiable,
          condition: editingProduct.condition,
          description: editingProduct.description,
          location: editingProduct.location,
          brand: editingProduct.specs?.brand || '',
          model: editingProduct.specs?.model || '',
          storage: editingProduct.specs?.storage || '',
          ram: editingProduct.specs?.ram || '',
          year: editingProduct.specs?.year || '',
          kmDriven: editingProduct.specs?.kmDriven || '',
          sellerName: editingProduct.seller.name,
          sellerPhone: editingProduct.seller.phone || '',
          sellerEmail: editingProduct.seller.email || '',
          sellerWhatsApp: editingProduct.seller.whatsapp || '',
          showWhatsAppToBuyers: true,
          images: editingProduct.images || [],
          videoUrl: editingProduct.videoUrl || ''
        });
        setVideoUrlInput(editingProduct.videoUrl || '');
      } else {
        setSelectedType(initialType || null);
        setCurrentStep(1);
        setIsPublishedSuccess(false);
        setErrorMsg('');
        setFormData({
          category: 'mobiles',
          subcategory: '',
          title: '',
          price: 0,
          priceNegotiable: true,
          condition: 'Like New',
          description: '',
          location: currentUserDefaultLocation,
          brand: '',
          model: '',
          storage: '',
          warranty: '',
          images: [],
          videoUrl: '',
          sellerName: 'Veda Spark',
          sellerPhone: '+91 98401 23456',
          sellerWhatsApp: '919840123456',
          sellerEmail: 'user@localplus.in',
          hideExactLocation: false,
          showWhatsAppToBuyers: true
        });
        setImageUrlInput('');
        setVideoUrlInput('');
      }
    }
  }, [isOpen, initialType, editingProduct]);

  const [formData, setFormData] = useState<PostAdFormData & { subcategory?: string; showWhatsAppToBuyers?: boolean }>({
    category: 'mobiles',
    subcategory: '',
    title: '',
    price: 0,
    priceNegotiable: true,
    condition: 'Like New',
    description: '',
    location: currentUserDefaultLocation,
    brand: '',
    model: '',
    storage: '',
    warranty: '',
    images: [],
    videoUrl: '',
    sellerName: 'Veda Spark',
    sellerPhone: '+91 98401 23456',
    sellerWhatsApp: '919840123456',
    sellerEmail: 'user@localplus.in',
    hideExactLocation: false,
    showWhatsAppToBuyers: true
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const adTypeOptions = [
    {
      id: 'sell_something',
      label: 'Sell Something',
      icon: <ShoppingBag size={22} />,
      desc: 'Electronics, mobiles, furniture, fashion'
    }
  ];

  const categoriesList: Array<{ id: MarketplaceCategory; label: string; icon: React.ReactNode }> = [
    { id: 'mobiles', label: 'Mobiles & Tablets', icon: <Smartphone size={16} /> },
    { id: 'electronics', label: 'Electronics', icon: <Laptop size={16} /> },
    { id: 'furniture', label: 'Furniture', icon: <Armchair size={16} /> },
    { id: 'fashion', label: 'Fashion', icon: <Shirt size={16} /> },
    { id: 'home_kitchen', label: 'Home & Kitchen', icon: <Home size={16} /> },
    { id: 'services', label: 'Other Products', icon: <ShoppingBag size={16} /> }
  ];

  const handleSelectType = (type: PostAdType) => {
    setSelectedType(type);
    if (type === 'sell_vehicle') {
      setFormData((prev) => ({ ...prev, category: 'vehicles' }));
    } else if (type === 'post_property') {
      setFormData((prev) => ({ ...prev, category: 'property' }));
    } else if (type === 'offer_service') {
      setFormData((prev) => ({ ...prev, category: 'services' }));
    }
  };

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setFormData((prev) => {
      if (prev.images.includes(url.trim())) return prev;
      return {
        ...prev,
        images: [...prev.images, url.trim()]
      };
    });
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddSampleImage = (type: 'phone' | 'laptop' | 'car' | 'furniture') => {
    const samples = {
      phone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
      laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      car: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      furniture: 'https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80'
    };
    handleAddImage(samples[type]);
  };

  const validateStep2 = () => {
    if (!formData.title.trim()) {
      setErrorMsg('Please enter a product title.');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setErrorMsg('Please enter a valid price in ₹.');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please provide a brief description.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep4 = () => {
    if (!formData.sellerName.trim()) {
      setErrorMsg('Please enter your contact name.');
      return false;
    }
    if (!formData.sellerPhone.trim()) {
      setErrorMsg('Please enter your contact phone number.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Do NOT auto-inject sample images. User's uploaded photos or empty is preserved!
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!validateStep4()) return;
      setCurrentStep(5);
    } else if (currentStep === 5) {
      handlePublish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
      setErrorMsg('');
    }
  };

  const handlePublish = () => {
    if (editingProduct) {
      const updated = updateStoredProduct({
        ...editingProduct,
        title: formData.title,
        price: Number(formData.price),
        priceNegotiable: formData.priceNegotiable,
        category: formData.category,
        subcategory: formData.subcategory,
        condition: formData.condition,
        description: formData.description,
        location: formData.location,
        images: formData.images.length > 0 ? formData.images : editingProduct.images,
        videoUrl: videoUrlInput || formData.videoUrl,
        specs: {
          ...editingProduct.specs,
          brand: formData.brand,
          model: formData.model,
          storage: formData.storage,
          ram: formData.ram,
          year: formData.year,
          kmDriven: formData.kmDriven,
        },
        seller: {
          ...editingProduct.seller,
          name: formData.sellerName,
          phone: formData.sellerPhone,
          whatsapp: formData.sellerWhatsApp || formData.sellerPhone,
        }
      });
      setPublishedProduct(updated);
      setIsPublishedSuccess(true);
      setCurrentStep(6);
      onProductUpdated?.(updated);
    } else {
      const newProduct = addStoredProduct({
        ...formData,
        images: formData.images,
        videoUrl: videoUrlInput || formData.videoUrl
      });
      setPublishedProduct(newProduct);
      setIsPublishedSuccess(true);
      setCurrentStep(6);
      onAdPublished(newProduct);
    }
  };

  return (
    <div className="modal-overlay-backdrop" onClick={onClose}>
      <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="m-modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-navy)' }}>
              {isPublishedSuccess
                ? (editingProduct ? 'Listing Updated!' : 'Listing Live!')
                : (editingProduct ? 'Edit Product Listing' : 'Post an Ad on LocalPlus')}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--lp-slate-light)' }}>
              {isPublishedSuccess
                ? 'Your changes are now live and visible to buyers'
                : (editingProduct ? 'Update product info, pricing, or photos' : 'Reach local buyers in your neighbourhood')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* STEP CHOOSER (If no ad type chosen yet) - ONLY SELL SOMETHING */}
        {!selectedType && (
          <div className="m-modal-body" style={{ padding: '24px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adTypeOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelectType(opt.id as PostAdType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '18px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid var(--lp-border)',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--lp-orange)';
                    e.currentTarget.style.background = '#fffaf5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--lp-border)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: '#fff7ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--lp-orange)',
                      flexShrink: 0
                    }}
                  >
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--lp-navy)', margin: 0 }}>
                        🛍 {opt.label}
                      </h4>
                      <ArrowRight size={16} color="var(--lp-orange)" />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--lp-slate-body)', marginTop: '4px', margin: 0 }}>
                      {opt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6-STEP WIZARD (When ad type selected) */}
        {selectedType && (
          <>
            {/* Step Progress Bar (1 to 6) */}
            {!isPublishedSuccess && (
              <div style={{ padding: '14px 24px 0' }}>
                <div className="post-ad-steps-bar">
                  {[
                    { num: 1, label: 'Category' },
                    { num: 2, label: 'Details' },
                    { num: 3, label: 'Media' },
                    { num: 4, label: 'Contact' },
                    { num: 5, label: 'Preview' },
                    { num: 6, label: 'Publish' }
                  ].map((step) => {
                    const isActive = currentStep === step.num;
                    const isDone = currentStep > step.num;
                    return (
                      <div
                        key={step.num}
                        className={`post-ad-step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                        onClick={() => {
                          if (isDone) setCurrentStep(step.num as any);
                        }}
                      >
                        <div className="step-num-circle">
                          {isDone ? <CheckCircle2 size={15} /> : step.num}
                        </div>
                        <span className="step-label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div
                style={{
                  margin: '0 24px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="m-modal-body">
              {/* STEP 1: Choose Category */}
              {currentStep === 1 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '10px' }}>
                    Step 1: Choose Category
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                    {categoriesList.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            category: cat.id
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: formData.category === cat.id ? '2px solid var(--lp-orange)' : '1px solid var(--lp-border)',
                          background: formData.category === cat.id ? '#fff7ed' : '#ffffff',
                          color: formData.category === cat.id ? 'var(--lp-orange)' : 'var(--lp-slate-body)',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Product Details */}
              {currentStep === 2 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '10px' }}>
                    Step 2: Product Details
                  </span>

                  <div className="form-group-block">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. iPhone 15 (256GB), MacBook Air M1"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-block">
                      <label>Brand</label>
                      <input
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. Apple, Samsung, Honda"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>

                    <div className="form-group-block">
                      <label>Model</label>
                      <input
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. iPhone 15, Activa 6G"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-block">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        className="form-input-field"
                        placeholder="e.g. 62000"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      />
                    </div>

                    <div className="form-group-block">
                      <label>Condition *</label>
                      <select
                        className="form-select-field"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({ ...formData, condition: e.target.value as ProductCondition })
                        }
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.priceNegotiable}
                        onChange={(e) => setFormData({ ...formData, priceNegotiable: e.target.checked })}
                        style={{ accentColor: 'var(--lp-orange)' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--lp-navy)' }}>Price is Negotiable</span>
                    </label>
                  </div>

                  <div className="form-group-block">
                    <label>Description *</label>
                    <textarea
                      className="form-textarea-field"
                      rows={3}
                      placeholder="Include details like warranty, bill available, scratches, accessories included..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group-block">
                    <label>Location *</label>
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Andheri West, Mumbai or Avadi, Chennai"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Upload Media (Images & Optional Video) */}
              {currentStep === 3 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '8px' }}>
                    Step 3: Upload Photos & Media
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--lp-slate-body)', marginBottom: '14px' }}>
                    Upload high quality photos and an optional short product video preview.
                  </p>

                  <div
                    style={{
                      border: '2px dashed var(--lp-border)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      marginBottom: '16px'
                    }}
                  >
                    <UploadCloud size={32} color="var(--lp-orange)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-navy)', display: 'block', marginBottom: '8px' }}>
                      Upload Photos from Device or Paste Image URL
                    </span>

                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                        color: '#ffffff',
                        padding: '9px 16px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                        marginBottom: '10px'
                      }}
                    >
                      <UploadCloud size={16} />
                      <span>Upload Photos to Cloudflare R2</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            for (const file of Array.from(files)) {
                              try {
                                const r2Url = await uploadMarketplaceMediaToR2(file, file.name, 'marketplace');
                                handleAddImage(r2Url);
                              } catch {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) handleAddImage(ev.target.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '4px auto 0' }}>
                      <input
                        type="url"
                        className="form-input-field"
                        placeholder="https://example.com/photo.jpg"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImage(imageUrlInput)}
                        style={{
                          background: '#f1f5f9',
                          color: 'var(--lp-navy)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '12px',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer'
                        }}
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Quick Sample Buttons */}
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)' }}>Quick samples:</span>
                      <button
                        type="button"
                        onClick={() => handleAddSampleImage('phone')}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                      >
                        + Mobile
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleImage('laptop')}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                      >
                        + Laptop
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSampleImage('car')}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#fff', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                      >
                        + Vehicle
                      </button>
                    </div>
                  </div>

                  {/* Optional Video link / file */}
                  <div className="form-group-block">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Video size={15} color="var(--lp-orange)" />
                        <span>Optional Product Video (MP4 / CDN)</span>
                      </label>
                      <label
                        style={{
                          fontSize: '11px',
                          color: '#2563eb',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Upload Video to Cloudflare
                        <input
                          type="file"
                          accept="video/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const r2Url = await uploadMarketplaceMediaToR2(file, file.name, 'marketplace');
                                setVideoUrlInput(r2Url);
                              } catch (err: any) {
                                console.error('Video upload failed:', err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      className="form-input-field"
                      placeholder="Paste MP4 URL or click 'Upload Video to Cloudflare' above"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                    />
                  </div>

                  {/* Previews */}
                  {formData.images.length > 0 && (
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--lp-navy)', display: 'block', marginBottom: '8px' }}>
                        Uploaded Images ({formData.images.length})
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {formData.images.map((img, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              width: '80px',
                              height: '80px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid var(--lp-border)'
                            }}
                          >
                            <img
                              src={img}
                              alt={`thumb-${idx}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.6)',
                                color: '#ffffff',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Contact Information */}
              {currentStep === 4 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '8px' }}>
                    Step 4: Contact Information
                  </span>

                  <div className="form-group-block">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      className="form-input-field"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group-block">
                      <label>Contact Phone Number *</label>
                      <input
                        type="tel"
                        className="form-input-field"
                        value={formData.sellerPhone}
                        onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                      />
                    </div>

                    <div className="form-group-block">
                      <label>WhatsApp Number</label>
                      <input
                        type="tel"
                        className="form-input-field"
                        value={formData.sellerWhatsApp}
                        onChange={(e) => setFormData({ ...formData, sellerWhatsApp: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-input-field"
                      value={formData.sellerEmail}
                      onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                    />
                  </div>

                  {/* Settings toggles */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.showWhatsAppToBuyers}
                        onChange={(e) => setFormData({ ...formData, showWhatsAppToBuyers: e.target.checked })}
                        style={{ accentColor: 'var(--lp-orange)' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--lp-navy)' }}>
                        Show WhatsApp contact to buyers (Recommended)
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.hideExactLocation}
                        onChange={(e) => setFormData({ ...formData, hideExactLocation: e.target.checked })}
                        style={{ accentColor: 'var(--lp-orange)' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--lp-navy)' }}>
                        Show approximate locality only (Protect exact street address)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: Preview */}
              {currentStep === 5 && (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--lp-navy)', display: 'block', marginBottom: '12px' }}>
                    Step 5: Preview Your Advertisement
                  </span>

                  {/* Complete Preview Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--lp-border)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      gap: '16px'
                    }}
                  >
                    <img
                      src={
                        formData.images[0] ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Preview"
                      style={{ width: '120px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--lp-orange)', textTransform: 'uppercase' }}>
                        {formData.category} • {formData.condition}
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)', margin: '2px 0 4px' }}>
                        {formData.title || 'Untitled Listing'}
                      </h4>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--lp-orange)' }}>
                        ₹{Number(formData.price).toLocaleString('en-IN')}
                        {formData.priceNegotiable && (
                          <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '6px' }}>(Negotiable)</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--lp-slate-body)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--lp-orange)" />
                        <span>{formData.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--lp-slate-body)' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '4px', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {formData.description}
                    </p>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--lp-slate-body)' }}>
                    <strong>Seller Contact:</strong> {formData.sellerName} • {formData.sellerPhone}
                    {formData.showWhatsAppToBuyers && ' • WhatsApp Enabled'}
                  </div>
                </div>
              )}

              {/* STEP 6: Publish Success */}
              {currentStep === 6 && (
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                    Your listing is now live!
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--lp-slate-body)', maxWidth: '380px', margin: '6px auto 20px' }}>
                    Buyers in {formData.location} can now discover, chat with you, and message you on WhatsApp.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={onClose}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        background: 'var(--lp-orange)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      View in Marketplace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Buttons */}
            {!isPublishedSuccess && (
              <div className="m-modal-footer">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--lp-border)',
                      background: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentStep === 5 ? 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' : 'var(--lp-orange)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px var(--lp-orange-glow)'
                  }}
                >
                  {currentStep === 5 ? 'Publish Ad' : 'Continue'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
