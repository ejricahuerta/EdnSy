/**
 * Section renderers for dental-v4 (Lavender): same class names as style-guides/dental/dental-v4.html.
 * General professional dental theme (no anxiety-focused messaging).
 */
import { escapeHtml } from "../escape.js";
import { mapsQuery } from "../mapUtils.js";
import { serviceIcon } from "../icons.js";

function nav(data) {
  const b = data.business || {};
  const logoText = escapeHtml(b.name || "Dental");
  const heroCta = data.hero?.cta || { label: "Book Appointment", href: "#cta" };
  return `<nav>
  <div class="nav-logo">${logoText}</div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#experience">Our Team</a></li>
    <li><a href="#experience">About</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="${escapeHtml(heroCta.href)}" class="nav-cta">${escapeHtml(heroCta.label)}</a>
  <button class="nav-hamburger" id="hamburger" type="button" onclick="toggleMenu()" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
<ul class="nav-mobile" id="mobileMenu" aria-label="Mobile menu" aria-hidden="true">
  <li><a href="#services">Services</a></li>
  <li><a href="#experience">Our Team</a></li>
  <li><a href="#experience">About</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="${escapeHtml(heroCta.href)}" class="mobile-cta">${escapeHtml(heroCta.label)}</a></li>
</ul>`;
}

function hero(data) {
  const b = data.business || {};
  const h = data.hero || {};
  const rawHeadline = typeof h.headline === "string" ? h.headline.trim() : "";
  const headline = escapeHtml(rawHeadline || "Quality Care, Every Visit.");
  const sub = escapeHtml(h.subheadline || "Modern dentistry with a caring team. From checkups to cosmetic and restorative care.");
  const cta = h.cta || { label: "Book My Appointment", href: "#cta" };
  const heroImg = data.images?.hero || data.hero?.image;
  const heroBgStyle = heroImg
    ? ` style="position:absolute;inset:0;z-index:0;background-image:linear-gradient(135deg, rgba(245,242,255,0.92) 0%, rgba(255,255,255,0.88) 50%, rgba(255,242,250,0.9) 100%),url('${escapeHtml(heroImg)}');background-size:cover;background-position:center;pointer-events:none"`
    : "";
  const stats = data.stats || [];
  const ratingStat = stats.find((s) => /rating|★|star/i.test(String(s.label))) || stats[2];
  const ratingVal = ratingStat ? escapeHtml(String(ratingStat.value)) : "4.9";
  const reviewCount = stats.find((s) => /patient|review|smile/i.test(String(s.label)));
  const reviewLabel = reviewCount ? `${ratingVal}★ from ${escapeHtml(String(reviewCount.value))}+ reviews` : `${ratingVal}★ from 400+ reviews`;
  return `<section class="hero">
  ${heroImg ? `<div class="hero-bg"${heroBgStyle}></div>` : ""}
  <div class="hero-orb-1"></div>
  <div class="hero-orb-2"></div>
  <div class="hero-inner">
    <div>
      <div class="hero-pill">Quality dental care</div>
      <h1>${headline}</h1>
      <p class="hero-desc">${sub}</p>
      <div class="hero-actions">
        <a href="${escapeHtml(cta.href)}" class="btn-lav">${escapeHtml(cta.label)}</a>
        <a href="#services" class="btn-out">Learn About Us</a>
      </div>
      <div class="trust-row">
        <div class="trust-item"><span class="trust-icon">✦</span> Modern technology</div>
        <div class="trust-item"><span class="trust-icon">✦</span> Family friendly</div>
        <div class="trust-item"><span class="trust-icon">✦</span> ${reviewLabel}</div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="vis-main">
        <span class="vis-emoji" aria-hidden="true"></span>
        <h3>Care That Puts You First</h3>
        <p>A welcoming environment, modern technology, and a team dedicated to your oral health and smile goals.</p>
      </div>
      <div class="review-badge">${ratingVal} stars · "Best dentist ever!"</div>
      <div class="calm-badge">Quality<br>guaranteed</div>
    </div>
  </div>
</section>`;
}

function services(data) {
  const list = data.services || [];
  const defaultServices = [
    { name: "Preventive Care", description: "Regular cleanings, exams, and screenings to keep your smile healthy and catch issues early.", price: "From $89" },
    { name: "Teeth Whitening", description: "Our gentle whitening system delivers beautiful results without the sensitivity associated with other methods.", price: "From $279" },
    { name: "Porcelain Veneers", description: "Custom-crafted ultra-thin veneers designed to complement your natural features and express your true smile.", price: "From $1,150/tooth" },
    { name: "Invisalign®", description: "Comfortable, discreet clear aligners with monthly progress checks in our calming practice environment.", price: "From $3,400" },
    { name: "Dental Implants", description: "Permanent tooth restoration with optional sedation and a step-by-step guided process at a comfortable pace.", price: "From $1,850" },
    { name: "Sedation Dentistry", description: "Oral and IV sedation options for nervous patients or complex procedures. Wake up with your treatment done.", price: "From $299" },
  ];
  const items = list.length ? list : defaultServices;
  return `<section class="services" id="services">
  <div class="lbl">What We Offer</div>
  <div class="sec-title">Beautiful Smiles<br><em>Delivered Gently</em></div>
  <p class="sec-sub">${escapeHtml(data.about?.body?.slice(0, 120) || "From checkups to cosmetic and restorative treatments, we offer care that fits your needs and your schedule.")}</p>
  <div class="services-grid">
    ${items.slice(0, 6).map((s, i) => `<div class="svc-card">
      <div class="svc-icon-wrap">${serviceIcon(i, 24)}</div>
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description || "")}</p>
      <div class="price">${escapeHtml(s.price || s.coverage || "")}</div>
    </div>`).join("\n    ")}
  </div>
</section>`;
}

function experience(data) {
  const steps = data.process || [
    { step: 1, title: "Consultation", description: "We review your goals, medical history, and any concerns so we can plan the right care for you." },
    { step: 2, title: "Personalised Plan", description: "A treatment plan tailored to your needs, timeline, and budget — with clear options and no pressure." },
    { step: 3, title: "Quality Care", description: "Skilled, caring treatment using modern techniques and technology for the best outcomes." },
    { step: 4, title: "Ongoing Support", description: "Follow-up care and advice to keep your smile healthy and your results lasting." },
  ];
  const aboutBody = data.about?.body || "Our practice combines modern technology with a friendly, professional team. We focus on clear communication, quality care, and results you can see and feel.";
  return `<section class="experience" id="experience">
  <div class="exp-grid">
    <div>
      <div class="lbl">What to Expect</div>
      <div class="sec-title">Your Journey<br>to a <em>Healthier</em> Smile</div>
      <div class="exp-steps">
        ${steps.slice(0, 4).map((s, i) => `<div class="exp-step"><div class="exp-dot">${s.step != null ? s.step : i + 1}</div><div><h4>${escapeHtml(s.title || s.name)}</h4><p>${escapeHtml(s.description || "")}</p></div></div>`).join("\n        ")}
      </div>
    </div>
    <div class="exp-visual">
      <div class="big" aria-hidden="true"></div>
      <h3>A Welcoming Practice</h3>
      <p>${escapeHtml(aboutBody)}</p>
    </div>
  </div>
</section>`;
}

function testimonials(data) {
  const list = data.testimonials || [
    { author: "Sarah M.", quote: "Professional, friendly, and they explained everything clearly. Finally found a dentist I'm happy to bring my whole family to.", rating: 5, role: "Patient" },
    { author: "James L.", quote: "Great experience from start to finish. The team is knowledgeable and the office is clean and modern. Highly recommend.", rating: 5, role: "Patient since 2022" },
    { author: "Maria K.", quote: "Had my veneers done here and couldn't be happier with the results. The care and attention to detail made all the difference.", rating: 5, role: "Patient since 2023" },
  ];
  return `<section class="testimonials" id="testimonials">
  <div class="lbl">Patient Stories</div>
  <div class="sec-title">What Our Patients<br><em>Say</em></div>
  <div class="test-grid">
    ${list.slice(0, 3).map((t) => `<div class="test-card">
      <div class="test-stars">${"★".repeat(t.rating || 5)}</div>
      <p class="test-text">"${escapeHtml(t.quote)}"</p>
      <div class="test-author"><div class="test-avatar">${escapeHtml(String((t.author || "?")[0]))}</div><div><div class="test-name">${escapeHtml(t.author || "")}</div><div class="test-role">${escapeHtml(t.role || "Patient")}</div></div></div>
    </div>`).join("\n    ")}
  </div>
</section>`;
}

function cta(data) {
  const ctaBanner = data.contact || data.cta_banner || {};
  const b = data.business || {};
  // Generic headings only — no business-specific headline
  const headline = "Book Your Appointment";
  const rawSub = ctaBanner.subtext || data.hero?.subheadline || "";
  const subtext = (rawSub && rawSub.trim() !== (b.name || "").trim()) ? rawSub : "Schedule a consultation and take the first step toward a healthier, brighter smile.";
  const btn = data.hero?.cta || { label: "Book Consultation", href: "#cta" };
  return `<section class="cta" id="cta">
  <h2>${headline}</h2>
  <p>${escapeHtml(subtext)}</p>
  <div class="cta-form">
    <input class="cta-input" type="text" placeholder="Your name">
    <input class="cta-input" type="tel" placeholder="Phone number">
    <button type="button" class="cta-btn">${escapeHtml(btn.label)}</button>
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
  const mapIframe = mapSrc ? `<div style="min-height:420px;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(123,104,184,0.15)"><iframe src="${escapeHtml(mapSrc)}" width="100%" height="420" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>` : "";
  const mapLink = mapQ ? `<p style="margin-top:16px"><a href="https://www.google.com/maps?q=${escapeHtml(mapQ)}" target="_blank" rel="noopener" style="color:var(--lavender);font-weight:500">View on Google Maps</a></p>` : "";
  const hasMap = mapIframe || mapLink;
  const insurance = data.insurance;
  const insuranceBlurb = insurance?.accepted ? `<p style="font-size:14px;color:var(--text);max-width:560px;margin-bottom:24px;line-height:1.7">${escapeHtml(insurance.accepted)} ${insurance.payment ? escapeHtml(insurance.payment) : ""}</p>` : "";
  return `<section class="contact-section" id="contact" style="padding:80px 64px;background:var(--whisper)">
  <div class="lbl">Visit Us</div>
  <div class="sec-title">${escapeHtml(contactHeadline)}</div>
  ${insuranceBlurb}
  <div class="contact-grid" style="display:grid;grid-template-columns:${hasMap ? "1fr 1fr" : "1fr"};gap:48px;max-width:1100px;margin:24px 0 0;align-items:start">
    <div>
      ${hoursList ? `<h3 style="font-family:'Bitter',serif;font-size:18px;color:var(--plum);margin-bottom:16px">Hours</h3><ul style="list-style:none;padding:0;margin:0;font-size:14px;color:var(--text)">${hoursList}</ul>` : ""}
      ${address ? `<p style="margin-top:24px;font-size:14px;color:var(--text)"><strong style="color:var(--plum)">Address</strong><br>${escapeHtml(address)}</p>` : ""}
      ${b.phone ? `<p style="margin-top:12px"><a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}" style="color:var(--lavender)">${escapeHtml(b.phone)}</a></p>` : ""}
      ${b.email ? `<p style="margin-top:8px"><a href="mailto:${escapeHtml(b.email)}" style="color:var(--lavender)">${escapeHtml(b.email)}</a></p>` : ""}
      ${mapLink}
    </div>
    ${mapIframe ? `<div>${mapIframe}</div>` : ""}
  </div>
</section>`;
}

function footer(data) {
  const b = data.business || {};
  const rawName = (b.name || "Dental").trim();
  const parts = rawName ? rawName.split(/\s+/) : ["Dental"];
  const first = escapeHtml(parts[0] || "Dental");
  const rest = escapeHtml(parts.slice(1).join(" ") || "");
  const year = new Date().getFullYear();
  const phone = b.phone ? `<a href="tel:${escapeHtml(b.phone.replace(/\D/g, ""))}" style="color:inherit">${escapeHtml(b.phone)}</a>` : "(555) 123-4567";
  const hours = b.hours || {};
  const hoursSummary = Object.entries(hours).length ? Object.entries(hours).slice(0, 2).map(([d, t]) => `${d} ${t}`).join(" · ") : "";
  const hoursAddressLine = [hoursSummary, b.address].filter(Boolean).join(" · ");
  return `<footer>
  <div class="f-logo">${first} <span>${rest}</span></div>
  <div>© ${year} ${escapeHtml(rawName)} · All Rights Reserved${hoursAddressLine ? `<br><span style="font-size:13px;opacity:0.9">${escapeHtml(hoursAddressLine)}</span>` : ""}</div>
  <div>${phone}</div>
</footer>`;
}

export const sections = {
  nav,
  hero,
  services,
  experience,
  testimonials,
  cta,
  contact,
  footer,
};
