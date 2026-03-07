/**
 * Legacy: serve one part (1, 2, or 3) of a three-part demo HTML. Used only when downloadDemoHtml stitches legacy parts server-side.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { getFreeDemoRequestById } from '$lib/server/supabase';
import { downloadDemoHtmlPart } from '$lib/server/demo';
import { DEMO_ERROR } from '$lib/constants/demoErrors';
import { serverError } from '$lib/server/logger';

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug?.trim();
	const partParam = params.part?.trim();
	if (!slug || !partParam) throw error(404, 'Not found');

	const partNum = partParam === '1' ? 1 : partParam === '2' ? 2 : partParam === '3' ? 3 : null;
	if (partNum === null) throw error(404, 'Not found');

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

	try {
		const html = await downloadDemoHtmlPart(slug, partNum);
		if (!html) {
			serverError('demo/part', 'PART_NOT_FOUND', { slug, part: partNum, message: DEMO_ERROR.PART_NOT_FOUND });
			throw error(404, DEMO_ERROR.PART_NOT_FOUND);
		}

		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'private, max-age=60'
			}
		});
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 404) throw e;
		serverError('demo/part', 'PART_DOWNLOAD_FAILED', { slug, part: partNum, error: e instanceof Error ? e.message : String(e) });
		throw error(404, DEMO_ERROR.PART_NOT_FOUND);
	}
};
