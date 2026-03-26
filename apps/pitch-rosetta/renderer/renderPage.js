/**
 * Orchestrate section order, run section renderers, wrap in document shell.
 *
 * Default render path is Lead Rosetta Health & Wellness to match the docs reference.
 * Legacy dental-v1..v6 render path remains available when explicitly requested.
 */
import { getSectionOrder, isValidDentalStyle, pickRandomDentalStyle } from "./registry.js";
import { documentShell } from "./documentShell.js";
import { renderLeadRosettaHealthWellnessPage } from "./leadRosettaHealthWellnessPage.js";
import { sections as v1Sections } from "./sections/dental-v1.js";
import { sections as v2Sections } from "./sections/dental-v2.js";
import { sections as v3Sections } from "./sections/dental-v3.js";
import { sections as v4Sections } from "./sections/dental-v4.js";
import { sections as v6Sections } from "./sections/dental-v6.js";

const SECTION_RENDERERS = {
  "dental-v1": v1Sections,
  "dental-v2": v2Sections,
  "dental-v3": v3Sections,
  "dental-v4": v4Sections,
  "dental-v6": v6Sections,
};

/**
 * Render full HTML from index.json-shaped data.
 * @param {object} data - Business/content (index.json shape)
 * @param {{ styleId?: string }} [options] - Optional styleId for legacy dental-v1..v6 rendering. Omit to use the Lead Rosetta layout.
 * @returns {string} Full HTML document
 */
export function renderPage(data, options = {}) {
  const requestedStyleId = options.styleId;
  const shouldUseDentalStyle = requestedStyleId && isValidDentalStyle(requestedStyleId);

  // Default: Lead Rosetta layout (health-and-wellness industry) to match docs reference.
  if (!shouldUseDentalStyle) {
    return renderLeadRosettaHealthWellnessPage(data);
  }

  // Dental-v1..v6 legacy render path (kept for explicit testing).
  const styleId = requestedStyleId || pickRandomDentalStyle();
  const order = getSectionOrder(styleId);
  const sections = SECTION_RENDERERS[styleId] || v2Sections;
  const parts = [];
  for (const name of order) {
    const fn = sections[name];
    if (typeof fn === "function") parts.push(fn(data));
  }
  const bodyHtml = parts.join("\n");
  const title = data.seo?.title || data.business?.name || "Dental";
  const description = data.seo?.description || data.business?.description || "";
  return documentShell({
    title,
    description,
    styleId,
    bodyHtml,
    jsonLd: null,
  });
}
