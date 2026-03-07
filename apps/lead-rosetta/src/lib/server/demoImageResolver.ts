/**
 * Single demo image resolver: profile from industry + trade, AI-generated search query,
 * Pexels (primary) or Unsplash candidates, AI validation, registry fallback.
 * Use this for all demo hero/about/avatar URLs.
 */

import { env } from '$env/dynamic/private';
import type { IndustrySlug } from '$lib/industries';
import { getRegistryImages } from '$lib/server/demoImageRegistry';
import { fetchPexelsCandidates, isPexelsConfigured } from '$lib/server/pexels';
import { isImageAppropriateForDemo } from '$lib/server/validateDemoImage';

const GEMINI_API_KEY = (env.GEMINI_API_KEY ?? '').trim();
const GEMINI_MODEL = 'gemini-2.5-flash';
const UNSPLASH_ACCESS_KEY = (env.UNSPLASH_ACCESS_KEY ?? '').trim();

const CANDIDATES_PER_PAGE = 5;
const UNSPLASH_TIMEOUT_MS = 8000;
const GEMINI_TIMEOUT_MS = 15000;

/** Construction trade keywords -> profile suffix (e.g. painter -> construction.painter). */
const CONSTRUCTION_TRADE_MAP: Array<{ pattern: RegExp; profile: string }> = [
	{ pattern: /\b(painter|painting|paint\s*contractor|house\s*painter|interior\s*painter)\b/i, profile: 'construction.painter' },
	{ pattern: /\b(plumb(er|ing)|plumbers)\b/i, profile: 'construction.plumber' },
	{ pattern: /\b(hvac|heating|cooling)\b/i, profile: 'construction.hvac' },
	{ pattern: /\b(electric(ian|al)|electricians)\b/i, profile: 'construction.electrician' },
	{ pattern: /\b(locksmith|locksmiths)\b/i, profile: 'construction.locksmith' },
	{ pattern: /\b(roof(er|ing))\b/i, profile: 'construction.roofing' },
	{ pattern: /\b(landscap(e|ing|er))\b/i, profile: 'construction.landscaping' },
	{ pattern: /\b(carpent(er|ry))\b/i, profile: 'construction.carpenter' },
	{ pattern: /\b(flooring)\b/i, profile: 'construction.flooring' }
];

/**
 * Resolve image profile key from industry slug and display string (e.g. "Painter" -> construction.painter).
 */
export function getDemoImageProfile(
	industrySlug: IndustrySlug,
	industryDisplay: string | null | undefined
): string {
	const display = (industryDisplay ?? '').trim();
	if (industrySlug !== 'construction' || !display) {
		return industrySlug;
	}
	const lower = display.toLowerCase();
	for (const { pattern, profile } of CONSTRUCTION_TRADE_MAP) {
		if (pattern.test(lower)) return profile;
	}
	return 'construction';
}

/**
 * Human-readable description for validation prompt (all industries).
 */
export function getProfileDescription(profile: string): string {
	const descriptions: Record<string, string> = {
		'construction.painter': 'house painting / painting contractor (walls, interior/exterior painting, rollers, ladders)',
		'construction.plumber': 'plumbing / plumber business (pipes, repairs, technician)',
		'construction.hvac': 'HVAC / heating and cooling business',
		'construction.electrician': 'electrical / electrician business',
		'construction.locksmith': 'locksmith / security locks business',
		'construction.roofing': 'roofing contractor business',
		'construction.landscaping': 'landscaping business',
		'construction.carpenter': 'carpentry / carpenter business',
		'construction.flooring': 'flooring contractor business',
		construction: 'construction or trade business (building, renovation, workers, tools)',
		healthcare: 'healthcare or medical practice',
		dental: 'dental practice',
		salons: 'salon or beauty business',
		professional: 'professional services business',
		'real-estate': 'real estate business',
		legal: 'law firm or legal services',
		fitness: 'fitness or gym business'
	};
	return descriptions[profile] ?? 'professional small business';
}

/**
 * Generate a single stock-photo search query (2-4 words) via Gemini for the given profile and slot.
 * Used for both Pexels and Unsplash. Returns fallback query on error.
 */
export async function generateUnsplashQueryForDemo(
	profile: string,
	slot: 'hero' | 'about',
	companyName?: string | null
): Promise<string> {
	if (!GEMINI_API_KEY) {
		return getFallbackQueryForProfile(profile, slot);
	}
	const description = getProfileDescription(profile);
	const prompt = `You are choosing a stock photo search query (e.g. Pexels/Unsplash) for a small business demo landing page.

Business type: ${description}.
Slot: ${slot === 'hero' ? 'Hero (main background image)' : 'About/solution section image'}.
${companyName ? `Business name: ${companyName}.` : ''}

Return a single search query (2-4 words only) that will return professional, on-brand stock photos for this business. Use terms that return trade/professional imagery, not art or generic stock.
Examples: for house painter use "interior wall painting" or "painting contractor", never "painting" or "art". For dental use "dental clinic" or "dentist office". For plumber use "plumber repair" or "plumbing technician".

Reply with ONLY the search query, 2-4 words, nothing else.`;

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
	try {
		const res = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
				generationConfig: { maxOutputTokens: 32, temperature: 0 }
			}),
			signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS)
		});
		if (!res.ok) return getFallbackQueryForProfile(profile, slot);
		const data = (await res.json()) as {
			candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
		};
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
		if (text && text.length < 80) return text;
		return getFallbackQueryForProfile(profile, slot);
	} catch {
		return getFallbackQueryForProfile(profile, slot);
	}
}

function getFallbackQueryForProfile(profile: string, slot: 'hero' | 'about'): string {
	if (profile.startsWith('construction')) {
		if (profile === 'construction.painter') return slot === 'hero' ? 'interior wall painting' : 'painting contractor';
		if (profile === 'construction.plumber') return slot === 'hero' ? 'plumber repair' : 'plumbing technician';
		return slot === 'hero' ? 'construction worker' : 'home renovation';
	}
	const base = profile === 'dental' ? 'dental clinic' : profile === 'healthcare' ? 'medical clinic' : profile;
	return slot === 'hero' ? `${base} professional` : `${base} team`;
}

/**
 * Fetch up to perPage Unsplash image URLs for a query. Returns empty array on failure.
 */
async function fetchUnsplashCandidates(
	query: string,
	perPage: number,
	width: number
): Promise<string[]> {
	if (!UNSPLASH_ACCESS_KEY || !query.trim()) return [];
	try {
		const encoded = encodeURIComponent(query.trim());
		const res = await fetch(
			`https://api.unsplash.com/search/photos?query=${encoded}&per_page=${perPage}&orientation=landscape`,
			{
				headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
				signal: AbortSignal.timeout(UNSPLASH_TIMEOUT_MS)
			}
		);
		if (!res.ok) return [];
		const data = (await res.json()) as { results?: { urls?: { regular?: string } }[] };
		const results = data.results ?? [];
		return results
			.map((r) => r.urls?.regular)
			.filter((u): u is string => typeof u === 'string' && u.length > 0)
			.map((url) => (url.includes('?') ? `${url}&w=${width}&q=80` : `${url}?w=${width}&q=80`))
			.slice(0, perPage);
	} catch {
		return [];
	}
}

/**
 * Fetch demo image candidates: Pexels first if configured, then Unsplash.
 */
async function fetchDemoImageCandidates(
	query: string,
	slot: 'hero' | 'about'
): Promise<string[]> {
	const perPage = CANDIDATES_PER_PAGE;
	const size = slot === 'hero' ? 'hero' : 'about';
	if (isPexelsConfigured()) {
		const urls = await fetchPexelsCandidates(query, perPage, size);
		if (urls.length > 0) return urls;
	}
	return fetchUnsplashCandidates(query, perPage, slot === 'hero' ? 1200 : 800);
}

/**
 * Resolve one image URL (hero, about, or avatar) using AI query + Unsplash + validation, with registry fallback.
 */
export async function resolveDemoImageUrl(
	industrySlug: IndustrySlug,
	industryDisplay: string | null | undefined,
	type: 'hero' | 'about' | 'avatar',
	options?: { companyName?: string | null }
): Promise<string> {
	const profile = getDemoImageProfile(industrySlug, industryDisplay);
	const registry = getRegistryImages(profile);
	const fallback =
		type === 'hero' ? registry.hero : type === 'about' ? registry.about : registry.avatar ?? registry.hero;

	if (type === 'avatar') {
		return fallback;
	}

	const query = await generateUnsplashQueryForDemo(
		profile,
		type === 'hero' ? 'hero' : 'about',
		options?.companyName
	);
	const candidates = await fetchDemoImageCandidates(
		query,
		type === 'hero' ? 'hero' : 'about'
	);
	if (candidates.length === 0) return fallback;

	const profileDescription = getProfileDescription(profile);
	for (const url of candidates) {
		const ok = await isImageAppropriateForDemo(url, {
			industrySlug,
			profileDescription
		});
		if (ok) return url;
	}
	return fallback;
}

export type ResolveDemoImageUrlsOptions = {
	companyName?: string | null;
	/** If true, also resolve testimonial avatar (default false for hero+about only). */
	includeAvatar?: boolean;
};

/**
 * Resolve hero and about (and optionally avatar) URLs. Single entry point for all demo image resolution.
 */
export async function resolveDemoImageUrls(
	industrySlug: IndustrySlug,
	industryDisplay: string | null | undefined,
	options?: ResolveDemoImageUrlsOptions
): Promise<{ hero: string; about: string; avatar?: string }> {
	const profile = getDemoImageProfile(industrySlug, industryDisplay);
	const registry = getRegistryImages(profile);

	const [hero, about] = await Promise.all([
		resolveDemoImageUrl(industrySlug, industryDisplay, 'hero', options),
		resolveDemoImageUrl(industrySlug, industryDisplay, 'about', options)
	]);

	const result: { hero: string; about: string; avatar?: string } = { hero, about };
	if (options?.includeAvatar) {
		result.avatar = registry.avatar ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';
	}
	return result;
}
