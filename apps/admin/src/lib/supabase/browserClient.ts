import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

export type SupabasePublicFromLayout = { url: string; anonKey: string } | null | undefined;

/**
 * Browser Supabase client. Pass `data.supabasePublic` from root layout when `PUBLIC_*` env vars
 * are unset but `SUPABASE_URL` + `SUPABASE_ANON_KEY` are set (server injects config via load).
 */
export function createSupabaseBrowserClient(layoutSupabasePublic?: SupabasePublicFromLayout) {
	const url = (layoutSupabasePublic?.url ?? PUBLIC_SUPABASE_URL ?? '').trim();
	const anonKey = (layoutSupabasePublic?.anonKey ?? PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
	if (!url || !anonKey) {
		throw new Error(
			'Supabase client: missing URL or anon key. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env, ' +
				'or SUPABASE_URL and SUPABASE_ANON_KEY (layout must expose supabasePublic). See Supabase Dashboard → API.'
		);
	}
	return createBrowserClient(url, anonKey);
}
