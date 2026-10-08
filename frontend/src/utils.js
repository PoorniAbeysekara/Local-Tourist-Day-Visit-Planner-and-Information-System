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

export const feeLabel = (p) => {
  if (!p.fees) return p.entranceFee > 0 ? `LKR ${p.entranceFee.toLocaleString()}` : 'Free';
  const { foreignAdult, local } = p.fees;
  if (!foreignAdult && !local) return 'Free';
  return `LKR ${foreignAdult.toLocaleString()} (F) / ${local.toLocaleString()} (L)`;
};

export function hoursLabel(p) {
  if (p.open24h) return 'Open 24 hrs';
  if (!p.openingHours?.length) return 'Hours not listed';
  const today = p.openingHours[0];
  return `${today.open} – ${today.close}`;
}

export function closedLabel(p) {
  if (p.open24h) return null;
  const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const openDays = p.openingHours?.map(h => h.day) || [];
  if (openDays.length === 7 && !p.closedOnPublicHolidays) return null;
  
  const closedStr = [];
  if (openDays.length < 7 && openDays.length > 0) {
    const closed = allDays.filter((_, i) => !openDays.includes(i));
    closedStr.push(closed.join(', '));
  }
  if (p.closedOnPublicHolidays) closedStr.push('Public Holidays');
  
  return closedStr.length ? closedStr.join(' and ') : null;
}

export const distLabel = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`);

export const statusOf = (p) => (p.isTempClosed ? 'Closed' : p.isOpenNow ? 'Open now' : 'Closed now');
