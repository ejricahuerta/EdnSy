import type { RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js';

const TABLES = ['prospects', 'demo_jobs', 'gbp_jobs', 'insights_jobs', 'apify_jobs'] as const;

export type ProspectsJobRealtimeEvent = {
	table: string;
	eventType: string;
	newRecord: Record<string, unknown>;
	oldRecord: Record<string, unknown>;
};

function normalizePayload(
	payload: RealtimePostgresChangesPayload<Record<string, unknown>>
): ProspectsJobRealtimeEvent {
	const newRecord =
		payload.new && typeof payload.new === 'object' && !Array.isArray(payload.new)
			? (payload.new as Record<string, unknown>)
			: {};
	const oldRecord =
		payload.old && typeof payload.old === 'object' && !Array.isArray(payload.old)
			? (payload.old as Record<string, unknown>)
			: {};
	return {
		table: payload.table,
		eventType: payload.eventType,
		newRecord,
		oldRecord
	};
}

/**
 * Subscribe to job + prospect row changes for the signed-in user (Google sub in user_id).
 * Calls onEvent on INSERT/UPDATE; caller should invalidate SvelteKit load data (and may toast from payload).
 */
export function subscribeProspectsJobsRealtime(
	supabase: SupabaseClient,
	userId: string,
	onEvent: (event: ProspectsJobRealtimeEvent) => void | Promise<void>
): () => void {
	let stopped = false;
	let retryTimer: ReturnType<typeof setTimeout> | null = null;
	let channel = buildChannel(supabase, userId, onEvent, scheduleRetry);

	function scheduleRetry() {
		if (stopped) return;
		if (retryTimer) clearTimeout(retryTimer);
		retryTimer = setTimeout(() => {
			retryTimer = null;
			if (stopped) return;
			try {
				supabase.removeChannel(channel);
			} catch {
				/* ignore */
			}
			channel = buildChannel(supabase, userId, onEvent, scheduleRetry);
		}, 2500);
	}

	return () => {
		stopped = true;
		if (retryTimer) clearTimeout(retryTimer);
		try {
			supabase.removeChannel(channel);
		} catch {
			/* ignore */
		}
	};
}

function buildChannel(
	supabase: SupabaseClient,
	userId: string,
	onEvent: (event: ProspectsJobRealtimeEvent) => void | Promise<void>,
	onChannelProblem: () => void
) {
	const filter = `user_id=eq.${userId}`;
	const ch = supabase.channel(`prospects_jobs:${userId}`);
	for (const table of TABLES) {
		ch.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table, filter },
			(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
				void onEvent(normalizePayload(payload));
			}
		);
	}
	ch.subscribe((status) => {
		if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
			onChannelProblem();
		}
	});
	return ch;
}
