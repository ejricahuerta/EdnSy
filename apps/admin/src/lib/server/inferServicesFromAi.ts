/**
 * Infer a list of services for a business using AI when GBP does not provide them.
 * Generates 3–8 services commonly offered by this business type in the given city;
 * defaults to Toronto when location is unknown so content is relevant to local search.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
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

export type InferServicesResult =
	| { ok: true; services: NonNullable<LandingPageIndexJson['services']> }
	| { ok: false; error: string };

/**
 * Use Gemini to generate 3–8 services commonly offered by this business type in the given city.
 * When city cannot be determined from address or prospect, uses Toronto so content is relevant to local search.
 */
export async function inferServicesFromAi(
	prospect: Prospect,
	gbpRaw: GbpData | null,
	industryLabel: string,
	industrySlug: IndustrySlug
): Promise<InferServicesResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'GEMINI_API_KEY not set' };
	}

	const name = gbpRaw?.name || prospect.companyName?.trim() || 'This Business';
	const address = (gbpRaw?.address || prospect.address) ?? '';
	const city = (prospect.city ?? getCityFromAddress(address))?.trim() || DEFAULT_CITY;
	const reviewSnippets = (gbpRaw?.reviews ?? []).slice(0, 5).map((r) => (r.text ?? '').trim()).filter(Boolean);

	const prompt = `You are generating a list of services for a real small business landing page. The business has no service list from their Google listing, so create services that are commonly offered by this type of business in ${city}. Use local relevance (e.g. for ${city}) so the page ranks well for local search.

Business name: ${name}
Industry: ${industryLabel}
Location: ${city}
${reviewSnippets.length ? `Review snippets (use to infer what they offer):\n${reviewSnippets.map((t) => `- ${t.slice(0, 180)}`).join('\n')}` : ''}

Return ONLY a JSON array of 3 to 8 service objects. Each object must have:
- "name": string (short service name, e.g. "Teeth Whitening", "General Checkups")
- "description": string (1–2 sentences)
- "price": string (e.g. "—", "Quote", "Contact us", "CDCP accepted" for dental)

Be specific to the industry and to services commonly offered in ${city}. No markdown, no explanation.`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 2048,
					temperature: 0.4,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(20000)
		});

		if (!res.ok) {
			const err = await res.text();
			serverError('inferServicesFromAi', 'Gemini', { status: res.status, body: err.slice(0, 300) });
			return { ok: false, error: `Gemini ${res.status}` };
		}

		const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { ok: false, error: 'Empty Gemini response' };

		const parsedResult = parseJsonFromResponse(text);
		if (!parsedResult.ok) {
			serverError('inferServicesFromAi', 'Invalid JSON', { error: parsedResult.error, raw: text.slice(0, 200) });
			return { ok: false, error: parsedResult.error };
		}

		const arr = Array.isArray(parsedResult.data) ? parsedResult.data : null;
		if (!arr || arr.length === 0) {
			return { ok: false, error: 'Response was not a non-empty array' };
		}

		const services: NonNullable<LandingPageIndexJson['services']> = arr.slice(0, 8).map((item) => {
			const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
			return {
				name: typeof o.name === 'string' ? o.name : 'Service',
				description: typeof o.description === 'string' ? o.description : undefined,
				price: typeof o.price === 'string' ? o.price : '—'
			};
		});

		return { ok: true, services };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('inferServicesFromAi', 'uncaught', { error: err });
		return { ok: false, error: err };
	}
}
