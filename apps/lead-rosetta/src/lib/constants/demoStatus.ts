/**
 * Central source of truth for demo pipeline status.
 * - DemoTrackingStatus: values stored in demo_tracking.status (and used in forms/filters).
 * - Filter options and labels are defined here so the UI and server stay in sync.
 */

/** Valid demo_tracking.status values (pipeline: draft → approved → sent → opened → clicked → replied). */
export const DEMO_TRACKING_STATUSES = [
	'draft',
	'approved',
	'sent',
	'opened',
	'clicked',
	'replied'
] as const;

export type DemoTrackingStatus = (typeof DEMO_TRACKING_STATUSES)[number];

/** Use for server-side validation (e.g. form actions). */
export const VALID_DEMO_TRACKING_STATUSES: readonly string[] = DEMO_TRACKING_STATUSES;

export function isValidDemoTrackingStatus(value: unknown): value is DemoTrackingStatus {
	return typeof value === 'string' && (VALID_DEMO_TRACKING_STATUSES as readonly string[]).includes(value);
}

/** Options for the demo status dropdown (client detail page). */
export const DEMO_TRACKING_OPTIONS: { value: DemoTrackingStatus; label: string }[] = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'sent', label: 'Sent' },
	{ value: 'opened', label: 'Opened' },
	{ value: 'clicked', label: 'Clicked' },
	{ value: 'replied', label: 'Replied' }
];

/** Label for a stored demo tracking status (fallback: capitalize first letter). */
export function getDemoTrackingLabel(status: string): string {
	const opt = DEMO_TRACKING_OPTIONS.find((o) => o.value === status);
	return opt?.label ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');
}

/** Filter value for the clients list status dropdown (includes synthetic options). */
export type DemoStatusFilterValue =
	| ''
	| 'queue'
	| 'processing_gbp'
	| 'processing_insights'
	| 'no_demo'
	| 'demo_queued'
	| 'demo_creating'
	| 'demo_failed'
	| 'in_queue'
	| DemoTrackingStatus
	| 'engaged'
	| 'flagged';

export type StatusFilterGroup = 'gbp_queue' | 'demo' | 'engagement' | 'other';

export interface StatusFilterOption {
	value: DemoStatusFilterValue;
	label: string;
	group?: StatusFilterGroup;
}

/** Group heading for status filter dropdown. */
export const STATUS_GROUP_HEADINGS: Record<StatusFilterGroup, string> = {
	gbp_queue: 'GBP Queue',
	demo: 'Demo',
	engagement: 'Engagement',
	other: 'Other'
};

/** Options for the clients list status filter. Format: [what] · [action]. */
export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
	{ value: '', label: 'All statuses' },
	// GBP Queue: [what] · [action]
	{ value: 'queue', label: 'Pending · Pull GBP data', group: 'gbp_queue' },
	{ value: 'processing_gbp', label: 'Processing (GBP) · Wait', group: 'gbp_queue' },
	{ value: 'processing_insights', label: 'Processing (Insights) · Wait', group: 'gbp_queue' },
	// Demo: [what] · [action]
	{ value: 'no_demo', label: 'No demo yet', group: 'demo' },
	{ value: 'demo_queued', label: 'Queued · Wait', group: 'demo' },
	{ value: 'demo_creating', label: 'Creating · Wait', group: 'demo' },
	{ value: 'demo_failed', label: 'Failed · Retry', group: 'demo' },
	{ value: 'in_queue', label: 'Processing · Wait', group: 'demo' },
	{ value: 'draft', label: 'Draft', group: 'demo' },
	{ value: 'approved', label: 'Approved', group: 'demo' },
	{ value: 'sent', label: 'Sent', group: 'demo' },
	{ value: 'opened', label: 'Opened', group: 'engagement' },
	{ value: 'clicked', label: 'Clicked', group: 'engagement' },
	{ value: 'engaged', label: 'Engaged (opened or clicked)', group: 'engagement' },
	{ value: 'replied', label: 'Replied', group: 'engagement' },
	{ value: 'flagged', label: 'Out of scope', group: 'other' }
];

/** Stage filter: All, To qualify, Research & personalize, Out of scope (replaces pipeline tabs). */
export type StageFilterValue = '' | 'qualify' | 'research' | 'no_fit';

/** @deprecated Use StageFilterValue and getUnifiedStatusOptionsByGroup. Kept for compatibility. */
export type PipelineTabId = 'qualify' | 'research' | 'no_fit';

export interface StatusOptionsByGroup {
	gbp_queue: StatusFilterOption[];
	demo: StatusFilterOption[];
	engagement: StatusFilterOption[];
	other: StatusFilterOption[];
}

/**
 * Returns status filter options grouped by GBP Queue / Demo / Engagement / Other.
 */
export function getUnifiedStatusOptionsByGroup(): StatusOptionsByGroup {
	return {
		gbp_queue: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'gbp_queue'),
		demo: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'demo'),
		engagement: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'engagement'),
		other: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'other')
	};
}

/** All valid status filter values (for reset when stage changes). */
export function getValidStatusFilterValues(): DemoStatusFilterValue[] {
	const g = getUnifiedStatusOptionsByGroup();
	return [
		'' as DemoStatusFilterValue,
		...g.gbp_queue.map((o) => o.value),
		...g.demo.map((o) => o.value),
		...g.engagement.map((o) => o.value),
		...g.other.map((o) => o.value)
	];
}

/** @deprecated Use getUnifiedStatusOptionsByGroup(). Returns full list regardless of tab. */
export function getStatusFilterOptionsForPipelineTab(_tab: PipelineTabId): StatusOptionsByGroup {
	return getUnifiedStatusOptionsByGroup();
}

/** @deprecated Use getValidStatusFilterValues(). */
export function getValidStatusFilterValuesForPipelineTab(_tab: PipelineTabId): DemoStatusFilterValue[] {
	return getValidStatusFilterValues();
}

/** Engagement statuses (opened or clicked) for "engaged" filter. */
export const ENGAGED_STATUSES: DemoTrackingStatus[] = ['opened', 'clicked'];
