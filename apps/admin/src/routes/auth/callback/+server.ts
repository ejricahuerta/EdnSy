import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	exchangeGoogleAuthorizationCode,
	getDashboardGoogleOAuthConfig,
	GOOGLE_OAUTH_CSRF_COOKIE,
	parseOAuthStateParam,
	resolveGoogleOAuthRedirectUri,
	verifyGoogleIdToken
} from '$lib/server/googleDashboardAuth';
import { createSessionCookie, getSessionCookieName, getSessionCookieOptions } from '$lib/server/session';

/**
 * Google OAuth callback: verify ID token, set signed app session cookie,
 * then sync Supabase session via signInWithIdToken (Realtime / RLS still use auth.identities).
 */
export const GET: RequestHandler = async (event) => {
	const { url, cookies, locals } = event;

	const oauthErr = url.searchParams.get('error_description') ?? url.searchParams.get('error');
	if (oauthErr) {
		console.error('[auth/callback] Google OAuth error param:', oauthErr);
		throw redirect(303, '/auth/login?error=auth');
	}

	const code = url.searchParams.get('code');
	const stateParam = url.searchParams.get('state');
	const cookieCsrf = cookies.get(GOOGLE_OAUTH_CSRF_COOKIE);
	const parsed = parseOAuthStateParam(stateParam);

	cookies.delete(GOOGLE_OAUTH_CSRF_COOKIE, { path: '/' });

	if (!code || !parsed || !cookieCsrf || parsed.csrf !== cookieCsrf) {
		console.error('[auth/callback] Missing code, invalid state, or CSRF mismatch');
		throw redirect(303, '/auth/login?error=auth');
	}

	const next = parsed.next;
	const cfg = getDashboardGoogleOAuthConfig();
	if (!cfg) {
		throw redirect(303, '/auth/login?error=oauth');
	}

	const redirectUri = resolveGoogleOAuthRedirectUri(url.origin);

	let idToken: string;
	let accessToken: string | undefined;
	try {
		const tokens = await exchangeGoogleAuthorizationCode(
			code,
			redirectUri,
			cfg.clientId,
			cfg.clientSecret
		);
		idToken = tokens.id_token;
		accessToken = tokens.access_token;
	} catch (e) {
		console.error('[auth/callback] Google token exchange:', e);
		throw redirect(303, '/auth/login?error=auth');
	}

	let profile: { sub: string; email: string; name: string; picture: string };
	try {
		profile = await verifyGoogleIdToken(idToken, cfg.clientId);
	} catch (e) {
		console.error('[auth/callback] Google ID token verify:', e);
		throw redirect(303, '/auth/login?error=auth');
	}

	let cookieValue: string;
	try {
		cookieValue = await createSessionCookie({
			id: profile.sub,
			email: profile.email,
			name: profile.name,
			picture: profile.picture
		});
	} catch (e) {
		console.error('[auth/callback] Session cookie:', e);
		throw redirect(303, '/auth/login?error=session');
	}

	cookies.set(getSessionCookieName(), cookieValue, getSessionCookieOptions());

	const { error: supaErr } = await locals.supabase.auth.signInWithIdToken({
		provider: 'google',
		token: idToken,
		...(accessToken ? { access_token: accessToken } : {})
	});
	if (supaErr) {
		console.warn(
			'[auth/callback] signInWithIdToken failed (dashboard login still works; Realtime/RLS need this):\n',
			supaErr.message,
			'\n→ Supabase Dashboard → Authentication → Providers → Google: turn **on**, paste the same Client ID and Client Secret as AUTH_GOOGLE_CLIENT_ID / AUTH_GOOGLE_CLIENT_SECRET.'
		);
	}

	throw redirect(303, next);
};
