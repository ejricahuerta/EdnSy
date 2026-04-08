import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

function getPlacesKey(): string {
	return (env.GOOGLE_PLACES_API_KEY ?? env.GOOGLE_MAPS_API_KEY ?? '').trim();
}

export type PlaceAutocompleteSuggestion = {
	placeId: string;
	mainText: string;
	secondaryText: string;
	fullText: string;
};

/**
 * GET /api/places/autocomplete?input=Richmond+Hill
 * Proxies Google Places API (New) Autocomplete for city / subregion.
 */
export const GET: RequestHandler = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	const apiKey = getPlacesKey();
	if (!apiKey) {
		return apiError(503, 'Places API not configured');
	}

	const input = (event.url.searchParams.get('input') ?? '').trim();
	if (input.length < 2) {
		return apiSuccess({ suggestions: [] as PlaceAutocompleteSuggestion[] });
	}

	const url = 'https://places.googleapis.com/v1/places:autocomplete';
	const body = {
		input: input.slice(0, 200),
		includedPrimaryTypes: ['locality', 'administrative_area_level_2'],
		languageCode: 'en'
	};

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': apiKey
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(12000)
		});
		const text = await res.text().catch(() => '');
		if (!res.ok) {
			serverError('places/autocomplete', `HTTP ${res.status}`, text.slice(0, 200));
			return apiError(res.status, 'Autocomplete request failed');
		}
		const json = JSON.parse(text) as {
			suggestions?: Array<{
				placePrediction?: {
					placeId?: string;
					text?: { text?: string };
					structuredFormat?: {
						mainText?: { text?: string };
						secondaryText?: { text?: string };
					};
				};
			}>;
		};
		const raw = json.suggestions ?? [];
		const suggestions: PlaceAutocompleteSuggestion[] = [];
		for (const s of raw) {
			const p = s.placePrediction;
			if (!p?.placeId) continue;
			const fullText = p.text?.text?.trim() ?? '';
			const mainText = p.structuredFormat?.mainText?.text?.trim() ?? fullText;
			const secondaryText = p.structuredFormat?.secondaryText?.text?.trim() ?? '';
			suggestions.push({
				placeId: p.placeId,
				mainText,
				secondaryText,
				fullText: fullText || [mainText, secondaryText].filter(Boolean).join(', ')
			});
		}
		return apiSuccess({ suggestions: suggestions.slice(0, 12) });
	} catch (e) {
		serverError('places/autocomplete', e instanceof Error ? e.message : String(e));
		return apiError(502, 'Autocomplete unavailable');
	}
};
