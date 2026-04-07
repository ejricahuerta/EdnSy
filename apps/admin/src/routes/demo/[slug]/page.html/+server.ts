/**
 * Serve demo HTML from storage: single file (demo-html/{slug}.html) or legacy stitched parts.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { downloadDemoHtml } from '$lib/server/demo';
import { rewriteCinematicDemoHtmlImageUrls } from '$lib/server/cinematicDemoImages';
import { DEMO_ERROR } from '$lib/constants/demoErrors';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug?.trim();
	if (!slug) throw error(404, 'Not found');

	const prospect = await getProspectById(slug);
	if (!prospect) throw error(404, 'Not found');

	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(404, 'Not found');
	}

	const raw = await downloadDemoHtml(slug);
	if (!raw) throw error(404, DEMO_ERROR.DEMO_NOT_FOUND);

	const html = rewriteCinematicDemoHtmlImageUrls(raw);

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'private, max-age=60'
		}
	});
};
