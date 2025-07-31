import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

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

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  // Legacy function for backward compatibility
  event.locals.getSession = async () => {
    const { session } = await event.locals.safeGetSession();
    return session;
  };

  // Protect dashboard routes - only authenticated users allowed
  if (event.url.pathname.startsWith('/dashboard') || 
      event.url.pathname.startsWith('/test-user') ||
      event.url.pathname.startsWith('/stripe') ||
      event.url.pathname.startsWith('/n8n') ||
      event.url.pathname.startsWith('/analytics')) {
    const { session, user } = await event.locals.safeGetSession();
    
    if (!session) {
      throw redirect(303, '/login');
    }
  }

  // TODO: Re-enable API protection once authentication is working properly
  // if (event.url.pathname.startsWith('/api/')) {
  //   const { session, user } = await event.locals.safeGetSession();
  //   
  //   if (!session) {
  //     throw redirect(303, '/login');
  //   }
  // }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};