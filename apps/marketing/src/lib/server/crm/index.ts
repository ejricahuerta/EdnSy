import { getSupabaseAdmin } from '$lib/server/supabase';

export type CrmProvider = 'hubspot' | 'gohighlevel' | 'pipedrive';

export async function getCrmConnection(
	userId: string,
	provider: CrmProvider
): Promise<{ access_token: string } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('crm_connections')
		.select('access_token')
		.eq('user_id', userId)
		.eq('provider', provider)
		.maybeSingle();
	if (error || !data) return null;
	return { access_token: data.access_token };
}

export async function saveCrmConnection(
	userId: string,
	provider: CrmProvider,
	accessToken: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase.from('crm_connections').upsert(
		{
			user_id: userId,
			provider,
			access_token: accessToken,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,provider' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function deleteCrmConnection(userId: string, provider: CrmProvider): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase.from('crm_connections').delete().eq('user_id', userId).eq('provider', provider);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function listCrmConnections(userId: string): Promise<{ provider: CrmProvider; connected: boolean }[]> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return [];
	const { data } = await supabase.from('crm_connections').select('provider').eq('user_id', userId);
	const set = new Set((data ?? []).map((r) => r.provider as CrmProvider));
	return [
		{ provider: 'hubspot', connected: set.has('hubspot') },
		{ provider: 'gohighlevel', connected: set.has('gohighlevel') },
		{ provider: 'pipedrive', connected: set.has('pipedrive') }
	];
}

export { listHubSpotContacts } from './hubspot';
export { listGoHighLevelContacts } from './gohighlevel';
export { listPipedriveContacts } from './pipedrive';
