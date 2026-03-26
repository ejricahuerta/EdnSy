# Cloudflare Workers / Cloudflare website layout reference

Based on cloudflare.com and developer-platform/workers/ (2025–2026).

## Cloudflare Workers page structure

1. **Hero**
   - One main headline (e.g. "Run serverless code with exceptional performance, reliability, and scale")
   - Short sub copy (1–2 sentences)
   - **Two primary CTAs** (e.g. "Start building", "Read developer docs")
   - One tertiary link (e.g. "Visit the Workers playground")
   - Optional: right-column visual or interactive demo

2. **Benefits**
   - Small uppercase label (e.g. "BENEFITS OF WORKERS")
   - **Three benefit cards in a single row**: each has a headline + one short line. No alternating layout.

3. **How it works**
   - Uppercase label "HOW IT WORKS"
   - **One** section headline (e.g. "Run serverless code from region: Earth")
   - One body paragraph (technical/product explanation)
   - One CTA link (e.g. "See reference architecture", "Learn how to build...")
   - Optional: one diagram or visual (not 4 separate feature blocks)

4. **Testimonial**
   - Single customer quote + attribution (name, title, company)

5. **Use cases**
   - Section headline (e.g. "Top Workers use cases", "Focus on your code and innovate faster")
   - **Three cards**: each has title, short description, "Learn more" link

6. **Case studies CTA**
   - One line (e.g. "Helping organizations worldwide modernize applications") + "View case studies" link

7. **Related products**
   - Two (or three) small product cards: title + one-line description (e.g. Workers KV, R2)

8. **Resources**
   - Carousel or grid: "Slide 1 of 5" style – resource cards (Discord, Observability, Workers 101, Vite plugin, Framework guides) with "Read the docs" / "Join" links

9. **Final CTA**
   - Headline (e.g. "Start building today") + primary button (Sign up)
   - Footer-style links: Contact sales, Request a demo, Get a recommendation, Plans, etc.

## Design notes

- **Clean, doc-style**: Clear hierarchy, one main idea per section
- **Two CTAs in hero**: Primary + secondary action
- **Benefits**: One row of three, no left/right alternating
- **How it works**: Single block with one headline, one body, one CTA, one visual (not multiple feature blocks)
- **Use cases**: Grid of 3 with "Learn more"
- **Resources**: Carousel or card strip
- **Theme**: Cloudflare uses orange accent; we keep primary purple (#3a00ff)

## EdnSy mapping

1. Hero: H1 + sub + **2 CTAs** (Book a call, See the services) + "See case study" link. Keep interactive right col.
2. Benefits: "BENEFITS" → 3 tiles (Always on, Less chasing, Cleaner handoffs) in one row.
3. How it works: "HOW IT WORKS" → one headline "A simple implementation path" → processIntro → one card showing 4 steps (compact) → "Learn more" to /process.
4. Testimonial: One quote (case study or client).
5. Use cases: "What we build" / "Top use cases" → 3 services with "Learn more".
6. Case studies CTA: One line + "Read the case study".
7. Related: "Works with the tools you already use" (Integrations) or Industries as 2–3 cards.
8. Resources: FAQ accordion or "Resources" links (Process, Industries, Contact).
9. Final CTA: "Get started" + button + Contact / Services / Process links.
