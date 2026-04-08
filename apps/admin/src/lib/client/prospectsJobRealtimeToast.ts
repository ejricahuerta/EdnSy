/**
 * Toasts when background jobs finish (Supabase Realtime UPDATE on job tables).
 * Dedupes by job id + terminal status so repeated updates do not spam.
 */
import { appendDashboardNotification } from '$lib/notificationHistory';
import { toastSuccess, toastError } from '$lib/toast';
import type { ProspectsJobRealtimeEvent } from './prospectsJobsRealtime';

function toastSuccessWithBell(
	title: string,
	description: string | undefined,
	activity: string
): void {
	toastSuccess(title, description, undefined, { skipHistory: true });
	appendDashboardNotification({ kind: 'success', text: activity });
}

function toastErrorWithBell(title: string, description: string | undefined, activity: string): void {
	toastError(title, description, undefined, { skipHistory: true });
	appendDashboardNotification({ kind: 'error', text: activity });
}

const dedupeKeys = new Set<string>();

function shouldEmitCompletionToast(dedupeKey: string): boolean {
	if (dedupeKeys.has(dedupeKey)) return false;
	dedupeKeys.add(dedupeKey);
	if (dedupeKeys.size > 400) dedupeKeys.clear();
	return true;
}

function wasJobActive(prev: string | undefined, active: readonly string[]): boolean {
	return prev != null && active.includes(String(prev));
}

/** Realtime `old` may omit `status` depending on replica identity; still show one completion toast per job. */
function looksLikeFreshTerminal(
	prev: string | undefined,
	next: string | undefined,
	terminal: string,
	active: readonly string[]
): boolean {
	if (next !== terminal) return false;
	if (wasJobActive(prev, active)) return true;
	return prev === undefined;
}

/**
 * Call from Realtime handler before invalidate. Uses getProspectLabel for copy; falls back to short id.
 */
export function maybeToastProspectsJobChange(
	payload: ProspectsJobRealtimeEvent,
	getProspectLabel: (prospectId: string) => string
): void {
	if (payload.eventType !== 'UPDATE') return;

	const { table, newRecord, oldRecord } = payload;

	if (table === 'apify_jobs') {
		const prev = oldRecord.status as string | undefined;
		const next = newRecord.status as string | undefined;
		const jobId = String(newRecord.id ?? '').trim();
		if (!jobId) return;
		const loc = String(newRecord.location ?? '').trim() || 'your area';
		const ind = String(newRecord.industry ?? '').trim() || 'import';
		if (looksLikeFreshTerminal(prev, next, 'done', ['pending', 'running'])) {
			const key = `apify:${jobId}:done`;
			if (!shouldEmitCompletionToast(key)) return;
			const insertedRaw = newRecord.inserted_count;
			const inserted =
				insertedRaw != null && insertedRaw !== ''
					? Number(insertedRaw)
					: undefined;
			const desc =
				inserted != null && !Number.isNaN(inserted)
					? `Added ${inserted} prospect${inserted === 1 ? '' : 's'} (${ind}, ${loc}).`
					: `Apify import finished (${ind}, ${loc}).`;
			toastSuccessWithBell('Apify import finished', desc, `Apify import finished for ${ind} in ${loc}.`);
			return;
		}
		if (looksLikeFreshTerminal(prev, next, 'failed', ['pending', 'running'])) {
			const key = `apify:${jobId}:failed`;
			if (!shouldEmitCompletionToast(key)) return;
			const err =
				newRecord.error_message != null && String(newRecord.error_message).trim()
					? String(newRecord.error_message).trim()
					: 'Apify import failed.';
			toastErrorWithBell('Apify import failed', `${ind} — ${loc}. ${err}`, `Apify import failed for ${ind}.`);
		}
		return;
	}

	const prospectId = String(newRecord.prospect_id ?? oldRecord.prospect_id ?? '').trim();
	if (!prospectId) return;
	const who = getProspectLabel(prospectId) || prospectId.slice(0, 8);

	if (table === 'insights_jobs') {
		const prev = oldRecord.status as string | undefined;
		const next = newRecord.status as string | undefined;
		const jobId = String(newRecord.id ?? '').trim();
		if (!jobId) return;
		if (looksLikeFreshTerminal(prev, next, 'done', ['pending', 'running'])) {
			const key = `insights:${jobId}:done`;
			if (!shouldEmitCompletionToast(key)) return;
			toastSuccessWithBell(
				'Pull data finished',
				`${who} — GBP, website scrape, and AI grade are done. Next: Run next step on this row to queue demo creation.`,
				`Finished research and profile prep for ${who}.`
			);
			return;
		}
		if (looksLikeFreshTerminal(prev, next, 'failed', ['pending', 'running'])) {
			const key = `insights:${jobId}:failed`;
			if (!shouldEmitCompletionToast(key)) return;
			const err =
				newRecord.error_message != null && String(newRecord.error_message).trim()
					? String(newRecord.error_message).trim()
					: 'Pull data failed.';
			toastErrorWithBell(
				'Pull data failed',
				`${who} — ${err} Next: fix the issue if needed, then Run next step to retry.`,
				`Research didn't finish for ${who}.`
			);
		}
		return;
	}

	if (table === 'demo_jobs') {
		const prev = oldRecord.status as string | undefined;
		const next = newRecord.status as string | undefined;
		const jobId = String(newRecord.id ?? '').trim();
		if (!jobId) return;
		if (looksLikeFreshTerminal(prev, next, 'done', ['pending', 'creating'])) {
			const key = `demo:${jobId}:done`;
			if (!shouldEmitCompletionToast(key)) return;
			toastSuccessWithBell(
				'Demo generation finished',
				`${who} — Demo page is ready. Next: open the row to review, approve when ready, then send the email.`,
				`Finished creating the demo for ${who}.`
			);
			return;
		}
		if (looksLikeFreshTerminal(prev, next, 'failed', ['pending', 'creating'])) {
			const key = `demo:${jobId}:failed`;
			if (!shouldEmitCompletionToast(key)) return;
			const err =
				newRecord.error_message != null && String(newRecord.error_message).trim()
					? String(newRecord.error_message).trim()
					: 'Demo generation failed.';
			toastErrorWithBell(
				'Demo failed',
				`${who} — ${err} Next: Run next step to retry after addressing the issue.`,
				`Demo didn't finish for ${who}.`
			);
		}
		return;
	}

	if (table === 'gbp_jobs') {
		const prev = oldRecord.status as string | undefined;
		const next = newRecord.status as string | undefined;
		const jobId = String(newRecord.id ?? '').trim();
		if (!jobId) return;
		if (looksLikeFreshTerminal(prev, next, 'done', ['pending', 'running'])) {
			const key = `gbp:${jobId}:done`;
			if (!shouldEmitCompletionToast(key)) return;
			toastSuccessWithBell(
				'GBP job finished',
				`${who} — GBP data is saved. Next: continue with pull insights / demo when this row is ready.`,
				`Finished creating Google Business Profile for ${who}.`
			);
			return;
		}
		if (looksLikeFreshTerminal(prev, next, 'failed', ['pending', 'running'])) {
			const key = `gbp:${jobId}:failed`;
			if (!shouldEmitCompletionToast(key)) return;
			toastErrorWithBell(
				'GBP job failed',
				`${who} — The GBP job did not complete. Next: retry from the row actions when ready.`,
				`Google Business Profile didn't finish for ${who}.`
			);
		}
	}
}

export type DemoJobMapEntry = { status: string; jobId: string; errorMessage?: string | null };

/**
 * Fallback when Realtime misses job UPDATEs: compare successive load() snapshots for the same jobId.
 * Uses the same dedupe keys as Realtime so we do not double-toast when both fire.
 */
export function maybeToastDemoJobsFromLoadData(
	prev: Record<string, DemoJobMapEntry>,
	next: Record<string, DemoJobMapEntry>,
	getProspectLabel: (prospectId: string) => string
): void {
	for (const prospectId of new Set([...Object.keys(prev), ...Object.keys(next)])) {
		const a = prev[prospectId];
		const b = next[prospectId];
		if (!a || !b || a.jobId !== b.jobId) continue;
		if (a.status === b.status) continue;
		if (a.status !== 'pending' && a.status !== 'creating') continue;
		const who = getProspectLabel(prospectId) || prospectId.slice(0, 8);
		const jobId = b.jobId;
		if (b.status === 'done') {
			const key = `demo:${jobId}:done`;
			if (!shouldEmitCompletionToast(key)) continue;
			toastSuccessWithBell(
				'Demo generation finished',
				`${who} — Demo page is ready. Next: open the row to review, approve when ready, then send the email.`,
				`Finished creating the demo for ${who}.`
			);
			continue;
		}
		if (b.status === 'failed') {
			const key = `demo:${jobId}:failed`;
			if (!shouldEmitCompletionToast(key)) continue;
			const err =
				b.errorMessage != null && String(b.errorMessage).trim()
					? String(b.errorMessage).trim()
					: 'Demo generation failed.';
			toastErrorWithBell(
				'Demo failed',
				`${who} — ${err} Next: Run next step to retry after addressing the issue.`,
				`Demo didn't finish for ${who}.`
			);
		}
	}
}
