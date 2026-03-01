import { getProspectForDemoPage } from '$lib/server/freeDemo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, cookies }) => {
	const industrySlug = url.pathname.split('/').filter(Boolean)[0] ?? 'real-estate';
	return getProspectForDemoPage(params.id, industrySlug, cookies, url.origin, url.pathname);
};
