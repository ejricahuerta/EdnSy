/**
 * GBP (Google Business Profile) scraping via DataForSEO Business Data API.
 * Fetches business info (name, address, phone, website, rating, etc.) and optionally
 * builds a DemoAudit for demo pages. Used when creating demos; falls back to
 * generateAuditForProspect (Gemini) when not configured or when fetch fails.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { serverError, serverInfo } from '$lib/server/logger';
import type { DemoAudit } from '$lib/types/demo';
import { generateInsightForProspect, generateInsightFromBusinessName, generateAuditModalCopy } from '$lib/server/insights';

export type ScrapedDataResult =
	| { ok: true; data: DemoAudit & { gbpRaw?: GbpData } }
	| { ok: false; errors: { dataforseo?: string; gemini?: string } };

/**
 * DataForSEO API usage (per dashboard instructions):
 * 1. POST to task_post URL with JSON body (keyword, location_name, language_code).
 * 2. Authorization: Basic base64(login:password) from API CREDENTIALS.
 * 3. GET task_get/$id to obtain results; poll until result is ready.
 */
const BASE_URL = 'https://api.dataforseo.com/v3/business_data/google/my_business_info';
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_WAIT_MS = 90_000; // DataForSEO can take 30–60s; stay under overall demo timeout
const TASK_SUCCESS = 20000;
const TASK_CREATED = 20100; // task in progress
/** 40601 Task Handed, 40602 Task in Queue – keep polling */
const TASK_PROCESSING = new Set([20100, 40601, 40602]);

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

function getConfig(): {
	login: string;
	password: string;
	location: string;
	language: string;
} {
	const login = (env.DATAFORSEO_LOGIN ?? '').trim();
	const password = (env.DATAFORSEO_PASSWORD ?? '').trim();
	const location = (env.DATAFORSEO_DEFAULT_LOCATION ?? 'Toronto,Ontario,Canada').trim();
	const language = (env.DATAFORSEO_DEFAULT_LANGUAGE_CODE ?? 'en').trim();
	return { login, password, location, language };
}

const FALLBACK_DEFAULT_LOCATION = 'Toronto,Ontario,Canada';
/** When primary location (e.g. Canada) finds nothing, try this as fallback (many listings are US). DataForSEO expects City,State,Country. */
const FALLBACK_LOCATION_US = 'Houston,Texas,United States';

/** Build location_name for DataForSEO from prospect (city) or default. Use defaultLocationOverride when prospect has no city (e.g. from user settings). */
function getLocationForProspect(
	prospect: Prospect,
	defaultLocationOverride?: string | null
): string {
	const city = (prospect.city ?? '').trim();
	if (city) {
		// DataForSEO format: "City,Region,Country". Without state use "City,,United States".
		return `${city},,United States`;
	}
	const override = (defaultLocationOverride ?? '').trim();
	if (override) return override;
	return (env.DATAFORSEO_DEFAULT_LOCATION ?? FALLBACK_DEFAULT_LOCATION).trim();
}

/**
 * Return keyword variants to try for GBP lookup. Many listings omit "INC." / "LLC." or use "&" for "and".
 * Order: normalized (no suffix), then with "&" for "and", then original.
 */
function getKeywordVariants(companyName: string): string[] {
	const raw = companyName.trim();
	if (!raw) return [];
	const normalized = raw
		.replace(/\s+(INC\.?|LLC\.?|L\.L\.C\.?|CORP\.?|CO\.?|LTD\.?|L\.P\.?|PLC\.?)\s*$/i, '')
		.trim();
	const normalizedAmp = (normalized || raw).replace(/\s+and\s+/gi, ' & ');
	const rawAmp = raw.replace(/\s+and\s+/gi, ' & ');
	const seen = new Set<string>();
	const out: string[] = [];
	for (const k of [normalized || raw, normalizedAmp, raw, rawAmp]) {
		if (k && !seen.has(k)) {
			seen.add(k);
			out.push(k);
		}
	}
	return out;
}

export function isDataForSeoConfigured(): boolean {
	const { login, password } = getConfig();
	return !!(login && password);
}

function authHeader(): string {
	const { login, password } = getConfig();
	const cred = Buffer.from(`${login}:${password}`, 'utf8').toString('base64');
	return `Basic ${cred}`;
}

/** POST task; returns task id or null on failure. */
async function postTask(keyword: string, locationName: string, languageCode: string): Promise<string | null> {
	const res = await fetch(`${BASE_URL}/task_post`, {
		method: 'POST',
		headers: {
			Authorization: authHeader(),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify([
			{
				keyword,
				location_name: locationName,
				language_code: languageCode
			}
		]),
		signal: AbortSignal.timeout(15000)
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		serverError('gbp', `task_post status ${res.status}`, body.slice(0, 200));
		if (res.status === 401) {
			serverError(
				'gbp',
				'401 Unauthorized: check DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env (https://app.dataforseo.com/api-access). Restart dev server after changing .env.'
			);
		}
		return null;
	}

	const json = (await res.json()) as {
		status_code?: number;
		tasks?: { id?: string; status_code?: number }[];
	};
	const taskId = json.tasks?.[0]?.id;
	if (!taskId || (json.tasks?.[0]?.status_code !== TASK_CREATED && json.tasks?.[0]?.status_code !== TASK_SUCCESS)) {
		serverError('gbp', 'task_post unexpected response', { status_code: json.status_code, task: json.tasks?.[0]?.status_code });
		return null;
	}
	return taskId;
}

/** GET task result by id. Returns parsed result items and status. */
async function getTaskResult(taskId: string): Promise<{
	items: RawGoogleBusinessInfo[];
	statusCode: number;
} | null> {
	const res = await fetch(`${BASE_URL}/task_get/${taskId}`, {
		headers: {
			Authorization: authHeader(),
			'Content-Type': 'application/json'
		},
		signal: AbortSignal.timeout(20000)
	});

	if (!res.ok) return null;

	const json = (await res.json()) as {
		status_code?: number;
		tasks?: {
			status_code?: number;
			result?: Array<{
				items?: RawGoogleBusinessInfo[];
			}>;
		}[];
	};

	const task = json.tasks?.[0];
	if (!task) return null;

	const result = task.result?.[0];
	const items = result?.items ?? [];
	const statusCode = task.status_code ?? 0;

	return { items, statusCode };
}

/** Raw item shape from DataForSEO my_business_info task_get (subset we use). */
type RawGoogleBusinessInfo = {
	type?: string;
	title?: string;
	category?: string;
	address?: string;
	phone?: string;
	url?: string;
	domain?: string;
	rating?: { value?: number; votes_count?: number };
	is_claimed?: boolean;
	work_hours?: unknown;
	cid?: string;
};

function parseFirstItem(items: RawGoogleBusinessInfo[]): GbpData | null {
	const item = items.find((i) => i.type === 'google_business_info') ?? items[0];
	if (!item) return null;

	const title = (item.title ?? '').trim();
	const address = (item.address ?? '').trim();
	const phone = (item.phone ?? '').trim();
	const url = (item.url ?? '').trim() || (item.domain ? `https://${item.domain}` : '');
	const category = (item.category ?? '').trim();
	const ratingValue = item.rating?.value ?? null;
	const ratingCount = item.rating?.votes_count ?? 0;

	return {
		name: title || 'Unknown',
		industry: category || 'General',
		address,
		phone,
		website: url,
		ratingValue,
		ratingCount,
		reviews: [], // v1: no review text from my_business_info; add later via Reviews API if needed
		isClaimed: !!item.is_claimed,
		workHours: item.work_hours
	};
}

export type GbpOptions = { defaultLocation?: string | null };

/**
 * Fetch GBP data for a prospect. Uses DataForSEO my_business_info (async: POST then poll).
 * Tries keyword variants (e.g. without "INC.", with "&" instead of "and") and prospect city for location.
 * Use options.defaultLocation when prospect has no city (e.g. from user settings).
 * Returns normalized GbpData or error.
 */
export async function fetchGbpForProspect(
	prospect: Prospect,
	options?: GbpOptions
): Promise<GbpResult> {
	const { login, password, language } = getConfig();
	if (!login || !password) {
		return { ok: false, error: 'DataForSEO not configured' };
	}

	const keywordVariants = getKeywordVariants(prospect.companyName ?? '');
	if (keywordVariants.length === 0) {
		return { ok: false, error: 'Business name is required' };
	}

	const primaryLocation = getLocationForProspect(prospect, options?.defaultLocation);
	const locationsToTry: string[] = [primaryLocation];
	// If primary is Canada (or similar), try US as fallback — many businesses are US-only in DataForSEO
	if (primaryLocation.toLowerCase().includes('canada') && !primaryLocation.toLowerCase().includes('united states')) {
		locationsToTry.push(FALLBACK_LOCATION_US);
	}

	for (const location of locationsToTry) {
		if (location !== primaryLocation) {
			serverInfo('gbp', 'Trying fallback location', { location, companyName: prospect.companyName });
		}
		for (const keyword of keywordVariants) {
			const taskId = await postTask(keyword, location, language);
			if (!taskId) {
				continue;
			}

			const deadline = Date.now() + POLL_MAX_WAIT_MS;
			while (Date.now() < deadline) {
				const result = await getTaskResult(taskId);
				if (!result) {
					await sleep(POLL_INTERVAL_MS);
					continue;
				}
				if (result.statusCode === TASK_SUCCESS) {
					const gbp = parseFirstItem(result.items);
					if (gbp) {
						serverInfo('gbp', 'Found with keyword', { keyword, location });
						return { ok: true, data: gbp };
					}
					// Task finished but no business in result; try next keyword
					serverInfo('gbp', 'Task finished but no business returned', {
						keyword,
						location,
						itemsCount: result.items.length
					});
					break;
				}
				// 20100/40601/40602 = still processing; 40102 = No Search Results; other = terminal error
				if (!TASK_PROCESSING.has(result.statusCode)) {
					if (result.statusCode === 40102) {
						serverInfo('gbp', 'DataForSEO returned 40102 No Search Results', { keyword, location });
					}
					break;
				}
				await sleep(POLL_INTERVAL_MS);
			}
		}
	}

	serverError('gbp', 'GBP not found after trying keyword variants', {
		keywordVariants,
		locationsTried: locationsToTry,
		companyName: prospect.companyName
	});
	return { ok: false, error: 'GBP not found or unavailable' };
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
		industry: (prospect.industry ?? '').trim() || 'General',
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
		errors.dataforseo = 'DataForSEO not configured. Business profile (GBP) is required; set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.';
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
	if (errors.dataforseo) parts.push(`DataForSEO: ${errors.dataforseo}`);
	if (errors.gemini) parts.push(`Gemini: ${errors.gemini}`);
	if (parts.length === 1) parts.push('Configure DataForSEO (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD) or Gemini (GEMINI_API_KEY) in .env and try again.');
	return parts.join(' ');
}
