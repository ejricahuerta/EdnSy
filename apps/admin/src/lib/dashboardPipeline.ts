/**
 * Dashboard home "Pipeline" chart: same buckets as the Prospects table Status column
 * (getSimplifiedStatus), not raw prospects.status alone.
 */

import type { Prospect } from '$lib/server/prospects';
import { getSimplifiedStatus, type ProspectNextStepInput, type SimplifiedStatusResult } from '$lib/nextStep';
import { auditFromScrapedData, hasUsableInsight } from '$lib/demo';

/** Bar labels on the dashboard Pipeline card (order matches UI). */
export const DASHBOARD_PIPELINE_BAR_LABELS = [
	'New',
	'GBP Queued',
	'Pending Demo',
	'Demo Queued',
	'Review',
	'Ready to Send',
	'Demo Sent',
	'Demo Opened',
	'Follow-up',
	'Other'
] as const;

const PIPELINE_BAR_SET = new Set<string>(DASHBOARD_PIPELINE_BAR_LABELS);

/** Map Status-column label (+ variant) to a pipeline bar. */
export function mapSimplifiedStatusToPipelineBar(result: SimplifiedStatusResult): string {
	if (result.variant === 'destructive') {
		return 'Pending Demo';
	}
	const t = result.label.trim();
	if (t === 'Email Opened' || t === 'Demo Link Opened') return 'Demo Opened';
	if (t === 'Out of scope') return 'Other';
	if (t === 'Ready to send') return 'Ready to Send';
	if (t === 'Gmail draft') return 'Ready to Send';
	if (t === 'Processing GBP') return 'GBP Queued';
	if (t === 'Processing Demo') return 'Demo Queued';
	if (t === 'Not contacted yet' || t === 'Not contacted') return 'New';
	if (PIPELINE_BAR_SET.has(t)) return t;
	return 'Other';
}

/**
 * Build `{ status, count }[]` for the dashboard Pipeline card.
 * Every prospect is counted exactly once (sums to prospects.length).
 */
export function buildDashboardPipelineChartData(
	prospects: Prospect[],
	demoTrackingByProspectId: Record<string, { status?: string } | undefined>,
	gbpJobsByProspectId: Record<string, { status: string }>,
	insightsJobsByProspectId: Record<string, { status: string }>,
	demoJobsByProspectId: Record<string, { status: string; errorMessage?: string | null } | undefined>,
	scrapedDataByProspectId: Record<string, Record<string, unknown>>
): { status: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const label of DASHBOARD_PIPELINE_BAR_LABELS) {
		counts.set(label, 0);
	}

	for (const p of prospects) {
		const scraped = scrapedDataByProspectId[p.id];
		const audit = auditFromScrapedData(scraped ?? null);
		const row: ProspectNextStepInput = {
			id: p.id,
			status: p.status,
			flagged: p.flagged,
			demoLink: p.demoLink,
			gbpJob: gbpJobsByProspectId[p.id] ?? null,
			insightsJob: insightsJobsByProspectId[p.id] ?? null,
			demoJob: demoJobsByProspectId[p.id] ?? null,
			tracking: demoTrackingByProspectId[p.id] ?? null
		};
		const simplified = getSimplifiedStatus(row, {
			hasGbpData: audit ? hasUsableInsight(audit) : false
		});
		const bar = mapSimplifiedStatusToPipelineBar(simplified);
		counts.set(bar, (counts.get(bar) ?? 0) + 1);
	}

	return DASHBOARD_PIPELINE_BAR_LABELS.map((status) => ({
		status,
		count: counts.get(status) ?? 0
	}));
}
