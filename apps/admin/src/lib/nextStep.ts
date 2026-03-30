/**
 * Single "Next step" for prospects: one clear label per row.
 * Replaces many granular statuses with a simple next action.
 */

import type { StatusVariant } from '$lib/statusDisplay';
import { getStatusDisplay } from '$lib/statusDisplay';
import { isProspectQueuedStatus } from '$lib/prospectStatus';
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

/**
 * Automation + outreach labels shown in the Status column.
 * Lifecycle labels: New → GBP Queued → Processing GBP → Pending Demo → Demo Queued → Processing Demo → Ready to send → Demo Sent → Demo Opened → Follow-up (see getStatusDisplay + jobs).
 */
export type SimplifiedStatusLabel = string;

export interface SimplifiedStatusResult {
	label: string;
	variant: StatusVariant | 'destructive';
}

/**
 * Returns a simple status (state) for a prospect. Use for the Status column.
 * Distinct from getNextStep() which is the recommended action.
 * Pass hasGbpData: true when insights are usable (hasUsableInsight) so we show **Pending Demo** when there is no demo page yet.
 * When hasGbpData is false and there is no active job, persisted CRM status is shown (see getStatusDisplay).
 */
export function getSimplifiedStatus(
	row: ProspectNextStepInput,
	options?: {
		optimisticGbpIds?: Set<string>;
		optimisticInsightsIds?: Set<string>;
		/** True when we have GBP/scraped data for this prospect. When false/undefined, show CRM sync status until insights exist. */
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
	const inQueue = isProspectQueuedStatus(row.status);

	// Qualifying phase (GBP + insights jobs) — one label before Pending Demo
	if (insightsRunning || gbpRunning) {
		return { label: 'Processing GBP', variant: 'warning' };
	}
	if (gbpPending || insightsPending) {
		return { label: 'GBP Queued', variant: 'warning' };
	}
	if (demoCreating) {
		return { label: 'Processing Demo', variant: 'warning' };
	}
	if (demoPending) {
		return { label: 'Demo Queued', variant: 'warning' };
	}
	if (inQueue && !hasDemo) {
		const st = (row.status ?? '').trim().toLowerCase();
		if (st === 'demo queued') return { label: 'Demo Queued', variant: 'warning' };
		return { label: 'GBP Queued', variant: 'warning' };
	}

	if (!hasDemo) {
		if (options?.hasGbpData !== true) {
			const d = getStatusDisplay(row.status ?? '');
			return { label: d.label, variant: d.variant };
		}
		if (row.demoJob?.status === 'failed') {
			return { label: getDemoFailureLabel(row.demoJob?.errorMessage ?? undefined), variant: 'destructive' };
		}
		return { label: 'Pending Demo', variant: 'warning' };
	}

	const trackingStatus = row.tracking?.status;
	if (trackingStatus === 'draft') {
		return { label: 'Review', variant: 'warning' };
	}
	if (trackingStatus === 'approved') {
		return { label: 'Ready to send', variant: 'success' };
	}
	if (trackingStatus === 'sent') {
		return { label: 'Demo Sent', variant: 'muted' };
	}
	if (trackingStatus === 'opened' || trackingStatus === 'clicked') {
		return { label: 'Demo Opened', variant: 'success' };
	}
	if (trackingStatus === 'replied') {
		return { label: 'Follow-up', variant: 'success' };
	}

	const d = getStatusDisplay(row.status ?? '');
	return { label: d.label, variant: d.variant };
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
	| 'draft'
	| 'approved'
	| 'sent'
	| 'engaged'
	| 'replied'
	| 'other';

/**
 * Returns the recommended action for a prospect (priority order).
 * Used for row actions and bulk "Process next step", not for the table column (Status uses getSimplifiedStatus).
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
	const inQueueStatus = isProspectQueuedStatus(row.status);

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
		const st = (row.status ?? '').trim().toLowerCase();
		if (st === 'demo queued') return { label: 'Demo Queued', variant: 'warning', filterValue: 'create_demo' };
		return { label: 'GBP Queued', variant: 'warning', filterValue: 'pull_data' };
	}
	if (!hasDemo) {
		if (row.hasGbpData !== true) {
			return { label: 'Pull data', variant: 'default', filterValue: 'pull_data' };
		}
		return { label: 'Create demo', variant: 'default', filterValue: 'create_demo' };
	}

	if (trackingStatus === 'draft') {
		return { label: 'Review', variant: 'default', filterValue: 'draft' };
	}
	if (trackingStatus === 'approved') {
		return { label: 'Ready to send', variant: 'default', filterValue: 'approved' };
	}
	if (trackingStatus === 'sent') {
		return { label: 'Demo Sent', variant: 'muted', filterValue: 'sent' };
	}
	if (trackingStatus === 'opened') {
		return { label: 'Demo Opened', variant: 'success', filterValue: 'engaged' };
	}
	if (trackingStatus === 'clicked') {
		return { label: 'Demo Opened', variant: 'success', filterValue: 'engaged' };
	}
	if (trackingStatus === 'replied') {
		return { label: 'Follow-up', variant: 'success', filterValue: 'replied' };
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
	{ value: 'draft', label: 'Review' },
	{ value: 'approved', label: 'Ready' },
	{ value: 'sent', label: 'Demo Sent' },
	{ value: 'engaged', label: 'Demo Opened' },
	{ value: 'replied', label: 'Follow-up' },
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
