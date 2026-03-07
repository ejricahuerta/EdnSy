/**
 * Website agent: fetches the website, analyzes UI/UX/funnel/SEO, produces grades and demo JSON.
 * Used when prospect has a website URL; result is stored in scraped_data (websiteAnalysis, demoJson).
 */

import type { Prospect } from '$lib/server/prospects';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import { callGemini } from '$lib/ai-agents/shared/gemini';
import { parseJsonFromResponse } from '$lib/ai-agents/shared/parseJson';
import type { AgentResult } from '$lib/ai-agents/shared/types';
import type { WebsiteAgentOutput } from './types';
import { fetchWebsiteContent } from './fetchWebsite';
import { serverError } from '$lib/server/logger';

const WEBSITE_ANALYSIS_SCHEMA = `
Return ONLY one complete JSON object (no markdown, no explanation). Use these exact keys:
{
  "uiGrade": string (letter or label e.g. "A", "B+", "Modern", "Outdated"),
  "uxGrade": string (usability, navigation, clarity, mobile-friendliness),
  "funnelGrade": string (conversion path, CTAs, forms, lead capture),
  "seoGrade": string (on-page signals, structure, content relevance),
  "overallGrade": string (e.g. "Strong", "Good", "Needs work"),
  "funnelSummary": string or null (optional one-sentence funnel assessment),
  "demoJson": object or null. If you can infer business info from the website content, provide a partial index.json for the demo builder: include at least "business" (name, tagline, description), "hero" (headline, subheadline, cta), "services" (array of name, description, price), "about" (headline, body, values), "theme" (style, primaryColor, accentColor), "seo" (title, description, keywords). Use the business name and content from the website; do not invent. If content is too sparse, set "demoJson" to null.
}`.trim();

function isLandingPageIndexJsonShape(value: unknown): value is LandingPageIndexJson {
	if (value === null || typeof value !== 'object') return true;
	const o = value as Record<string, unknown>;
	return (
		(typeof o.business === 'object' || o.business === undefined) &&
		(typeof o.hero === 'object' || o.hero === undefined) &&
		(Array.isArray(o.services) || o.services === undefined) &&
		(typeof o.about === 'object' || o.about === undefined) &&
		(typeof o.theme === 'object' || o.theme === undefined)
	);
}

function isWebsiteAgentOutput(value: unknown): value is WebsiteAgentOutput {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return (
		typeof o.uiGrade === 'string' &&
		typeof o.uxGrade === 'string' &&
		typeof o.funnelGrade === 'string' &&
		typeof o.seoGrade === 'string' &&
		typeof o.overallGrade === 'string' &&
		(o.funnelSummary === undefined || o.funnelSummary === null || typeof o.funnelSummary === 'string') &&
		(o.demoJson === null || isLandingPageIndexJsonShape(o.demoJson))
	);
}

export type AnalyzeWebsiteParams = {
	websiteUrl: string;
	prospect: Prospect;
	gbpSummary?: { name?: string; address?: string; category?: string };
};

/**
 * Fetch the website at websiteUrl, then analyze UI, UX, funnel, and SEO and produce grades plus demo JSON.
 * When fetch fails or content is empty, returns a result with demoJson null and placeholder grades.
 */
export async function analyzeWebsiteAndProduceDemoJson(
	params: AnalyzeWebsiteParams
): Promise<AgentResult<WebsiteAgentOutput>> {
	const { websiteUrl, prospect, gbpSummary } = params;

	const fetchResult = await fetchWebsiteContent(websiteUrl, { maxChars: 6000 });
	if (!fetchResult.ok) {
		return {
			ok: true,
			data: {
				uiGrade: 'N/A',
				uxGrade: 'N/A',
				funnelGrade: 'N/A',
				seoGrade: 'N/A',
				overallGrade: 'Unavailable',
				funnelSummary: `Could not fetch website: ${fetchResult.error}`,
				demoJson: null
			}
		};
	}

	const { text } = fetchResult;
	if (!text || text.trim().length < 50) {
		return {
			ok: true,
			data: {
				uiGrade: 'N/A',
				uxGrade: 'N/A',
				funnelGrade: 'N/A',
				seoGrade: 'N/A',
				overallGrade: 'Insufficient content',
				funnelSummary: 'Website had little or no indexable content.',
				demoJson: null
			}
		};
	}

	const businessName = prospect.companyName ?? gbpSummary?.name ?? 'Business';
	const industry = prospect.industry ?? gbpSummary?.category ?? 'General';
	const context = [
		`Website URL: ${websiteUrl}`,
		`Business name: ${businessName}`,
		`Industry: ${industry}`,
		gbpSummary?.address ? `Address (for context): ${gbpSummary.address}` : null,
		'',
		'Website content (text extracted from HTML):',
		text.slice(0, 5000)
	]
		.filter(Boolean)
		.join('\n');

	const prompt = `You are analyzing a small business website for UI (visual design, layout, modernity), UX (usability, navigation, mobile-friendliness), conversion funnel (CTAs, forms, lead capture), and SEO (on-page signals, structure). Then produce a demo JSON (index.json shape) for a landing page builder, using the business name and content from the website. Infer services, about, hero copy, and theme from the content; do not invent data.

${context}

${WEBSITE_ANALYSIS_SCHEMA}`;

	const result = await callGemini({
		prompt,
		maxOutputTokens: 8192,
		temperature: 0.3,
		responseMimeType: 'application/json',
		timeoutMs: 30000
	});

	if (!result.ok) {
		serverError('websiteAgent.analyzeWebsiteAndProduceDemoJson', result.error);
		return { ok: false, error: result.error };
	}

	const parsed = parseJsonFromResponse(result.text);
	if (!parsed.ok) {
		serverError('websiteAgent.analyzeWebsiteAndProduceDemoJson', parsed.error, {
			raw: result.text.slice(0, 400)
		});
		return { ok: false, error: parsed.error };
	}

	if (!isWebsiteAgentOutput(parsed.data)) {
		serverError('websiteAgent.analyzeWebsiteAndProduceDemoJson', 'Response did not match WebsiteAgentOutput shape', {
			raw: result.text.slice(0, 400)
		});
		return { ok: false, error: 'Invalid website analysis shape from Gemini' };
	}

	return { ok: true, data: parsed.data };
}
