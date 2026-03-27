/**
 * Section renderers for dental-v3 (Aurum / Premium Aesthetic): same class names as style-guides/dental/dental-v3.html
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
  return `<nav>
  <div class="nav-logo">${first}${rest ? ` <span>${rest}</span>` : ""}</div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#testimonials">Reviews</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a class="nav-cta" href="${escapeHtml(heroCta.href)}">${escapeHtml(heroCta.label)}</a>
  <button class="nav-hamburger" id="hamburger" type="button" onclick="toggleMenu()" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
<ul class="nav-mobile" id="mobileMenu" aria-label="Mobile menu" aria-hidden="true">
  <li><a href="#services">Services</a></li>
  <li><a href="#about">About</a></li>
  <li><a href="#testimonials">Reviews</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="${escapeHtml(heroCta.href)}" class="mobile-cta">${escapeHtml(heroCta.label)}</a></li>
</ul>`;
}

function hero(data) {
  const b = data.business || {};
  const h = data.hero || {};
  const rawHeadline = typeof h.headline === "string" ? h.headline.trim() : "";
  const headlineMarkup = rawHeadline
    ? escapeHtml(rawHeadline)
    : `Your Smile Deserves Expert Care<br><span class="hero-title-italic">Perfected.</span>`;
  const sub = escapeHtml(h.subheadline || "Experience dentistry elevated to an art form. Where precision meets care in every treatment.");
  const cta = h.cta || { label: "Book an Appointment", href: "#contact" };
  const stats = data.stats || [
    { value: "2,400+", label: "Smiles Transformed" },
    { value: "18yr", label: "Of Excellence" },
    { value: "100%", label: "Satisfaction" },
  ];
  const heroImg = resolveDentalImage(data.images?.hero || data.hero?.image, "9x16", data.__dentalImageAllocator);
  const heroInnerStyle = heroImg
    ? ` style="background: linear-gradient(180deg, rgba(10,22,40,0.3) 0%, transparent 40%), url('${escapeHtml(heroImg)}') center/cover;"`
    : "";
  const awardName = data.about?.headline || "Best in Care";
  const awardYear = "Canadian Dental Excellence " + new Date().getFullYear();
  return `<section class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">Premium Aesthetic Dentistry</div>
    <h1 class="hero-title">${headlineMarkup}</h1>
    <p class="hero-subtitle">${sub}</p>
    <div class="hero-actions">
      <a href="${escapeHtml(cta.href)}" class="btn-hero-primary">${escapeHtml(cta.label)}</a>
      <a href="#services" class="btn-hero-ghost">Our Services →</a>
    </div>
    <div class="hero-stats">
      ${stats.slice(0, 3).map((s) => `<div class="hero-stat"><div class="num">${escapeHtml(String(s.value))}</div><div class="desc">${escapeHtml(s.label)}</div></div>`).join("\n      ")}
    </div>
  </div>
  <div class="hero-image">
    <div class="hero-image-inner"${heroInnerStyle}></div>
    <div class="hero-image-overlay"></div>
    <div class="hero-badge">
      <div class="award">Top Practice</div>
      <div class="award-name">${escapeHtml(awardName)}</div>
      <div class="award-year">${escapeHtml(awardYear)}</div>
    </div>
  </div>
</section>`;
}

function services(data) {
  const list = data.services || [];
  return `<section class="services" id="services">
  <div class="section-eyebrow">What We Offer</div>
  <h2 class="section-title">Treatments <em>designed</em><br>for discerning patients</h2>
  <div class="services-grid">
    ${list.slice(0, 6).map((s, i) => `<div class="service-item"><span class="service-icon">${serviceIcon(i, 24)}</span><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description || "")}</p><a href="#contact" class="service-link">Learn More →</a></div>`).join("\n    ")}
  </div>
</section>`;
}

function about(data) {
  const aboutData = data.about || {};
  const quote = aboutData.headline || "dentistry should be as personal as your fingerprint";
  const body = aboutData.body || "We believe that exceptional dental care goes beyond technical mastery. It requires listening, understanding, and crafting treatments that align with each patient's unique needs and aspirations.";
  const aboutImg = resolveDentalImage(data.images?.about, "3x2", data.__dentalImageAllocator);
  const aboutImageStyle = aboutImg ? ` style="background-image: url('${escapeHtml(aboutImg)}');"` : "";
  const signature = aboutData.signature || data.business?.name || "Our Team";
  const sigTitle = aboutData.sigTitle || "Principal Dentist";
  return `<section class="about" id="about">
  <div class="about-image"${aboutImageStyle}></div>
  <div class="about-content">
    <div class="section-eyebrow">Our Philosophy</div>
    <blockquote>${escapeHtml(quote)}</blockquote>
    <p>${escapeHtml(body)}</p>
    <div style="width:40px; height:1px; background:var(--gold); margin:24px 0;"></div>
    <div class="signature">${escapeHtml(signature)}</div>
    <div class="sig-title">${escapeHtml(sigTitle)}</div>
  </div>
</section>`;
}

function testimonials(data) {
  const list = data.testimonials || [];
  return `<section class="testimonials" id="testimonials">
  <div class="section-eyebrow">Client Stories</div>
  <h2 class="section-title" style="color:var(--pearl);">Words from our <em>valued patients</em></h2>
  <div class="testimonials-grid">
    ${list.slice(0, 3).map((t) => `<div class="testimonial-card"><div class="stars">${"★".repeat(t.rating || 5)}</div><blockquote>"${escapeHtml(t.quote)}"</blockquote><div class="testimonial-name">${escapeHtml(t.author || "")}</div><div class="testimonial-detail">Patient</div></div>`).join("\n    ")}
  </div>
</section>`;
}

function cta(data) {
  const ctaBanner = data.cta_banner || {};
  // Generic heading only — no business name or business-specific headline
  const headline = "Begin your transformation";
  const subtext = ctaBanner.subtext || "Complimentary consultations available for new patients. Limited appointments each month to ensure the care you deserve.";
  const btn = ctaBanner.button || data.hero?.cta || { label: "Schedule a Consultation", href: "#contact" };
  return `<section class="cta-banner">
  <h2>${headline}<br><em>today.</em></h2>
  <div class="cta-right">
    <p>${escapeHtml(subtext)}</p>
    <a href="${escapeHtml(btn.href)}" class="btn-cta-dark">${escapeHtml(btn.label)}</a>
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
  const mapIframe = mapSrc ? `<div style="min-height:420px;border:1px solid rgba(201,168,76,0.2);overflow:hidden"><iframe src="${escapeHtml(mapSrc)}" width="100%" height="420" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>` : "";
  const mapLink = mapQ ? `<p style="margin-top:16px"><a href="https://www.google.com/maps?q=${escapeHtml(mapQ)}" target="_blank" rel="noopener">View on Google Maps</a></p>` : "";
  const hasMap = mapIframe || mapLink;
  const insurance = data.insurance;
  const insuranceBlurb = insurance?.accepted ? `<p style="font-size:14px;color:var(--muted);max-width:560px;margin-bottom:24px;line-height:1.7">${escapeHtml(insurance.accepted)} ${insurance.payment ? escapeHtml(insurance.payment) : ""}</p>` : "";
  return `<section class="contact-section" id="contact">
  <div class="section-eyebrow">Visit Us</div>
  <h2 class="section-title">${escapeHtml(contactHeadline)}</h2>
  ${insuranceBlurb}
  <div class="contact-grid" style="grid-template-columns: ${hasMap ? "1fr 1fr" : "1fr"};">
    <div>
      ${hoursList ? `<h3>Hours</h3><ul style="list-style:none;padding:0;margin:0;font-size:14px;color:var(--navy)">${hoursList}</ul>` : ""}
      ${address ? `<p style="margin-top:24px;font-size:14px;color:var(--navy)"><strong>Address</strong><br>${escapeHtml(address)}</p>` : ""}
      ${b.phone ? `<p style="margin-top:12px"><a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}">${escapeHtml(b.phone)}</a></p>` : ""}
      ${b.email ? `<p style="margin-top:8px"><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>` : ""}
      ${mapLink}
    </div>
    ${mapIframe ? `<div>${mapIframe}</div>` : ""}
  </div>
</section>`;
}

function footer(data) {
  const b = data.business || {};
  const name = escapeHtml(b.name || "Dental");
  const parts = name.split(/\s+/);
  const firstWord = parts[0] || "Dental";
  const rest = parts.slice(1).join(" ") || "Dental";
  const desc = escapeHtml(b.description || b.tagline || "Premium dental care. Transforming smiles with artistry and precision.");
  const year = new Date().getFullYear();
  const hoursSummary = b.hours && Object.keys(b.hours).length ? Object.entries(b.hours).slice(0, 2).map(([d, t]) => `${d} ${t}`).join(" · ") : "";
  return `<footer>
  <div class="footer-grid">
    <div class="footer-brand"><div class="logo">${firstWord} <em>${rest}</em></div><p>${desc}</p></div>
    <div class="footer-col"><h4>Services</h4><a href="#services">Our Services</a><a href="#contact">Book Appointment</a></div>
    <div class="footer-col"><h4>Studio</h4><a href="#about">About Us</a><a href="#testimonials">Reviews</a></div>
    <div class="footer-col"><h4>Contact</h4><a href="#contact">Book Appointment</a>${b.phone ? `<a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}">${escapeHtml(b.phone)}</a>` : ""}${mapsQuery(b) ? `<a href="https://www.google.com/maps?q=${escapeHtml(mapsQuery(b))}" target="_blank" rel="noopener">${escapeHtml(b.address || "View on Google Maps")}</a>` : ""}${hoursSummary ? `<span style="display:block;margin-top:8px;font-size:13px;color:var(--muted)">${escapeHtml(hoursSummary)}</span>` : ""}</div>
  </div>
  <div class="footer-bottom"><span>© ${year} ${escapeHtml(b.name || "Dental")}. All rights reserved.</span><span>Privacy · Accessibility</span></div>
</footer>`;
}

export const sections = {
  nav,
  hero,
  services,
  about,
  testimonials,
  cta,
  contact,
  footer,
};
