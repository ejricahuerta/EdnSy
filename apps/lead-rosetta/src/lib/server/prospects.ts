/**
 * Central prospects store in Supabase.
 * Dashboard list and demo tracking use this. Notion sync and CSV import use insert-only (see insertProspectIfAbsent).
 * Each row tracks provider + provider_row_id.
 * Flagged prospects (out of scope) cannot run demos, GBP, or send.
 */

import { PROSPECT_STATUS } from '$lib/prospectStatus';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { isOutOfScopeCompany, getDefaultFlaggedReason } from '$lib/server/outOfScope';

export type Prospect = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone?: string;
	address?: string;
	city?: string;
	industry: string;
	status: string;
	demoLink?: string;
	/** When true, demos/GBP/send are disabled; row can be deleted */
	flagged?: boolean;
	flaggedReason?: string;
	/** Set when loading from DB for demo_tracking upsert */
	provider?: ProspectProvider;
	provider_row_id?: string;
	/** Set when loading from DB; used for custom demo template lookup */
	userId?: string;
};

export type ProspectProvider = 'notion' | 'hubspot' | 'gohighlevel' | 'pipedrive' | 'manual' | 'gbp';

function rowToProspect(r: {
	id: string;
	company_name: string;
	email: string;
	website: string | null;
	phone: string | null;
	industry: string | null;
	status: string;
	demo_link: string | null;
	provider?: string;
	provider_row_id?: string;
	address?: string | null;
	flagged?: boolean | null;
	flagged_reason?: string | null;
}): Prospect {
	return {
		id: r.id,
		companyName: r.company_name ?? '',
		email: r.email ?? '',
		website: r.website ?? '',
		phone: r.phone ?? undefined,
		industry: r.industry ?? '',
		status: r.status ?? PROSPECT_STATUS.NEW,
		demoLink: r.demo_link ?? undefined,
		flagged: r.flagged === true,
		flaggedReason: r.flagged_reason ?? undefined,
		provider: r.provider as ProspectProvider | undefined,
		provider_row_id: r.provider_row_id ?? undefined,
		address: r.address ?? undefined
	};
}

export type ListProspectsResult =
	| { prospects: Prospect[] }
	| { prospects: []; error: 'not_configured' | 'api_error'; message?: string };

/**
 * List prospects for the dashboard from Supabase (all providers for this user).
 */
export async function listProspects(userId: string): Promise<ListProspectsResult> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { prospects: [], error: 'api_error', message: 'Database not configured' };
	const { data, error } = await supabase
		.from('prospects')
		.select('id, company_name, email, website, phone, industry, status, demo_link, provider, provider_row_id, address, flagged, flagged_reason')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });
	if (error) return { prospects: [], error: 'api_error', message: error.message };
	const prospects = (data ?? []).map((r) => rowToProspect(r));
	return { prospects };
}

/**
 * Get a single prospect by our id (uuid). Used for dashboard actions and demo page.
 */
export async function getProspectById(id: string): Promise<Prospect | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('prospects')
		.select('id, company_name, email, website, phone, industry, status, demo_link, provider, provider_row_id, user_id, address, flagged, flagged_reason')
		.eq('id', id)
		.maybeSingle();
	if (error || !data) return null;
	return rowToProspect(data);
}

/**
 * Get a single prospect by id for a given user (ensures ownership). Returns prospect and createdAt for detail page / history.
 */
export async function getProspectByIdForUser(
	userId: string,
	prospectId: string
): Promise<(Prospect & { createdAt: string }) | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('prospects')
		.select('id, company_name, email, website, phone, industry, status, demo_link, provider, provider_row_id, user_id, address, flagged, flagged_reason, created_at')
		.eq('id', prospectId)
		.eq('user_id', userId)
		.maybeSingle();
	if (error || !data) return null;
	const prospect = rowToProspect(data);
	return {
		...prospect,
		createdAt: (data as { created_at?: string }).created_at ?? new Date().toISOString()
	};
}

/**
 * Get the owner user id for a prospect by id. Used to load demo banner settings for the account that owns the demo.
 */
export async function getProspectOwnerId(prospectId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('prospects')
		.select('user_id')
		.eq('id', prospectId)
		.maybeSingle();
	if (error || !data?.user_id) return null;
	return data.user_id as string;
}

/**
 * Get a prospect by provider key (user_id, provider, provider_row_id). Used to detect insert vs update during sync.
 */
async function getProspectByProviderKey(
	userId: string,
	provider: ProspectProvider,
	providerRowId: string
): Promise<{ id: string; status: string } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('prospects')
		.select('id, status')
		.eq('user_id', userId)
		.eq('provider', provider)
		.eq('provider_row_id', providerRowId)
		.maybeSingle();
	if (error || !data) return null;
	return { id: data.id, status: (data.status ?? PROSPECT_STATUS.NEW).slice(0, 100) };
}

/**
 * Add a single prospect from the dashboard (no CRM). Use for test clients so you can send one demo without connecting a CRM.
 */
export async function insertManualProspect(
	userId: string,
	fields: {
		companyName: string;
		email: string;
		website?: string;
		phone?: string;
		industry?: string;
	}
): Promise<{ id: string; error?: string }> {
	const providerRowId = crypto.randomUUID();
	const r = await insertProspectIfAbsent(userId, 'manual', providerRowId, fields);
	return { id: r.id, error: r.error };
}

/**
 * Insert a prospect only if (user_id, provider, provider_row_id) does not exist.
 * New rows get status `new`. Skips update for existing CRM rows (insert-only sync).
 */
export async function insertProspectIfAbsent(
	userId: string,
	provider: ProspectProvider,
	providerRowId: string,
	fields: {
		companyName: string;
		email: string;
		website?: string;
		phone?: string;
		industry?: string;
	}
): Promise<{ id: string; inserted: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { id: '', inserted: false, error: 'Database not configured' };
	const existing = await getProspectByProviderKey(userId, provider, providerRowId);
	if (existing) {
		return { id: existing.id, inserted: false };
	}
	const now = new Date().toISOString();
	const companyName = (fields.companyName ?? '').slice(0, 500);
	const outOfScope = isOutOfScopeCompany(companyName);
	const row = {
		user_id: userId,
		provider,
		provider_row_id: providerRowId,
		company_name: companyName,
		email: (fields.email ?? '').slice(0, 500),
		website: fields.website?.slice(0, 500) ?? null,
		phone: fields.phone?.slice(0, 100) ?? null,
		industry: fields.industry?.slice(0, 200) ?? null,
		status: PROSPECT_STATUS.NEW.slice(0, 100),
		updated_at: now,
		flagged: outOfScope,
		flagged_reason: outOfScope ? getDefaultFlaggedReason() : null
	};
	const { data, error } = await supabase.from('prospects').insert(row).select('id').single();
	if (error) return { id: '', inserted: false, error: error.message };
	return { id: data?.id ?? '', inserted: true };
}

/**
 * Upsert a prospect (e.g. GBP dental pull). New rows get `new`; existing rows keep status.
 */
export async function upsertProspect(
	userId: string,
	provider: ProspectProvider,
	providerRowId: string,
	fields: {
		companyName: string;
		email: string;
		website?: string;
		phone?: string;
		industry?: string;
		status?: string;
	}
): Promise<{ id: string; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { id: '', error: 'Database not configured' };
	const now = new Date().toISOString();
	const existing = await getProspectByProviderKey(userId, provider, providerRowId);
	const status = existing ? existing.status : PROSPECT_STATUS.NEW;
	const companyName = (fields.companyName ?? '').slice(0, 500);
	const outOfScope = isOutOfScopeCompany(companyName);
	const row = {
		user_id: userId,
		provider,
		provider_row_id: providerRowId,
		company_name: companyName,
		email: (fields.email ?? '').slice(0, 500),
		website: fields.website?.slice(0, 500) ?? null,
		phone: fields.phone?.slice(0, 100) ?? null,
		industry: fields.industry?.slice(0, 200) ?? null,
		status: status.slice(0, 100),
		updated_at: now,
		flagged: outOfScope,
		flagged_reason: outOfScope ? getDefaultFlaggedReason() : null
	};
	const { data, error } = await supabase
		.from('prospects')
		.upsert(row, { onConflict: 'user_id,provider,provider_row_id' })
		.select('id')
		.single();
	if (error) return { id: '', error: error.message };
	return { id: data?.id ?? '' };
}

/**
 * Update only the industry field (e.g. after Gemini inference when GBP category was missing or uncategorized).
 */
export async function updateProspectIndustry(
	prospectId: string,
	industry: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = (industry ?? '').trim().slice(0, 200);
	if (!value) return { ok: true };
	const { error } = await supabase
		.from('prospects')
		.update({ industry: value, updated_at: new Date().toISOString() })
		.eq('id', prospectId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Enrich prospect from GBP data (phone, website, address). Industry is always set by AI (inferIndustryWithGemini), not from GBP.
 */
export async function updateProspectFromGbp(
	prospectId: string,
	gbp: { phone?: string; website?: string; address?: string; industry?: string }
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const updates: Record<string, string> = { updated_at: new Date().toISOString() };
	if ((gbp.phone ?? '').trim()) updates.phone = gbp.phone!.trim().slice(0, 100);
	if ((gbp.website ?? '').trim()) updates.website = gbp.website!.trim().slice(0, 500);
	if ((gbp.address ?? '').trim()) updates.address = gbp.address!.trim().slice(0, 500);
	if (Object.keys(updates).length <= 1) return { ok: true }; // only updated_at
	const { error } = await supabase.from('prospects').update(updates).eq('id', prospectId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Update demo_link (and optionally status) for a prospect. Optionally push to Notion if provider is notion.
 */
export async function updateProspectDemoLink(
	prospectId: string,
	demoUrl: string,
	statusValue: string = PROSPECT_STATUS.REVIEW
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase
		.from('prospects')
		.update({
			demo_link: demoUrl,
			status: statusValue,
			updated_at: new Date().toISOString()
		})
		.eq('id', prospectId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Cron: up to `limit` prospects with exact status, not flagged, oldest `updated_at` first.
 */
export async function listProspectIdsForStatusBatch(
	status: string,
	limit: number
): Promise<{ id: string; user_id: string }[]> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('prospects')
		.select('id, user_id')
		.eq('status', status)
		.or('flagged.is.null,flagged.eq.false')
		.order('updated_at', { ascending: true })
		.limit(Math.min(Math.max(1, limit), 50));
	if (error || !data?.length) return [];
	return data.map((r) => ({ id: r.id as string, user_id: r.user_id as string }));
}

/**
 * Update only the status field for a prospect (queue states, demo pending, etc.).
 */
export async function updateProspectStatus(
	prospectId: string,
	statusValue: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = (statusValue ?? '').trim().slice(0, 100);
	if (!value) return { ok: true };
	const { error } = await supabase
		.from('prospects')
		.update({ status: value, updated_at: new Date().toISOString() })
		.eq('id', prospectId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Update email (and optionally phone) for a prospect. Only the owning user can update. Use when sync misses email or user wants to correct it.
 */
export async function updateProspectContact(
	userId: string,
	prospectId: string,
	fields: { email?: string; phone?: string }
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { data: existing } = await supabase
		.from('prospects')
		.select('id')
		.eq('id', prospectId)
		.eq('user_id', userId)
		.maybeSingle();
	if (!existing) return { ok: false, error: 'Prospect not found or access denied' };
	const updates: Record<string, string | null> = { updated_at: new Date().toISOString() };
	if (fields.email !== undefined) updates.email = (fields.email ?? '').trim().slice(0, 500);
	if (fields.phone !== undefined) updates.phone = (fields.phone ?? '').trim().slice(0, 100) || null;
	if (Object.keys(updates).length <= 1) return { ok: true };
	const { error } = await supabase
		.from('prospects')
		.update(updates)
		.eq('id', prospectId)
		.eq('user_id', userId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Delete a prospect. Only the owning user can delete. Used to remove out-of-scope or unwanted rows.
 */
export async function deleteProspect(userId: string, prospectId: string): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { data: existing } = await supabase
		.from('prospects')
		.select('id')
		.eq('id', prospectId)
		.eq('user_id', userId)
		.maybeSingle();
	if (!existing) return { ok: false, error: 'Prospect not found or access denied' };
	const { error } = await supabase.from('prospects').delete().eq('id', prospectId).eq('user_id', userId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Set or clear the flagged state on a prospect (e.g. manual "out of scope" or unflag).
 */
export async function setProspectFlagged(
	userId: string,
	prospectId: string,
	flagged: boolean,
	reason?: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { data: existing } = await supabase
		.from('prospects')
		.select('id')
		.eq('id', prospectId)
		.eq('user_id', userId)
		.maybeSingle();
	if (!existing) return { ok: false, error: 'Prospect not found or access denied' };
	const { error } = await supabase
		.from('prospects')
		.update({
			flagged,
			flagged_reason: flagged ? (reason ?? getDefaultFlaggedReason()).slice(0, 500) : null,
			updated_at: new Date().toISOString()
		})
		.eq('id', prospectId)
		.eq('user_id', userId);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}
