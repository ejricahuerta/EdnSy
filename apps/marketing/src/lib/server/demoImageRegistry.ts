/**
 * Curated demo image URLs per image profile. Used as fallback when AI + Unsplash
 * fail or when no candidate passes validation. Profile = industry slug or
 * industry.trade (e.g. construction.painter).
 */

import type { IndustrySlug } from '$lib/industries';

export type DemoImageSet = {
	hero: string;
	about: string;
	avatar?: string;
};

/** Default avatar when not specified per profile. */
const DEFAULT_AVATAR =
	'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

/** Registry: profile key -> { hero, about, avatar? }. */
export const DEMO_IMAGE_REGISTRY: Record<string, DemoImageSet> = {
	healthcare: {
		hero: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	dental: {
		hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	construction: {
		hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	'construction.painter': {
		hero: 'https://images.unsplash.com/photo-1589939704324-8848fcb4f4b2?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	salons: {
		hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	professional: {
		hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	'real-estate': {
		hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	legal: {
		hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
		avatar: DEFAULT_AVATAR
	},
	fitness: {
		hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
		avatar: DEFAULT_AVATAR
	}
};

/**
 * Get image set for a profile. Falls back to industry slug then construction.
 */
export function getRegistryImages(profile: string): DemoImageSet {
	const set = DEMO_IMAGE_REGISTRY[profile];
	if (set) return set;
	const industryOnly = profile.includes('.') ? profile.split('.')[0]! : profile;
	const industrySet = DEMO_IMAGE_REGISTRY[industryOnly];
	if (industrySet) return industrySet;
	return DEMO_IMAGE_REGISTRY.construction ?? DEMO_IMAGE_REGISTRY.professional!;
}

/**
 * All industry slugs that have a base registry entry (for fallback chain).
 */
export function getIndustrySlugsWithRegistry(): IndustrySlug[] {
	return [
		'healthcare',
		'dental',
		'construction',
		'salons',
		'professional',
		'real-estate',
		'legal',
		'fitness'
	] as IndustrySlug[];
}
