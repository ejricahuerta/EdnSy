/**
 * GBP dental lead discovery: search Toronto/GTA for dental businesses (no website, fewer reviews),
 * save as prospects with provider 'gbp'. Used by dashboard Integrations and by the CLI script.
 */

import { env } from '$env/dynamic/private';
import { getSupabaseAdmin, tryIncrementPlacesUsage } from '$lib/server/supabase';
import { upsertProspect } from '$lib/server/prospects';

const PLACES_BASE = 'https://places.googleapis.com/v1';
export const GBP_DENTAL_DAILY_CAP = 25;
/** Only add businesses with fewer than this many reviews (need the most help). */
const MAX_REVIEWS = 50;
const TARGET_COUNT = 5;
const PAGE_SIZE = 20;
const GTA_RECT = {
	rectangle: {
		low: { latitude: 43.4, longitude: -79.8 },
		high: { latitude: 44.0, longitude: -78.7 }
	}
};

function getPlacesApiKey(): string {
	return (env.GOOGLE_PLACES_API_KEY ?? env.GOOGLE_MAPS_API_KEY ?? '').trim();
}

export function isPlacesConfiguredForGbp(): boolean {
	return getPlacesApiKey().length > 0;
}

/** Start of today UTC. */
function startOfTodayUtc(): string {
	const d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	return d.toISOString();
}

export type GbpDentalDailyStats = {
	todayCount: number;
	dailyCap: number;
};

/** How many GBP prospects this user has added today (UTC) and the cap. */
export async function getGbpDentalDailyStats(userId: string): Promise<GbpDentalDailyStats> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { todayCount: 0, dailyCap: GBP_DENTAL_DAILY_CAP };
	const todayStart = startOfTodayUtc();
	const { count, error } = await supabase
		.from('prospects')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('provider', 'gbp')
		.gte('created_at', todayStart);
	return {
		todayCount: error ? 0 : (count ?? 0),
		dailyCap: GBP_DENTAL_DAILY_CAP
	};
}

/** Normalize place id: API may return `id` or `name` (places/ChIJ...). */
function normalizePlaceId(p: { id?: string; name?: string }): string {
	if (p.id && p.id.length > 0) return p.id;
	if (typeof p.name === 'string' && p.name.startsWith('places/')) return p.name.slice(7);
	return (p.name as string) ?? '';
}

export type SearchDentalResult = {
	places: { id: string; displayName: string; formattedAddress: string }[];
	nextPageToken?: string;
};

/** Text Search (New) – dental in Toronto/GTA. */
async function searchDentalPlaces(
	apiKey: string,
	pageToken?: string
): Promise<SearchDentalResult> {
	const url = `${PLACES_BASE}/places:searchText`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': 'places.id,places.name,places.displayName,places.formattedAddress'
		},
		body: JSON.stringify({
			textQuery: 'dentist dental clinic',
			locationRestriction: GTA_RECT,
			regionCode: 'CA',
			pageSize: PAGE_SIZE,
			...(pageToken ? { pageToken } : {})
		}),
		signal: AbortSignal.timeout(20000)
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`Places search ${res.status}: ${body.slice(0, 200)}`);
	}
	const json = (await res.json()) as {
		places?: Array<{
			id?: string;
			name?: string;
			displayName?: { text?: string };
			formattedAddress?: string;
		}>;
		nextPageToken?: string;
	};
	const places = (json.places ?? []).map((p) => ({
		id: normalizePlaceId(p),
		displayName: p.displayName?.text ?? '',
		formattedAddress: p.formattedAddress ?? ''
	}));
	return { places, nextPageToken: json.nextPageToken };
}

/** Place Details (New) – by place id. */
async function getPlaceDetails(
	apiKey: string,
	placeId: string
): Promise<{
	displayName: string;
	formattedAddress: string;
	phone: string;
	websiteUri: string;
	userRatingCount: number;
} | null> {
	const url = `${PLACES_BASE}/places/${encodeURIComponent(placeId)}`;
	const fieldMask = [
		'displayName',
		'formattedAddress',
		'nationalPhoneNumber',
		'internationalPhoneNumber',
		'websiteUri',
		'userRatingCount'
	].join(',');
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': fieldMask
		},
		signal: AbortSignal.timeout(15000)
	});
	if (!res.ok) return null;
	const json = (await res.json()) as {
		displayName?: { text?: string };
		formattedAddress?: string;
		nationalPhoneNumber?: string;
		internationalPhoneNumber?: string;
		websiteUri?: string;
		userRatingCount?: number;
	};
	return {
		displayName: json.displayName?.text ?? '',
		formattedAddress: json.formattedAddress ?? '',
		phone: json.nationalPhoneNumber ?? json.internationalPhoneNumber ?? '',
		websiteUri: (json.websiteUri ?? '').trim(),
		userRatingCount: json.userRatingCount ?? 0
	};
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export type RunPullGbpDentalResult =
	| { ok: true; added: number; message: string }
	| { ok: false; message: string };

/**
 * Run one pull: search dental in GTA, filter no website + fewer reviews, add up to 5 as prospects.
 * Respects daily cap and Places API monthly usage.
 */
export async function runPullGbpDental(userId: string): Promise<RunPullGbpDentalResult> {
	const apiKey = getPlacesApiKey();
	if (!apiKey) {
		return { ok: false, message: 'Places API not configured. Set GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) in .env.' };
	}

	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return { ok: false, message: 'Database not configured.' };
	}

	const { todayCount, dailyCap } = await getGbpDentalDailyStats(userId);
	if (todayCount >= dailyCap) {
		return { ok: false, message: `Daily cap reached (${todayCount}/${dailyCap}). Try again tomorrow.` };
	}
	const remaining = dailyCap - todayCount;
	const toAdd = Math.min(TARGET_COUNT, remaining);

	const usageResult = await tryIncrementPlacesUsage();
	if (!usageResult?.allowed) {
		return { ok: false, message: 'Places API monthly limit reached. Resets next month.' };
	}

	const { data: existing } = await supabase
		.from('prospects')
		.select('provider_row_id')
		.eq('user_id', userId)
		.eq('provider', 'gbp');
	const existingIds = new Set((existing ?? []).map((r) => r.provider_row_id).filter(Boolean));

	const candidates: { placeId: string; name: string; address: string; phone: string; website?: string }[] = [];
	let totalSearched = 0;
	let nextPageToken: string | undefined;

	do {
		// Consume one Places usage per search (first page already consumed above)
		if (nextPageToken) {
			const pageUsage = await tryIncrementPlacesUsage();
			if (!pageUsage?.allowed) break;
		}

		let searchResult: SearchDentalResult;
		try {
			searchResult = await searchDentalPlaces(apiKey, nextPageToken);
		} catch (e) {
			return { ok: false, message: e instanceof Error ? e.message : 'Places search failed.' };
		}

		const places = searchResult.places.filter((p) => p.id.length > 0);
		totalSearched += places.length;
		nextPageToken = searchResult.nextPageToken;

		for (const place of places) {
			if (existingIds.has(place.id)) continue;
			const detailUsage = await tryIncrementPlacesUsage();
			if (!detailUsage?.allowed) break;
			const details = await getPlaceDetails(apiKey, place.id);
			if (!details) continue;
			if (details.userRatingCount >= MAX_REVIEWS) continue;
			candidates.push({
				placeId: place.id,
				name: details.displayName || place.displayName || 'Dental',
				address: details.formattedAddress || place.formattedAddress || '',
				phone: details.phone,
				website: details.websiteUri || undefined
			});
			existingIds.add(place.id);
		}

		if (candidates.length >= toAdd || !nextPageToken) break;
		if (candidates.length > 0) break;
	} while (nextPageToken);

	if (totalSearched === 0) {
		return { ok: true, added: 0, message: 'No dental places found in Toronto/GTA. Check API key and Places API (New) is enabled.' };
	}

	const picked = shuffle(candidates).slice(0, toAdd);
	let added = 0;
	for (const c of picked) {
		const { id, error } = await upsertProspect(userId, 'gbp', c.placeId, {
			companyName: c.name,
			email: '',
			website: c.website,
			phone: c.phone || undefined,
			industry: 'Dental',
			status: 'New'
		});
		if (id && !error) added++;
	}

	if (added === 0) {
		return {
			ok: true,
			added: 0,
			message: `Searched ${totalSearched} place(s); none had fewer than ${MAX_REVIEWS} reviews. Try again later or in a different region.`
		};
	}
	return {
		ok: true,
		added,
		message: `Added ${added} dental prospect(s). Today: ${todayCount + added}/${dailyCap}.`
	};
}
