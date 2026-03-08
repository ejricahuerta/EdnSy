/**
 * Renderer: JSON + dental style (random or chosen) + section templates → full HTML.
 * No AI. Uses style-guides/dental/*.html for CSS.
 */
export { renderPage } from "./renderPage.js";
export { pickRandomDentalStyle, getSectionOrder, DENTAL_STYLES, isValidDentalStyle } from "./registry.js";
export { obfuscateHtml } from "./obfuscate.js";
