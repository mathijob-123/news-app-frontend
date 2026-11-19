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
 * Normalizes location IDs (e.g. 'thiruvallur' -> 'tiruvallur')
 */
export function normalizeLocationId(id?: string | null): string {
  if (!id) return '';
  const clean = id.trim().toLowerCase();
  if (clean === 'thiruvallur' || clean === 'tiruvallur') return 'tiruvallur';
  return clean;
}

/**
 * Normalizes a place or neighborhood into a standardized hyperlocal hub key.
 * Distinguishes Ponneri from Tiruvallur Town, Minjur, Avadi, etc.
 */
export function getHubIdentifier(loc?: LocationCoordinates | null): string {
  if (!loc) return '';
  if (loc.locationId) {
    const norm = normalizeLocationId(loc.locationId);
    if (norm) return norm;
  }
  const text = `${loc.neighborhood || ''} ${loc.placeName || ''} ${loc.area || ''} ${loc.taluk || ''}`.toLowerCase();
  
  if (text.includes('ponneri')) return 'ponneri';
  if (text.includes('minjur')) return 'minjur';
  if (text.includes('gummidipoondi')) return 'gummidipoondi';
  if (text.includes('avadi')) return 'avadi';
  if (text.includes('ambattur')) return 'ambattur';
  if (text.includes('red hills') || text.includes('puzhal') || text.includes('redhills')) return 'redhills';
  if (text.includes('poonamallee')) return 'poonamallee';
  if (text.includes('anna nagar') || text.includes('annanagar')) return 'annanagar';
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
 * 1. Location ID Match: If both locations have locationId, they must match exactly.
 * 2. Hub Key Match: If both locations belong to a specific hub (e.g. 'ponneri' === 'ponneri' or 'tiruvallur' === 'tiruvallur'), it matches.
 * 3. Cross-Hub Isolation: A 'ponneri' post will NEVER match a 'tiruvallur' hub or vice-versa, even though both share the Tiruvallur district.
 */
export function isLocationMatch(
  postLoc: LocationCoordinates,
  userLoc: LocationCoordinates,
  distanceKm?: number
): boolean {
  if (!postLoc || !userLoc) return false;

  // 1. Direct locationId check (highest precision)
  const userLocId = normalizeLocationId(userLoc.locationId);
  const postLocId = normalizeLocationId(postLoc.locationId);
  if (userLocId && postLocId) {
    return userLocId === postLocId;
  }

  // 2. Standardized Hub Identifier comparison
  const userHub = getHubIdentifier(userLoc);
  const postHub = getHubIdentifier(postLoc);

  if (userHub && postHub) {
    // If both have recognized specific hub identifiers, they must match exactly
    // Strict isolation: different hubs (e.g. Ponneri vs Tiruvallur vs Minjur) MUST NOT match
    return userHub === postHub;
  }

  if (userHub && !postHub) {
    // User selected a known hub, but post has no locationId: check if post text explicitly mentions userHub
    const postText = `${postLoc.neighborhood || ''} ${postLoc.placeName || ''} ${postLoc.area || ''}`.toLowerCase();
    if (userHub === 'tiruvallur') {
      if ((postText.includes('tiruvallur') || postText.includes('thiruvallur')) &&
          !postText.includes('ponneri') && !postText.includes('gummidipoondi') && !postText.includes('minjur')) {
        return true;
      }
      return false;
    }
    return postText.includes(userHub);
  }

  // Proximity check only if neither has a distinct recognized hub
  const dist =
    typeof distanceKm === 'number'
      ? distanceKm
      : calculateDistanceKm(userLoc.lat, userLoc.lng, postLoc.lat, postLoc.lng);

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
    locationId: 'ponneri',
    placeName: 'Ponneri Town & Taluk',
    neighborhood: 'Ponneri',
    district: 'Tiruvallur',
    taluk: 'Ponneri',
    area: 'Ponneri',
    lat: 13.3331,
    lng: 80.1989,
    radiusMeters: 5000
  },
  {
    locationId: 'tiruvallur',
    placeName: 'Tiruvallur Town & Collectorate',
    neighborhood: 'Tiruvallur',
    district: 'Tiruvallur',
    taluk: 'Tiruvallur',
    area: 'Tiruvallur',
    lat: 13.1438,
    lng: 79.9083,
    radiusMeters: 5000
  },
  {
    locationId: 'minjur',
    placeName: 'Minjur Hub & Port Access',
    neighborhood: 'Minjur',
    district: 'Tiruvallur',
    taluk: 'Ponneri',
    area: 'Minjur',
    lat: 13.2842,
    lng: 80.2625,
    radiusMeters: 5000
  },
  {
    locationId: 'gummidipoondi',
    placeName: 'Gummidipoondi Industrial Belt',
    neighborhood: 'Gummidipoondi',
    district: 'Tiruvallur',
    taluk: 'Gummidipoondi',
    area: 'Gummidipoondi',
    lat: 13.4072,
    lng: 80.1306,
    radiusMeters: 5000
  },
  {
    locationId: 'avadi',
    placeName: 'Avadi Municipal Corporation',
    neighborhood: 'Avadi',
    district: 'Tiruvallur',
    taluk: 'Avadi',
    area: 'Avadi',
    lat: 13.1147,
    lng: 80.1017,
    radiusMeters: 5000
  },
  {
    locationId: 'ambattur',
    placeName: 'Ambattur Industrial Estate',
    neighborhood: 'Ambattur',
    district: 'Tiruvallur',
    taluk: 'Ambattur',
    area: 'Ambattur',
    lat: 13.1143,
    lng: 80.1548,
    radiusMeters: 5000
  },
  {
    locationId: 'redhills',
    placeName: 'Red Hills & Puzhal Catchment',
    neighborhood: 'Red Hills',
    district: 'Tiruvallur',
    taluk: 'Ponneri',
    area: 'Red Hills',
    lat: 13.2012,
    lng: 80.1872,
    radiusMeters: 5000
  },
  {
    locationId: 'poonamallee',
    placeName: 'Poonamallee & Outer Ring Road (ORR)',
    neighborhood: 'Poonamallee',
    district: 'Tiruvallur',
    taluk: 'Poonamallee',
    area: 'Poonamallee',
    lat: 13.0489,
    lng: 80.0967,
    radiusMeters: 5000
  },
  {
    locationId: 'chennai_central',
    placeName: 'Chennai Central & Parrys (George Town)',
    neighborhood: 'Chennai Central Hub',
    district: 'Chennai',
    taluk: 'Egmore',
    area: 'Chennai Central',
    lat: 13.0827,
    lng: 80.2707,
    radiusMeters: 5000
  },
  {
    locationId: 'annanagar',
    placeName: 'Anna Nagar West & Tower',
    neighborhood: 'Anna Nagar',
    district: 'Chennai',
    taluk: 'Aminjikarai',
    area: 'Anna Nagar',
    lat: 13.0850,
    lng: 80.2101,
    radiusMeters: 5000
  }
];
