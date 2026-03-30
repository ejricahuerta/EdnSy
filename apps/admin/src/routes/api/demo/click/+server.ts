import { redirect } from '@sveltejs/kit';
import { recordDemoClicked, getDemoLinkForProspect, getFreeDemoRequestById, recordFreeDemoLinkClicked } from '$lib/server/supabase';
import { getProspectById } from '$lib/server/prospects';
import { getDemoPublicOrigin } from '$lib/server/send';
import type { RequestHandler } from './$types';

/**
 * GET /api/demo/click?p=prospectIdOrFreeDemoId
 * Track link click (paid: demo_tracking; free: free_demo_requests.link_clicked_at), then redirect to the demo URL.
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
		const freeRow = await getFreeDemoRequestById(prospectId);
		if (freeRow) {
			await recordFreeDemoLinkClicked(prospectId);
			demoLink = freeRow.demo_link ?? `${getDemoPublicOrigin(url.origin)}/demo/${prospectId}`;
		}
	}
	if (!demoLink) {
		throw redirect(302, '/auth/login');
	}
	throw redirect(302, demoLink);
};
