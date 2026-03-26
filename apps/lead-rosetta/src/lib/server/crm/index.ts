import { getSupabaseAdmin } from '$lib/server/supabase';

export type CrmProvider = 'notion';

export type CrmConnectionMeta = {
	databaseId?: string;
	/** Notion: our field id -> Notion property name */
	fieldMapping?: Record<string, string>;
};

export async function getCrmConnection(
	userId: string,
	provider: CrmProvider
): Promise<{ access_token: string; databaseId?: string; fieldMapping?: Record<string, string> } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('crm_connections')
		.select('access_token, provider_metadata')
		.eq('user_id', userId)
		.eq('provider', provider)
		.maybeSingle();
	if (error || !data) return null;
	const meta = (data.provider_metadata as { databaseId?: string; fieldMapping?: Record<string, string> } | null) ?? {};
	return {
		access_token: data.access_token,
		...(meta.databaseId != null ? { databaseId: meta.databaseId } : {}),
		...(meta.fieldMapping != null ? { fieldMapping: meta.fieldMapping } : {})
	};
}

export async function saveCrmConnection(
	userId: string,
	provider: CrmProvider,
	accessToken: string,
	metadata?: CrmConnectionMeta
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const row: {
		user_id: string;
		provider: CrmProvider;
		access_token: string;
		updated_at: string;
		provider_metadata?: { databaseId?: string; fieldMapping?: Record<string, string> } | null;
	} = {
		user_id: userId,
		provider,
		access_token: accessToken,
		updated_at: new Date().toISOString()
	};
	if (provider === 'notion') {
		const existing = await getCrmConnection(userId, 'notion');
		const existingMeta = (existing && 'databaseId' in existing)
			? { databaseId: existing.databaseId, fieldMapping: existing.fieldMapping }
			: {};
		row.provider_metadata = {
			databaseId: metadata?.databaseId?.trim() ?? existingMeta.databaseId ?? '',
			...(metadata?.fieldMapping !== undefined ? { fieldMapping: metadata.fieldMapping } : { fieldMapping: existingMeta.fieldMapping })
		};
	}
	const { error } = await supabase.from('crm_connections').upsert(row, { onConflict: 'user_id,provider' });
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
	const set = new Set((data ?? []).map((r) => r.provider as string));
	return [{ provider: 'notion', connected: set.has('notion') }];
}
