/**
 * Demo page types: audit data (from scraped/source data) and sender info.
 * When scraped data is available, populate from that source; otherwise use mock for UI.
 */

export type AuditStatus = 'red' | 'amber' | 'green';

export type DemoAudit = {
	/** Website: exists, missing, or outdated */
	websiteStatus: 'exists' | 'missing' | 'outdated';
	websiteStatusLevel: AuditStatus;
	/** Google review count (e.g. 12) */
	googleReviewCount: number | null;
	/** Last response date on Google (e.g. "2 weeks ago") */
	lastReviewResponseDate: string | null;
	/** Count of unanswered reviews */
	unansweredReviewsCount: number | null;
	/** Missing service pages vs competitors (e.g. "3 of 5 key services") */
	missingServicePages: string | null;
	/** GBP completeness: photos, hours, description (0–100 or label) */
	gbpCompletenessScore: number | null;
	gbpCompletenessLabel?: string;
};

/**
 * Check if a value has the shape of DemoAudit (for cached scraped_data from Supabase).
 */
export function isDemoAuditShape(value: unknown): value is DemoAudit {
	if (!value || typeof value !== 'object') return false;
	const o = value as Record<string, unknown>;
	return (
		['exists', 'missing', 'outdated'].includes(String(o.websiteStatus)) &&
		['red', 'amber', 'green'].includes(String(o.websiteStatusLevel))
	);
}

/** Default mock audit for demos when no scraped data exists. Score is kept >= DATA_CONFIDENCE_MIN so try flow always shows a demo. */
export function getMockDemoAudit(): DemoAudit {
	return {
		websiteStatus: 'outdated',
		websiteStatusLevel: 'amber',
		googleReviewCount: 24,
		lastReviewResponseDate: '3 weeks ago',
		unansweredReviewsCount: 5,
		missingServicePages: '3 of 5 key service pages',
		gbpCompletenessScore: 72,
		gbpCompletenessLabel: '72% complete'
	};
}

/**
 * F1a — Data confidence score (0–100) from audit signals.
 * PRD: GBP verified 30, 5+ reviews 25, website exists 20, photos 15, social 10.
 * We derive from DemoAudit: website, reviews, GBP completeness; photos/social not in type yet.
 */
export function computeDataConfidenceScore(audit: DemoAudit): number {
	let score = 0;
	// Website exists: 20
	if (audit.websiteStatus === 'exists') score += 20;
	// 5+ reviews: 25, 1–4: 10
	const reviews = audit.googleReviewCount ?? 0;
	if (reviews >= 5) score += 25;
	else if (reviews >= 1) score += 10;
	// GBP completeness: 70+ → 30, 40+ → 15
	const gbp = audit.gbpCompletenessScore ?? 0;
	if (gbp >= 70) score += 30;
	else if (gbp >= 40) score += 15;
	// Photos/social not in DemoAudit; reserve 15+10 for future
	return Math.min(100, score);
}

/** F1a: below this score we do not generate / show demo; notify user with reason. */
export const DATA_CONFIDENCE_MIN = 50;
