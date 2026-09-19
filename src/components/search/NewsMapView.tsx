import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import type { VideoPost, LocationCoordinates } from '../../types';

interface NewsMapViewProps {
  posts: VideoPost[];
  userLocation: LocationCoordinates;
  onSelectPost: (post: VideoPost) => void;
}

// Category color map for pins
const CATEGORY_COLORS: Record<string, string> = {
  traffic: '#ea580c',
  weather: '#2563eb',
  civic: '#7c3aed',
  safety: '#ef4444',
  business: '#059669',
  sports: '#db2777',
  community: '#ff4500',
  all: '#ff4500'
};

const getCategorySvg = (cat: string) => {
  switch (cat) {
    case 'traffic':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.9 2 11.2V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    case 'safety':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'weather':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    case 'civic':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`;
    case 'sports':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`;
    default:
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`;
  }
};

export const NewsMapView: React.FC<NewsMapViewProps> = ({
  posts,
  userLocation,
  onSelectPost
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false
      });

      // Crisp OpenStreetMap / CartoDB Voyager Light tiles (clean white theme)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19
        }
      ).addTo(map);

      // User location radar pulse pin
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(255, 69, 0, 0.25); animation: beaconPing 1.8s infinite;"></div>
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #ff4500; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<b>You are here:</b><br>${userLocation.placeName}`);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add pins for each news post
    posts.forEach((post) => {
      const pinColor = CATEGORY_COLORS[post.category] || '#ff4500';

      const pinIcon = L.divIcon({
        className: 'news-pin',
        html: `
          <div style="
            background: ${pinColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${getCategorySvg(post.category)}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([post.location.lat, post.location.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`
          <div style="width: 180px; font-family: 'Inter', sans-serif;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${pinColor}; margin-bottom: 2px;">
              ${post.category} • ${post.distanceKm !== undefined ? post.distanceKm + 'km' : ''}
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a; line-height: 1.3; margin-bottom: 6px;">
              ${post.headline}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              ${post.location.neighborhood || post.location.placeName}
            </div>
            <button id="pin-btn-${post.id}" style="
              width: 100%;
              background: #ff4500;
              color: #ffffff;
              border: none;
              padding: 5px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">
              Watch Report Reel
            </button>
          </div>
        `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`pin-btn-${post.id}`);
        if (btn) {
          btn.onclick = () => onSelectPost(post);
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup on full unmount handled if necessary
    };
  }, [posts, userLocation]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-subtle)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="var(--brand-primary)" />
          <span>{posts.length} Hyperlocal events mapped</span>
        </span>
        <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Interactive Map</span>
      </div>
    </div>
  );
};
