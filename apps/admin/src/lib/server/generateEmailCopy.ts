import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import {
	getResolvedContent,
	EMAIL_AI_AGENT_ID,
	EMAIL_AI_COPY_PROMPT_KEY
} from '$lib/server/agentContent';
import { serverError, serverInfo } from '$lib/server/logger';
import { getScrapedDataForProspectForUser } from '$lib/server/supabase';
import { auditFromScrapedData, type DemoAudit } from '$lib/types/demo';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Optional AI-written opening (greeting + hook) for the upgrade-pitch email template in send.ts.
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
  "openingHook": "string, plain text only. Start with a brief natural greeting (e.g. Hi, Hey, Hello, optionally with a name if you can infer one from {{company}}). Then one or two short sentences (max ~45 words total including the greeting). Casual, human tone, like a colleague, not sales copy. Reference {{company}} by name once outside the greeting if it fits. Ground it in their industry ({{industry}}): a believable observation (e.g. after-hours calls, mobile booking, local search, front-desk load), not a generic audit. When prospect insight below is available (not all 'not on file'), weave one or two specific weaknesses from that insight naturally; do not quote numbers or list bullets. No bullets, no links, no signature, no markdown, no product names (Voice AI, SEO Core, etc.). Do NOT use phrases like: performance gaps, high-performance, tech stack, bounce rates, integrated upgrades. Avoid the exact phrase 'Hi there,'. Do not use em dashes (U+2014) or en dashes (U+2013); use commas or periods."
}`.trim();

/** Default prompt for subject line + opening lines before the fixed demo-email template in send.ts. Placeholders: {{company}}, {{industry}}, {{senderName}}, {{gbp_score_line}}, {{gbp_interpretation}}, {{website_critique}}. */
export const DEFAULT_EMAIL_COPY_PROMPT = `You write two things for a short cold email: a subject line and the opening lines of the body. A fixed template after your opening will mention a link and a soft ask. The openingHook must include the greeting and your hook in one flow (no separate fixed salutation is added for you).

Context:
- Business/company name: {{company}}
- Industry: {{industry}}
- Sender (do not mention by name): {{senderName}}

Prospect insight (auto-filled from audit data when available):
- GBP completeness: {{gbp_score_line}}
- GBP context: {{gbp_interpretation}}
- Website critique: {{website_critique}}

If the insight above is available (not all three lines are exactly "not on file"): weave one or two specific weaknesses naturally into the openingHook as the concrete pain point you can solve. Do not quote the score number in the email. Do not list weaknesses as bullets.
If every insight line is "not on file": ignore the insight block entirely and rely on industry context alone. Do not invent scores or site problems.

Style (both fields): Do not use em dashes (—) or en dashes (–). Use commas, periods, or "and". Em dashes read as AI-generated to many readers.

subjectLine rules:
- Max 9 words. Lead with curiosity, a specific moment, or something tied to {{industry}}, not only the business name.
- Do NOT start with: "idea for", "thought about", "something for", "quick idea for", "note for", "a note for" (reads as empty and AI-ish).
- Keep filler words lowercase; business name in Title Case exactly as above ({{company}}).
- Must include recognizable words from the company name (not a single industry word like "dental" alone). Sound like a personal note.
- Strong patterns: "{{company}} and the booking flow", "after-hours piece, {{company}}", "first scroll on {{company}}'s site", "worth a peek, {{company}}", "{{industry}} visibility, {{company}}".
- Banned words in subject: prototype, upgrade, demo, redesign, mockup, audit, proposal, performance, solutions.

openingHook rules:
- Start with a short greeting, then your hook: two or three short sentences total, max ~45 words, plain text.
- Sound specific to this business and industry, not templated. Prefer concrete situations local businesses in this industry care about (missed calls, booking friction, mobile, visibility). Avoid vague "I noticed your site" with no substance.
- Tone: warm, brief, conversational. Not corporate, not consultative, not a feature list.
- Avoid the stale phrase "Hi there,"; vary the greeting (Hi, Hey, Hello, or a name if natural from {{company}}).
- Forbidden: bullets, URLs, signatures, markdown, emoji, and buzzwords like "performance gaps", "high-performance", "leverage", "cutting-edge", "solutions".
- Do not write metadata lines (no "title:", "subject:", "subject line:", or any key: value lines). openingHook is exactly what appears at the top of the email body before the fixed template lines.
- Do not describe the prototype, link, or "interactive draft" in openingHook; the template adds that in the next sentence.

${EMAIL_COPY_JSON_SCHEMA_INLINE}`;

const WEBSITE_CRITIQUE_MAX_LEN = 250;

/**
 * Derive strings for email prompt placeholders from stored DemoAudit (demo_tracking.scraped_data).
 */
function buildEmailCopyContext(audit: DemoAudit | null): {
	gbpScoreLine: string;
	gbpInterpretation: string;
	websiteCritique: string;
} {
	const score = audit?.gbpCompletenessScore;
	const gbpScoreLine = score != null ? `${score}/100` : 'not on file';

	const label = (audit?.gbpCompletenessLabel ?? '').trim();
	let gbpInterpretation = 'not on file';
	if (score != null) {
		const tier =
			score < 40
				? 'Profile is significantly incomplete, so local discovery and trust signals are weak.'
				: score < 70
					? 'Profile has gaps that reduce local search visibility.'
					: 'Profile is reasonably complete; minor gaps may still affect lead flow.';
		gbpInterpretation = label ? `${label}. ${tier}` : tier;
	}

	const insight = audit?.insight;
	let websiteCritique = 'not on file';
	if (insight?.summary || insight?.recommendations?.length) {
		const parts: string[] = [];
		if (typeof insight.summary === 'string' && insight.summary.trim()) {
			parts.push(insight.summary.trim());
		}
		const recs = (insight.recommendations ?? [])
			.slice(0, 2)
			.map((r) => (typeof r === 'string' ? r.trim() : ''))
			.filter(Boolean);
		if (recs.length) parts.push(recs.join('. '));
		const ws = insight.website;
		if (ws && typeof ws === 'object') {
			const grades = [
				ws.seo && `SEO: ${ws.seo}`,
				ws.ux && `UX: ${ws.ux}`,
				ws.ui && `UI: ${ws.ui}`,
				ws.benchmark && `Site: ${ws.benchmark}`
			].filter(Boolean) as string[];
			if (grades.length) parts.push(grades.join(', '));
		}
		const full = parts.join(' ');
		websiteCritique =
			full.length > WEBSITE_CRITIQUE_MAX_LEN
				? `${full.slice(0, WEBSITE_CRITIQUE_MAX_LEN - 3)}...`
				: full;
	}

	return { gbpScoreLine, gbpInterpretation, websiteCritique };
}

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
 * When JSON is truncated or malformed, try to pull subject / body fields with regex.
 */
function extractEmailCopyFieldsLoose(raw: string): { openingHook?: string; subjectLine?: string } {
	const out: { openingHook?: string; subjectLine?: string } = {};
	const pickOpeningKey = (jsonKey: string): string | undefined => {
		const re = new RegExp(`"${jsonKey}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 's');
		const m = raw.match(re);
		if (!m?.[1]) return undefined;
		const unescaped = m[1]
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\"/g, '"')
			.replace(/\\\\/g, '\\');
		const t = unescaped.trim();
		return t || undefined;
	};
	const pickSubject = (jsonKey: string) => {
		if (out.subjectLine) return;
		const re = new RegExp(`"${jsonKey}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 's');
		const m = raw.match(re);
		if (!m?.[1]) return;
		const unescaped = m[1]
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\"/g, '"')
			.replace(/\\\\/g, '\\');
		const t = unescaped.trim();
		if (t) out.subjectLine = t;
	};
	pickSubject('subjectLine');
	pickSubject('subject');
	/** Prefer bodyIntro (long-form prompts) over openingHook when both appear in broken JSON. */
	const hookFromBodyIntro = pickOpeningKey('bodyIntro') ?? pickOpeningKey('body_intro');
	const hookFromOpening = pickOpeningKey('openingHook');
	if (hookFromBodyIntro) out.openingHook = hookFromBodyIntro;
	else if (hookFromOpening) out.openingHook = hookFromOpening;
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
		obj.bodyIntro,
		obj.body_intro,
		obj.personalizedOpener,
		obj.personalized_opener,
		obj.openingHook,
		obj.opening_hook,
		obj.hook,
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
	/** Allow audit, demo, prototype, etc.; custom Email AI prompts need those words. */
	const spammy = /\b(performance gaps|high-performance)\b/i;
	if (spammy.test(text)) return '';
	if (/[{}]/.test(text)) return '';
	if (/^(title|subject)\s*:/i.test(text)) return '';
	text = text.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,+/g, ',').trim();
	return text.toLowerCase();
}

const METADATA_LINE =
	/^(title|subject|subject\s*line|email\s*subject|headline)\s*:\s*/i;

const URL_IN_BODY = /https?:\/\/[^\s]+/gi;

function sanitizeOpeningHook(raw: string): string {
	let text = raw.replace(/\r/g, '').trim();
	if (/^\s*[\[{]/.test(text) || /"subjectLine"\s*:/i.test(text)) return '';
	/** Paragraphs (double newline); strip URLs instead of dropping whole blocks (critique context often has https). */
	const blocks = text
		.split(/\n\s*\n/)
		.map((b) => b.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '))
		.filter(Boolean);
	/** Match spammy CTAs; do not match bare "https" (handled by stripping URLs). */
	const bannedBlock =
		/(view your demo|view the \S+ upgrade|take a look at (the|your) (demo|draft|link|prototype)|ednsy\.com|^-\s|performance gaps|high-performance|tech stack|bounce rates)/i;
	const kept = blocks
		.map((b) => b.replace(URL_IN_BODY, '').trim())
		.filter((b) => b.length > 0 && !bannedBlock.test(b) && !METADATA_LINE.test(b));
	text = kept
		.join('\n\n')
		.replace(/\s*[—–]\s*/g, ', ')
		.replace(/,\s*,+/g, ',')
		.trim();
	const maxLen = 12000;
	if (text.length > maxLen) text = text.slice(0, maxLen).trim();
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
	return false;
}

/**
 * Optional AI opening (greeting + hook) for the upgrade-pitch template. Returns copy: null on hard failure;
 * copy: {} when generation succeeded but the hook is omitted or stripped (use default opening in send.ts).
 */
export async function generateEmailCopy(
	prospect: Prospect,
	senderName: string,
	userId: string
): Promise<GenerateEmailCopyResult> {
	const company = prospect.companyName || 'the business';
	const industry = prospect.industry || 'your business';

	const scraped = await getScrapedDataForProspectForUser(userId, prospect.id);
	const audit = auditFromScrapedData(scraped);
	const { gbpScoreLine, gbpInterpretation, websiteCritique } = buildEmailCopyContext(audit);

	/** Same row as Dashboard → Agents → Email AI Agent → Email copy prompt (`agent_content_versions`). */
	const resolved = await getResolvedContent(
		EMAIL_AI_AGENT_ID,
		'prompt',
		EMAIL_AI_COPY_PROMPT_KEY,
		DEFAULT_EMAIL_COPY_PROMPT
	);

	if (!GEMINI_API_KEY) {
		return {
			copy: null,
			promptSource: resolved.source,
			error: 'GEMINI_API_KEY is not configured'
		};
	}

	const prompt = resolved.body
		.replace(/\{\{company\}\}/g, company)
		.replace(/\{\{industry\}\}/g, industry)
		.replace(/\{\{senderName\}\}/g, senderName)
		.replace(/\{\{gbp_score_line\}\}/g, gbpScoreLine)
		.replace(/\{\{gbp_interpretation\}\}/g, gbpInterpretation)
		.replace(/\{\{website_critique\}\}/g, websiteCritique);

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					/**
					 * Long multi-paragraph bodyIntro + JSON wrapper needs a high ceiling. 2048 often
					 * hits MAX_TOKENS mid-string (looks like random truncation, e.g. "your 90" with no "/100").
					 */
					maxOutputTokens: 8192,
					temperature: 0.7,
					responseMimeType: 'application/json'
				}
			}),
			/** Long prompts + 2k tokens often exceed 10s; avoid spurious TimeoutError on preview / draft. */
			signal: AbortSignal.timeout(60_000)
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

		if (finishReason === 'MAX_TOKENS') {
			serverInfo('generateEmailCopy', 'Gemini MAX_TOKENS; email body may be cut off mid-sentence', {
				bodyIntroChars: clean.length
			});
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
