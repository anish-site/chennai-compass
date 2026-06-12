export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle ("as the crow flies") distance between two points, in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** "~850 m" / "~3.2 km" / "~55 km" — explicitly approximate (straight line). */
export function formatDistance(km: number): string {
  if (km < 1) return `~${Math.round(km * 1000)} m`;
  if (km < 10) return `~${km.toFixed(1)} km`;
  return `~${Math.round(km)} km`;
}
