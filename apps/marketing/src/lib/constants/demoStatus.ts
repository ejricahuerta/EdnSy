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

export type StatusFilterGroup = 'pipeline' | 'engagement' | 'other';

export interface StatusFilterOption {
	value: DemoStatusFilterValue;
	label: string;
	group?: StatusFilterGroup;
}

/** Options for the clients list status filter (aligned with status column). */
export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
	{ value: '', label: 'All statuses' },
	// Pipeline: queue and processing first, then demo stages
	{ value: 'queue', label: 'Queue', group: 'pipeline' },
	{ value: 'processing_gbp', label: 'Processing (GBP)', group: 'pipeline' },
	{ value: 'processing_insights', label: 'Processing (Insights)', group: 'pipeline' },
	{ value: 'no_demo', label: 'No demo', group: 'pipeline' },
	{ value: 'demo_queued', label: 'Queued', group: 'pipeline' },
	{ value: 'demo_creating', label: 'Creating…', group: 'pipeline' },
	{ value: 'demo_failed', label: 'Demo failed', group: 'pipeline' },
	{ value: 'in_queue', label: 'In queue', group: 'pipeline' },
	{ value: 'draft', label: 'Draft', group: 'pipeline' },
	{ value: 'approved', label: 'Approved', group: 'pipeline' },
	{ value: 'sent', label: 'Sent', group: 'pipeline' },
	{ value: 'opened', label: 'Opened', group: 'engagement' },
	{ value: 'clicked', label: 'Clicked', group: 'engagement' },
	{ value: 'engaged', label: 'Engaged (opened or clicked)', group: 'engagement' },
	{ value: 'replied', label: 'Replied', group: 'engagement' },
	{ value: 'flagged', label: 'Out of scope', group: 'other' }
];

/** Pipeline tab IDs used on the prospects dashboard (Qualify, Research & Personalize, No Fit). */
export type PipelineTabId = 'qualify' | 'research' | 'no_fit';

export interface StatusOptionsByGroup {
	pipeline: StatusFilterOption[];
	engagement: StatusFilterOption[];
	other: StatusFilterOption[];
}

/** Status filter options for Qualify tab (no GBP data yet — next step is GBP pull). Demo status belongs in Research. */
const QUALIFY_PIPELINE_OPTIONS: StatusFilterOption[] = [
	{ value: 'queue', label: 'Queue', group: 'pipeline' },
	{ value: 'processing_gbp', label: 'Processing (GBP)', group: 'pipeline' },
	{ value: 'in_queue', label: 'In queue', group: 'pipeline' }
];

/** Status filter options for Research & Personalize tab (have GBP data): full pipeline + engagement. */
const RESEARCH_PIPELINE_OPTIONS: StatusFilterOption[] = [
	{ value: 'queue', label: 'Queue', group: 'pipeline' },
	{ value: 'processing_gbp', label: 'Processing (GBP)', group: 'pipeline' },
	{ value: 'processing_insights', label: 'Processing (Insights)', group: 'pipeline' },
	{ value: 'no_demo', label: 'No demo', group: 'pipeline' },
	{ value: 'demo_queued', label: 'Queued', group: 'pipeline' },
	{ value: 'demo_creating', label: 'Creating…', group: 'pipeline' },
	{ value: 'demo_failed', label: 'Demo failed', group: 'pipeline' },
	{ value: 'in_queue', label: 'In queue', group: 'pipeline' },
	{ value: 'draft', label: 'Draft', group: 'pipeline' },
	{ value: 'approved', label: 'Approved', group: 'pipeline' },
	{ value: 'sent', label: 'Sent', group: 'pipeline' }
];

const RESEARCH_ENGAGEMENT_OPTIONS: StatusFilterOption[] = [
	{ value: 'opened', label: 'Opened', group: 'engagement' },
	{ value: 'clicked', label: 'Clicked', group: 'engagement' },
	{ value: 'engaged', label: 'Engaged (opened or clicked)', group: 'engagement' },
	{ value: 'replied', label: 'Replied', group: 'engagement' }
];

/** Status filter options for No Fit tab (flagged only). */
const NO_FIT_OTHER_OPTIONS: StatusFilterOption[] = [
	{ value: 'flagged', label: 'Out of scope', group: 'other' }
];

/**
 * Returns status filter options grouped by Pipeline / Engagement / Other for the given pipeline tab.
 * Each tab shows only the statuses relevant to that step.
 */
export function getStatusFilterOptionsForPipelineTab(tab: PipelineTabId): StatusOptionsByGroup {
	switch (tab) {
		case 'qualify':
			return {
				pipeline: QUALIFY_PIPELINE_OPTIONS,
				engagement: [],
				other: []
			};
		case 'research':
			return {
				pipeline: RESEARCH_PIPELINE_OPTIONS,
				engagement: RESEARCH_ENGAGEMENT_OPTIONS,
				other: []
			};
		case 'no_fit':
			return {
				pipeline: [],
				engagement: [],
				other: NO_FIT_OTHER_OPTIONS
			};
		default:
			return {
				pipeline: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'pipeline'),
				engagement: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'engagement'),
				other: STATUS_FILTER_OPTIONS.filter((o) => o.group === 'other')
			};
	}
}

/** All valid status filter values for a pipeline tab (used to reset filter when switching tabs). */
export function getValidStatusFilterValuesForPipelineTab(tab: PipelineTabId): DemoStatusFilterValue[] {
	const g = getStatusFilterOptionsForPipelineTab(tab);
	return ['' as DemoStatusFilterValue, ...g.pipeline.map((o) => o.value), ...g.engagement.map((o) => o.value), ...g.other.map((o) => o.value)];
}

/** Engagement statuses (opened or clicked) for "engaged" filter. */
export const ENGAGED_STATUSES: DemoTrackingStatus[] = ['opened', 'clicked'];
