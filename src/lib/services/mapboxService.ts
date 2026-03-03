/**
 * Mapbox Directions Service
 * Fetches a driving route between two coordinates, decodes the
 * compressed polyline geometry, and calculates ETA + shipping cost.
 *
 * API Reference:
 *   GET /directions/v5/mapbox/driving/{lon1},{lat1};{lon2},{lat2}
 *   ?geometries=polyline&access_token={TOKEN}
 */

import polyline from '@mapbox/polyline';
import { Config } from '@/src/lib/core/config';
import { Coordinates, DeliveryInfo } from '@/src/lib/core/types';

const MAPBOX_BASE = 'https://api.mapbox.com/directions/v5/mapbox/driving';

// ─── Types matching the Mapbox API response ───────────────────────────────────

interface MapboxRoute {
  distance: number;   // meters
  duration: number;   // seconds
  geometry: string;   // encoded polyline (precision 5)
}

interface MapboxDirectionsResponse {
  routes: MapboxRoute[];
  code: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches a driving route from `origin` (restaurant) to `destination` (user).
 * Returns a fully structured `DeliveryInfo` object ready to be stored.
 */
export async function getDeliveryRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<DeliveryInfo> {
  const { token } = Config.mapbox;

  if (!token) {
    throw new Error('EXPO_PUBLIC_MAPBOX_TOKEN is not configured. See SETUP2.md.');
  }

  // Mapbox expects coordinates in lon,lat order
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${MAPBOX_BASE}/${coords}?geometries=polyline&overview=full&access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
  }

  const data: MapboxDirectionsResponse = await response.json();

  if (data.code !== 'Ok' || data.routes.length === 0) {
    throw new Error('No route found between the two points.');
  }

  const route = data.routes[0];

  // Convert meters → km (rounded to 2 decimal places)
  const distanceKm = parseFloat((route.distance / 1000).toFixed(2));

  // Convert seconds → minutes (rounded up to nearest minute)
  const etaMinutes = Math.ceil(route.duration / 60);

  // Decode the compressed polyline into [lat, lon][] pairs
  // @mapbox/polyline returns [[lat, lng], [lat, lng], ...]
  const decodedPairs: [number, number][] = polyline.decode(route.geometry);

  // Convert to react-native-maps Coordinates format
  const decodedRoute: Coordinates[] = decodedPairs.map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return {
    distanceKm,
    etaMinutes,
    polyline: route.geometry,
    decodedRoute,
  };
}

/**
 * Calculates the shipping cost from a distance in km.
 * Uses the rate defined in Config.restaurant.costPerKm.
 */
export function calculateShippingCost(distanceKm: number): number {
  return parseFloat((distanceKm * Config.restaurant.costPerKm).toFixed(2));
}
