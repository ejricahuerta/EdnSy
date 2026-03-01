import { json } from '@sveltejs/kit';
import { recordDemoOpened, recordDemoEvent } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

const DEMO_TRACK_EVENTS = [
	'page_view',
	'time_on_page_2min',
	'chat_opened',
	'chat_message_sent',
	'callback_opened',
	'callback_submitted',
	'callback_success',
	'callback_error'
] as const;

type DemoTrackEvent = (typeof DEMO_TRACK_EVENTS)[number];

/**
 * Demo tracking: page view and time-on-page (2+ min = hot lead).
 * - page_view: also updates demo_tracking status to "opened".
 * - All events are stored in demo_events for analytics.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as {
			prospectId?: string;
			event?: string;
			path?: string;
			payload?: Record<string, unknown>;
		};
		const { prospectId, event, path, payload } = body;
		if (!prospectId || !event) {
			return json({ ok: false, error: 'prospectId and event required' }, { status: 400 });
		}
		if (!DEMO_TRACK_EVENTS.includes(event as DemoTrackEvent)) {
			return json({ ok: false, error: 'Invalid event' }, { status: 400 });
		}

		const eventPayload = { path: path ?? undefined, ...payload };

		if (event === 'page_view') {
			await recordDemoOpened(prospectId);
		}

		await recordDemoEvent(prospectId, event, Object.keys(eventPayload).length ? eventPayload : undefined);

		if (process.env.NODE_ENV === 'development' && event === 'time_on_page_2min') {
			// eslint-disable-next-line no-console
			console.log('[demo/track]', { prospectId, event, path });
		}

		return json({ ok: true });
	} catch {
		return json({ ok: false, error: 'Invalid request' }, { status: 400 });
	}
};
