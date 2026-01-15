/**
 * Proximity Sorting Utility
 * Calculates distance between user location and items, sorts by proximity
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface ItemWithCoordinates {
  id: string | number;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lng?: number | string;
  [key: string]: any;
}

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
export const calculateDistance = (
  userCoords: LocationCoordinates,
  itemCoords: LocationCoordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(itemCoords.lat - userCoords.lat);
  const dLng = toRad(itemCoords.lng - userCoords.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userCoords.lat)) *
      Math.cos(toRad(itemCoords.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Extract coordinates from an item
 * Handles various API response formats
 */
const getItemCoordinates = (
  item: ItemWithCoordinates
): LocationCoordinates | null => {
  const lat = parseFloat(String(item.latitude || item.lat || 0));
  const lng = parseFloat(String(item.longitude || item.lng || 0));

  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return null;
  }

  return { lat, lng };
};

/**
 * Sort items by proximity to user location
 * Returns items with distance_km property added
 */
export const sortByProximity = <T extends ItemWithCoordinates>(
  items: T[],
  userCoords: LocationCoordinates | null | undefined
): T[] => {
  if (!userCoords || !userCoords.lat || !userCoords.lng) {
    return items;
  }

  return items
    .map((item) => {
      const itemCoords = getItemCoordinates(item);
      const distance = itemCoords
        ? calculateDistance(userCoords, itemCoords)
        : Infinity;

      return {
        ...item,
        distance_km: distance,
      };
    })
    .sort((a, b) => (a.distance_km || Infinity) - (b.distance_km || Infinity));
};

/**
 * Filter items by distance radius
 * Returns items within the specified radius in kilometers
 */
export const filterByRadius = <T extends ItemWithCoordinates>(
  items: T[],
  userCoords: LocationCoordinates | null | undefined,
  radiusKm: number
): T[] => {
  if (!userCoords || !userCoords.lat || !userCoords.lng) {
    return items;
  }

  return items.filter((item) => {
    const itemCoords = getItemCoordinates(item);
    if (!itemCoords) return false;

    const distance = calculateDistance(userCoords, itemCoords);
    return distance <= radiusKm;
  });
};

/**
 * Get nearby items (within default radius)
 * and all other items sorted by distance
 */
export const getNearbyAndSorted = <T extends ItemWithCoordinates>(
  items: T[],
  userCoords: LocationCoordinates | null | undefined,
  nearbyRadiusKm: number = 15
): { nearby: T[]; farther: T[] } => {
  if (!userCoords || !userCoords.lat || !userCoords.lng) {
    return { nearby: [], farther: items };
  }

  const nearby = filterByRadius(items, userCoords, nearbyRadiusKm);
  const farther = items.filter((item) => !nearby.find((n) => n.id === item.id));

  const sortedFarther = sortByProximity(farther, userCoords);

  return {
    nearby: sortByProximity(nearby, userCoords),
    farther: sortedFarther,
  };
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm === Infinity || !distanceKm) return "Distance unknown";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};
