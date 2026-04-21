/**
 * Central source of truth for demo pipeline status.
 * - DemoTrackingStatus: values stored in demo_tracking.status (and used in forms/filters).
 * - Labels are defined here so the UI and server stay in sync.
 */

/** Valid demo_tracking.status values (pipeline: draft → approved → email_draft → sent → opened → clicked → replied). */
export const DEMO_TRACKING_STATUSES = [
	'draft',
	'approved',
	'email_draft',
	'sent',
	'opened',
	'clicked',
	'replied'
] as const;

export type DemoTrackingStatus = (typeof DEMO_TRACKING_STATUSES)[number];

/** Past review: shown on the Demos dashboard (excludes `draft`). */
export const APPROVED_DEMO_LIST_STATUSES: readonly DemoTrackingStatus[] = [
	'approved',
	'email_draft',
	'sent',
	'opened',
	'clicked',
	'replied'
];

/** Use for server-side validation (e.g. form actions). */
export const VALID_DEMO_TRACKING_STATUSES: readonly string[] = DEMO_TRACKING_STATUSES;

export function isValidDemoTrackingStatus(value: unknown): value is DemoTrackingStatus {
	return typeof value === 'string' && (VALID_DEMO_TRACKING_STATUSES as readonly string[]).includes(value);
}

/** Options for the demo status dropdown (client detail page). Each label must be unique. */
export const DEMO_TRACKING_OPTIONS: { value: DemoTrackingStatus; label: string }[] = [
	{ value: 'draft', label: 'Review' },
	{ value: 'approved', label: 'Ready' },
	{ value: 'email_draft', label: 'Outreach draft · Gmail' },
	{ value: 'sent', label: 'Demo Sent' },
	{ value: 'opened', label: 'Email Opened' },
	{ value: 'clicked', label: 'Demo Link Opened' },
	{ value: 'replied', label: 'Follow-up' }
];

/** Label for a stored demo tracking status (fallback: capitalize first letter). */
export function getDemoTrackingLabel(status: string): string {
	const opt = DEMO_TRACKING_OPTIONS.find((o) => o.value === status);
	return opt?.label ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');
}
