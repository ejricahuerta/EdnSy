/**
 * Case study content for AI and local SEO.
 * Template: challenge, approach, results, takeaways.
 */

type StudyImage = {
  src: string;
  alt: string;
  credit: string;
  creditHref: string;
};

type ApproachStep = {
  step: string;
  title: string;
  body: string;
};

type Takeaway = {
  title: string;
  body: string;
};

type StudyTestimonial = {
  quote: string;
  attribution: string;
};

export const caseStudyList = [
  {
    slug: "website-seo-toronto-window-glass-repair",
    title: "Website & SEO for a Toronto Window Glass Repair Business",
    industry: "Window & Glass Repair",
    location: "Toronto & GTA",
    outcome:
      "Recovered from a site compromised by injected adult, gambling, and crypto spam content, then rebuilt for local SEO dominance. 100+ additional converted leads within 3 months. Ranking #1 for \"window replacement.\" Ongoing partnership now expanding into Voice AI.",
    heroImage: {
      src: "/images/case-studies/ohmyglass-aluminum-storefront.jpg",
      alt: "OhMyGlass aluminum storefront",
      credit: "OhMyGlass website",
      creditHref: "https://www.ohmyglass.ca",
    } satisfies StudyImage,
    challenge:
      "By the time OhMyGlass came to Ed & Sy, their website had been quietly compromised. Malicious third-party content, including adult content, cryptocurrency promotions, gambling pages, and multilingual spam, had been injected throughout the site. The consequences were severe. Google had effectively deindexed the business for its core services, while a bogus page was outranking everything related to actual glass repair.",
    approachSteps: [
      {
        step: "01",
        title: "Full site recovery",
        body:
          "We audited every page, removed the injected spam content, cleaned the compromised structures, and addressed the root causes so the site could recover trust with Google.",
      },
      {
        step: "02",
        title: "Full website redesign",
        body:
          "With the site clean, we rebuilt it around clear service pages, stronger local intent, and fast mobile-first performance that met modern search expectations.",
      },
      {
        step: "03",
        title: "Local SEO rebuild",
        body:
          "We rebuilt topical authority around high-intent service and geo-targeted searches, then optimized the Google Business Profile, on-page structure, and metadata for Toronto and GTA visibility.",
      },
    ] satisfies ApproachStep[],
    resultsHighlights: [
      "100+ additional converted leads generated within the first 3 months, on top of existing lead volume.",
      "Ranking #1 on Google for \"window replacement,\" a high-value commercial keyword.",
      "Dramatic ranking recovery for \"glass repair Toronto\" after being deindexed from core service terms.",
      "Full site redesign with optimized service and location pages replacing the compromised content.",
      "Technical SEO rebuilt from the ground up, covering speed, mobile experience, backlink health, and Core Web Vitals.",
      "The partnership expanded into a long-term retainer and now includes Voice AI planning.",
    ],
    testimonial: {
      quote:
        "We were so happy with the results that we wanted to take things to the next level. We are now expanding the partnership to include a long-term SEO strategy and Voice AI.",
      attribution: "OhMyGlass, Toronto & GTA",
    } satisfies StudyTestimonial,
    takeaways: [
      {
        title: "Technical problems require technical solutions first.",
        body:
          "No amount of content strategy can overcome a site that Google does not trust. Ed & Sy prioritized full remediation before any growth work, and that sequencing made the recovery both faster and more durable.",
      },
      {
        title: "Local SEO is a direct revenue driver for service businesses.",
        body:
          "For a business serving a defined geography, ranking for the right local keywords is the highest-leverage marketing activity. Service and location pages turned search visibility directly into booked jobs.",
      },
      {
        title: "A strong recovery builds the foundation for long-term growth.",
        body:
          "What started as an emergency fix became an ongoing growth partnership. When the foundation is right, each additional investment in SEO or automation compounds on a stable base.",
      },
    ] satisfies Takeaway[],
    ctaSubtitle:
      "Need to recover a compromised site or turn local search into more leads? We can help.",
    cta: "Book a free strategy call",
    href: "/contact",
  },
] as const;

export type CaseStudy = (typeof caseStudyList)[number];

export const caseStudySlugs = caseStudyList.map((s) => s.slug);

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudyList.find((s) => s.slug === slug);
}
