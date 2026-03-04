/**
 * Case study content for AI and local SEO.
 * Template: challenge, solutions, stats. Add real entries as they become available.
 */

export const caseStudyList = [
  {
    slug: "voice-ai-healthcare-toronto",
    title: "Voice AI for a Toronto Healthcare Practice",
    industry: "Healthcare",
    location: "Toronto, Ontario",
    outcome: "24/7 call answering; zero missed appointments.",
    challenge:
      "The practice missed after-hours and lunch-hour calls, losing potential patients to voicemail and competitors.",
    solutions:
      "We deployed a Voice AI system that answers every call 24/7, qualifies callers, and books appointments into their calendar (Voice AI platform, Google Calendar, Cal.com).",
    stats: [
      "Before: 20+ missed calls per week → After: Every call answered; leads captured and appointments booked.",
      "Over 100+ additional bookings made in 3 months.",
      "Zero missed appointments from call handling.",
      "15+ hours saved monthly on phone tag.",
    ],
    testimonial: null,
    cta: "Book a free strategy call",
    href: "/contact",
  },
  {
    slug: "automation-gta-contractor",
    title: "Automation for a GTA Contractor",
    industry: "Construction",
    location: "Greater Toronto Area",
    outcome: "15+ hours saved weekly on follow-ups and invoicing.",
    challenge:
      "Manual follow-ups and invoice reminders consumed 15–20 hours per week; leads and payments were delayed.",
    solutions:
      "We built automated workflows for lead nurturing, appointment reminders, and invoice follow-ups, with CRM and calendar integration (Google Workspace, CRM, email automation).",
    stats: [
      "Before: Manual follow-up and chasing invoices → After: Automated sequences and payment reminders.",
      "15+ hours saved weekly.",
      "Faster lead response and improved cash flow.",
    ],
    testimonial: null,
    cta: "Book a free strategy call",
    href: "/contact",
  },
  {
    slug: "website-seo-toronto-window-glass-repair",
    title: "Website & SEO for a Toronto Window Glass Repair Business",
    industry: "Window & Glass Repair",
    location: "Toronto & GTA",
    outcome: "Recovered from a compromised site; stronger local rankings, clean SEO, and improved Google Business Profile.",
    challenge:
      "The owner reported his website wasn't ranking. We discovered the blog had been compromised: it was full of gambling, crypto, and other unrelated spam content. That toxic content dragged his SEO and local visibility down and hurt his business.",
    solutions:
      "We overhauled the website: removed all compromised and spam content, rebuilt the site for speed and trust, improved on-page and technical SEO, and optimized his Google Business Profile (GBP). The site is now clean, relevant, and built to rank for Toronto and GTA glass repair searches.",
    stats: [
      "Before: Compromised blog (gambling/crypto spam); SEO dragged down → After: Clean site, no spam; improved local SEO and GBP.",
      "Site recovered from compromise; measurable improvement in local search visibility and organic traffic.",
      "Cleaner, trustworthy presence and more leads from search.",
    ],
    testimonial: null,
    cta: "Book a free strategy call",
    href: "/contact",
  },
] as const;

export type CaseStudy = (typeof caseStudyList)[number];

export const caseStudySlugs = caseStudyList.map((s) => s.slug);

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudyList.find((s) => s.slug === slug);
}
