import { env } from '$env/dynamic/private';
import * as jose from 'jose';
import { randomBytes } from 'node:crypto';

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export const GOOGLE_OAUTH_CSRF_COOKIE = 'ednsy_google_oauth_csrf';

export function getDashboardGoogleOAuthConfig():
	| { clientId: string; clientSecret: string }
	| null {
	const clientId =
		env.AUTH_GOOGLE_CLIENT_ID?.trim() || env.GOOGLE_CLIENT_ID?.trim();
	const clientSecret =
		env.AUTH_GOOGLE_CLIENT_SECRET?.trim() || env.GOOGLE_CLIENT_SECRET?.trim();
	if (!clientId || !clientSecret) return null;
	return { clientId, clientSecret };
}

/**
 * Redirect URI sent to Google (authorize + token exchange). Must match an entry in
 * Google Cloud Console → APIs & Services → Credentials → your OAuth client → Authorized redirect URIs
 * (exact string: scheme, host, port if any, path, no trailing slash).
 */
export function resolveGoogleOAuthRedirectUri(requestOrigin: string): string {
	const override =
		env.AUTH_GOOGLE_REDIRECT_URI?.trim() || env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
	if (override) {
		return override.replace(/\/$/, '');
	}
	const origin = requestOrigin.replace(/\/$/, '');
	return `${origin}/auth/callback`;
}

export function googleOAuthCsrfCookieOptions(): {
	path: string;
	maxAge: number;
	httpOnly: boolean;
	sameSite: 'lax';
	secure: boolean;
} {
	return {
		path: '/',
		maxAge: 600,
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	};
}

export function newOAuthCsrfToken(): string {
	return randomBytes(24).toString('hex');
}

export function createOAuthStateParam(csrf: string, nextPath: string): string {
	return Buffer.from(JSON.stringify({ c: csrf, n: nextPath }), 'utf8').toString('base64url');
}

export function parseOAuthStateParam(state: string | null): { csrf: string; next: string } | null {
	if (!state) return null;
	try {
		const json = Buffer.from(state, 'base64url').toString('utf8');
		const o = JSON.parse(json) as { c?: string; n?: string };
		if (typeof o.c !== 'string' || typeof o.n !== 'string') return null;
		if (!o.n.startsWith('/')) return null;
		return { csrf: o.c, next: o.n };
	} catch {
		return null;
	}
}

export function buildGoogleAuthorizeUrl(opts: {
	clientId: string;
	redirectUri: string;
	state: string;
}): string {
	const params = new URLSearchParams({
		client_id: opts.clientId,
		redirect_uri: opts.redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		state: opts.state,
		access_type: 'offline',
		prompt: 'select_account'
	});
	return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function exchangeGoogleAuthorizationCode(
	code: string,
	redirectUri: string,
	clientId: string,
	clientSecret: string
): Promise<{ id_token: string; access_token?: string }> {
	const body = new URLSearchParams({
		code,
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		grant_type: 'authorization_code'
	});
	const res = await fetch(GOOGLE_TOKEN, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Google token exchange failed: ${res.status} ${text.slice(0, 240)}`);
	}
	const data = (await res.json()) as { id_token?: string; access_token?: string };
	if (!data.id_token) throw new Error('Google token response missing id_token');
	return { id_token: data.id_token, access_token: data.access_token };
}

export async function verifyGoogleIdToken(
	idToken: string,
	expectedClientId: string
): Promise<{ sub: string; email: string; name: string; picture: string }> {
	const { payload } = await jose.jwtVerify(idToken, JWKS, {
		issuer: ['https://accounts.google.com', 'accounts.google.com'],
		audience: expectedClientId
	});
	const sub = typeof payload.sub === 'string' ? payload.sub : '';
	const email = typeof payload.email === 'string' ? payload.email : '';
	if (!sub || !email) throw new Error('Google ID token missing sub or email');
	const name =
		(typeof payload.name === 'string' && payload.name) ||
		(typeof (payload as { given_name?: string }).given_name === 'string'
			? (payload as { given_name: string }).given_name
			: '') ||
		'';
	const picture = typeof payload.picture === 'string' ? payload.picture : '';
	return { sub, email, name, picture };
}
