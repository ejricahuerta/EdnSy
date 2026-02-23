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
 * daisyUI theme per industry (https://daisyui.com/docs/themes/).
 * Each demo route uses this theme for a distinct look per vertical.
 */
export const INDUSTRY_THEMES: Record<IndustrySlug, string> = {
	healthcare: 'emerald',
	dental: 'cupcake',
	construction: 'autumn',
	salons: 'pastel',
	'solo-professionals': 'corporate',
	'real-estate': 'luxury',
	legal: 'dim',
	fitness: 'sunset'
};

export function getThemeForIndustry(slug: string): string | undefined {
	return INDUSTRY_THEMES[slug as IndustrySlug];
}

export function getThemeForPath(pathname: string): string | undefined {
	const segment = pathname.split('/').filter(Boolean)[0];
	return segment ? getThemeForIndustry(segment) : undefined;
}
