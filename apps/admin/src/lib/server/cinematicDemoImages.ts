/**
 * Cinematic demo HTML references /images/3x2/ and /images/9x16/. The website-template app serves
 * those via Express (app.use("/images", express.static(...))). We rewrite paths to the same origin
 * as DEMO_GENERATOR_URL (the deployed website-template URL).
 */

import { env } from '$env/dynamic/private';

/** Origin of the website-template deployment, derived from DEMO_GENERATOR_URL. */
export function getWebsiteTemplateImagesOrigin(): string | null {
	const gen = (env.DEMO_GENERATOR_URL ?? '').trim();
	if (!gen) return null;
	try {
		return new URL(gen).origin;
	} catch {
		return null;
	}
}

export function rewriteCinematicDemoHtmlImageUrls(html: string): string {
	const origin = getWebsiteTemplateImagesOrigin();
	if (!origin) return html;
	const base = origin.replace(/\/$/, '');
	return html
		.replaceAll('/images/3x2/', `${base}/images/3x2/`)
		.replaceAll('/images/9x16/', `${base}/images/9x16/`);
}
