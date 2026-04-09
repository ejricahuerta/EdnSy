/**
 * Apify Google Maps / Places scraper integration (server-only).
 * Actor: compass/crawler-google-places (Apify store id compass~crawler-google-places).
 */

import { createHash } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { gbpCategoriesToIndustryLabel, INDUSTRY_LABELS, type IndustrySlug } from '$lib/industries';
import { serverError, serverInfo } from '$lib/server/logger';
import { getApifyApiTokenForUser } from '$lib/server/apifyToken';

const APIFY_ACTOR_ID = 'compass~crawler-google-places';
const APIFY_SYNC_URL = `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR_ID)}/run-sync-get-dataset-items`;

/** Search term per industry slug for Google Maps searchStringsArray. */
export const INDUSTRY_SEARCH_TERMS: Record<IndustrySlug, string> = {
	dental: 'dental',
	legal: 'law firm',
	medical: 'medical clinic',
	fitness: 'gym',
	restaurant: 'restaurant',
	beauty: 'hair salon',
	'home-services': 'home services',
	'real-estate': 'real estate',
	accounting: 'accountant',
	other: 'local business'
};

function getToken(): string {
	return (env.APIFY_API_TOKEN ?? '').trim();
}

export function isApifyConfigured(): boolean {
	return getToken().length > 0;
}

export async function getApifyEffectiveTokenForUser(userId: string): Promise<string> {
	const userToken = await getApifyApiTokenForUser(userId);
	if (userToken && userToken.trim().length > 0) return userToken.trim();
	return getToken();
}

export async function isApifyConfiguredForUser(userId: string): Promise<boolean> {
	return (await getApifyEffectiveTokenForUser(userId)).length > 0;
}

export function buildApifyPayload(industrySlug: IndustrySlug, locationQuery: string): Record<string, unknown> {
	const term = INDUSTRY_SEARCH_TERMS[industrySlug] ?? INDUSTRY_SEARCH_TERMS.other;
	return {
		includeWebResults: false,
		language: 'en',
		locationQuery: locationQuery.trim(),
		maxCrawledPlacesPerSearch: 200,
		maxReviews: 0,
		maximumLeadsEnrichmentRecords: 0,
		scrapeContacts: true,
		scrapeDirectories: false,
		scrapeImageAuthors: false,
		scrapePlaceDetailPage: false,
		scrapeReviewsPersonalData: true,
		scrapeSocialMediaProfiles: {
			facebooks: true,
			instagrams: true,
			tiktoks: true,
			twitters: true,
			youtubes: true
		},
		scrapeTableReservationProvider: false,
		searchStringsArray: [term],
		skipClosedPlaces: true,
		website: 'allPlaces'
	};
}

export type ApifyRunResult =
	| { ok: true; items: unknown[] }
	| { ok: false; error: string };

/**
 * Runs the actor synchronously and returns dataset items (can take several minutes).
 */
export async function runApifyGoogleMapsScraper(
	payload: Record<string, unknown>,
	apiToken?: string
): Promise<ApifyRunResult> {
	const token = (apiToken ?? '').trim() || getToken();
	if (!token) {
		return { ok: false, error: 'Apify is not configured (APIFY_API_TOKEN)' };
	}
	const url = `${APIFY_SYNC_URL}?token=${encodeURIComponent(token)}`;
	serverInfo('apify', 'run-sync start', { locationQuery: payload.locationQuery });
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		signal: AbortSignal.timeout(300_000)
	});
	const text = await res.text().catch(() => '');
	if (!res.ok) {
		serverError('apify', `run-sync failed (${res.status}): ${text.slice(0, 500)}`);
		return {
			ok: false,
			error: `Apify request failed (${res.status}): ${text.slice(0, 200) || res.statusText}`
		};
	}
	try {
		const items = JSON.parse(text) as unknown;
		const list = Array.isArray(items) ? items : [];
		serverInfo('apify', 'run-sync done', { count: list.length });
		return { ok: true, items: list };
	} catch {
		serverError('apify', 'invalid JSON response', text.slice(0, 300));
		return { ok: false, error: 'Apify returned invalid JSON' };
	}
}

export type ApifyProspectFields = {
	companyName: string;
	email: string;
	website?: string;
	phone?: string;
	industry?: string;
	providerRowId: string;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string {
	for (const k of keys) {
		const v = obj[k];
		if (typeof v === 'string' && v.trim()) return v.trim();
	}
	return '';
}

function normalizeEmail(value: string): string {
	const trimmed = value.trim().toLowerCase();
	const cleaned = trimmed.replace(/^mailto:/, '').split(/[?#]/)[0]?.trim() ?? '';
	const m = cleaned.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
	return m ? m[0].slice(0, 500) : '';
}

function pickEmailInUnknown(input: unknown): string {
	if (typeof input === 'string') return normalizeEmail(input);
	if (Array.isArray(input)) {
		for (const item of input) {
			const found = pickEmailInUnknown(item);
			if (found) return found;
		}
		return '';
	}
	if (input && typeof input === 'object') {
		const obj = input as Record<string, unknown>;
		// Prefer explicit email-like keys first.
		for (const key of [
			'email',
			'emails',
			'contactEmail',
			'contact_email',
			'businessEmail',
			'business_email',
			'emailsFromWebsite',
			'emails_from_website',
			'extractedEmails',
			'publicEmails',
			'public_emails'
		]) {
			if (key in obj) {
				const found = pickEmailInUnknown(obj[key]);
				if (found) return found;
			}
		}
		// Fallback: scan remaining values (depth-first).
		for (const v of Object.values(obj)) {
			const found = pickEmailInUnknown(v);
			if (found) return found;
		}
	}
	return '';
}

function deriveEmailFromWebsite(website: string): string {
	const w = website.trim();
	if (!w) return '';
	try {
		const url = new URL(w.startsWith('http://') || w.startsWith('https://') ? w : `https://${w}`);
		const host = url.hostname.toLowerCase().replace(/^www\./, '').trim();
		if (!host || !host.includes('.')) return '';
		return `info@${host}`.slice(0, 500);
	} catch {
		return '';
	}
}

function pickFirstEmail(obj: Record<string, unknown>, website?: string): string {
	const fromRow = pickEmailInUnknown(obj);
	if (fromRow) return fromRow;
	return deriveEmailFromWebsite(website ?? '');
}

function stableRowId(userId: string, placeId: string, title: string, address: string): string {
	const pid = placeId.trim();
	if (pid) return `apify:${pid.slice(0, 200)}`;
	const base = `${userId}|${title}|${address}`;
	const h = createHash('sha256').update(base).digest('hex').slice(0, 40);
	return `apify:${h}`;
}

/**
 * Map Apify dataset rows to prospect insert fields. Skips rows without a usable business name.
 */
export function apifyResultsToProspects(
	items: unknown[],
	userId: string,
	defaultIndustrySlug: IndustrySlug
): ApifyProspectFields[] {
	const defaultLabel = INDUSTRY_LABELS[defaultIndustrySlug] ?? 'Other';
	const out: ApifyProspectFields[] = [];
	for (const raw of items) {
		if (!raw || typeof raw !== 'object') continue;
		const row = raw as Record<string, unknown>;
		const title =
			pickString(row, ['title', 'name', 'businessName', 'business_name']) ||
			pickString(row, ['displayName', 'display_name']);
		if (!title) continue;
		const address = pickString(row, ['address', 'formattedAddress', 'formatted_address']);
		const placeId = pickString(row, ['placeId', 'place_id', 'cid']);
		const website = pickString(row, ['website', 'websiteUrl', 'website_uri']);
		const phone = pickString(row, ['phone', 'phoneNumber', 'phoneUnformatted', 'phone_unformatted']);
		const category = pickString(row, ['categoryName', 'category', 'type']);
		const industryFromCategory = category ? gbpCategoriesToIndustryLabel(category) : null;
		const industry = industryFromCategory ?? defaultLabel;
		const email = pickFirstEmail(row, website);
		const providerRowId = stableRowId(userId, placeId, title, address);
		out.push({
			companyName: title.slice(0, 500),
			email: email || '',
			website: website || undefined,
			phone: phone || undefined,
			industry,
			providerRowId
		});
	}
	return out;
}
