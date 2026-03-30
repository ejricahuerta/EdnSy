/**
 * Shared Gemini API client for AI agents.
 * Single caller used by GBP agent and website agent; optional use from generateAudit/enrichWebsiteTemplateCopy later.
 */

import { env } from '$env/dynamic/private';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TIMEOUT_MS = 15000;

export type CallGeminiOptions = {
	prompt: string;
	model?: string;
	maxOutputTokens?: number;
	temperature?: number;
	responseMimeType?: 'application/json' | 'text/plain';
	timeoutMs?: number;
};

export type CallGeminiResult =
	| { ok: true; text: string; finishReason?: string }
	| { ok: false; error: string };

/**
 * Call Gemini generateContent API. Returns the first candidate's text or an error.
 */
export async function callGemini(options: CallGeminiOptions): Promise<CallGeminiResult> {
	const apiKey = (env.GEMINI_API_KEY ?? '').trim();
	if (!apiKey) {
		return { ok: false, error: 'Gemini not configured (GEMINI_API_KEY missing)' };
	}

	const {
		prompt,
		model = DEFAULT_MODEL,
		maxOutputTokens = 4096,
		temperature = 0.3,
		responseMimeType,
		timeoutMs = DEFAULT_TIMEOUT_MS
	} = options;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

	const generationConfig: Record<string, unknown> = {
		maxOutputTokens,
		temperature
	};
	if (responseMimeType) {
		generationConfig.responseMimeType = responseMimeType;
	}

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig
			}),
			signal: AbortSignal.timeout(timeoutMs)
		});

		if (!res.ok) {
			const err = await res.text();
			return { ok: false, error: `API error: ${res.status} ${err.slice(0, 150)}` };
		}

		const data = (await res.json()) as {
			candidates?: {
				content?: { parts?: { text?: string }[] };
				finishReason?: string;
				finishMessage?: string;
			}[];
		};
		const candidate = data.candidates?.[0];
		const text = candidate?.content?.parts?.[0]?.text?.trim();

		if (!text) {
			return {
				ok: false,
				error: data.candidates?.[0]?.finishMessage ?? 'Gemini returned no content'
			};
		}

		const finishReason = candidate?.finishReason;
		if (finishReason === 'MAX_TOKENS') {
			console.info('[lead-rosetta] [gemini] Response ended: MAX_TOKENS (output may be truncated)');
		}

		return { ok: true, text, finishReason };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		return { ok: false, error: err };
	}
}
