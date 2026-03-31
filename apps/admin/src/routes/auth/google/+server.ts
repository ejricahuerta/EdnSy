import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	buildGoogleAuthorizeUrl,
	createOAuthStateParam,
	getDashboardGoogleOAuthConfig,
	googleOAuthCsrfCookieOptions,
	GOOGLE_OAUTH_CSRF_COOKIE,
	newOAuthCsrfToken,
	resolveGoogleOAuthRedirectUri
} from '$lib/server/googleDashboardAuth';

/**
 * Starts Google OAuth (authorization code) for dashboard sign-in.
 * Uses AUTH_GOOGLE_CLIENT_ID / AUTH_GOOGLE_CLIENT_SECRET (or GOOGLE_* aliases).
 * Add the exact redirect URI in Google Cloud: `{origin}/auth/callback`.
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const cfg = getDashboardGoogleOAuthConfig();
	if (!cfg) {
		throw redirect(303, '/auth/login?error=oauth');
	}

	const nextRaw = url.searchParams.get('next') ?? '/dashboard';
	const next = nextRaw.startsWith('/') ? nextRaw : '/dashboard';
	const redirectUri = resolveGoogleOAuthRedirectUri(url.origin);
	if (process.env.NODE_ENV !== 'production') {
		console.info('[auth/google] redirect_uri (must match Google Cloud Console):', redirectUri);
	}

	const csrf = newOAuthCsrfToken();
	cookies.set(GOOGLE_OAUTH_CSRF_COOKIE, csrf, googleOAuthCsrfCookieOptions());
	const state = createOAuthStateParam(csrf, next);

	const location = buildGoogleAuthorizeUrl({
		clientId: cfg.clientId,
		redirectUri,
		state
	});
	throw redirect(303, location);
};
