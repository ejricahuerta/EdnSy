/**
 * Health & Wellness industry layout (matches apps/admin/docs/style-guides/industries/health-and-wellness.html)
 *
 * The goal is to emit the same `.demo-*` class structure that the style guide CSS targets.
 */
import { escapeHtml } from "./escape.js";
import { loadHealthWellnessCss } from "./loadHealthWellnessCss.js";

function getCityFromAddress(address) {
  const s = String(address ?? "").trim();
  if (!s) return "Toronto";
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2];
  if (parts.length === 1) return parts[0];
  return "Toronto";
}

function pickStat(stats, matcher, fallback) {
  const arr = Array.isArray(stats) ? stats : [];
  const found = arr.find((s) => matcher.test(String(s?.label ?? "")) || matcher.test(String(s?.value ?? "")));
  if (!found) return fallback;
  return { value: String(found.value ?? fallback.value), label: String(found.label ?? fallback.label) };
}

function normalizeRatingValue(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "4.9★";
  // If numeric like "4.9", append star; if already includes ★, keep.
  return /★/.test(s) ? s : `${s}★`;
}

function pickIconEmojiForService(name, index) {
  const n = String(name ?? "").toLowerCase();
  if (/implant/.test(n)) return "📐";
  if (/whiten/.test(n)) return "✨";
  if (/align/.test(n) || /ortho/.test(n)) return "🦷";
  if (/veneer/.test(n)) return "💎";
  if (/emergency/.test(n) || /urgent/.test(n)) return "🚨";
  if (/child|pediatric|kid/.test(n)) return "🪥";
  // Fallback cycle.
  const cycle = ["🦷", "✨", "📐", "🪥", "💎", "🚨"];
  return cycle[index % cycle.length];
}

function trunc(s, max) {
  const str = String(s ?? "");
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + "…";
}

function buildCoverageCopy(data) {
  const accepted = typeof data.insurance?.accepted === "string" ? data.insurance.accepted.trim() : "";
  const payment = typeof data.insurance?.payment === "string" ? data.insurance.payment.trim() : "";

  const title = "Coverage and Billing";

  // If the input JSON provides insurance copy, prefer it verbatim but keep it as one paragraph.
  const provided = [accepted, payment].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const body = provided
    ? provided
    : "Most patients use employer dental benefits. Coverage varies by plan. We can provide estimates in advance and help you understand your out-of-pocket cost before you book.";

  const meta = "Employer plans · Coordination of benefits (when applicable) · Estimates available";

  return { title, body, meta };
}

function renderBodyHtml(data) {
  const b = data.business || {};
  const h = data.hero || {};

  const city = getCityFromAddress(b.address);
  const eyebrow = `${city} \u00B7 ${b.acceptingNewPatients !== false ? "Accepting New Patients" : "Welcome"}`;

  const heroSub =
    typeof h.subheadline === "string" && h.subheadline.trim()
      ? h.subheadline.trim()
      : typeof b.description === "string" && b.description.trim()
        ? trunc(b.description.trim(), 170)
        : "A warm, modern dental practice in the heart of Toronto. Family dentistry, cosmetic care, and emergency appointments — all under one roof.";

  const stats = data.stats || [];
  const years = pickStat(stats, /year|practice|experience|excellence/i, { value: "15+", label: "Years Serving Toronto" });
  const patients = pickStat(stats, /patient|family|served|clients/i, { value: "2,000+", label: "Happy Patients" });
  const rating = pickStat(stats, /rating|star|google/i, { value: "4.8★", label: "Google Rating" });
  const emergency = pickStat(stats, /emergency|same.?day|urgent/i, { value: "Same Day", label: "Emergency Appointments" });

  const services = Array.isArray(data.services) ? data.services : [];
  const serviceCards = (services.length ? services : [
    { name: "General Dentistry", description: "Cleanings, fillings, and preventive care for the whole family." },
    { name: "Cosmetic Services", description: "Whitening, veneers, and smile makeovers tailored to you." },
    { name: "Invisalign", description: "Discreet teeth straightening with clear aligners. All ages welcome." },
  ]).slice(0, 3);

  // Canada-appropriate: do not rely on “quotes/testimonials” as a core section.
  // Use coverage/billing messaging instead (most commonly employer dental benefits).
  const coverage = buildCoverageCopy(data);

  // Match style guide wording.
  const chips = [
    "Direct billing (where supported)",
    "Provincially licensed",
    "Same-day emergencies (when available)",
  ];

  // Match style guide wording.
  const primaryBookLabel = "Book Appointment";

  return `
<div class="demo-site">
  <div class="demo-nav">
    <div class="demo-logo">${escapeHtml(b.name || "Dental")} <span>Dental</span></div>
    <div class="demo-nav-right">
      <a href="#" class="demo-nav-link">Services</a>
      <a href="#" class="demo-nav-link">About</a>
      <a href="#" class="demo-nav-link">Contact</a>
      <a href="#" class="demo-nav-cta">Book Now</a>
    </div>
  </div>

  <div class="demo-hero">
    <div class="demo-hero-left">
      <div class="demo-hero-eyebrow">${escapeHtml(eyebrow)}</div>
      <h1 class="demo-hero-h1">Your Smile,<br><em>Expertly<br>Cared For.</em></h1>
      <p class="demo-hero-p">${escapeHtml(heroSub)}</p>
      <div class="demo-hero-ctas">
        <a href="#" class="btn-teal">${escapeHtml(primaryBookLabel)} &rarr;</a>
        <a href="#" class="btn-outline-teal">Our Services</a>
      </div>

      <div class="demo-hero-trust">
        ${chips.slice(0, 3).map((c) => `<div class="demo-trust-chip">${escapeHtml(c)}</div>`).join("\n        ")}
      </div>
    </div>

    <div class="demo-hero-right">
      <div>
        <div class="appt-panel-title">Book Your Visit</div>
        <div class="appt-panel-sub">Next available: Tomorrow, 9:00 AM</div>
      </div>

      <div>
        <div class="appt-type-btn selected">🦷 New Patient Exam <span>&rarr;</span></div>
        <div class="appt-type-btn">✨ Cleaning &amp; Polish <span>&rarr;</span></div>
        <div class="appt-type-btn">🚨 Emergency Visit <span>&rarr;</span></div>
      </div>

      <div class="appt-btn-book">Check Available Times &rarr;</div>
    </div>
  </div>

  <div class="demo-stats-strip">
    <div class="demo-stat-item">
      <div class="demo-stat-num">${escapeHtml(years.value)}</div>
      <div class="demo-stat-label">${escapeHtml(years.label)}</div>
    </div>
    <div class="demo-stat-item">
      <div class="demo-stat-num">${escapeHtml(patients.value)}</div>
      <div class="demo-stat-label">${escapeHtml(patients.label)}</div>
    </div>
    <div class="demo-stat-item">
      <div class="demo-stat-num">${escapeHtml(normalizeRatingValue(rating.value))}</div>
      <div class="demo-stat-label">${escapeHtml(rating.label)}</div>
    </div>
    <div class="demo-stat-item">
      <div class="demo-stat-num">${escapeHtml(emergency.value)}</div>
      <div class="demo-stat-label">${escapeHtml(emergency.label)}</div>
    </div>
  </div>

  <div class="demo-services">
    <div class="demo-services-eyebrow">What We Offer</div>
    <div class="demo-services-h2">Comprehensive Dental Care</div>
    <div class="demo-services-grid">
      ${serviceCards.map((s, i) => {
        const icon = pickIconEmojiForService(s?.name, i);
        return `
        <div class="demo-service-card">
          <div class="demo-service-icon">${escapeHtml(icon)}</div>
          <div class="demo-service-name">${escapeHtml(String(s?.name ?? ""))}</div>
          <div class="demo-service-desc">${escapeHtml(trunc(String(s?.description ?? ""), 120))}</div>
        </div>`;
      }).join("\n")}
    </div>
  </div>

  <div class="demo-testimonial">
    <div>
      <div class="demo-quote-stars">${escapeHtml(coverage.title)}</div>
      <div class="demo-quote-text">${escapeHtml(coverage.body)}</div>
      <div class="demo-quote-author">${escapeHtml(coverage.meta)}</div>
    </div>
  </div>

  <div class="demo-cta-footer">
    <div>
      <div class="demo-cta-footer-text">Ready for your next visit?</div>
      <div class="demo-cta-footer-sub">
        New patients welcome · Direct billing (where supported) · Same-day emergencies (when available)
      </div>
    </div>
    <a href="#" class="btn-teal">Book Online &rarr;</a>
  </div>
</div>`;
}

export function renderHealthWellnessPage(data) {
  const title = data.seo?.title || data.business?.name || "Dental";
  const description = data.seo?.description || data.business?.description || "";
  const css = loadHealthWellnessCss();
  const titleSafe = escapeHtml(title);
  const descSafe = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleSafe}</title>
<meta name="description" content="${descSafe}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Mulish:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<main>
${renderBodyHtml(data)}
</main>
</body>
</html>`;
}

