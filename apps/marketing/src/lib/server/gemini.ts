import { env } from '$env/dynamic/private';
import type { BusinessData, WebsiteData } from '$lib/types/demo';

/** Model ID for generateContent. Override with GEMINI_MODEL env. See https://ai.google.dev/gemini-api/docs/models */
const GEMINI_MODEL = env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const WEBSITE_DATA_SCHEMA = `
You are generating landing page content JSON for a small business demo site. Output ONLY valid JSON, no markdown or explanation.

Required top-level keys (use these exact names):
- header: { navLinks: [], ctaLabel: string }
- hero: { badge?: string, tagline: string, taglineWithCity?: string, subtext: string, subheadline?: string, trustBadges?: [], urgencyText?: string, image: string (use a relevant Unsplash URL), imageAlt: string, ctaPrimary: string, ctaSecondary?: string }
- whyUs: { heading: string, subtext: string, items: [{ title: string, description: string }] }
- services: { heading: string, subtext: string, items: [{ title: string, description: string, icon?: string }] }
- about: { heading: string, subtext: string, subtext2?: string, bullets: string[], image: string (Unsplash URL), imageAlt: string }
- newPatients or gettingStarted: { heading: string, subtext: string, steps: [{ title: string, description: string }], ctaLabel?: string, switchingEasy?: string, whatToBringTitle?: string, whatToBring?: string[] }
- whatToExpect?: { heading: string, subtext: string, items: string[] }
- hours?: { heading: string, lines: string[] }
- testimonials?: { heading: string, subtext: string, ratingDisplay?: string, reviewCount?: string, items: [{ quote: string, author: string, role?: string, rating: number }] }
- insurance or payment?: { heading?: string, body: string }
- stats?: [{ value: string, label: string }]
- contact: { heading: string, subtext: string, address: string, phone: string, email: string, ctaLabel: string }
- faq?: { heading: string, items: [{ q: string, a: string }] }
- footer: { links: [{ label: string, href: string }], ctaLabel: string, ctaHeading: string, copyright: string }
- cta?: { heading: string, subtext: string, microReassurance?: string, button: string, phoneLabel?: string }

Use the business name, location, and scraped text to personalize. Keep tone professional and local. Use real-looking Unsplash URLs for images (e.g. https://images.unsplash.com/photo-...). If industry is known, tailor services and copy to that industry (e.g. dental, salon, legal, fitness).
`;

/**
 * Call Gemini to generate Website Data (landing page content) from scraped Business Data.
 * Returns parsed JSON matching our demo content shape.
 */
export async function generateWebsiteData(
	businessData: BusinessData,
	industry: string
): Promise<WebsiteData> {
	const apiKey = env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not set');
	}

	const prompt = `${WEBSITE_DATA_SCHEMA}

Industry for this business: ${industry}

Scraped business data (use this to personalize the content):
${JSON.stringify(businessData, null, 2)}

Generate the full landing page content JSON for this business. Output only the JSON object, no markdown code fence.`;

	const body = {
		contents: [{ role: 'user', parts: [{ text: prompt }] }],
		generationConfig: {
			temperature: 0.6,
			maxOutputTokens: 8192,
			responseMimeType: 'application/json'
		}
	};

	const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 500)}`);
	}

	interface GeminiResponse {
		candidates?: Array<{
			content?: { parts?: Array<{ text?: string }> };
		}>;
	}
	const json = (await res.json()) as GeminiResponse;

	const text =
		json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
	if (!text) {
		throw new Error('Gemini returned no content');
	}

	// Handle optional markdown code fence
	let raw = text;
	if (raw.startsWith('```')) {
		raw = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
	}

	try {
		return JSON.parse(raw) as WebsiteData;
	} catch {
		throw new Error('Gemini response was not valid JSON');
	}
}
