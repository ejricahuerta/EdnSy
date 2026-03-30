/**
 * Demo landing image paths. Local images are stored in static/images/demo/dental/
 */
import type { IndustrySlug } from '$lib/industries';

const DEMO_IMAGE_INDUSTRIES: IndustrySlug[] = ['dental'];

/** Base URL for static demo images. */
export function getDemoImagePath(industrySlug: IndustrySlug, type: 'hero' | 'about'): string {
	return `/images/demo/${industrySlug}/${type}.jpg`;
}

/** Hero and about paths for an industry. */
export function getDemoImagePaths(industrySlug: IndustrySlug): { hero: string; about: string } {
	return {
		hero: getDemoImagePath(industrySlug, 'hero'),
		about: getDemoImagePath(industrySlug, 'about')
	};
}

export { DEMO_IMAGE_INDUSTRIES };
