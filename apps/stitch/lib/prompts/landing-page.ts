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

export type BuildLandingPagePromptOptions = {
  /** Used for a hidden field in the hero lead form */
  prospectId?: string;
};

export function buildLandingPagePrompt(
  context: LandingPageContext,
  options?: BuildLandingPagePromptOptions,
): string {
  const json = JSON.stringify(context, null, 2);
  const prospectId = options?.prospectId?.trim();
  const leadFormBlock =
    prospectId != null && prospectId.length > 0
      ? `
Lead capture in the hero (required):
- In the hero section, include a prominent lead capture form beside or below the main headline (integrated layout, on-brand styling).
- Form must use method="post" and action="__LEAD_FORM_ACTION__" (use this exact placeholder string for the action URL).
- Fields (with these exact name attributes): name (text, required), email (email, required), phone (tel, optional), message (textarea, optional).
- Include a hidden input: <input type="hidden" name="prospectId" value="${prospectId}" /> (use this exact prospect id value).
- Submit button with compelling copy such as "Get your free quote" or "Request a consultation".
- Labels, placeholders, and validation hints should be accessible (associated labels, no invented business contact emails).
`
      : "";

  return `You are generating a single responsive marketing landing page as semantic HTML.

Requirements:
- One standalone page: clear visual hierarchy, hero, sections for offerings and social proof as data allows, about if present, strong primary CTA, accessible landmarks and contrast, mobile-first layout.
- Use the JSON below as the only source of business facts and copy. Do not invent addresses, prices, or testimonials that are not implied by the data.
- Output will be consumed as HTML for a live page; prefer clean, professional styling suitable for a small business or product launch.${leadFormBlock}
Context (JSON):
${json}`;
}
