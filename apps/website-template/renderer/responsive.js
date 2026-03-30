/**
 * Mobile-first responsive overrides. Applied after style-guide CSS.
 * Base = mobile; min-width breakpoints = tablet/desktop.
 */
export const RESPONSIVE_CSS = `
/* ═══ MOBILE FIRST (base = small screens) ═══ */
main { overflow-x: hidden; }
img, iframe { max-width: 100%; height: auto; }
/* Anchor scroll: leave room for fixed nav (larger on mobile when nav stacks) */
[id="services"], [id="about"], [id="testimonials"], [id="contact"], [id="experience"], [id="cta"], [id="process"], [id="cta-section"], [id="book"] {
  scroll-margin-top: 100px;
}
@media (max-width: 599px) {
  [id="services"], [id="about"], [id="testimonials"], [id="contact"], [id="experience"], [id="cta"], [id="process"], [id="cta-section"], [id="book"] {
    scroll-margin-top: 140px;
  }
}
/* Touch-friendly tap targets */
@media (max-width: 899px) {
  .btn, .lp-nav-cta, .footer-links a, .lp-nav-links a, .nav-links a {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

/* Nav: hamburger and mobile dropdown (all dental styles) */
.nav-hamburger {
  display: none;
  order: 2;
  margin-left: auto;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  color: inherit;
}
.nav-hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: currentColor;
  transition: transform 0.2s, opacity 0.2s;
}
.nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.nav-mobile {
  display: none;
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 190;
  list-style: none;
  margin: 0;
  padding: 16px 0 24px;
  background: rgba(20, 20, 24, 0.98);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.nav-mobile.open { display: block !important; }
.nav-mobile li { margin: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.nav-mobile li:last-child { border-bottom: none; }
.nav-mobile a {
  display: block;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}
.nav-mobile a:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.nav-mobile .mobile-cta {
  margin: 16px 20px 0;
  padding: 14px 20px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-weight: 600;
  color: #fff;
}
.nav-mobile .mobile-cta:hover { background: rgba(255, 255, 255, 0.1); border-color: #fff; }

/* Mobile + medium viewport: show hamburger and dropdown; hide desktop links and main CTA */
@media (max-width: 1024px) {
  nav .lp-nav-links, nav .nav-links,
  .lp-nav .lp-nav-links, .lp-nav .nav-links { display: none !important; }
  .lp-nav .lp-nav-cta, .lp-nav .btn.lp-nav-cta, nav .nav-cta, .nav-cta { display: none !important; }
  .nav-hamburger { display: flex !important; }
  .nav-mobile { top: 52px; }
}
@media (max-width: 768px) {
  .nav-mobile { top: 52px; }
}
@media (max-width: 480px) {
  .nav-mobile { top: 50px; padding: 12px 0 20px; }
  .nav-mobile a { padding: 12px 16px; font-size: 13px; }
}

/* Nav: desktop layout (logo, links, CTA row) */
.lp-nav {
  padding: 14px 20px !important;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.lp-nav .lp-logo {
  font-size: 18px !important;
  order: 1;
}
.lp-nav .btn, .lp-nav .lp-nav-cta {
  order: 2;
  padding: 10px 20px !important;
  font-size: 12px !important;
  margin-left: auto;
}
.lp-nav-links, .nav-links {
  order: 3;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  gap: 8px 20px;
  justify-content: flex-start;
  align-items: center;
}
.lp-nav-links li, .nav-links li { margin: 0; }
.lp-nav-links a, .nav-links a {
  font-size: 12px !important;
  white-space: nowrap;
}

/* Hero: single column, visual below content; top padding clears fixed nav on mobile */
.lp-hero {
  min-height: auto !important;
  padding: 140px 20px 48px !important;
  display: block !important;
}
/* dental-v3 only: ensure hero content clears fixed nav on mobile */
@media (max-width: 768px) {
  [data-style-id="dental-v3"] .hero .hero-content { padding-top: 140px !important; }
}
.lp-hero .hero-content { max-width: none; }
.lp-hero .hero-visual {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  transform: none !important;
  width: 100% !important;
  max-width: 320px;
  height: 240px;
  margin: 32px auto 0;
}
.lp-hero .hero-stat { margin-top: 32px; gap: 24px; flex-wrap: wrap; }
.lp-hero .hero-h1 { font-size: clamp(32px, 8vw, 48px) !important; }
.lp-hero .hero-sub { font-size: 14px !important; }
.hero-actions { flex-wrap: wrap; gap: 12px !important; }

/* v2 hero: panel below content on mobile */
.lp-hero .hero-visual-panel { margin-top: 32px; max-width: 100%; }

/* v3 hero: stack left/right */
.lp-hero .hero-right { padding-left: 0 !important; margin-top: 32px; }

/* Sections: less padding on mobile */
.lp-section,
.process-section,
.process,
.testimonial-section,
.cta-section,
.testi-section,
.services,
.experience,
.testimonials,
.cta,
.contact-section {
  padding: 48px 20px !important;
}
.lp-section-header, .section-header { margin-bottom: 28px !important; }
.section-title, .section-h2 { font-size: clamp(28px, 6vw, 48px) !important; }

/* Normalize text rhythm across dental styles */
.lbl,
.section-eyebrow {
  margin-bottom: 10px !important;
}
.sec-title,
.section-title,
.section-h2 {
  margin-bottom: 12px !important;
  line-height: 1.15 !important;
}
.sec-sub,
.section-sub {
  margin-bottom: 32px !important;
  line-height: 1.65 !important;
}

/* Card grids: ensure display grid, center, prevent overflow */
.services-grid,
.services-2col,
.svc-grid,
.testimonial-grid,
.testi-grid,
.testimonials-grid {
  display: grid !important;
  width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
.services-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
.services-2col { grid-template-columns: 1fr !important; gap: 16px !important; }
.svc-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
.testimonial-grid, .testi-grid, .testimonials-grid { grid-template-columns: 1fr !important; gap: 20px !important; }

/* Cards: prevent overflow in grid cells */
.service-card, .svc-card, .svc-tile, .tcard, .service-item, .testimonial-card {
  min-width: 0 !important;
  box-sizing: border-box !important;
  overflow-wrap: break-word !important;
}
.service-card, .service-item { padding: 24px 20px !important; }
.svc-card, .svc-tile { padding: 24px 20px !important; }
.tcard, .testimonial-card, .test-card { padding: 24px 20px !important; }

/* Flex children inside cards: allow shrinking so text can wrap */
.svc-body,
.tcard-author > div {
  min-width: 0 !important;
}

/* Card text: force wrapping for long words/URLs */
.sc-title, .sc-desc,
.svc-title, .svc-desc,
.st-title, .st-desc,
.service-item h3, .service-item p,
.tcard-quote, .tcard-name, .tcard-meta, .tcard-service, .tcard-proc, .tcard-date,
.testimonial-card blockquote, .testimonial-name, .testimonial-detail,
.ps-title, .ps-desc, .process-step p, .step h4, .step p {
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  max-width: 100% !important;
}

/* Process / How it works: single column on mobile (v1 = flex, v5 = grid) */
.process-steps {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 24px !important;
  margin-top: 32px !important;
}
.process-steps::before { display: none !important; }
.process-step,
.step {
  min-width: 0 !important;
  box-sizing: border-box !important;
  padding: 24px 20px !important;
}

/* CTA: stack buttons */
.cta-actions, .lp-cta > div[style*="display:flex"] {
  flex-direction: column !important;
  align-items: center !important;
}
.cta-title, .lp-cta h2 { font-size: clamp(28px, 6vw, 48px) !important; }

/* Contact block: single column on mobile */
.contact-grid {
  grid-template-columns: 1fr !important;
  gap: 32px !important;
}
.contact-grid iframe {
  min-height: 400px !important;
  height: 220px !important;
}

/* Stats strip (v2): stack */
.stats-strip {
  flex-direction: column !important;
  gap: 24px !important;
  padding: 40px 20px !important;
}
.stat-box { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.2); padding: 16px !important; }
.stat-box:last-child { border-bottom: none !important; }

/* Footer: mobile responsive (all variants) */
footer {
  padding: 32px 20px !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}
footer:not(.lp-footer) {
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 20px !important;
  flex-wrap: wrap !important;
}
.lp-footer {
  flex-direction: column !important;
  align-items: flex-start !important;
  padding: 32px 20px !important;
  gap: 20px !important;
}
.footer-links { flex-wrap: wrap; gap: 16px !important; }

/* Footer grid layouts (v3 .footer-grid, v5 .footer-inner): single column on mobile */
.footer-inner,
.footer-grid {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 32px !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
.footer-desc { max-width: 100% !important; }
.footer-bottom {
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 12px !important;
  margin-top: 32px !important;
  padding-top: 24px !important;
  text-align: left !important;
}
.footer-bottom span { display: block !important; }
.footer-logo, .footer-desc, .footer-col, .footer-brand .logo, .footer-brand p, .f-logo {
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  min-width: 0 !important;
}

/* Marquee: smaller text on mobile */
.marquee-strip { padding: 12px 0 !important; }
.marquee-inner { font-size: 10px !important; }

/* ═══ TABLET: 600px+ ═══ */
@media (min-width: 600px) {
  .lp-nav { padding: 18px 32px !important; flex-wrap: nowrap; }
  .lp-nav .lp-logo { order: unset; }
  .lp-nav .btn, .lp-nav .lp-nav-cta { order: unset; margin-left: 0; }
  .lp-nav-links a, .nav-links a { font-size: 11px !important; }
  .lp-hero .hero-stat { gap: 40px; }
  .services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 12px !important; }
  .services-2col { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px !important; }
  .svc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 12px !important; }
  .testimonial-grid, .testi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px !important; }
  .cta-actions { flex-direction: row !important; flex-wrap: wrap; justify-content: center; }
  .lp-footer { flex-direction: row !important; flex-wrap: wrap; justify-content: space-between; align-items: center; }
  .contact-grid { grid-template-columns: 1fr 1fr !important; }
  .footer-inner, .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
  .footer-bottom { flex-direction: row !important; justify-content: space-between !important; flex-wrap: wrap !important; }
  .footer-bottom span { display: inline !important; }
  footer { padding: 48px 32px !important; }
}

/* Desktop nav only on large viewport: show links and CTA, hide hamburger (medium = dropdown) */
@media (min-width: 1025px) {
  nav .lp-nav-links, nav .nav-links,
  .lp-nav .lp-nav-links, .lp-nav .nav-links { display: flex !important; width: auto; order: unset; flex: 1; justify-content: center; gap: 24px; }
  .lp-nav .lp-nav-cta, .lp-nav .btn.lp-nav-cta, nav .nav-cta, .nav-cta { display: inline-flex !important; }
  .nav-hamburger { display: none !important; }
}

/* ═══ DESKTOP: 900px+ ═══ */
@media (min-width: 900px) {
  .lp-section, .process-section, .process, .testimonial-section, .cta-section, .testi-section,
  .services, .experience, .testimonials, .cta, .contact-section {
    padding: 72px 48px !important;
  }
  .lp-hero {
    display: grid !important;
    grid-template-columns: 1fr auto;
    padding: 108px 48px 72px !important;
    min-height: 100vh !important;
  }
  .lp-hero .hero-visual {
    position: absolute !important;
    right: 48px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 360px !important;
    height: 440px;
    margin: 0;
  }
  .services-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important; gap: 14px !important; max-width: 1100px !important; }
  .services-2col { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px !important; max-width: 1100px !important; }
  .svc-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 14px !important; max-width: 1100px !important; }
  .process-section .process-steps { display: flex !important; flex-direction: row !important; grid-template-columns: unset !important; margin-top: 64px !important; }
  .process-section .process-steps::before { display: block !important; }
  .process-section .process-step { padding: 0 20px !important; }
  .process .process-steps { grid-template-columns: repeat(4, 1fr) !important; margin-top: 64px !important; }
  .process .step { padding: 40px 32px !important; }
  .testimonial-grid, .testi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 24px !important; max-width: 1100px !important; }
  .test-grid, .testimonials-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 18px !important; }
  .service-card, .svc-card, .svc-tile, .service-item { padding: 28px 24px !important; }
  .tcard, .testimonial-card, .test-card { padding: 28px 24px !important; }
  .stats-strip { flex-direction: row !important; }
  .stat-box { border-right: 1px solid rgba(255,255,255,.2) !important; border-bottom: none !important; }
  .footer-inner { grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 48px !important; }
  .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 48px !important; }
  .footer-desc { max-width: 260px !important; }
  .footer-bottom { margin-top: 48px !important; padding-top: 24px !important; }
  footer { padding: 60px 48px !important; }
}

/* ═══ LARGE: 1100px+ ═══ */
@media (min-width: 1100px) {
  .lp-section, .process-section, .process, .testimonial-section, .cta-section, .testi-section,
  .services, .experience, .testimonials, .cta, .contact-section {
    padding: 84px 60px !important;
  }
  .lp-hero { padding: 112px 60px 76px !important; }
  .lp-hero .hero-visual { right: 60px !important; width: 420px !important; height: 520px; }
  .lp-nav { padding: 24px 60px !important; flex-wrap: nowrap; }
  footer { padding: 60px 60px !important; }
}
`;
