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
  eyebrow: "The local growth engine",
  h1: "We give your time back",
  headline: "We give your time back",
  subhead:
    "We automate the repetitive parts of your business so you can focus on the work only you can do — serving clients and growing revenue.",
  ctaPrimary: "Free strategy audit",
  ctaSecondary: "View solutions",
  tagline: "",
} as const;

/** Homepage: directly under hero. Replace quote when OhMyGlass owner approves final wording. */
export const homeFeaturedTestimonial = {
  projectLabel: "Project: OhMyGlass",
  quote:
    "We were so happy with the results that we wanted to take things to the next level. We are now expanding the partnership to include a long-term SEO strategy and Voice AI.",
  attributionName: "OhMyGlass",
  attributionBusiness: "Toronto Window Glass Repair",
} as const;

/** OhMyGlass preview table (homepage). Tighten "after" cells when you have confirmed numbers. */
export const caseStudyPreviewOhMyGlass = {
  clientName: "OhMyGlass",
  clientSubtitle: "Toronto Window Glass Repair",
  eyebrow: "Case study",
  href: "/case-studies/website-seo-toronto-window-glass-repair",
  clientSiteHref: "https://ohmyglass.ca",
  logoSrc: "/images/case-studies/ohmyglass-logo.png",
  cta: "Read the case study",
  leadStat: {
    value: "Recovered",
    label: "Site + rankings",
  },
  secondaryStat: {
    value: "Stronger",
    label: "Local visibility",
  },
  rows: [
    {
      before: "Site hacked — gambling & crypto spam in blog",
      did: "Full recovery, spam removal, site secured",
      after: "Clean site, no spam, trusted by Google",
    },
    {
      before: "Invisible in local search",
      did: "On-page SEO, technical fixes, Core Web Vitals",
      after: "Organic traffic up —% (confirm before publish)",
    },
    {
      before: "Weak Google Business Profile",
      did: "GBP rebuilt and optimized for Toronto + GTA",
      after: "Stronger map pack visibility — rank TBC",
    },
    {
      before: "No clear service positioning",
      did: "Rebuilt site around emergency glass, windows, mirrors",
      after: "More qualified leads from search",
    },
  ],
} as const;

/** Legacy homepage lead block (replaced by hero quiz). Kept for copy reference / deep link id on quiz card. */
export const leadCaptureCopy = {
  id: "lead-capture",
  headline: "Not ready to talk? Tell us your biggest leak.",
  subhead: "We'll reply same day — no pitch, no pressure.",
  submit: "Send it — we'll reply same day →",
  trust: [
    "No commitment",
    "Ed or Sy replies personally",
    "Toronto-based team",
  ],
} as const;

/** Two-step MC quiz + email capture in the homepage hero lead card. */
export const homeLeadQuiz = {
  cardEyebrow: "Same-day reply",
  cardTitle: "Quick fit check",
  cardSubtitle: "Two questions — then we send your recap. No pitch, no spam.",
  steps: [
    {
      id: "pain" as const,
      shortLabel: "Pain",
      question: "What's costing you the most right now?",
      options: [
        { value: "missed-calls", label: "Missed calls & voicemail" },
        { value: "admin-time", label: "Admin & busywork" },
        { value: "cold-leads", label: "Leads going cold" },
        { value: "website-seo", label: "Website / local search" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      id: "timeline" as const,
      shortLabel: "Timeline",
      question: "When do you want to move on this?",
      options: [
        { value: "urgent", label: "As soon as possible" },
        { value: "month", label: "This month" },
        { value: "quarter", label: "Next few months" },
        { value: "exploring", label: "Just looking" },
      ],
    },
  ],
  contactTitle: "Where should we send your recap?",
  contactSub: "We reply same day. No pitch, no spam.",
  nameLabel: "Name",
  emailLabel: "Email",
  submit: "Send my recap →",
  back: "Back",
  successTitle: "You're in.",
  successBody: "We'll reply same day. Urgent? Email ",
  restart: "Start over",
} as const;

export const leadProblemOptions = [
  { value: "missed-calls", label: "Missed calls / voicemail" },
  { value: "admin-time", label: "Too much time on admin" },
  { value: "cold-leads", label: "Leads going cold too fast" },
  { value: "website-seo", label: "Weak website / not ranking" },
  { value: "other", label: "Something else" },
] as const;

/** About Ed & Sy (single short block) */
export const valueProposition = {
  headline: "About Ed & Sy",
  body: "We're your Toronto tech implementation partner. We help service businesses in the GTA and across Ontario with Voice AI, business automation, websites & SEO, so you automate operations, capture more leads, and scale.",
} as const;

/** Homepage about band (Stitch). */
export const homeAboutHeading = {
  eyebrow: "Team",
  headline: "Meet Ed & Sy",
} as const;

export const homeAboutLead =
  "We're a two-person Toronto team with a background in serious systems work — now focused on local service businesses that need revenue engines, not slide decks.";

export const homeAboutSecondary =
  "When you work with us, you talk to Ed and Sy. We design, build, and tune Voice AI, automation, and web so your phones, inbox, and calendar actually move the business forward.";

export const homeAboutStoryHref = "/about";
export const homeAboutStoryLabel = "Our story →";

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

/** Homepage KPI band: structural facts and honest scope — no vanity totals or unverified timelines. */
export const homeKpiSection = {
  headline: "Why Toronto service businesses work with us",
  introSegments: [
    { text: "We're a " },
    { text: "two-person implementation team", accent: true },
    { text: ", not a deck shop. " },
    { text: "Voice AI, automation, and local SEO", accent: true },
    { text: " for real workflows. " },
    { text: "We aim for same-business-day replies", accent: true },
    { text: " — clear scope, fixed phases, systems you can run without hiring a dev." },
  ],
  kpis: [
    {
      value: "2",
      label: "People on the account",
      description:
        "Ed and Sy scope, build, and support the work. Not a rotating cast of juniors or an offshore bench.",
    },
    {
      value: "24/7",
      label: "What your stack runs",
      description:
        "Voice AI and automations answer, route, and follow up around the clock. That's the stack working — not a claim the founders are personally on call every hour.",
    },
    {
      value: "0",
      label: "Handoff layers",
      description:
        "No account-manager tree between you and the builders. Decisions and quality stay with the same two founders.",
    },
  ],
} as const;

/** Homepage stats strip (Stitch layout): four bold metrics, lavender band — honest positioning. */
export const homeStatsBar = {
  kpis: [
    { value: "2", label: "Founders on your account", shortLabel: "Founders" },
    { value: "24/7", label: "Stack availability", shortLabel: "Availability" },
    { value: "0", label: "Account-manager handoffs", shortLabel: "Handoffs" },
    { value: "100%", label: "Toronto-based team", shortLabel: "Toronto" },
  ],
} as const;

/** Homepage services section heading (Stitch). */
export const homeServicesHeading = {
  eyebrow: "What we do",
  headline: "Architectural solutions for growth.",
} as const;

export const servicesIntro =
  "Three integrated systems — automation, voice, and web — designed to plug into how your business already runs.";

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

/** Core service pages (money pages): hrefs match SEO doc URLs. Order: automation, Voice AI (featured), website. */
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
      "CRM integration",
      "Automated invoicing",
      "Lead qualification",
      "Follow-up sequences",
      "Smart routing",
      "AI summaries",
    ],
    cta: "Learn more →",
    popular: false,
  },
  {
    id: "voice-ai",
    slug: "voice-ai",
    href: "/voice-ai-for-business",
    tagline: "Never miss a call",
    title: "Voice AI Agents",
    description:
      "An AI phone agent that answers 24/7, qualifies callers, and books directly into your calendar. Sounds natural. Works at midnight on a Sunday.",
    bullets: [
      "24/7 phone answering",
      "Instant appointment booking",
      "Natural voice synthesis",
      "Call summaries",
    ],
    cta: "Book a demo →",
    popular: true,
  },
  {
    id: "website-seo",
    slug: "website-seo",
    href: "/website-design-toronto",
    tagline: "Convert and rank",
    title: "Website & SEO",
    description:
      "A fast, conversion-focused site built to rank in Toronto and the GTA. We use AI to ship in days, not months of back-and-forth.",
    bullets: [
      "Conversion optimization",
      "Local SEO authority",
      "Content strategy",
      "Fast launch",
    ],
    cta: "View portfolio →",
    popular: false,
  },
] as const;

export const industriesIntro =
  "If your business runs on appointments, inbound calls, and client relationships, we automate the parts that slow you down.";

/** Homepage industries band (Stitch). */
export const homeIndustriesHeading = {
  eyebrow: "Markets",
  headline: "Industries we accelerate.",
} as const;

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
  "No six-month decks. We audit, deploy, and iterate with you — so local authority and revenue systems compound.";

/** Full journey (e.g. /process page). */
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

/** Homepage process column (Stitch mock): three steps. */
export const processStepsHome = [
  {
    step: "01",
    title: "Strategic audit",
    description:
      "We map leaks in calls, follow-up, and admin — then prioritize what moves revenue first.",
  },
  {
    step: "02",
    title: "Systems deployment",
    description:
      "Voice AI, automation, and web go live in tight phases. You approve each layer before we scale it.",
  },
  {
    step: "03",
    title: "Continuous growth",
    description:
      "Direct access to Ed and Sy for tuning, new workflows, and SEO — the stack keeps improving after launch.",
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

export const faqIntro = "Common questions";

/** Homepage FAQ section title (Stitch). */
export const homeFaqHeading = {
  eyebrow: "FAQ",
  headline: "Common questions",
} as const;

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
  headline: "Stop losing leads to your competition.",
  subhead:
    "Book a free strategy session. We'll map where time and leads leak — and what to automate first.",
  button: "Book your free trial →",
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
