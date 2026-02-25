/**
 * Industry slugs (match landing app). Used for routes and Notion industry field.
 */
export const INDUSTRY_SLUGS = [
	'healthcare',
	'dental',
	'construction',
	'salons',
	'solo-professionals',
	'real-estate',
	'legal',
	'fitness'
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/**
 * daisyUI theme per industry. Custom dark themes for healthcare, construction, salons;
 * built-ins (aqua, forest, luxury, business, sunset) for the rest.
 */
export const INDUSTRY_THEMES: Record<IndustrySlug, string> = {
	healthcare: 'healthcare',
	dental: 'aqua',
	construction: 'construction',
	salons: 'salons',
	'solo-professionals': 'forest',
	'real-estate': 'luxury',
	legal: 'business',
	fitness: 'sunset'
};

export function getThemeForIndustry(slug: string): string | undefined {
	return INDUSTRY_THEMES[slug as IndustrySlug];
}

export function getThemeForPath(pathname: string): string | undefined {
	const segment = pathname.split('/').filter(Boolean)[0];
	return segment ? getThemeForIndustry(segment) : undefined;
}

import { notionIndustryToSlug as mapNotionToSlug } from '$lib/industryMapping';

/**
 * Map Notion Industry select value to demo URL slug.
 * Delegates to the canonical mapping in industryMapping.ts.
 */
export function industryDisplayToSlug(display: string): IndustrySlug {
	return mapNotionToSlug(display);
}
