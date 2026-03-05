/**
 * Generate a single-file HTML demo using Claude (Anthropic).
 * Uses the landing-page.md prompt and index.json schema; output is raw HTML saved to demo-html storage and rendered in the demo page iframe.
 */

import { env } from '$env/dynamic/private';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import type { ToneSlug } from '$lib/tones';
import { industryDisplayToSlug } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { getDemoImageUrls } from '$lib/server/unsplash';
import { buildLandingPageIndexJson } from '$lib/server/buildLandingPageIndexJson';

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

export type ClaudeGenerateDemoHtmlResult =
	| { ok: true; html: string }
	| { ok: false; error: string };

/** Load the full landing-page.md prompt text (from apps/marketing/prompts/landing-page.md). */
function loadLandingPagePrompt(): string {
	const fromCwd = join(process.cwd(), 'prompts', 'landing-page.md');
	try {
		return readFileSync(fromCwd, 'utf-8');
	} catch {
		const dir = join(fileURLToPath(import.meta.url), '..', '..', '..', '..');
		const fallback = join(dir, 'prompts', 'landing-page.md');
		return readFileSync(fallback, 'utf-8');
	}
}

/** Strip markdown code block wrapper if present. */
function extractHtmlFromResponse(text: string): string {
	let out = text.trim();
	const htmlMatch = out.match(/^```(?:html)?\s*([\s\S]*?)```$/m);
	if (htmlMatch) {
		out = htmlMatch[1].trim();
	}
	// Allow any response that looks like HTML (starts with <)
	if (!out.startsWith('<')) {
		return '';
	}
	return out;
}

/**
 * Generate a single-file HTML demo via Claude. Returns raw HTML to be saved to demo-html storage.
 * Uses the landing-page.md prompt and a built index.json (from prospect + GBP + industry + tone + images).
 */
export async function generateDemoHtmlWithClaude(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug
): Promise<ClaudeGenerateDemoHtmlResult> {
	const apiKey = (env.ANTHROPIC_API_KEY ?? env.CLAUDE_API_KEY ?? '').trim();
	if (!apiKey) {
		return { ok: false, error: 'ANTHROPIC_API_KEY or CLAUDE_API_KEY not configured' };
	}

	const industrySlug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const imageUrls = await getDemoImageUrls(industrySlug, prospect.industry, {
		companyName: prospect.companyName ?? undefined
	});

	const indexJson = buildLandingPageIndexJson({
		prospect,
		gbpRaw,
		industryLabel,
		tone,
		imageUrls
	});

	const systemPrompt = loadLandingPagePrompt();
	const userPrompt = `Here is the \`index.json\` for this business. Build the single \`index.html\` file as specified in the system prompt. Use only the data below; do not invent content. Output only the complete HTML document, starting with <!DOCTYPE html>. No explanations, no markdown code fence.

\`\`\`json
${JSON.stringify(indexJson, null, 2)}
\`\`\``;

	const isRateLimitError = (err: string) => /rate limit|rate_limit|429/i.test(err);

	const callClaude = async (): Promise<ClaudeGenerateDemoHtmlResult> => {
		const res = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: ANTHROPIC_MODEL,
				// Stay under typical org limit (e.g. 8k output tokens/min); retry on 429
				max_tokens: 4096,
				system: systemPrompt,
				messages: [{ role: 'user', content: userPrompt }]
			})
		});

		const errText = await res.text();
		if (!res.ok) {
			let errMessage: string;
			try {
				const errJson = JSON.parse(errText) as { error?: { message?: string } };
				errMessage = errJson?.error?.message ?? errText;
			} catch {
				errMessage = errText || `HTTP ${res.status}`;
			}
			return { ok: false, error: errMessage };
		}

		const data = JSON.parse(errText) as {
			content?: Array<{ type: string; text?: string }>;
		};
		const block = data?.content?.find((c: { type: string }) => c.type === 'text');
		const text = block?.text ?? '';
		const html = extractHtmlFromResponse(text);
		if (!html) {
			return { ok: false, error: 'Claude did not return valid HTML' };
		}
		return { ok: true, html };
	};

	try {
		let result = await callClaude();
		// On rate limit (429), wait and retry once so we stay within 8k output tokens/min
		if (!result.ok && isRateLimitError(result.error)) {
			await new Promise((r) => setTimeout(r, 65_000));
			result = await callClaude();
		}
		return result;
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[claudeGenerateDemoHtml]', msg);
		return { ok: false, error: msg };
	}
}
