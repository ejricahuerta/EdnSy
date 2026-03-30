/**
 * Infer landing page tone (luxury, rugged, soft-calm, etc.) using Gemini.
 * Used to select which template/theme to apply and to guide copy and image style.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import {
	TONE_LABELS,
	TONE_SLUGS,
	toneLabelToSlug,
	DEFAULT_TONE,
	type ToneSlug
} from '$lib/tones';
import { getResolvedContent } from '$lib/server/agentContent';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

/** Labels list for the prompt (exactly as Gemini must return). */
const LABELS_LIST = TONE_SLUGS.map((slug) => TONE_LABELS[slug]).join(', ');

/** Default prompt template; {{context}} is replaced with business context. */
export const DEFAULT_TONE_PROMPT_TEMPLATE = `We create landing pages with different visual and copy tones. Choose the single best tone for this business.

Tones (reply with exactly one label, exactly as written):
${LABELS_LIST}

Guidance:
- Luxury: high-end services (spas, premium real estate, fine dining, boutique).
- Rugged: construction, trades, home services (plumbing, locksmith, HVAC, electrician, roofing, mechanic, pest control, moving), outdoor, durable goods, blue-collar. Use Rugged for any trade or tradesperson.
- Soft & calm: wellness, healthcare, counselling, yoga, family care.
- Professional: legal, finance, consulting, B2B, corporate.
- Friendly: local retail, cafes, salons, community-focused.
- Minimal: tech, modern agencies, clean and simple brands.

Your task: reply with exactly one line containing only one of the tone labels above. No other text.

{{context}}

Reply with exactly one label.`;

/**
 * Infer the best tone for this business's landing page using Gemini.
 * Returns a ToneSlug so we can pick template and theme. Uses DEFAULT_TONE on failure.
 */
export async function inferToneWithGemini(
	prospect: Prospect,
	gbpRaw?: GbpData | null
): Promise<ToneSlug> {
	if (!GEMINI_API_KEY) return DEFAULT_TONE;

	const name = (prospect.companyName ?? '').trim() || 'Unknown';
	const industry = prospect.industry ?? gbpRaw?.industry ?? '';
	const website = prospect.website ?? gbpRaw?.website ?? '';
	const description = (gbpRaw as { description?: string } | undefined)?.description ?? '';

	const context = [
		`Business name: ${name}`,
		industry ? `Industry/category: ${industry}` : null,
		website ? `Website: ${website}` : null,
		description ? `Business description: ${description.slice(0, 300)}` : null
	]
		.filter(Boolean)
		.join('\n');

	const resolved = await getResolvedContent(
		'design',
		'prompt',
		'tone_selection',
		DEFAULT_TONE_PROMPT_TEMPLATE
	);
	const prompt = resolved.body.replace(/\{\{context\}\}/g, context);

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: {
					maxOutputTokens: 32,
					temperature: 0.2
				}
			}),
			signal: AbortSignal.timeout(10000)
		});

		if (!res.ok) return DEFAULT_TONE;

		const data = (await res.json()) as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};
		const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (!raw) return DEFAULT_TONE;

		const label = raw.replace(/\s*\.\s*$/, '').trim();
		return toneLabelToSlug(label);
	} catch {
		return DEFAULT_TONE;
	}
}
