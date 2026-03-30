/**
 * Load the CSS needed for the health and wellness demo layout.
 * This mirrors how website-template loads dental-v* style-guide <style> blocks.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const HEALTH_STYLE_PATH = resolve(
  __dirname,
  "..",
  "..",
  "admin",
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

export function loadHealthWellnessCss() {
  if (cssCache) return cssCache;
  if (!existsSync(HEALTH_STYLE_PATH)) {
    cssCache = "body{font-family:system-ui,sans-serif;}";
    return cssCache;
  }
  const html = readFileSync(HEALTH_STYLE_PATH, "utf-8");
  cssCache = extractCssFromHtml(html);
  return cssCache || "body{}";
}

