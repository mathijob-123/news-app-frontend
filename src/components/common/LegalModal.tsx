import React, { useState } from 'react';
import { ShieldCheck, FileText, X, CheckCircle2, Lock, MapPin, AlertCircle, Sparkles, Phone } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  // Sync state if initialTab prop changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out'
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fed7aa'
              }}
            >
              <img src="/logo.png" alt="Spotlight360" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                Spotlight<span style={{ color: '#ea580c' }}>360</span> Legal
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                Hyperlocal Platform Trust & Compliance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#f8fafc',
            padding: '6px 16px',
            borderBottom: '1px solid #e2e8f0',
            gap: '8px'
          }}
        >
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'privacy' ? '#ffffff' : 'transparent',
              color: activeTab === 'privacy' ? '#ea580c' : '#64748b',
              boxShadow: activeTab === 'privacy' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <ShieldCheck size={16} />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'terms' ? '#ffffff' : 'transparent',
              color: activeTab === 'terms' ? '#ea580c' : '#64748b',
              boxShadow: activeTab === 'terms' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <FileText size={16} />
            <span>Terms of Use</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: '#334155'
          }}
        >
          {activeTab === 'privacy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                <Lock size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#9a3412', lineHeight: 1.5 }}>
                  <strong>Your Privacy is Sacred:</strong> Spotlight360 only uses your location to discover hyperlocal news, citizen reports, and nearby marketplace deals within your chosen radius. We never sell your personal data. For privacy support or assistance, call <strong>9042211470</strong>.
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  1. Information We Collect
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  • <strong>Account Details:</strong> When you register via Google Sign-In or email/phone, we receive your name, email address, mobile number, and profile photo.<br />
                  • <strong>Hyperlocal Location:</strong> With your permission, we obtain approximate GPS coordinates to display news and listings relevant to your neighborhood.<br />
                  • <strong>Content & Media:</strong> Photos, videos, and comments uploaded by you for news verification and marketplace listings.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  2. Hyperlocal Geo-Fencing & Radius Rules
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  Spotlight360 is built on strict locality boundaries (5km – 10km). News videos and classifieds are served according to district and neighborhood tagging (e.g., Chennai, Ponneri, Tiruvallur) to ensure content remains relevant and authentic.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  3. Cloudflare R2 & Secure Media Storage
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  All video reels, images, and audio attachments are transmitted via TLS 1.3 encryption and stored securely on Cloudflare R2 bucket infrastructure.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  4. Marketplace & Creator Monetization Privacy
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  • When you contact a Spotlight360 seller or job recruiter via WhatsApp or Call, your number is only shared directly during that interaction.<br />
                  • Creator earnings, payout history, and bank/UPI details are strictly confidential and encrypted in our database.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  5. Data Deletion & Rights
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  You have the right to request full account deletion and removal of any published video reports at any time by contacting our support team at <strong>privacy@spotlight360.local</strong> or calling <strong>9042211470</strong>.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  6. Contact & Grievance Redressal
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  If you have any questions or concerns regarding our Privacy Policy or data practices, you may reach us directly:<br />
                  • <strong>Phone / Helpline:</strong> <a href="tel:9042211470" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}>9042211470</a><br />
                  • <strong>WhatsApp:</strong> <a href="https://wa.me/919042211470" target="_blank" rel="noopener noreferrer" style={{ color: '#ea580c', fontWeight: 700, textDecoration: 'none' }}>+91 9042211470</a><br />
                  • <strong>Email:</strong> <strong>privacy@spotlight360.local</strong>
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                  <strong>Citizen Journalism Community Standards:</strong> Spotlight360 connects citizen journalists and communities. Authentic reporting, truthful marketplace listings, and mutual respect are mandatory.
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  1. Acceptance of Terms
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  By accessing or creating an account on Spotlight360, you agree to comply with these Terms of Use, our community safety standards, and all applicable laws in your jurisdiction.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  2. Citizen Journalism & Verification
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  • You certify that news videos and photos submitted by you depict genuine, unaltered events.<br />
                  • Deliberately posting fake news, hate speech, or defaming local businesses or individuals will result in immediate account suspension and revocation of creator earnings.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  3. Marketplace Buy & Sell (Spotlight360, Jobs, Real Estate)
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  • Spotlight360 acts solely as a communication platform connecting local buyers, sellers, job seekers, and property agents.<br />
                  • Users must verify products and meet in safe, public places. For support, call <strong>9042211470</strong>.<br />
                  • Spotlight360 does not guarantee third-party transactions or hold escrow payments.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  4. Copyright & Intellectual Property
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  You retain ownership of the original content you create. You grant Spotlight360 a worldwide, non-exclusive license to host, display, and distribute your public posts within the platform. If you believe your copyrighted work has been infringed, submit a report via our Copyright Manager.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  5. User-Generated Content and Limitation of Liability
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  • <strong>1. Content Responsibility:</strong> Users are solely responsible for all content they upload, post, share, or publish on the Spotlight 360 platform, including Reels, videos, photos, images, comments, captions, text, and other media.<br />
                  • <strong>2. No Creation or Control:</strong> Spotlight 360 does not create, own, or control user-uploaded content and is not responsible for the accuracy, authenticity, legality, originality, or reliability of such content.<br />
                  • <strong>3. Limitation of Liability:</strong> Spotlight 360 shall not be held responsible for any disputes, damages, losses, copyright violations, defamation claims, misleading information, or legal issues arising from content uploaded or shared by users, to the extent permitted by applicable law.<br />
                  • <strong>4. Third-Party Rights & Consent:</strong> Users must ensure that they have the necessary rights, permissions, and consent before uploading or sharing any third-party content.<br />
                  • <strong>5. Violation & Account Actions:</strong> If any uploaded content violates applicable laws, intellectual property rights, privacy rights, or Spotlight 360 community guidelines, Spotlight 360 reserves the right to remove or restrict access to that content and take appropriate action against the account.<br />
                  • <strong>6. Full User Accountability:</strong> Users agree to take full responsibility for the content they publish and any consequences resulting from their uploads.<br />
                  • <strong>7. Authority Cooperation:</strong> Spotlight 360 may cooperate with relevant authorities when legally required.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  6. Updates to Terms (Version 2.4)
                </h4>
                <p style={{ margin: 0, color: '#475569' }}>
                  We may periodically revise these terms to reflect new legal guidelines or platform features. Effective Date: November 23, 2026. Continued use of Spotlight360 implies acceptance of updated terms.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Effective Date: November 23, 2026 (v2.4) • Spotlight360
          </span>
          <button
            onClick={() => {
              try {
                localStorage.setItem('spotlight_terms_accepted_v2_4', new Date().toISOString());
              } catch {}
              onClose();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={15} />
            <span>I Accept & Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
};

