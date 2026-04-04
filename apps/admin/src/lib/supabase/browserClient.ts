import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { getSupabaseDbSchema } from '$lib/supabase/dbSchema';

export type SupabasePublicFromLayout = { url: string; anonKey: string } | null | undefined;

/** Browser client; optional `layoutSupabasePublic` when only server env is set. */
export function createSupabaseBrowserClient(
	layoutSupabasePublic?: SupabasePublicFromLayout,
	layoutDbSchema?: 'public' | 'dev'
) {
	const url = (layoutSupabasePublic?.url ?? env.PUBLIC_SUPABASE_URL ?? '').trim();
	const anonKey = (layoutSupabasePublic?.anonKey ?? env.PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
	if (!url || !anonKey) {
		throw new Error(
			'Supabase client: missing URL or anon key. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env, ' +
				'or SUPABASE_URL and SUPABASE_ANON_KEY (layout must expose supabasePublic). See Supabase Dashboard → API.'
		);
	}
	const schema = layoutDbSchema ?? getSupabaseDbSchema();
	return createBrowserClient(url, anonKey, {
		db: { schema }
	});
}
