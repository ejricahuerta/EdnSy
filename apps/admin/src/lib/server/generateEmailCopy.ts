import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { getResolvedContent } from '$lib/server/agentContent';
import { serverError, serverInfo } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Optional AI-written opening paragraph for the fixed upgrade-pitch email template in send.ts.
 * Subject line and the rest of the body are assembled server-side.
 */
export type EmailCopy = { openingHook?: string; bodyIntro?: string; subjectLine?: string };
export type GenerateEmailCopyResult = {
	/** null = generation failed (e.g. API/parse error). Empty object = use template default opening. */
	copy: EmailCopy | null;
	promptSource: 'override' | 'default';
	error?: string;
};

const EMAIL_COPY_JSON_SCHEMA_INLINE = `
Return ONLY a single JSON object (no markdown, no explanation) with these keys:
{
  "subjectLine": "string, max 9 words, no quotes. Add a hook beyond the company name: tie to {{industry}}, a moment (after hours, first scroll, mobile), or a light question. Use lowercase except Title Case for the business name as given. Do NOT start with: idea for, thought about, something for, quick idea for, note for (those read as lazy). Include the company name or its main distinct words (never one generic industry word alone). Good examples: 'after-hours calls, Riverdale Dental', 'Riverdale Dental and the booking flow', 'first scroll on Riverdale Dental's site', 'worth a peek, Riverdale Dental'. Never use: prototype, upgrade, demo, redesign, mockup, audit, proposal, performance, solutions. No em dash (U+2014).",
  "openingHook": "string, plain text only. One or two short sentences (max ~40 words total). Casual, human tone, like a colleague, not sales copy. Reference {{company}} by name once. Ground it in their industry ({{industry}}): a believable observation (e.g. after-hours calls, mobile booking, local search, front-desk load), not a generic audit. No greeting, no bullets, no links, no signature, no markdown, no product names (Voice AI, SEO Core, etc.). Do NOT use phrases like: performance gaps, high-performance, tech stack, bounce rates, integrated upgrades. Do not use em dashes (U+2014) or en dashes (U+2013); use commas or periods."
}`.trim();

/** Default prompt for subject line + opening lines before the fixed demo-email template in send.ts. Use {{company}}, {{industry}}, {{senderName}}. */
export const DEFAULT_EMAIL_COPY_PROMPT = `You write two things for a short cold email: a subject line and the first 1-2 sentences. A fixed template below your text will mention a link and a soft ask. The reader already gets "Hi there," from the template.

Context:
- Business/company name: {{company}}
- Industry: {{industry}}
- Sender (do not mention by name): {{senderName}}

Style (both fields): Do not use em dashes (—) or en dashes (–). Use commas, periods, or "and". Em dashes read as AI-generated to many readers.

subjectLine rules:
- Max 9 words. Lead with curiosity, a specific moment, or something tied to {{industry}}, not only the business name.
- Do NOT start with: "idea for", "thought about", "something for", "quick idea for", "note for", "a note for" (reads as empty and AI-ish).
- Keep filler words lowercase; business name in Title Case exactly as above ({{company}}).
- Must include recognizable words from the company name (not a single industry word like "dental" alone). Sound like a personal note.
- Strong patterns: "{{company}} and the booking flow", "after-hours piece, {{company}}", "first scroll on {{company}}'s site", "worth a peek, {{company}}", "{{industry}} visibility, {{company}}".
- Banned words in subject: prototype, upgrade, demo, redesign, mockup, audit, proposal, performance, solutions.

openingHook rules:
- One or two sentences, max ~40 words, plain text.
- Sound specific to this business and industry, not templated. Prefer concrete situations local businesses in this industry care about (missed calls, booking friction, mobile, visibility). Avoid vague "I noticed your site" with no substance.
- Tone: warm, brief, conversational. Not corporate, not consultative, not a feature list.
- Forbidden: Hi/Hello/Hey, bullets, URLs, signatures, markdown, emoji, and buzzwords like "performance gaps", "high-performance", "leverage", "cutting-edge", "solutions".
- Do not write metadata lines (no "title:", "subject:", "subject line:", or any key: value lines). openingHook is only the sentences that appear in the email body after "Hi there,".
- Do not describe the prototype, link, or "interactive draft" in openingHook; the template adds that in the next sentence.

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

/**
 * When JSON is truncated or malformed, try to pull subjectLine / openingHook with regex.
 */
function extractEmailCopyFieldsLoose(raw: string): { openingHook?: string; subjectLine?: string } {
	const out: { openingHook?: string; subjectLine?: string } = {};
	const pick = (key: 'subjectLine' | 'openingHook') => {
		const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 's');
		const m = raw.match(re);
		if (!m?.[1]) return;
		const unescaped = m[1]
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\"/g, '"')
			.replace(/\\\\/g, '\\');
		const t = unescaped.trim();
		if (t) out[key] = t;
	};
	pick('subjectLine');
	pick('openingHook');
	return out;
}

/** Accept common field variants Gemini may return for the opening paragraph and subject line. */
function normalizeEmailCopyShape(input: unknown): { openingHook?: string; subjectLine?: string } {
	if (typeof input !== 'object' || input === null) return {};
	const obj = input as Record<string, unknown>;

	const subjectCandidates: unknown[] = [
		obj.subjectLine,
		obj.subject_line,
		obj.subject,
		obj.emailSubject,
		obj.email_subject
	];
	const subjectLine = (subjectCandidates.find((v) => typeof v === 'string' && v.trim().length > 0) as string | undefined)?.trim();

	const hookCandidates: unknown[] = [
		obj.personalizedOpener,
		obj.personalized_opener,
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
	let openingHook = hookCandidates.find((v) => typeof v === 'string') as string | undefined;
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
			if (nested.openingHook) return { ...nested, subjectLine: subjectLine ?? nested.subjectLine };
		}
	}
	return { openingHook, subjectLine };
}

function parsePlainTextEmailCopy(text: string): { openingHook?: string } {
	const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
	if (!cleaned) return {};
	/** Whole response is JSON; never use it as prose when keys are missing. */
	if (/^\s*[\[{]/.test(cleaned)) return {};
	const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return {};
	const hookLine = lines.find((line) => /^openinghook\s*:/i.test(line));
	let openingHook = hookLine?.replace(/^openinghook\s*:/i, '').trim();
	if (!openingHook) openingHook = lines.join('\n');
	return { openingHook: openingHook || undefined };
}

function sanitizeSubjectLine(raw: string | undefined): string {
	if (!raw) return '';
	let text = raw.replace(/\r/g, '').replace(/\n/g, ' ').trim();
	text = text.replace(/^["']+|["']+$/g, '').trim();
	if (text.length > 100) text = text.slice(0, 100).trim();
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length < 2) return '';
	const banned = /\b(prototype|upgrade|demo|redesign|mockup|audit|proposal|performance|solutions)\b/i;
	if (banned.test(text)) return '';
	if (/[{}]/.test(text)) return '';
	if (/^(title|subject)\s*:/i.test(text)) return '';
	text = text.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,+/g, ',').trim();
	return text.toLowerCase();
}

const METADATA_LINE =
	/^(title|subject|subject\s*line|email\s*subject|headline)\s*:\s*/i;

function sanitizeOpeningHook(raw: string): string {
	let text = raw.replace(/\r/g, '').trim();
	if (/^\s*[\[{]/.test(text) || /"subjectLine"\s*:/i.test(text)) return '';
	const bannedLine =
		/(view your demo|view the .* upgrade|take a look|ednsy\.com|^-\s|http:\/\/|https:\/\/|performance gaps|high-performance|tech stack|bounce rates)/i;
	const kept = text
		.split('\n')
		.map((line) => line.trim())
		.filter(
			(line) =>
				line.length > 0 &&
				!bannedLine.test(line) &&
				!METADATA_LINE.test(line) &&
				!/^(hi|hey|hello)[,!\s]*$/i.test(line)
		);
	text = kept
		.join(' ')
		.replace(/\s*[—–]\s*/g, ', ')
		.replace(/,\s*,+/g, ',')
		.replace(/\s{2,}/g, ' ')
		.trim();
	if (text.length > 350) text = text.slice(0, 350).trim();
	return text;
}

function looksLikeBrokenModelOpening(opening: string): boolean {
	const combined = opening.toLowerCase();
	if (
		combined.includes('"openinghook"') ||
		combined.includes('"subjectline"') ||
		combined.includes('"bodyintro"') ||
		combined.includes('return only a single json object')
	) {
		return true;
	}
	if (/\btitle\s*:/i.test(opening) || /\bsubject\s*line\s*:/i.test(opening)) return true;
	if (/^\s*[{[]/.test(opening)) return true;
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
					/** Short JSON; 1024 avoids rare MAX_TOKENS truncation mid-object ("Unexpected end of JSON input"). */
					maxOutputTokens: 1024,
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
			candidates?: {
				content?: { parts?: { text?: string }[] };
				finishReason?: string;
			}[];
		};
		const candidate0 = data.candidates?.[0];
		const finishReason = candidate0?.finishReason;
		const text = candidate0?.content?.parts?.[0]?.text?.trim();
		if (!text) {
			serverError('generateEmailCopy', 'Gemini empty content', {
				finishReason: finishReason ?? 'unknown'
			});
			return { copy: null, promptSource: resolved.source, error: 'Gemini returned empty content' };
		}

		const raw = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
		if (!raw) {
			return { copy: null, promptSource: resolved.source, error: 'Gemini returned empty JSON text' };
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch (parseErr) {
			// Model often returns raw newlines inside JSON strings (invalid). Repair and retry.
			if (parseErr instanceof SyntaxError) {
				try {
					parsed = JSON.parse(repairJsonNewlines(raw));
				} catch (parseErr2) {
					const loose = extractEmailCopyFieldsLoose(raw);
					if (loose.subjectLine || loose.openingHook) {
						parsed = loose;
						if (finishReason && finishReason !== 'STOP') {
							serverInfo('generateEmailCopy', 'Used loose JSON extraction', {
								finishReason,
								hadSubject: !!loose.subjectLine,
								hadHook: !!loose.openingHook
							});
						}
					} else {
						serverError('generateEmailCopy', 'JSON parse failed after repair', {
							first: parseErr instanceof Error ? parseErr.message : String(parseErr),
							second: parseErr2 instanceof Error ? parseErr2.message : String(parseErr2),
							finishReason: finishReason ?? 'unknown',
							rawLen: raw.length,
							rawHead: raw.slice(0, 120)
						});
						return { copy: null, promptSource: resolved.source, error: 'Could not parse Gemini JSON response' };
					}
				}
			} else {
				throw parseErr;
			}
		}
		if (typeof parsed !== 'object' || parsed === null) {
			return { copy: null, promptSource: resolved.source, error: 'Gemini response was not a JSON object' };
		}
		const normalized = normalizeEmailCopyShape(parsed);
		let openingHook = normalized.openingHook;
		const subjectLine = sanitizeSubjectLine(normalized.subjectLine);
		if (!openingHook?.trim()) {
			const plainTextParsed = parsePlainTextEmailCopy(text);
			if (plainTextParsed.openingHook) openingHook = plainTextParsed.openingHook;
		}
		if (typeof openingHook !== 'string' || !openingHook.trim()) {
			return { copy: { subjectLine: subjectLine || undefined }, promptSource: resolved.source };
		}
		let clean = sanitizeOpeningHook(openingHook);
		if (!clean || looksLikeBrokenModelOpening(clean)) {
			return { copy: { subjectLine: subjectLine || undefined }, promptSource: resolved.source };
		}

		return {
			copy: { openingHook: clean, subjectLine: subjectLine || undefined },
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
