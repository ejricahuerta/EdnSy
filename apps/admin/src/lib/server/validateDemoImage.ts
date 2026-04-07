/**
 * Use Gemini vision to check if an image is appropriate for a demo landing page.
 * Works for any industry/trade; prompt is built from profile or business description.
 */

import { env } from '$env/dynamic/private';
import { INDUSTRY_LABELS, INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';

const GEMINI_API_KEY = (env.GEMINI_API_KEY ?? '').trim();
const GEMINI_MODEL = 'gemini-2.5-flash';

const MAX_IMAGE_BYTES = 300_000; // ~300KB to keep request small
const FETCH_TIMEOUT_MS = 8000;

/**
 * Fetch image from URL and return base64 (with size limit). Returns null if fetch fails or too large.
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
	try {
		const res = await fetch(url, {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			headers: { Accept: 'image/*' }
		});
		if (!res.ok) return null;
		const contentType = res.headers.get('content-type') ?? 'image/jpeg';
		const mimeType = contentType.includes('png') ? 'image/png' : 'image/jpeg';
		const buffer = await res.arrayBuffer();
		if (buffer.byteLength > MAX_IMAGE_BYTES) return null;
		const base64 = Buffer.from(buffer).toString('base64');
		return { data: base64, mimeType };
	} catch {
		return null;
	}
}

export type ImageValidationContext = {
	industrySlug: IndustrySlug;
	/** Optional: e.g. "painter", "house painting" - so we can ask "is this right for a painter?" */
	businessType?: string;
	/**
	 * Optional: human-readable business/profile description for the validation prompt.
	 * When set, used instead of industrySlug+businessType to build the prompt (all industries).
	 */
	profileDescription?: string;
};

/**
 * Build a short description for the validation prompt from profile key or context.
 */
export function getValidationPromptDescription(context: ImageValidationContext): string {
	if (context.profileDescription?.trim()) {
		return context.profileDescription.trim();
	}
	const { industrySlug } = context;
	if (INDUSTRY_SLUGS.includes(industrySlug)) {
		return `${INDUSTRY_LABELS[industrySlug].toLowerCase()} business`;
	}
	return `${String(industrySlug).replace(/-/g, ' ')} business`;
}

/**
 * Ask Gemini to classify the image: appropriate for this business type or wrong.
 * Returns true only if image is OK to use. Works for any industry when profileDescription is provided.
 */
export async function isImageAppropriateForDemo(
	imageUrl: string,
	context: ImageValidationContext
): Promise<boolean> {
	if (!GEMINI_API_KEY) return true; // no key => skip validation, allow image
	const description = getValidationPromptDescription(context);

	const image = await fetchImageAsBase64(imageUrl);
	if (!image) return false;

	const businessHint = ` This is for a ${description}. The image must look professional and match this type of business. Do not allow fine art, gallery art, or unrelated imagery (e.g. for a painter contractor: allow painting walls/rollers, reject canvas/gallery art).`;

	const prompt = `Look at this image. It will be used on a landing page for a small business.

Is this image appropriate? It must match a professional business landing page.${businessHint}

Reply with exactly one word: OK or WRONG.
- OK = the image fits (professional, matches the business type).
- WRONG = the image does not fit (e.g. wrong industry, fine art when trade expected, or unrelated).`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	try {
		const body = {
			contents: [
				{
					role: 'user',
					parts: [
						{ inlineData: { mimeType: image.mimeType, data: image.data } },
						{ text: prompt }
					]
				}
			],
			generationConfig: {
				maxOutputTokens: 16,
				temperature: 0
			}
		};

		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(15000)
		});

		if (!res.ok) return true; // on API error, allow image rather than block

		const data = (await res.json()) as {
			candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() ?? '';
		return text.includes('OK') && !text.includes('WRONG');
	} catch {
		return true; // on timeout/error, allow image
	}
}
