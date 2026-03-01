import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/** AI-generated subject and body intro in "Prospects Receive" style: cheeky, fun, not too serious. */
export type EmailCopy = { subject: string; bodyIntro: string };

const EMAIL_COPY_JSON_SCHEMA = `
Return ONLY a single JSON object (no markdown, no explanation) with these exact keys:
{
  "subject": "string (one short line, cheeky/fun subject line for the email)",
  "bodyIntro": "string (2-4 short paragraphs, plain text, newlines between paragraphs. Tone: friendly, cheeky, confident. Like 'Hey [Name], We built you a real site. Have a look when you get a sec. No catch.' Do not include the demo link or signature; we add those separately. Use the business/company name naturally.)"
}`.trim();

/**
 * Generate a cheeky subject line and email body intro for a prospect, in the style of the
 * landing page "What your prospect receives" (e.g. "I rebuilt your site. (You're welcome.)").
 * Returns null if Gemini is not configured or the request fails.
 */
export async function generateEmailCopy(
	prospect: Prospect,
	senderName: string
): Promise<EmailCopy | null> {
	if (!GEMINI_API_KEY) return null;

	const company = prospect.companyName || 'the business';
	const industry = prospect.industry || 'general';

	const prompt = `You are writing a short cold outreach email for Lead Rosetta. The sender has already built a personalized demo website for this prospect. Your job is to write a subject line and the opening body text only. Tone: cheeky, fun, confident, not corporate. Nothing too serious.

Reference style (from our landing page):
- Subject example: "I rebuilt your site. (You're welcome.)"
- Body example: "Hey Jann, Your old site had gambling, porn, and random pages from other builders. So we built you a real one: your services, your GTA coverage, 24/7 AI phone answering. The works. ... Have a look when you get a sec. No catch. (We might send a follow-up.)"

Context:
- Business/company name: ${company}
- Industry: ${industry}
- Sender name (sign-off): ${senderName}

Rules:
- subject: One short line only. Punchy, memorable, can be a bit cheeky or playful.
- bodyIntro: 2-4 short paragraphs. Address the prospect (use company name if no first name). Say we built something for them and invite them to look. No link, no "click here", no signature—we add those. Keep it light and human.

${EMAIL_COPY_JSON_SCHEMA}`;

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
			console.error('[generateEmailCopy] Gemini error:', res.status, err.slice(0, 200));
			return null;
		}

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!text) return null;

		const raw = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
		const parsed = JSON.parse(raw) as unknown;
		if (typeof parsed !== 'object' || parsed === null) return null;
		const { subject, bodyIntro } = parsed as { subject?: string; bodyIntro?: string };
		if (typeof subject !== 'string' || typeof bodyIntro !== 'string') return null;
		if (!subject.trim() || !bodyIntro.trim()) return null;

		return { subject: subject.trim(), bodyIntro: bodyIntro.trim() };
	} catch (e) {
		console.error('[generateEmailCopy]', e);
		return null;
	}
}
