/**
 * areaCalculation.js
 *
 * Geodesic polygon area and perimeter calculations.
 * Uses lat/lng coordinates + Earth's radius — NOT screen pixels.
 */

const EARTH_RADIUS_METERS  = 6371008.8;
const SQ_METERS_PER_ACRE   = 4046.8564224;
const GUNTHA_PER_ACRE       = 40;
const SQ_METERS_PER_GUNTHA  = SQ_METERS_PER_ACRE / GUNTHA_PER_ACRE; // ~101.17
const SQ_FEET_PER_SQ_METER  = 10.7639;
const SQ_METERS_PER_HECTARE = 10000;

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Geodesic polygon area via the spherical excess formula.
 * Returns area in square meters.
 */
export function calculateGeodesicArea(points) {
  if (!points || points.length < 3) return 0;
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = toRad(points[i].lat);
    const lat2 = toRad(points[j].lat);
    const dLng = toRad(points[j].lng - points[i].lng);
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs(area) * (EARTH_RADIUS_METERS ** 2) / 2;
}

/**
 * Polygon perimeter using Haversine formula (great-circle distances).
 * Returns perimeter in meters.
 */
export function calculatePerimeter(points) {
  if (!points || points.length < 2) return 0;
  const n = points.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += haversineDistance(points[i], points[(i + 1) % n]);
  }
  return total;
}

function haversineDistance(p1, p2) {
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Unit helpers
export const sqMetersToSqFeet   = (m) => m * SQ_FEET_PER_SQ_METER;
export const sqMetersToAcres    = (m) => m / SQ_METERS_PER_ACRE;
export const sqMetersToGuntha   = (m) => m / SQ_METERS_PER_GUNTHA;
export const sqMetersToHectares = (m) => m / SQ_METERS_PER_HECTARE;
export const metersToFeet       = (m) => m * 3.28084;

/**
 * Convert sq meters to Acre + Guntha breakdown.
 *
 * Algorithm (IMPORTANT: do NOT pre-round totalAcres):
 *   totalAcres  = sqMeters / 4046.8564224
 *   wholeAcres  = floor(totalAcres)
 *   guntha      = (totalAcres - wholeAcres) * 40
 *
 * Examples: 1.75 ac => 1 Acre 30 Guntha | 0.25 ac => 10 Guntha
 */
export function sqMetersToAcreGuntha(sqMeters) {
  const totalAcres = sqMeters / SQ_METERS_PER_ACRE;
  const wholeAcres = Math.floor(totalAcres);
  const guntha     = (totalAcres - wholeAcres) * GUNTHA_PER_ACRE;
  return { totalAcres, acres: wholeAcres, guntha };
}

export function formatAcreGuntha({ acres, guntha }) {
  const g = Math.round(guntha * 10) / 10;
  if (acres === 0) return `${g} Guntha`;
  return `${acres} ${acres === 1 ? 'Acre' : 'Acres'} ${g} Guntha`;
}
