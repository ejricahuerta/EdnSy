/**
 * Dental-only style registry: section order per style. Four styles (v1–v4).
 */
export const DENTAL_STYLES = ["dental-v1", "dental-v2", "dental-v3", "dental-v4"];

const SECTION_ORDER = {
  "dental-v1": ["nav", "hero", "services", "process", "testimonials", "cta", "contact", "footer"],
  "dental-v2": ["nav", "hero", "stats", "services", "testimonials", "cta", "contact", "footer"],
  "dental-v3": ["nav", "hero", "services", "about", "testimonials", "cta", "contact", "footer"],
  "dental-v4": ["nav", "hero", "services", "experience", "testimonials", "cta", "contact", "footer"],
};

export function getSectionOrder(styleId) {
  return SECTION_ORDER[styleId] ?? SECTION_ORDER["dental-v1"];
}

export function pickRandomDentalStyle() {
  return DENTAL_STYLES[Math.floor(Math.random() * DENTAL_STYLES.length)];
}

export function isValidDentalStyle(id) {
  return DENTAL_STYLES.includes(id);
}
