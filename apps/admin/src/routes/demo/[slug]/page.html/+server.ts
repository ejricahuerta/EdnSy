/**
 * Serve demo HTML from storage: single file (demo-html/{slug}.html) or legacy stitched parts.
 * Rewrites __LEAD_FORM_ACTION__ to POST /api/demo/lead and ensures a prospectId hidden field.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProspectById } from '$lib/server/prospects';
import { downloadDemoHtml } from '$lib/server/demo';
import { rewriteCinematicDemoHtmlImageUrls } from '$lib/server/cinematicDemoImages';
import { DEMO_ERROR } from '$lib/constants/demoErrors';

function escapeHtmlAttr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** First <form> gets a hidden prospectId if the model omitted it. */
function ensureLeadFormProspectId(html: string, prospectId: string): string {
	if (/name=["']prospectId["']/i.test(html)) return html;
	let injected = false;
	return html.replace(/<form(\b[^>]*)>/gi, (match, attrs: string) => {
		if (injected) return match;
		injected = true;
		return `<form${attrs}><input type="hidden" name="prospectId" value="${escapeHtmlAttr(prospectId)}"/>`;
	});
}

export const GET: RequestHandler = async ({ params, url }) => {
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

	let html = rewriteCinematicDemoHtmlImageUrls(raw);
	const leadAction = `${url.origin}/api/demo/lead`;
	html = html.replace(/__LEAD_FORM_ACTION__/g, leadAction);
	html = ensureLeadFormProspectId(html, slug);

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'private, max-age=60'
		}
	});
};
