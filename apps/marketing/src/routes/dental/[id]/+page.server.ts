import { getProspectById } from '$lib/server/notion';
import { getWebsiteData } from '$lib/server/demoData';
import { mergeWithStaticImages } from '$lib/server/mergeWebsiteContent';
import { dentalDemoContent } from '$lib/content/dental';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const prospect = await getProspectById(params.id);
	if (!prospect) {
		throw error(404, 'Prospect not found');
	}
	const websiteData = await getWebsiteData(params.id);
	const content = mergeWithStaticImages(websiteData, dentalDemoContent) as typeof dentalDemoContent;
	const canonicalUrl = `${url.origin}${url.pathname}`;
	return { prospect, content, canonicalUrl };
};
