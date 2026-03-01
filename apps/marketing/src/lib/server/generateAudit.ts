import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { isDemoAuditShape } from '$lib/types/demo';
import type { DemoAudit } from '$lib/types/demo';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const DEMO_AUDIT_JSON_SCHEMA = `
Return ONLY a single JSON object (no markdown, no explanation) with these exact keys and types:
{
  "websiteStatus": "exists" | "missing" | "outdated",
  "websiteStatusLevel": "red" | "amber" | "green",
  "googleReviewCount": number | null,
  "lastReviewResponseDate": string | null,
  "unansweredReviewsCount": number | null,
  "missingServicePages": string | null,
  "gbpCompletenessScore": number | null,
  "gbpCompletenessLabel": string (optional)
}`.trim();

/**
 * Fetch a prospect's website and return plain text (truncated). Returns null on failure or CORS.
 */
async function fetchWebsiteSnippet(url: string, maxChars: number = 6000): Promise<string | null> {
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'LeadRosetta/1.0 (demo audit)' },
			signal: AbortSignal.timeout(8000)
		});
		if (!res.ok) return null;
		const html = await res.text();
		const text = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		return text.slice(0, maxChars) || null;
	} catch {
		return null;
	}
}

/**
 * Generate a DemoAudit for a prospect using Gemini. Uses business name, industry, and optional
 * website content. Returns null if Gemini is not configured or the response is invalid.
 * Target: complete within a few seconds so demo creation stays under 90s.
 */
export async function generateAuditForProspect(prospect: Prospect): Promise<DemoAudit | null> {
	if (!GEMINI_API_KEY) return null;

	let websiteSnippet: string | null = null;
	if (prospect.website?.startsWith('http')) {
		websiteSnippet = await fetchWebsiteSnippet(prospect.website);
	}

	const context = [
		`Business name: ${prospect.companyName ?? 'Unknown'}`,
		`Industry: ${prospect.industry ?? 'General'}`,
		prospect.city ? `City/area: ${prospect.city}` : null,
		prospect.website ? `Website URL: ${prospect.website}` : null,
		websiteSnippet
			? `Website content snippet (use to infer website status and completeness):\n${websiteSnippet}`
			: prospect.website
				? 'Website could not be fetched; infer status as "missing" or "outdated".'
				: 'No website provided; use websiteStatus "missing".'
	]
		.filter(Boolean)
		.join('\n');

	const prompt = `You are generating a short "audit" summary for a small business demo page. Based on the following information, produce a plausible audit in the exact JSON format below. Use realistic numbers and labels (e.g. review counts 0-50, completeness 0-100, or "X% complete"). If information is missing, infer reasonably for a local business in the given industry.

${context}

${DEMO_AUDIT_JSON_SCHEMA}`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 512,
					temperature: 0.3,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(15000)
		});

		if (!res.ok) {
			const err = await res.text();
			console.error('[generateAudit] Gemini error:', res.status, err.slice(0, 200));
			return null;
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return null;

		let parsed: unknown;
		try {
			const raw = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
			parsed = JSON.parse(raw);
		} catch {
			return null;
		}

		if (!isDemoAuditShape(parsed)) return null;
		return parsed;
	} catch (e) {
		console.error('[generateAudit]', e);
		return null;
	}
}
