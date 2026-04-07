/**
 * Demo image URL resolution. Delegates to the AI-driven resolver (profile, Pexels/Unsplash, validation, registry).
 * Pexels is used first when PEXELS_API_KEY is set; otherwise Unsplash. Single-image helpers below.
 */

import { env } from '$env/dynamic/private';
import type { IndustrySlug } from '$lib/industries';
import { resolveDemoImageUrls, getDemoImageProfile } from '$lib/server/demoImageResolver';
import { getRegistryImages } from '$lib/server/demoImageRegistry';
import { getPexelsImageUrl as getPexelsImageUrlImpl, isPexelsConfigured } from '$lib/server/pexels';
import { isImageAppropriateForDemo } from '$lib/server/validateDemoImage';

const UNSPLASH_ACCESS_KEY = (env.UNSPLASH_ACCESS_KEY ?? '').trim();

/** Default hero/about per industry (re-exported for legacy use). Use resolver for new code. */
export { DEMO_IMAGE_REGISTRY, getRegistryImages } from '$lib/server/demoImageRegistry';
export type { DemoImageSet } from '$lib/server/demoImageRegistry';
export { getDemoImageProfile } from '$lib/server/demoImageResolver';

/** Re-export resolver as the main API. */
export { resolveDemoImageUrls } from '$lib/server/demoImageResolver';
export type { ResolveDemoImageUrlsOptions } from '$lib/server/demoImageResolver';

const DEFAULT_AVATAR =
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

/**
 * Resolve hero and about image URLs for a demo. Uses AI-generated query, Pexels (or Unsplash) candidates, and validation.
 * Pass industry slug and display string (e.g. prospect.industry); no free-text queries.
 */
export async function getDemoImageUrls(
	industrySlug: IndustrySlug,
	industryDisplay: string | null | undefined,
	options?: { companyName?: string | null }
): Promise<{ hero: string; about: string }> {
	const r = await resolveDemoImageUrls(industrySlug, industryDisplay, options);
	return { hero: r.hero, about: r.about };
}

/**
 * Resolve hero, solution (about), and testimonial avatar URLs. Same AI + Pexels/Unsplash + validation flow.
 */
export async function getDemoImageUrlsFull(
	industrySlug: IndustrySlug,
	industryDisplay: string | null | undefined,
	options?: { companyName?: string | null }
): Promise<{ hero: string; solution: string; testimonialAvatar: string }> {
	const r = await resolveDemoImageUrls(industrySlug, industryDisplay, {
		...options,
		includeAvatar: true
	});
	const registry = getRegistryImages(getDemoImageProfile(industrySlug, industryDisplay));
	return {
		hero: r.hero,
		solution: r.about,
		testimonialAvatar: r.avatar ?? registry.avatar ?? DEFAULT_AVATAR
	};
}

/**
 * Legacy: whether the industry string indicates a painter (house/interior painting) trade.
 * Kept for backward compatibility; image resolution now uses getDemoImageProfile.
 */
export function isPainterIndustry(industry: string | null | undefined): boolean {
	return /\b(painter|painting|paint\s*contractor|house\s*painter|interior\s*painter)\b/i.test(
		(industry ?? '').trim()
	);
}

/** Type for full-demo image queries (hero, solution, avatar). Content generation may still return these for alt text. */
export type DemoImageQueries = {
	hero: string;
	solution: string;
	testimonialAvatar?: string;
};

/**
 * Fetch a single Pexels image URL for a search query. Uses Pexels when PEXELS_API_KEY is set.
 * For demo hero/about, use getDemoImageUrls(industrySlug, industryDisplay) instead.
 */
export async function getPexelsImageUrl(
	query: string,
	options: { width?: number; industrySlug?: IndustrySlug; type?: 'hero' | 'about' } = {}
): Promise<string> {
	const { width = 1200, industrySlug = 'other', type = 'hero' } = options;
	const registry = getRegistryImages(industrySlug);
	const fallback = type === 'hero' ? registry.hero : registry.about;
	if (!isPexelsConfigured() || !query.trim()) return fallback;
	const size = type === 'hero' ? 'hero' : 'about';
	const url = await getPexelsImageUrlImpl(query, { size, fallback });
	if (url === fallback) return fallback;
	const ok = await isImageAppropriateForDemo(url, {
		industrySlug,
		profileDescription: type === 'hero' ? 'professional business' : 'professional team'
	});
	return ok ? url : fallback;
}

/**
 * Fetch a single Unsplash image URL for a search query. Used when a raw query is already known (e.g. alt-text only path).
 * For demo hero/about, use getDemoImageUrls(industrySlug, industryDisplay) instead. Prefer getPexelsImageUrl when Pexels is configured.
 */
export async function getUnsplashImageUrl(
	query: string,
	options: { width?: number; industrySlug?: IndustrySlug; type?: 'hero' | 'about' } = {}
): Promise<string> {
	const { width = 1200, industrySlug = 'other', type = 'hero' } = options;
	const registry = getRegistryImages(industrySlug);
	const fallback = type === 'hero' ? registry.hero : registry.about;

	if (!UNSPLASH_ACCESS_KEY || !query.trim()) return fallback;
	try {
		const encoded = encodeURIComponent(query.trim());
		const res = await fetch(
			`https://api.unsplash.com/search/photos?query=${encoded}&per_page=1&orientation=landscape`,
			{
				headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
				signal: AbortSignal.timeout(5000)
			}
		);
		if (!res.ok) return fallback;
		const data = (await res.json()) as { results?: { urls?: { regular?: string } }[] };
		const url = data.results?.[0]?.urls?.regular;
		if (!url) return fallback;
		const finalUrl = url.includes('?') ? `${url}&w=${width}&q=80` : `${url}?w=${width}&q=80`;
		const ok = await isImageAppropriateForDemo(finalUrl, {
			industrySlug,
			profileDescription: type === 'hero' ? 'professional business' : 'professional team'
		});
		return ok ? finalUrl : fallback;
	} catch {
		return fallback;
	}
}
