/**
 * Section renderers for dental-v2 (Fresh Clinical): same class names as style-guides/dental/dental-v2.html
 */
import { escapeHtml } from "../escape.js";
import { mapsQuery } from "../mapUtils.js";
import { serviceIcon } from "../icons.js";
import { resolveDentalImage } from "../randomDentalImages.js";

function nav(data) {
  const b = data.business || {};
  const name = (b.name || "Dental").trim();
  const spaceIdx = name.indexOf(" ");
  const first = escapeHtml(spaceIdx > 0 ? name.slice(0, spaceIdx) : name);
  const rest = escapeHtml(spaceIdx > 0 ? name.slice(spaceIdx + 1) : "");
  const heroCta = data.hero?.cta || { label: "Book Now", href: "#contact" };
  return `<nav class="lp-nav">
  <div class="lp-logo">${first}${rest ? `<span> ${rest}</span>` : ""}</div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#testimonials">Reviews</a></li>
    <li><a href="#contact">Contact</a></li>
    <li class="nav-badge-item"><span class="badge badge-teal badge-dot">Accepting New Patients</span></li>
  </ul>
  <a class="btn btn-primary" href="${escapeHtml(heroCta.href)}" style="padding:10px 22px;font-size:13px">${escapeHtml(heroCta.label)}</a>
  <button class="nav-hamburger" id="hamburger" type="button" onclick="toggleMenu()" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
<ul class="nav-mobile" id="mobileMenu" aria-label="Mobile menu" aria-hidden="true">
  <li><a href="#services">Services</a></li>
  <li><a href="#about">About</a></li>
  <li><a href="#testimonials">Reviews</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><span class="badge badge-teal badge-dot">Accepting New Patients</span></li>
  <li><a href="${escapeHtml(heroCta.href)}" class="mobile-cta">${escapeHtml(heroCta.label)}</a></li>
</ul>`;
}

function hero(data) {
  const h = data.hero || {};
  const rawHeadline = typeof h.headline === "string" ? h.headline.trim() : "";
  const headlineMarkup = rawHeadline
    ? escapeHtml(rawHeadline)
    : `Caring for<br><span class="wave">Every Smile</span><br>in the Family`;
  const sub = escapeHtml(h.subheadline || "Gentle, modern dentistry for all ages. From routine checkups to complete smile transformations — we make every visit comfortable and stress-free.");
  const cta = h.cta || { label: "Book an Appointment", href: "#contact" };
  const heroImg = resolveDentalImage(data.images?.hero || data.hero?.image, "3x2", data.__dentalImageAllocator);
  const bgStyle = heroImg ? ` style="background-image:linear-gradient(160deg, rgba(253,248,243,.92) 0%, rgba(247,251,250,.9) 50%, rgba(237,245,243,.9) 100%),url('${escapeHtml(heroImg)}');background-size:cover;background-position:center"` : "";
  const coverSrc = resolveDentalImage(data.images?.about, "3x2", data.__dentalImageAllocator);
  const serviceDefaults = [
    { name: "Checkup & Clean", coverage: "45 mins" },
    { name: "Teeth Whitening", coverage: "60 mins" },
    { name: "Braces Consult", coverage: "30 mins" },
    { name: "Emergency Visit", coverage: "Same day" },
    { name: "Child's First Visit", coverage: "30 mins" },
  ];
  const serviceItems = (data.services && data.services.length ? data.services : serviceDefaults).slice(0, 5);
  const phoneLabel = data.business?.phone ? `Call ${escapeHtml(data.business.phone)}` : "Call (416) 555-0182";
  const phoneHref = data.business?.phone ? `tel:${escapeHtml(data.business.phone.replace(/\D/g, ""))}` : "tel:4165550182";
  return `<section class="lp-hero"${bgStyle}>
  <div class="hero-content">
    <div class="hero-pill"><span class="dot"></span> Now accepting new patients</div>
    <h1 class="hero-h1">${headlineMarkup}</h1>
    <p class="hero-sub">${sub}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${escapeHtml(cta.href)}">${escapeHtml(cta.label)}</a>
      <a class="btn btn-soft" href="${phoneHref}">${phoneLabel}</a>
    </div>
    <div class="hero-trust">
      <div class="trust-avatars">
        <div class="avatar">1</div><div class="avatar">2</div><div class="avatar">3</div><div class="avatar">+</div>
      </div>
      <span>Join <strong style="color:var(--ink)">3,200+</strong> happy patients</span>
    </div>
  </div>
  <div class="hero-visual-panel">
    <img class="hvp-cover" src="${escapeHtml(coverSrc)}" alt="Modern dental clinic room prepared for a checkup" loading="lazy">
    <div class="hvp-header">
      <h3>Book Your Visit</h3>
      <p>Select a service to get started</p>
    </div>
    <div class="hvp-services">
      ${serviceItems.map((s, i) => `<div class="hvp-item"><div class="hvp-icon">${serviceIcon(i, 16)}</div><div><div class="hvp-name">${escapeHtml(s.name)}</div><div class="hvp-time">${escapeHtml(s.coverage || "")}</div></div></div>`).join("\n      ")}
    </div>
    <div class="hvp-cta"><a class="btn btn-primary" href="#contact">Continue Booking →</a></div>
  </div>
</section>`;
}

function stats(data) {
  const list = data.stats || [
    { value: "9", label: "Years" },
    { value: "5000+", label: "Patients" },
    { value: "4.9", label: "Rating" },
    { value: "98%", label: "Satisfaction" },
  ];
  return `<section class="stats-strip" id="about">
  ${list.slice(0, 4).map((s) => `<div class="stat-box"><div class="stat-num">${escapeHtml(String(s.value))}</div><div class="stat-label">${escapeHtml(s.label)}</div></div>`).join("\n  ")}
</section>`;
}

function services(data) {
  const list = data.services || [];
  return `<section class="lp-section bg-snow" id="services">
  <div class="lp-section-header">
    <span class="section-tag">Our Services</span>
    <h2 class="section-h2">Care for <em>Every Smile</em></h2>
    <p class="section-sub">${escapeHtml(data.about?.body?.slice(0, 140) || "Comprehensive dental care for the whole family.")}</p>
  </div>
  <div class="services-2col">
    ${list.slice(0, 6).map((s, i) => `<div class="svc-card"><div class="svc-icon-wrap">${serviceIcon(i, 24)}</div><div class="svc-body"><h3 class="svc-title">${escapeHtml(s.name)}</h3><p class="svc-desc">${escapeHtml(s.description || "")}</p><a href="#contact" class="svc-link">Learn more →</a></div></div>`).join("\n    ")}
  </div>
</section>`;
}

function testimonials(data) {
  const list = data.testimonials || [];
  return `<section class="lp-section" id="testimonials">
  <div class="lp-section-header">
    <span class="section-tag">Reviews</span>
    <h2 class="section-h2">What <em>Patients Say</em></h2>
  </div>
  <div class="testi-grid">
    ${list.slice(0, 3).map((t) => `<div class="tcard"><div class="tcard-stars">${"★".repeat(t.rating || 5)}</div><p class="tcard-quote">"${escapeHtml(t.quote)}"</p><div class="tcard-author"><div class="tcard-av">${escapeHtml(String(t.author?.[0] || "?"))}</div><div><div class="tcard-name">${escapeHtml(t.author || "")}</div><div class="tcard-service">Patient</div></div></div></div>`).join("\n    ")}
  </div>
</section>`;
}

function cta(data) {
  const ctaBanner = data.cta_banner || {};
  // Generic headings only — no business-specific headline
  const headline = "Ready to get started?";
  const subtext = ctaBanner.subtext || "Get in touch today.";
  const btn = ctaBanner.button || data.hero?.cta || { label: "Book an Appointment", href: "#contact" };
  return `<section class="lp-cta" id="contact">
  <h2>${headline}</h2>
  <p>${escapeHtml(subtext)}</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
    <a class="btn btn-white" href="${escapeHtml(btn.href)}">${escapeHtml(btn.label)}</a>
    ${data.business?.phone ? `<a class="btn btn-trans" href="tel:${escapeHtml(data.business.phone.replace(/\D/g, ""))}">Call ${escapeHtml(data.business.phone)}</a>` : ""}
  </div>
</section>`;
}

function contact(data) {
  const b = data.business || {};
  // Generic heading only — no business-specific headline
  const contactHeadline = "Hours & Location";
  const hours = b.hours || {};
  const hoursList = Object.entries(hours).map(([day, time]) => `<li style="display:flex;justify-content:space-between;gap:16px"><span>${escapeHtml(day)}</span><span>${escapeHtml(time)}</span></li>`).join("");
  const address = b.address || "";
  const mapQ = mapsQuery(b);
  const mapSrc = mapQ ? `https://www.google.com/maps?q=${mapQ}&output=embed` : null;
  const mapIframe = mapSrc ? `<div style="min-height:420px;border:2px solid var(--mist);border-radius:var(--radius-lg);overflow:hidden"><iframe src="${escapeHtml(mapSrc)}" width="100%" height="420" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>` : "";
  const mapLink = mapQ ? `<p style="margin-top:16px"><a class="btn btn-outline" href="https://www.google.com/maps?q=${escapeHtml(mapQ)}" target="_blank" rel="noopener">View on Google Maps</a></p>` : "";
  const hasMap = mapIframe || mapLink;
  const insurance = data.insurance;
  const insuranceBlurb = insurance?.accepted ? `<p class="section-sub" style="margin-top:12px;margin-bottom:32px;max-width:560px">${escapeHtml(insurance.accepted)} ${insurance.payment ? escapeHtml(insurance.payment) : ""}</p>` : "";
  return `<section class="lp-section bg-snow" style="padding:80px 60px">
  <div class="lp-section-header">
    <span class="section-tag">Visit Us</span>
    <h2 class="section-h2">${escapeHtml(contactHeadline)}</h2>
    ${insuranceBlurb}
  </div>
  <div class="contact-grid" style="display:grid;grid-template-columns:${hasMap ? "1fr 1fr" : "1fr"};gap:48px;max-width:1100px;margin:0 auto;align-items:start">
    <div>
      ${hoursList ? `<h3 style="font-family:var(--font-display);font-size:18px;color:var(--ink);margin-bottom:16px">Hours</h3><ul style="list-style:none;padding:0;margin:0;font-size:14px;color:var(--text-body)">${hoursList}</ul>` : ""}
      ${address ? `<p style="margin-top:24px;font-size:14px;color:var(--text-body)"><strong style="color:var(--ink)">Address</strong><br>${escapeHtml(address)}</p>` : ""}
      ${b.phone ? `<p style="margin-top:12px"><a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}" style="color:var(--teal)">${escapeHtml(b.phone)}</a></p>` : ""}
      ${b.email ? `<p style="margin-top:8px"><a href="mailto:${escapeHtml(b.email)}" style="color:var(--teal)">${escapeHtml(b.email)}</a></p>` : ""}
      ${mapLink}
    </div>
    ${mapIframe ? `<div>${mapIframe}</div>` : ""}
  </div>
</section>`;
}

function footer(data) {
  const b = data.business || {};
  const name = escapeHtml(b.name || "Dental");
  const short = name.slice(0, 5);
  const rest = name.slice(5) || " Dental";
  const hours = b.hours || {};
  const hoursSummary = Object.entries(hours).length ? Object.entries(hours).slice(0, 2).map(([d, t]) => `${d} ${t}`).join(" · ") : "";
  return `<footer class="lp-footer" style="flex-wrap:wrap;gap:24px">
  <div class="footer-logo">${short}<span>${escapeHtml(rest)}</span></div>
  <div style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:rgba(255,255,255,.7)">
    ${hoursSummary ? `<span>${escapeHtml(hoursSummary)}</span>` : ""}
    ${b.address ? `<span>${escapeHtml(b.address)}</span>` : ""}
    ${b.phone ? `<a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}" style="color:var(--mint-mid)">${escapeHtml(b.phone)}</a>` : ""}
  </div>
  <div class="footer-links">
    <a href="#services">Services</a>
    <a href="#contact">Contact</a>
    ${b.social?.instagram ? `<a href="${escapeHtml(b.social.instagram)}">Instagram</a>` : ""}
    ${mapsQuery(b) ? `<a href="https://www.google.com/maps?q=${escapeHtml(mapsQuery(b))}" target="_blank" rel="noopener">Google Maps</a>` : ""}
  </div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${escapeHtml(b.name || "Dental")}</div>
</footer>`;
}

export const sections = {
  nav,
  hero,
  stats,
  services,
  testimonials,
  cta,
  contact,
  footer,
};
