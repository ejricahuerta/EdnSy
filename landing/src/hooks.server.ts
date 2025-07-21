import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key: string) => event.cookies.get(key),
        set: (key: string, value: string, options?: Record<string, any>) =>
          event.cookies.set(key, value, { path: '/', ...options }),
        remove: (key: string, options?: Record<string, any>) =>
          event.cookies.delete(key, { path: '/', ...options })
      }
    }
  );

  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event);
};