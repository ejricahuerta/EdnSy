/**
 * Load the CSS needed for the Lead Rosetta Health & Wellness demo layout.
 * This mirrors how pitch-rosetta loads dental-v* style-guide <style> blocks.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const LEAD_HEALTH_STYLE_PATH = resolve(
  __dirname,
  "..",
  "..",
  "lead-rosetta",
  "docs",
  "style-guides",
  "industries",
  "health-and-wellness.html"
);

function extractCssFromHtml(html) {
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const blocks = [];
  let match;
  while ((match = re.exec(html)) !== null) {
    const block = match[1].trim();
    if (block) blocks.push(block);
  }
  return blocks.join("\n\n");
}

let cssCache = null;

export function loadLeadRosettaHealthWellnessCss() {
  if (cssCache) return cssCache;
  if (!existsSync(LEAD_HEALTH_STYLE_PATH)) {
    cssCache = "body{font-family:system-ui,sans-serif;}";
    return cssCache;
  }
  const html = readFileSync(LEAD_HEALTH_STYLE_PATH, "utf-8");
  cssCache = extractCssFromHtml(html);
  return cssCache || "body{}";
}

