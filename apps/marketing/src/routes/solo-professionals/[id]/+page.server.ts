import { getProspectById } from '$lib/server/notion';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const prospect = await getProspectById(params.id);
	if (!prospect) {
		throw error(404, 'Prospect not found');
	}
	const canonicalUrl = `${url.origin}${url.pathname}`;
	return { prospect, canonicalUrl };
};
