import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShieldCheck,
  Clock,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send,
  Paperclip,
  CheckCircle2,
  MessageCircle,
  Phone,
  Star,
  X,
  Video,
  Edit3,
  Trash2,
  Sparkles,
  Check
} from 'lucide-react';
import type { MarketplaceProduct, SellerChatMessage } from '../../types/marketplace';
import {
  getStoredChatMessages,
  addStoredChatMessage,
  deleteStoredProduct
} from '../../services/marketplaceService';
import { useAuth } from '../../context/AuthContext';

interface ProductDetailsPanelProps {
  product: MarketplaceProduct;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onViewSellerProfile: (seller: MarketplaceProduct['seller']) => void;
  onEditProduct?: (product: MarketplaceProduct) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductDetailsPanel: React.FC<ProductDetailsPanelProps> = ({
  product,
  onClose,
  onToggleFavorite,
  onViewSellerProfile,
  onEditProduct,
  onDeleteProduct
}) => {
  const { user: authUser, isAdmin } = useAuth();
  const isOwner = Boolean(
    product.isMine ||
    isAdmin ||
    (authUser && (product.seller.id === authUser.id || product.seller.email === authUser.email))
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<SellerChatMessage[]>(() =>
    getStoredChatMessages(product.id)
  );
  const [messageInput, setMessageInput] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.price);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = addStoredChatMessage(product.id, {
      productId: product.id,
      senderId: 'current_user',
      senderName: 'You',
      text: messageInput.trim(),
      isMe: true
    });

    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    // Optional simulated seller auto-reply for realistic interactive experience
    setTimeout(() => {
      const autoReply = addStoredChatMessage(product.id, {
        productId: product.id,
        senderId: product.seller.id,
        senderName: product.seller.name,
        text: 'Thanks for reaching out! Yes, this item is still available. Feel free to message on WhatsApp or call for a quick deal.',
        isMe: false
      });
      setChatMessages((prev) => [...prev, autoReply]);
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on LocalPlus for ${formattedPrice}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState(
    `Hi, I'm interested in your ${product.title} listed on LocalPlus. Is it still available?`
  );
  const [showCallSellerModal, setShowCallSellerModal] = useState(false);

  // Update prefilled message whenever product changes
  React.useEffect(() => {
    setWhatsAppMessage(`Hi, I'm interested in your ${product.title} listed on LocalPlus. Is it still available?`);
  }, [product.title]);

  const handleOpenWhatsAppModal = () => {
    setShowWhatsAppModal(true);
  };

  const handleSendWhatsAppFinal = () => {
    const rawPhone = product.seller.whatsapp || '919840123456';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsAppMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    setShowWhatsAppModal(false);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteListing = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.title}"? This cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteStoredProduct(product.id);
      onDeleteProduct?.(product.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const QUICK_INQUIRIES = [
    '👋 Is this still available?',
    '💰 What is the best price?',
    '📍 Can I inspect in person?',
    '🤝 Would you accept an offer?'
  ];

  const handleSelectQuickInquiry = (text: string) => {
    setMessageInput(text);
  };

  const handleSendCustomViaWhatsApp = (customText?: string) => {
    const textToSend = (customText || messageInput || `Hi, I am interested in your ${product.title} listed on LocalPlus.`).trim();
    const rawPhone = product.seller.whatsapp || '919840123456';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <aside className="product-detail-panel">
      {/* Top Navigation */}
      <div className="p-detail-top-nav">
        <button
          className="p-detail-back-btn"
          onClick={onClose}
          title="Back to Listings"
        >
          <ArrowLeft size={18} />
          <span>Product Details</span>
        </button>

        <div className="p-detail-nav-actions">
          <button
            onClick={handleShare}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px' }}
            title="Share Listing"
          >
            <Share2 size={15} />
          </button>

          <button
            onClick={() => onToggleFavorite(product.id)}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px', color: product.isFavorite ? '#ef4444' : 'inherit' }}
            title={product.isFavorite ? 'Saved' : 'Save'}
          >
            <Heart
              size={15}
              fill={product.isFavorite ? '#ef4444' : 'none'}
              color={product.isFavorite ? '#ef4444' : 'currentColor'}
            />
          </button>
        </div>
      </div>

      {showCopySuccess && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: '11px',
            fontWeight: 700,
            padding: '6px 16px',
            textAlign: 'center',
            borderBottom: '1px solid #a7f3d0'
          }}
        >
          Link copied to clipboard!
        </div>
      )}

      {/* Body Content */}
      <div className="p-detail-body">
        {/* Large Image Preview with Carousel */}
        <div className="p-image-carousel">
          <img
            src={images[activeImageIndex]}
            alt={product.title}
            className="p-carousel-main-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
            }}
          />

          <span className="p-carousel-badge">
            {activeImageIndex + 1}/{images.length}
          </span>

          {images.length > 1 && (
            <>
              <button
                className="p-carousel-nav-btn left"
                onClick={handlePrevImage}
                title="Previous Image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="p-carousel-nav-btn right"
                onClick={handleNextImage}
                title="Next Image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div className="p-thumbnails-strip">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`p-thumb-item ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img
                  src={img}
                  alt={`thumb-${idx}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Title & Price */}
        <div>
          <h2 className="p-detail-title">{product.title}</h2>
          <div className="p-price-row" style={{ marginTop: '8px' }}>
            <span className="p-detail-price">{formattedPrice}</span>
            {product.priceNegotiable && (
              <span className="p-badge-negotiable">Negotiable</span>
            )}
          </div>
          <div className="p-detail-location" style={{ marginTop: '6px' }}>
            <MapPin size={13} color="var(--lp-orange)" />
            <span>
              {product.location} {product.distanceKm ? `• ${product.distanceKm} km` : ''}
            </span>
          </div>
        </div>

        {/* Meta badges (Verified Seller, Posted Time, Views) */}
        <div className="p-meta-badges-strip">
          {product.seller.verified && (
            <span className="p-meta-pill verified">
              <ShieldCheck size={13} />
              <span>Verified Seller</span>
            </span>
          )}

          <span className="p-meta-pill">
            <Clock size={13} />
            <span>{product.postedAt}</span>
          </span>

          <span className="p-meta-pill">
            <Eye size={13} />
            <span>{product.viewsCount || 13} views</span>
          </span>
        </div>

        {/* Product Details Specs Table */}
        <div className="p-specs-block">
          <span className="p-specs-heading">Product Details</span>
          <div className="p-specs-table">
            {product.specs.brand && (
              <div className="p-specs-row">
                <span className="p-specs-key">Brand:</span>
                <span className="p-specs-val">{product.specs.brand}</span>
              </div>
            )}
            {product.specs.model && (
              <div className="p-specs-row">
                <span className="p-specs-key">Model:</span>
                <span className="p-specs-val">{product.specs.model}</span>
              </div>
            )}
            {product.specs.storage && (
              <div className="p-specs-row">
                <span className="p-specs-key">Storage:</span>
                <span className="p-specs-val">{product.specs.storage}</span>
              </div>
            )}
            {product.specs.condition && (
              <div className="p-specs-row">
                <span className="p-specs-key">Condition:</span>
                <span className="p-specs-val">{product.specs.condition}</span>
              </div>
            )}
            {product.specs.warranty && (
              <div className="p-specs-row">
                <span className="p-specs-key">Warranty:</span>
                <span className="p-specs-val">{product.specs.warranty}</span>
              </div>
            )}
            {product.specs.year && (
              <div className="p-specs-row">
                <span className="p-specs-key">Year:</span>
                <span className="p-specs-val">{product.specs.year}</span>
              </div>
            )}
            {product.specs.kmDriven && (
              <div className="p-specs-row">
                <span className="p-specs-key">KM Driven:</span>
                <span className="p-specs-val">{product.specs.kmDriven}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Block */}
        <div className="p-desc-block">
          <span className="p-specs-heading" style={{ display: 'block', marginBottom: '6px' }}>
            Description
          </span>
          <p>{product.description}</p>
        </div>

        {/* Seller Profile Card */}
        <div className="p-seller-card">
          <div className="p-seller-info">
            <img
              src={product.seller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={product.seller.name}
              className="p-seller-avatar"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="p-seller-name">{product.seller.name}</span>
                {product.seller.verified && (
                  <CheckCircle2 size={13} color="#10b981" />
                )}
              </div>
              <span className="p-seller-meta">
                Member since {product.seller.joinedDate}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d97706' }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span>4.8 Rating</span>
                </span>
                <span>•</span>
                <span>{product.seller.rating || 98}% Trust Score</span>
              </div>
            </div>
          </div>

          <button
            className="p-view-profile-btn"
            onClick={() => onViewSellerProfile(product.seller)}
          >
            View Profile
          </button>
        </div>

        {/* Owner Controls VS Buyer Interaction */}
        {isOwner ? (
          <div
            style={{
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0284c7" />
                Your Product Listing
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>
                Creator / Owner
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Only you have permission to edit or remove this product. You can update title, price, photos, and specifications anytime.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={() => onEditProduct?.(product)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                }}
              >
                <Edit3 size={14} />
                <span>Edit Listing</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
                }}
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Deleting...' : 'Delete Listing'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Action Buttons: [ Save ] [ WhatsApp ] [ Contact Seller ] */}
            <div className="p-action-buttons-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1.35fr', gap: '8px' }}>
              <button
                className={`p-btn-save ${product.isFavorite ? 'saved' : ''}`}
                onClick={() => onToggleFavorite(product.id)}
              >
                <Heart
                  size={15}
                  fill={product.isFavorite ? '#ef4444' : 'none'}
                  color={product.isFavorite ? '#ef4444' : 'currentColor'}
                />
                <span>{product.isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <button
                className="p-btn-whatsapp"
                onClick={handleOpenWhatsAppModal}
                title="Chat directly on WhatsApp with pre-filled message"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => setShowCallSellerModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 10px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                }}
                title="Call or contact seller directly"
              >
                <Phone size={14} />
                <span>Contact</span>
              </button>
            </div>

            {/* 4 Quick Inquiry Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Questions / Inquiries
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Tap or type below</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {QUICK_INQUIRIES.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickInquiry(opt)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: messageInput === opt ? '#eff6ff' : '#f8fafc',
                      border: messageInput === opt ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      color: messageInput === opt ? '#0369a1' : '#334155',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      lineHeight: '1.25'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat & Custom Typing with Seller */}
            <div className="p-chat-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                  Chat with Seller
                </span>
                {messageInput && (
                  <button
                    type="button"
                    onClick={() => handleSendCustomViaWhatsApp()}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Send your typed message to seller on WhatsApp"
                  >
                    <MessageCircle size={11} />
                    <span>Send on WA</span>
                  </button>
                )}
              </div>

              <div className="p-chat-messages">
                {chatMessages.length === 0 ? (
                  <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', textAlign: 'center', padding: '10px 0' }}>
                    Start a private chat or send an offer to {product.seller.name}
                  </span>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-chat-bubble ${msg.isMe ? 'me' : 'seller'}`}
                    >
                      <p>{msg.text}</p>
                      <span style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px', display: 'block', textAlign: msg.isMe ? 'right' : 'left' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-chat-input-row">
                <input
                  type="text"
                  placeholder="Type a message or offer (e.g. ₹5,000)..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--lp-slate-light)', cursor: 'pointer', padding: '4px' }}
                  title="Attach File"
                >
                  <Paperclip size={14} />
                </button>
                <button
                  type="submit"
                  className="p-chat-send-btn"
                  title="Send Message"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* WhatsApp Modal with Editable Pre-Filled Message */}
      {showWhatsAppModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowWhatsAppModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--lp-navy)' }}>
                    Message Seller on WhatsApp
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--lp-slate-body)' }}>
                    To: {product.seller.name} ({product.seller.whatsapp || '+91 98401 23456'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--lp-slate-body)', marginBottom: '6px' }}>
                Review / Edit your pre-filled inquiry message:
              </label>
              <textarea
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #25D366',
                  fontSize: '13px',
                  lineHeight: 1.45,
                  color: 'var(--lp-navy)',
                  resize: 'none',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#f0fdf4'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--lp-slate-body)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWhatsAppFinal}
                style={{
                  flex: 1.6,
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#25D366',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                }}
              >
                <MessageCircle size={16} />
                <span>Send on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Phone Modal */}
      {showCallSellerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowCallSellerModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '380px',
              width: '100%',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <Phone size={24} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--lp-navy)', marginBottom: '4px' }}>
              Contact {product.seller.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--lp-slate-body)', marginBottom: '16px' }}>
              Direct phone contact for LocalPlus Verified Seller
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
                {product.seller.whatsapp ? `+${product.seller.whatsapp}` : '+91 98401 23456'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(product.seller.whatsapp || '+91 98401 23456');
                  alert('Phone number copied to clipboard!');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--lp-slate-body)',
                  cursor: 'pointer'
                }}
              >
                Copy Number
              </button>
              <a
                href={`tel:${product.seller.whatsapp || '9840123456'}`}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Phone size={14} />
                <span>Call Now</span>
              </a>
            </div>

            <button
              onClick={() => setShowCallSellerModal(false)}
              style={{
                marginTop: '12px',
                background: 'none',
                border: 'none',
                fontSize: '11px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
