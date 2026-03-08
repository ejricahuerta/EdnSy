/**
 * Build Google Maps query from business: use coordinates when available (more accurate), else address.
 * @param {{ coordinates?: { lat?: number; lng?: number }; address?: string }} business
 * @returns {string|null} Query for ?q= (either "lat,lng" or encoded address), or null if no location
 */
export function mapsQuery(business) {
  if (!business) return null;
  const co = business.coordinates;
  if (co != null && typeof co.lat === "number" && typeof co.lng === "number") {
    return `${co.lat},${co.lng}`;
  }
  const addr = business.address;
  if (addr && typeof addr === "string" && addr.trim()) {
    return encodeURIComponent(addr.trim());
  }
  return null;
}
