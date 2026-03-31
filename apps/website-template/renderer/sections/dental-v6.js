/**
 * Dental-v6 renderer
 * - Uses the markup/classnames that `style-guides/dental/dental-v6.html` expects.
 * - Fixes "images not loading" by emitting real <img> tags with onerror fallbacks.
 */
import { escapeHtml } from "../escape.js";
import { resolveDentalImage } from "../randomDentalImages.js";

function toTelDigits(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

function imgWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  loading,
  fetchpriority,
}) {
  const safeSrc = escapeHtml(src || "");
  const safeFallback = escapeHtml(fallbackSrc || "");
  const safeAlt = escapeHtml(alt || "");

  return `<img
    class="${escapeHtml(className || "")}"
    src="${safeSrc}"
    alt="${safeAlt}"
    loading="${escapeHtml(loading || "lazy")}"
    decoding="async"
    onerror="this.onerror=null;this.src='${safeFallback}'"
    ${fetchpriority ? `fetchpriority="${escapeHtml(fetchpriority)}"` : ""}
  />`;
}

function pickStat(stats, matcher, fallback) {
  const arr = Array.isArray(stats) ? stats : [];
  const found = arr.find((s) => matcher.test(String(s?.label ?? "")) || matcher.test(String(s?.value ?? "")));
  return found
    ? { value: String(found.value ?? ""), label: String(found.label ?? "") }
    : fallback;
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatAddressLines(address) {
  if (typeof address !== "string" || !address.trim()) return null;
  const t = address.trim();
  if (t.includes("\n")) return t.split("\n").map((s) => s.trim()).filter(Boolean);
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

function formatHoursLines(hours) {
  if (!hours || typeof hours !== "object") return [];
  return WEEK_DAYS.map((day) => {
    const v = hours[day];
    if (v == null || String(v).trim() === "") return null;
    return `${day}: ${String(v).trim()}`;
  }).filter(Boolean);
}

const DEFAULT_SERVICES = [
  { name: "General Dentistry", description: "Comprehensive preventive care, cleanings, fillings, and oral health exams designed to keep your teeth and gums healthy for life." },
  { name: "Teeth Whitening", description: "Professional-grade whitening treatments that deliver dramatically brighter results in a single visit or with our take-home system — safe, effective, and beautifully natural." },
  { name: "Dental Implants", description: "Permanent, natural-feeling tooth replacements that restore function and confidence. Our implant specialists use the latest guided technology for precision and minimal downtime." },
  { name: "Orthodontics", description: "Clear aligner therapy and traditional bracing solutions for all ages. Straighten your smile discreetly with a personalized treatment plan crafted around your lifestyle." },
  { name: "Porcelain Veneers", description: "Ultra-thin, custom-crafted porcelain shells that correct shape, color, and proportion in as little as two visits. The cornerstone of our smile design philosophy." },
  { name: "Emergency Care", description: "Dental emergencies don't wait, and neither do we. Same-day appointments, evening hours, and direct phone access to our clinical team ensure you're never left without support." },
];

const DEFAULT_TESTIMONIALS = [
  { author: "Michelle T.", quote: "I had serious dental anxiety for years. The team at Lumina completely changed how I feel about going to the dentist. They're patient, thorough, and genuinely kind. I actually look forward to my appointments now.", role: "General Dentistry & Whitening" },
  { author: "James R.", quote: "Dr. Voss gave me the smile I always wanted. My veneers look completely natural — people keep asking if I've always had teeth this perfect. The entire experience was seamless and worth every penny.", role: "Porcelain Veneers" },
  { author: "Sandra K.", quote: "After losing a tooth in an accident, I was devastated. Lumina walked me through the implant process step by step. Six months later, it feels and looks exactly like my natural tooth. Truly life-changing.", role: "Dental Implant" },
  { author: "The Nakamura Family", quote: "We bring the whole family here — from our 7-year-old to my 68-year-old mother. The staff remembers everyone's names, preferences, and history. It's rare to find a practice that treats patients like people.", role: "Family Dental Care" },
  { author: "David M.", quote: "I chipped a tooth on a Friday evening and was terrified I'd spend the weekend in pain. I called Lumina at 6pm and they had me in first thing Saturday. Professional, calm, and fixed in under an hour.", role: "Emergency Care" },
  { author: "Priya S.", quote: "I did clear aligners with Lumina and couldn't be happier. The check-ins were easy, the process was explained clearly, and my teeth are now perfectly straight. The whole team celebrated with me at my last appointment.", role: "Clear Aligner Orthodontics" },
];

function nav(data) {
  const b = data.business || {};
  const name = escapeHtml(b.name || "Lumina Dental");

  return `<nav>
  <a href="#" class="nav-logo">${name}</a>

  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#about">Our Story</a></li>
    <li><a href="#testimonials">Reviews</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#book" class="nav-cta">Book Now</a></li>
  </ul>

  <button class="nav-hamburger" id="hamburger" type="button" onclick="toggleMenu()" aria-label="Toggle navigation menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
</nav>

<div class="nav-mobile" role="navigation" aria-label="Mobile navigation" id="mobileMenu" aria-hidden="true">
  <ul>
    <li><a href="#services">Services</a></li>
    <li><a href="#about">Our Story</a></li>
    <li><a href="#testimonials">Reviews</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <a href="#book" class="nav-mobile-cta">Book Now</a>
</div>

<script>
  (function () {
    var menu = document.getElementById('mobileMenu');
    var btn = document.getElementById('hamburger');
    if (!menu || !btn) return;
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  })();
  (function () {
    var nav = document.querySelector('nav');
    var hero = document.querySelector('.hero');
    if (!nav || !hero) return;
    function syncNavScrolled() {
      nav.classList.toggle('scrolled', hero.getBoundingClientRect().bottom <= 1);
    }
    syncNavScrolled();
    window.addEventListener('scroll', syncNavScrolled, { passive: true });
    window.addEventListener('resize', syncNavScrolled);
  })();
</script>`;
}

function hero(data) {
  const b = data.business || {};
  const h = data.hero || {};

  const eyebrow =
    b.acceptingNewPatients !== false ? "Now Welcoming New Patients" : "Welcome";

  const sub =
    typeof h.subheadline === "string" && h.subheadline.trim()
      ? h.subheadline.trim()
      : "Boutique dental care where precision meets genuine warmth. Every visit, every smile — crafted just for you.";

  const bookCta = h.cta || { label: "Book a Consultation", href: "#contact" };
  const bookHref = typeof bookCta.href === "string" && bookCta.href.trim() ? bookCta.href.trim() : "#contact";
  const bookLabel =
    typeof bookCta.label === "string" && bookCta.label.trim()
      ? bookCta.label.trim()
      : "Book a Consultation";

  const heroSrc = resolveDentalImage(data.images?.hero || h.image, "3x2", data.__dentalImageAllocator);

  const stats = data.stats || [];
  const patientsStat = pickStat(stats, /patient|review|smile|served/i, { value: "5,200+", label: "Patients Served" });
  const yearsStat = pickStat(stats, /year|excellence|experience|in practice/i, { value: "18 Years", label: "Of Excellence" });
  const ratingStat = pickStat(stats, /rating|star|★|google/i, { value: "4.9★", label: "Average Rating" });

  return `<section class="hero" id="home">
  ${imgWithFallback({
    src: heroSrc,
    fallbackSrc: resolveDentalImage(undefined, "3x2", data.__dentalImageAllocator),
    alt: "Modern dental studio interior",
    className: "hero-bg",
    loading: "eager",
    fetchpriority: "high",
  })}

  <div class="hero-overlay"></div>

  <div class="hero-content">
    <span class="hero-eyebrow">&#9679; ${escapeHtml(eyebrow)}</span>
    <h1 class="hero-headline">Your Smile.<br>Perfectly <em>Yours.</em></h1>
    <p class="hero-sub">${escapeHtml(sub)}</p>

    <div class="hero-ctas">
      <a href="#book" class="btn-primary">${escapeHtml(bookLabel)}</a>
      <a href="#services" class="btn-ghost">Explore Services ↓</a>
    </div>
  </div>

  <div class="hero-stat-bar">
    <div class="stat-item">
      <span class="stat-number">${escapeHtml(patientsStat.value)}</span>
      <span class="stat-label">${escapeHtml(patientsStat.label)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-number">${escapeHtml(yearsStat.value)}</span>
      <span class="stat-label">${escapeHtml(yearsStat.label)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-number">${escapeHtml(ratingStat.value)}</span>
      <span class="stat-label">${escapeHtml(ratingStat.label)}</span>
    </div>
  </div>
</section>`;
}

function trust(data) {
  return `<div class="trust-strip">
  <div class="trust-strip-inner">
    <span class="trust-label">Trusted by Families Across the Community</span>
    <div class="trust-divider-v"></div>
    <div class="trust-items">
      <span class="trust-item"><i data-lucide="shield-check"></i>Board-Certified Dentists</span>
      <span class="trust-item"><i data-lucide="award"></i>ADA Member Practice</span>
      <span class="trust-item"><i data-lucide="heart"></i>Sedation Available</span>
      <span class="trust-item"><i data-lucide="clock"></i>Same-Day Appointments</span>
      <span class="trust-item"><i data-lucide="credit-card"></i>All Major Insurance Accepted</span>
    </div>
  </div>
</div>`;
}

function services(data) {
  const list = Array.isArray(data.services) ? data.services : [];
  const merged = [...list, ...DEFAULT_SERVICES].slice(0, 6);

  const icons = ["smile", "sparkles", "crown", "star", "gem", "circle-alert"];

  return `<section class="services-section" id="services">
  <div class="services-inner">
    <div class="section-label">Our Services</div>
    <h2 class="section-title">Comprehensive Care,<br><em>Beautifully Delivered</em></h2>
    <p class="section-sub">
      From routine cleanings to complete smile transformations, every treatment is performed with meticulous care and an artist's eye.
    </p>

    <div class="services-grid">
      ${merged
        .map((s, i) => {
          const icon = icons[i % icons.length];
          return `<div class="service-card">
            <i data-lucide="${escapeHtml(icon)}" class="service-icon"></i>
            <div class="service-name">${escapeHtml(s?.name || "")}</div>
            <p class="service-desc">${escapeHtml(s?.description || "")}</p>
            <a href="#contact" class="service-link">Learn more →</a>
          </div>`;
        })
        .join("\n")}
    </div>
  </div>
</section>`;
}

function about(data) {
  const about = data.about || {};
  const quote =
    typeof about.headline === "string" && about.headline.trim()
      ? about.headline.trim()
      : "We believe every patient deserves to feel seen, heard, and cared for — not just treated.";

  const body = typeof about.body === "string" ? about.body.trim() : "";
  const body1 = body ? body.slice(0, 220) : "Lumina Dental Studio was founded on a simple belief: that going to the dentist should feel like a visit with someone who truly knows you.";
  const body2 = body ? body.slice(220).trim() : "We invest in the finest materials, the most current techniques, and — above all — the people who walk through our door. Whether you're here for a routine cleaning or a complete smile transformation, you'll find the same standard of warmth and precision every single time.";

  const aboutImg = resolveDentalImage(data.images?.about, "3x2", data.__dentalImageAllocator);

  const signatureName = typeof about.signatureName === "string" && about.signatureName.trim()
    ? about.signatureName.trim()
    : "Dr. Eleanor Voss, DDS";
  const signatureTitle = typeof about.signatureTitle === "string" && about.signatureTitle.trim()
    ? about.signatureTitle.trim()
    : "Founder & Lead Clinician, Lumina Dental Studio";

  return `<section class="about-section" id="about">
  <div class="about-image" role="img" aria-label="Dentist consulting warmly with a patient"${aboutImg ? ` style="background: url('${escapeHtml(aboutImg)}') center / cover no-repeat;"` : ""}></div>
  <div class="about-content">
    <div class="about-label">Our Philosophy</div>
    <blockquote class="about-quote">${escapeHtml(quote)}</blockquote>
    <p class="about-body">${escapeHtml(body1)}</p>
    <p class="about-body" style="margin-top: 16px;">${escapeHtml(body2)}</p>
    <div class="about-signature">
      <span class="signature-name">${escapeHtml(signatureName)}</span>
      <span class="signature-title">${escapeHtml(signatureTitle)}</span>
    </div>
  </div>
</section>`;
}

function testimonials(data) {
  const list = Array.isArray(data.testimonials) ? data.testimonials : [];
  const merged = [...list, ...DEFAULT_TESTIMONIALS].slice(0, 6);

  return `<section class="testimonials-section" id="testimonials">
  <div class="testimonials-inner">
    <div class="section-label">Patient Stories</div>
    <h2 class="section-title">Real Stories from<br><em>Real Patients</em></h2>

    <div class="testimonials-grid">
      ${merged
        .map((t) => {
          const stars = "★★★★★";
          return `<div class="testimonial-card">
            <div class="testimonial-stars">${stars}</div>
            <p class="testimonial-quote">"${escapeHtml(String(t?.quote || ""))}"</p>
            <div class="testimonial-author">
              <span class="author-name">${escapeHtml(String(t?.author || ""))}</span>
              <span class="author-service">${escapeHtml(String(t?.role || ""))}</span>
            </div>
          </div>`;
        })
        .join("\n")}
    </div>
  </div>
</section>`;
}

function cta(data) {
  const b = data.business || {};
  const hero = data.hero || {};
  const contact = data.contact || {};
  const ctaSub =
    typeof contact?.subtext === "string" && contact.subtext.trim()
      ? contact.subtext.trim()
      : typeof hero?.subheadline === "string" && hero.subheadline.trim()
        ? hero.subheadline.trim()
        : "Your first consultation is a conversation — no pressure, no obligations. Just an honest look at your smile and what's possible.";

  const primaryHref = typeof hero?.cta?.href === "string" && hero.cta.href.trim()
    ? hero.cta.href.trim()
    : "#contact";

  const heroImg = resolveDentalImage(data.images?.cta || hero?.image, "9x16", data.__dentalImageAllocator);

  const phoneDigits = data.business?.phone ? toTelDigits(data.business.phone) : "18005550199";
  const callLabel = data.business?.phone ? `Call ${data.business.phone}` : "Call (800) 555-0199";

  return `<section class="cta-section" id="book">
  ${imgWithFallback({
    src: heroImg,
    fallbackSrc: resolveDentalImage(undefined, "9x16", data.__dentalImageAllocator),
    alt: "Woman with a beautiful, confident smile",
    className: "cta-bg",
    loading: "lazy",
  })}
  <div class="cta-overlay"></div>
  <div class="cta-inner">
    <div class="cta-label">Take the First Step</div>
    <h2 class="cta-heading">Begin Your Smile<br>Journey <em>Today</em></h2>
    <p class="cta-sub">${escapeHtml(ctaSub)}</p>
    <div class="cta-buttons">
      <a href="${escapeHtml(primaryHref)}" class="btn-primary">Book a Consultation</a>
      <a href="tel:+${escapeHtml(phoneDigits)}" class="btn-ghost-dark">${escapeHtml(callLabel)}</a>
    </div>
  </div>
</section>`;
}

function footer(data) {
  const b = data.business || {};
  const year = new Date().getFullYear();

  const social = b.social || {};
  const instagramHref = typeof social.instagram === "string" ? social.instagram : "#";
  const facebookHref = typeof social.facebook === "string" ? social.facebook : "#";

  const phone = b.phone || "(800) 555-0199";
  const email = b.email || "hello@luminadental.com";
  const phoneDigits = toTelDigits(phone) || "18005550199";
  const addrLines = formatAddressLines(b.address) || ["1240 Brightwater Blvd", "Suite 201", "Tampa, FL 33602"];
  const addressHtml = addrLines.map((line) => escapeHtml(line)).join("<br>");
  let hourLines = formatHoursLines(b.hours);
  if (hourLines.length === 0) {
    hourLines = ["Mon–Fri: 8am – 6pm", "Saturday: 9am – 2pm", "Sunday: Closed"];
  }
  const hoursItems = hourLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("\n        ");

  return `<footer id="contact">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#home" class="footer-brand-logo">${escapeHtml(b.name || "Lumina Dental")}</a>
        <p class="footer-brand-desc">
          A boutique dental studio dedicated to precision, warmth, and the belief that every smile tells a story worth caring for.
        </p>
        <div class="footer-social">
          <a href="${escapeHtml(instagramHref)}" target="_blank" rel="noopener" aria-label="Instagram">
            <i data-lucide="instagram" style="width:15px;height:15px;"></i>
          </a>
          <a href="${escapeHtml(facebookHref)}" target="_blank" rel="noopener" aria-label="Facebook">
            <i data-lucide="facebook" style="width:15px;height:15px;"></i>
          </a>
          <a href="#" aria-label="Google">
            <i data-lucide="star" style="width:15px;height:15px;"></i>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">Services</div>
        <ul class="footer-links">
          <li><a href="#services">General Dentistry</a></li>
          <li><a href="#services">Teeth Whitening</a></li>
          <li><a href="#services">Dental Implants</a></li>
          <li><a href="#services">Orthodontics</a></li>
          <li><a href="#services">Porcelain Veneers</a></li>
          <li><a href="#services">Emergency Care</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">Practice</div>
        <ul class="footer-links">
          <li><a href="#about">Our Story</a></li>
          <li><a href="#about">Meet the Team</a></li>
          <li><a href="#testimonials">Patient Reviews</a></li>
          <li><a href="#services">New Patients</a></li>
          <li><a href="#contact">Insurance &amp; Financing</a></li>
          <li><a href="#contact">Patient Portal</a></li>
        </ul>
      </div>

      <div class="footer-col footer-col-contact">
        <div class="footer-col-title">Contact</div>
        <ul class="footer-links">
          <li><a href="tel:+${escapeHtml(phoneDigits)}">${escapeHtml(phone)}</a></li>
          <li><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></li>
        </ul>
        <address class="footer-address">${addressHtml}</address>
        <ul class="footer-hours">
        ${hoursItems}
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span class="footer-copy">&copy; ${year} ${escapeHtml(b.name || "Lumina Dental Studio")}. All rights reserved. Privacy Policy · Accessibility</span>
      <span class="footer-version">V6 — Cinematic · Mobile First</span>
    </div>
  </div>
</footer>`;
}

export const sections = {
  nav,
  hero,
  trust,
  services,
  about,
  testimonials,
  cta,
  footer,
};

