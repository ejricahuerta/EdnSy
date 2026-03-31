import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/** URL + anon key for Supabase (PUBLIC_* or SUPABASE_* fallbacks). Dynamic env avoids static import errors when vars are runtime-only. */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
	const url = (publicEnv.PUBLIC_SUPABASE_URL || privateEnv.SUPABASE_URL || '').trim();
	const anonKey = (publicEnv.PUBLIC_SUPABASE_ANON_KEY || privateEnv.SUPABASE_ANON_KEY || '').trim();
	if (!url || !anonKey) return null;
	return { url, anonKey };
}
