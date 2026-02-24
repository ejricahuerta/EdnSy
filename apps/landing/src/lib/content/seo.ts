/**
 * SEO config and schema for Ed & Sy: AI Automation Agency in Toronto
 * Title format: Primary Keyword | Ed & Sy Toronto
 * Meta description: Pain point + benefit + CTA (under 155 chars)
 */

import { industryDetails } from "$lib/content/industries";

export const SITE_URL = "https://ednsy.com";

const META_DESC_MAX_LEN = 155;

function truncateForMeta(text: string, max = META_DESC_MAX_LEN): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3).trim() + "...";
}

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImagePath?: string;
};

/** All money pages and key routes with SEO metadata */
export const seoPages: Record<string, PageSeo> = {
  "/": {
    title: "AI Automation & Voice AI Agency in Toronto | Ed & Sy Toronto",
    description:
      "Missed calls and manual admin killing growth? We help Toronto businesses automate with Voice AI, workflow automation, and high-converting websites. Book a free strategy call.",
    canonicalPath: "/",
  },
  "/voice-ai-for-business": {
    title: "Voice AI for Business Toronto | Ed & Sy Toronto",
    description:
      "Never miss a lead. 24/7 AI phone answering and call automation for Toronto businesses. Book a free strategy call.",
    canonicalPath: "/voice-ai-for-business",
  },
  "/business-automation-services": {
    title: "Business Automation Services Toronto | Ed & Sy Toronto",
    description:
      "Stop wasting hours on manual tasks. Workflow and process automation for Toronto businesses, with AI when it helps. Free consultation.",
    canonicalPath: "/business-automation-services",
  },
  "/website-design-toronto": {
    title: "Website Design & SEO Toronto | Ed & Sy Toronto",
    description:
      "Not drag-and-drop: we use AI to build fast and ship fast. Website & SEO for Toronto businesses. Get a free strategy call.",
    canonicalPath: "/website-design-toronto",
  },
  "/ai-automation-toronto": {
    title: "AI Automation Toronto | Ed & Sy Toronto",
    description:
      "Voice AI, business automation, and website & SEO. Toronto's AI automation agency. Book a free strategy call.",
    canonicalPath: "/ai-automation-toronto",
  },
  "/ai-automation-gta": {
    title: "AI Automation GTA | Ed & Sy Toronto",
    description:
      "AI automation and Voice AI for the Greater Toronto Area. Automate operations and capture more leads. Free consultation.",
    canonicalPath: "/ai-automation-gta",
  },
  "/contact": {
    title: "Contact | Ed & Sy Toronto",
    description:
      "Get in touch with Ed & Sy in Toronto. Book a free strategy call or send a message. We serve Toronto, GTA, and Ontario.",
    canonicalPath: "/contact",
  },
  "/about": {
    title: "About Ed & Sy | AI Automation Agency Toronto",
    description:
      "We're a Toronto-based AI automation agency helping service businesses scale with Voice AI, automation, and website & SEO.",
    canonicalPath: "/about",
  },
  "/services": {
    title: "Our Services | Ed & Sy Toronto",
    description:
      "Voice AI, business automation, and website & SEO. Three ways we help Toronto businesses grow. Free consultation.",
    canonicalPath: "/services",
  },
  "/industries": {
    title: "Industries We Serve | Ed & Sy Toronto",
    description:
      "We serve healthcare, dental, construction, salons, real estate, legal, fitness, and more across Toronto and the GTA.",
    canonicalPath: "/industries",
  },
  "/process": {
    title: "How It Works | Ed & Sy Toronto",
    description:
      "Our 4-step process: free consultation, custom solution, implementation, ongoing support. Toronto-based, results-focused.",
    canonicalPath: "/process",
  },
  "/team": {
    title: "Team | Ed & Sy Toronto",
    description:
      "Meet Ed & Sy: Toronto entrepreneurs helping local businesses reclaim their time through AI and automation.",
    canonicalPath: "/team",
  },
  "/terms": {
    title: "Terms of Service | Ed & Sy",
    description: "Terms of service for Ed & Sy. Toronto, Ontario.",
    canonicalPath: "/terms",
  },
  "/privacy": {
    title: "Privacy Policy | Ed & Sy",
    description: "Privacy policy for Ed & Sy. Toronto, Ontario.",
    canonicalPath: "/privacy",
  },
  "/cookies": {
    title: "Cookie Policy | Ed & Sy",
    description: "Cookie policy for Ed & Sy. Toronto, Ontario.",
    canonicalPath: "/cookies",
  },
  "/toronto-voice-ai": {
    title: "Toronto Voice AI Agency | Voice AI Development Ontario | Ed & Sy Inc.",
    description:
      "Toronto Voice AI agency. 24/7 AI phone answering and Voice AI development for Toronto, GTA, and Ontario businesses. Book a free strategy call.",
    canonicalPath: "/toronto-voice-ai",
  },
  "/toronto-automation-agency": {
    title: "Toronto Automation Agency | Business Automation Ontario | Ed & Sy Inc.",
    description:
      "Toronto automation agency. Workflow and business automation for Toronto, Markham, Mississauga, Vaughan, and Ontario. Free consultation.",
    canonicalPath: "/toronto-automation-agency",
  },
  "/toronto-ai-website-development": {
    title: "Toronto AI Website Development | AI Website Agency Ontario | Ed & Sy Inc.",
    description:
      "AI website development agency in Toronto. Fast, high-converting websites and SEO for Toronto and Ontario businesses. Get a free strategy call.",
    canonicalPath: "/toronto-ai-website-development",
  },
  "/ontario-ai-automation": {
    title: "Ontario AI Automation Company | AI Automation Canada | Ed & Sy Inc.",
    description:
      "Leading AI automation company serving Ontario and Canada. Voice AI, business automation, and AI websites. Toronto-based. Free strategy call.",
    canonicalPath: "/ontario-ai-automation",
  },
  "/case-studies": {
    title: "Case Studies | Voice AI, Automation & Website Results | Ed & Sy Toronto",
    description:
      "Toronto case studies: Voice AI for healthcare, automation for contractors, website & SEO for window glass repair. Real outcomes.",
    canonicalPath: "/case-studies",
  },
  "/blog": {
    title: "Blog | Voice AI, Automation & AI Websites | Ed & Sy Toronto",
    description:
      "Articles on Voice AI, business automation, and AI website development for Toronto and Ontario businesses.",
    canonicalPath: "/blog",
  },
};

/** Industry pages SEO: built from industryDetails so /industries/:slug has correct canonical and meta. */
const industrySeoPages: Record<string, PageSeo> = {};
for (const slug of Object.keys(industryDetails)) {
  const industry = industryDetails[slug as keyof typeof industryDetails];
  const path = `/industries/${slug}`;
  industrySeoPages[path] = {
    title: `${industry.name} Toronto | Ed & Sy`,
    description: truncateForMeta(industry.subhead),
    canonicalPath: path,
  };
}

/** Get SEO for a path (e.g. from $page.url.pathname). Falls back to homepage. */
export function getSeoForPath(pathname: string): PageSeo {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return seoPages[normalized] ?? industrySeoPages[normalized] ?? seoPages["/"];
}

export function buildCanonical(path: string): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

/** Organization schema (brand entity) – AI and search engine friendly */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    name: "Ed & Sy Inc.",
    legalName: "Ed & Sy Inc.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/logo%20with%20bg.png`,
    description:
      "Ed & Sy Inc. is a Toronto-based AI agency specializing in Voice AI systems, business automation workflows, and AI-powered website development for small and mid-sized businesses in Ontario and across Canada.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: [
      { "@type": "City", name: "Toronto", containedInPlace: { "@type": "State", name: "Ontario" } },
      { "@type": "Place", name: "Greater Toronto Area" },
      { "@type": "State", name: "Ontario" },
      { "@type": "Country", name: "Canada" },
    ],
    serviceType: [
      "Voice AI Development",
      "Business Automation",
      "AI Website Development",
    ],
    sameAs: [
      "https://www.instagram.com/ed.n.sy/",
      "https://www.linkedin.com/company/ednsy/",
    ],
  };
}

/** LocalBusiness schema (local SEO) – Toronto, Ontario, Canada */
export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: "Ed & Sy Inc.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/logo%20with%20bg.png`,
    image: `${SITE_URL}/logo/logo%20with%20bg.png`,
    description:
      "Ed & Sy Inc. is a Toronto Voice AI agency and automation company. We provide Voice AI development, business automation, and AI website development for businesses in Toronto, Ontario, and Canada.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toronto",
      addressRegion: "ON",
      addressCountry: "CA",
    },
    areaServed: [
      { "@type": "City", name: "Toronto" },
      { "@type": "City", name: "Markham" },
      { "@type": "City", name: "Mississauga" },
      { "@type": "City", name: "Newmarket" },
      { "@type": "City", name: "Scarborough" },
      { "@type": "City", name: "Vaughan" },
      { "@type": "City", name: "North York" },
      { "@type": "Place", name: "Greater Toronto Area (GTA)" },
      { "@type": "State", name: "Ontario" },
      { "@type": "Country", name: "Canada" },
    ],
    serviceType: [
      "Voice AI Development",
      "Business Automation",
      "AI Website Development",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@ednsy.com",
      contactType: "customer service",
      areaServed: "CA",
      availableLanguage: "English",
      url: `${SITE_URL}/contact`,
    },
    sameAs: [
      "https://www.instagram.com/ed.n.sy/",
      "https://www.linkedin.com/company/ednsy/",
    ],
  };
}

/** Service schema for a single service page */
export function buildServiceSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Ed & Sy",
      url: SITE_URL,
    },
    areaServed: { "@type": "City", name: "Toronto" },
  };
}

/** FAQ schema for rich snippets and AI overviews */
export function buildFAQSchema(
  items: ReadonlyArray<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** BreadcrumbList schema for navigation and rich results */
export function buildBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** WebSite schema for AI and search engines – site as entity with publisher */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ed & Sy",
    url: SITE_URL,
    description:
      "Ed & Sy is a Toronto-based AI automation agency. Voice AI, business automation, and website & SEO for Toronto and Ontario businesses.",
    inLanguage: "en-CA",
    publisher: {
      "@type": "Organization",
      name: "Ed & Sy Inc.",
      url: SITE_URL,
      logo: `${SITE_URL}/logo/logo%20with%20bg.png`,
    },
  };
}
