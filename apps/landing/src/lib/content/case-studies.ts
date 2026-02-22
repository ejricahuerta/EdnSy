/**
 * Case study content for AI and local SEO.
 * Template: client industry, problem, solution, tools, before/after, results, testimonial.
 * Add real entries as they become available.
 */

export const caseStudyList = [
  {
    slug: "voice-ai-healthcare-toronto",
    title: "Voice AI for a Toronto Healthcare Practice",
    industry: "Healthcare",
    location: "Toronto, Ontario",
    outcome: "24/7 call answering; zero missed appointments.",
    problem:
      "The practice missed after-hours and lunch-hour calls, losing potential patients to voicemail and competitors.",
    solution:
      "We deployed a Voice AI system that answers every call 24/7, qualifies callers, and books appointments into their calendar.",
    tools: ["Voice AI platform", "Google Calendar", "Cal.com"],
    beforeAfter: "Before: 20+ missed calls per week. After: Every call answered; leads captured and appointments booked.",
    results: "Zero missed appointments from call handling; 15+ hours saved monthly on phone tag.",
    testimonial: null,
    cta: "Learn how",
    href: "/contact",
  },
  {
    slug: "automation-gta-contractor",
    title: "Automation for a GTA Contractor",
    industry: "Construction",
    location: "Greater Toronto Area",
    outcome: "15+ hours saved weekly on follow-ups and invoicing.",
    problem:
      "Manual follow-ups and invoice reminders consumed 15–20 hours per week; leads and payments were delayed.",
    solution:
      "We built automated workflows for lead nurturing, appointment reminders, and invoice follow-ups, with CRM and calendar integration.",
    tools: ["Google Workspace", "CRM", "Email automation"],
    beforeAfter: "Before: Manual follow-up and chasing invoices. After: Automated sequences and payment reminders.",
    results: "15+ hours saved weekly; faster lead response and improved cash flow.",
    testimonial: null,
    cta: "See results",
    href: "/contact",
  },
  {
    slug: "website-seo-toronto-salon",
    title: "Website & SEO for a Toronto Salon",
    industry: "Salons & Spas",
    location: "Toronto",
    outcome: "3x more leads; bookings while they sleep.",
    problem:
      "The existing site was slow, didn't rank for local search, and didn't convert visitors into bookings.",
    solution:
      "We built a fast, SEO-ready website with local Toronto keywords and integrated booking so visitors could book 24/7.",
    tools: ["AI-assisted build", "Local SEO", "Booking integration"],
    beforeAfter: "Before: Low traffic and few form submissions. After: 3x more leads; bookings captured after hours.",
    results: "3x increase in leads; higher local search visibility in Toronto.",
    testimonial: null,
    cta: "Read more",
    href: "/contact",
  },
] as const;
