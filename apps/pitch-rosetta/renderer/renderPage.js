/**
 * Orchestrate section order, run section renderers, wrap in document shell.
 *
 * Default: random dental style guide (dental-v1..v6). Optional explicit styleId or Lead Rosetta layout.
 */
import { getSectionOrder, isValidDentalStyle, pickRandomDentalStyle } from "./registry.js";
import { documentShell } from "./documentShell.js";
import { renderLeadRosettaHealthWellnessPage } from "./leadRosettaHealthWellnessPage.js";
import { createPageDentalImageAllocator } from "./randomDentalImages.js";
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

function renderDentalStyleGuidePage(data, styleId) {
  const order = getSectionOrder(styleId);
  const sections = SECTION_RENDERERS[styleId] || v2Sections;
  const renderData = {
    ...data,
    __dentalImageAllocator: createPageDentalImageAllocator(),
  };
  const parts = [];
  for (const name of order) {
    const fn = sections[name];
    if (typeof fn === "function") parts.push(fn(renderData));
  }
  const bodyHtml = parts.join("\n");
  const title = renderData.seo?.title || renderData.business?.name || "Dental";
  const description = renderData.seo?.description || renderData.business?.description || "";
  return documentShell({
    title,
    description,
    styleId,
    bodyHtml,
    jsonLd: null,
  });
}

/**
 * Render full HTML from index.json-shaped data.
 * @param {object} data - Business/content (index.json shape)
 * @param {{ styleId?: string, leadRosettaLayout?: boolean }} [options]
 *   - styleId: force a dental style guide (dental-v1..v6)
 *   - leadRosettaLayout: use Lead Rosetta health & wellness single layout (no random)
 *   - Default: pick a random dental style guide
 * @returns {string} Full HTML document
 */
export function renderPage(data, options = {}) {
  if (options.leadRosettaLayout === true) {
    return renderLeadRosettaHealthWellnessPage(data);
  }

  const requestedStyleId = options.styleId;
  const styleId =
    requestedStyleId && isValidDentalStyle(requestedStyleId)
      ? requestedStyleId
      : pickRandomDentalStyle();

  return renderDentalStyleGuidePage(data, styleId);
}
