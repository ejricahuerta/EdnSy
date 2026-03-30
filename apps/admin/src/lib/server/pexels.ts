/**
 * Pexels API client for demo image search.
 * @see https://www.pexels.com/api/documentation/
 */

import { env } from '$env/dynamic/private';

const PEXELS_API_KEY = (env.PEXELS_API_KEY ?? '').trim();
const PEXELS_BASE = 'https://api.pexels.com/v1';
const PEXELS_PER_PAGE = 5;
const PEXELS_TIMEOUT_MS = 8000;

type PexelsPhoto = {
	src?: {
		original?: string;
		large2x?: string;
		large?: string;
		medium?: string;
		landscape?: string;
		portrait?: string;
		small?: string;
		tiny?: string;
	};
};

type PexelsSearchResponse = {
	photos?: PexelsPhoto[];
};

/**
 * Fetch up to perPage Pexels image URLs for a search query.
 * Uses landscape (1200x627) for hero-sized and large (940x650) for about-sized.
 * Returns empty array on failure or missing API key.
 */
export async function fetchPexelsCandidates(
	query: string,
	perPage: number = PEXELS_PER_PAGE,
	size: 'hero' | 'about' = 'hero'
): Promise<string[]> {
	if (!PEXELS_API_KEY || !query.trim()) return [];
	const encoded = encodeURIComponent(query.trim());
	const url = `${PEXELS_BASE}/search?query=${encoded}&per_page=${Math.min(perPage, 80)}&orientation=landscape`;
	try {
		const res = await fetch(url, {
			headers: { Authorization: PEXELS_API_KEY },
			signal: AbortSignal.timeout(PEXELS_TIMEOUT_MS)
		});
		if (!res.ok) return [];
		const data = (await res.json()) as PexelsSearchResponse;
		const photos = data.photos ?? [];
		const sizeKey = size === 'hero' ? 'landscape' : 'large';
		return photos
			.map((p) => p.src?.[sizeKey] ?? p.src?.large ?? p.src?.medium ?? p.src?.original)
			.filter((u): u is string => typeof u === 'string' && u.length > 0)
			.slice(0, perPage);
	} catch {
		return [];
	}
}

/**
 * Whether Pexels is configured and will be used for demo image search.
 */
export function isPexelsConfigured(): boolean {
	return PEXELS_API_KEY.length > 0;
}

/**
 * Fetch a single Pexels image URL for a search query.
 * For demo hero/about resolution, the resolver uses this automatically when PEXELS_API_KEY is set.
 * Returns fallback if no key, empty query, or API failure.
 */
export async function getPexelsImageUrl(
	query: string,
	options: { size?: 'hero' | 'about'; fallback: string } = { fallback: '' }
): Promise<string> {
	const { size = 'hero', fallback } = options;
	const candidates = await fetchPexelsCandidates(query, 1, size);
	return candidates[0] ?? fallback;
}
