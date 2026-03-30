import { recordDemoOpened } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

/** 1x1 transparent GIF (43 bytes). */
const PIXEL_GIF = new Uint8Array([
	0x47, 0x49, 0x46, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00,
	0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01,
	0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
]);

/**
 * GET /api/demo/open?p=prospectId
 * Email open pixel. Records open for the prospect (when Supabase is configured), returns 1x1 transparent GIF.
 * Tracking: updates demo_tracking status to 'opened' and sets opened_at when status was 'sent'.
 */
export const GET: RequestHandler = async ({ url }) => {
	const prospectId = url.searchParams.get('p');
	if (!prospectId || prospectId.length > 100) {
		return new Response(PIXEL_GIF, {
			status: 200,
			headers: {
				'Content-Type': 'image/gif',
				'Cache-Control': 'no-store, no-cache, must-revalidate'
			}
		});
	}
	await recordDemoOpened(prospectId);
	return new Response(PIXEL_GIF, {
		status: 200,
		headers: {
			'Content-Type': 'image/gif',
			'Cache-Control': 'no-store, no-cache, must-revalidate'
		}
	});
};
