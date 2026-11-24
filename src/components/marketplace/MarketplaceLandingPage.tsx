import React from 'react';
import {
  ShoppingBag,
  Building,
  Briefcase,
  ChevronRight,
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MarketplaceLandingPageProps {
  onSelectBuyAndSell: () => void;
  onSelectRealEstate: () => void;
  onSelectJobs: () => void;
  locationName?: string;
  totalProductsCount?: number;
  totalPropertiesCount?: number;
  totalJobsCount?: number;
}

export const MarketplaceLandingPage: React.FC<MarketplaceLandingPageProps> = ({
  onSelectBuyAndSell,
  onSelectRealEstate,
  onSelectJobs,
  locationName = 'Chennai & Tiruvallur',
  totalProductsCount = 0,
  totalPropertiesCount = 0,
  totalJobsCount = 0
}) => {
  const categories = [
    {
      id: 'olx',
      title: 'Buy & Sell',
      subtitle: 'Mobiles, electronics, vehicles, furniture, fashion & household items. Buy or sell locally.',
      badge: `${totalProductsCount} Active Listings`,
      icon: <ShoppingBag size={28} strokeWidth={2.2} />,
      onClick: onSelectBuyAndSell
    },
    {
      id: 'real_estate',
      title: 'Real Estate',
      subtitle: 'Houses, flats, residential plots, commercial properties, land & rentals in your locality.',
      badge: `${totalPropertiesCount} Properties Available`,
      icon: <Building size={28} strokeWidth={2.2} />,
      onClick: onSelectRealEstate
    },
    {
      id: 'jobs',
      title: 'Jobs',
      subtitle: 'Local job vacancies, hiring alerts, full-time, part-time & career opportunities nearby.',
      badge: `${totalJobsCount} Open Positions`,
      icon: <Briefcase size={28} strokeWidth={2.2} />,
      onClick: onSelectJobs
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        padding: '16px 14px 28px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Banner in Spotlight360 Orange Theme */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #ffffff 100%)',
          border: '1px solid #fed7aa',
          borderRadius: '18px',
          padding: '18px 16px',
          marginBottom: '18px',
          boxShadow: '0 4px 16px rgba(249, 115, 22, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 9px',
                borderRadius: '12px',
                background: '#ea580c',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Sparkles size={11} />
              Marketplace
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#c2410c'
            }}
          >
            <MapPin size={13} />
            <span>{locationName}</span>
          </div>
        </div>

        <h1
          style={{
            margin: '6px 0 4px',
            fontSize: '20px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em'
          }}
        >
          Spotlight<span style={{ color: '#ea580c' }}>360</span> Marketplace
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            lineHeight: 1.45
          }}
        >
          Select a category below to explore verified local classifieds, properties, and jobs.
        </p>
      </div>

      {/* 2. Exactly Three Category Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={cat.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cat.onClick();
              }
            }}
            style={{
              background: '#ffffff',
              border: '1.5px solid #fed7aa',
              borderRadius: '16px',
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 10px rgba(249, 115, 22, 0.06)',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#ea580c';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#fed7aa';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(249, 115, 22, 0.06)';
            }}
          >
            {/* Orange Icon Container */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: '1px solid #fdba74',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.12)'
              }}
            >
              {cat.icon}
            </div>

            {/* Content Text Block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '4px'
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {cat.title}
                </h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: '#fff7ed',
                    border: '1px solid #ffedd5',
                    color: '#ea580c',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {cat.badge}
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '12.5px',
                  color: '#64748b',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {cat.subtitle}
              </p>
            </div>

            {/* Right Action Chevron */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ChevronRight size={18} strokeWidth={2.4} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
