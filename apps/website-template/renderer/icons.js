/**
 * Lucide icons as inline SVG strings for server-rendered HTML.
 * Icons are rendered with currentColor so they inherit text/foreground color.
 */
import {
  Smile,
  Sparkles,
  Gem,
  Diamond,
  Star,
  CircleAlert,
  Baby,
  Crown,
  Wrench,
  Ruler,
  Heart,
  Calendar,
  ClipboardList,
  FileSearch,
  Leaf,
} from "lucide";

const ICONS = {
  smile: Smile,
  sparkles: Sparkles,
  gem: Gem,
  diamond: Diamond,
  star: Star,
  "alert-circle": CircleAlert,
  baby: Baby,
  crown: Crown,
  wrench: Wrench,
  ruler: Ruler,
  heart: Heart,
  calendar: Calendar,
  "clipboard-list": ClipboardList,
  "file-search": FileSearch,
  leaf: Leaf,
};

/**
 * Turn a Lucide IconNode (array of [tag, attrs]) into an SVG string.
 * @param {import('lucide').IconNode} iconNode
 * @param {{ size?: number, class?: string }} [opts]
 * @returns {string} SVG markup
 */
export function iconToSvg(iconNode, opts = {}) {
  const size = opts.size ?? 24;
  const cls = opts.class ?? "";
  const attrStr = (attrs) =>
    Object.entries(attrs)
      .filter(([k, v]) => v != null && k !== "key")
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`)
      .join(" ");
  const children = (iconNode || [])
    .map(([tag, attrs]) => `<${tag} ${attrStr(attrs)} />`)
    .join("");
  const classAttr = cls ? ` class="${cls.replace(/"/g, "&quot;")}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${classAttr} aria-hidden="true">${children}</svg>`;
}

/**
 * Get SVG string for a named icon.
 * @param {keyof typeof ICONS} name
 * @param {{ size?: number, class?: string }} [opts]
 * @returns {string} SVG markup
 */
export function icon(name, opts = {}) {
  const node = ICONS[name];
  if (!node) return "";
  return iconToSvg(node, opts);
}

/**
 * Predefined icon set for dental/service sections (cycle by index).
 * Order: smile (dental), sparkles, gem, diamond, star, alert-circle, baby, crown, wrench, ruler, heart.
 */
export const SERVICE_ICONS = [
  "smile",
  "sparkles",
  "gem",
  "diamond",
  "star",
  "alert-circle",
  "baby",
  "crown",
  "wrench",
  "ruler",
  "heart",
];

export function serviceIcon(index, size = 24, className = "") {
  const name = SERVICE_ICONS[index % SERVICE_ICONS.length];
  return icon(name, { size, class: className });
}

/** Process step icons: Book, Exam, Plan, Smile */
const PROCESS_ICON_NAMES = ["calendar", "file-search", "clipboard-list", "smile"];

export function processIcon(index, size = 24, className = "") {
  const name = PROCESS_ICON_NAMES[index % PROCESS_ICON_NAMES.length];
  return icon(name, { size, class: className });
}
