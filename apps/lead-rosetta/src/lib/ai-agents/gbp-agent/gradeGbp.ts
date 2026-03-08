/**
 * GBP agent: grades a business's Google Business Profile using AI.
 * Input: GBP data (from Places API) + optional prospect context.
 * Output: score (0–100), label, optional reasoning for the audit.
 */

import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import { getResolvedContent } from '$lib/server/agentContent';
import { callGemini } from '$lib/ai-agents/shared/gemini';
import { parseJsonFromResponse } from '$lib/ai-agents/shared/parseJson';
import type { AgentResult } from '$lib/ai-agents/shared/types';
import type { GbpGradeOutput } from './types';
import { serverError, serverInfo } from '$lib/server/logger';

/** Require one line (no newlines) so the full JSON is less likely to be truncated. */
const GBP_GRADE_JSON_SCHEMA = `Output exactly one line of JSON with no newlines. Keys: "score" (0-100 number), "label" (string: "Strong", "Good", "Needs work", or "Incomplete"), "reasoning" (one short sentence). Example: {"score":70,"label":"Good","reasoning":"Claimed with hours and website."}`;

/** Default grading prompt template. Use {{context}} where the GBP summary is injected. */
export const DEFAULT_GBP_GRADE_PROMPT = `Grade this Google Business Profile (0-100, one label). Reply with exactly one line of JSON, no newlines.

Summary:
{{context}}

${GBP_GRADE_JSON_SCHEMA}`;

function isGbpGradeOutput(value: unknown): value is GbpGradeOutput {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	const score = o.score;
	const label = o.label;
	return (
		typeof score === 'number' &&
		score >= 0 &&
		score <= 100 &&
		typeof label === 'string' &&
		label.trim().length > 0 &&
		(o.reasoning === undefined || o.reasoning === null || typeof o.reasoning === 'string')
	);
}

/** Extract a 0-100 score from truncated JSON (e.g. '{"score": 40' or '{\n  "score": 20,') so we can return a usable grade. */
function trySalvageTruncatedGrade(raw: string): GbpGradeOutput | null {
	const m = raw.match(/"score"\s*:\s*(-?\d+)/);
	if (!m) return null;
	const score = Math.min(100, Math.max(0, parseInt(m[1], 10)));
	return {
		score,
		label: 'Needs work',
		reasoning: 'Partial response (truncated).'
	};
}

/**
 * Summarize GBP data for grading so the grader gets a consistent, concise input.
 * Returns a short paragraph; on failure returns the raw context so grading can proceed.
 */
async function summarizeGbpForGrading(rawContext: string): Promise<string> {
	const summarizePrompt = `Summarize this Google Business Profile for grading. Include: business name and category, whether they have address/phone/website, if the listing is claimed, if hours and reviews are present, and any notable gaps. Output a single short paragraph (2-4 sentences). No bullet points.

Profile:
${rawContext}`;

	const result = await callGemini({
		prompt: summarizePrompt,
		maxOutputTokens: 1024,
		temperature: 0.2,
		timeoutMs: 10000
	});

	if (!result.ok || !result.text?.trim()) {
		return rawContext;
	}
	return result.text.trim();
}

/**
 * Grade a business's GBP using AI. Returns score, label, and optional reasoning.
 * Uses a summarize-then-grade flow: summarize GBP first, then grade from the summary for clearer, more consistent output.
 * Use the result to set gbpCompletenessScore and gbpCompletenessLabel in the audit.
 */
export async function gradeGbp(gbp: GbpData, prospect?: Prospect): Promise<AgentResult<GbpGradeOutput>> {
	const rawContext = [
		`Business: ${gbp.name}, category: ${gbp.industry || 'Professional'}`,
		`Address: ${gbp.address || 'none'}`,
		`Phone: ${gbp.phone || 'none'}`,
		`Website: ${gbp.website ? 'yes' : 'no'}`,
		`Claimed: ${gbp.isClaimed}`,
		`Hours: ${gbp.workHours ? 'listed' : 'missing'}`,
		`Reviews: ${gbp.ratingCount}, rating: ${gbp.ratingValue ?? 'n/a'}`
	].join('\n');

	const context = await summarizeGbpForGrading(rawContext);

	const resolved = await getResolvedContent(
		'gbp',
		'prompt',
		'grade_prompt',
		DEFAULT_GBP_GRADE_PROMPT
	);
	const basePrompt = resolved.body.replace(/\{\{context\}\}/g, context);

	const TRUNCATED_MSG = 'Response truncated (incomplete JSON); try again';

	/** Stricter prompt for retry: force single-line to avoid truncation. */
	const retryPrompt = `Same task. Reply with ONLY one line of JSON, no newlines, no spaces. Format: {"score":<0-100>,"label":"<Strong|Good|Needs work|Incomplete>","reasoning":"<one sentence>"}

Summary:
${context}`;

	/** Fallback when all attempts return truncated JSON so the pipeline still gets a grade. */
	const FALLBACK_GRADE: GbpGradeOutput = {
		score: 50,
		label: 'Needs work',
		reasoning: 'Grade unavailable (response truncated).'
	};

	let lastTruncatedRaw: string | undefined;

	async function tryGrade(useRetryPrompt: boolean): Promise<AgentResult<GbpGradeOutput>> {
		const result = await callGemini({
			prompt: useRetryPrompt ? retryPrompt : basePrompt,
			maxOutputTokens: 2048,
			temperature: 0.2,
			responseMimeType: 'application/json',
			timeoutMs: 15000
		});

		if (!result.ok) {
			serverError('gbpAgent.gradeGbp', result.error);
			return { ok: false, error: result.error };
		}

		if (result.finishReason && result.finishReason !== 'STOP') {
			serverInfo('gbpAgent.gradeGbp', 'Gemini finishReason', { finishReason: result.finishReason });
		}

		const parsed = parseJsonFromResponse(result.text);
		if (!parsed.ok) {
			if (parsed.error === TRUNCATED_MSG) lastTruncatedRaw = result.text;
			serverError('gbpAgent.gradeGbp', parsed.error, { raw: result.text.slice(0, 300) });
			return { ok: false, error: parsed.error };
		}

		if (!isGbpGradeOutput(parsed.data)) {
			serverError('gbpAgent.gradeGbp', 'Response did not match GbpGradeOutput shape', {
				raw: result.text.slice(0, 300)
			});
			return { ok: false, error: 'Invalid grade shape from Gemini' };
		}

		return { ok: true, data: parsed.data };
	}

	let last = await tryGrade(false);
	if (last.ok) return last;
	if (last.error !== TRUNCATED_MSG) return last;

	// Retry with stricter one-line-only prompt, then once more
	for (let attempt = 0; attempt < 2; attempt++) {
		last = await tryGrade(true);
		if (last.ok) return last;
		if (last.error !== TRUNCATED_MSG) return last;
	}

	// Last resort: salvage score from last truncated raw so pipeline continues
	const salvaged = trySalvageTruncatedGrade(lastTruncatedRaw ?? '');
	if (salvaged) {
		serverError('gbpAgent.gradeGbp', 'All attempts truncated; using salvaged score', {
			score: salvaged.score
		});
		return { ok: true, data: salvaged };
	}
	serverError('gbpAgent.gradeGbp', 'All attempts truncated; using fallback grade', {
		error: last.error
	});
	return { ok: true, data: FALLBACK_GRADE };
}
