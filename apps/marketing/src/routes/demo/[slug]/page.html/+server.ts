/**
 * Serve v0-generated demo HTML from Supabase storage.
 * Used as iframe src from demo/[slug] when useV0Demo is true.
 * Returns 404 if no demo HTML/content exists for this prospect.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { downloadDemoHtml } from '$lib/server/demo';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug?.trim();
	if (!slug) throw error(404, 'Not found');

	const prospect = await getProspectById(slug);
	if (!prospect) throw error(404, 'Not found');
	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(403, 'Unavailable');
	}

	const html = await downloadDemoHtml(slug);
	if (!html) throw error(404, 'Demo content not found');

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'private, max-age=60'
		}
	});
};
