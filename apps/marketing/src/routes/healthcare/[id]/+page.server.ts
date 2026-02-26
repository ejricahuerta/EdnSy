import { getProspectById } from '$lib/server/notion';
import { getWebsiteData } from '$lib/server/demoData';
import { mergeWithStaticImages } from '$lib/server/mergeWebsiteContent';
import { healthcareDemoContent } from '$lib/content/healthcare';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const prospect = await getProspectById(params.id);
	if (!prospect) {
		throw error(404, 'Prospect not found');
	}
	const websiteData = await getWebsiteData(params.id);
	const content = mergeWithStaticImages(websiteData, healthcareDemoContent) as typeof healthcareDemoContent;
	const canonicalUrl = `${url.origin}${url.pathname}`;
	return { prospect, content, canonicalUrl };
};
