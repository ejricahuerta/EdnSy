import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { getResolvedContent } from '$lib/server/agentContent';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/** AI-generated subject and body intro in "Prospects Receive" style: cheeky, fun, not too serious. */
export type EmailCopy = { subject: string; bodyIntro: string };
export type GenerateEmailCopyResult = {
	copy: EmailCopy | null;
	promptSource: 'override' | 'default';
	error?: string;
};

const EMAIL_COPY_JSON_SCHEMA_INLINE = `
Return ONLY a single JSON object (no markdown, no explanation) with these exact keys:
{
  "subject": "string (one short line, friendly subject line for the email)",
  "bodyIntro": "string (exactly 3 parts, plain text, separated by double newlines. Part 1: Greeting only, e.g. 'Hey [Name],' or 'Hey there,' (use company name if no first name). Part 2: One short paragraph: we built a free demo site for [company] using their Google listing — their services, their location, their reviews. Part 3: One short paragraph: we also added an AI agent that handles inquiries and books consultations automatically. Do NOT include the demo link, 'Take a look...', or signature; we add those. Use the business/company name naturally.)"
}`.trim();

/** Default prompt template for email copy. Use {{company}}, {{industry}}, {{senderName}}. */
export const DEFAULT_EMAIL_COPY_PROMPT = `You are writing a short cold outreach email for Lead Rosetta. The sender has already built a personalized demo website for this prospect using their Google Business Profile. Your job is to write a subject line and the body intro only. Tone: friendly, clear, confident. Not corporate.

Required structure for bodyIntro (3 parts, separate with double newlines):
1. Greeting: "Hey [Name]," or "Hey there," — use the company name if you don't have a first name (e.g. "Hey," or "Hi,").
2. One short paragraph: We built a free demo site for [company] using their Google listing — their services, their location, their reviews. Keep it natural and specific to the business.
3. One short paragraph: We also added an AI agent that handles inquiries and books consultations automatically.

Example flow (adapt to company/industry):
Hey [Name],
We built a free demo site for [Company] using your Google listing — your services, your location, your reviews.
Also added an AI agent that handles inquiries and books consultations automatically.

Context:
- Business/company name: {{company}}
- Industry: {{industry}}
- Sender name (used in signature by us): {{senderName}}

Rules:
- subject: One short line. Friendly, clear, can mention demo or free site.
- bodyIntro: Exactly the 3 parts above. No demo link, no "Take a look...", no signature — we add those. Use the business/company name naturally.

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

/** Accept common field variants Gemini may return for body intro content. */
function normalizeEmailCopyShape(input: unknown): { subject?: string; bodyIntro?: string } {
	if (typeof input !== 'object' || input === null) return {};
	const obj = input as Record<string, unknown>;
	const subjectCandidates: unknown[] = [
		obj.subject,
		obj.subject_line,
		obj.subjectLine,
		obj.title,
		obj.headline
	];
	const subject = subjectCandidates.find((v) => typeof v === 'string') as string | undefined;
	const bodyIntroCandidates: unknown[] = [
		obj.bodyIntro,
		obj.body_intro,
		obj.body,
		obj.intro,
		obj.message,
		obj.emailBody,
		obj.email_body,
		obj.copy
	];
	let bodyIntro = bodyIntroCandidates.find((v) => typeof v === 'string') as string | undefined;
	if (!bodyIntro) {
		const paragraphs = obj.paragraphs;
		if (Array.isArray(paragraphs)) {
			const textParts = paragraphs.filter((p) => typeof p === 'string') as string[];
			if (textParts.length > 0) bodyIntro = textParts.join('\n\n');
		}
	}
	if (!subject || !bodyIntro) {
		const nestedCandidates = [obj.data, obj.result, obj.output, obj.email, obj.response];
		for (const candidate of nestedCandidates) {
			const nested = normalizeEmailCopyShape(candidate);
			if (!bodyIntro && nested.bodyIntro) bodyIntro = nested.bodyIntro;
			if (!subject && nested.subject) {
				return { subject: nested.subject, bodyIntro };
			}
		}
	}
	return { subject, bodyIntro };
}

function parsePlainTextEmailCopy(text: string): { subject?: string; bodyIntro?: string } {
	const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
	if (!cleaned) return {};
	const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return {};
	const subjectLine = lines.find((line) => /^subject\s*:/i.test(line));
	let subject = subjectLine?.replace(/^subject\s*:/i, '').trim();
	let bodyLines = lines;
	if (subjectLine) {
		const idx = lines.indexOf(subjectLine);
		bodyLines = lines.slice(0, idx).concat(lines.slice(idx + 1));
	}
	const bodyIntro = bodyLines.join('\n');
	if (!subject && bodyIntro) subject = lines[0].slice(0, 90);
	return { subject, bodyIntro: bodyIntro || undefined };
}

function sanitizeSubject(raw: string): string {
	let s = raw.replace(/\r/g, '').trim();
	// Subject must be one line; keep only first non-empty line.
	s = s.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
	// Strip common leaked tokens and markdown noise.
	s = s.replace(/^subject\s*:\s*/i, '').replace(/^["']|["']$/g, '').trim();
	// If still obviously a body/CTA artifact, reject.
	const lower = s.toLowerCase();
	if (
		!s ||
		lower.includes('view your demo') ||
		lower.includes('take a look') ||
		lower.includes('ednsy.com') ||
		lower.includes('http://') ||
		lower.includes('https://')
	) {
		return '';
	}
	return s.slice(0, 110).trim();
}

function sanitizeBodyIntro(raw: string): string {
	let text = raw.replace(/\r/g, '').trim();
	// Remove CTA/signature/footer fragments that must be appended by send.ts only.
	const bannedLine = /(view your demo|take a look and let us know|ednsy\.com|^-\s|http:\/\/|https:\/\/)/i;
	const kept = text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !bannedLine.test(line));
	text = kept.join('\n');
	// Normalize excessive blank lines.
	text = text.replace(/\n{3,}/g, '\n\n').trim();
	return text;
}

function looksLikeBrokenModelOutput(subject: string, bodyIntro: string): boolean {
	const combined = `${subject}\n${bodyIntro}`.toLowerCase();
	// Reject obvious JSON fragments or leaked schema/output wrappers.
	if (
		combined.includes('"subject"') ||
		combined.includes('"bodyintro"') ||
		combined.includes('"body_intro"') ||
		combined.includes('return only a single json object')
	) {
		return true;
	}
	// Reject braces-heavy fragments that usually indicate partial JSON.
	const braceCount = (combined.match(/[{}]/g) ?? []).length;
	if (braceCount >= 2) return true;
	return false;
}

function buildDeterministicBodyIntro(company: string): string {
	return [
		`Hey ${company},`,
		`We built a free demo site for ${company} using your Google listing — your services, your location, and your reviews.`,
		`We also added an AI agent that handles inquiries and books consultations automatically.`
	].join('\n\n');
}

/**
 * Generate subject line and email body intro for a prospect. Structure: greeting, demo-from-Google
 * message, AI-agent message. CTA link, closing line, and signature are added in send.ts.
 * Returns null if Gemini is not configured or the request fails.
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
		let { subject, bodyIntro } = normalizeEmailCopyShape(parsed);
		if (!subject || !bodyIntro) {
			const plainTextParsed = parsePlainTextEmailCopy(text);
			if (!subject && plainTextParsed.subject) subject = plainTextParsed.subject;
			if (!bodyIntro && plainTextParsed.bodyIntro) bodyIntro = plainTextParsed.bodyIntro;
		}
		if (typeof subject !== 'string' || typeof bodyIntro !== 'string') {
			return { copy: null, promptSource: resolved.source, error: 'Gemini response missed subject or bodyIntro' };
		}
		const cleanSubject = sanitizeSubject(subject);
		const cleanBodyIntro = sanitizeBodyIntro(bodyIntro);
		if (!cleanBodyIntro) {
			return { copy: null, promptSource: resolved.source, error: 'Gemini response had empty fields' };
		}
		const finalSubject = cleanSubject || `I built something for ${company}`;
		let finalBodyIntro = cleanBodyIntro;
		if (looksLikeBrokenModelOutput(finalSubject, finalBodyIntro)) {
			finalBodyIntro = buildDeterministicBodyIntro(company);
		}

		return {
			copy: { subject: finalSubject, bodyIntro: finalBodyIntro },
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
