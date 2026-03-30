/**
 * Client-side helper to send demo UX events to /api/demo/track.
 * Events are stored in demo_events (and page_view updates demo_tracking).
 * Call with prospectId from the demo page (use 'demo' for free-try flow when no id).
 */
export type DemoTrackEvent =
	| 'page_view'
	| 'time_on_page_2min'
	| 'chat_opened'
	| 'chat_message_sent'
	| 'callback_opened'
	| 'callback_submitted'
	| 'callback_success'
	| 'callback_error';

export function trackDemoEvent(
	prospectId: string,
	event: DemoTrackEvent,
	payload?: Record<string, unknown>
): void {
	if (typeof window === 'undefined' || !prospectId) return;
	const path = window.location.pathname;
	fetch('/api/demo/track', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			prospectId,
			event,
			path,
			...(payload && Object.keys(payload).length > 0 ? { payload } : {})
		})
	}).catch(() => {});
}
