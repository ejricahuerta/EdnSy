import { getSupabaseAdmin } from '$lib/server/supabase';

const APIFY_TOKEN_KEY = 'apify_api_token';
const SHARED_WORKSPACE_USER_ID = 'ednsy_workspace';

export async function getApifyApiTokenForUser(_userId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', SHARED_WORKSPACE_USER_ID)
		.eq('key', APIFY_TOKEN_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'object') return null;
	const v = data.value as Record<string, unknown>;
	const token = typeof v.apiToken === 'string' ? v.apiToken.trim() : '';
	return token.length > 0 ? token : null;
}

export async function setApifyApiTokenForUser(
	_userId: string,
	apiToken: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const token = apiToken.trim();
	if (!token) return { ok: false, error: 'API key is required' };
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: SHARED_WORKSPACE_USER_ID,
			key: APIFY_TOKEN_KEY,
			value: { apiToken: token },
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function deleteApifyApiTokenForUser(
	_userId: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase
		.from('user_settings')
		.delete()
		.eq('user_id', SHARED_WORKSPACE_USER_ID)
		.eq('key', APIFY_TOKEN_KEY);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}
