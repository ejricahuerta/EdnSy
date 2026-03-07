import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { DemoTrackingStatus } from '$lib/demo';
export type { DemoTrackingStatus };

function getConfig() {
	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	return { url, key };
}

/**
 * Server-only Supabase client (service role). Use for demo_tracking and other server ops.
 * Returns null if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set.
 */
export function getSupabaseAdmin() {
	const { url, key } = getConfig();
	if (!url || !key) return null;
	return createClient(url, key, { auth: { persistSession: false } });
}

export type DemoTrackingRow = {
	id: string;
	user_id: string;
	crm_source: string;
	crm_prospect_id: string;
	prospect_id: string | null;
	demo_link: string;
	status: string;
	send_time: string | null;
	opened_at: string | null;
	clicked_at: string | null;
	scraped_data: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
};

/**
 * Demo funnel (order is strict): sent → opened → clicked → replied
 * - sent: email sent (send_time set).
 * - opened: email open recorded (pixel or demo page_view fallback); opened_at set.
 * - clicked: demo link clicked; clicked_at set.
 * - replied: manual or future CRM sync.
 * recordDemoOpened and recordDemoClicked only advance forward (e.g. sent→opened, sent|opened→clicked).
 */

/**
 * Fetch demo tracking rows for a user; returns a map by prospect_id (our uuid).
 */
export async function getDemoTrackingForUser(
	userId: string
): Promise<
	Record<string, { status: string; send_time: string | null; opened_at: string | null; clicked_at: string | null }>
> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return {};
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('prospect_id, status, send_time, opened_at, clicked_at')
		.eq('user_id', userId)
		.not('prospect_id', 'is', null);
	if (error || !data) return {};
	const map: Record<
		string,
		{ status: string; send_time: string | null; opened_at: string | null; clicked_at: string | null }
	> = {};
	for (const row of data) {
		const pid = row.prospect_id;
		if (pid) {
			map[pid] = {
				status: row.status,
				send_time: row.send_time ?? null,
				opened_at: row.opened_at ?? null,
				clicked_at: row.clicked_at ?? null
			};
		}
	}
	return map;
}

export type UpdateDemoTrackingOptions = {
	status: DemoTrackingStatus;
	sendTime?: string | null;
	scrapedData?: Record<string, unknown> | null;
};

/**
 * Update status (and optionally send_time, scraped_data) for a demo_tracking row by prospect_id.
 * When status is 'sent' and sendTime is omitted, sets send_time to now().
 */
export async function updateDemoTrackingStatus(
	userId: string,
	prospectId: string,
	options: UpdateDemoTrackingOptions
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Supabase not configured' };
	const sendTime =
		options.status === 'sent' && options.sendTime === undefined
			? new Date().toISOString()
			: options.sendTime ?? null;
	const updates: Record<string, unknown> = {
		status: options.status,
		updated_at: new Date().toISOString()
	};
	if (sendTime !== undefined) updates.send_time = sendTime;
	if (options.scrapedData !== undefined) updates.scraped_data = options.scrapedData;
	const { error } = await supabase
		.from('demo_tracking')
		.update(updates)
		.eq('user_id', userId)
		.eq('prospect_id', prospectId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Upsert a demo_tracking row for a prospect (when generating a demo). Sets prospect_id for keying by our uuid.
 */
export async function upsertDemoTrackingForProspect(
	userId: string,
	prospectId: string,
	provider: string,
	providerRowId: string,
	demoLink: string,
	status: string = 'draft'
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	await supabase.from('demo_tracking').upsert(
		{
			user_id: userId,
			crm_source: provider,
			crm_prospect_id: providerRowId,
			prospect_id: prospectId,
			demo_link: demoLink,
			status,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,crm_source,crm_prospect_id' }
	);
}

/** Start and end of current month (UTC) for usage queries. */
function getCurrentMonthBounds(): { start: string; end: string } {
	const now = new Date();
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
	return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Count demo_tracking rows created this month for a user (for plan limits).
 */
export async function getDemoCountThisMonth(userId: string): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const { start, end } = getCurrentMonthBounds();
	const { count, error } = await supabase
		.from('demo_tracking')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.gte('created_at', start)
		.lte('created_at', end);
	if (error) return 0;
	return count ?? 0;
}

/**
 * Count GBP jobs completed (status = 'done') this month for a user.
 */
export async function getGbpCountThisMonth(userId: string): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const { start, end } = getCurrentMonthBounds();
	const { count, error } = await supabase
		.from('gbp_jobs')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('status', 'done')
		.gte('updated_at', start)
		.lte('updated_at', end);
	if (error) return 0;
	return count ?? 0;
}

/**
 * Count Insights jobs completed (status = 'done') this month for a user.
 */
export async function getInsightsCountThisMonth(userId: string): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const { start, end } = getCurrentMonthBounds();
	const { count, error } = await supabase
		.from('insights_jobs')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('status', 'done')
		.gte('updated_at', start)
		.lte('updated_at', end);
	if (error) return 0;
	return count ?? 0;
}

/**
 * Fetch scraped_data for a prospect from demo_tracking by our prospect id (uuid).
 */
export async function getScrapedDataForProspect(prospectId: string): Promise<Record<string, unknown> | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('scraped_data')
		.eq('prospect_id', prospectId)
		.not('scraped_data', 'is', null)
		.order('updated_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.scraped_data) return null;
	return data.scraped_data as Record<string, unknown>;
}

/**
 * Fetch scraped_data for a prospect from demo_tracking by user_id and prospect_id.
 * Use when processing a demo job to reuse insights from the previous "Pull insights" step.
 */
export async function getScrapedDataForProspectForUser(
	userId: string,
	prospectId: string
): Promise<Record<string, unknown> | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('scraped_data')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.not('scraped_data', 'is', null)
		.order('updated_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.scraped_data) return null;
	return data.scraped_data as Record<string, unknown>;
}

/**
 * Fetch a single demo_tracking row for a prospect (for detail page history).
 * Returns null if none. Includes created_at for "demo created" timeline.
 */
export async function getDemoTrackingForProspect(
	userId: string,
	prospectId: string
): Promise<{
	status: string;
	send_time: string | null;
	opened_at: string | null;
	clicked_at: string | null;
	created_at: string;
	updated_at: string;
} | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('status, send_time, opened_at, clicked_at, created_at, updated_at')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.order('updated_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data) return null;
	return {
		status: data.status ?? 'draft',
		send_time: data.send_time ?? null,
		opened_at: data.opened_at ?? null,
		clicked_at: data.clicked_at ?? null,
		created_at: data.created_at ?? data.updated_at ?? new Date().toISOString(),
		updated_at: data.updated_at ?? new Date().toISOString()
	};
}

/**
 * Fetch prospect_id -> scraped_data for all prospects that have scraped_data (for list/dashboard).
 * Uses latest row per prospect when multiple demo_tracking rows exist.
 */
export async function getScrapedDataMapForUser(
	userId: string
): Promise<Record<string, Record<string, unknown>>> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return {};
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('prospect_id, scraped_data')
		.eq('user_id', userId)
		.not('prospect_id', 'is', null)
		.not('scraped_data', 'is', null)
		.order('updated_at', { ascending: false });
	if (error || !data?.length) return {};
	const map: Record<string, Record<string, unknown>> = {};
	for (const row of data) {
		const pid = row.prospect_id;
		if (pid && !(pid in map) && row.scraped_data) {
			map[pid] = row.scraped_data as Record<string, unknown>;
		}
	}
	return map;
}

/** Demo job status for background queue. */
export type DemoJobStatus = 'pending' | 'creating' | 'done' | 'failed';

export type DemoJobRow = {
	id: string;
	user_id: string;
	prospect_id: string;
	status: DemoJobStatus;
	created_at: string;
	updated_at: string;
	demo_link: string | null;
	error_message: string | null;
};

/**
 * Return the active (pending or creating) job for this user+prospect, if any.
 * Used to avoid duplicate jobs and to guard regenerate while creation is in progress.
 */
export async function getActiveDemoJobForProspect(
	userId: string,
	prospectId: string
): Promise<{ jobId: string } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_jobs')
		.select('id')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.in('status', ['pending', 'creating'])
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.id) return null;
	return { jobId: data.id as string };
}

export type EnqueueDemoJobResult = { jobId: string; created: boolean } | null;

/**
 * Enqueue a demo creation job. If this prospect already has a pending or creating job, returns that job id without inserting. Returns null on DB error.
 */
export async function enqueueDemoJob(userId: string, prospectId: string): Promise<EnqueueDemoJobResult | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const existing = await getActiveDemoJobForProspect(userId, prospectId);
	if (existing) {
		return { jobId: existing.jobId, created: false };
	}
	const { data, error } = await supabase
		.from('demo_jobs')
		.insert({
			user_id: userId,
			prospect_id: prospectId,
			status: 'pending'
		})
		.select('id')
		.single();
	if (error || !data?.id) return null;
	return { jobId: data.id as string, created: true };
}

/**
 * Get latest job per prospect for a user (for UI: queued / creating / done / failed).
 */
export async function getDemoJobsForUser(
	userId: string
): Promise<Record<string, { status: DemoJobStatus; jobId: string; demoLink?: string | null; errorMessage?: string | null }>> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return {};
	const { data, error } = await supabase
		.from('demo_jobs')
		.select('id, prospect_id, status, demo_link, error_message')
		.eq('user_id', userId)
		.in('status', ['pending', 'creating', 'done', 'failed'])
		.order('created_at', { ascending: false });
	if (error || !data?.length) return {};
	const map: Record<string, { status: DemoJobStatus; jobId: string; demoLink?: string | null; errorMessage?: string | null }> = {};
	for (const row of data) {
		const pid = row.prospect_id;
		if (pid && !(pid in map)) {
			map[pid] = {
				status: row.status as DemoJobStatus,
				jobId: row.id,
				demoLink: row.demo_link ?? undefined,
				errorMessage: row.error_message ?? undefined
			};
		}
	}
	return map;
}

/**
 * Get next pending job (oldest first) and set status to creating. Returns job row or null.
 * Also retries "creating" jobs that have been stuck for too long (e.g. worker crash).
 */
export async function claimNextPendingDemoJob(): Promise<DemoJobRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;

	const { data: rows, error } = await supabase.rpc('claim_next_pending_demo_job');
	if (!error && rows?.length) {
		const row = rows[0] as Record<string, unknown>;
		return {
			id: row.id as string,
			user_id: row.user_id as string,
			prospect_id: row.prospect_id as string,
			status: 'creating' as const,
			created_at: row.created_at as string,
			updated_at: row.updated_at as string,
			demo_link: (row.demo_link as string | null) ?? null,
			error_message: (row.error_message as string | null) ?? null
		};
	}

	// Fallback: non-atomic claim when RPC not deployed
	const { data: pendingRows, error: pendingError } = await supabase
		.from('demo_jobs')
		.select('id, user_id, prospect_id, status, created_at, updated_at, demo_link, error_message')
		.eq('status', 'pending')
		.order('created_at', { ascending: true })
		.limit(1);
	if (pendingError) return null;
	if (pendingRows?.length) {
		const job = pendingRows[0] as DemoJobRow;
		const { error: updateError } = await supabase
			.from('demo_jobs')
			.update({ status: 'creating', updated_at: new Date().toISOString() })
			.eq('id', job.id);
		if (updateError) return null;
		return { ...job, status: 'creating' as const };
	}

	// Retry stale "creating" jobs (e.g. server restart mid-job).
	const staleBefore = new Date(Date.now() - 10 * 60 * 1000).toISOString();
	const { data: staleRows, error: staleError } = await supabase
		.from('demo_jobs')
		.select('id, user_id, prospect_id, status, created_at, updated_at, demo_link, error_message')
		.eq('status', 'creating')
		.lt('updated_at', staleBefore)
		.order('updated_at', { ascending: true })
		.limit(1);
	if (staleError || !staleRows?.length) return null;
	const staleJob = staleRows[0] as DemoJobRow;
	const { error: staleUpdateError } = await supabase
		.from('demo_jobs')
		.update({ status: 'creating', updated_at: new Date().toISOString() })
		.eq('id', staleJob.id);
	if (staleUpdateError) return null;
	return { ...staleJob, status: 'creating' as const };
}

/**
 * Update job status and optional demo_link / error_message.
 */
export async function updateDemoJob(
	jobId: string,
	updates: { status: DemoJobStatus; demoLink?: string | null; errorMessage?: string | null }
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const payload: Record<string, unknown> = {
		status: updates.status,
		updated_at: new Date().toISOString()
	};
	if (updates.demoLink !== undefined) payload.demo_link = updates.demoLink;
	if (updates.errorMessage !== undefined) payload.error_message = updates.errorMessage;
	await supabase.from('demo_jobs').update(payload).eq('id', jobId);
}

/** Same staleness window as claimNextPendingDemoJob (server restart / disconnect recovery). */
const STALE_DEMO_MINUTES = 10;

/**
 * True if any paid or free demo is currently in progress (status=creating, updated within STALE_DEMO_MINUTES).
 * Used to avoid starting a second demo after server restart or client disconnect left one creating.
 */
export async function isDemoCurrentlyInProgress(): Promise<boolean> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return false;
	const since = new Date(Date.now() - STALE_DEMO_MINUTES * 60 * 1000).toISOString();
	const [paid, free] = await Promise.all([
		supabase.from('demo_jobs').select('id', { count: 'exact', head: true }).eq('status', 'creating').gte('updated_at', since),
		supabase.from('free_demo_requests').select('id', { count: 'exact', head: true }).eq('status', 'creating').gte('updated_at', since)
	]);
	return (paid.count ?? 0) > 0 || (free.count ?? 0) > 0;
}

/**
 * Reset free demo requests stuck in 'creating' (e.g. server restart) so they can be claimed again.
 * Call before checking isDemoCurrentlyInProgress so stale rows don't block the queue.
 */
export async function resetStaleFreeDemoCreatingToPending(): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const before = new Date(Date.now() - STALE_DEMO_MINUTES * 60 * 1000).toISOString();
	await supabase
		.from('free_demo_requests')
		.update({ status: 'pending', updated_at: new Date().toISOString() })
		.eq('status', 'creating')
		.lt('updated_at', before);
}

// --- Free demo requests (try free demo: anonymous, keyed by email + company) ---

/** Base columns always present (first migration). Tracking columns from second migration. */
const FREE_DEMO_BASE_COLUMNS =
	'id, email, company_name, website, industry, status, demo_link, error_message, created_at, updated_at';

export type FreeDemoRequestRow = {
	id: string;
	email: string;
	company_name: string;
	website: string | null;
	industry: string;
	status: 'pending' | 'creating' | 'done' | 'failed';
	demo_link: string | null;
	error_message: string | null;
	created_at: string;
	updated_at: string;
	/** Funnel: when the first email (with demo link) was sent. Present if tracking migration applied. */
	email_sent_at?: string | null;
	link_clicked_at?: string | null;
	demo_viewed_at?: string | null;
};

/** Return an active (pending or creating) free demo request for this email + company, if any. */
export async function getActiveFreeDemoRequestByEmailAndCompany(
	email: string,
	companyName: string
): Promise<FreeDemoRequestRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const normEmail = email.trim().toLowerCase();
	const normCompany = companyName.trim().toLowerCase();
	if (!normEmail && !normCompany) return null;
	const { data, error } = await supabase
		.from('free_demo_requests')
		.select(FREE_DEMO_BASE_COLUMNS)
		.in('status', ['pending', 'creating'])
		.order('created_at', { ascending: false });
	if (error || !data?.length) return null;
	for (const row of data as FreeDemoRequestRow[]) {
		if (
			row.email?.trim().toLowerCase() === normEmail &&
			row.company_name?.trim().toLowerCase() === normCompany
		) {
			return row;
		}
	}
	return null;
}

/** Insert a new free demo request. Returns the row with id, or null on error. */
export async function insertFreeDemoRequest(params: {
	email: string;
	companyName: string;
	website?: string;
	industry?: string;
}): Promise<FreeDemoRequestRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('free_demo_requests')
		.insert({
			email: params.email.trim(),
			company_name: params.companyName.trim(),
			website: params.website?.trim() ?? '',
			industry: params.industry?.trim() ?? 'professional',
			status: 'pending'
		})
		.select(FREE_DEMO_BASE_COLUMNS)
		.single();
	if (error || !data) return null;
	return data as FreeDemoRequestRow;
}

/** Get a free demo request by id (for demo page load). */
export async function getFreeDemoRequestById(id: string): Promise<FreeDemoRequestRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('free_demo_requests')
		.select(FREE_DEMO_BASE_COLUMNS)
		.eq('id', id)
		.maybeSingle();
	if (error || !data) return null;
	return data as FreeDemoRequestRow;
}

/** Claim the next pending free demo request (set status to creating). Returns row or null. */
export async function claimNextPendingFreeDemoJob(): Promise<FreeDemoRequestRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data: rows, error } = await supabase
		.from('free_demo_requests')
		.select(FREE_DEMO_BASE_COLUMNS)
		.eq('status', 'pending')
		.order('created_at', { ascending: true })
		.limit(1);
	if (error || !rows?.length) return null;
	const row = rows[0] as FreeDemoRequestRow;
	const { error: updateError } = await supabase
		.from('free_demo_requests')
		.update({ status: 'creating', updated_at: new Date().toISOString() })
		.eq('id', row.id);
	if (updateError) return null;
	return { ...row, status: 'creating' };
}

/** Update a free demo request (status, demo_link, error_message). */
export async function updateFreeDemoRequest(
	id: string,
	updates: { status: 'pending' | 'creating' | 'done' | 'failed'; demoLink?: string | null; errorMessage?: string | null }
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const payload: Record<string, unknown> = {
		status: updates.status,
		updated_at: new Date().toISOString()
	};
	if (updates.demoLink !== undefined) payload.demo_link = updates.demoLink;
	if (updates.errorMessage !== undefined) payload.error_message = updates.errorMessage;
	await supabase.from('free_demo_requests').update(payload).eq('id', id);
}

/** Set email_sent_at when the first email (with demo link) is sent. No-op if tracking columns missing. */
export async function setFreeDemoEmailSentAt(id: string): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	try {
		await supabase
			.from('free_demo_requests')
			.update({ email_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
			.eq('id', id)
			.is('email_sent_at', null);
	} catch {
		// Column may not exist if tracking migration not run
	}
}

/** Record link click (email link). Returns demo_link for redirect. */
export async function recordFreeDemoLinkClicked(id: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	try {
		const { data, error } = await supabase
			.from('free_demo_requests')
			.update({
				link_clicked_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('demo_link')
			.maybeSingle();
		if (error || !data?.demo_link) return null;
		return data.demo_link as string;
	} catch {
		const row = await getFreeDemoRequestById(id);
		return row?.demo_link ?? null;
	}
}

/** Record first demo page view (only sets demo_viewed_at if not already set). No-op if column missing. */
export async function recordFreeDemoViewed(id: string): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	try {
		await supabase
			.from('free_demo_requests')
			.update({
				demo_viewed_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.is('demo_viewed_at', null);
	} catch {
		// Column may not exist if tracking migration not run
	}
}

// --- GBP jobs (Pull GBP data only; separate from insights) ---

export type GbpJobStatus = 'pending' | 'running' | 'done' | 'failed';

export type GbpJobRow = {
	id: string;
	user_id: string;
	prospect_id: string;
	status: GbpJobStatus;
	created_at: string;
	updated_at: string;
	error_message: string | null;
};

export async function getActiveGbpJobForProspect(
	userId: string,
	prospectId: string
): Promise<{ jobId: string; status: GbpJobStatus } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('gbp_jobs')
		.select('id, status')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.in('status', ['pending', 'running'])
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.id) return null;
	return { jobId: data.id as string, status: data.status as GbpJobStatus };
}

export type EnqueueGbpJobResult = { jobId: string; created: boolean } | null;

export async function enqueueGbpJob(userId: string, prospectId: string): Promise<EnqueueGbpJobResult | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const existing = await getActiveGbpJobForProspect(userId, prospectId);
	if (existing) return { jobId: existing.jobId, created: false };
	const { data, error } = await supabase
		.from('gbp_jobs')
		.insert({ user_id: userId, prospect_id: prospectId, status: 'pending' })
		.select('id')
		.single();
	if (error || !data?.id) return null;
	return { jobId: data.id as string, created: true };
}

export async function getGbpJobForProspect(
	userId: string,
	prospectId: string
): Promise<{ jobId: string; status: GbpJobStatus; errorMessage?: string | null } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('gbp_jobs')
		.select('id, status, error_message')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.id) return null;
	return {
		jobId: data.id as string,
		status: data.status as GbpJobStatus,
		errorMessage: data.error_message ?? undefined
	};
}

/** Map of prospect_id -> latest active (pending/running) GBP job for list status. */
export async function getGbpJobsForUser(
	userId: string
): Promise<Record<string, { jobId: string; status: GbpJobStatus }>> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return {};
	const { data, error } = await supabase
		.from('gbp_jobs')
		.select('id, prospect_id, status')
		.eq('user_id', userId)
		.in('status', ['pending', 'running'])
		.order('created_at', { ascending: false });
	if (error || !data?.length) return {};
	const map: Record<string, { jobId: string; status: GbpJobStatus }> = {};
	for (const row of data) {
		const pid = row.prospect_id as string;
		if (pid && !(pid in map)) map[pid] = { jobId: row.id as string, status: row.status as GbpJobStatus };
	}
	return map;
}

/** Return counts of pending and running GBP jobs (for cron/debug when queue appears empty). */
export async function getGbpJobQueueCounts(): Promise<{ pending: number; running: number } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const [pendingRes, runningRes] = await Promise.all([
		supabase.from('gbp_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
		supabase.from('gbp_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running')
	]);
	return {
		pending: pendingRes.count ?? 0,
		running: runningRes.count ?? 0
	};
}

/** Reset jobs stuck in 'running' (e.g. after timeout) so the cron can claim them. */
export async function resetStaleRunningGbpJobs(staleAfterMinutes: number = 5): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const cutoff = new Date(Date.now() - staleAfterMinutes * 60 * 1000).toISOString();
	const { data, error } = await supabase
		.from('gbp_jobs')
		.update({ status: 'pending', updated_at: new Date().toISOString() })
		.eq('status', 'running')
		.lt('updated_at', cutoff)
		.select('id');
	if (error || !data?.length) return 0;
	return data.length;
}

export async function claimNextPendingGbpJob(): Promise<GbpJobRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data: rows, error } = await supabase.rpc('claim_next_pending_gbp_job');
	if (error || !rows?.length) {
		// Fallback: non-atomic claim when RPC not yet deployed
		const { data: fallback, error: fallbackError } = await supabase
			.from('gbp_jobs')
			.select('id, user_id, prospect_id, status, created_at, updated_at, error_message')
			.eq('status', 'pending')
			.order('created_at', { ascending: true })
			.limit(1);
		if (fallbackError || !fallback?.length) return null;
		const job = fallback[0] as GbpJobRow;
		const { error: updateError } = await supabase
			.from('gbp_jobs')
			.update({ status: 'running', updated_at: new Date().toISOString() })
			.eq('id', job.id);
		if (updateError) return null;
		return { ...job, status: 'running' as const };
	}
	const row = rows[0] as Record<string, unknown>;
	return {
		id: row.id as string,
		user_id: row.user_id as string,
		prospect_id: row.prospect_id as string,
		status: 'running' as const,
		created_at: row.created_at as string,
		updated_at: row.updated_at as string,
		error_message: (row.error_message as string | null) ?? null
	};
}

export async function updateGbpJob(
	jobId: string,
	updates: { status: GbpJobStatus; errorMessage?: string | null }
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const payload: Record<string, unknown> = {
		status: updates.status,
		updated_at: new Date().toISOString()
	};
	if (updates.errorMessage !== undefined) payload.error_message = updates.errorMessage;
	await supabase.from('gbp_jobs').update(payload).eq('id', jobId);
}

// --- Places API usage (monthly lock so we don't exceed free tier) ---

/** Current month key for places_api_usage (YYYY-MM UTC). */
export function getPlacesUsageMonthKey(): string {
	const now = new Date();
	const y = now.getUTCFullYear();
	const m = String(now.getUTCMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

/**
 * Try to consume one Places API lookup slot for this month. Atomic: only one caller gets the slot when at limit.
 * Returns { allowed: true } if under limit and count was incremented; { allowed: false } if at or over limit.
 */
export async function tryIncrementPlacesUsage(): Promise<{ allowed: boolean }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { allowed: false };
	const monthKey = getPlacesUsageMonthKey();
	const limit = Math.min(
		Math.max(1, parseInt((env.PLACES_API_MONTHLY_LIMIT ?? '10000').trim(), 10) || 10000),
		100_000
	);
	const { data: rpcData, error: rpcError } = await supabase.rpc('increment_places_usage_if_under_limit', {
		p_month_key: monthKey,
		p_limit: limit
	});
	if (rpcError) {
		// Fallback when RPC not deployed: non-atomic check + increment
		const { data: row } = await supabase
			.from('places_api_usage')
			.select('lookups_count')
			.eq('month_key', monthKey)
			.single();
		const current = (row as { lookups_count?: number } | null)?.lookups_count ?? 0;
		if (current >= limit) return { allowed: false };
		await supabase.from('places_api_usage').upsert(
			{ month_key: monthKey, lookups_count: current + 1 },
			{ onConflict: 'month_key' }
		);
		return { allowed: true };
	}
	const newCount = rpcData as number | null;
	return { allowed: newCount != null && newCount >= 1 };
}

/**
 * Return the configured Places API monthly limit (from env).
 */
export function getPlacesMonthlyLimit(): number {
	return Math.min(
		Math.max(1, parseInt((env.PLACES_API_MONTHLY_LIMIT ?? '10000').trim(), 10) || 10000),
		100_000
	);
}

/**
 * Places API lookups count for the current month (app-wide).
 */
export async function getPlacesCountThisMonth(): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const monthKey = getPlacesUsageMonthKey();
	const { data, error } = await supabase
		.from('places_api_usage')
		.select('lookups_count')
		.eq('month_key', monthKey)
		.maybeSingle();
	if (error || !data) return 0;
	return (data.lookups_count as number) ?? 0;
}

// --- Insights jobs (AI insights; requires GBP data) ---

export type InsightsJobStatus = 'pending' | 'running' | 'done' | 'failed';

export type InsightsJobRow = {
	id: string;
	user_id: string;
	prospect_id: string;
	status: InsightsJobStatus;
	created_at: string;
	updated_at: string;
	error_message: string | null;
};

export async function getActiveInsightsJobForProspect(
	userId: string,
	prospectId: string
): Promise<{ jobId: string; status: InsightsJobStatus } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('insights_jobs')
		.select('id, status')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.in('status', ['pending', 'running'])
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.id) return null;
	return { jobId: data.id as string, status: data.status as InsightsJobStatus };
}

export type EnqueueInsightsJobResult = { jobId: string; created: boolean } | null;

export async function enqueueInsightsJob(
	userId: string,
	prospectId: string
): Promise<EnqueueInsightsJobResult | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const existing = await getActiveInsightsJobForProspect(userId, prospectId);
	if (existing) return { jobId: existing.jobId, created: false };
	const { data, error } = await supabase
		.from('insights_jobs')
		.insert({ user_id: userId, prospect_id: prospectId, status: 'pending' })
		.select('id')
		.single();
	if (error || !data?.id) return null;
	return { jobId: data.id as string, created: true };
}

export async function getInsightsJobForProspect(
	userId: string,
	prospectId: string
): Promise<{ jobId: string; status: InsightsJobStatus; errorMessage?: string | null } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('insights_jobs')
		.select('id, status, error_message')
		.eq('user_id', userId)
		.eq('prospect_id', prospectId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data?.id) return null;
	return {
		jobId: data.id as string,
		status: data.status as InsightsJobStatus,
		errorMessage: data.error_message ?? undefined
	};
}

/** Map of prospect_id -> latest active (pending/running) Insights job for list status. */
export async function getInsightsJobsForUser(
	userId: string
): Promise<Record<string, { jobId: string; status: InsightsJobStatus }>> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return {};
	const { data, error } = await supabase
		.from('insights_jobs')
		.select('id, prospect_id, status')
		.eq('user_id', userId)
		.in('status', ['pending', 'running'])
		.order('created_at', { ascending: false });
	if (error || !data?.length) return {};
	const map: Record<string, { jobId: string; status: InsightsJobStatus }> = {};
	for (const row of data) {
		const pid = row.prospect_id as string;
		if (pid && !(pid in map)) map[pid] = { jobId: row.id as string, status: row.status as InsightsJobStatus };
	}
	return map;
}

export async function claimNextPendingInsightsJob(): Promise<InsightsJobRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data: rows, error } = await supabase.rpc('claim_next_pending_insights_job');
	if (error || !rows?.length) {
		// Fallback when RPC not deployed
		const { data: fallback, error: fallbackError } = await supabase
			.from('insights_jobs')
			.select('id, user_id, prospect_id, status, created_at, updated_at, error_message')
			.eq('status', 'pending')
			.order('created_at', { ascending: true })
			.limit(1);
		if (fallbackError || !fallback?.length) return null;
		const job = fallback[0] as InsightsJobRow;
		const { error: updateError } = await supabase
			.from('insights_jobs')
			.update({ status: 'running', updated_at: new Date().toISOString() })
			.eq('id', job.id);
		if (updateError) return null;
		return { ...job, status: 'running' as const };
	}
	const row = rows[0] as Record<string, unknown>;
	return {
		id: row.id as string,
		user_id: row.user_id as string,
		prospect_id: row.prospect_id as string,
		status: 'running' as const,
		created_at: row.created_at as string,
		updated_at: row.updated_at as string,
		error_message: (row.error_message as string | null) ?? null
	};
}

export async function updateInsightsJob(
	jobId: string,
	updates: { status: InsightsJobStatus; errorMessage?: string | null }
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const payload: Record<string, unknown> = {
		status: updates.status,
		updated_at: new Date().toISOString()
	};
	if (updates.errorMessage !== undefined) payload.error_message = updates.errorMessage;
	await supabase.from('insights_jobs').update(payload).eq('id', jobId);
}

/**
 * Record email open (pixel or demo page_view). Funnel: only advances sent → opened.
 * Sets opened_at. No-op if status is already opened, clicked, or replied.
 */
export async function recordDemoOpened(prospectId: string): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	await supabase
		.from('demo_tracking')
		.update({
			status: 'opened',
			opened_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		})
		.eq('prospect_id', prospectId)
		.in('status', ['sent']);
}

/**
 * Record demo link click. Funnel: only advances sent | opened → clicked.
 * Sets clicked_at. Returns demo_link for redirect. No-op if already clicked or replied.
 */
export async function recordDemoClicked(prospectId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_tracking')
		.update({
			status: 'clicked',
			clicked_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		})
		.eq('prospect_id', prospectId)
		.in('status', ['sent', 'opened'])
		.select('demo_link')
		.maybeSingle();
	if (error || !data?.demo_link) return null;
	return data.demo_link as string;
}

/** Get demo_link for a prospect by our prospect id (for click redirect). */
export async function getDemoLinkForProspect(prospectId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('demo_tracking')
		.select('demo_link')
		.eq('prospect_id', prospectId)
		.limit(1)
		.maybeSingle();
	if (error || !data?.demo_link) return null;
	return data.demo_link as string;
}

/**
 * Record a granular demo UX event (chat opened, callback submitted, etc.).
 * No-op if Supabase is not configured.
 */
export async function recordDemoEvent(
	prospectId: string,
	eventType: string,
	payload?: Record<string, unknown>
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	await supabase.from('demo_events').insert({
		prospect_id: prospectId,
		event_type: eventType,
		payload: payload ?? null
	});
}

/** Dashboard overview row (AI-generated). */
export type DashboardOverviewRow = {
	user_id: string;
	what: string;
	key_findings: string;
	next: string;
	stagnation: string;
	generated_at: string;
};

/**
 * Fetch stored dashboard overview for a user. Returns null if none.
 */
export async function getDashboardOverview(userId: string): Promise<DashboardOverviewRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('dashboard_overview')
		.select('user_id, what, key_findings, next, stagnation, generated_at')
		.eq('user_id', userId)
		.maybeSingle();
	if (error || !data) return null;
	return data as DashboardOverviewRow;
}

/**
 * Upsert dashboard overview for a user. Sets generated_at to now().
 */
export async function upsertDashboardOverview(
	userId: string,
	overview: { what: string; keyFindings: string; next: string; stagnation: string }
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Supabase not configured' };
	const { error } = await supabase.from('dashboard_overview').upsert(
		{
			user_id: userId,
			what: overview.what,
			key_findings: overview.keyFindings,
			next: overview.next,
			stagnation: overview.stagnation,
			generated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}
