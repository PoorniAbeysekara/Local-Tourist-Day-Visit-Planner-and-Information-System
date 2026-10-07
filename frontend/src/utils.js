// Baddegama town centre (approximate) - start point for plans
export const BASE = { lat: 6.1736, lng: 80.1844, name: 'Baddegama' };

export function haversineKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// REQ-4.5 (no live traffic): straight-line x 1.4 road factor at ~35 km/h average.
// TODO: replace with OSRM route durations once TBD-4 is decided.
export function travelMinutes(a, b) {
  return Math.max(5, Math.round(((haversineKm(a, b) * 1.4) / 35) * 60));
}

export function formatMinutes(m) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}

export const feeLabel = (p) => (p.entranceFee > 0 ? `LKR ${p.entranceFee.toLocaleString()}` : 'Free');

export function hoursLabel(p) {
  if (p.open24h) return 'Open 24 hrs';
  if (!p.openingHours?.length) return 'Hours not listed';
  const today = p.openingHours.find((h) => h.day === new Date().getDay()) || p.openingHours[0];
  return `${today.open} – ${today.close}`;
}

export const distLabel = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`);

export const statusOf = (p) => (p.isTempClosed ? 'Closed' : p.isOpenNow ? 'Open now' : 'Closed now');
