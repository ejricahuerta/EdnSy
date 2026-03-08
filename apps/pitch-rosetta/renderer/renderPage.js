/**
 * Orchestrate section order, run section renderers, wrap in document shell.
 * Four dental styles: v1, v2, v3, v4.
 */
import { getSectionOrder, pickRandomDentalStyle, isValidDentalStyle } from "./registry.js";
import { documentShell } from "./documentShell.js";
import { sections as v1Sections } from "./sections/dental-v1.js";
import { sections as v2Sections } from "./sections/dental-v2.js";
import { sections as v3Sections } from "./sections/dental-v3.js";
import { sections as v4Sections } from "./sections/dental-v4.js";

const SECTION_RENDERERS = {
  "dental-v1": v1Sections,
  "dental-v2": v2Sections,
  "dental-v3": v3Sections,
  "dental-v4": v4Sections,
};

/**
 * Render full HTML from index.json-shaped data.
 * @param {object} data - Business/content (index.json shape)
 * @param {{ styleId?: string }} [options] - Optional styleId: 'dental-v1' | 'dental-v2' | 'dental-v3' | 'dental-v4'. Omit for random.
 * @returns {string} Full HTML document
 */
export function renderPage(data, options = {}) {
  const styleId =
    options.styleId && isValidDentalStyle(options.styleId)
      ? options.styleId
      : pickRandomDentalStyle();
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
