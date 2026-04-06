/**
 * Demo page by slug (prospect id or free_demo_requests id). When Claude-generated HTML exists in demo-html bucket, show banner + iframe + widgets.
 * Otherwise use stored demoPageJson or build from landingContent (theme-based).
 * For free demo slugs: show pending/done/failed state.
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { getScrapedDataForProspect, getFreeDemoRequestById, recordFreeDemoViewed } from '$lib/server/supabase';
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

	let prospect = await getProspectById(slug);
	// Free demo request: slug may be free_demo_requests.id
	if (!prospect) {
		const freeDemo = await getFreeDemoRequestById(slug);
		if (freeDemo) {
			if (freeDemo.status === 'pending' || freeDemo.status === 'creating') {
				return {
					freeDemoPending: true,
					freeDemoId: slug,
					freeDemoCompanyName: freeDemo.company_name ?? 'Your business',
					freeDemoIndustry: freeDemo.industry ?? 'dental',
					freeDemoEmail: freeDemo.email ?? ''
				};
			}
			if (freeDemo.status === 'failed') {
				return {
					freeDemoFailed: true,
					errorMessage:
						freeDemo.error_message ?? 'Demo generation failed. Sign in and create a demo from the dashboard, or contact support if this persists.'
				};
			}
			if (freeDemo.status === 'done' && freeDemo.demo_link) {
				const hasDemoHtml = await downloadDemoHtml(slug).then((html) => !!html?.trim());
				if (hasDemoHtml) {
					await recordFreeDemoViewed(slug);
					const industrySlug = (freeDemo.industry?.trim() || 'dental') as IndustrySlug;
					return {
						useCinematicDemo: true,
						prospectId: slug,
						industrySlug,
						companyName: freeDemo.company_name ?? 'Demo'
						/* Iframe loads via src=/demo/[slug]/page.html to avoid embedding HTML in load data. */
					};
				}
			}
		}
		throw error(404, 'Demo not found');
	}
	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(403, 'This demo is not available.');
	}

	const industrySlug = industryDisplayToSlug(prospect.industry);

	// Prefer self-hosted HTML in demo-html bucket (Claude-generated or legacy markdown → HTML)
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
			/* Iframe loads via src=/demo/[slug]/page.html to avoid embedding HTML in load data (</script> in HTML would break serialization). */
		};
	}

	// Standard demo: pageJson + theme (Svelte-rendered sections)
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

	// Always set hero and solution images (resolver returns registry fallbacks if needed)
	pageJson.hero.imageUrl = imageUrls.hero || pageJson.hero.imageUrl;
	if (pageJson.solution) {
		pageJson.solution.imageUrl = imageUrls.solution || pageJson.solution.imageUrl;
	}

	// Ensure logo has a valid URL (stored JSON may have empty or broken logoUrl)
	if (!pageJson.brand.logoUrl?.trim()) {
		pageJson.brand.logoUrl = '/logo/logo.png';
	}

	// Fill missing work item image URLs (stored demos may have empty imageUrl)
	if (pageJson.work?.items?.length) {
		const fallbackWorkImage = imageUrls.solution || pageJson.solution?.imageUrl || pageJson.hero.imageUrl;
		for (const item of pageJson.work.items) {
			if (!item.imageUrl?.trim()) {
				item.imageUrl = fallbackWorkImage;
			}
		}
	}

	// Fill missing testimonial avatar URLs (stored demos may have empty avatarUrl)
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
