/**
 * Industry-specific page content (long-form) for /industries/[slug]
 */

export type IndustryDetail = {
  slug: string;
  name: string;
  headline: string;
  subhead: string;
  resultStats: { value: string; label: string }[];
  solutions: { title: string; description: string; bullets: string[] }[];
  complianceNote?: { title: string; bullets: string[] };
};

export const industryDetails: Record<string, IndustryDetail> = {
  healthcare: {
    slug: "healthcare",
    name: "Healthcare and Clinics",
    headline: "Give your staff time to focus on patient care",
    subhead:
      "Automate administrative tasks so your team can spend more time with patients. From appointment scheduling to follow up care, we handle the busywork.",
    resultStats: [
      { value: "40%", label: "Reduction in no shows" },
      { value: "60%", label: "Less front desk calls" },
      { value: "15min", label: "Saved per patient" },
      { value: "24/7", label: "Patient availability" },
    ],
    solutions: [
      {
        title: "24/7 Patient Call Handling",
        description: "Voice AI answers calls, books appointments, and answers common questions. No voicemail.",
        bullets: ["60% less front desk calls", "Never miss a patient"],
      },
      {
        title: "Automated Appointment Scheduling",
        description: "Book, reschedule, or cancel via phone or web; syncs with Google Calendar or Cal.com.",
        bullets: ["Fill cancellation gaps", "80% less scheduling time"],
      },
      {
        title: "Patient Recall and Reminders",
        description: "Automated reminders for appointments and preventive care via call, text, and email.",
        bullets: ["40% fewer no-shows", "Better retention"],
      },
      {
        title: "Intake Form Automation",
        description: "Digital intake before visits; data flows into Notion or Google Sheets.",
        bullets: ["15 min saved per patient", "Fewer data errors"],
      },
      {
        title: "Post Visit Follow Ups",
        description: "Automated check-ins, medication reminders, and satisfaction surveys.",
        bullets: ["More online reviews", "Catch issues early"],
      },
      {
        title: "Insurance Verification",
        description: "Eligibility checks before appointments; fewer denials and surprise bills.",
        bullets: ["2 hours saved daily", "30% fewer denials"],
      },
    ],
    complianceNote: {
      title: "Designed with privacy and security in mind",
      bullets: ["Secure, encrypted communications", "Google Calendar, Cal.com, Notion, Sheets & more", "We can discuss compliance requirements when you're ready"],
    },
  },
  dental: {
    slug: "dental",
    name: "Dental Practices",
    headline: "Keep your chairs filled and patients smiling",
    subhead:
      "From hygiene recalls to treatment follow ups, we automate the outreach that keeps your practice thriving while your team focuses on patient care.",
    resultStats: [
      { value: "35%", label: "More hygiene retention" },
      { value: "25%", label: "Higher case acceptance" },
      { value: "90%", label: "Cancellations filled" },
      { value: "40%", label: "Reduction in AR" },
    ],
    solutions: [
      {
        title: "Hygiene Recall Automation",
        description: "Reach patients due for cleanings via call, text, and email until they book.",
        bullets: ["35% more hygiene retention", "Recover dormant patients"],
      },
      {
        title: "24/7 Appointment Booking",
        description: "Voice AI books cleanings, consultations, and emergencies after hours.",
        bullets: ["No hold times", "Capture after-hours bookings"],
      },
      {
        title: "Smart Scheduling",
        description: "AI fills cancellations and balances your book for better chair use.",
        bullets: ["90% of cancellations filled", "Fewer no-shows"],
      },
      {
        title: "Treatment Plan Follow Ups",
        description: "Automated outreach for pending treatment with reminders and financing options.",
        bullets: ["25% higher case acceptance", "Smaller treatment backlog"],
      },
      {
        title: "Review Generation",
        description: "Request reviews from happy patients; route unhappy ones to your team.",
        bullets: ["Stronger online reputation", "More 5-star reviews"],
      },
      {
        title: "Payment and Billing Automation",
        description: "Automated reminders, payments, and insurance follow-up.",
        bullets: ["40% lower AR", "Fewer disputes"],
      },
    ],
    complianceNote: {
      title: "Integrates with tools you already use",
      bullets: ["Google Calendar & Cal.com for scheduling", "Google Sheets & Notion for data", "Other API-connected apps"],
    },
  },
  construction: {
    slug: "construction",
    name: "Construction",
    headline: "Run your business from the job site",
    subhead:
      "Stop losing leads while you are on site. Automate the office work so you can focus on building while your business runs smoothly in the background.",
    resultStats: [
      { value: "30%", label: "Higher close rate" },
      { value: "2wks", label: "Faster payment" },
      { value: "80%", label: "Less follow up time" },
      { value: "24/7", label: "Lead capture" },
    ],
    solutions: [
      {
        title: "24/7 Lead Capture",
        description: "Voice AI answers when you're on site, qualifies leads, and collects project details.",
        bullets: ["Faster than competitors", "Capture leads from job sites"],
      },
      {
        title: "Quote Follow Up Automation",
        description: "Automated follow-up on quotes until the job is won or lost.",
        bullets: ["80% less follow-up time", "30% higher close rate"],
      },
      {
        title: "Invoice and Payment Processing",
        description: "Invoices at milestones plus automated payment reminders.",
        bullets: ["Get paid ~2 weeks faster", "Lower AR"],
      },
      {
        title: "Project Status Updates",
        description: "Scheduled updates on progress, timelines, and milestones.",
        bullets: ["Fewer check-in calls", "Happier clients"],
      },
      {
        title: "Subcontractor Coordination",
        description: "Work orders, schedule confirmations, and completion tracking.",
        bullets: ["Fewer scheduling conflicts", "Clear job status"],
      },
      {
        title: "Document Collection",
        description: "Automated requests for permits, insurance, and contracts with reminders.",
        bullets: ["Organized files", "No manual chasing"],
      },
    ],
    complianceNote: {
      title: "Built for how contractors work",
      bullets: ["Google Calendar, Sheets, Notion & Cal.com", "Other apps with APIs: we connect what you use", "Mobile-friendly for job sites"],
    },
  },
  salons: {
    slug: "salons",
    name: "Salons and Spas",
    headline: "Focus on your craft, not the phone",
    subhead:
      "Keep your chairs full and clients happy with automated booking, reminders, and marketing. Spend your time doing what you love.",
    resultStats: [
      { value: "50%", label: "Fewer no shows" },
      { value: "25%", label: "More repeat visits" },
      { value: "24/7", label: "Booking availability" },
      { value: "3hrs", label: "Saved weekly" },
    ],
    solutions: [
      {
        title: "Online Booking Integration",
        description: "Book 24/7 via website or Cal.com; syncs with Google Calendar.",
        bullets: ["No double bookings", "Fewer no-shows with deposits"],
      },
      {
        title: "Appointment Reminders",
        description: "Confirmations and reminders via text and email; confirm or reschedule without calling.",
        bullets: ["50% fewer no-shows", "More front-desk time"],
      },
      {
        title: "Voice AI Receptionist",
        description: "AI answers, books, and answers service/pricing questions when you're with clients.",
        bullets: ["After-hours booking", "Capture rush-hour calls"],
      },
      {
        title: "Birthday and Loyalty Campaigns",
        description: "Birthday offers and loyalty rewards sent when they're most likely to rebook.",
        bullets: ["25% more repeat visits", "Automatic birthday messages"],
      },
      {
        title: "Rebooking Automation",
        description: "Remind clients when they're due back based on service history.",
        bullets: ["Recover lapsed clients", "Chairs consistently filled"],
      },
      {
        title: "Review Collection",
        description: "Request reviews after great experiences; handle issues privately first.",
        bullets: ["Stronger online reputation", "Steady review growth"],
      },
    ],
    complianceNote: {
      title: "Works with tools that have APIs",
      bullets: ["Google Calendar & Cal.com for bookings", "Google Sheets & Notion for client data", "Sync with other apps you use"],
    },
  },
  "solo-professionals": {
    slug: "solo-professionals",
    name: "Solo Professionals",
    headline: "Run your business like a team of ten",
    subhead:
      "As a solo professional, you wear every hat. Let automation handle the admin so you can focus on the work that only you can do.",
    resultStats: [
      { value: "10+", label: "Hours saved weekly" },
      { value: "30%", label: "More client capacity" },
      { value: "24/7", label: "Availability" },
      { value: "100%", label: "Consistent follow up" },
    ],
    solutions: [
      {
        title: "Virtual Receptionist",
        description: "Voice AI screens calls, books appointments, and takes messages so you can focus.",
        bullets: ["Never miss a lead", "Professional first impression"],
      },
      {
        title: "Smart Scheduling",
        description: "Clients book into Google Calendar or Cal.com; buffer time and time zones handled for you.",
        bullets: ["24/7 booking", "No scheduling back-and-forth"],
      },
      {
        title: "Client Onboarding",
        description: "Welcome sequences: contracts, info collection, and expectations on autopilot.",
        bullets: ["Consistent process", "Faster onboarding"],
      },
      {
        title: "Invoice and Payment Automation",
        description: "Invoices, reminders, late notices, and receipts automatically.",
        bullets: ["Get paid faster", "Fewer awkward payment talks"],
      },
      {
        title: "Follow Up Sequences",
        description: "Automated check-ins with prospects and past clients.",
        bullets: ["Nurture leads", "Reactivate past clients"],
      },
      {
        title: "Document Management",
        description: "Request contracts and documents; track outstanding and send reminders.",
        bullets: ["Organized files", "No chasing documents"],
      },
    ],
    complianceNote: {
      title: "Perfect for independents",
      bullets: ["Google Calendar, Cal.com, Notion, Sheets", "Trainers, creatives, accountants", "Therapists, freelancers, coaches"],
    },
  },
  "real-estate": {
    slug: "real-estate",
    name: "Real Estate",
    headline: "Close more deals with less busywork",
    subhead:
      "Speed to lead wins in real estate. Our automation ensures you respond instantly, nurture consistently, and never let a deal slip through the cracks.",
    resultStats: [
      { value: "3x", label: "Faster lead response" },
      { value: "40%", label: "More showings booked" },
      { value: "24/7", label: "Lead capture" },
      { value: "50%", label: "Less admin time" },
    ],
    solutions: [
      {
        title: "24/7 Lead Qualification",
        description: "Voice AI qualifies buyers/sellers, captures interests, and books showings around the clock.",
        bullets: ["Respond in seconds", "No voicemail lost leads"],
      },
      {
        title: "Showing Scheduling",
        description: "Showings synced with Google Calendar or Cal.com; confirmations and reschedules automated.",
        bullets: ["Batch showings", "Fewer no-shows"],
      },
      {
        title: "Drip Email Campaigns",
        description: "New listings, market updates, and personalized content on autopilot.",
        bullets: ["Convert over time", "Stay top of mind"],
      },
      {
        title: "Transaction Coordination",
        description: "Document requests, deadline reminders, and status updates to all parties.",
        bullets: ["Less stress", "No missed deadlines"],
      },
      {
        title: "Client Follow Ups",
        description: "Anniversary reminders, home value updates, and referral requests automatically.",
        bullets: ["More referrals", "Relationships on autopilot"],
      },
      {
        title: "Market Updates",
        description: "Market reports and new listing alerts to your database.",
        bullets: ["Repeat business", "Expert positioning"],
      },
    ],
    complianceNote: {
      title: "Integrates with your tech stack",
      bullets: ["Google Calendar & Cal.com for showings", "Notion & Sheets for leads and transactions", "Other API-connected apps"],
    },
  },
  legal: {
    slug: "legal",
    name: "Legal Firms",
    headline: "More time for casework, less time on admin",
    subhead:
      "Capture more clients and serve them better. Our automation handles intake, scheduling, and client communication so you can focus on practicing law.",
    resultStats: [
      { value: "40%", label: "More consultations" },
      { value: "60%", label: "Less admin time" },
      { value: "24/7", label: "Client availability" },
      { value: "100%", label: "Deadline compliance" },
    ],
    solutions: [
      {
        title: "After Hours Intake",
        description: "Voice AI collects case details, qualifies leads, and books consultations 24/7.",
        bullets: ["Capture after-hours leads", "Qualify before you talk"],
      },
      {
        title: "Consultation Scheduling",
        description: "Booking, confirmations, and intake collection before the consultation.",
        bullets: ["Less scheduling friction", "Prepared every time"],
      },
      {
        title: "Document Collection",
        description: "Requests for documents and retainers; track outstanding and remind.",
        bullets: ["Organized files", "Faster case prep"],
      },
      {
        title: "Case Status Updates",
        description: "Scheduled updates on progress, deadlines, and milestones.",
        bullets: ["Fewer status calls", "Happier clients"],
      },
      {
        title: "Deadline Management",
        description: "Reminders for court dates, filings, and statute of limitations.",
        bullets: ["Never miss a date", "Lower risk"],
      },
      {
        title: "Client Onboarding",
        description: "Engagement letters, conflict checks, and intake forms sent and tracked.",
        bullets: ["Consistent process", "Faster engagement"],
      },
    ],
    complianceNote: {
      title: "Works with your practice tools",
      bullets: ["Google Calendar, Cal.com, Notion, Sheets", "Secure client communications", "We can discuss confidentiality needs when you're ready"],
    },
  },
  fitness: {
    slug: "fitness",
    name: "Fitness and Gyms",
    headline: "Keep members engaged and coming back",
    subhead:
      "From class bookings to membership retention, automate the touchpoints that keep your gym thriving and your members motivated.",
    resultStats: [
      { value: "25%", label: "Better retention" },
      { value: "30%", label: "Fewer no shows" },
      { value: "20%", label: "More PT bookings" },
      { value: "15%", label: "Revenue recovery" },
    ],
    solutions: [
      {
        title: "Class Booking and Waitlists",
        description: "Book online or via app; waitlists fill from cancellations; reminders cut no-shows.",
        bullets: ["Fill every spot", "Fewer no-shows"],
      },
      {
        title: "Membership Renewal Reminders",
        description: "Outreach before expiry via call, text, and email to retain members.",
        bullets: ["25% better retention", "Upsell at renewal"],
      },
      {
        title: "Win Back Campaigns",
        description: "Re-engage lapsed members with personalized offers and check-ins.",
        bullets: ["Recover lost revenue", "Track reactivation"],
      },
      {
        title: "Lead Follow Up",
        description: "Voice AI books tours; automated sequences for leads who don’t convert right away.",
        bullets: ["More tours booked", "Never miss a lead"],
      },
      {
        title: "PT Session Scheduling",
        description: "PT clients book directly; reminders, package tracking, and notes.",
        bullets: ["Less scheduling admin", "Easy for clients"],
      },
      {
        title: "Payment and Billing",
        description: "Billing, failed-payment recovery, and account updates automated.",
        bullets: ["Recover failed payments", "Fewer disputes"],
      },
    ],
    complianceNote: {
      title: "Integrates with tools you use",
      bullets: ["Google Calendar & Cal.com for classes and PT", "Notion & Sheets for members and schedules", "Other apps with APIs"],
    },
  },
};

export function getIndustryBySlug(slug: string): IndustryDetail | undefined {
  return industryDetails[slug];
}

export const industrySlugs = Object.keys(industryDetails) as string[];
