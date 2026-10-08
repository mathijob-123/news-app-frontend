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
  X
} from 'lucide-react';
import type { MarketplaceProperty, SellerChatMessage } from '../../types/marketplace';
import {
  getStoredChatMessages,
  addStoredChatMessage
} from '../../services/marketplaceService';

interface PropertyDetailsPanelProps {
  property: MarketplaceProperty;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  isSaved?: boolean;
}

export const PropertyDetailsPanel: React.FC<PropertyDetailsPanelProps> = ({
  property,
  onClose,
  onToggleSave,
  isSaved = false
}) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<SellerChatMessage[]>(() =>
    getStoredChatMessages(property.id)
  );
  const [messageInput, setMessageInput] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'];

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = addStoredChatMessage(property.id, {
      productId: property.id,
      senderId: 'current_user',
      senderName: 'You',
      text: messageInput.trim(),
      isMe: true
    });

    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    // Simulated quick reply from owner/agent
    setTimeout(() => {
      const ownerReply = addStoredChatMessage(property.id, {
        productId: property.id,
        senderId: 'owner',
        senderName: property.owner.name,
        text: `Thanks for your interest in "${property.title}"! Feel free to message on WhatsApp or call for a site visit.`,
        isMe: false
      });
      setChatMessages((prev) => [...prev, ownerReply]);
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} for ${property.price} on LocalPlus Real Estate`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const handleWhatsAppClick = () => {
    const rawNumber = property.owner.whatsapp || property.whatsappNumber || '919840123456';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const prefilledText = encodeURIComponent(
      `Hi, I'm interested in your property listed on LocalPlus. Is it still available?\nProperty: ${property.title} (${property.price}) in ${property.location}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${prefilledText}`, '_blank');
  };

  const ownerRoleLabel = property.owner?.role || property.sellerType || 'Owner';

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
            title="Share Property"
          >
            <Share2 size={15} />
          </button>

          <button
            onClick={() => onToggleSave(property.id)}
            className="m-action-circle-btn"
            style={{ width: '32px', height: '32px', color: isSaved ? '#ef4444' : 'inherit' }}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Heart
              size={15}
              fill={isSaved ? '#ef4444' : 'none'}
              color={isSaved ? '#ef4444' : 'currentColor'}
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
          Property link copied to clipboard!
        </div>
      )}

      {/* Body Content */}
      <div className="p-detail-body">
        {/* Large Image Preview with Carousel */}
        <div className="p-image-carousel">
          <img
            src={images[activeMediaIndex]}
            alt={property.title}
            className="p-carousel-main-img"
          />

          <span className="p-carousel-badge">
            {activeMediaIndex + 1}/{images.length}
          </span>

          {images.length > 1 && (
            <>
              <button
                className="p-carousel-nav-btn left"
                onClick={handlePrevMedia}
                title="Previous Image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="p-carousel-nav-btn right"
                onClick={handleNextMedia}
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
                className={`p-thumb-item ${activeMediaIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveMediaIndex(idx)}
              >
                <img src={img} alt={`thumb-${idx}`} />
              </div>
            ))}
          </div>
        )}

        {/* Title & Price */}
        <div>
          <h2 className="p-detail-title">{property.title}</h2>
          <div className="p-price-row" style={{ marginTop: '8px' }}>
            <span className="p-detail-price">{property.price}</span>
            <span className="p-badge-negotiable">For {property.listingType}</span>
          </div>
          <div className="p-detail-location" style={{ marginTop: '6px' }}>
            <MapPin size={13} color="var(--lp-orange)" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Meta badges (Verified Property, Posted Time, Super Area) */}
        <div className="p-meta-badges-strip">
          {(property.isVerified || property.owner?.verified) && (
            <span className="p-meta-pill verified">
              <ShieldCheck size={13} />
              <span>Verified Property</span>
            </span>
          )}

          <span className="p-meta-pill">
            <Clock size={13} />
            <span>{property.postedAt || 'Recently'}</span>
          </span>

          <span className="p-meta-pill">
            <Eye size={13} />
            <span>{property.areaSqFt} Sq.Ft</span>
          </span>
        </div>

        {/* Property Specifications Table */}
        <div className="p-specs-block">
          <span className="p-specs-heading">Product Details</span>
          <div className="p-specs-table">
            <div className="p-specs-row">
              <span className="p-specs-key">Property Type:</span>
              <span className="p-specs-val">{property.propertyType}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Listing Type:</span>
              <span className="p-specs-val">{property.listingType === 'Rent' || property.listingType === 'Lease' ? 'Rent' : 'Sale'}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Bedrooms:</span>
              <span className="p-specs-val">{property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Bathrooms:</span>
              <span className="p-specs-val">{property.bathrooms ? `${property.bathrooms} Baths` : 'N/A'}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Super Area:</span>
              <span className="p-specs-val">{property.areaSqFt} Sq.Ft</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Furnishing:</span>
              <span className="p-specs-val">{property.furnishing || property.specifications?.furnishing || 'Semi-Furnished'}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Floor:</span>
              <span className="p-specs-val">{property.floor || property.specifications?.floor || '3rd Floor'}</span>
            </div>

            <div className="p-specs-row">
              <span className="p-specs-key">Parking:</span>
              <span className="p-specs-val">{property.parking || property.specifications?.parking || '1 Parking'}</span>
            </div>

            {property.propertyAge && (
              <div className="p-specs-row">
                <span className="p-specs-key">Property Age:</span>
                <span className="p-specs-val">{property.propertyAge}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Block */}
        <div className="p-desc-block">
          <span className="p-specs-heading" style={{ display: 'block', marginBottom: '6px' }}>
            Description
          </span>
          <p>{property.description}</p>
        </div>

        {/* Seller / Owner Card (Matching Image 2 and 3) */}
        <div className="p-seller-card">
          <div className="p-seller-info">
            <img
              src={property.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={property.owner?.name || 'Owner'}
              className="p-seller-avatar"
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="p-seller-name">{property.owner?.name || 'Owner'}</span>
                <CheckCircle2 size={13} color="#10b981" />
              </div>
              <span className="p-seller-meta">
                {ownerRoleLabel} • Member since Oct 2023
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d97706' }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span>4.8 Rating</span>
                </span>
                <span>•</span>
                <span>96% Trust Score</span>
              </div>
            </div>
          </div>

          <button
            className="p-view-profile-btn"
            onClick={() => alert(`Viewing profile for ${property.owner?.name || 'Owner'}`)}
          >
            View Profile
          </button>
        </div>

        {/* Action Buttons: [ Save ] [ WhatsApp ] [ Contact ] - Contained INSIDE app view */}
        <div className="p-action-buttons-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr 1.35fr', gap: '8px' }}>
          <button
            className={`p-btn-save ${isSaved ? 'saved' : ''}`}
            onClick={() => onToggleSave(property.id)}
          >
            <Heart
              size={15}
              fill={isSaved ? '#ef4444' : 'none'}
              color={isSaved ? '#ef4444' : 'currentColor'}
            />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            className="p-btn-whatsapp"
            onClick={handleWhatsAppClick}
            title="Chat directly on WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 10px',
              borderRadius: '20px',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
            }}
            title="Call contact directly"
          >
            <Phone size={14} />
            <span>Contact</span>
          </button>
        </div>

        {/* Chat with Owner / Agent */}
        <div className="p-chat-box">
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--lp-navy)' }}>
            Chat with {ownerRoleLabel}
          </span>

          <div className="p-chat-messages">
            {chatMessages.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--lp-slate-light)', textAlign: 'center', padding: '10px 0' }}>
                Start a private chat with {property.owner?.name || 'the seller'}
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
              placeholder={`Ask ${property.owner?.name || 'the seller'} a question...`}
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
              style={{ background: 'none', border: 'none', color: 'var(--lp-orange)', cursor: 'pointer', padding: '4px' }}
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* Call Confirmation Modal */}
      {showCallModal && (
        <div className="modal-overlay-backdrop" onClick={() => setShowCallModal(false)} style={{ zIndex: 110 }}>
          <div className="m-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '340px', textAlign: 'center', padding: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Phone size={22} />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Connect with {property.owner?.name || 'Seller'}
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Registered phone number:
            </p>
            <a
              href={`tel:${property.owner?.phone || property.contactNumber || '+919840123456'}`}
              style={{
                display: 'block',
                padding: '10px',
                borderRadius: '8px',
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '8px'
              }}
            >
              📞 Call {property.owner?.phone || property.contactNumber || '+91 98401 23456'}
            </a>
            <button
              onClick={() => setShowCallModal(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
