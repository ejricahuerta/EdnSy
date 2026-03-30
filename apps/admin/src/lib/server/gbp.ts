/**
 * GBP (Google Business Profile) data via Google Places API.
 * Fetches business info (name, address, phone, website, rating, etc.) and builds
 * DemoAudit for demo pages. Usage is gated by a monthly lock so we stay within limits.
 */

import type { Prospect } from '$lib/server/prospects';
import { serverError, serverInfo } from '$lib/server/logger';
import type { DemoAudit } from '$lib/types/demo';
import { generateInsightForProspect, generateInsightFromBusinessName, generateAuditModalCopy } from '$lib/server/insights';
import { fetchGbpFromPlaces, isPlacesConfigured } from '$lib/server/placesApi';
import { tryIncrementPlacesUsage } from '$lib/server/supabase';

export type ScrapedDataResult =
	| { ok: true; data: DemoAudit & { gbpRaw?: GbpData } }
	| { ok: false; errors: { dataforseo?: string; gemini?: string } };

export type GbpReview = {
	text: string;
	rating?: number;
	date?: string;
};

export type GbpData = {
	name: string;
	industry: string;
	address: string;
	phone: string;
	website: string;
	ratingValue: number | null;
	ratingCount: number;
	reviews: GbpReview[];
	isClaimed: boolean;
	workHours?: unknown;
};

export type GbpResult =
	| { ok: true; data: GbpData }
	| { ok: false; error: string };

export type GbpOptions = { defaultLocation?: string | null };

/** Whether GBP lookup is available (Places API configured). Kept for backward compatibility. */
export function isDataForSeoConfigured(): boolean {
	return isPlacesConfigured();
}

/**
 * Fetch GBP data for a prospect via Google Places API. Uses a monthly usage lock so we stay within limits.
 * Use options.defaultLocation when prospect has no city (e.g. from user settings).
 */
export async function fetchGbpForProspect(
	prospect: Prospect,
	options?: GbpOptions
): Promise<GbpResult> {
	if (!isPlacesConfigured()) {
		return { ok: false, error: 'Places API not configured (GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY)' };
	}
	const { allowed } = await tryIncrementPlacesUsage();
	if (!allowed) {
		serverInfo('gbp', 'Places API monthly limit reached; request blocked');
		return { ok: false, error: 'Places API monthly limit reached. Resets next month.' };
	}
	const result = await fetchGbpFromPlaces(prospect, {
		defaultLocation: options?.defaultLocation ?? undefined
	});
	return result.ok ? { ok: true, data: result.data } : { ok: false, error: result.error };
}

/**
 * Build a DemoAudit from GBP data (and prospect for website comparison).
 * Stored object can include gbpRaw for templates; must pass isDemoAuditShape.
 */
export function buildAuditFromGbp(gbp: GbpData, prospect: Prospect): DemoAudit & { gbpRaw?: GbpData } {
	const hasWebsite = (gbp.website ?? '').trim().length > 0;
	const prospectHasWebsite = (prospect.website ?? '').trim().length > 0;
	let websiteStatus: 'exists' | 'missing' | 'outdated' = hasWebsite ? 'exists' : 'missing';
	if (hasWebsite && prospectHasWebsite && prospect.website && gbp.website) {
		try {
			const gbpDomain = new URL(gbp.website).hostname.replace(/^www\./, '');
			const prospectDomain = new URL(prospect.website).hostname.replace(/^www\./, '');
			if (gbpDomain !== prospectDomain) websiteStatus = 'outdated';
		} catch {
			// keep default
		}
	}
	const websiteStatusLevel: 'red' | 'amber' | 'green' =
		websiteStatus === 'exists' ? 'green' : websiteStatus === 'missing' ? 'red' : 'amber';

	// GBP completeness: rough score from rating count, claimed, website, hours
	let gbpScore = 0;
	if (gbp.isClaimed) gbpScore += 25;
	if (gbp.ratingCount >= 5) gbpScore += 25;
	else if (gbp.ratingCount >= 1) gbpScore += 10;
	if (hasWebsite) gbpScore += 20;
	if (gbp.workHours) gbpScore += 20;
	gbpScore = Math.min(100, gbpScore);

	return {
		websiteStatus,
		websiteStatusLevel,
		googleReviewCount: gbp.ratingCount > 0 ? gbp.ratingCount : null,
		lastReviewResponseDate: null,
		unansweredReviewsCount: null,
		missingServicePages: null,
		gbpCompletenessScore: gbpScore,
		gbpCompletenessLabel: `${gbpScore}% complete`,
		googleRatingValue: gbp.ratingValue ?? null,
		gbpClaimed: gbp.isClaimed,
		gbpHasHours: !!gbp.workHours,
		gbpRaw: gbp
	};
}

export type ScrapedDataOptions = GbpOptions;

/**
 * Build minimal GbpData from prospect for name-only demos (no real GBP).
 * Demo HTML generator uses name, address, phone, etc.; stub allows the same code path.
 */
export function buildStubGbpFromProspect(prospect: Prospect): GbpData {
	return {
		name: (prospect.companyName ?? '').trim() || 'Business',
		industry: (prospect.industry ?? '').trim() || 'Professional',
		address: (prospect.address ?? '').trim(),
		phone: (prospect.phone ?? '').trim(),
		website: '',
		ratingValue: null,
		ratingCount: 0,
		reviews: [],
		isClaimed: false,
		workHours: undefined
	};
}

/**
 * Get scraped data for create-demo when there is no GBP (e.g. GBP failed or website is only Google Maps).
 * Creates an insight from the business name and a stub GbpData so a demo can still be generated.
 */
export async function getScrapedDataForDemoFromNameOnly(prospect: Prospect): Promise<ScrapedDataResult> {
	const insightResult = await generateInsightFromBusinessName(prospect);
	if (!insightResult.ok) {
		serverError('getScrapedDataForDemoFromNameOnly', 'Name-based insight failed', {
			error: insightResult.error
		});
		return { ok: false, errors: { gemini: insightResult.error } };
	}

	const stubGbp = buildStubGbpFromProspect(prospect);
	const baseAudit: DemoAudit & { gbpRaw?: GbpData } = {
		websiteStatus: 'missing',
		websiteStatusLevel: 'red',
		googleReviewCount: null,
		lastReviewResponseDate: null,
		unansweredReviewsCount: null,
		missingServicePages: null,
		gbpCompletenessScore: null,
		gbpCompletenessLabel: undefined,
		googleRatingValue: null,
		gbpClaimed: false,
		gbpHasHours: false,
		insight: insightResult.data,
		gbpRaw: stubGbp
	};

	const audit: DemoAudit & { gbpRaw?: GbpData } = {
		...baseAudit,
		insight: insightResult.data
	};

	const modalCopyResult = await generateAuditModalCopy(prospect, audit);
	const result = {
		...audit,
		...(modalCopyResult.ok ? { auditModalCopy: modalCopyResult.data } : {})
	};
	return { ok: true, data: result };
}

/**
 * Get scraped data for create-demo: GBP first (required), then Gemini for grade/insight.
 * - Calls GBP API with business info from the row; logs GBP data.
 * - If GBP does not exist or fails, the whole thing fails (business profile is the moat).
 * - Then calls Gemini to grade the business and pull related data; logs that.
 * - Audit = GBP-based audit + Gemini insight; log the audit.
 * - options.defaultLocation is used when prospect has no city (e.g. from Settings).
 * - Returns combined audit with gbpRaw and insight for the modal.
 */
export async function getScrapedDataForDemo(
	prospect: Prospect,
	options?: ScrapedDataOptions
): Promise<ScrapedDataResult> {
	const errors: { dataforseo?: string; gemini?: string } = {};

	if (!isDataForSeoConfigured()) {
		errors.dataforseo = 'Places API not configured. Set GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY.';
		serverError('getScrapedDataForDemo', 'GBP required but not configured', errors);
		return { ok: false, errors };
	}

	const gbpResult = await fetchGbpForProspect(prospect, options);
	serverInfo('createDemo', 'GBP result', {
		ok: gbpResult.ok,
		...(gbpResult.ok ? { data: gbpResult.data } : { error: gbpResult.error })
	});
	if (!gbpResult.ok) {
		errors.dataforseo = gbpResult.error;
		serverError('getScrapedDataForDemo', 'GBP failed; demo requires business profile', errors);
		return { ok: false, errors };
	}

	const gbp = gbpResult.data;
	const insightResult = await generateInsightForProspect(prospect, gbp);
	serverInfo('createDemo', 'Gemini insight result', {
		ok: insightResult.ok,
		...(insightResult.ok ? { data: insightResult.data } : { error: insightResult.error })
	});
	if (!insightResult.ok) {
		errors.gemini = insightResult.error;
		serverError('getScrapedDataForDemo', 'Gemini insight failed', errors);
		return { ok: false, errors };
	}

	const baseAudit = buildAuditFromGbp(gbp, prospect);
	const audit: DemoAudit & { gbpRaw?: GbpData } = {
		...baseAudit,
		insight: insightResult.data
	};
	serverInfo('createDemo', 'Audit (GBP + insight)', audit);

	// AI-generated modal copy (optional; modal falls back to static copy if this fails)
	const modalCopyResult = await generateAuditModalCopy(prospect, audit);
	if (modalCopyResult.ok) {
		serverInfo('createDemo', 'Audit modal copy generated');
	} else {
		serverInfo('createDemo', 'Audit modal copy skipped (modal will use fallback)', {
			error: modalCopyResult.error
		});
	}

	const result = {
		...audit,
		...(modalCopyResult.ok ? { auditModalCopy: modalCopyResult.data } : {})
	};
	return { ok: true, data: result };
}

/**
 * Build a single message for the client and call logs from getScrapedDataForDemo errors.
 * Use when returning fail(503) so the user sees which source failed and why.
 */
export function formatScrapedDataErrorMessage(errors: {
	dataforseo?: string;
	gemini?: string;
}): string {
	const parts: string[] = ['Scraped data is required to run the demo.'];
	if (errors.dataforseo) parts.push(`Places API: ${errors.dataforseo}`);
	if (errors.gemini) parts.push(`Gemini: ${errors.gemini}`);
	if (parts.length === 1)
		parts.push('Configure Places API (GOOGLE_PLACES_API_KEY) or Gemini (GEMINI_API_KEY) in .env and try again.');
	return parts.join(' ');
}
