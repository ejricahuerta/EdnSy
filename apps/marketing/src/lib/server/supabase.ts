import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

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

export type DemoTrackingStatus = 'draft' | 'approved' | 'sent' | 'opened' | 'clicked' | 'replied';

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

/**
 * Count demo_tracking rows created this month for a user (for plan limits).
 */
export async function getDemoCountThisMonth(userId: string): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const now = new Date();
	const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
	const { count, error } = await supabase
		.from('demo_tracking')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', userId)
		.gte('created_at', startOfMonth.toISOString())
		.lte('created_at', endOfMonth.toISOString());
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
