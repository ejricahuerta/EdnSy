/**
 * GET /api/demo/[slug]/page.json — return v1.3 page.json for this demo (by prospect id).
 * One JSON per demo; used for export or embedding.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { getScrapedDataForProspect } from '$lib/server/supabase';
import { getV13ThemeForTone } from '$lib/demo';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';
import { buildDemoPageJsonForTheme } from '$lib/server/demo';
import type { DemoLandingContent } from '$lib/demo';
import type { DemoPageJson } from '$lib/demo';

const VALID_TONES: ToneSlug[] = ['luxury', 'rugged', 'soft-calm', 'professional', 'friendly', 'minimal'];

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug?.trim();
	if (!slug) throw error(404, 'Not found');

	const prospect = await getProspectById(slug);
	if (!prospect) throw error(404, 'Demo not found');
	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(403, 'Not available');
	}

	const scraped = await getScrapedDataForProspect(slug);
	const storedPageJson = (scraped as Record<string, unknown> | null)?.demoPageJson as
		| DemoPageJson
		| undefined
		| null;

	let pageJson: DemoPageJson;
	if (storedPageJson && typeof storedPageJson === 'object' && storedPageJson.meta?.title) {
		pageJson = storedPageJson;
	} else {
		const scrapedTone = (scraped as Record<string, unknown> | null)?.tone as string | undefined;
		const tone = scrapedTone && VALID_TONES.includes(scrapedTone as ToneSlug) ? (scrapedTone as ToneSlug) : DEFAULT_TONE;
		const theme = getV13ThemeForTone(tone);
		const landingContent = (scraped as Record<string, unknown> | null)?.landingContent as
			| DemoLandingContent
			| undefined
			| null;
		pageJson = buildDemoPageJsonForTheme(prospect, theme, landingContent ?? undefined);
	}

	return new Response(JSON.stringify(pageJson, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=300'
		}
	});
};
