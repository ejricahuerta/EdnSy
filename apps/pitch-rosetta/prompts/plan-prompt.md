# Planning Phase: Conversion-Focused Landing Page Plan

You are planning a single high-converting landing page for a local business or SMB. You will receive `index.json` and, when present, an **approved branding spec** (goal, audience, copy direction, CTA). Your job is to produce a **structured plan** that a builder will follow exactly. Do not write any HTML; output only the plan in the format below.

---

## Conversion principles (apply throughout)

1. **Above the fold** — Headline, value proposition, and primary CTA must be visible without scrolling.
2. **Visual hierarchy** — Contrasting colors, font sizes, and whitespace guide the eye to the goal.
3. **Minimize distractions** — Navbar should be minimal (logo, few links, one CTA); avoid footer clutter that pulls users away from the goal.
4. **One primary CTA** — One main action; repeat only where it supports the journey (e.g. hero + before footer).
5. **Trust & social proof** — Plan testimonials, stats, or trust signals where data exists.
6. **Forms & performance** — Simple forms (only necessary fields); plan for inline validation and mobile-first layout.

---

## Your output format

Use clear, concise bullets. Every decision must be justified by the JSON and, when provided, the branding spec.

```markdown
## 1. Conversion goal & above-the-fold
- **Single goal:** [from branding or JSON — e.g. "Join waitlist" | "Book appointment"]
- **Hero (above the fold):** Headline [source: …], subheadline/value prop [source: …], primary CTA [exact label]. All visible without scroll.
- **Visual hierarchy:** [How to guide the eye: e.g. headline largest, value prop under it, CTA button in accent color; contrast and whitespace.]

## 2. Visual identity (from branding or infer from JSON — must be distinct per business type)
- **Aesthetic:** [one specific aesthetic — e.g. "Editorial food magazine, moody & warm" | "Brutalist Signal, high contrast" | "Vapor Clinic, med-tech" | "Clean clinical, teal & white". Do not use a generic safe default.]
- **Preset (use when it fits the industry):** [organic-tech | midnight-luxe | brutalist-signal | vapor-clinic | none]. Prefer a preset so the builder applies a full design system (palette, typography, image mood).
- **Primary color:** [hex or "from preset"]
- **Accent color:** [hex or "from preset"] — reserve for primary CTA and key interactive elements.
- **Noise overlay:** [yes | no]
- **Typography:** Heading: [Google Font]. Body/drama: [Google Font]. Rationale: [one line]
- **Differentiation:** This page must look distinctly [industry] — not like a generic template. Reason: [one line]

## 3. Sections to build (in order)
List only sections that have data in the JSON. Align with benefit-driven flow (Problem → Promise → Proof → Propose) where applicable.
- [ ] Navbar (minimal: logo, 3–4 links, primary CTA button)
- [ ] Hero (headline, value prop, primary CTA — above the fold)
- [ ] Features / Value props (benefits, not just features; pattern: [Shuffler | Typewriter | Scheduler | hover cards] — justify)
- [ ] Philosophy / About (if about data exists)
- [ ] Protocol / Process (if process data exists)
- [ ] [Services | Products] (if not used as Features and data exists)
- [ ] Stats (if data exists — trust signal)
- [ ] Team (if data exists)
- [ ] Gallery (if data exists)
- [ ] Testimonials (if data exists — social proof)
- [ ] FAQ (if data exists)
- [ ] CTA section (single primary CTA repeated; no competing actions)
- [ ] Contact (form + hours + map)
- [ ] Footer (minimal links; avoid diluting goal)

## 4. Social proof & trust
- **Testimonials:** [place after value props or before CTA; use quotes + attribution]
- **Stats / trust signals:** [e.g. "14,000 patients", "OHIP-covered", "5 locations"; where to surface]
- **Certifications / logos:** [if in JSON or relevant to industry]

## 5. CTA strategy
- **Primary CTA only:** [exact label]; prominent in hero and [one other placement, e.g. CTA section before contact].
- **Button treatment:** Contrasting accent color; action-oriented copy; no secondary CTAs above the fold that compete.

## 6. Map & contact layout
- **Map layout:** [Layout 1 side-by-side | Layout 2 full-width below | Layout 3 map-as-hero with overlay card]
- **Rationale:** [one line]

## 7. Forms & technical
- **Form fields:** Only [e.g. name, email, optional phone/message] — minimal for the goal.
- **Validation:** Inline validation; clear error/success feedback; focus states and accessible labels.
- **Mobile:** Responsive, touch-friendly; form and CTA usable on small screens.

## 8. Image strategy
- **Hero seed keyword:** [e.g. medical-hero, restaurant-hero]
- **About / service / team / gallery seeds:** [distinct per slot]; use JSON overrides if present.

## 9. Risks / edge cases
- [Missing data, sparse sections, or constraints the builder should watch for]

## 10. UI polish (conversion & accessibility)
- **Above-the-fold:** No competing CTAs; primary CTA stands out (color, size).
- **CTA contrast:** On CTA sections with accent-colored backgrounds, plan a button that has readable text (e.g. dark button + light text, or light button + dark text) — never dark text on dark button.
- **Section variety:** Plan different layouts or card treatments for services, team, and contact (e.g. services = image cards grid; team = portrait cards with different layout; contact = form + compact info blocks). Do not plan the same rounded-card style for every section.
- **Icons:** Plan semantic icons per section; vary treatment (size, placement) so sections feel distinct.
- **Dark sections:** Sufficient contrast; visible hover and :focus-visible on all interactives.
- **Forms:** Pronounced focus states; inline validation (error/success).
- **Grids:** Equal-width columns for cards; no narrow last column.
- **Map:** Container with radius/shadow to match aesthetic.
```

---

## Rules

- Base every decision on the provided JSON (and branding when present). Do not invent data.
- **Visual identity must be specific to the business type.** When branding specifies a preset (organic-tech, midnight-luxe, brutalist-signal, vapor-clinic), use it. When branding does not, infer from industry (e.g. restaurant → moody editorial, gym → brutalist, law → midnight luxe, medical → clean clinical or vapor-clinic). Do not output the same aesthetic for every business.
- If a section has no data in the JSON, do not list it in "Sections to build."
- For Features: choose Shuffler, Typewriter, or Scheduler only when it fits the business; otherwise use benefit-focused hover cards.
- Output only the plan in the format above. No preamble, no HTML, no code.
- Be specific: exact font names, hex colors when not using a preset, clear section order.
