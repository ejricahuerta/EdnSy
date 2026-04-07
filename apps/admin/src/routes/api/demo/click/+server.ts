import { redirect } from '@sveltejs/kit';
import { recordDemoClicked, getDemoLinkForProspect } from '$lib/server/supabase';
import { getProspectById } from '$lib/server/prospects';
import type { RequestHandler } from './$types';

/**
 * GET /api/demo/click?p=prospectId
 * Track link click (demo_tracking), then redirect to the demo URL.
 */
export const GET: RequestHandler = async ({ url }) => {
	const prospectId = url.searchParams.get('p');
	if (!prospectId || prospectId.length > 100) {
		throw redirect(302, '/auth/login');
	}
	let demoLink = await recordDemoClicked(prospectId);
	if (!demoLink) {
		demoLink = await getDemoLinkForProspect(prospectId);
	}
	if (!demoLink) {
		const prospect = await getProspectById(prospectId);
		demoLink = prospect?.demoLink ?? null;
	}
	if (!demoLink) {
		throw redirect(302, '/auth/login');
	}
	throw redirect(302, demoLink);
};
