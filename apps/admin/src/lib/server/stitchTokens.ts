/**
 * Stitch OAuth token storage (per user). Uses user_settings under key stitch_oauth.
 * Mirrors the Gmail token pattern in gmail.ts.
 */

import { getSupabaseAdmin } from '$lib/server/supabase';
import { refreshStitchAccessToken } from '$lib/server/stitchAuth';

const STITCH_OAUTH_KEY = 'stitch_oauth';

export type StitchTokens = {
	refresh_token: string;
	access_token?: string;
	expires_at?: number;
	email?: string;
};

export async function getStitchTokens(userId: string): Promise<StitchTokens | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', STITCH_OAUTH_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'object') return null;
	const v = data.value as Record<string, unknown>;
	const rt = v.refresh_token;
	if (typeof rt !== 'string' || !rt.trim()) return null;
	return {
		refresh_token: rt.trim(),
		access_token: typeof v.access_token === 'string' ? v.access_token : undefined,
		expires_at: typeof v.expires_at === 'number' ? v.expires_at : undefined,
		email: typeof v.email === 'string' ? v.email : undefined
	};
}

export async function setStitchTokens(
	userId: string,
	tokens: StitchTokens
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = {
		refresh_token: tokens.refresh_token,
		...(tokens.access_token != null && { access_token: tokens.access_token }),
		...(tokens.expires_at != null && { expires_at: tokens.expires_at }),
		...(tokens.email != null && { email: tokens.email })
	};
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: STITCH_OAUTH_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function deleteStitchTokens(userId: string): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase
		.from('user_settings')
		.delete()
		.eq('user_id', userId)
		.eq('key', STITCH_OAUTH_KEY);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

const EXPIRY_BUFFER_MS = 60 * 1000;

/**
 * Return a valid access token for the user's Stitch OAuth connection. Refreshes and persists if expired.
 */
export async function getValidStitchAccessToken(userId: string): Promise<string | null> {
	const tokens = await getStitchTokens(userId);
	if (!tokens?.refresh_token) return null;

	const now = Date.now();
	if (
		tokens.access_token &&
		tokens.expires_at != null &&
		tokens.expires_at > now + EXPIRY_BUFFER_MS
	) {
		return tokens.access_token;
	}

	try {
		const { access_token, expires_in } = await refreshStitchAccessToken(tokens.refresh_token);
		const expires_at = expires_in ? now + expires_in * 1000 : undefined;
		await setStitchTokens(userId, {
			...tokens,
			access_token,
			expires_at
		});
		return access_token;
	} catch {
		return null;
	}
}
