/**
 * Curated demo image URLs per image profile. Used as fallback when AI + Unsplash
 * fail or when no candidate passes validation.
 */

import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';

export type DemoImageSet = {
	hero: string;
	about: string;
	avatar?: string;
};

const DEFAULT_AVATAR =
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

/** Neutral professional SMB imagery when no industry-specific set exists. */
const DEFAULT_GENERIC: DemoImageSet = {
	hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
	about: 'https://images.unsplash.com/photo-1520607162513-77705c0f7d4a?w=800&q=80',
	avatar: DEFAULT_AVATAR
};

/** Registry: profile key -> { hero, about, avatar? }. */
export const DEMO_IMAGE_REGISTRY: Record<string, DemoImageSet> = {
	dental: {
		hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
		avatar: DEFAULT_AVATAR
	}
};

/**
 * Get image set for a profile. Falls back to generic professional imagery.
 */
export function getRegistryImages(profile: string): DemoImageSet {
	const set = DEMO_IMAGE_REGISTRY[profile];
	if (set) return set;
	return DEFAULT_GENERIC;
}

/**
 * Industry slugs with a dedicated registry entry (others use generic fallback).
 */
export function getIndustrySlugsWithRegistry(): IndustrySlug[] {
	return INDUSTRY_SLUGS.filter((slug) => slug in DEMO_IMAGE_REGISTRY) as IndustrySlug[];
}
