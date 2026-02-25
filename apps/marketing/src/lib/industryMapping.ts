import type { IndustrySlug } from '$lib/industries';

/**
 * Single source of truth: Notion Industry values → demo slug.
 * Add any value that might appear in your Notion "Industry" select;
 * normalization is lowercase and spaces → hyphens (e.g. "Real Estate" → "real-estate").
 */
export const NOTION_INDUSTRY_TO_SLUG: Record<IndustrySlug, readonly string[]> = {
	healthcare: [
		'healthcare',
		'health',
		'health care',
		'medical',
		'clinic',
		'family practice',
		'family medicine',
		'physician',
		'doctor',
		'health services'
	],
	dental: [
		'dental',
		'dentist',
		'dentistry',
		'dental care',
		'dental clinic',
		'orthodontics',
		'oral health'
	],
	construction: [
		'construction',
		'contractor',
		'general contractor',
		'building',
		'renovation',
		'remodeling',
		'home improvement',
		'contracting'
	],
	salons: [
		'salons',
		'salon',
		'hair',
		'hair salon',
		'beauty',
		'beauty salon',
		'barber',
		'spa',
		'stylist',
		'hairstylist',
		'cosmetology'
	],
	'solo-professionals': [
		'solo-professionals',
		'solo professionals',
		'solo professional',
		'consulting',
		'consultant',
		'ai automation',
		'ai',
		'automation',
		'marketing',
		'tech',
		'technology',
		'professional services',
		'coach',
		'coaching',
		'accounting',
		'accountant',
		'financial advisor',
		'bookkeeping',
		'virtual assistant',
		'freelance',
		'freelancer',
		'other'
	],
	'real-estate': [
		'real-estate',
		'real estate',
		'realty',
		'realtor',
		'real estate agent',
		'property',
		'broker',
		'mortgage'
	],
	legal: [
		'legal',
		'law',
		'lawyer',
		'attorney',
		'law firm',
		'legal services',
		'paralegal',
		'estate planning',
		'family law',
		'immigration'
	],
	fitness: [
		'fitness',
		'gym',
		'gyms',
		'personal training',
		'personal trainer',
		'wellness',
		'yoga',
		'pilates',
		'crossfit',
		'studio',
		'sports'
	]
};

function normalize(value: string): string {
	return value.toLowerCase().trim().replace(/\s+/g, '-');
}

let _lookup: Map<string, IndustrySlug> | null = null;

function buildLookup(): Map<string, IndustrySlug> {
	if (_lookup) return _lookup;
	_lookup = new Map();
	for (const [slug, values] of Object.entries(NOTION_INDUSTRY_TO_SLUG)) {
		for (const v of values) {
			_lookup.set(normalize(v), slug as IndustrySlug);
		}
	}
	return _lookup;
}

/**
 * Map a Notion Industry select value (any casing/spacing) to the demo URL slug.
 * Unknown values default to 'solo-professionals' (broad catch‑all) so demos still work.
 */
export function notionIndustryToSlug(notionValue: string): IndustrySlug {
	if (!notionValue?.trim()) return 'solo-professionals';
	const key = normalize(notionValue);
	return buildLookup().get(key) ?? 'solo-professionals';
}
