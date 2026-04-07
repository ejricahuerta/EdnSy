/**
 * Demo page by slug (prospect id). When Claude-generated HTML exists in demo-html bucket, show banner + iframe + widgets.
 * Otherwise use stored demoPageJson or build from landingContent (theme-based).
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { getScrapedDataForProspect } from '$lib/server/supabase';
import { industryDisplayToSlug } from '$lib/industries';
import { getThemeForLayout, getV13ThemeForTone, getLayoutForTheme } from '$lib/demo';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';
import type { DemoLandingContent, DemoPageJson } from '$lib/demo';
import { buildDemoPageJsonForTheme, applyReviewsToDemoPageJson, getDemoImageUrlsFull, downloadDemoHtml } from '$lib/server/demo';
import type { IndustrySlug } from '$lib/industries';

const VALID_TONES: ToneSlug[] = ['luxury', 'rugged', 'soft-calm', 'professional', 'friendly', 'minimal'];

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug?.trim();
	if (!slug) throw error(404, 'Demo not found');

	const prospect = await getProspectById(slug);
	if (!prospect) throw error(404, 'Demo not found');

	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(403, 'This demo is not available.');
	}

	const industrySlug = industryDisplayToSlug(prospect.industry);

	const scraped = await getScrapedDataForProspect(slug);
	const hasDemoHtml = await downloadDemoHtml(slug).then((html) => !!html?.trim());
	if (hasDemoHtml) {
		const gbpName = (scraped as { gbpRaw?: { name?: string } } | null)?.gbpRaw?.name;
		const companyName = prospect.companyName ?? gbpName ?? 'Demo';
		return {
			useCinematicDemo: true,
			prospectId: slug,
			industrySlug,
			companyName
		};
	}

	const storedPageJson = (scraped as Record<string, unknown> | null)?.demoPageJson as
		| DemoPageJson
		| undefined
		| null;

	let theme: string;
	let layout: string;
	let pageJson: DemoPageJson;

	if (storedPageJson && typeof storedPageJson === 'object' && storedPageJson.meta?.title) {
		pageJson = storedPageJson;
		layout = storedPageJson.hero?.type ?? 'split';
		theme = getThemeForLayout(layout);
	} else {
		const scrapedTone = (scraped as Record<string, unknown> | null)?.tone as string | undefined;
		const tone = scrapedTone && VALID_TONES.includes(scrapedTone as ToneSlug) ? (scrapedTone as ToneSlug) : DEFAULT_TONE;
		theme = getV13ThemeForTone(tone);
		layout = getLayoutForTheme(theme as import('$lib/demo').V13Theme);
		const landingContent = (scraped as Record<string, unknown> | null)?.landingContent as
			| DemoLandingContent
			| undefined
			| null;
		pageJson = buildDemoPageJsonForTheme(
			prospect,
			theme as import('$lib/demo').V13Theme,
			landingContent ?? undefined,
			industrySlug
		);
	}

	const gbpRaw = (scraped as { gbpRaw?: { reviews?: Array<{ text: string; rating?: number }> } } | null)?.gbpRaw;
	applyReviewsToDemoPageJson(pageJson, prospect, industrySlug, gbpRaw);

	const imageUrls = await getDemoImageUrlsFull(industrySlug as IndustrySlug, prospect.industry, {
		companyName: prospect.companyName ?? undefined
	});

	pageJson.hero.imageUrl = imageUrls.hero || pageJson.hero.imageUrl;
	if (pageJson.solution) {
		pageJson.solution.imageUrl = imageUrls.solution || pageJson.solution.imageUrl;
	}

	if (!pageJson.brand.logoUrl?.trim()) {
		pageJson.brand.logoUrl = '/logo/logo.png';
	}

	if (pageJson.work?.items?.length) {
		const fallbackWorkImage = imageUrls.solution || pageJson.solution?.imageUrl || pageJson.hero.imageUrl;
		for (const item of pageJson.work.items) {
			if (!item.imageUrl?.trim()) {
				item.imageUrl = fallbackWorkImage;
			}
		}
	}

	if (pageJson.testimonials?.items?.length && imageUrls.testimonialAvatar) {
		for (const rev of pageJson.testimonials.items) {
			if (!rev.avatarUrl?.trim()) {
				rev.avatarUrl = imageUrls.testimonialAvatar;
			}
		}
	}

	return {
		useCinematicDemo: false,
		pageJson,
		theme,
		layout,
		prospectId: slug,
		industrySlug
	};
};
