/**
 * Load CSS from pitch-rosetta style guide HTML (dental only).
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const STYLE_FILES = {
  "dental-v1": "dental-v1.html",
  "dental-v2": "dental-v2.html",
  "dental-v3": "dental-v3.html",
  "dental-v4": "dental-v4.html",
};

/** Extract all <style> block contents and concatenate (so multi-block style guides are fully loaded). */
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

function findStyleGuidePath(styleId) {
  const fileName = STYLE_FILES[styleId];
  if (!fileName) return null;
  const candidates = [
    resolve(__dirname, "..", "style-guides", "dental", fileName),
    resolve(process.cwd(), "style-guides", "dental", fileName),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

const cssCache = {};

export function loadStyleCss(styleId) {
  if (cssCache[styleId]) return cssCache[styleId];
  const fullPath = findStyleGuidePath(styleId);
  if (!fullPath) {
    cssCache[styleId] =
      "body{font-family:system-ui,sans-serif;padding:1rem;max-width:60ch;margin:0 auto;}";
    return cssCache[styleId];
  }
  const html = readFileSync(fullPath, "utf-8");
  const css = extractCssFromHtml(html);
  cssCache[styleId] = css || "body{}";
  return cssCache[styleId];
}
