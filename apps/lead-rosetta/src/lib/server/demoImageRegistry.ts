/**
 * Curated demo image URLs per image profile. Used as fallback when AI + Unsplash
 * fail or when no candidate passes validation.
 */

import type { IndustrySlug } from '$lib/industries';

export type DemoImageSet = {
	hero: string;
	about: string;
	avatar?: string;
};

const DEFAULT_AVATAR =
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

/** Registry: profile key -> { hero, about, avatar? }. */
export const DEMO_IMAGE_REGISTRY: Record<string, DemoImageSet> = {
	dental: {
		hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
		avatar: DEFAULT_AVATAR
	}
};

/**
 * Get image set for a profile. Falls back to dental.
 */
export function getRegistryImages(profile: string): DemoImageSet {
	const set = DEMO_IMAGE_REGISTRY[profile];
	if (set) return set;
	return DEMO_IMAGE_REGISTRY.dental;
}

/**
 * Industry slugs with a base registry entry.
 */
export function getIndustrySlugsWithRegistry(): IndustrySlug[] {
	return ['dental'];
}
