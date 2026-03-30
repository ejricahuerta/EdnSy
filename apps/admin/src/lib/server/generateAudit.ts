import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { serverError, serverInfo } from '$lib/server/logger';
import { isDemoAuditShape } from '$lib/types/demo';
import type { DemoAudit, GeminiInsight, AuditModalCopy, WebsiteInsight } from '$lib/types/demo';
import type { GbpData } from '$lib/server/gbp';
import { INDUSTRY_LABELS } from '$lib/industries';
import { getResolvedContent } from '$lib/server/agentContent';
import { parseJsonFromResponse } from '$lib/ai-agents/shared/parseJson';
import { fetchWebsiteContent } from '$lib/ai-agents';

export type GenerateAuditResult =
	| { ok: true; data: DemoAudit }
	| { ok: false; error: string };

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const DEMO_AUDIT_JSON_SCHEMA = `
Return ONLY one complete JSON object (no markdown, no explanation, no trailing text). Include every key. Use these exact keys and types:
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

const INSIGHT_JSON_SCHEMA = `
Return ONLY one complete JSON object (no markdown, no explanation). Use these exact keys:
{
  "grade": string (e.g. "A", "B+", "C" or "Strong" / "Good" / "Needs work"),
  "summary": string (2-4 sentences: insight about this business and its online presence, based on GBP and any website),
  "recommendations": string[] (2-5 short actionable items, e.g. "Add business hours to Google", "Respond to unanswered reviews"),
  "website": object or null. If the business has a website and you have content to evaluate, include: { "ux": string (grade for user experience, e.g. "A", "B+", "Good"), "ui": string (grade for visual design, e.g. "Modern", "Outdated", "B"), "seo": string (grade for SEO, e.g. "C", "Needs work"), "benchmark": "modern" | "outdated" (overall: does the site feel modern or outdated?) }. If no website or no content, set "website" to null.
  "needsWebsiteDemo": boolean. True if this business would benefit most from a personalized website demo (e.g. no website, outdated site, weak online presence). False if they would benefit more from AI agent / voice AI / SEO outreach (e.g. already have a modern site, strong GBP; focus on calls and local visibility).
  "recommendationReason": string (one short sentence explaining why needsWebsiteDemo is true or false).
}`.trim();

const AUDIT_MODAL_COPY_JSON_SCHEMA = `
Return ONLY one complete JSON object (no markdown, no explanation). Use these exact keys. Keep each value short (1-2 sentences max for text fields).
{
  "title": string (outcome-focused headline; use the business name, e.g. "We built a page to help [Business Name] get more calls from Google"),
  "whyYouLine": string (one sentence: we don't just pull their listing, we turn it into a page built to rank and convert),
  "proofLine": string (we used their real Google listing, reviews, website; they're not prospect #47 — this is theirs),
  "whatsNextLine": string (see your page below, no sign-up; if you like it we can talk next steps, if not no pressure),
  "socialProofLine": string (we've helped other local businesses improve their Google visibility and get more calls),
  "primaryCtaLabel": string (e.g. "See my page"),
  "secondaryCtaLabel": string (e.g. "I'd rather talk first")
}`.trim();

/** Default audit prompt template; {{context}} replaced with prospect/website context. */
export const DEFAULT_AUDIT_PROMPT_TEMPLATE = `You are generating a short "audit" summary for a small business demo page. Based on the following information, produce one complete JSON object in the exact format below. Use realistic numbers (e.g. review counts 0-50, completeness 0-100). Output only the JSON object with no other text.

{{context}}

${DEMO_AUDIT_JSON_SCHEMA}`;

/** Default audit modal copy prompt template; {{context}} replaced with business/audit context. */
export const DEFAULT_AUDIT_MODAL_COPY_PROMPT_TEMPLATE = `You are writing short, persuasive copy for a modal that appears when a local business owner first sees a demo page we built for them. We used their real Google listing and website data to build the page. Goal: build trust, show we used their data, and get them to click through to see the page (and optionally book a call). Tone: direct, helpful, no hype.

{{context}}

${AUDIT_MODAL_COPY_JSON_SCHEMA}`;

/**
 * Generate a DemoAudit for a prospect using Gemini. Uses business name, industry, and optional
 * website content. Returns a result with ok/data or ok: false and a traceable error string.
 * Target: complete within a few seconds so demo creation stays under 90s.
 */
export async function generateAuditForProspect(prospect: Prospect): Promise<GenerateAuditResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	let websiteSnippet: string | null = null;
	if (prospect.website?.startsWith('http')) {
		const fetched = await fetchWebsiteContent(prospect.website, { maxChars: 3000 });
		websiteSnippet = fetched.ok ? fetched.text : null;
	}

	const context = [
		`Business name: ${prospect.companyName ?? 'Unknown'}`,
		`Industry: ${prospect.industry ?? 'Professional'}`,
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

	const resolved = await getResolvedContent(
		'demo-creation',
		'prompt',
		'audit',
		DEFAULT_AUDIT_PROMPT_TEMPLATE
	);
	const prompt = resolved.body.replace(/\{\{context\}\}/g, context);

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const TRUNCATED_ERROR = 'Response truncated (incomplete JSON); try again';
	const isTruncationError = (err: string) =>
		err.includes('truncated') || err === TRUNCATED_ERROR;

	try {
		for (const maxOutputTokens of [4096, 8192]) {
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [{ role: 'user', parts: [{ text: prompt }] }],
					generationConfig: {
						maxOutputTokens,
						temperature: 0.3,
						responseMimeType: 'application/json'
					}
				}),
				signal: AbortSignal.timeout(15000)
			});

			if (!res.ok) {
				const err = await res.text();
				const msg = `API error: ${res.status} ${err.slice(0, 150)}`;
				serverError('generateAudit', msg, { status: res.status });
				return { ok: false, error: msg };
			}

			const data = (await res.json()) as {
				candidates?: {
					content?: { parts?: { text?: string }[] };
					finishReason?: string;
					finishMessage?: string;
				}[];
				usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
			};
			const candidate = data.candidates?.[0];
			const text = candidate?.content?.parts?.[0]?.text?.trim();
			const finishReason = candidate?.finishReason ?? '';
			const usage = data.usageMetadata;

			if (!text) {
				serverError('generateAudit', 'Gemini returned no content', {
					finishReason,
					finishMessage: candidate?.finishMessage
				});
				return { ok: false, error: 'Gemini returned no content' };
			}

			const parsed = parseJsonFromResponse(text);
			if (!parsed.ok) {
				const shouldRetry =
					isTruncationError(parsed.error) || finishReason === 'MAX_TOKENS';
				if (shouldRetry && maxOutputTokens === 4096) {
					serverInfo('generateAudit', 'Retrying with higher maxOutputTokens after truncation', {
						finishReason,
						usage
					});
					continue;
				}
				serverError('generateAudit', parsed.error, {
					raw: text.slice(0, 500),
					finishReason,
					finishMessage: candidate?.finishMessage,
					usage
				});
				return { ok: false, error: parsed.error };
			}

			if (!isDemoAuditShape(parsed.data)) {
				serverError('generateAudit', 'Response did not match DemoAudit shape', {
					raw: text.slice(0, 500)
				});
				return { ok: false, error: 'Invalid audit shape from Gemini' };
			}
			return { ok: true, data: parsed.data };
		}
		return { ok: false, error: TRUNCATED_ERROR };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('generateAudit', err, e);
		return { ok: false, error: err };
	}
}

export type GenerateInsightResult =
	| { ok: true; data: GeminiInsight }
	| { ok: false; error: string };

function isWebsiteInsightShape(value: unknown): value is WebsiteInsight {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return (
		(typeof o.ux === 'string' || o.ux === undefined || o.ux === null) &&
		(typeof o.ui === 'string' || o.ui === undefined || o.ui === null) &&
		(typeof o.seo === 'string' || o.seo === undefined || o.seo === null) &&
		((o.benchmark === 'outdated' || o.benchmark === 'modern') || o.benchmark === undefined || o.benchmark === null)
	);
}

function isGeminiInsightShape(value: unknown): value is GeminiInsight {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	const base =
		(typeof o.grade === 'string' || o.grade === undefined) &&
		(typeof o.summary === 'string' || o.summary === undefined) &&
		(Array.isArray(o.recommendations) || o.recommendations === undefined) &&
		(typeof o.needsWebsiteDemo === 'boolean' || o.needsWebsiteDemo === undefined) &&
		(typeof o.recommendationReason === 'string' || o.recommendationReason === undefined);
	if (!base) return false;
	if (o.website === null || o.website === undefined) return true;
	return isWebsiteInsightShape(o.website);
}

/**
 * Grade the business and pull related insight using Gemini, given GBP data.
 * When the prospect has a website, fetches a snippet so Gemini can grade UX, UI, SEO and modern vs outdated.
 * Used after GBP fetch during create-demo; result is merged into the audit as insight.
 */
export async function generateInsightForProspect(
	prospect: Prospect,
	gbp: GbpData
): Promise<GenerateInsightResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	let websiteSnippet: string | null = null;
	if (prospect.website?.startsWith('http')) {
		const fetched = await fetchWebsiteContent(prospect.website, { maxChars: 2500 });
		websiteSnippet = fetched.ok ? fetched.text : null;
	}

	const context = [
		`Business: ${prospect.companyName ?? 'Unknown'}, industry: ${prospect.industry ?? 'Professional'}`,
		prospect.city ? `Area: ${prospect.city}` : null,
		prospect.website ? `Website URL: ${prospect.website}` : null,
		websiteSnippet
			? `Website content snippet (use to grade UX, UI, SEO and set benchmark to "modern" or "outdated"):\n${websiteSnippet}`
			: prospect.website
				? 'Website could not be fetched; omit website grading (set "website" to null).'
				: null,
		`Google Business Profile: ${gbp.name}, ${gbp.address || 'no address'}, ${gbp.phone || 'no phone'}, ${gbp.website || 'no website'}`,
		gbp.ratingValue != null ? `Rating: ${gbp.ratingValue} (${gbp.ratingCount} reviews)` : `Reviews: ${gbp.ratingCount}`,
		`Claimed: ${gbp.isClaimed}, Hours: ${gbp.workHours ? 'yes' : 'no'}`
	]
		.filter(Boolean)
		.join('\n');

	const prompt = `You are grading a small business's online presence for a personalized demo. Based on the following business and Google Business Profile data, produce one JSON object with a grade, a short summary insight (2-4 sentences about their business and website), and 2-5 actionable recommendations. When website content is provided, also include the "website" object with ux, ui, seo (letter grades or short labels) and benchmark ("modern" or "outdated"). You must also set "needsWebsiteDemo": true if this business would benefit most from a personalized website demo (e.g. no website, outdated site, weak online presence), or false if they would benefit more from AI agent / voice AI / SEO outreach (e.g. already have a modern site). Set "recommendationReason" to one short sentence explaining why. Output only the JSON with no other text.

${context}

${INSIGHT_JSON_SCHEMA}`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const TRUNCATED_ERROR = 'Response truncated (incomplete JSON); try again';
	const isTruncationError = (err: string) =>
		err.includes('truncated') || err === TRUNCATED_ERROR;

	try {
		for (const maxOutputTokens of [2048, 4096, 8192]) {
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [{ role: 'user', parts: [{ text: prompt }] }],
					generationConfig: {
						maxOutputTokens,
						temperature: 0.3,
						responseMimeType: 'application/json'
					}
				}),
				signal: AbortSignal.timeout(20000)
			});

			if (!res.ok) {
				const err = await res.text();
				const msg = `API error: ${res.status} ${err.slice(0, 150)}`;
				serverError('generateInsight', msg, { status: res.status });
				return { ok: false, error: msg };
			}

			const data = (await res.json()) as {
				candidates?: {
					content?: { parts?: { text?: string }[] };
					finishReason?: string;
					finishMessage?: string;
				}[];
				usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
			};
			const candidate = data.candidates?.[0];
			const text = candidate?.content?.parts?.[0]?.text?.trim();
			const finishReason = candidate?.finishReason ?? '';

			if (!text) {
				serverError('generateInsight', 'Gemini returned no content', candidate);
				return { ok: false, error: 'Gemini returned no content' };
			}

			const parsed = parseJsonFromResponse(text);
			if (!parsed.ok) {
				const shouldRetry =
					isTruncationError(parsed.error) || finishReason === 'MAX_TOKENS';
				if (shouldRetry && maxOutputTokens < 8192) {
					serverInfo('generateInsight', 'Retrying with higher maxOutputTokens after truncation', {
						finishReason,
						usage: data.usageMetadata
					});
					continue;
				}
				serverError('generateInsight', parsed.error, { raw: text.slice(0, 300) });
				return { ok: false, error: parsed.error };
			}

			if (!isGeminiInsightShape(parsed.data)) {
				serverError('generateInsight', 'Response did not match GeminiInsight shape', {
					raw: text.slice(0, 300)
				});
				return { ok: false, error: 'Invalid insight shape from Gemini' };
			}
			return { ok: true, data: parsed.data };
		}
		return { ok: false, error: TRUNCATED_ERROR };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('generateInsight', err, e);
		return { ok: false, error: err };
	}
}

const NAME_INSIGHT_JSON_SCHEMA = `
Return ONLY one complete JSON object (no markdown, no explanation). Use these exact keys:
{
  "grade": string (e.g. "C" or "Needs work" — they have no real online presence),
  "summary": string (2-4 sentences: infer what this business likely does from the name; state they have no website/only a map link and would benefit from a professional site),
  "recommendations": string[] (2-5 short actionable items, e.g. "Get a professional website to capture leads", "Add a clear services and contact page"),
  "website": null (no website was evaluated),
  "needsWebsiteDemo": true (they need a website; we are creating a demo based on the business name),
  "recommendationReason": string (one short sentence, e.g. "No website or only a map link; a professional site would help them get found and book more clients.")
}`.trim();

/**
 * Generate insight from business name only (no GBP, no website). Use when GBP failed or
 * website is only Google Maps — safe to treat as no online presence; business needs a website.
 * Analyzes the name to infer business type and produces a demo-ready GeminiInsight.
 */
export async function generateInsightFromBusinessName(prospect: Prospect): Promise<GenerateInsightResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	const context = [
		`Business name: ${prospect.companyName ?? 'Unknown'}`,
		`Industry (if known): ${prospect.industry ?? 'not specified'}`,
		prospect.city ? `City/area: ${prospect.city}` : null
	]
		.filter(Boolean)
		.join('\n');

	const prompt = `You are helping qualify a small business that has no Google Business Profile data and no real website (or only a Google Maps link). We will create a personalized website demo based on their business name. Analyze the business name and optional industry to infer what they likely do. Produce one JSON object: grade (e.g. "C" or "Needs work"), a short summary (2-4 sentences about what the business likely is and that they need a website), 2-5 recommendations for getting online, set "website" to null, "needsWebsiteDemo" to true, and a short "recommendationReason". Output only the JSON with no other text.

${context}

${NAME_INSIGHT_JSON_SCHEMA}`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 1024,
					temperature: 0.3,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(15000)
		});

		if (!res.ok) {
			const err = await res.text();
			return { ok: false, error: `API error: ${res.status} ${err.slice(0, 150)}` };
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { ok: false, error: 'Gemini returned no content' };

		const parsed = parseJsonFromResponse(text);
		if (!parsed.ok) return { ok: false, error: parsed.error };
		if (!isGeminiInsightShape(parsed.data)) return { ok: false, error: 'Invalid insight shape from Gemini' };
		return { ok: true, data: parsed.data };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('generateInsightFromBusinessName', err, e);
		return { ok: false, error: err };
	}
}

export type GenerateAuditModalCopyResult =
	| { ok: true; data: AuditModalCopy }
	| { ok: false; error: string };

function isAuditModalCopyShape(value: unknown): value is AuditModalCopy {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return (
		typeof o.title === 'string' &&
		typeof o.whyYouLine === 'string' &&
		typeof o.proofLine === 'string' &&
		typeof o.whatsNextLine === 'string' &&
		typeof o.socialProofLine === 'string' &&
		typeof o.primaryCtaLabel === 'string' &&
		typeof o.secondaryCtaLabel === 'string'
	);
}

/**
 * Generate persuasive modal copy for the audit modal using Gemini.
 * One prompt, one JSON: title, why-you, proof, what's next, social proof, CTAs.
 * Called after audit (GBP + insight) is built; result stored in scraped_data.auditModalCopy.
 */
export async function generateAuditModalCopy(
	prospect: Prospect,
	audit: DemoAudit
): Promise<GenerateAuditModalCopyResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	const businessName = prospect.companyName ?? 'Your business';
	const industry = prospect.industry ?? 'local business';
	const auditSummary = [
		audit.websiteStatus && `Website: ${audit.websiteStatus}`,
		audit.googleReviewCount != null && `Reviews: ${audit.googleReviewCount}`,
		audit.googleRatingValue != null && `Rating: ${audit.googleRatingValue} stars`,
		audit.gbpClaimed !== undefined && `Profile claimed: ${audit.gbpClaimed}`,
		audit.gbpHasHours !== undefined && `Hours listed: ${audit.gbpHasHours}`,
		audit.gbpCompletenessLabel && `Completeness: ${audit.gbpCompletenessLabel}`
	]
		.filter(Boolean)
		.join('; ');

	const context = [
		`Business name: ${businessName}`,
		`Industry: ${industry}`,
		`Audit summary: ${auditSummary || 'No extra details'}.`
	].join('\n');

	const resolved = await getResolvedContent(
		'demo-creation',
		'prompt',
		'audit_modal_copy',
		DEFAULT_AUDIT_MODAL_COPY_PROMPT_TEMPLATE
	);
	const prompt = resolved.body.replace(/\{\{context\}\}/g, context);

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 1024,
					temperature: 0.4,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(15000)
		});

		if (!res.ok) {
			const err = await res.text();
			const msg = `API error: ${res.status} ${err.slice(0, 150)}`;
			serverError('generateAuditModalCopy', msg, { status: res.status });
			return { ok: false, error: msg };
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) {
			serverError('generateAuditModalCopy', 'Gemini returned no content', data.candidates?.[0]);
			return { ok: false, error: 'Gemini returned no content' };
		}

		const parsed = parseJsonFromResponse(text);
		if (!parsed.ok) {
			serverError('generateAuditModalCopy', parsed.error, { raw: text.slice(0, 300) });
			return { ok: false, error: parsed.error };
		}

		if (!isAuditModalCopyShape(parsed.data)) {
			serverError('generateAuditModalCopy', 'Response did not match AuditModalCopy shape', {
				raw: text.slice(0, 300)
			});
			return { ok: false, error: 'Invalid audit modal copy shape from Gemini' };
		}
		return { ok: true, data: parsed.data };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		serverError('generateAuditModalCopy', err, e);
		return { ok: false, error: err };
	}
}

/**
 * Product scope is dental-only; inferred label is always Dental when Gemini is configured.
 */
export async function inferIndustryWithGemini(
	prospect: Prospect,
	_gbpCategory?: string | null
): Promise<string | null> {
	if (!GEMINI_API_KEY) return null;
	serverInfo('inferIndustryWithGemini', 'Dental-only scope', { companyName: prospect.companyName });
	return INDUSTRY_LABELS.dental;
}
