export const BISSAU_CENTER: [number, number] = [11.8615, -15.5836];
export const DEFAULT_ZOOM = 13;

const EARTH_RADIUS_KM = 6371;

export function distanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDistance(km: number | null): string {
  if (km === null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function googleMapsUrl(latitude: number | null, longitude: number | null, address: string) {
  const query =
    latitude !== null && longitude !== null
      ? `${latitude},${longitude}`
      : encodeURIComponent(address);

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
