/**
 * Full HTML document shell: head (title, meta, fonts, CSS), main content, optional JSON-LD.
 * Mobile-first responsive CSS is applied after the style-guide CSS.
 */
import { escapeHtml } from "./escape.js";
import { loadStyleCss } from "./loadStyleCss.js";
import { RESPONSIVE_CSS } from "./responsive.js";

export function documentShell(options) {
  const {
    title = "Dental", // Fallback when omitted; renderPage passes data.seo?.title || data.business?.name from JSON
    description = "",
    styleId = "dental-v1",
    bodyHtml = "",
    jsonLd = null,
  } = options;

  const css = loadStyleCss(styleId);
  const desc = escapeHtml(description);
  const titleSafe = escapeHtml(title);
  const styleIdSafe = escapeHtml(styleId);

  const jsonLdBlock =
    jsonLd != null
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleSafe}</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;400;500;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Unbounded:wght@300;400;700;900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>${css}</style>
<style>${RESPONSIVE_CSS}</style>
${jsonLdBlock}
</head>
<body data-style-id="${styleIdSafe}">
<main>${bodyHtml}</main>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>function toggleMenu(){var m=document.getElementById('mobileMenu');var h=document.getElementById('hamburger');if(m){m.classList.toggle('open');m.setAttribute('aria-hidden',!m.classList.contains('open'));}if(h){h.classList.toggle('open');h.setAttribute('aria-expanded',h.classList.contains('open'));}}if(typeof lucide!=='undefined'){lucide.createIcons();}</script>
</body>
</html>`;
}
