/**
 * Single source of truth for demo industries. Product scope: dental only.
 * Used by demo routes, try/upload forms, dashboard demo generation, chatContext.
 */
export const INDUSTRY_SLUGS = ['dental'] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/**
 * CRM/Notion industry values for dental. Unknown values still resolve to `dental`.
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
		'teeth whitening',
		'implants',
		'pediatric dentist'
	]
};

function normalizeIndustryValue(value: string): string {
	return value.toLowerCase().trim().replace(/\s+/g, '-');
}

let _notionIndustryLookup: Map<string, IndustrySlug> | null = null;

function buildNotionIndustryLookup(): Map<string, IndustrySlug> {
	if (_notionIndustryLookup) return _notionIndustryLookup;
	_notionIndustryLookup = new Map();
	for (const v of NOTION_INDUSTRY_TO_SLUG.dental) {
		_notionIndustryLookup.set(normalizeIndustryValue(v), 'dental');
	}
	return _notionIndustryLookup;
}

/**
 * Map a Notion Industry select value to the demo URL slug. Defaults to `dental`.
 */
export function notionIndustryToSlug(notionValue: string): IndustrySlug {
	if (!notionValue?.trim()) return 'dental';
	const key = normalizeIndustryValue(notionValue);
	return buildNotionIndustryLookup().get(key) ?? 'dental';
}

/**
 * Style guide file (under docs/style-guides/industries/) per industry.
 */
export const INDUSTRY_STYLE_GUIDES: Record<IndustrySlug, string> = {
	dental: 'health-and-wellness'
};

/** Human-readable labels for industry dropdowns (e.g. try-free form). */
export const INDUSTRY_LABELS: Record<IndustrySlug, string> = {
	dental: 'Dental'
};

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
	return 'dental';
}
