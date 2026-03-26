/**
 * Ed & Sy site content – Tech implementation partner for service businesses
 * Primary market: Toronto, Ontario. Positioning: Tech implementation partner (Voice AI, automation, websites & SEO).
 */

import {
  siCaldotcom,
  siCalendly,
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siMake,
  siNotion,
  siPaypal,
  siQuickbooks,
  siSquare,
  siStripe,
  siWhatsapp,
  siXero,
  siZoho,
  siZapier,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export const site = {
  name: "Ed & Sy",
  legalName: "Ed & Sy Inc.",
  tagline: "AI-Powered Growth Systems for Service Businesses",
  email: "hello@ednsy.com",
  location: "Toronto, Ontario",
} as const;

/** Definition blocks for AI citation and clear entity signals */
export const definitionBlocks = {
  voiceAi:
    "Voice AI is the implementation of conversational artificial intelligence systems that allow businesses to automate customer interactions using natural language processing. Ed & Sy deploys Voice AI so Toronto businesses can answer every call 24/7, qualify leads, and book appointments.",
  automation:
    "Business automation is the use of software and workflows to handle repetitive tasks (such as invoicing, follow-ups, and scheduling) so teams can focus on clients and growth. AI automation goes beyond traditional software by adding smart routing, summaries, and triggers that reduce manual work further.",
  aiWebsite:
    "AI website development uses AI-assisted tools and methods to build fast, high-converting, SEO-ready websites, reducing time to launch compared to traditional drag-and-drop CMS builds while improving performance and local search visibility for Toronto and Ontario businesses.",
} as const;

/** Homepage hero: eyebrow first, H1 carries the time message, headline supports conversion */
export const hero = {
  eyebrow: "Toronto AI Agency",
  h1: "We give your time back",
  headline: "We give your time back",
  subhead:
    "Ed & Sy helps Toronto service businesses answer every call, automate follow-ups, and eliminate admin using Voice AI and smart automation.",
  ctaPrimary: "Book a free call →",
  ctaSecondary: "See services",
  tagline: "",
} as const;

/** About Ed & Sy (single short block) */
export const valueProposition = {
  headline: "About Ed & Sy",
  body: "We're your Toronto tech implementation partner. We help service businesses in the GTA and across Ontario with Voice AI, business automation, websites & SEO, so you automate operations, capture more leads, and scale.",
} as const;

/** Intro copy for the problems we solve section (homepage). */
export const problemsWeSolveIntro =
  "Manual follow-up, missed calls, and disconnected tools create hidden work. We replace the busywork with systems that answer faster, route better, and keep your team focused.";

/** The problems we solve (homepage); icon = lucide-svelte name for +page.svelte */
export const problemsWeSolve = [
  {
    slug: "missed-calls",
    title: "Calls going to voicemail",
    description:
      "You're with a client at 7pm. Your phone rings. Nobody answers. They call your competitor instead. That's a lost customer every single time.",
    solution: "24/7 Voice AI answers every call",
  },
  {
    slug: "manual-admin",
    title: "10+ hours a week on admin",
    description:
      "Scheduling, invoice follow-ups, CRM updates, onboarding emails. You didn't start a business to spend half your week on tasks a machine could handle.",
    solution: "Automated workflows eliminate the busywork",
  },
  {
    slug: "inefficient-follow-ups",
    title: "Leads going cold",
    description:
      "Someone fills your form Friday afternoon. You see it Monday. They booked someone else Saturday morning. Speed of follow-up is survival.",
    solution: "Instant automated follow-up and booking",
  },
] as const;

export const stats = [
  { value: "24/7", label: "Call coverage", sublabel: "" },
  { value: "15–20h", label: "Saved weekly", sublabel: "" },
  { value: "<30d", label: "Typical ROI", sublabel: "" },
  { value: "$0", label: "Strategy call", sublabel: "" },
] as const;

export const servicesIntro =
  "Three solutions. One leaky bucket fixed.";

/** Tools we integrate with (API-based; no licensed/compliance-heavy platforms). */
export const integrationsList = [
  "Gmail",
  "Google Calendar",
  "Google Sheets",
  "Notion",
  "Stripe",
  "Cal.com",
  "Calendly",
  "HubSpot",
  "Zoho",
  "QuickBooks",
  "Xero",
  "Square",
  "PayPal",
  "WhatsApp",
  "Zapier",
  "Make",
] as const;

export const integrationsCopy =
  "Gmail, Google Calendar, Google Sheets, Notion, Stripe, Cal.com, Calendly, HubSpot, Zoho, QuickBooks, Xero, Square, PayPal, WhatsApp, Zapier, Make, and other apps that provide APIs.";

type Integration = {
  name: string;
  icon: SimpleIcon;
};

export const integrations = [
  { name: "Gmail", icon: siGmail },
  { name: "Google Calendar", icon: siGooglecalendar },
  { name: "Google Sheets", icon: siGooglesheets },
  { name: "Notion", icon: siNotion },
  { name: "HubSpot", icon: siHubspot },
  { name: "Zoho", icon: siZoho },
  { name: "QuickBooks", icon: siQuickbooks },
  { name: "Xero", icon: siXero },
  { name: "Square", icon: siSquare },
  { name: "PayPal", icon: siPaypal },
  { name: "WhatsApp", icon: siWhatsapp },
  { name: "Zapier", icon: siZapier },
  { name: "Make", icon: siMake },
  { name: "Stripe", icon: siStripe },
  { name: "Cal.com", icon: siCaldotcom },
  { name: "Calendly", icon: siCalendly },
] as const satisfies readonly Integration[];

/** Voice AI call number (shown in Voice AI service card on homepage) */
export const voiceAiPhoneNumber = "+12895135055";

/** Core service pages (money pages): hrefs match SEO doc URLs */
export const services = [
  {
    id: "workflow-automation",
    slug: "workflow-automation",
    href: "/business-automation-services",
    tagline: "Reclaim your time",
    title: "Business Automation",
    description:
      "We map your workflows and automate the parts that don't need you, like invoicing, onboarding, follow-up sequences, and CRM updates. Clients save 15–20 hours per week on average. We build around your actual tools, not a generic template.",
    bullets: [
      "Invoice processing",
      "Client onboarding",
      "Follow-up sequences",
      "CRM integration",
      "Smart routing",
      "AI summaries",
    ],
    cta: "Automate your business →",
    popular: true,
  },
  {
    id: "voice-ai",
    slug: "voice-ai",
    href: "/voice-ai-for-business",
    tagline: "Never miss a call",
    title: "Voice AI",
    description:
      "An AI phone agent that answers 24/7, qualifies callers, and books directly into your calendar. Sounds natural. Works at midnight on a Sunday.",
    bullets: [
      "24/7 answering",
      "Lead qualification",
      "Calendar booking",
      "Call summaries",
    ],
    cta: "Get Voice AI →",
    popular: false,
  },
  {
    id: "website-seo",
    slug: "website-seo",
    href: "/website-design-toronto",
    tagline: "Convert and rank",
    title: "Website & SEO",
    description:
      "A fast, conversion-focused site built to rank in Toronto and the GTA. We use AI to ship in days, not months of back-and-forth.",
    bullets: ["Local SEO", "Lead capture", "Fast launch", "Real code"],
    cta: "Get a website →",
    popular: false,
  },
] as const;

export const industriesIntro =
  "If your business runs on appointments, inbound calls, and client relationships, we automate the parts that slow you down.";

/** Industries index page hero (reflects all 3 services: Voice AI, Business Automation, Website & SEO). */
export const industriesPageHero = {
  headline: "Tech, automation & website & SEO for your industry",
  subhead:
    "Voice AI, business automation, and website & SEO. We build solutions that fit how your business runs.",
} as const;

export const industries = [
  {
    slug: "healthcare",
    name: "Healthcare",
    description:
      "Patient intake, scheduling, follow-ups",
    href: "/industries/healthcare",
  },
  {
    slug: "dental",
    name: "Dental",
    description:
      "Reminders, recalls, rebooking",
    href: "/industries/dental",
  },
  {
    slug: "construction",
    name: "Construction",
    description:
      "Lead capture, estimates, updates",
    href: "/industries/construction",
  },
  {
    slug: "salons",
    name: "Salons & Spas",
    description:
      "Bookings, reminders, client comms",
    href: "/industries/salons",
  },
  {
    slug: "solo-professionals",
    name: "Solo Professionals",
    description:
      "Full admin automation",
    href: "/industries/solo-professionals",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description:
      "Lead qual, viewings, follow-up",
    href: "/industries/real-estate",
  },
  {
    slug: "legal",
    name: "Legal",
    description:
      "Client intake, scheduling, doc flow",
    href: "/industries/legal",
  },
  {
    slug: "fitness",
    name: "Fitness & Gyms",
    description:
      "Classes, memberships, retention",
    href: "/industries/fitness",
  },
] as const;

export const processIntro =
  "No 6-month projects. No bloated scopes. Toronto businesses can't afford to wait, and we don't make them.";

export const processSteps = [
  {
    step: "01",
    title: "Free strategy call",
    description:
      "30 minutes. We map your biggest time sinks and lead leaks and hand you a roadmap, whether you work with us or not.",
  },
  {
    step: "02",
    title: "Custom solution design",
    description:
      "We spec a solution around your actual workflow, not a template. You review and approve before we touch anything.",
  },
  {
    step: "03",
    title: "Implementation",
    description:
      "We build and integrate everything. You test it. We refine until it's exactly right. No technical knowledge required on your end.",
  },
  {
    step: "04",
    title: "Live + ongoing support",
    description:
      "You go live. We stay on. Direct access to Ed and Sy for changes, improvements, and anything else that comes up.",
  },
] as const;

export const processStats = [
  { label: "Strategy Call", value: "Free" },
  { label: "Pricing", value: "Custom" },
  { label: "ROI", value: "First month" },
  { label: "Toronto Based", value: "100%" },
] as const;

/** Case studies (homepage): add real entries as they become available */
export const caseStudies = [
  {
    title: "Website & SEO for a Toronto window glass repair business",
    outcome:
      "Recovered a compromised site, strengthened local rankings and Google Business Profile, and built a clean, professional site that brings in more leads from search.",
    cta: "Read case study",
    href: "/case-studies/website-seo-toronto-window-glass-repair",
  },
] as const;

export const faqIntro = "Questions before every first call.";

export const faqItems = [
  {
    id: "1",
    question: "Does Voice AI actually sound natural?",
    answer:
      "Yes. Modern Voice AI uses near-human speech synthesis. We train the agent on your business, services, and tone. Most callers don't realise it's AI, and we configure transparent disclosure for the ones who ask.",
  },
  {
    id: "2",
    question: "How much does it cost?",
    answer:
      "We don't publish fixed pricing because every business is different. Most clients see full ROI within their first month from recovered leads alone. Book a call and we'll give you a real number, not a range.",
  },
  {
    id: "3",
    question: "How fast can you get this running?",
    answer:
      "Voice AI is typically live in 5–10 business days. Automation workflows take 1–3 weeks depending on scope. We move fast because we know you're losing leads while we talk.",
  },
  {
    id: "4",
    question: "Do I need technical knowledge?",
    answer:
      "None at all. We handle every part of setup, integration, and training. You get a walkthrough of how to monitor things, then leave the rest to us.",
  },
  {
    id: "5",
    question: "What if I want changes after launch?",
    answer:
      "You contact Ed or Sy directly, not through a ticket system. We turn changes around quickly, usually within 48 hours. Ongoing support is part of every engagement.",
  },
  {
    id: "6",
    question: "Is my data secure?",
    answer:
      "We use industry-standard encryption and secure integrations. For PIPEDA, HIPAA, or SOC2 compliance, we design around your requirements. Just flag it on the strategy call.",
  },
] as const;

export const ctaBlock = {
  headline: "Stop losing leads to voicemail.",
  subhead:
    "Book a free 30-minute strategy call. We'll show you exactly where your business is losing time and money, and what to do about it.",
  button: "Book free strategy call →",
  note: "No commitment • 30-minute call • Custom roadmap • Toronto-based team",
} as const;

export const teamIntro =
  "We're Ed & Sy, your Toronto tech implementation partner. We help service businesses scale with Voice AI, automation, websites & SEO.";

export const teamMembers = [
  {
    name: "Ed",
    role: "Co-Founder & Tech Implementation Lead",
    bio: "Ed brings deep expertise in tech implementation and AI, helping Toronto businesses implement automation and digital solutions. Passionate about making technology accessible to small businesses.",
  },
  {
    name: "Sy",
    role: "Co-Founder & AI Specialist",
    bio: "Sy specializes in AI implementation and business process optimization. With a background in operations management and AI, Sy ensures every solution delivers measurable time savings and ROI.",
  },
] as const;

export const teamValues = [
  {
    title: "Time is Everything",
    description:
      "We believe your time is your most valuable asset. Every solution we build is designed to give you more of it.",
  },
  {
    title: "Partnership Over Projects",
    description:
      "We are not just vendors. We are partners invested in your success and growth.",
  },
  {
    title: "Results That Matter",
    description:
      "We measure success by your success. If our solutions don't deliver ROI, we haven't done our job.",
  },
] as const;

export const teamStats = [
  { value: "Free", label: "Discovery Call" },
  { value: "15–20", label: "Hours Saved Weekly" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "Toronto", label: "Based & Proud" },
] as const;
