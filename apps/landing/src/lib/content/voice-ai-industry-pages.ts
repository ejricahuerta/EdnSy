export type VoiceAiIndustryFaq = {
  question: string;
  answer: string;
};

export type VoiceAiIndustryPage = {
  slug: string;
  industryName: string;
  title: string;
  description: string;
  headline: string;
  subhead: string;
  painPoints: string[];
  outcomes: string[];
  processSteps: string[];
  faq: VoiceAiIndustryFaq[];
  internalLinks: { label: string; href: string }[];
};

export const voiceAiIndustryPages: Record<string, VoiceAiIndustryPage> = {
  healthcare: {
    slug: "healthcare",
    industryName: "Healthcare",
    title: "Voice AI for Healthcare in Toronto | Ed & Sy Toronto",
    description:
      "Voice AI for healthcare clinics in Toronto. Answer patient calls 24/7, reduce front-desk overload, and book more appointments automatically.",
    headline: "Voice AI for Healthcare Clinics in Toronto",
    subhead:
      "Reduce front-desk pressure and capture every patient call with a 24/7 AI phone assistant trained for healthcare workflows.",
    painPoints: [
      "High call volume during peak clinic hours creates hold times and missed calls.",
      "Staff lose time to repeat questions about hours, bookings, and follow-ups.",
      "After-hours voicemail means potential patients choose another provider.",
    ],
    outcomes: [
      "24/7 patient call answering without increasing staffing overhead.",
      "Cleaner appointment booking flow with fewer scheduling bottlenecks.",
      "Faster lead and patient capture for new inquiries after hours.",
      "More staff time focused on in-clinic care and high-value tasks.",
    ],
    processSteps: [
      "Map your clinic call flow and common patient intents.",
      "Train Voice AI on your services, schedule rules, and escalation logic.",
      "Integrate booking with your existing calendar and handoff process.",
      "Launch, monitor calls, and refine prompts for better conversion.",
    ],
    faq: [
      {
        question: "Can Voice AI handle appointment scheduling for clinics?",
        answer:
          "Yes. Voice AI can qualify callers, check availability, and book appointments into your approved scheduling flow.",
      },
      {
        question: "Will Voice AI replace my front desk team?",
        answer:
          "No. It handles repetitive inbound calls and after-hours volume so your staff can focus on in-person patient experience and complex requests.",
      },
      {
        question: "Is this only for large clinics?",
        answer:
          "No. Smaller clinics often benefit quickly because even a few missed calls each week can represent significant lost revenue.",
      },
    ],
    internalLinks: [
      { label: "Voice AI for Business", href: "/voice-ai-for-business" },
      { label: "Business Automation Services", href: "/business-automation-services" },
      { label: "Book a strategy call", href: "/contact" },
    ],
  },
  dental: {
    slug: "dental",
    industryName: "Dental Practices",
    title: "Voice AI for Dental Practices in Toronto | Ed & Sy Toronto",
    description:
      "Voice AI for dental practices in Toronto. Automate inbound calls, fill openings faster, and reduce missed-booking opportunities.",
    headline: "Voice AI for Dental Practices in Toronto",
    subhead:
      "Keep chairs full and reduce front-desk overload with a conversational AI phone system built for dental appointment workflows.",
    painPoints: [
      "Missed calls and voicemail drop-offs reduce hygiene and consult bookings.",
      "Front-desk teams are interrupted by repetitive scheduling and FAQ calls.",
      "Last-minute cancellations create revenue gaps that are hard to refill quickly.",
    ],
    outcomes: [
      "Immediate call answer for inbound prospects and existing patients.",
      "Better booking consistency for hygiene, consultations, and follow-ups.",
      "Faster cancellation-fill flow by capturing and qualifying callers immediately.",
      "Improved patient experience with shorter wait times and clearer routing.",
    ],
    processSteps: [
      "Define your booking and triage rules for common call scenarios.",
      "Configure dental-specific call intents and qualification steps.",
      "Connect calendar workflows and escalation for urgent cases.",
      "Review call analytics weekly and optimize conversion points.",
    ],
    faq: [
      {
        question: "Can Voice AI answer insurance or treatment questions?",
        answer:
          "It can handle approved common questions and route complex insurance or treatment concerns to your team based on your escalation rules.",
      },
      {
        question: "Can it help with no-show reduction?",
        answer:
          "Yes. Combined with reminders and quick rescheduling flows, Voice AI helps clinics respond faster and recover lost booking slots.",
      },
      {
        question: "How long does setup take?",
        answer:
          "Most teams can launch an initial production flow in a few weeks, then improve it with real call data.",
      },
    ],
    internalLinks: [
      { label: "Voice AI for Business", href: "/voice-ai-for-business" },
      { label: "Website Design and SEO", href: "/website-design-toronto" },
      { label: "Book a strategy call", href: "/contact" },
    ],
  },
  "real-estate": {
    slug: "real-estate",
    industryName: "Real Estate",
    title: "Voice AI for Real Estate Teams in Toronto | Ed & Sy Toronto",
    description:
      "Voice AI for Toronto real estate teams. Qualify inbound leads faster, book showings automatically, and reduce lead response delays.",
    headline: "Voice AI for Real Estate Teams in Toronto",
    subhead:
      "Speed-to-lead wins deals. Use Voice AI to qualify buyer and seller calls instantly and keep your pipeline moving 24/7.",
    painPoints: [
      "Inbound buyer and seller calls are missed during showings and client meetings.",
      "Manual lead qualification slows response time and lowers conversion rates.",
      "After-hours calls often go to voicemail with no structured follow-up.",
    ],
    outcomes: [
      "Instant response to inbound leads before competitors reply.",
      "Better qualification data before agent handoff.",
      "More booked showings from timely follow-up and scheduling.",
      "Less admin burden from repetitive inquiry handling.",
    ],
    processSteps: [
      "Define buyer and seller qualification questions with your team.",
      "Set routing rules by lead intent, urgency, and location.",
      "Connect showing-booking flow with calendar and notifications.",
      "Optimize scripts based on conversion and appointment data.",
    ],
    faq: [
      {
        question: "Can Voice AI route hot leads directly to an agent?",
        answer:
          "Yes. You can define routing thresholds so high-intent calls escalate immediately while lower-intent leads are captured and nurtured.",
      },
      {
        question: "Does this work for solo agents too?",
        answer:
          "Yes. Solo agents often see strong value because they are frequently unavailable during tours, listings, and negotiations.",
      },
      {
        question: "Can Voice AI book showings automatically?",
        answer:
          "It can pre-qualify calls, propose available times, and trigger your showing workflow through connected calendar tools.",
      },
    ],
    internalLinks: [
      { label: "Voice AI for Business", href: "/voice-ai-for-business" },
      { label: "Real Estate Industry Solutions", href: "/industries/real-estate" },
      { label: "Book a strategy call", href: "/contact" },
    ],
  },
};

export const voiceAiIndustrySlugs = Object.keys(voiceAiIndustryPages);

export const featuredVoiceAiIndustryPages = voiceAiIndustrySlugs.map(
  (slug) => voiceAiIndustryPages[slug]
);

export function getVoiceAiIndustryPageBySlug(
  slug: string
): VoiceAiIndustryPage | undefined {
  return voiceAiIndustryPages[slug];
}
