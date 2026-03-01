# Lead Rosetta — Product Requirements Document

**Version:** 0.2 (Pre-launch, Updated)
**Owner:** Ed (Ed & Sy Inc.)
**Status:** In Development
**Last Updated:** March 2026
**Changes from v0.1:** Positioning expanded, pricing restructured, data stack updated, bulletproofing measures added, distribution plan added, competitive landscape added.

---

## 1. Overview

### 1.1 Product Summary

Lead Rosetta is a personalized cold outreach page builder for web agencies, freelancers, and B2B sales teams. It scrapes a prospect's Google Business Profile, reviews, and social media presence — then instantly generates a personalized outreach page that proves the sender did their homework before asking for anything.

The core mechanic: instead of pitching a generic service, the user shows up with something already built for the prospect. The psychological hook — "we already built this for you, want to keep it?" — converts cold contacts into warm conversations.

**Important positioning shift from v0.1:** Lead Rosetta is not just a "demo website" tool. The output page type depends on what the user sells:

| What the user sells | What Lead Rosetta builds |
|---|---|
| Website / SEO services | Full personalized demo site |
| Reputation management | Review audit + improvement preview |
| Solar / roofing / trades | Personalized proposal landing page |
| Recruiting | Candidate-specific opportunity page |
| Accounting / consulting | Business health snapshot page |

The GBP scraping engine powers all of these. The industry template determines the output format.

### 1.2 The Problem

Cold outreach for web and digital services is broken. Generic "we build websites" emails are deleted in seconds. Response rates for standard cold email campaigns run under 2%. The only thing that breaks through is proof — showing the prospect something real, personalized, and immediately valuable.

Building a custom demo for each prospect manually takes hours. Lead Rosetta makes it take seconds.

### 1.3 The Solution

- Drop in a prospect (business name is enough — no website required)
- Lead Rosetta scrapes their Google Business Profile, Google Reviews, and social media
- AI generates a personalized outreach page using their real branding, real services, real customer language
- User reviews and approves before sending
- System provides a pre-written email template + demo link ready to send
- Prospect receives a link to their own personalized page — reply rate increases dramatically

**Key differentiator:** Works even if the prospect has no website. Most competitors (including GenPage) require an existing website to scrape. Lead Rosetta builds from GBP and reviews alone.

### 1.4 Target Users

| Segment | Description | LTV Potential |
|---|---|---|
| Web & SEO freelancers | Solo operators doing cold outreach to local businesses | Low-Medium |
| Small digital agencies | Teams of 2–10 doing volume outreach | Medium |
| B2B cold outreach teams | Any team selling digital services to local businesses | High |
| Home services franchises | Roofing, HVAC, solar, pest control selling to local businesses | High |

**Beachhead customer:** Freelancers and small web/SEO agencies — easy to reach, feel the pain acutely, fast feedback loop.
**Destination customer:** Agencies with $10K+/month revenue doing high-volume outreach for clients.

### 1.5 Internal Use Case

Lead Rosetta is built and used internally by Ed & Sy Inc. to close trades and service businesses (plumbers, glass repair, HVAC, locksmiths) in the GTA.

**Primary validated case study:** OhMyGlass (ohmyglass.ca) — website + local SEO + 24/7 Voice AI for $399/month. Conversion achieved with under 20 cold emails sent. Estimated reply rate: 5–10% (vs. industry average of 1–3%).

---

## 2. Goals & Success Metrics

### 2.1 Launch Goals (First 90 Days)

- 3 external paying users on Starter or Pro plan
- 10 free-tier users who have generated at least 1 demo
- Internal: close 2 new Ed & Sy agency clients using the system
- Publish 1 public case study with real reply rate data

### 2.2 Key Metrics

| Metric | Target |
|---|---|
| Demo pages generated (free) | 50+ in first 30 days |
| Free → paid conversion | 10%+ |
| Paid plan churn (monthly) | < 10% |
| Reply rate improvement reported by users | Measurable vs. baseline cold email |
| Time to generate first demo | < 90 seconds |
| Data confidence score (average) | 70%+ across generated demos |

### 2.3 Non-Goals (v1)

- Not building a full CRM
- Not owning email/SMS delivery infrastructure (users bring their own sending tools)
- Not supporting outreach categories beyond web/digital services in v1
- Not storing or analyzing lead data beyond the current session (free tier)

---

## 3. User Personas

### Persona A — The Freelance Web Builder

**Name:** Jamie
**Role:** Solo freelancer, builds websites for local Toronto businesses
**Pain:** Spends hours writing cold emails that go ignored. Has a Yellow Pages export of 200 plumbers. Doesn't know how to differentiate.
**Goal:** Send something that gets a response. Close 2 new clients per month.
**Behaviour:** Drops in a business name, Lead Rosetta scrapes GBP, generates demo in 90 seconds. Copies email template. Sends manually. Converts to Starter once he gets his first reply.

### Persona B — The Small Agency Owner

**Name:** Ed
**Role:** Technical co-founder, web/AI agency (2 people)
**Pain:** Has a list of trades businesses from Google Maps. Needs an outbound system that doesn't require constant manual effort.
**Goal:** Close 5 new clients at $399/month in the next 60 days.
**Behaviour:** Uses Lead Rosetta daily. Connects CRM on Pro. Reviews and approves demos, sends batch of 20 at once. Monitors open tracking dashboard.

### Persona C — The Cold Outreach Freelancer

**Name:** Priya
**Role:** Freelance SEO consultant, sells local SEO packages
**Pain:** Every cold email looks the same. She pitches "better rankings" but prospects can't feel it.
**Goal:** Stand out from other cold emailers. Increase her reply rate from 1% to 5%+.
**Behaviour:** Uploads CSV, generates demos, uses pre-written email templates. Measures open rates on dashboard.

---

## 4. Features

### 4.1 Feature List by Tier

#### Free (no plan)

| Feature | Description |
|---|---|
| Single demo generation | Generate 1 demo page per session, no account or credit card required |
| GBP auto-scrape | Drop in a business name — Lead Rosetta finds the rest from Google |
| Manual send | Copy the generated demo link and send it yourself |
| Email template | Pre-written cold email template with demo link auto-populated |
| No data storage | Lead data is discarded immediately after session |

#### Starter ($49/month)

| Feature | Description |
|---|---|
| 30 demo pages/month | For freelancers closing 2–3 clients a month |
| CSV upload with AI mapping | Upload leads via CSV; AI auto-maps columns |
| Manual send | Copy link and send yourself |
| Email template per demo | Pre-written, personalized email template per demo generated |
| Open tracking | Know when a prospect clicks their demo link |
| Unused demos roll over | Up to 30 days |

#### Pro ($99/month)

| Feature | Description |
|---|---|
| 100 demo pages/month | For agencies running outreach at scale |
| CSV + CRM connection | Connect HubSpot, GoHighLevel, Pipedrive, or Notion |
| Email template suite | Cold email + follow-up email templates per demo |
| Review & approve before send | See each demo before it goes out, make adjustments |
| Custom sender name | Emails send from your name/domain |
| Demo intelligence dashboard | Open tracking, time-on-page, return visits, sender notifications |
| Unused demos roll over | Up to 30 days |
| CRM AI insights | Dashboard summary: urgent to-dos, website/no-website breakdown, engagement signals |

#### Agency ($299/month)

| Feature | Description |
|---|---|
| Unlimited demo pages | For teams selling on behalf of clients |
| Everything in Pro | Full Pro feature set |
| White-label demos | Demos show your agency branding, not Lead Rosetta |
| Team seats | Up to 5 users |
| Client dashboard | Manage multiple client outreach campaigns |
| Priority support | Direct access to Ed |

**Agency signup:** Requires contacting us (no self-serve). CTA is "Contact us" (mailto with subject "Lead Rosetta Agency plan").

### 4.2 Core Feature Specs

#### F1 — Demo Page Generation

- **Input:** Business name (minimum); URL optional; location, services pulled from GBP automatically
- **Data sources (waterfall):**
  1. GBP via DataForSEO (primary)
  2. Website scrape via ScrapingBee (if website exists)
  3. Social media scrape via ScrapingBee (supplementary)
  4. Yelp / Yellow Pages (last resort fallback only)
  5. If all sources fail → flag as "low data," do not generate
- **Process:** AI agent scrapes public data using waterfall above; generates demo site using brand colors, logo, copy, service areas, real review quotes, and SEO gap analysis
- **Output:** Hosted demo page at a unique URL (e.g., `demo.leadrosetta.com/truenorth-builders-toronto`)
- **Time target:** Under 90 seconds per demo
- **Personalization elements:** Business name, logo, primary services, service area/city, real Google review quotes, SEO gaps, competitor comparison, data confidence score
- **Data is cached locally** — if DataForSEO is unavailable, serve from cache without interruption

#### F1a — Data Confidence Scoring

Before generating a demo, score the prospect's data quality:

| Signal | Points |
|---|---|
| GBP verified | 30 |
| 5+ reviews | 25 |
| Website exists | 20 |
| Photos available | 15 |
| Social presence | 10 |

| Score | Action |
|---|---|
| 80–100 | Full demo — generate automatically |
| 50–79 | Partial demo — flag for user review before sending |
| Below 50 | Do not generate — notify user with reason |

Show score to user: *"This demo is 85% complete — high confidence"*

#### F1b — Demo Page Structure (All Industries)

Every generated demo page follows this structure:

1. **Pain modal (on load)** — triggers 1 second after page loads, force-read for 4 seconds before dismiss:
   - What we found about [Business Name] online
   - Red/amber/green indicators: website status, unanswered reviews, GBP completeness, missing service pages
   - Close CTA: *"See what it looks like fixed →"*
   - One session cookie — does not re-trigger on refresh

2. **Hero section** — business name, branding, key stats

3. **Full demo content** — industry template (see style guides)

4. **Sticky CTA bar** — floating, always visible:
   - Text: *"Want this live in 48 hours?"*
   - Button: *"Reply to [sender name]"* or *"Book a call →"*
   - Sender name is dynamic — pulled from whoever generated the demo
   - Mobile-first

5. **Footer** — Lead Rosetta subtle branding only

#### F2 — CSV Upload with AI Mapping

- **Accepted format:** Any .csv — AI handles column mapping automatically
- **AI mapping process:**
  1. AI reads headers + sample rows
  2. Auto-maps to Lead Rosetta fields: business_name, contact_name, email, phone, location, website (optional), industry (optional)
  3. Shows user confirmation screen — user approves or adjusts in one click
  4. Unrecognized columns: user decides skip or assign
- **Auto-cleaning after mapping:**
  - Strip duplicate rows
  - Standardize phone formats
  - Validate email formats (flag obvious typos)
  - Flag missing critical fields
  - Trim whitespace and special characters
- **Preview & confirm:** Before generating, show: *"47 valid leads, 3 duplicates removed, 5 missing emails flagged"*
- **Free (no plan):** First row only processed
- **Starter and above:** All rows processed within plan limits

#### F3 — Review & Approve Queue

- Grid view of generated demos with confidence score visible
- Inline edit: name, services, location, headline, any AI-generated content
- **Review & approve is a hard gate** — no demo can be sent without user approval
- Disclaimer on every demo: *"This demo was built from public data. Review all content before sending to ensure accuracy."*
- Status: Draft / Approved / Sent / Opened / Replied
- Bulk approve
- Single-click send or schedule

#### F4 — Email Templates

Every generated demo automatically produces three ready-to-copy templates:

| Template | Channel | When to use |
|---|---|---|
| Cold outreach email | Email | First touch |
| Follow-up email | Email | Day 3–5 if no reply |
| SMS nudge | SMS | Optional follow-up |

**Each template auto-populated with:**
- Prospect first name
- Business name
- Demo link
- Sender name
- One personalized line pulled from scraped data (examples below)

**Personalized line logic:**
- No website → *"Your business has no website — customers are finding your competitors instead."*
- Unanswered reviews → *"You have 3 unanswered Google reviews from the last 90 days."*
- Missing GBP info → *"Your Google profile is missing your hours and service list."*
- Low photos → *"Your competitors have 40+ photos on Google. You have 2."*

**Default cold email template (based on OhMyGlass outreach):**
```
Subject: I built something for [Business Name]

Hey [First Name],

[Personalized one-liner about their specific online gap]

So we built you something — [Business Name], done right.

View your demo → [demo link]

No catch. Have a look when you get a sec.

— [Sender Name]

(We might send a follow-up.)
```

**Note:** Users copy and paste into their own sending tool (Instantly, Smartlead, Gmail, etc.). Lead Rosetta does not own sending infrastructure for cold outreach. Pro users can use automated sending via Resend for transactional/notification emails only.

#### F5 — Demo Intelligence Dashboard (Pro+)

Every demo link is a tracked URL. Dashboard shows per-demo:

- **Viewed** — prospect opened the demo
- **Time on page** — duration of visit
- **Sections visited** — did they scroll to services? Contact?
- **Return visits** — opened it more than once
- **Hot lead trigger** — 2+ minutes on page = sender notification: *"🔥 True North Builders just viewed their demo for 6 minutes"*

Real-time sender notifications on visit. This is the primary retention mechanic.

#### F6 — On-Demand Data Refresh

- Show data freshness on every lead: *"Last scraped: 3 days ago ✅"* / *"Last scraped: 45 days ago ⚠️"*
- One-click refresh: re-scrapes specific business via DataForSEO in real time (~$0.003 cost)
- Demo regenerates automatically with fresh data after refresh

#### F7 — Deliverability Pre-Send Checklist

Before any demo is sent, surface a checklist to the user:

```
Before your demo goes out:
☐ Is your sending domain warmed up? (minimum 2 weeks recommended)
☐ Does your email have SPF/DKIM configured?
☐ Are you sending under 50 emails/day on a new domain?
☐ Is your subject line free of spam trigger words?
```

Warning shown if user skips. Deliverability guide linked in onboarding.

---

## 5. User Flows

### 5.1 Free Tier Flow

```
Land on homepage
→ Click "Try free — one demo"
→ Enter business name (minimum) + optional location
→ Lead Rosetta scrapes GBP + reviews + socials automatically
→ Data confidence score calculated
→ Demo generated (< 90 seconds)
→ Pain modal preview shown to user
→ User previews full demo page
→ User copies demo link + email template
→ User sends manually
→ Prompt: "Want to send at scale? Pick a plan"
```

### 5.2 Starter / Pro Tier Flow

```
Sign in → Subscribe (Starter $49 or Pro $99/month)
→ Upload CSV or connect CRM (Pro)
→ AI maps columns → user confirms
→ Auto-cleaning runs → user sees preview count
→ Lead Rosetta scrapes GBP for each prospect
→ Data confidence scored per lead
→ Demo pages generated (within plan limit)
→ Review queue: preview each, edit if needed, approve
→ Email template copied per demo
→ User sends via their own tool (Instantly, Gmail, etc.)
→ Dashboard: track opens, time-on-page, return visits, hot lead alerts
→ Follow up using follow-up email template
```

### 5.3 Internal (Ed & Sy) Flow

```
Pull leads from GBP / Google Maps (trades businesses, GTA)
→ Upload CSV to Lead Rosetta
→ AI scrapes GBP + reviews for each lead
→ Review 20 demos (glass repair, HVAC, plumbers)
→ Copy email templates → send via own email tool
→ Monitor hot lead dashboard
→ Reply → book discovery call
→ Close at $399/month (website + SEO + voice AI)
```

### 5.4 Onboarding Flow (New Users)

**3-step activation — goal: first demo sent within session**

```
Step 1 — Welcome (30 seconds):
"Lead Rosetta works in 3 steps. We'll show you with a real example."

Step 2 — Generate sample demo:
"Type any local business name. Watch what we build."
[User types name → demo generates → they see the output]

Step 3 — Send your first real demo:
"Now do it for a real prospect. Add their name and email.
We'll generate the demo and give you the email template."
[First demo sent = activated user]
```

---

## 6. Technical Requirements

### 6.1 Stack (Current / Planned)

| Layer | Tech |
|---|---|
| Frontend | SvelteKit 2 (Svelte 5) with Vite 6 |
| Styling | Tailwind CSS 4, shadcn-svelte (bits-ui), CSS variables/theming |
| Server | SvelteKit server routes and server-side logic (no separate backend) |
| Demo page generation | AI agent (Claude/Anthropic) + HTML template engine |
| Hosting | adapter-auto (Vercel, Netlify, Cloudflare Pages); demos TBD |
| GBP data (primary) | DataForSEO API (~$0.003/profile) |
| Supplementary scraping | ScrapingBee (website + socials; ~$0.001/call) |
| Data cache | Local DB cache — serves from cache if DataForSEO unavailable |
| Email (transactional) | Resend — for user notifications only (not cold outreach sending) |
| Cold email sending | User's own tool (Instantly, Smartlead, Gmail) — Lead Rosetta provides templates only |
| SMS | Twilio (backlog; optional via env when enabled) |
| Auth | Clerk or Supabase Auth (planned) |
| Payments | Stripe (planned) |
| CRM connectors | HubSpot, GoHighLevel, Pipedrive, Notion (Pro) |

**Note on sending architecture:** Lead Rosetta does not own cold outreach delivery infrastructure. Users copy email templates and send via their own tools. This keeps deliverability responsibility with the user and eliminates spam/blacklist risk for Lead Rosetta.

### 6.2 Data Stack

**Primary source:** DataForSEO GBP API
- Cost: ~$0.0015/profile (standard queue), ~$0.003 (priority)
- $1.50 per 1,000 profiles — negligible at current scale
- Legally safe: pulls only publicly available business data

**Supplementary source:** ScrapingBee
- Website scraping, social media data, review extraction beyond GBP
- 1,000 free API calls for testing
- Cost: ~$0.001/call

**Total cost per demo:** ~$0.005 (half a cent)
**Revenue per demo at $99 Pro (100 demos):** ~$0.99 per demo
**Margin on data:** ~99.5%

**Yellow Pages:** Removed as primary source.
- ToS violation risk at scale
- Data quality poor (outdated, missing reviews, no photos)
- Replaced entirely by DataForSEO + ScrapingBee stack

### 6.3 Performance Requirements

| Requirement | Target |
|---|---|
| Demo generation time | < 90 seconds per demo |
| Batch generation (20 demos) | < 10 minutes |
| Demo page load time | < 2 seconds |
| Uptime | 99.5%+ |
| Data confidence score (avg) | 70%+ |

### 6.4 Privacy & Data

- **Free (no plan):** No lead data stored after session ends. Landing page states: *"Your lead data is never stored"*
- **Paid plans (Starter, Pro, Agency):** Lead data stored in user's account only; not used for training or shared. Landing page states: *"Pro accounts: your leads are saved securely to your dashboard."*
- No data sold to third parties
- Demo pages hosted for 30 days, then archived (paid plans: per plan terms)
- CASL compliant — see Section 6.5

### 6.5 Compliance (CASL / GDPR)

**Our approach: minimal, transfer liability to user**

Three things required before any paying user touches the product:

1. **Checkbox on signup:**
   *"I confirm I am responsible for ensuring my outreach complies with applicable laws in my jurisdiction."*

2. **Terms of Service line:**
   *"Lead Rosetta is a demo generation tool. Users are solely responsible for compliance with anti-spam and data protection laws in their region."*
   Generate full ToS + Privacy Policy via Termly.io.

3. **Unsubscribe link on every demo page:**
   Auto-appended: *"Not interested? Click here to never receive a demo from this sender again."*

**CASL note:** Lead Rosetta users are targeting business addresses (info@, hello@, contact@) — generally considered implied consent under CASL's B2B exemption. We are the platform, not the sender. User liability applies.

**GDPR:** Not a current concern (Canadian market focus). Add regional compliance checkbox at signup for future European users.

### 6.6 Prospect Data & Integrations

- **Source of prospects:** Users select their CRM in Dashboard → Integrations (HubSpot, GoHighLevel, Pipedrive, or Notion), or upload CSV
- **Sync into dashboard:** Contacts synced from CRM into dashboard, keyed by provider + provider_row_id
- **Status tracking:** Draft, Sent, Opened, Replied stored in our DB; synced back to CRM where provider supports it
- **CRM priority order for v1:** GoHighLevel first (most common in agency world), then HubSpot

### 6.7 Design System & Style Guides (Strict)

Same as v0.1 — no changes.

| Area | Requirement |
|---|---|
| Landing page | Style guide is priority. No shadcn-svelte. |
| Dashboard & app pages | Use shadcn-svelte. Style guide for typography/colors. |
| Industry demo pages | Industry style guides only. No shadcn-svelte. |
| Lead Rosetta modal/banner in demos | Always use leadrosetta.html style guide. |

---

## 7. Pricing

| Plan | Price | Key Limit | Audience |
|---|---|---|---|
| Free | $0 | 1 demo per session, manual send only | Try before you commit |
| Starter | $49/month | 30 demos/month | Solo freelancer closing 2–3 clients/month |
| Pro | $99/month | 100 demos/month | Active agency running outreach at scale |
| Agency | $299/month | Unlimited | Multi-client teams selling on behalf of clients |

**Above the pricing cards (landing):**
*Try one demo free — no account, no credit card. Then pick a plan when it works.*

**Below the pricing cards (landing):**
*"One demo closed a client for us. If it works once, it pays for itself."*

### 7.1 Pricing Rationale

- **Free:** Enough to experience the "wow" moment. No account, no credit card. Designed to convert within the first session.
- **Starter at $49:** Entry point for freelancers. 30 demos/month. CSV upload, manual send, open tracking. Unused demos roll over 30 days.
- **Pro at $99:** Scale tier. 100 demos/month, CSV + CRM, full demo intelligence dashboard, email template suite. Unused demos roll over 30 days. Positioned above GenPage ($59 Pro) — justified by full website output vs. single landing page.
- **Agency at $299:** White-label, 5 seats, client dashboard, priority support. Contact us for signup (no self-serve). Positioned as a revenue center for agencies reselling to clients.

**Competitive context:** GenPage (closest competitor) charges $59–$259/month for personalized landing pages. Lead Rosetta generates full websites from GBP data without requiring an existing website. Pricing reflects this differentiation.

**ROI framing (for pricing page):**
- Freelancer closes one $2,000 client from Lead Rosetta → 40x ROI on Starter plan
- Agency closes one $5,000 client → 50x ROI on Pro plan
- Add ROI calculator to pricing page: *"How much is one new client worth to you?"*

### 7.2 Implementation Alignment

| Plan | Demo limit (code) | Send (automated) | Notes |
|---|---|---|---|
| Free | 5/month on /try (cookie) | No | PRD says "1 demo per session"; product currently uses 5 free demos per month |
| Starter | 30/month | No (manual copy link + template) | Enforced via getDemoCountThisMonth |
| Pro | 100/month | Yes (Resend for notifications; user sends cold email via own tool) | getDemoCreationLimit |
| Agency | Unlimited | Yes | getDemoCreationLimit('teams') returns null |

---

## 8. Competitive Landscape

### Direct Competitors

| Competitor | Core Product | Pricing | Key Weakness vs. Lead Rosetta |
|---|---|---|---|
| GenPage | AI landing pages for cold outreach | $59–$259/month | Needs existing website; single page only; no GBP scraping |
| Hyperise | Personalized images in cold email | ~$69/month | Images only; no pages; manual setup |
| Lemlist | Cold email + personalized images/pages | $59–$99/user/month | Pages are a feature, not a product; no AI generation |
| Instantly / Smartlead | Cold email infrastructure | $37–$97/month | Zero personalized page output |

### Lead Rosetta's Moat

1. **Works without a prospect website** — nobody else does this
2. **GBP + reviews + socials as data sources** — generates from real customer language
3. **Full website output** — not a landing page, a complete site
4. **8 industry templates** — built-in vertical fit
5. **Built-in lead database** — users don't need their own lead sources

### Key Positioning Statement

*"Every other tool personalizes the email. Lead Rosetta personalizes what they land on — a full page built from everything publicly known about their business. That's why it gets replied to."*

---

## 9. Go-to-Market

### 9.1 Phase 1 — Internal Validation (Now)

Use Lead Rosetta internally at Ed & Sy to close the next 5 GTA trades clients. Every closed client = validated workflow, real numbers for the landing page.

**Publish a case study:** Run 500 Lead Rosetta demos vs. 500 standard cold emails to identical prospect lists. Publish reply rate comparison. This data is the product's best sales tool.

### 9.2 Phase 2 — Soft Launch to Known Network

Offer free Pro access to 3 freelancer/agency contacts who have the same problem. Gather feedback. Capture first testimonials.

### 9.3 Phase 3 — Public Launch

**Community channels (manual, first 10 users):**
- Reddit: r/juststart, r/SEO, r/webdesign, r/Entrepreneur, r/Emailmarketing
- Facebook groups: web designer communities, SEO agency groups
- Indie Hackers: post the OhMyGlass case study with real numbers
- X/Twitter: find people complaining about cold email reply rates — reply personally

**Platform channels (10–100 users):**
- Product Hunt — launch only after 20+ users who love the product
- AppSumo — apply early; use for volume and case studies, not core revenue

**Ecosystem channels (100+ users):**
- GoHighLevel Marketplace — 1,500+ apps, none doing what Lead Rosetta does. Build native workflow integration (demo generates when contact added). 15% revenue share. Priority integration target.
- Zapier / Make integrations
- G2 + Capterra listings (free, long-tail SEO traffic)

### 9.4 GoHighLevel Marketplace Strategy

GHL users are the ideal customer: web/SEO agencies, existing outreach budgets ($97–$297/month tools), high-volume lead lists.

**Integration mechanic:**
- Trigger: new contact added to GHL pipeline
- Action: Lead Rosetta auto-generates demo for that contact
- Output: demo link + email template dropped into GHL contact record
- User sends from inside GHL — never leaves the platform

**Timeline:** Build direct product first (Month 1–2) → Build GHL OAuth integration (Month 2–3) → Submit to GHL marketplace (Month 3–4).

### 9.5 Positioning

**Tagline:** Stop pitching. Show up with their site already built.

**Expanded one-liner:** Whatever you're selling — Lead Rosetta builds a personalized page that proves you did your homework before asking for anything.

**Versus generic cold email tools (Instantly, Lemlist):** Those tools personalize text. Lead Rosetta personalizes the destination.

**Versus GenPage:** They need a website to scrape. We build from Google data alone.

**Versus manual demo building:** That takes hours per prospect. Lead Rosetta does it in 90 seconds at scale.

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data source goes down (GBP/DataForSEO) | Medium | Critical | Multi-source waterfall + local cache; never single source dependency |
| Demo quality inconsistent (low data prospect) | High | High | Data confidence scoring; don't generate below 50 points |
| AI hallucination on no-website businesses | Medium | High | Review & approve as hard gate; disclaimer on every demo; confidence label |
| Novelty decay (prospects get too many demos) | Medium (12–18 months) | High | Deepen personalization: review sentiment, competitor gaps, missed revenue calculator |
| Email deliverability blamed on product | High | Medium | Pre-send deliverability checklist; onboarding guide; user owns their domain |
| No user onboarding = early churn | High | High | 3-step activation flow; first demo in first session goal |
| Legal (CASL / ToS violation) | Low | High | Signup checkbox, ToS line, unsubscribe link, Termly.io |
| Yellow Pages scraping ToS violation | High (was in use) | High | Replaced with DataForSEO — resolved |
| CRM integration bugs (v1.1) | High | Low | Phase 1 is CSV only; CRM is Pro stretch goal |
| Agency tier waitlist kills high-value signups | High | Medium | Removed waitlist; Agency requires contact us — always available |

---

## 11. Open Questions

- [ ] What domain will Lead Rosetta live on? (`leadrosetta.com`, `lead.rosetta.ai`, other?)
- [ ] Should the free tier require an email signup, or stay fully anonymous?
- [ ] What CRM should be prioritized for v1 Pro? GoHighLevel (most common in agency world) vs HubSpot?
- [ ] Do we allow users to bring their own Twilio/SendGrid keys, or abstract it?
- [ ] Add annual pricing option? (2 months free — reduces churn, smooths revenue)
- [ ] Should demo pages expire after 30 days or stay live indefinitely for paid plans?
- [ ] White label: should it have its own dedicated landing page section vs. bullet point in Agency tier?
- [ ] ROI calculator on pricing page — build in-page or link to external tool?

---

## 12. Pre-Launch Checklist

Must be complete before first paying user:

- [ ] Switch data source from Yellow Pages to DataForSEO + ScrapingBee stack
- [ ] Implement data confidence scoring (F1a)
- [ ] Build pain modal on demo pages (F1b)
- [ ] Build sticky CTA bar on demo pages (F1b)
- [ ] Make review & approve a hard gate (F3)
- [ ] Add disclaimer on every generated demo
- [ ] Build email template section (F4)
- [ ] Add deliverability pre-send checklist (F7)
- [ ] Build 3-step onboarding flow (Section 5.4)
- [ ] Generate ToS + Privacy Policy via Termly.io
- [ ] Add compliance checkbox on signup
- [ ] Add unsubscribe link to every demo page
- [ ] Remove "data never stored" claim for paid tier users
- [ ] Remove Agency waitlist — replace with "Contact us" CTA
- [ ] Update landing page copy (v2 copy doc)

---

## 13. Milestones

| Milestone | Target Date | Owner |
|---|---|---|
| DataForSEO integration live | Week 1 | Ed |
| Pain modal + sticky CTA on demo pages | Week 1 | Ed |
| Email template section live | Week 1 | Ed |
| Free tier live (1 demo, manual send + template) | Week 1 | Ed |
| Compliance: ToS, checkbox, unsubscribe link | Week 1 | Ed |
| 3-step onboarding flow | Week 2 | Ed |
| Internal use: first 20 demos sent for Ed & Sy | Week 2 | Ed |
| Data confidence scoring live | Week 2 | Ed |
| CSV upload with AI mapping | Week 2–3 | Ed |
| Pro tier: CRM connection + demo intelligence dashboard | Week 3–4 | Ed |
| Open tracking + hot lead notifications | Month 2 | Ed |
| First 3 external paying users | Month 2 | Ed + Sy |
| Case study published (reply rate data) | Month 2 | Ed |
| Product Hunt launch | Month 2–3 | Ed + Sy |
| GoHighLevel integration | Month 3 | Ed |
| AppSumo application submitted | Month 3 | Ed + Sy |
| GHL marketplace submission | Month 4 | Ed |
| SMS send (Twilio) | Backlog — enable via env when needed |

---

*Lead Rosetta is a product of Ed & Sy Inc., Toronto, Ontario. © 2026.*
*PRD v0.2 — Updated March 2026. Changes from v0.1 tracked in version header.*
