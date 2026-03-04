import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/** AI-generated subject and body intro in "Prospects Receive" style: cheeky, fun, not too serious. */
export type EmailCopy = { subject: string; bodyIntro: string };

const EMAIL_COPY_JSON_SCHEMA = `
Return ONLY a single JSON object (no markdown, no explanation) with these exact keys:
{
  "subject": "string (one short line, friendly subject line for the email)",
  "bodyIntro": "string (exactly 3 parts, plain text, separated by double newlines. Part 1: Greeting only, e.g. 'Hey [Name],' or 'Hey there,' (use company name if no first name). Part 2: One short paragraph: we built a free demo site for [company] using their Google listing — their services, their location, their reviews. Part 3: One short paragraph: we also added an AI agent that handles inquiries and books consultations automatically. Do NOT include the demo link, 'Take a look...', or signature; we add those. Use the business/company name naturally.)"
}`.trim();

/**
 * Generate subject line and email body intro for a prospect. Structure: greeting, demo-from-Google
 * message, AI-agent message. CTA link, closing line, and signature are added in send.ts.
 * Returns null if Gemini is not configured or the request fails.
 */
export async function generateEmailCopy(
	prospect: Prospect,
	senderName: string
): Promise<EmailCopy | null> {
	if (!GEMINI_API_KEY) return null;

	const company = prospect.companyName || 'the business';
	const industry = prospect.industry || 'general';

	const prompt = `You are writing a short cold outreach email for Lead Rosetta. The sender has already built a personalized demo website for this prospect using their Google Business Profile. Your job is to write a subject line and the body intro only. Tone: friendly, clear, confident. Not corporate.

Required structure for bodyIntro (3 parts, separate with double newlines):
1. Greeting: "Hey [Name]," or "Hey there," — use the company name if you don't have a first name (e.g. "Hey," or "Hi,").
2. One short paragraph: We built a free demo site for [company] using their Google listing — their services, their location, their reviews. Keep it natural and specific to the business.
3. One short paragraph: We also added an AI agent that handles inquiries and books consultations automatically.

Example flow (adapt to company/industry):
Hey [Name],
We built a free demo site for [Company] using your Google listing — your services, your location, your reviews.
Also added an AI agent that handles inquiries and books consultations automatically.

Context:
- Business/company name: ${company}
- Industry: ${industry}
- Sender name (used in signature by us): ${senderName}

Rules:
- subject: One short line. Friendly, clear, can mention demo or free site.
- bodyIntro: Exactly the 3 parts above. No demo link, no "Take a look...", no signature — we add those. Use the business/company name naturally.

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
