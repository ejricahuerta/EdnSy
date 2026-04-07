/**
 * Server-only demo: job processing, page.json build, storage, landing content, images.
 * Use for demo creation and serving. For status/themes/tracking and types, use $lib/demo.
 */

export { processOneDemoJob } from '$lib/server/processDemoJob';
export type { ProcessJobResult } from '$lib/server/processDemoJob';
export { processOneInsightsJob } from '$lib/server/processInsightsJob';
export type { ProcessInsightsJobResult } from '$lib/server/processInsightsJob';
export { processOneGbpJob } from '$lib/server/processGbpJob';
export type { ProcessGbpJobResult } from '$lib/server/processGbpJob';

export {
	buildDemoPageJsonFromAiContent,
	buildDemoPageJsonForTheme,
	applyReviewsToDemoPageJson,
	mapGbpReviewsToTestimonials,
	getFallbackTestimonialsForBusiness,
	buildDemoPageJson
} from '$lib/server/demoPageJson';
export type { DemoImageUrlsResolved, ReviewLike } from '$lib/server/demoPageJson';

export {
	uploadDemoPageJson,
	getDemoJsonStoragePath,
	uploadDemoHtml,
	uploadDemoHtmlPart,
	uploadDemoContent,
	getDemoHtmlStoragePath,
	getDemoHtmlPartPath,
	getDemoContentStoragePath,
	downloadDemoHtml,
	downloadDemoHtmlPart,
	extractBodyHtml,
	extractHeadHtml
} from '$lib/server/demoJsonStorage';

export { getDemoImageUrls, getDemoImageUrlsFull, getUnsplashImageUrl, getPexelsImageUrl, isPainterIndustry } from '$lib/server/unsplash';
export type { DemoImageQueries } from '$lib/server/unsplash';
