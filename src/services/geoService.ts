import type { LocationCoordinates, NewsCategory } from '../types';

/**
 * Calculates Haversine distance in kilometers between two geo coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats distance into a human-readable tag (e.g. "0.8 km away" or "450m away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters}m away`;
  }
  return `${distanceKm} km away`;
}

/**
 * Checks if a post's location falls within the user's selected radius filter
 */
export function isWithinRadius(
  postLoc: LocationCoordinates,
  userLoc: LocationCoordinates,
  radiusKm: number
): boolean {
  const dist = calculateDistanceKm(
    userLoc.lat,
    userLoc.lng,
    postLoc.lat,
    postLoc.lng
  );
  return dist <= radiusKm;
}

/**
 * Category-aware distance decay multiplier.
 */
export function getDistanceDecayScore(
  category: NewsCategory,
  distanceKm: number
): number {
  switch (category) {
    case 'traffic':
    case 'safety':
      return Math.max(0.1, 1 - distanceKm / 12);
    case 'weather':
      return Math.max(0.2, 1 - distanceKm / 25);
    case 'civic':
    case 'business':
    case 'community':
    case 'sports':
      return Math.max(0.3, 1 - distanceKm / 45);
    default:
      return Math.max(0.2, 1 - distanceKm / 30);
  }
}

// Preset local hubs across North Tamil Nadu (Chennai & Tiruvallur Districts)
export const PRESET_LOCATIONS: LocationCoordinates[] = [
  {
    placeName: 'Chennai Central & Parrys (George Town)',
    neighborhood: 'Chennai Central Hub',
    district: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    radiusMeters: 4000
  },
  {
    placeName: 'Avadi Municipal Corporation & Ambattur',
    neighborhood: 'Avadi / Ambattur Belt',
    district: 'Tiruvallur',
    lat: 13.1147,
    lng: 80.1105,
    radiusMeters: 5000
  },
  {
    placeName: 'Tiruvallur Town & District Collectorate',
    neighborhood: 'Tiruvallur HQ',
    district: 'Tiruvallur',
    lat: 13.1438,
    lng: 79.9083,
    radiusMeters: 6000
  },
  {
    placeName: 'Poonamallee & Chennai Outer Ring Road (ORR)',
    neighborhood: 'Poonamallee Arterial',
    district: 'Tiruvallur / Chennai',
    lat: 13.0489,
    lng: 80.0967,
    radiusMeters: 5000
  },
  {
    placeName: 'Red Hills & Puzhal Reservoir Catchment',
    neighborhood: 'North Chennai / Red Hills',
    district: 'Tiruvallur',
    lat: 13.2012,
    lng: 80.1872,
    radiusMeters: 6000
  }
];
