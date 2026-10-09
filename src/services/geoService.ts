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
 * Normalizes a place or neighborhood into a standardized hyperlocal hub key.
 * Distinguishes Ponneri from Tiruvallur Town, Minjur, Avadi, etc.
 */
export function getHubIdentifier(loc?: LocationCoordinates | null): string {
  if (!loc) return '';
  const text = `${loc.neighborhood || ''} ${loc.placeName || ''}`.toLowerCase();
  
  if (text.includes('ponneri')) return 'ponneri';
  if (text.includes('minjur')) return 'minjur';
  if (text.includes('gummidipoondi')) return 'gummidipoondi';
  if (text.includes('avadi')) return 'avadi';
  if (text.includes('ambattur')) return 'ambattur';
  if (text.includes('red hills') || text.includes('puzhal')) return 'redhills';
  if (text.includes('poonamallee')) return 'poonamallee';
  if (text.includes('anna nagar')) return 'annanagar';
  if (text.includes('t nagar') || text.includes('t. nagar') || text.includes('tnagar')) return 'tnagar';
  if (text.includes('chennai central') || text.includes('parrys') || text.includes('george town') || text.includes('ripon')) return 'chennai_central';
  if (text.includes('tiruvallur') || text.includes('thiruvallur')) return 'tiruvallur';

  // Fallback to cleaned primary neighborhood/place
  return (loc.neighborhood || loc.placeName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
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
 * Strict Spotlight Rule: Checks whether a post belongs exclusively to the user's active local hub.
 * 
 * Criteria:
 * 1. Hub Key Match: If both locations belong to the same specific hub (e.g. 'ponneri' === 'ponneri' or 'tiruvallur' === 'tiruvallur'), it matches.
 * 2. Cross-Hub Isolation: A 'ponneri' post will NEVER match a 'tiruvallur' hub or vice-versa, even though both share the Tiruvallur district.
 * 3. Proximity Radius: If coordinates are within the hub's coverage radius (typically 5km - 6km), it matches. Ponneri and Tiruvallur are ~37km apart so proximity strictly separates them.
 */
export function isLocationMatch(
  postLoc: LocationCoordinates,
  userLoc: LocationCoordinates,
  distanceKm?: number
): boolean {
  if (!postLoc || !userLoc) return false;

  const userHub = getHubIdentifier(userLoc);
  const postHub = getHubIdentifier(postLoc);

  // If both have recognized specific hub identifiers, they must match exactly
  if (userHub && postHub) {
    if (userHub === postHub) {
      return true;
    }
    // Strict isolation: different hubs (e.g. Ponneri vs Tiruvallur Town) MUST NOT match
    return false;
  }

  // Calculate distance
  const dist =
    typeof distanceKm === 'number'
      ? distanceKm
      : calculateDistanceKm(userLoc.lat, userLoc.lng, postLoc.lat, postLoc.lng);

  // Proximity check: use user radius or strict default 6km
  const effectiveRadiusKm = userLoc.radiusMeters
    ? Math.min(Math.max(userLoc.radiusMeters / 1000, 3), 8)
    : 6;

  if (dist <= effectiveRadiusKm) {
    return true;
  }

  // Name keyword check if neither was a standard hub
  const userPlace = (userLoc.placeName || '').trim().toLowerCase();
  const postPlace = (postLoc.placeName || '').trim().toLowerCase();
  const userNeighborhood = (userLoc.neighborhood || '').trim().toLowerCase();
  const postNeighborhood = (postLoc.neighborhood || '').trim().toLowerCase();

  if (userNeighborhood && postNeighborhood && userNeighborhood === postNeighborhood) {
    return true;
  }

  if (userPlace && postPlace && userPlace === postPlace) {
    return true;
  }

  return false;
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

// Preset local hubs across North Tamil Nadu (Ponneri, Tiruvallur, Avadi, Chennai, etc.)
export const PRESET_LOCATIONS: LocationCoordinates[] = [
  {
    placeName: 'Ponneri Town & Taluk',
    neighborhood: 'Ponneri',
    district: 'Tiruvallur',
    lat: 13.3331,
    lng: 80.1989,
    radiusMeters: 5000
  },
  {
    placeName: 'Tiruvallur Town & Collectorate',
    neighborhood: 'Tiruvallur',
    district: 'Tiruvallur',
    lat: 13.1438,
    lng: 79.9083,
    radiusMeters: 5000
  },
  {
    placeName: 'Minjur Hub & Port Access',
    neighborhood: 'Minjur',
    district: 'Tiruvallur',
    lat: 13.2842,
    lng: 80.2625,
    radiusMeters: 5000
  },
  {
    placeName: 'Gummidipoondi Industrial Belt',
    neighborhood: 'Gummidipoondi',
    district: 'Tiruvallur',
    lat: 13.4072,
    lng: 80.1306,
    radiusMeters: 5000
  },
  {
    placeName: 'Avadi Municipal Corporation',
    neighborhood: 'Avadi',
    district: 'Tiruvallur',
    lat: 13.1147,
    lng: 80.1017,
    radiusMeters: 5000
  },
  {
    placeName: 'Ambattur Industrial Estate',
    neighborhood: 'Ambattur',
    district: 'Tiruvallur',
    lat: 13.1143,
    lng: 80.1548,
    radiusMeters: 5000
  },
  {
    placeName: 'Red Hills & Puzhal Catchment',
    neighborhood: 'Red Hills',
    district: 'Tiruvallur',
    lat: 13.2012,
    lng: 80.1872,
    radiusMeters: 5000
  },
  {
    placeName: 'Poonamallee & Outer Ring Road (ORR)',
    neighborhood: 'Poonamallee',
    district: 'Tiruvallur',
    lat: 13.0489,
    lng: 80.0967,
    radiusMeters: 5000
  },
  {
    placeName: 'Chennai Central & Parrys (George Town)',
    neighborhood: 'Chennai Central Hub',
    district: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    radiusMeters: 5000
  },
  {
    placeName: 'Anna Nagar West & Tower',
    neighborhood: 'Anna Nagar',
    district: 'Chennai',
    lat: 13.0850,
    lng: 80.2101,
    radiusMeters: 5000
  }
];
