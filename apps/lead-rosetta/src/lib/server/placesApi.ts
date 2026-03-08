/**
 * Google Places API (New) client for business lookup.
 * Used as the source for GBP-like data (name, address, phone, website, rating, hours).
 * One lookup = 1 Text Search + 1 Place Details. Usage is gated by tryIncrementPlacesUsage() in gbp.ts.
 */

import { env } from '$env/dynamic/private';
import { serverInfo, serverError, serverDebug } from '$lib/server/logger';
import type { Prospect } from '$lib/server/prospects';

const PLACES_BASE = 'https://places.googleapis.com/v1';

/** Same shape as GbpData in gbp.ts so we can return it without importing (avoid circular deps). */
export type PlacesGbpData = {
	name: string;
	industry: string;
	address: string;
	phone: string;
	website: string;
	ratingValue: number | null;
	ratingCount: number;
	reviews: { text: string; rating?: number; date?: string }[];
	isClaimed: boolean;
	workHours?: unknown;
};

export type PlacesGbpResult =
	| { ok: true; data: PlacesGbpData }
	| { ok: false; error: string };

function getApiKey(): string {
	return (env.GOOGLE_PLACES_API_KEY ?? env.GOOGLE_MAPS_API_KEY ?? '').trim();
}

export function isPlacesConfigured(): boolean {
	return getApiKey().length > 0;
}

/** Keyword variants for search (e.g. without INC., with & for and). */
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

/** Build text query for Places: "Business Name, Location". */
function buildTextQuery(companyName: string, locationStr: string): string {
	const name = companyName.trim() || 'Business';
	const loc = locationStr.trim();
	return loc ? `${name}, ${loc}` : name;
}

/**
 * Text Search (New) - returns first place id (and optional displayName/address).
 * Field mask: id, displayName, formattedAddress (Pro) to get a usable first result.
 */
async function textSearch(textQuery: string): Promise<{ id: string; displayName?: string; formattedAddress?: string } | null> {
	const apiKey = getApiKey();
	if (!apiKey) return null;
	const url = `${PLACES_BASE}/places:searchText`;
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
		},
		body: JSON.stringify({ textQuery }),
		signal: AbortSignal.timeout(15000)
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		serverError('placesApi.textSearch', `status ${res.status}`, body.slice(0, 200));
		return null;
	}
	const json = (await res.json()) as { places?: Array<{ id?: string; displayName?: { text?: string }; formattedAddress?: string }> };
	const places = json.places ?? [];
	const first = places[0];
	const textSearchResponse = {
		textQuery,
		placesCount: places.length,
		firstPlace: first
			? { id: first.id, displayName: first.displayName?.text, formattedAddress: first.formattedAddress }
			: null
	};
	serverDebug('placesApi.textSearch', 'response', textSearchResponse);
	serverInfo('placesApi.textSearch', 'response', textSearchResponse);
	if (!first?.id) return null;
	return {
		id: first.id,
		displayName: first.displayName?.text,
		formattedAddress: first.formattedAddress
	};
}

/**
 * Place Details (New) - get full details by place id.
 * Request Pro + Enterprise fields: displayName, formattedAddress, nationalPhoneNumber, internationalPhoneNumber, websiteUri, rating, userRatingCount, regularOpeningHours, businessStatus.
 */
async function placeDetails(placeId: string): Promise<{
	displayName?: string;
	formattedAddress?: string;
	nationalPhoneNumber?: string;
	internationalPhoneNumber?: string;
	websiteUri?: string;
	rating?: number;
	userRatingCount?: number;
	regularOpeningHours?: unknown;
	businessStatus?: string;
} | null> {
	const apiKey = getApiKey();
	if (!apiKey) return null;
	const url = `${PLACES_BASE}/places/${encodeURIComponent(placeId)}`;
	const fieldMask = [
		'displayName',
		'formattedAddress',
		'nationalPhoneNumber',
		'internationalPhoneNumber',
		'websiteUri',
		'rating',
		'userRatingCount',
		'regularOpeningHours',
		'businessStatus'
	].join(',');
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': fieldMask
		},
		signal: AbortSignal.timeout(15000)
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		serverError('placesApi.placeDetails', `status ${res.status}`, body.slice(0, 200));
		return null;
	}
	const json = (await res.json()) as {
		displayName?: { text?: string };
		formattedAddress?: string;
		nationalPhoneNumber?: string;
		internationalPhoneNumber?: string;
		websiteUri?: string;
		rating?: number;
		userRatingCount?: number;
		regularOpeningHours?: unknown;
		businessStatus?: string;
	};
	const placeDetailsResponse = {
		placeId,
		displayName: json.displayName?.text,
		formattedAddress: json.formattedAddress,
		nationalPhoneNumber: json.nationalPhoneNumber,
		internationalPhoneNumber: json.internationalPhoneNumber,
		websiteUri: json.websiteUri,
		rating: json.rating,
		userRatingCount: json.userRatingCount,
		regularOpeningHours: json.regularOpeningHours,
		businessStatus: json.businessStatus
	};
	serverDebug('placesApi.placeDetails', 'response', { placeId });
	serverInfo('placesApi.placeDetails', 'response', placeDetailsResponse);
	return {
		displayName: json.displayName?.text,
		formattedAddress: json.formattedAddress,
		nationalPhoneNumber: json.nationalPhoneNumber,
		internationalPhoneNumber: json.internationalPhoneNumber,
		websiteUri: json.websiteUri,
		rating: json.rating,
		userRatingCount: json.userRatingCount,
		regularOpeningHours: json.regularOpeningHours,
		businessStatus: json.businessStatus
	};
}

/**
 * Fetch business data for a prospect using Places API (Text Search + Place Details).
 * Tries keyword variants and optional location; returns normalized data compatible with GbpData.
 */
export async function fetchGbpFromPlaces(
	prospect: Prospect,
	options?: { defaultLocation?: string | null }
): Promise<PlacesGbpResult> {
	const apiKey = getApiKey();
	if (!apiKey) {
		return { ok: false, error: 'Places API not configured (GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY)' };
	}
	const companyName = (prospect.companyName ?? '').trim();
	if (!companyName) {
		return { ok: false, error: 'Business name is required' };
	}
	const locationStr = (prospect.city ?? '').trim() || (options?.defaultLocation ?? '').trim() || 'United States';
	const keywordVariants = getKeywordVariants(companyName);

	serverInfo('placesApi', 'Lookup', { companyName, location: locationStr, variants: keywordVariants.length });

	for (const keyword of keywordVariants) {
		const textQuery = buildTextQuery(keyword, locationStr);
		serverDebug('placesApi', 'textSearch', { textQuery });
		const searchResult = await textSearch(textQuery);
		if (!searchResult) continue;
		serverDebug('placesApi', 'placeDetails', { placeId: searchResult.id });
		const details = await placeDetails(searchResult.id);
		if (!details) continue;
		const name = details.displayName ?? searchResult.displayName ?? companyName;
		const address = details.formattedAddress ?? searchResult.formattedAddress ?? '';
		const phone = details.nationalPhoneNumber ?? details.internationalPhoneNumber ?? '';
		const website = details.websiteUri ?? '';
		const ratingValue = details.rating ?? null;
		const ratingCount = details.userRatingCount ?? 0;
		// Infer claimed: Places API does not expose GMB "claimed" flag. Treat as claimed when operational or when listing has website + (hours or reviews).
		const isClaimed =
			details.businessStatus === 'OPERATIONAL' ||
			(!!website && (!!details.regularOpeningHours || (ratingCount ?? 0) >= 1));
		serverInfo('placesApi', 'Found place', { keyword, placeId: searchResult.id, name });
		const gbp: PlacesGbpData = {
			name,
			industry: (prospect.industry ?? '').trim() || 'Professional',
			address,
			phone,
			website,
			ratingValue,
			ratingCount,
			reviews: [],
			isClaimed,
			workHours: details.regularOpeningHours
		};
		return { ok: true, data: gbp };
	}

	serverError('placesApi', 'No place found after variants', { keywordVariants, companyName });
	return { ok: false, error: 'GBP not found or unavailable' };
}
