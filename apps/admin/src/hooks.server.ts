import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { getSupabaseDbSchemaServer } from '$lib/server/dbSchemaEnv';
import { getSupabasePublicConfig } from '$lib/server/supabasePublicConfig';

export const handle: Handle = async ({ event, resolve }) => {
	const cfg = getSupabasePublicConfig();
	if (!cfg) {
		throw new Error(
			'Supabase URL and anon key are missing. In apps/admin/.env set PUBLIC_SUPABASE_URL and ' +
				'PUBLIC_SUPABASE_ANON_KEY, or set SUPABASE_URL and SUPABASE_ANON_KEY (same values as in ' +
				'Supabase Dashboard → Settings → API). The anon key is safe to use on the client.'
		);
	}
	event.locals.supabase = createServerClient(cfg.url, cfg.anonKey, {
		db: { schema: getSupabaseDbSchemaServer() },
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
				// Required by @supabase/ssr when persisting auth cookies (avoids shared caches serving Set-Cookie).
				if (headers && Object.keys(headers).length > 0) {
					event.setHeaders(headers);
				}
			}
		}
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
