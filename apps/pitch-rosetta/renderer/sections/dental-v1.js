/**
 * Section renderers for dental-v1 (Clinical Clean): same class names as style-guides/dental/dental-v1.html
 */
import { escapeHtml } from "../escape.js";
import { mapsQuery } from "../mapUtils.js";
import { serviceIcon, processIcon } from "../icons.js";

const SVC_ICON_BGS = ["#e0f5f0", "#fdf8e0", "#fde8ed", "#e8eef8", "#f0ffe0", "#fff0e0", "#f5e0ff", "#ffe0f0"];

function nav(data) {
  const b = data.business || {};
  const name = (b.name || "Dental").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const first = escapeHtml(parts[0] || "Dental");
  const second = parts[1] ? escapeHtml(parts[1]) : "";
  const rest = parts.length > 2 ? " " + escapeHtml(parts.slice(2).join(" ")) : "";
  const heroCta = data.hero?.cta || { label: "Book Appointment", href: "#cta-section" };
  return `<nav>
  <div class="logo">${first}<span>${second}</span>${rest}</div>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#process">About</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="${escapeHtml(heroCta.href)}" class="nav-cta">${escapeHtml(heroCta.label)}</a>
  <button class="nav-hamburger" id="hamburger" type="button" onclick="toggleMenu()" aria-label="Open menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</nav>
<ul class="nav-mobile" id="mobileMenu" aria-label="Mobile menu" aria-hidden="true">
  <li><a href="#services">Services</a></li>
  <li><a href="#process">About</a></li>
  <li><a href="#contact">Contact</a></li>
  <li><a href="${escapeHtml(heroCta.href)}" class="mobile-cta">${escapeHtml(heroCta.label)}</a></li>
</ul>`;
}

function hero(data) {
  const b = data.business || {};
  const h = data.hero || {};
  // Generic hero copy only — no business name or business-specific headline in headings
  const headline = "Your Smile Deserves the Best Possible Care";
  const sub = escapeHtml(h.subheadline || "Modern dentistry that combines clinical precision with genuine compassion.");
  const cta = h.cta || { label: "Book Free Consultation →", href: "#cta-section" };
  const stats = data.stats || [
    { value: "4,800+", label: "Happy Patients" },
    { value: "18yr", label: "Experience" },
    { value: "4.9★", label: "Google Rating" },
  ];
  const testimonial = (data.testimonials || [])[0];
  const patientQuote = testimonial?.quote ? `"${escapeHtml(testimonial.quote)}"` : '"I never thought I\'d love going to the dentist."';
  const patientMeta = testimonial?.author ? `— ${escapeHtml(testimonial.author)}, Patient since ${new Date().getFullYear() - 1}` : "— Emily K., Patient since 2021";
  const ratingStat = stats.find((s) => /rating|★/i.test(String(s.label))) || stats[2];
  const ratingVal = ratingStat ? escapeHtml(String(ratingStat.value)) : "4.9 ★";
  const heroImg = data.images?.hero || data.hero?.image;
  const heroBgStyle = heroImg
    ? ` style="position:absolute;inset:0;z-index:0;background-image:linear-gradient(90deg, rgba(240,250,248,0.95) 0%, rgba(255,255,255,0.9) 45%, transparent 70%),url('${escapeHtml(heroImg)}');background-size:cover;background-position:center;pointer-events:none"`
    : "";
  return `<section class="hero">
  ${heroImg ? `<div class="hero-bg"${heroBgStyle}></div>` : ""}
  <div class="hero-content">
    <div class="hero-eyebrow">${escapeHtml(b.acceptingNewPatients !== false ? "Now Accepting New Patients" : "Welcome")}</div>
    <h1>${headline}</h1>
    <p class="hero-desc">${sub}</p>
    <div class="hero-actions">
      <a href="${escapeHtml(cta.href)}" class="btn-primary">${escapeHtml(cta.label)}</a>
      <a href="#services" class="btn-ghost">See Our Services ↓</a>
    </div>
    <div class="hero-trust">
      ${stats.slice(0, 3).map((s) => `<div class="trust-item"><span class="trust-num">${escapeHtml(String(s.value))}</span><span class="trust-label">${escapeHtml(s.label)}</span></div>`).join("\n      ")}
    </div>
  </div>
  <div class="hero-visual">
    <div class="hero-card-main">
      <div class="smile-graphic" aria-hidden="true"></div>
      <div class="hero-badge">
        <div class="rating">${ratingVal}</div>
        <div class="label">Google Reviews</div>
      </div>
      <div class="patient-text">${patientQuote}</div>
      <div class="patient-meta">${patientMeta}</div>
    </div>
    <div class="hero-card-float">
      <div class="float-icon" aria-hidden="true"></div>
      <div>
        <div class="float-label">Next Opening</div>
        <div class="float-sub">Tomorrow · 10:00 AM</div>
      </div>
    </div>
  </div>
</section>`;
}

function services(data) {
  const list = data.services || [];
  const defaultServices = [
    { name: "General Dentistry", description: "Routine cleanings, exams, and preventive care that keeps your mouth healthy for life." },
    { name: "Teeth Whitening", description: "Professional-grade whitening that delivers real results — up to 8 shades brighter." },
    { name: "Dental Implants", description: "Permanent tooth replacement that looks, feels, and functions exactly like your natural teeth." },
    { name: "Orthodontics", description: "Clear aligners and braces for a straighter smile at any age — discreet and effective." },
    { name: "Veneers", description: "Ultra-thin porcelain shells that instantly transform the shape, color, and size of your teeth." },
    { name: "Pediatric Dentistry", description: "Gentle, patient care designed specifically for children from their very first visit." },
    { name: "Sedation Dentistry", description: "Anxiety-free dental care with safe, comfortable sedation options for all procedures." },
    { name: "Emergency Care", description: "Same-day emergency appointments for toothaches, broken teeth, and urgent dental needs." },
  ];
  const items = list.length ? list : defaultServices;
  return `<section class="services" id="services">
  <div class="section-header">
    <div class="section-eyebrow">What We Offer</div>
    <h2 class="section-title">Comprehensive Dental Services</h2>
    <p class="section-sub">${escapeHtml(data.about?.body?.slice(0, 100) || "From your first checkup to your last veneer — everything your smile needs under one roof.")}</p>
  </div>
  <div class="services-grid">
    ${items.slice(0, 8).map((s, i) => `<div class="service-card">
      <div class="s-icon" style="background:${SVC_ICON_BGS[i % SVC_ICON_BGS.length]};">${serviceIcon(i, 24)}</div>
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description || "")}</p>
      <a href="#cta-section" class="service-link">Learn more →</a>
    </div>`).join("\n    ")}
  </div>
</section>`;
}

function process(data) {
  const steps = data.process || [
    { step: "01", title: "Book Your Visit", description: "Choose a time that works for you — online or by phone, any day of the week." },
    { step: "02", title: "Comprehensive Exam", description: "Full digital X-rays and a thorough examination to understand your unique needs." },
    { step: "03", title: "Custom Treatment Plan", description: "A personalized plan — no surprises, ever." },
    { step: "04", title: "Transform Your Smile", description: "Expert treatment with comfort as our top priority, followed by ongoing care." },
  ];
  const list = (data.process || steps).slice(0, 4);
  return `<section class="process" id="process">
  <div class="section-header">
    <div class="section-eyebrow">How It Works</div>
    <h2 class="section-title">Your Journey to a Perfect Smile</h2>
    <p class="section-sub">A simple, stress-free process from first contact to your final result.</p>
  </div>
  <div class="process-steps">
    ${list.map((s, i) => `<div class="step">
      <div class="step-icon">${processIcon(i, 28)}</div>
      <h4>${escapeHtml(s.title || s.name)}</h4>
      <p>${escapeHtml(s.description || "")}</p>
    </div>`).join("\n    ")}
  </div>
</section>`;
}

function testimonials(data) {
  const list = data.testimonials || [
    { author: "Sarah Mitchell", quote: "I've been coming to ClearSmile for three years. The team is exceptional — always gentle, always thorough, and always kind.", rating: 5, role: "Teeth Whitening + Cleaning" },
    { author: "James Okafor", quote: "My implants are indistinguishable from real teeth. The whole process was so much easier than I expected — I wish I'd done it sooner.", rating: 5, role: "Full Implant Restoration", featured: true },
    { author: "Lisa Park", quote: "Took my daughter here at age 5 and she actually looks forward to going to the dentist now. The pediatric team is truly magical.", rating: 5, role: "Pediatric Dentistry" },
  ];
  const items = list.length ? list : list;
  const cards = items.slice(0, 3).map((t, i) => {
    const featured = t.featured === true || (i === 1 && items.length >= 2);
    const avatarStyle = featured ? ' style="background:rgba(62,207,178,0.2);"' : "";
    const nameStyle = featured ? ' style="color:white;"' : "";
    const initial = escapeHtml(String((t.author || "?")[0]));
    return `<div class="t-card${featured ? " featured" : ""}">
      <div class="stars">${"★".repeat(t.rating || 5)}</div>
      <p class="t-quote">"${escapeHtml(t.quote)}"</p>
      <div class="t-author"><div class="t-avatar"${avatarStyle}>${initial}</div><div><div class="t-name"${nameStyle}>${escapeHtml(t.author || "")}</div><div class="t-meta">${escapeHtml(t.role || "Patient")}</div></div></div>
    </div>`;
  });
  if (cards.length < 3 && data.testimonials?.length >= 3) {
    const fill = data.testimonials.slice(0, 3).map((t, i) => {
      const featured = i === 1;
      return `<div class="t-card${featured ? " featured" : ""}">
        <div class="stars">${"★".repeat(t.rating || 5)}</div>
        <p class="t-quote">"${escapeHtml(t.quote)}"</p>
        <div class="t-author"><div class="t-avatar"${featured ? ' style="background:rgba(62,207,178,0.2);"' : ""}>${escapeHtml(String((t.author || "?")[0]))}</div><div><div class="t-name"${featured ? ' style="color:white;"' : ""}>${escapeHtml(t.author || "")}</div><div class="t-meta">${escapeHtml(t.role || "Patient")}</div></div></div>
      </div>`;
    });
    cards.length = 0;
    cards.push(...fill);
  }
  return `<section class="testimonials" id="testimonials">
  <div class="section-header">
    <div class="section-eyebrow">Patient Stories</div>
    <h2 class="section-title">Real Smiles, Real Results</h2>
    <p class="section-sub">Don't take our word for it — hear from the patients who trust us with their smiles.</p>
  </div>
  <div class="testimonials-grid">
    ${cards.join("\n    ")}
  </div>
</section>`;
}

function cta(data) {
  const h = data.hero || {};
  const b = data.business || {};
  // Generic headings only — no business-specific headline
  const contactHeadline = "Start Your Smile Journey Today";
  const rawSub = data.contact?.subtext || h.subheadline || "";
  const subtext = (rawSub && rawSub.trim() !== (b.name || "").trim()) ? rawSub : "Free consultation for all new patients. No commitment, no pressure — just great dentistry.";
  const btn = h.cta || { label: "Book Your Free Consultation", href: "#cta-section" };
  return `<section class="cta-section" id="cta-section">
  <h2>${contactHeadline}</h2>
  <p>${escapeHtml(subtext)}</p>
  <a href="${escapeHtml(btn.href)}" class="btn-white">${escapeHtml(btn.label)}</a>
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
  const mapIframe = mapSrc ? `<div style="min-height:420px;border-radius:16px;overflow:hidden;border:1px solid rgba(62,207,178,0.2)"><iframe src="${escapeHtml(mapSrc)}" width="100%" height="420" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>` : "";
  const mapLink = mapQ ? `<p style="margin-top:16px"><a href="https://www.google.com/maps?q=${escapeHtml(mapQ)}" target="_blank" rel="noopener" style="color:var(--mint);font-weight:600">View on Google Maps</a></p>` : "";
  const hasMap = mapIframe || mapLink;
  const insurance = data.insurance;
  const insuranceBlurb = insurance?.accepted ? `<p style="font-size:14px;color:var(--muted);max-width:560px;margin-bottom:24px;line-height:1.7">${escapeHtml(insurance.accepted)} ${insurance.payment ? escapeHtml(insurance.payment) : ""}</p>` : "";
  return `<section class="contact-section" id="contact" style="padding:80px 60px;background:var(--frost)">
  <div class="section-eyebrow">Visit Us</div>
  <h2 class="section-title">${escapeHtml(contactHeadline)}</h2>
  ${insuranceBlurb}
  <div class="contact-grid" style="display:grid;grid-template-columns:${hasMap ? "1fr 1fr" : "1fr"};gap:48px;max-width:1100px;margin:24px 0 0;align-items:start">
    <div>
      ${hoursList ? `<h3 style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--abyss);margin-bottom:16px">Hours</h3><ul style="list-style:none;padding:0;margin:0;font-size:14px;color:var(--muted)">${hoursList}</ul>` : ""}
      ${address ? `<p style="margin-top:24px;font-size:14px;color:var(--text)"><strong style="color:var(--abyss)">Address</strong><br>${escapeHtml(address)}</p>` : ""}
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
  const desc = escapeHtml(b.description || data.about?.body?.slice(0, 120) || "Modern dentistry with a human touch. Serving our community with precision, compassion, and genuine care since 2006.");
  const year = new Date().getFullYear();
  const address = b.address ? escapeHtml(b.address) : "";
  const phone = b.phone ? escapeHtml(b.phone) : "(555) 234-5678";
  const email = b.email ? escapeHtml(b.email) : "hello@clearsmile.com";
  const hours = b.hours;
  const hoursStr = hours && typeof hours === "object" ? Object.entries(hours).slice(0, 2).map(([d, t]) => `${d} ${t}`).join(" · ") : "Mon–Sat 8am–6pm";
  const mapQ = mapsQuery(b);
  const addressLink = mapQ ? `<a href="https://www.google.com/maps?q=${escapeHtml(mapQ)}" target="_blank" rel="noopener">${address || "View on Google Maps"}</a>` : (address || "");
  return `<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-logo">${name}</div>
      <p class="footer-desc">${desc}</p>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <a href="#services">General Dentistry</a><a href="#services">Cosmetic Dentistry</a><a href="#services">Orthodontics</a><a href="#services">Implants</a><a href="#services">Emergency Care</a>
    </div>
    <div class="footer-col">
      <h5>Practice</h5>
      <a href="#process">About Us</a><a href="#process">Our Team</a><a href="#testimonials">Patient Reviews</a><a href="#cta-section">Insurance</a><a href="#cta-section">Financing</a>
    </div>
    <div class="footer-col">
      <h5>Contact</h5>
      ${addressLink ? addressLink : ""}<a href="tel:${(b.phone || phone).replace(/\D/g, "")}">${phone}</a><a href="mailto:${email}">${email}</a><a href="#">${escapeHtml(hoursStr)}</a>
    </div>
  </div>
  <div class="footer-bottom"><span>© ${year} ${name}. All rights reserved.</span><span>Clinical Clean</span></div>
</footer>`;
}

export const sections = {
  nav,
  hero,
  services,
  process,
  testimonials,
  cta,
  contact,
  footer,
};
