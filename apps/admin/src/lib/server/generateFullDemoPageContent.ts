/**
 * Generate full v1.3 demo page content using Gemini, based on GBP data and Gemini insights.
 * Produces compelling copy and Unsplash image queries for hero, solution, and testimonials.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { serverError } from '$lib/server/logger';
import type { GbpData } from '$lib/server/gbp';
import type { GeminiInsight } from '$lib/types/demo';
import type { DemoPageContentFromAi } from '$lib/types/demoPageContentFromAi';
import { TONE_LABELS, TONE_DESCRIPTIONS, type ToneSlug } from '$lib/tones';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const SCHEMA = `
Return ONLY one JSON object (no markdown, no explanation). Use these exact keys. All copy must be specific to this business and compelling.

{
  "meta": { "title": "string - SEO title including business name and location/service", "description": "string - meta description under 160 chars" },
  "tone": { "name": "string - e.g. Professional", "copyVoice": "string - one line describing the voice" },
  "nav": {
    "links": [ { "label": "string", "href": "#services" }, { "label": "string", "href": "#reviews" }, { "label": "string", "href": "#contact" } ],
    "ctaLabel": "string - main CTA button text"
  },
  "hero": {
    "headline": "string - compelling H1, include business name or location where relevant",
    "subheadline": "string - one line value proposition",
    "body": "string - 1-2 sentences about the business, use insight/reviews/GBP to be specific",
    "primaryCta": "string - main button (e.g. Book now, Get a quote)",
    "secondaryCta": "string - secondary button",
    "heroImageQuery": "string - 2-4 word Unsplash search for hero (e.g. 'modern dental clinic', 'friendly yoga studio')",
    "heroImageAlt": "string - short alt text for hero image"
  },
  "trustBar": {
    "items": [
      { "icon": "star", "label": "string - use real rating/count if available" },
      { "icon": "shield", "label": "string" },
      { "icon": "clock", "label": "string" }
    ]
  },
  "problem": {
    "headline": "string - pain points section headline",
    "items": [ "string", "string", "string" ]
  },
  "solution": {
    "headline": "string",
    "body": "string - how this business helps; use insight summary and recommendations to make it credible",
    "solutionImageQuery": "string - Unsplash search for about/solution image (e.g. 'professional team office', 'happy client service')",
    "solutionImageAlt": "string"
  },
  "services": {
    "headline": "string",
    "subheadline": "string",
    "items": [
      { "icon": "heart", "title": "string", "description": "string", "ctaLabel": "Learn More" },
      { "icon": "users", "title": "string", "description": "string", "ctaLabel": "Learn More" },
      { "icon": "calendar", "title": "string", "description": "string", "ctaLabel": "Contact" }
    ]
  },
  "stats": {
    "items": [ { "value": "string", "label": "string" }, { "value": "string", "label": "string" }, { "value": "string", "label": "string" } ]
  },
  "work": {
    "headline": "string - e.g. Our Work, Projects, What We've Done",
    "subheadline": "string or null",
    "items": [
      { "title": "string", "description": "string", "imageQuery": "string - 2-4 word Unsplash search", "imageAlt": "string", "category": "string or null", "outcome": "string or null" }
    ]
  },
  "testimonials": {
    "headline": "string",
    "source": "string - e.g. Google reviews",
    "items": [
      { "name": "string", "location": "string - city/area", "rating": 5, "text": "string - 1-2 sentences, sound like a real review" },
      { "name": "string", "location": "string", "rating": 5, "text": "string" }
    ],
    "testimonialAvatarQuery": "string - Unsplash search for customer/avatar (e.g. 'professional headshot', 'happy customer portrait')"
  },
  "cta": {
    "headline": "string",
    "body": "string",
    "primaryCta": "string",
    "secondaryCta": "string",
    "guarantee": "string or null"
  },
  "faq": {
    "headline": "Frequently Asked Questions",
    "items": [ { "question": "string", "answer": "string" }, { "question": "string", "answer": "string" } ]
  },
  "footer": { "tagline": "string", "copyright": "string", "hours": [ { "days": "string", "hours": "string" } ] }
}

Rules:
- Use the business name, address, city, and industry throughout. Reference their real rating/review count in trustBar when available.
- Use the Gemini insight (grade, summary, recommendations) to make solution body and problem/solution items specific and credible.
- Tone and voice: Write like a credible local business, not a generic ad. Avoid tacky lead-rosetta speak, clichés, and hype (e.g. no "best in class", "we're here for you", "your trusted partner", "experience the difference"). Be factual, specific, and professional. Confident but not salesy. For trades (locksmith, plumber, HVAC, etc.) sound like a no-nonsense professional; for healthcare/salons match warmth without sounding cheesy.
- Testimonials: if GBP has no review text, write 2 plausible short reviews that match the business and insight; keep name/location generic (e.g. "Sarah M.", "Downtown"). Sound like real customer reviews, not ad copy.
- Services: services.items is an array of 3 or more items. (1) If this business clearly offers many distinct services or offerings, include ALL of them (e.g. dental: cleanings, fillings, whitening, implants, orthodontics, root canals; salon: hair, nails, skin, waxing; contractor: kitchens, baths, flooring, roofing, additions; locksmith: lockout, rekeying, commercial, keys, safes). Each item: icon (heart, users, calendar, wrench, star, check), title, description, ctaLabel. (2) If the business has only one or two obvious services, list those and generate 2 more plausible services for this business type so the section has at least 3 items. Never cap at 3 when the business has more; never leave only 1 item.
- Stats: exactly 3 KPI items (value + label). Use business-specific numbers when available (e.g. years in business, projects completed, review count); otherwise use plausible defaults like "15+ Years", "100+ Clients", "4.9 Average Rating ★". Never use 0 or placeholder values like "Local & Trusted".
- Image queries: 2-4 words each; Unsplash-style. Hero = main visual, solution = team/about, testimonialAvatar = people/portraits.
- Work: For businesses that benefit from showing past projects (contractors, trades, design, dental, salons, etc.), include a "work" section with 2-4 items. Each item: title (e.g. "Kitchen renovation", "Full bathroom remodel"), description (1-2 sentences), imageQuery (Unsplash search, e.g. "modern kitchen renovation", "bathroom tile"), imageAlt, optional category (e.g. "Residential", "Commercial"), optional outcome (e.g. "Completed on time", "5-star review"). If the business type does not suit a portfolio (e.g. generic retail), you may omit work or set items to [].
- Tone: match the given tone label. Canadian spelling where relevant.
- FAQ: Every answer must be direct and useful. Never answer with "check our website", "see Google", "visit [url] for hours", or similar redirects. For "What are your operating hours?" (or similar): if business hours are provided in context, use them in the answer and in footer.hours; otherwise write plausible hours for this industry (e.g. "Monday–Friday 8am–6pm, Saturday 9am–2pm"). Use the same hours in footer.hours. Prefer 2–4 FAQ items that you can answer with real, specific content.
`.trim();

export type GenerateFullDemoPageContentResult =
	| { ok: true; content: DemoPageContentFromAi }
	| { ok: false; error: string };

function isDemoPageContentFromAiShape(value: unknown): value is DemoPageContentFromAi {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	const services = o.services as { items?: unknown[] } | undefined;
	const items = services?.items;
	const hasValidServices = Array.isArray(items) && items.length >= 1;
	return (
		typeof o.meta === 'object' &&
		typeof (o.meta as Record<string, unknown>)?.title === 'string' &&
		typeof o.hero === 'object' &&
		typeof (o.hero as Record<string, unknown>)?.headline === 'string' &&
		Array.isArray((o.hero as Record<string, unknown>)?.heroImageQuery) === false &&
		typeof (o.hero as Record<string, unknown>)?.heroImageQuery === 'string' &&
		hasValidServices
	);
}

/**
 * Generate full demo page content from GBP + Gemini insight. Returns copy and image queries;
 * caller resolves image URLs via Unsplash and merges into DemoPageJson.
 */
export async function generateFullDemoPageContent(
	prospect: Prospect,
	gbpRaw: GbpData,
	insight: GeminiInsight,
	tone: ToneSlug,
	industryLabel: string
): Promise<GenerateFullDemoPageContentResult> {
	if (!GEMINI_API_KEY) return { ok: false, error: 'Gemini not configured' };

	const name = gbpRaw.name || prospect.companyName?.trim() || 'This business';
	const address = gbpRaw.address || prospect.address || '';
	const phone = gbpRaw.phone || prospect.phone || '';
	const website = gbpRaw.website || prospect.website || '';
	const rating = gbpRaw.ratingValue ?? null;
	const reviewCount = gbpRaw.ratingCount ?? 0;
	const city = prospect.city || (address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/)?.[1]?.trim() ?? '');

	const context = [
		`Business name: ${name}`,
		`Industry: ${industryLabel}`,
		city ? `City/area: ${city}` : null,
		address ? `Address: ${address}` : null,
		phone ? `Phone: ${phone}` : null,
		website ? `Website: ${website}` : null,
		rating != null ? `Google rating: ${rating} stars` : null,
		reviewCount > 0 ? `Review count: ${reviewCount}` : null,
		`Profile claimed: ${gbpRaw.isClaimed}`,
		gbpRaw.workHours
			? `Business hours (use in FAQ and footer.hours): ${typeof gbpRaw.workHours === 'string' ? gbpRaw.workHours : JSON.stringify(gbpRaw.workHours)}`
			: null,
		insight.grade ? `Our assessment grade: ${insight.grade}` : null,
		insight.summary ? `Insight summary: ${insight.summary}` : null,
		insight.recommendations?.length
			? `Recommendations: ${insight.recommendations.join('; ')}`
			: null
	]
		.filter(Boolean)
		.join('\n');

	const toneLabel = TONE_LABELS[tone];
	const toneDesc = TONE_DESCRIPTIONS[tone];

	const prompt = `You are writing a complete, compelling landing page for a real small business. We have their Google Business Profile data and an AI assessment (insight). Your job is to create copy that feels personal, credible, and conversion-focused. Use their real details (name, location, rating when available) and weave in the insight so the page feels tailored to them. Avoid generic filler; every line should feel specific to this business.

Image queries: Choose Unsplash search terms that match this specific industry. For trades (plumbing, locksmith, HVAC, electrician, etc.) use trade-specific queries (e.g. "plumber repair", "locksmith keys", "HVAC technician") not generic "construction site". Healthcare/dental → "medical clinic", "dental practice"; salons → "hair salon", "beauty treatment"; professional/legal → "professional team meeting"; fitness → "gym", "yoga studio".

${context}

Tone: ${toneLabel}. ${toneDesc}

${SCHEMA}`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 4096,
					temperature: 0.5,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(35000)
		});

		if (!res.ok) {
			const err = await res.text();
			serverError('generateFullDemoPageContent', 'Gemini', { status: res.status, body: err.slice(0, 300) });
			return { ok: false, error: `Gemini ${res.status}` };
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { ok: false, error: 'Empty response' };

		let parsed: unknown;
		try {
			const raw = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
			parsed = JSON.parse(raw);
		} catch {
			return { ok: false, error: 'Invalid JSON from Gemini' };
		}

		if (!isDemoPageContentFromAiShape(parsed)) {
			serverError('generateFullDemoPageContent', 'Shape mismatch', { raw: JSON.stringify(parsed).slice(0, 500) });
			return { ok: false, error: 'Response shape invalid' };
		}

		return { ok: true, content: parsed };
	} catch (e) {
		serverError('generateFullDemoPageContent', 'uncaught', { error: e });
		return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
	}
}
