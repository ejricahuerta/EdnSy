/**
 * Generate the full landing page JSON content from GBP data and insights in a single AI call.
 * Used for demo generation so the payload sent to website-template is AI-generated from real business data.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import type { GeminiInsight } from '$lib/types/demo';
import type { IndustrySlug } from '$lib/industries';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import { parseJsonFromResponse } from '$lib/ai-agents/shared/parseJson';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const DEFAULT_CITY = 'Toronto';

function getCityFromAddress(address: string): string {
	if (!address?.trim()) return '';
	const match = address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/);
	return match?.[1]?.trim() ?? '';
}

/** AI-generated content we merge with GBP facts (name, address, phone, hours, testimonials, images). */
export type LandingContentFromAi = {
	business?: { tagline?: string; description?: string };
	hero?: { headline?: string; subheadline?: string; cta?: { label: string; href: string } };
	services?: Array<{ name: string; description?: string; price?: string }>;
	about?: { headline?: string; body?: string; values?: string[] };
	contact?: { headline?: string };
	cta_banner?: { headline?: string; subtext?: string; button?: { label: string; href: string } };
	seo?: { title?: string; description?: string; keywords?: string[] };
	stats?: Array<{ value: string; label: string }>;
};

function isLandingContentShape(value: unknown): value is LandingContentFromAi {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	if (o.business != null && (typeof o.business !== 'object' || Array.isArray(o.business))) return false;
	if (o.hero != null && (typeof o.hero !== 'object' || Array.isArray(o.hero))) return false;
	if (o.services != null && !Array.isArray(o.services)) return false;
	if (o.about != null && (typeof o.about !== 'object' || Array.isArray(o.about))) return false;
	if (o.contact != null && (typeof o.contact !== 'object' || Array.isArray(o.contact))) return false;
	if (o.cta_banner != null && (typeof o.cta_banner !== 'object' || Array.isArray(o.cta_banner))) return false;
	if (o.seo != null && (typeof o.seo !== 'object' || Array.isArray(o.seo))) return false;
	if (o.stats != null && !Array.isArray(o.stats)) return false;
	return true;
}

export type GenerateLandingContentResult =
	| { ok: true; content: LandingContentFromAi }
	| { ok: false; error: string };

/**
 * Generate full landing page content (hero, services, about, seo, etc.) from GBP and insights.
 * Use the result with buildLandingPageIndexJson(..., contentFromAi) so the JSON is AI-generated.
 */
export async function generateLandingPageContentFromGbp(
	prospect: Prospect,
	gbpRaw: GbpData | null,
	insight: GeminiInsight | null,
	industryLabel: string,
	industrySlug: IndustrySlug
): Promise<GenerateLandingContentResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'GEMINI_API_KEY not set' };
	}

	const rawName = gbpRaw?.name || prospect.companyName?.trim() || 'This Business';
	const name = typeof rawName === 'string' && rawName.includes(' | ') ? rawName.split(' | ')[0].trim() || rawName : rawName;
	const address = (gbpRaw?.address || prospect.address) ?? '';
	const city = (prospect.city ?? getCityFromAddress(address))?.trim() || DEFAULT_CITY;
	const industry = gbpRaw?.industry || prospect.industry || industryLabel;
	const phone = gbpRaw?.phone || prospect.phone || '';
	const reviewCount = gbpRaw?.ratingCount ?? 0;
	const rating = gbpRaw?.ratingValue ?? null;
	const reviewSnippets = (gbpRaw?.reviews ?? []).slice(0, 5).map((r) => (r.text ?? '').trim()).filter(Boolean);

	const insightLines = insight
		? [
				insight.grade ? `Grade: ${insight.grade}` : null,
				insight.summary ? `Summary: ${insight.summary}` : null,
				insight.website?.ux != null ? `Website UX: ${insight.website.ux}` : null,
				insight.website?.ui != null ? `Website UI: ${insight.website.ui}` : null,
				insight.website?.seo != null ? `Website SEO: ${insight.website.seo}` : null,
				insight.recommendations?.length ? `Recommendations: ${insight.recommendations.join('; ')}` : null
			]
				.filter(Boolean)
				.join('\n')
		: '';

	const prompt = `You are generating the full landing page content for a real small business. Use ONLY their Google Business Profile (GBP) data and optional AI insight below. Output a single JSON object that will be merged with their contact details (name, address, phone, hours) and images. Location: ${city}. Optimize for local search where relevant.

Business name: ${name}
Industry: ${industry}
Location: ${city}
${rating != null ? `Google rating: ${rating} (${reviewCount} reviews)` : ''}
${reviewSnippets.length ? `Review snippets:\n${reviewSnippets.map((t) => `- ${t.slice(0, 200)}`).join('\n')}` : ''}
${insightLines ? `\nInsight:\n${insightLines}` : ''}

Rules:
- hero.headline: ONE clear phrase that reads as the main hero title (e.g. "Your Smile Deserves Expert Care" or "Exceptional Dental Care in Richmond Hill"). Short (under 10 words). Must make sense on its own. Do NOT include the business name. Do NOT use SEO-style text like "| Dental Care in City".
- hero.subheadline: ONE short supporting sentence that invites or explains (e.g. "Book your consultation today." or "Modern dentistry with a gentle touch."). Do NOT use the business name. Do NOT repeat the headline.
- business.tagline and business.description: do NOT include " | " or SEO title-style text. Use the business name only when referring to them naturally (e.g. "At [name] we focus on...").
- services: 3–8 services commonly offered by this business type in ${city}. Each: name, description (1–2 sentences), price ("—", "Quote", "Contact us", or for dental "CDCP accepted" etc.).
- seo.title: 50–60 chars with business name and location (e.g. "Hummingbird Dental Clinic | Dental Care in Richmond Hill"). seo.description: 150–160 chars. seo.keywords: array including location and industry terms.
- cta_banner: headline and subtext for the CTA section; button label e.g. "Book an Appointment" or "Get in touch".

Return ONLY a JSON object with these keys (no markdown, no explanation):
{
  "business": { "tagline": "one short line", "description": "2-4 sentences about the business" },
  "hero": { "headline": "short punchy headline", "subheadline": "one supporting line", "cta": { "label": "Book an Appointment", "href": "#contact" } },
  "services": [ { "name": "Service name", "description": "1-2 sentences", "price": "— or Quote" }, ... ],
  "about": { "headline": "About section headline", "body": "2-4 sentences", "values": ["value1", "value2", "value3", "value4"] },
  "contact": { "headline": "Contact section headline" },
  "cta_banner": { "headline": "Ready to get started?", "subtext": "Short line.", "button": { "label": "Book Now", "href": "#contact" } },
  "seo": { "title": "50-60 char title", "description": "150-160 char meta description", "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"] },
  "stats": [ { "value": "100+", "label": "Reviews" }, { "value": "4.9", "label": "Average Rating ★" }, { "value": "15+", "label": "Years Experience" }, { "value": "500+", "label": "Happy Clients" } ]
}`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 8192,
					temperature: 0.4,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(35000)
		});

		if (!res.ok) {
			const err = await res.text();
			serverError('generateLandingPageContentFromGbp', 'Gemini', { status: res.status, body: err.slice(0, 300) });
			return { ok: false, error: `Gemini ${res.status}` };
		}

		const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { ok: false, error: 'Empty Gemini response' };

		const parsedResult = parseJsonFromResponse(text);
		if (!parsedResult.ok) {
			serverError('generateLandingPageContentFromGbp', 'Invalid JSON', { error: parsedResult.error, raw: text.slice(0, 200) });
			return { ok: false, error: parsedResult.error };
		}

		if (!isLandingContentShape(parsedResult.data)) {
			serverError('generateLandingPageContentFromGbp', 'Shape mismatch', { raw: JSON.stringify(parsedResult.data).slice(0, 300) });
			return { ok: false, error: 'Response shape invalid' };
		}

		// Normalize services (ensure name, description, price)
		const content = parsedResult.data;
		if (Array.isArray(content.services) && content.services.length > 0) {
			content.services = content.services.slice(0, 8).map((s) => ({
				name: typeof s.name === 'string' ? s.name : 'Service',
				description: typeof s.description === 'string' ? s.description : undefined,
				price: typeof s.price === 'string' ? s.price : '—'
			}));
		}

		return { ok: true, content };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('generateLandingPageContentFromGbp', 'uncaught', { error: err });
		return { ok: false, error: err };
	}
}
