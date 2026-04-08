/**
 * Single source of truth for demo industries (local SMBs).
 * Used by demo routes, dashboard demo generation, chatContext.
 */
export const INDUSTRY_SLUGS = [
	'dental',
	'legal',
	'medical',
	'fitness',
	'restaurant',
	'beauty',
	'home-services',
	'real-estate',
	'accounting',
	'other'
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/**
 * CRM/Notion industry value aliases per slug. Unknown values resolve to `other`.
 */
export const NOTION_INDUSTRY_TO_SLUG: Record<IndustrySlug, readonly string[]> = {
	dental: [
		'dental',
		'dentist',
		'dentistry',
		'dental care',
		'dental clinic',
		'orthodontics',
		'orthodontist',
		'oral health',
		'periodontist',
		'endodontist',
		'oral surgeon',
		'dental hygienist',
		'cosmetic dentistry',
		'cosmetic dentist',
		'teeth whitening',
		'teeth whitening service',
		'implants',
		'dental implants provider',
		'dental implants periodontist',
		'emergency dental service',
		'dental radiology',
		'dental radiologist',
		'pediatric dentist'
	],
	legal: [
		'legal',
		'law',
		'lawyer',
		'attorney',
		'law firm',
		'litigation',
		'family law',
		'estate law',
		'immigration law',
		'corporate law'
	],
	medical: [
		'medical',
		'healthcare',
		'clinic',
		'physician',
		'doctor',
		'primary care',
		'walk-in clinic',
		'urgent care',
		'pediatrician',
		'internal medicine'
	],
	fitness: [
		'fitness',
		'gym',
		'personal training',
		'crossfit',
		'yoga studio',
		'pilates',
		'sports training',
		'wellness center'
	],
	restaurant: [
		'restaurant',
		'cafe',
		'coffee shop',
		'bakery',
		'bar',
		'pub',
		'food service',
		'catering',
		'diner',
		'bistro'
	],
	beauty: [
		'beauty',
		'salon',
		'spa',
		'barbershop',
		'barber',
		'hair salon',
		'nail salon',
		'esthetician',
		'skincare'
	],
	'home-services': [
		'home services',
		'home-services',
		'contractor',
		'plumber',
		'plumbing',
		'electrician',
		'hvac',
		'painter',
		'painting',
		'roofing',
		'landscaping',
		'handyman',
		'cleaning',
		'cleaning service'
	],
	'real-estate': [
		'real estate',
		'real-estate',
		'realtor',
		'property management',
		'brokerage',
		'property'
	],
	accounting: [
		'accounting',
		'accountant',
		'cpa',
		'bookkeeping',
		'tax preparation',
		'tax',
		'financial services'
	],
	other: ['other', 'general', 'professional services', 'small business', 'local business']
};

function normalizeIndustryValue(value: string): string {
	return value.toLowerCase().trim().replace(/\s+/g, '-');
}

let _notionIndustryLookup: Map<string, IndustrySlug> | null = null;

function buildNotionIndustryLookup(): Map<string, IndustrySlug> {
	if (_notionIndustryLookup) return _notionIndustryLookup;
	_notionIndustryLookup = new Map();
	for (const slug of INDUSTRY_SLUGS) {
		for (const v of NOTION_INDUSTRY_TO_SLUG[slug]) {
			_notionIndustryLookup.set(normalizeIndustryValue(v), slug);
		}
	}
	return _notionIndustryLookup;
}

/**
 * Map a Notion Industry select value to the demo URL slug. Defaults to `other`.
 */
export function notionIndustryToSlug(notionValue: string): IndustrySlug {
	if (!notionValue?.trim()) return 'other';
	const key = normalizeIndustryValue(notionValue);
	return buildNotionIndustryLookup().get(key) ?? 'other';
}

/**
 * Style guide file (under docs/style-guides/industries/) per industry.
 */
export const INDUSTRY_STYLE_GUIDES: Record<IndustrySlug, string> = {
	dental: 'health-and-wellness',
	legal: 'professional-services',
	medical: 'health-and-wellness',
	fitness: 'health-and-wellness',
	restaurant: 'hospitality',
	beauty: 'health-and-wellness',
	'home-services': 'trades',
	'real-estate': 'professional-services',
	accounting: 'professional-services',
	other: 'professional-services'
};

/** Human-readable labels for industry dropdowns (e.g. try-free form). */
export const INDUSTRY_LABELS: Record<IndustrySlug, string> = {
	dental: 'Dental',
	legal: 'Legal',
	medical: 'Medical',
	fitness: 'Fitness',
	restaurant: 'Restaurant',
	beauty: 'Beauty',
	'home-services': 'Home services',
	'real-estate': 'Real estate',
	accounting: 'Accounting',
	other: 'Other'
};

/**
 * Map a raw Google Business Profile category string (often semicolon- or comma-separated types)
 * to a canonical CRM label. Returns null if no known slug matches any token.
 */
export function gbpCategoriesToIndustryLabel(raw: string): string | null {
	if (!(raw ?? '').trim()) return null;
	const tokens = raw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
	for (const token of tokens) {
		const slug = notionIndustryToSlug(token);
		if (slug !== 'other') return INDUSTRY_LABELS[slug];
	}
	return null;
}

/**
 * Map a Notion Industry select value to demo URL slug.
 */
export function industryDisplayToSlug(display: string): IndustrySlug {
	return notionIndustryToSlug(display);
}

/**
 * Parse a multi-value industry string (e.g. "Dental") into trimmed parts.
 */
export function parseIndustryValues(industryString: string): string[] {
	if (!(industryString ?? '').trim()) return [];
	return (industryString as string)
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * When the user has a CRM industry filter, keep only prospects whose industry maps to an allowed slug.
 * Empty filter array returns all prospects.
 */
export function filterProspectsByCrmIndustrySlugs<T extends { industry?: string }>(
	prospects: T[],
	crmIndustryFilterSlugs: string[]
): T[] {
	if (!crmIndustryFilterSlugs.length) return prospects;
	const allowed = new Set(crmIndustryFilterSlugs);
	return prospects.filter((p) => {
		const values = parseIndustryValues(p.industry ?? '');
		const slugs = values.length
			? values.map((v) => industryDisplayToSlug(v))
			: [industryDisplayToSlug((p.industry ?? '').trim() || '')];
		return slugs.some((s) => allowed.has(s));
	});
}

/**
 * From a multi-value industry string, return the slug for demo endpoint selection.
 */
export function getPrimaryIndustrySlugFromMultiValue(
	industryString: string,
	preferredSlugs?: readonly IndustrySlug[]
): IndustrySlug {
	const values = parseIndustryValues(industryString);
	if (preferredSlugs?.length) {
		for (const v of values) {
			const slug = notionIndustryToSlug(v);
			if (preferredSlugs.includes(slug)) return slug;
		}
	}
	if (values.length > 0) return notionIndustryToSlug(values[0]);
	return 'other';
}
