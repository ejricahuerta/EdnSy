/**
 * Extract and parse JSON from AI model responses (e.g. Gemini).
 * Handles markdown code blocks, trailing commas, braces inside string values, and surrounding text.
 * Used by both GBP agent and website agent.
 */

/**
 * Skip past a string literal starting at i (handles " and ' and escapes). Returns index after the closing quote.
 */
function skipString(raw: string, i: number): number {
	const quote = raw[i];
	if (quote !== '"' && quote !== "'") return i;
	i++;
	while (i < raw.length) {
		if (raw[i] === '\\') {
			i += 2;
			continue;
		}
		if (raw[i] === quote) {
			return i + 1;
		}
		i++;
	}
	return raw.length;
}

export type ParseJsonResult =
	| { ok: true; data: unknown }
	| { ok: false; error: string };

/**
 * Extract and parse JSON from a model response. Handles markdown code blocks,
 * trailing commas, braces inside string values (single or double quoted), and surrounding text.
 */
export function parseJsonFromResponse(text: string): ParseJsonResult {
	let raw = text
		.replace(/^```(?:json)?\s*/i, '')
		.replace(/\s*```\s*$/i, '')
		.trim();

	const firstBrace = raw.indexOf('{');
	if (firstBrace === -1) {
		return { ok: false, error: 'No JSON object in response' };
	}

	let depth = 0;
	let end = -1;
	let i = firstBrace;
	while (i < raw.length) {
		const c = raw[i];
		if (c === '"' || c === "'") {
			i = skipString(raw, i);
			continue;
		}
		if (c === '{') {
			depth++;
			i++;
			continue;
		}
		if (c === '}') {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
			i++;
			continue;
		}
		i++;
	}

	if (end === -1) {
		const lastBrace = raw.lastIndexOf('}');
		if (lastBrace !== -1 && lastBrace > firstBrace) {
			const slice = raw.slice(firstBrace, lastBrace + 1).replace(/,(\s*[}\]])/g, '$1');
			try {
				const data = JSON.parse(slice);
				return { ok: true, data };
			} catch {
				// ignore
			}
		}
		if (lastBrace === -1) {
			return { ok: false, error: 'Response truncated (incomplete JSON); try again' };
		}
		return { ok: false, error: 'Unbalanced braces in response' };
	}
	raw = raw.slice(firstBrace, end + 1);
	raw = raw.replace(/,(\s*[}\]])/g, '$1');

	try {
		const data = JSON.parse(raw);
		return { ok: true, data };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return { ok: false, error: `Invalid JSON: ${msg}` };
	}
}
