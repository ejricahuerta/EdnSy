/**
 * Serve demo HTML from storage: single file (demo-html/{slug}.html) or legacy stitched parts.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { getFreeDemoRequestById } from '$lib/server/supabase';
import { downloadDemoHtml } from '$lib/server/demo';
import { DEMO_ERROR } from '$lib/constants/demoErrors';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug?.trim();
	if (!slug) throw error(404, 'Not found');

	let allowed = false;
	const prospect = await getProspectById(slug);
	if (prospect) {
		const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
		if (!prospect.flagged || prospect.flaggedReason === NO_FIT_GBP_REASON) allowed = true;
	} else {
		const freeDemo = await getFreeDemoRequestById(slug);
		if (freeDemo?.status === 'done' && freeDemo.demo_link) allowed = true;
	}
	if (!allowed) throw error(404, 'Not found');

	const html = await downloadDemoHtml(slug);
	if (!html) throw error(404, DEMO_ERROR.DEMO_NOT_FOUND);

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'private, max-age=60'
		}
	});
};
