/**
 * Single source of truth for demo industries. Used by:
 * - Demo routes (/demo/[slug]), try/upload forms, dashboard demo generation
 * - industryMapping.ts (Notion/CRM industry → slug), chatContext (content by slug)
 * Keep INDUSTRY_SLUGS, INDUSTRY_STYLE_GUIDES, INDUSTRY_LABELS, INDUSTRY_THEMES in sync.
 */
export const INDUSTRY_SLUGS = [
	'healthcare',
	'dental',
	'construction',
	'salons',
	'professional',
	'real-estate',
	'legal',
	'fitness'
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/**
 * Style guide file (under docs/style-guides/industries/) per industry.
 * File name without .html; each industry maps to one style guide for demo theming.
 */
export const INDUSTRY_STYLE_GUIDES: Record<IndustrySlug, string> = {
	healthcare: 'health-and-wellness',
	dental: 'health-and-wellness',
	construction: 'construction',
	salons: 'salon-and-spa',
	professional: 'professional',
	'real-estate': 'real-estate',
	legal: 'legal',
	fitness: 'fitness'
};

/** Human-readable labels for industry dropdowns (e.g. try-free form). */
export const INDUSTRY_LABELS: Record<IndustrySlug, string> = {
	healthcare: 'Healthcare',
	dental: 'Dental',
	construction: 'Construction',
	salons: 'Salons & beauty',
	professional: 'Professional',
	'real-estate': 'Real estate',
	legal: 'Legal',
	fitness: 'Fitness'
};

/**
 * Custom theme per industry (healthcare, construction, salons, etc.);
 * built-ins (aqua, forest, luxury, business, sunset) for the rest.
 */
export const INDUSTRY_THEMES: Record<IndustrySlug, string> = {
	healthcare: 'healthcare',
	dental: 'aqua',
	construction: 'construction',
	salons: 'salons',
	professional: 'forest',
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
