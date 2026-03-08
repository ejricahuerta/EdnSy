/**
 * Single "Next step" for prospects: one clear label per row.
 * Replaces many granular statuses with a simple next action.
 */

import type { StatusVariant } from '$lib/statusDisplay';
import { getStatusDisplay } from '$lib/statusDisplay';
import { getDemoFailureLabel } from '$lib/constants/demoErrors';

/** Minimal row shape needed to compute next step (prospect + jobs + tracking). */
export interface ProspectNextStepInput {
	id: string;
	status?: string | null;
	flagged?: boolean | null;
	demoLink?: string | null;
	gbpJob?: { status: string } | null;
	insightsJob?: { status: string } | null;
	demoJob?: { status: string; errorMessage?: string | null } | null;
	tracking?: { status?: string } | null;
	/** True when scraped/GBP data exists for this prospect. Required to show "Create demo" as next step. */
	hasGbpData?: boolean;
}

/** Simplified status (state only) for the Status column. Aligned with next-step label when action is "run AI/GBP" (Pull data). */
export type SimplifiedStatusLabel =
	| 'Out of scope'
	| 'Loading'
	| 'Queued'
	| 'Pulling GBP'
	| 'Pulling insights'
	| 'Pull data'
	| 'No demo'
	| 'Ready to send'
	| 'Sent'
	| 'Engaged'
	| 'Replied'
	| 'Not contacted';

export interface SimplifiedStatusResult {
	label: SimplifiedStatusLabel;
	variant: StatusVariant | 'destructive';
}

/**
 * Returns a simple status (state) for a prospect. Use for the Status column.
 * Distinct from getNextStep() which is the recommended action.
 * Pass hasGbpData: true when scraped/GBP data exists for this prospect so we show "No demo" only when we have data but no demo.
 */
export function getSimplifiedStatus(
	row: ProspectNextStepInput,
	options?: {
		optimisticGbpIds?: Set<string>;
		optimisticInsightsIds?: Set<string>;
		/** True when we have GBP/scraped data for this prospect. When false/undefined, status is "Pull data" (same as next step) instead of "No demo" when there's no demo. */
		hasGbpData?: boolean;
	}
): SimplifiedStatusResult {
	const optimisticGbp = options?.optimisticGbpIds?.has(row.id) ?? false;
	const optimisticInsights = options?.optimisticInsightsIds?.has(row.id) ?? false;

	if (row.flagged) {
		return { label: 'Out of scope', variant: 'muted' };
	}

	const hasDemo = !!(row.demoLink ?? '').trim();
	const gbpRunning = row.gbpJob?.status === 'running';
	const gbpPending = optimisticGbp || row.gbpJob?.status === 'pending';
	const insightsRunning = row.insightsJob?.status === 'running';
	const insightsPending = optimisticInsights || row.insightsJob?.status === 'pending';
	const demoStatus = row.demoJob?.status;
	const demoCreating = demoStatus === 'creating';
	const demoPending = demoStatus === 'pending';
	const inQueue = (row.status ?? '').trim() === 'In queue';

	// Insights running → Pulling insights
	if (insightsRunning) {
		return { label: 'Pulling insights', variant: 'warning' };
	}
	// GBP running → Pulling GBP
	if (gbpRunning) {
		return { label: 'Pulling GBP', variant: 'warning' };
	}
	// GBP or Insights queued (pending) → Queued
	if (gbpPending || insightsPending) {
		return { label: 'Queued', variant: 'warning' };
	}
	// Demo actively being generated → Loading (one row only)
	if (demoCreating) {
		return { label: 'Loading', variant: 'warning' };
	}
	// Demo waiting in queue → Queued
	if (demoPending || (inQueue && !hasDemo)) {
		return { label: 'Queued', variant: 'warning' };
	}

	if (!hasDemo) {
		// No GBP data yet → same as next step: "Pull data" (run AI/GBP). Have GBP but no demo → "No demo".
		if (options?.hasGbpData !== true) {
			return { label: 'Pull data', variant: 'default' };
		}
		return { label: 'No demo', variant: row.demoJob?.status === 'failed' ? 'destructive' : 'default' };
	}

	const trackingStatus = row.tracking?.status;
	if (trackingStatus === 'draft' || trackingStatus === 'approved') {
		return { label: 'Ready to send', variant: 'success' };
	}
	if (trackingStatus === 'sent') {
		return { label: 'Sent', variant: 'muted' };
	}
	if (trackingStatus === 'opened' || trackingStatus === 'clicked') {
		return { label: 'Engaged', variant: 'success' };
	}
	if (trackingStatus === 'replied') {
		return { label: 'Replied', variant: 'success' };
	}

	return { label: 'Not contacted', variant: 'default' };
}

export interface NextStepResult {
	label: string;
	variant: StatusVariant | 'destructive';
	/** For filtering: which bucket this row belongs to. */
	filterValue: NextStepFilterValue;
}

/** Simplified filter: one value per "next step" bucket. */
export type NextStepFilterValue =
	| ''
	| 'flagged'
	| 'pull_data'
	| 'create_demo'
	| 'retry_demo'
	| 'review_send'
	| 'sent'
	| 'engaged'
	| 'replied'
	| 'other';

/**
 * Returns the single next step for a prospect (priority order).
 * Used for the "Next step" column and for simplified filtering.
 */
export function getNextStep(
	row: ProspectNextStepInput,
	options?: { optimisticGbpIds?: Set<string>; optimisticInsightsIds?: Set<string> }
): NextStepResult {
	const optimisticGbp = options?.optimisticGbpIds?.has(row.id) ?? false;
	const optimisticInsights = options?.optimisticInsightsIds?.has(row.id) ?? false;

	if (row.flagged) {
		return { label: 'Out of scope', variant: 'muted', filterValue: 'flagged' };
	}

	const gbpStatus = row.gbpJob?.status;
	const insightsStatus = row.insightsJob?.status;
	const demoStatus = row.demoJob?.status;
	const trackingStatus = row.tracking?.status;
	const hasDemo = !!(row.demoLink ?? '').trim();
	const inQueueStatus = (row.status ?? '').trim() === 'In queue';

	if (gbpStatus === 'running') {
		return { label: 'Wait (GBP)', variant: 'default', filterValue: 'pull_data' };
	}
	if (optimisticGbp || gbpStatus === 'pending') {
		return { label: 'Pull GBP data', variant: 'default', filterValue: 'pull_data' };
	}
	if (insightsStatus === 'running') {
		return { label: 'Wait (Insights)', variant: 'default', filterValue: 'pull_data' };
	}
	if (optimisticInsights || insightsStatus === 'pending') {
		return { label: 'Pull insights', variant: 'default', filterValue: 'pull_data' };
	}

	if (demoStatus === 'creating') {
		return { label: 'Creating demo…', variant: 'warning', filterValue: 'create_demo' };
	}
	if (demoStatus === 'pending') {
		return { label: 'Queued', variant: 'default', filterValue: 'create_demo' };
	}
	if (demoStatus === 'failed') {
		return {
			label: getDemoFailureLabel(row.demoJob?.errorMessage ?? undefined),
			variant: 'destructive',
			filterValue: 'retry_demo'
		};
	}

	if (inQueueStatus && !hasDemo) {
		return { label: 'Processing…', variant: 'warning', filterValue: 'create_demo' };
	}
	if (!hasDemo) {
		// Only suggest "Create demo" when we have GBP data; otherwise suggest pulling data first.
		if (row.hasGbpData !== true) {
			return { label: 'Pull data', variant: 'default', filterValue: 'pull_data' };
		}
		return { label: 'Create demo', variant: 'default', filterValue: 'create_demo' };
	}

	if (trackingStatus === 'draft' || trackingStatus === 'approved') {
		return { label: 'Review & send', variant: 'default', filterValue: 'review_send' };
	}
	if (trackingStatus === 'sent') {
		return { label: 'Sent', variant: 'muted', filterValue: 'sent' };
	}
	if (trackingStatus === 'opened') {
		return { label: 'Opened', variant: 'success', filterValue: 'engaged' };
	}
	if (trackingStatus === 'clicked') {
		return { label: 'Clicked', variant: 'success', filterValue: 'engaged' };
	}
	if (trackingStatus === 'replied') {
		return { label: 'Replied', variant: 'success', filterValue: 'replied' };
	}

	const display = getStatusDisplay(row.status ?? '');
	return {
		label: display.label,
		variant: display.variant === 'success' ? 'success' : display.variant === 'warning' ? 'warning' : 'default',
		filterValue: 'other'
	};
}

/** Options for the simplified "Next step" filter dropdown. */
export const NEXT_STEP_FILTER_OPTIONS: { value: NextStepFilterValue; label: string }[] = [
	{ value: '', label: 'All' },
	{ value: 'flagged', label: 'Out of scope' },
	{ value: 'pull_data', label: 'Pull data' },
	{ value: 'create_demo', label: 'Create demo' },
	{ value: 'retry_demo', label: 'Retry demo' },
	{ value: 'review_send', label: 'Review & send' },
	{ value: 'sent', label: 'Sent' },
	{ value: 'engaged', label: 'Engaged' },
	{ value: 'replied', label: 'Replied' },
	{ value: 'other', label: 'Other' }
];

export function getNextStepFilterLabel(value: NextStepFilterValue): string {
	return NEXT_STEP_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? 'All';
}

/** Whether a prospect row matches the given next-step filter. */
export function prospectMatchesNextStepFilter(
	row: ProspectNextStepInput,
	filterValue: NextStepFilterValue,
	options?: { optimisticGbpIds?: Set<string>; optimisticInsightsIds?: Set<string> }
): boolean {
	if (filterValue === '') return true;
	const step = getNextStep(row, options);
	return step.filterValue === filterValue;
}
