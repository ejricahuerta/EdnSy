/**
 * In-app demo HTML generator (free-try and dashboard inline only): three Gemini calls (head+nav+hero, services+about+stats, testimonials+footer).
 * Paid demos use website-template single-file HTML.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import type { ToneSlug } from '$lib/tones';
import { industryDisplayToSlug } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { getDemoImageUrls } from '$lib/server/unsplash';
import {
	buildLandingPageIndexJson,
	mergeWebsiteDemoJsonWithGbp,
	narrowLandingPageJsonForApi
} from '$lib/server/buildLandingPageIndexJson';
import { DEMO_ERROR } from '$lib/constants/demoErrors';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = (env.GEMINI_API_KEY ?? '').trim();
const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS_PER_PART = 8192;

/** Inline prompt for 3-part demo: use index.json only, output HTML only. Full cinematic spec lives in website-template. */
const DEMO_LANDING_SYSTEM_PROMPT = `You build a single-page landing for a local business. All content comes from the provided index.json; do not invent copy. Output only the requested HTML fragment (no markdown, no explanation). Use semantic HTML, responsive layout, and inline CSS. Prefer Google Fonts and a coherent theme from the JSON (theme.style, theme.primaryColor, theme.accentColor).`;

export type ClaudeGenerateDemoHtmlResult =
	| { ok: true; html: string; parts?: [string, string, string] }
	| { ok: false; error: string };

/**
 * Extract HTML from Claude's response. Handles:
 * - Full response is a single ```html ... ``` or ``` ... ``` block
 * - Code block appears after some intro text
 * - Raw HTML with optional leading/trailing explanation (take from first < to end)
 */
function extractHtmlFromResponse(text: string): string {
	const raw = text.trim();
	if (!raw) return '';

	// Prefer: any fenced code block (html or unspecified) containing HTML
	const codeBlockMatch = raw.match(/```(?:html)?\s*([\s\S]*?)```/);
	if (codeBlockMatch) {
		const candidate = codeBlockMatch[1].trim();
		if (candidate.startsWith('<') || candidate.startsWith('<!')) return candidate;
	}

	// Otherwise: find first < and take through end (model may have added intro text)
	const firstAngle = raw.indexOf('<');
	if (firstAngle !== -1) {
		const candidate = raw.slice(firstAngle).trim();
		if (candidate.length > 50) return candidate;
	}

	return '';
}

const PART_INSTRUCTIONS: Record<1 | 2 | 3, string> = {
	1: 'Generate **Part 1 only**: the document head (full <head> with all CSS for the entire page), then <body>, navbar, and hero section. End with the closing tag of the hero section (e.g. </section>). Do NOT include </body> or </html>. Output only the HTML fragment, no explanation.',
	2: 'Generate **Part 2 only**: the Services/Features section (at most 3 cards + "All services" button), About/Philosophy section, and Stats section. Fragment only — no DOCTYPE, no <head>, no <body>. Start with the first section and end with the last section\'s closing tag. Output only the HTML fragment, no explanation.',
	3: 'Generate **Part 3 only**: Testimonials (slider), Gallery (if data), Contact (form + map + hours), Footer, then </body></html>. Include any <script> for slider/lightbox. Output only the HTML fragment, no explanation.'
};

/**
 * Generate one part (1, 2, or 3) of the demo page via Claude.
 */
async function generatePartWithGemini(
	payloadJson: string,
	part: 1 | 2 | 3
): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
	const prompt = `${DEMO_LANDING_SYSTEM_PROMPT}

${PART_INSTRUCTIONS[part]}

Here is the \`index.json\` for this business. Use only the data below; do not invent content.

\`\`\`json
${payloadJson}
\`\`\``;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	let errText = '';
	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: MAX_OUTPUT_TOKENS_PER_PART,
					temperature: 0.35
				}
			}),
			signal: AbortSignal.timeout(60_000)
		});

		errText = await res.text();
		if (!res.ok) {
			serverError('geminiGenerateDemoHtml', `part ${part} status ${res.status}`, {
				body: errText.slice(0, 500)
			});
			return { ok: false, error: `Gemini ${res.status}` };
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('geminiGenerateDemoHtml', 'FETCH_FAILED', { part, error: msg });
		return { ok: false, error: msg };
	}

	const data = JSON.parse(errText) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const rawText = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('\n').trim();
	const html = extractHtmlFromResponse(rawText);
	if (!html) {
		const snippet = rawText.slice(0, 300).replace(/\n/g, ' ');
		serverError('claudeGenerateDemoHtml', 'NO_HTML_RETURNED', {
			part,
			message: DEMO_ERROR.NO_HTML_RETURNED,
			rawLength: rawText.length,
			rawSnippet: snippet
		});
		return { ok: false, error: `Part ${part}: ${DEMO_ERROR.NO_HTML_RETURNED}` };
	}

	let trimmed = html.trim();
	if (part === 1 && (/<\/html\s*>/i.test(trimmed) || /<\/body\s*>/i.test(trimmed))) {
		serverError('claudeGenerateDemoHtml', 'PART_1_INVALID', { message: DEMO_ERROR.PART_1_INVALID });
		return { ok: false, error: DEMO_ERROR.PART_1_INVALID };
	}
	if (part === 3) {
		const hasBody = /<\/body\s*>/i.test(trimmed);
		const hasHtml = /<\/html\s*>/i.test(trimmed);
		if (!hasBody || !hasHtml) {
			// Haiku sometimes truncates or omits closing tags; append what's missing
			if (!hasBody) trimmed += '\n</body>';
			if (!hasHtml) trimmed += '\n</html>';
		}
	}
	return { ok: true, html: trimmed };
}

const isRateLimitError = (err: string) => /rate limit|rate_limit|429|resource_exhausted|quota/i.test(err);

/**
 * In-app only: generate demo HTML in three Gemini calls, then stitch. Returns full HTML and optional parts for legacy storage.
 * When optionalWebsiteDemoJson is provided (e.g. from website agent), it is merged with gbpRaw/contact and used as the payload base.
 */
export async function generateDemoHtmlWithClaude(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug,
	optionalWebsiteDemoJson?: import('$lib/types/landingPageIndexJson').LandingPageIndexJson | null
): Promise<ClaudeGenerateDemoHtmlResult> {
	if (!GEMINI_API_KEY) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	const industrySlug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const imageUrls = await getDemoImageUrls(industrySlug, prospect.industry, {
		companyName: prospect.companyName ?? undefined
	});

	const indexJson =
		optionalWebsiteDemoJson != null
			? mergeWebsiteDemoJsonWithGbp({
					websiteDemoJson: optionalWebsiteDemoJson,
					gbpRaw,
					prospect,
					industryLabel,
					tone,
					imageUrls
				})
			: buildLandingPageIndexJson({
					prospect,
					gbpRaw,
					industryLabel,
					tone,
					imageUrls
				});
	const payload = narrowLandingPageJsonForApi(indexJson);
	const payloadJson = JSON.stringify(payload, null, 2);

	const runPart = async (part: 1 | 2 | 3): Promise<{ ok: true; html: string } | { ok: false; error: string }> => {
		let result = await generatePartWithGemini(payloadJson, part);
		if (!result.ok && isRateLimitError(result.error)) {
			await new Promise((r) => setTimeout(r, 65_000));
			result = await generatePartWithGemini(payloadJson, part);
		}
		return result;
	};

	try {
		const r1 = await runPart(1);
		if (!r1.ok) {
			serverError('claudeGenerateDemoHtml', 'PART_1_FAILED', { error: r1.error });
			return { ok: false, error: `${DEMO_ERROR.PART_1_FAILED}: ${r1.error}` };
		}
		const r2 = await runPart(2);
		if (!r2.ok) {
			serverError('claudeGenerateDemoHtml', 'PART_2_FAILED', { error: r2.error });
			return { ok: false, error: `${DEMO_ERROR.PART_2_FAILED}: ${r2.error}` };
		}
		const r3 = await runPart(3);
		if (!r3.ok) {
			serverError('claudeGenerateDemoHtml', 'PART_3_FAILED', { error: r3.error });
			return { ok: false, error: `${DEMO_ERROR.PART_3_FAILED}: ${r3.error}` };
		}

		const part1 = r1.html;
		const part2 = r2.html;
		const part3 = r3.html;
		const stitched = part1 + '\n' + part2 + '\n' + part3;
		return { ok: true, html: stitched, parts: [part1, part2, part3] };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('claudeGenerateDemoHtml', 'UNCAUGHT', {
			error: msg,
			stack: e instanceof Error ? e.stack : undefined
		});
		return { ok: false, error: msg };
	}
}
