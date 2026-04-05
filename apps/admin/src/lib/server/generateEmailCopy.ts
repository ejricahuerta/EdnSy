import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { getResolvedContent } from '$lib/server/agentContent';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Optional AI-written opening paragraph for the fixed upgrade-pitch email template in send.ts.
 * Subject line and the rest of the body are assembled server-side.
 */
export type EmailCopy = { openingHook?: string; bodyIntro?: string };
export type GenerateEmailCopyResult = {
	/** null = generation failed (e.g. API/parse error). Empty object = use template default opening. */
	copy: EmailCopy | null;
	promptSource: 'override' | 'default';
	error?: string;
};

const EMAIL_COPY_JSON_SCHEMA_INLINE = `
Return ONLY a single JSON object (no markdown, no explanation) with this key:
{
  "openingHook": "string (one short paragraph, plain text). Describe specific performance or conversion gaps on their current site: mobile experience, lead capture, after-hours calls, or speed. Mention the business name naturally. Do NOT include a greeting (we add Hi there), bullet lists, demo link, CTA, signature, or markdown."
}`.trim();

/** Default prompt for the optional opening paragraph. Use {{company}}, {{industry}}, {{senderName}}. */
export const DEFAULT_EMAIL_COPY_PROMPT = `You help write one optional paragraph for a cold outreach email. The email uses a fixed HTML template: the sender already built a high-performance demo site for the prospect. Your only job is the openingHook: one paragraph that sounds observant and professional about gaps on their current site (mobile, lead capture, after-hours handling, speed, SEO—pick what fits {{industry}}).

Context:
- Business/company name: {{company}}
- Industry: {{industry}}
- Sender name (signature is added separately): {{senderName}}

Rules:
- openingHook: A single paragraph only. No Hi/Hello, no bullets, no link, no signature.
- Tone: confident, consultative, like the example: "I noticed a few performance gaps on the current [Company] site—specifically regarding…"

${EMAIL_COPY_JSON_SCHEMA_INLINE}`;

/**
 * Repair JSON where the model emitted raw newlines inside string values (invalid JSON).
 * Replaces unescaped newlines inside double-quoted strings with \n.
 */
function repairJsonNewlines(raw: string): string {
	let inString = false;
	let escape = false;
	let result = '';
	for (let i = 0; i < raw.length; i++) {
		const c = raw[i];
		if (escape) {
			result += c;
			escape = false;
			continue;
		}
		if (c === '\\' && inString) {
			result += c;
			escape = true;
			continue;
		}
		if (c === '"') {
			inString = !inString;
			result += c;
			continue;
		}
		if (inString && c === '\n') {
			result += '\\n';
			continue;
		}
		result += c;
	}
	// If still inside a string (unterminated), close it and the object so parse can succeed
	if (inString) result += '"}';
	return result;
}

/** Accept common field variants Gemini may return for the opening paragraph. */
function normalizeEmailCopyShape(input: unknown): { openingHook?: string } {
	if (typeof input !== 'object' || input === null) return {};
	const obj = input as Record<string, unknown>;
	const candidates: unknown[] = [
		obj.openingHook,
		obj.opening_hook,
		obj.hook,
		obj.bodyIntro,
		obj.body_intro,
		obj.body,
		obj.intro,
		obj.message,
		obj.emailBody,
		obj.email_body,
		obj.copy
	];
	let openingHook = candidates.find((v) => typeof v === 'string') as string | undefined;
	if (!openingHook) {
		const paragraphs = obj.paragraphs;
		if (Array.isArray(paragraphs)) {
			const textParts = paragraphs.filter((p) => typeof p === 'string') as string[];
			if (textParts.length > 0) openingHook = textParts.join('\n\n');
		}
	}
	if (!openingHook) {
		for (const candidate of [obj.data, obj.result, obj.output, obj.email, obj.response]) {
			const nested = normalizeEmailCopyShape(candidate);
			if (nested.openingHook) return nested;
		}
	}
	return { openingHook };
}

function parsePlainTextEmailCopy(text: string): { openingHook?: string } {
	const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
	if (!cleaned) return {};
	const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return {};
	const hookLine = lines.find((line) => /^openinghook\s*:/i.test(line));
	let openingHook = hookLine?.replace(/^openinghook\s*:/i, '').trim();
	if (!openingHook) openingHook = lines.join('\n');
	return { openingHook: openingHook || undefined };
}

function sanitizeOpeningHook(raw: string): string {
	let text = raw.replace(/\r/g, '').trim();
	const bannedLine =
		/(view your demo|view the .* upgrade|take a look|ednsy\.com|^-\s|http:\/\/|https:\/\/)/i;
	const kept = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !bannedLine.test(line) && !/^(hi|hey|hello)[,!\s]*$/i.test(line));
	text = kept.join(' ').replace(/\s{2,}/g, ' ').trim();
	if (text.length > 600) text = text.slice(0, 600).trim();
	return text;
}

function looksLikeBrokenModelOpening(opening: string): boolean {
	const combined = opening.toLowerCase();
	if (
		combined.includes('"openinghook"') ||
		combined.includes('"bodyintro"') ||
		combined.includes('return only a single json object')
	) {
		return true;
	}
	const braceCount = (combined.match(/[{}]/g) ?? []).length;
	if (braceCount >= 2) return true;
	return false;
}

/**
 * Optional AI opening paragraph for the upgrade-pitch template. Returns copy: null on hard failure;
 * copy: {} when generation succeeded but the hook is omitted or stripped (use default opening in send.ts).
 */
export async function generateEmailCopy(
	prospect: Prospect,
	senderName: string
): Promise<GenerateEmailCopyResult> {
	if (!GEMINI_API_KEY) {
		return { copy: null, promptSource: 'default', error: 'GEMINI_API_KEY is not configured' };
	}

	const company = prospect.companyName || 'the business';
	const industry = prospect.industry || 'dental';

	const resolved = await getResolvedContent(
		'email',
		'prompt',
		'email_copy_prompt',
		DEFAULT_EMAIL_COPY_PROMPT
	);
	const prompt = resolved.body
		.replace(/\{\{company\}\}/g, company)
		.replace(/\{\{industry\}\}/g, industry)
		.replace(/\{\{senderName\}\}/g, senderName);

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 512,
					temperature: 0.7,
					responseMimeType: 'application/json'
				}
			}),
			signal: AbortSignal.timeout(10000)
		});

		if (!res.ok) {
			const err = await res.text();
			serverError('generateEmailCopy', 'Gemini error', { status: res.status, body: err.slice(0, 200) });
			return { copy: null, promptSource: resolved.source, error: `Gemini API error (${res.status})` };
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return { copy: null, promptSource: resolved.source, error: 'Gemini returned empty content' };

		const raw = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch (parseErr) {
			// Model often returns raw newlines inside JSON strings (invalid). Repair and retry.
			if (parseErr instanceof SyntaxError) {
				try {
					parsed = JSON.parse(repairJsonNewlines(raw));
				} catch {
					serverError('generateEmailCopy', 'JSON parse failed after repair', {
						message: parseErr instanceof Error ? parseErr.message : String(parseErr)
					});
					return { copy: null, promptSource: resolved.source, error: 'Could not parse Gemini JSON response' };
				}
			} else {
				throw parseErr;
			}
		}
		if (typeof parsed !== 'object' || parsed === null) {
			return { copy: null, promptSource: resolved.source, error: 'Gemini response was not a JSON object' };
		}
		let { openingHook } = normalizeEmailCopyShape(parsed);
		if (!openingHook?.trim()) {
			const plainTextParsed = parsePlainTextEmailCopy(text);
			if (plainTextParsed.openingHook) openingHook = plainTextParsed.openingHook;
		}
		if (typeof openingHook !== 'string' || !openingHook.trim()) {
			return { copy: {}, promptSource: resolved.source };
		}
		let clean = sanitizeOpeningHook(openingHook);
		if (!clean || looksLikeBrokenModelOpening(clean)) {
			return { copy: {}, promptSource: resolved.source };
		}

		return {
			copy: { openingHook: clean },
			promptSource: resolved.source
		};
	} catch (e) {
		serverError('generateEmailCopy', 'uncaught', { error: e });
		return {
			copy: null,
			promptSource: resolved.source,
			error: e instanceof Error ? e.message : 'Unknown error'
		};
	}
}
