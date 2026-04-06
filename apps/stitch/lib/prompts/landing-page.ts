/**
 * Structured context for landing page generation (POST /create body).
 * All fields are optional at runtime; callers may send a superset as JSON.
 */
export type LandingPageContext = {
  business?: {
    name?: string;
    tagline?: string;
    contact?: string;
    address?: string;
    hours?: string;
    serviceArea?: string;
  };
  offerings?: {
    services?: string[];
    categories?: string[];
    pricingNotes?: string;
  };
  socialProof?: {
    testimonials?: { quote?: string; author?: string; role?: string }[];
    logos?: string[];
    awards?: string[];
  };
  about?: {
    story?: string;
    team?: string;
    differentiators?: string[];
  };
  marketing?: {
    heading?: string;
    subheading?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    sectionTitles?: Record<string, string>;
    footer?: string;
  };
};

export function buildLandingPagePrompt(context: LandingPageContext): string {
  const json = JSON.stringify(context, null, 2);

  return `You are generating a single responsive marketing landing page as semantic HTML.

Requirements:
- One standalone page: clear visual hierarchy, hero, sections for offerings and social proof as data allows, about if present, strong primary CTA, accessible landmarks and contrast, mobile-first layout.
- Use the JSON below as the only source of business facts and copy. Do not invent addresses, prices, or testimonials that are not implied by the data.
- Output will be consumed as HTML for a live page; prefer clean, professional styling suitable for a small business or product launch.

Context (JSON):
${json}`;
}
