import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Project URL + anon key for Supabase Auth, SSR cookies, and browser Realtime.
 * Prefer `PUBLIC_SUPABASE_*` in `.env` (required for client bundle if you skip layout fallback).
 * Server also accepts `SUPABASE_URL` + `SUPABASE_ANON_KEY` so existing server-only setups work.
 */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
	const url = (PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '').trim();
	const anonKey = (PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim();
	if (!url || !anonKey) return null;
	return { url, anonKey };
}
