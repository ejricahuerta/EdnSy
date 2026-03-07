/**
 * Enrich pitch-rosetta index.json copy using Gemini: tagline, hero, about, and service
 * descriptions from GBP + insight (grade, summary, website grading). Keeps the same
 * structure expected by pitch-rosetta (prompts/prompt.md); merges AI output into base.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import type { GeminiInsight } from '$lib/types/demo';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import { parseJsonFromResponse } from '$lib/ai-agents/shared/parseJson';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

export type EnrichPitchRosettaCopyResult =
	| { ok: true; indexJson: LandingPageIndexJson }
	| { ok: false; error: string };

/** Partial shape returned by Gemini; we merge this into the full indexJson. */
type EnrichmentFromAi = {
	business?: { tagline?: string };
	hero?: { headline?: string; subheadline?: string };
	about?: { headline?: string; body?: string; values?: string[] };
	services?: Array<{ name?: string; description?: string; price?: string }>;
};

function isEnrichmentShape(value: unknown): value is EnrichmentFromAi {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	if (o.business != null && (typeof o.business !== 'object' || Array.isArray(o.business))) return false;
	if (o.hero != null && (typeof o.hero !== 'object' || Array.isArray(o.hero))) return false;
	if (o.about != null && (typeof o.about !== 'object' || Array.isArray(o.about))) return false;
	if (o.services != null && !Array.isArray(o.services)) return false;
	return true;
}

function mergeEnrichment(base: LandingPageIndexJson, enrichment: EnrichmentFromAi): LandingPageIndexJson {
	const out = JSON.parse(JSON.stringify(base)) as LandingPageIndexJson;
	if (enrichment.business?.tagline != null) {
		if (!out.business) out.business = {};
		out.business.tagline = enrichment.business.tagline;
	}
	if (enrichment.hero) {
		if (!out.hero) out.hero = {};
		if (enrichment.hero.headline != null) out.hero.headline = enrichment.hero.headline;
		if (enrichment.hero.subheadline != null) out.hero.subheadline = enrichment.hero.subheadline;
	}
	if (enrichment.about) {
		if (!out.about) out.about = {};
		if (enrichment.about.headline != null) out.about.headline = enrichment.about.headline;
		if (enrichment.about.body != null) out.about.body = enrichment.about.body;
		if (Array.isArray(enrichment.about.values) && enrichment.about.values.length > 0)
			out.about.values = enrichment.about.values;
	}
	if (Array.isArray(enrichment.services) && enrichment.services.length > 0 && out.services?.length === enrichment.services.length) {
		out.services = enrichment.services.map((s, i) => ({
			name: s.name ?? out.services![i]!.name,
			description: s.description ?? out.services![i]!.description,
			price: s.price ?? out.services![i]!.price
		}));
	}
	return out;
}

/**
 * Enrich indexJson with AI-generated tagline, hero, about, and service copy using
 * GBP data and optional insight (grade, summary, website grading). On success
 * returns the merged indexJson; on failure returns the original and logs (caller
 * can still send the base payload).
 */
export async function enrichPitchRosettaCopy(
	baseIndexJson: LandingPageIndexJson,
	prospect: Prospect,
	gbpRaw: GbpData,
	insight: GeminiInsight | null
): Promise<EnrichPitchRosettaCopyResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'GEMINI_API_KEY not set' };
	}

	const name = (gbpRaw.name || prospect.companyName) ?? 'Business';
	const industry = (gbpRaw.industry || prospect.industry) ?? 'General';
	const address = (gbpRaw.address || prospect.address) ?? '';
	const area = ((address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/)?.[1] ?? '').trim() || prospect.city) ?? '';
	const reviewCount = gbpRaw.ratingCount ?? 0;
	const rating = gbpRaw.ratingValue ?? null;
	const reviewSnippets = (gbpRaw.reviews ?? []).slice(0, 3).map((r) => (r.text ?? '').trim()).filter(Boolean);

	const insightLines = insight
		? [
				insight.grade ? `Grade: ${insight.grade}` : null,
				insight.summary ? `Summary: ${insight.summary}` : null,
				insight.website?.ux != null ? `Website UX: ${insight.website.ux}` : null,
				insight.website?.ui != null ? `Website UI: ${insight.website.ui}` : null,
				insight.website?.seo != null ? `Website SEO: ${insight.website.seo}` : null,
				insight.website?.benchmark ? `Website benchmark: ${insight.website.benchmark}` : null,
				insight.recommendations?.length
					? `Recommendations: ${insight.recommendations.join('; ')}`
					: null
			]
				.filter(Boolean)
				.join('\n')
		: '';

	const servicesJson = JSON.stringify(
		(baseIndexJson.services ?? []).map((s) => ({ name: s.name, description: s.description ?? '', price: s.price ?? '—' }))
	);

	const prompt = `You are writing concise, credible landing page copy for a real small business. We have their Google Business Profile data and optional AI insight (grade, summary, website grading). Your job is to produce a JSON object that will be merged into their landing page data. Use their real name, location, and industry; weave in the insight so the copy feels tailored. Avoid generic filler.

Business: ${name}
Industry: ${industry}
Location/area: ${area || 'local area'}
${rating != null ? `Google rating: ${rating} (${reviewCount} reviews)` : ''}
${reviewSnippets.length ? `Review snippets:\n${reviewSnippets.map((t) => `- ${t.slice(0, 200)}`).join('\n')}` : ''}
${insightLines ? `\nInsight:\n${insightLines}` : ''}

Current services (keep same count and names; you may rewrite descriptions and price hints):
${servicesJson}

Return ONLY a JSON object with exactly these keys (no markdown, no explanation):
{
  "business": { "tagline": "one short line for the business" },
  "hero": { "headline": "main headline", "subheadline": "supporting line" },
  "about": { "headline": "About section headline", "body": "2-4 sentences about the business", "values": ["value1", "value2", "value3", "value4"] },
  "services": [ { "name": "same as input", "description": "1-2 sentences", "price": "— or Quote or Contact us" }, ... ]
}

Keep "services" array the same length as the input. Use the exact "name" from input for each service; you may change description and price.`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 2048,
					temperature: 0.5,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(25000)
		});

		if (!res.ok) {
			const err = await res.text();
			serverError('enrichPitchRosettaCopy', 'Gemini', { status: res.status, body: err.slice(0, 300) });
			return { ok: false, error: `Gemini ${res.status}` };
		}

		const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { ok: false, error: 'Empty Gemini response' };

		const parsedResult = parseJsonFromResponse(text);
		if (!parsedResult.ok) {
			serverError('enrichPitchRosettaCopy', 'Invalid JSON', { error: parsedResult.error, raw: text.slice(0, 200) });
			return { ok: false, error: parsedResult.error };
		}
		const parsed = parsedResult.data;

		if (!isEnrichmentShape(parsed)) {
			serverError('enrichPitchRosettaCopy', 'Shape mismatch', { raw: JSON.stringify(parsed).slice(0, 300) });
			return { ok: false, error: 'Response shape invalid' };
		}

		const merged = mergeEnrichment(baseIndexJson, parsed);
		return { ok: true, indexJson: merged };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('enrichPitchRosettaCopy', 'uncaught', { error: err });
		return { ok: false, error: err };
	}
}
