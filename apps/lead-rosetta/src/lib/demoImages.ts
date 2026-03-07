/**
 * Demo landing image paths. Local images are stored in static/images/demo/{industry}/
 * after running from repo root: node scripts/download-demo-images.mjs (or pnpm run demo:download-images from apps/lead-rosetta)
 */
import type { IndustrySlug } from '$lib/industries';

const DEMO_IMAGE_INDUSTRIES: IndustrySlug[] = [
	'healthcare',
	'dental',
	'construction',
	'salons',
	'professional',
	'real-estate',
	'legal',
	'fitness'
];

/** Base URL for static demo images (same as Unsplash defaults when script has run). */
export function getDemoImagePath(industrySlug: IndustrySlug, type: 'hero' | 'about'): string {
	return `/images/demo/${industrySlug}/${type}.jpg`;
}

/** Hero and about paths for an industry. Use in content or templates. */
export function getDemoImagePaths(industrySlug: IndustrySlug): { hero: string; about: string } {
	return {
		hero: getDemoImagePath(industrySlug, 'hero'),
		about: getDemoImagePath(industrySlug, 'about')
	};
}

export { DEMO_IMAGE_INDUSTRIES };
