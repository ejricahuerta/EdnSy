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
	/** From GBP: average rating (e.g. 4.5) for display in audit modal */
	googleRatingValue?: number | null;
	/** From GBP: whether the profile is claimed */
	gbpClaimed?: boolean | null;
	/** From GBP: whether business hours are present */
	gbpHasHours?: boolean | null;
	/** Gemini-generated insight (grade + summary + recommendations) for the business/website; shown in audit modal */
	insight?: GeminiInsight | null;
};

/** Website grading from Gemini: UX, UI, SEO, and modern vs outdated benchmark */
export type WebsiteInsight = {
	/** Grade or short label for user experience (e.g. "B+", "Good") */
	ux?: string | null;
	/** Grade or short label for visual design (e.g. "A", "Modern") */
	ui?: string | null;
	/** Grade or short label for SEO (e.g. "C", "Needs work") */
	seo?: string | null;
	/** Benchmark: outdated vs modern */
	benchmark?: 'outdated' | 'modern' | null;
};

/** Gemini output: grade the business and pull related insight for the audit modal */
export type GeminiInsight = {
	grade?: string;
	summary?: string;
	recommendations?: string[];
	/** Website-specific grading (UX, UI, SEO, benchmark); present when website was evaluated */
	website?: WebsiteInsight | null;
	/** If true, recommend a website demo page; if false, recommend AI agent / voice AI / SEO outreach instead */
	needsWebsiteDemo?: boolean;
	/** Short reason for the recommendation (e.g. "Has no website" vs "Website is modern; better fit for voice AI") */
	recommendationReason?: string;
};

/**
 * AI-generated copy for the audit modal (one prompt, one JSON).
 * Stored in scraped_data.auditModalCopy; modal uses when present, else fallback copy.
 */
export type AuditModalCopy = {
	title: string;
	whyYouLine: string;
	proofLine: string;
	whatsNextLine: string;
	socialProofLine: string;
	primaryCtaLabel: string;
	secondaryCtaLabel: string;
};

/**
 * True when the audit has Gemini insight we can show (grade, summary, or recommendations).
 * When true, we have enough to show a default industry demo even if data confidence score is low.
 */
export function hasUsableInsight(audit: DemoAudit): boolean {
	const i = audit?.insight;
	if (!i || typeof i !== 'object') return false;
	if (typeof i.grade === 'string' && i.grade.trim() !== '') return true;
	if (typeof i.summary === 'string' && i.summary.trim() !== '') return true;
	if (Array.isArray(i.recommendations) && i.recommendations.some((r) => typeof r === 'string' && r.trim() !== ''))
		return true;
	return false;
}

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

const DEMO_AUDIT_KEYS: (keyof DemoAudit)[] = [
	'websiteStatus',
	'websiteStatusLevel',
	'googleReviewCount',
	'lastReviewResponseDate',
	'unansweredReviewsCount',
	'missingServicePages',
	'gbpCompletenessScore',
	'gbpCompletenessLabel',
	'googleRatingValue',
	'gbpClaimed',
	'gbpHasHours',
	'insight'
];

/** Keys that indicate we have GBP data for the column (even if full audit shape is missing). */
const GBP_DISPLAY_KEYS: (keyof DemoAudit)[] = [
	'gbpCompletenessScore',
	'gbpCompletenessLabel',
	'googleRatingValue',
	'googleReviewCount',
	'gbpClaimed',
	'gbpHasHours'
];

function hasAnyGbpData(o: Record<string, unknown>): boolean {
	for (const key of GBP_DISPLAY_KEYS) {
		const v = o[key];
		if (v != null && (key !== 'googleReviewCount' || Number(v) > 0)) return true;
		if (key === 'googleReviewCount' && (v === 0 || v === '0')) return true;
	}
	return false;
}

/**
 * Extract a clean DemoAudit from stored scraped_data (which may include gbpRaw).
 * Use when passing audit to demo page/templates so the modal gets a consistent shape.
 * If stored data fails isDemoAuditShape but has GBP fields, still returns a partial audit
 * so the GBP column can show (websiteStatus/Level get defaults).
 */
export function auditFromScrapedData(scraped: Record<string, unknown> | null): DemoAudit | null {
	if (!scraped || typeof scraped !== 'object') return null;
	const audit: Record<string, unknown> = {};
	const fullShape = isDemoAuditShape(scraped);
	for (const key of DEMO_AUDIT_KEYS) {
		if (key in scraped) audit[key] = scraped[key];
	}
	if (fullShape) return audit as DemoAudit;
	if (hasAnyGbpData(scraped)) {
		if (!('websiteStatus' in audit)) audit.websiteStatus = 'exists';
		if (!('websiteStatusLevel' in audit)) audit.websiteStatusLevel = 'green';
		if (!('googleReviewCount' in audit)) audit.googleReviewCount = null;
		if (!('lastReviewResponseDate' in audit)) audit.lastReviewResponseDate = null;
		if (!('unansweredReviewsCount' in audit)) audit.unansweredReviewsCount = null;
		if (!('missingServicePages' in audit)) audit.missingServicePages = null;
		if (!('gbpCompletenessScore' in audit)) audit.gbpCompletenessScore = null;
		return audit as DemoAudit;
	}
	return null;
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

/**
 * Gemini-generated (and optionally Unsplash) landing content for demo industry pages.
 * Stored in scraped_data.landingContent; templates use to override static industry content.
 */
export type DemoLandingContent = {
	/** Business display phone (from GBP/prospect) */
	phone?: string | null;
	/** Logo image URL (from GBP if available) */
	logoUrl?: string | null;
	hero: {
		headline: string;
		subtext: string;
		subheadline?: string;
		ctaPrimary: string;
		ctaSecondary?: string;
		imageUrl?: string;
		imageAlt?: string;
		badge?: string;
	};
	cta: {
		heading: string;
		subtext: string;
		button: string;
		phoneLabel?: string;
		microReassurance?: string;
	};
	/** 3–5 services for the services section */
	services: Array<{ title: string; description: string; icon?: string }>;
	/** Optional product or offer names for display */
	products?: string[];
	/** About section image URL (Unsplash) */
	aboutImageUrl?: string;
	aboutImageAlt?: string;
};
