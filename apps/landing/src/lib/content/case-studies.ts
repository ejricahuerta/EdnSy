/**
 * Case study content for AI and local SEO.
 * Template: challenge, solutions, stats. Add real entries as they become available.
 */

export const caseStudyList = [
  {
    slug: "website-seo-toronto-window-glass-repair",
    title: "Website & SEO for a Toronto Window Glass Repair Business",
    industry: "Window & Glass Repair",
    location: "Toronto & GTA",
    outcome:
      "Recovered from a compromised site; stronger local rankings, clean SEO, improved Google Business Profile, and a professional site that converts.",
    challenge:
      "The owner (OhMyGlass) reported his website wasn't ranking and didn't represent his business. We audited the site and found the blog had been compromised: it was full of gambling, crypto, and other unrelated spam content. That toxic content dragged his SEO and local visibility down, confused potential customers, and hurt trust. His previous web providers had left the site vulnerable and never addressed the hack.",
    solutions:
      "We did a full recovery and rebuild: removed all compromised and spam content, secured the site, and rebuilt it for speed and trust. We improved on-page and technical SEO (titles, meta, structure, Core Web Vitals), optimized his Google Business Profile (GBP) for Toronto and GTA glass repair searches, and gave him a clear, professional presence (ohmyglass.ca) that reflects his services: emergency glass repair, window replacement, and mirror installation across Toronto, Etobicoke, and Scarborough.",
    stats: [
      "Before: Compromised blog (gambling/crypto spam); SEO dragged down; no clear local positioning → After: Clean site, no spam; improved local SEO and GBP.",
      "Site fully recovered from compromise; measurable improvement in local search visibility and organic traffic.",
      "Clear, trustworthy presence aligned with real services; more qualified leads from search.",
      "Google Business Profile optimized so local searchers can find and contact the business reliably.",
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
