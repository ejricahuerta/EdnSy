/**
 * Central prospects store in Supabase.
 * Dashboard list and demo tracking use this; data is synced from any connected integration
 * (Notion, HubSpot, GoHighLevel, Pipedrive). Each row tracks provider + provider_row_id.
 */

import { getSupabaseAdmin } from '$lib/server/supabase';

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
	/** Set when loading from DB for demo_tracking upsert */
	provider?: ProspectProvider;
	provider_row_id?: string;
	/** Set when loading from DB; used for custom demo template lookup */
	userId?: string;
};

export type ProspectProvider = 'notion' | 'hubspot' | 'gohighlevel' | 'pipedrive' | 'manual';

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
}): Prospect {
	return {
		id: r.id,
		companyName: r.company_name ?? '',
		email: r.email ?? '',
		website: r.website ?? '',
		phone: r.phone ?? undefined,
		industry: r.industry ?? '',
		status: r.status ?? 'Prospect',
		demoLink: r.demo_link ?? undefined,
		provider: r.provider as ProspectProvider | undefined,
		provider_row_id: r.provider_row_id ?? undefined
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
		.select('id, company_name, email, website, phone, industry, status, demo_link, provider, provider_row_id')
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
		.select('id, company_name, email, website, phone, industry, status, demo_link, provider, provider_row_id, user_id')
		.eq('id', id)
		.maybeSingle();
	if (error || !data) return null;
	return rowToProspect(data);
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
	const supabase = getSupabaseAdmin();
	if (!supabase) return { id: '', error: 'Database not configured' };
	const providerRowId = crypto.randomUUID();
	return upsertProspect(userId, 'manual', providerRowId, {
		...fields,
		status: 'Prospect'
	});
}

/**
 * Upsert a prospect from a provider. Used when syncing from Notion, HubSpot, GHL, or Pipedrive.
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
	const row = {
		user_id: userId,
		provider,
		provider_row_id: providerRowId,
		company_name: (fields.companyName ?? '').slice(0, 500),
		email: (fields.email ?? '').slice(0, 500),
		website: fields.website?.slice(0, 500) ?? null,
		phone: fields.phone?.slice(0, 100) ?? null,
		industry: fields.industry?.slice(0, 200) ?? null,
		status: (fields.status ?? 'Prospect').slice(0, 100),
		updated_at: now
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
 * Update demo_link (and optionally status) for a prospect. Optionally push to Notion if provider is notion.
 */
export async function updateProspectDemoLink(
	prospectId: string,
	demoUrl: string,
	statusValue: string = 'Demo Created'
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
