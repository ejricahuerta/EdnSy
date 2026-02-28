/**
 * Ed & Sy site content – Tech implementation partner for service businesses
 * Primary market: Toronto, Ontario. Positioning: Tech implementation partner (Voice AI, automation, websites & SEO).
 */

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

/** Homepage hero: main headline benefit-led; value prop section carries SEO H2 */
export const hero = {
  headline: "We give you time",
  subhead:
    "So you can run your business, be with family, or do what actually matters. We help Toronto service businesses automate operations and capture more leads with Voice AI, business automation, and website & SEO.",
  ctaPrimary: "Book a Free Strategy Call",
  ctaSecondary: "See How It Works",
  tagline: "Free Strategy Call • Toronto-Based • Results-Focused",
} as const;

/** About Ed & Sy (single short block) */
export const valueProposition = {
  headline: "About Ed & Sy",
  body: "We're your Toronto tech implementation partner. We help service businesses in the GTA and across Ontario with Voice AI, business automation, websites & SEO, so you automate operations, capture more leads, and scale.",
} as const;

/** The problems we solve (homepage); icon = lucide-svelte name for +page.svelte */
export const problemsWeSolve = [
  {
    slug: "missed-calls",
    title: "Missed calls",
    description: "Every unanswered call is a lost lead.",
    solution: "24/7 AI phone answering",
  },
  {
    slug: "manual-admin",
    title: "Manual admin",
    description: "Repetitive tasks eat your time.",
    solution: "Workflow automation so you focus on clients",
  },
  {
    slug: "inefficient-follow-ups",
    title: "Inefficient follow-ups",
    description: "Leads go cold without fast follow-up.",
    solution: "Automated nurturing and booking",
  },
] as const;

export const stats = [
  { value: "24/7", label: "AI Assistant", sublabel: "Always available" },
  { value: "15-20", label: "Hours Saved Weekly", sublabel: "Per business" },
  { value: "3x", label: "More Leads", sublabel: "Qualified & nurtured" },
  { value: "100%", label: "Toronto Based", sublabel: "Local support" },
] as const;

export const servicesIntro =
  "Voice AI, business automation, and website & SEO. Three ways we help Toronto businesses grow and never miss a lead.";

/** Tools we integrate with (API-based; no licensed/compliance-heavy platforms). */
export const integrationsList = [
  "Google Calendar",
  "Google Sheets",
  "Notion",
  "Cal.com",
] as const;

export const integrationsCopy =
  "Google Calendar, Google Sheets, Notion, Cal.com, and other apps that provide APIs.";

/** Voice AI call number (shown in Voice AI service card on homepage) */
export const voiceAiPhoneNumber = "+12895135055";

/** Core service pages (money pages): hrefs match SEO doc URLs */
export const services = [
  {
    id: "voice-ai",
    slug: "voice-ai",
    href: "/voice-ai-for-business",
    tagline: "Never miss a call",
    title: "Voice AI",
    description:
      "24/7 AI phone answering and call automation for Toronto businesses. Never miss a lead.",
    bullets: [
      "24/7 call handling with natural conversation",
      "Lead qualification & appointment booking",
      "Integrates with Google Calendar, Cal.com, and your CRM",
    ],
    cta: "Get Voice AI",
    popular: false,
  },
  {
    id: "workflow-automation",
    slug: "workflow-automation",
    href: "/business-automation-services",
    tagline: "Reclaim your time",
    title: "Business Automation",
    description:
      "Workflow and process automation for Toronto businesses, with AI when it helps. Eliminate manual admin and follow up at scale.",
    bullets: [
      "Invoice processing & payment reminders",
      "Customer onboarding & follow-ups",
      "CRM, email, and calendar integration",
      "AI where it adds value (summaries, routing, smart triggers)",
    ],
    cta: "Automate Now",
    popular: true,
  },
  {
    id: "website-seo",
    slug: "website-seo",
    href: "/website-design-toronto",
    tagline: "Convert and rank",
    title: "Website & SEO",
    description:
      "Not drag-and-drop CMS: we use AI to build fast and ship fast. High-converting, SEO-ready sites for Toronto businesses.",
    bullets: [
      "AI-powered build: fast to launch, no endless DIY drag-and-drop",
      "SEO for Toronto and GTA (on-page, local, content)",
      "Lead capture and form integration",
    ],
    cta: "Get Website & SEO",
    popular: false,
  },
] as const;

export const industriesIntro =
  "We work with service-based businesses across Toronto and the GTA: healthcare, dental, construction, salons, real estate, legal, fitness, and solo professionals. If you run on appointments and client follow-up, we can help.";

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
      "Streamline patient intake, appointment scheduling, and follow-up communications.",
    href: "/industries/healthcare",
  },
  {
    slug: "dental",
    name: "Dental Practices",
    description:
      "Automate appointment reminders, patient recalls, and treatment follow-ups.",
    href: "/industries/dental",
  },
  {
    slug: "construction",
    name: "Construction",
    description:
      "Handle lead capture, invoice processing, and project status updates automatically.",
    href: "/industries/construction",
  },
  {
    slug: "salons",
    name: "Salons & Spas",
    description:
      "Manage bookings, send appointment reminders, and handle client communications.",
    href: "/industries/salons",
  },
  {
    slug: "solo-professionals",
    name: "Solo Professionals",
    description:
      "Free yourself from admin tasks with automated scheduling and client management.",
    href: "/industries/solo-professionals",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description:
      "Qualify leads instantly, schedule viewings, and automate follow-up sequences.",
    href: "/industries/real-estate",
  },
  {
    slug: "legal",
    name: "Legal Firms",
    description:
      "Streamline client intake, document processing, and appointment scheduling.",
    href: "/industries/legal",
  },
  {
    slug: "fitness",
    name: "Fitness & Gyms",
    description:
      "Automate class bookings, membership management, and retention campaigns.",
    href: "/industries/fitness",
  },
] as const;

export const processIntro =
  "Our 4-step process is designed so your automation solution is built right and delivers real results.";

export const processSteps = [
  {
    step: "01",
    title: "Free Strategy Call",
    description:
      "We review your current operations and identify the biggest opportunities for automation and lead capture.",
  },
  {
    step: "02",
    title: "Custom Solution",
    description:
      "We design a tailored plan (Voice AI, automation, or website & SEO) that fits your business and budget.",
  },
  {
    step: "03",
    title: "Implementation",
    description:
      "We handle setup and integration so you can focus on running your Toronto business.",
  },
  {
    step: "04",
    title: "Ongoing Support",
    description:
      "Training and support so your systems keep delivering results and ROI.",
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
    title: "Voice AI for a Toronto healthcare practice",
    outcome: "24/7 call answering; zero missed appointments.",
    cta: "Learn how",
  },
  {
    title: "Automation for a GTA contractor",
    outcome: "15+ hours saved weekly on follow-ups and invoicing.",
    cta: "See results",
  },
  {
    title: "Website & SEO for a Toronto window glass repair business",
    outcome: "Stronger local rankings, more organic traffic, and more leads from search.",
    cta: "Read more",
  },
] as const;

export const faqIntro =
  "Common questions about our AI automation and Voice AI solutions for Toronto businesses.";

export const faqItems = [
  {
    id: "1",
    question: "What does a Voice AI agency do?",
    answer:
      "A Voice AI agency designs and deploys AI phone systems that answer business calls 24/7, qualify leads, book appointments, and capture callers using natural conversation. Ed & Sy Inc. is a Toronto Voice AI agency that helps Ontario businesses never miss a lead.",
  },
  {
    id: "2",
    question: "What businesses benefit from automation?",
    answer:
      "Service-based businesses that rely on appointments, follow-ups, and client communication benefit most: healthcare, dental, construction, salons, real estate, legal, fitness, and solo professionals across Toronto and the GTA. Any business with repetitive admin tasks can benefit.",
  },
  {
    id: "3",
    question: "How is AI automation different from traditional software?",
    answer:
      "Traditional software follows fixed rules. AI automation adds intelligent behavior: understanding intent, summarizing content, routing by context, and triggering actions based on natural language. The result is fewer manual steps and better handling of edge cases.",
  },
  {
    id: "4",
    question: "Do Toronto businesses need Voice AI?",
    answer:
      "Any Toronto business that misses calls after hours or during busy periods loses leads. Voice AI ensures every call is answered, qualified, and converted into a booking or lead. For Toronto service businesses, it acts as a 24/7 AI receptionist.",
  },
  {
    id: "5",
    question: "How much does business automation cost?",
    answer:
      "Costs depend on scope and complexity. We offer custom packages for Toronto and Ontario businesses. Many clients see ROI within the first month from time saved and extra leads captured. Book a free strategy call for a tailored quote.",
  },
  {
    id: "6",
    question: "What industries benefit most from AI websites?",
    answer:
      "Service businesses that need to rank locally and convert visitors (healthcare, dental, contractors, salons, real estate, legal, and fitness) benefit most from AI-built websites with strong SEO for Toronto and Ontario markets.",
  },
  {
    id: "7",
    question: "How long does it take to see results?",
    answer:
      "We focus on quick wins and ROI. Most Toronto clients see measurable improvements within the first 30 days, with typical ROI within the first month of implementation.",
  },
  {
    id: "8",
    question: "Do I need technical knowledge?",
    answer:
      "No. We handle setup and integration and provide training and support. You and your team can focus on running your business.",
  },
  {
    id: "9",
    question: "What's included in the free strategy call?",
    answer:
      "A 30-minute call where we review your operations, identify the biggest automation and lead-capture opportunities, and outline a custom roadmap. No commitment required.",
  },
  {
    id: "10",
    question: "Can automation work for small businesses in Toronto?",
    answer:
      "Yes. We specialize in Toronto small businesses and solo professionals. Our solutions scale to your size and budget and are designed to save 15–20+ hours per week.",
  },
  {
    id: "11",
    question: "How do you ensure data security?",
    answer:
      "We use industry-standard encryption, secure integrations, and best practices for data handling. We can design for HIPAA, SOC2, or other compliance when needed.",
  },
  {
    id: "12",
    question: "Do you serve the GTA and Ontario?",
    answer:
      "Yes. We're based in Toronto and serve the Greater Toronto Area, Ontario, and Canada. We also work with businesses in Markham, Mississauga, Vaughan, and North York. Remote setup and support are available.",
  },
] as const;

export const ctaBlock = {
  headline: "Ready to automate and capture more leads?",
  subhead:
    "Book a free strategy call. We'll outline a custom roadmap for Voice AI, automation, or website & SEO. No commitment required.",
  button: "Book a Free Strategy Call",
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
