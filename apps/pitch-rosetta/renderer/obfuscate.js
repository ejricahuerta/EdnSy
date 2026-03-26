/**
 * Obfuscate HTML output: replace class names and IDs with short, unreadable tokens
 * in HTML attributes, <style> content, and <script> content so output is not easily readable.
 */

const IDENT_CLASS = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g;
const IDENT_ID = /#([a-zA-Z_][a-zA-Z0-9_-]*)/g;

/** True if string looks like a hex color (3, 4, 6, or 8 hex digits). Avoid obfuscating #fff, #c9a96e, etc. */
function isHexColor(s) {
  if (!s || typeof s !== "string") return false;
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(s);
}
const ATTR_CLASS = /class\s*=\s*["']([^"']*)["']/gi;
const ATTR_ID = /\bid\s*=\s*["']([^"']*)["']/gi;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const SCRIPT_BLOCK = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const STRING_LITERAL_SINGLE = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
const STRING_LITERAL_DOUBLE = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;

function randomShortName(used, prefixLetter = true) {
  const first = "abcdefghijklmnopqrstuvwxyz";
  const rest = "abcdefghijklmnopqrstuvwxyz0123456789";
  const len = 4;
  for (let attempt = 0; attempt < 500; attempt++) {
    let s = prefixLetter ? first[Math.floor(Math.random() * first.length)] : "";
    for (let i = s.length; i < len; i++) s += rest[Math.floor(Math.random() * rest.length)];
    if (!used.has(s)) {
      used.add(s);
      return s;
    }
  }
  return "x" + Math.random().toString(36).slice(2, 8);
}

/**
 * Collect all class and id identifiers from HTML and from style/script content.
 */
function collectIdentifiers(html) {
  const ids = new Set();
  const classes = new Set();

  // From HTML attributes: id="..." and class="..."
  let m;
  const classRegex = new RegExp(ATTR_CLASS.source, "gi");
  while ((m = classRegex.exec(html)) !== null) {
    const value = m[1];
    value.split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }
  const idRegex = new RegExp(ATTR_ID.source, "gi");
  while ((m = idRegex.exec(html)) !== null) {
    if (m[1]) ids.add(m[1]);
  }

  // From <style> blocks: .class and #id (skip #hex colors)
  const styleRegex = new RegExp(STYLE_BLOCK.source, "gi");
  let block;
  while ((block = styleRegex.exec(html)) !== null) {
    const content = block[1];
    let mm;
    const classRe = new RegExp(IDENT_CLASS.source, "g");
    while ((mm = classRe.exec(content)) !== null) classes.add(mm[1]);
    const idRe = new RegExp(IDENT_ID.source, "g");
    while ((mm = idRe.exec(content)) !== null) {
      if (!isHexColor(mm[1])) ids.add(mm[1]);
    }
  }

  return { ids: [...ids], classes: [...classes] };
}

/**
 * Build mapping from identifier to short obfuscated name (CSS-safe: class/id don't start with digit).
 */
function buildMapping(ids, classes) {
  const used = new Set();
  const map = new Map();
  for (const id of ids) {
    map.set(id, randomShortName(used, true));
  }
  for (const cls of classes) {
    if (!map.has(cls)) map.set(cls, randomShortName(used, true));
  }
  return map;
}

/**
 * Replace identifiers in HTML attribute values (class and id).
 */
function obfuscateAttributes(html, map) {
  return html
    .replace(new RegExp(ATTR_ID.source, "gi"), (match, value) => {
      const obf = map.get(value);
      return obf != null ? match.replace(value, obf) : match;
    })
    .replace(new RegExp(ATTR_CLASS.source, "gi"), (match, value) => {
      const tokens = value.split(/\s+/).filter(Boolean);
      const obfTokens = tokens.map((t) => map.get(t) ?? t);
      return match.replace(value, obfTokens.join(" "));
    });
}

/**
 * Replace .class and #id and [id="..."] / [class*="..."] in style block content.
 */
function obfuscateCss(css, map) {
  // Important: CSS contains `url('.../image.jpg')`. The obfuscation regexes below
  // match any `.word`/`#word` which would incorrectly rewrite the `.jpg` extension.
  // We protect `url(...)` segments first, obfuscate the rest, then restore.
  const urlBlocks = [];
  const protectedCss = css.replace(/url\(\s*(['"]?)([\s\S]*?)\1\s*\)/gi, (full) => {
    urlBlocks.push(full);
    return `__PITCH_ROSETTA_URL_BLOCK_${urlBlocks.length - 1}__`;
  });

  let out = protectedCss
    .replace(new RegExp(IDENT_CLASS.source, "g"), (_, name) => {
      const obf = map.get(name);
      return obf != null ? "." + obf : "." + name;
    })
    .replace(new RegExp(IDENT_ID.source, "g"), (_, name) => {
      if (isHexColor(name)) return "#" + name;
      const obf = map.get(name);
      return obf != null ? "#" + obf : "#" + name;
    });

  out = out.replace(/__PITCH_ROSETTA_URL_BLOCK_(\d+)__/g, (_, i) => urlBlocks[Number(i)]);
  map.forEach((obf, key) => {
    out = out.replace(new RegExp(`\\[id\\s*=\\s*["']${escapeRegex(key)}["']`, "gi"), `[id="${obf}"]`);
    out = out.replace(new RegExp(`\\[class\\s*~?=\\s*["']${escapeRegex(key)}["']`, "gi"), (m) =>
      m.startsWith("[class") ? m.replace(key, obf) : m
    );
  });
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace string literals in script that match our ids or classes (so getElementById, classList.toggle etc. still work).
 */
function obfuscateScript(script, map) {
  let out = script.replace(STRING_LITERAL_SINGLE, (m) => {
    const content = m.slice(1, -1);
    const obf = map.get(content);
    return obf != null ? "'" + obf + "'" : m;
  });
  out = out.replace(STRING_LITERAL_DOUBLE, (m) => {
    const content = m.slice(1, -1);
    const obf = map.get(content);
    return obf != null ? '"' + obf + '"' : m;
  });
  return out;
}

/**
 * Obfuscate class names and IDs throughout the HTML document.
 * Replaces in: id/class attributes, <style> selectors, and <script> string literals that match those ids/classes.
 *
 * @param {string} html - Full HTML document
 * @returns {string} HTML with obfuscated classes and IDs
 */
export function obfuscateHtml(html) {
  if (!html || typeof html !== "string") return html;

  const { ids, classes } = collectIdentifiers(html);
  if (ids.length === 0 && classes.length === 0) return html;

  const map = buildMapping(ids, classes);

  let out = obfuscateAttributes(html, map);

  out = out.replace(new RegExp(STYLE_BLOCK.source, "gi"), (full, content) => {
    return full.replace(content, obfuscateCss(content, map));
  });

  out = out.replace(new RegExp(SCRIPT_BLOCK.source, "gi"), (full, content) => {
    return full.replace(content, obfuscateScript(content, map));
  });

  return out;
}
