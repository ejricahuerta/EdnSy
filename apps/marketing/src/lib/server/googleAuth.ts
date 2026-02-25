import { env } from '$env/dynamic/private';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Scopes for login only (identity + email + profile). */
const LOGIN_SCOPES = [
	'openid',
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

function getClientId(): string {
	const id = env.GOOGLE_CLIENT_ID;
	if (!id) throw new Error('GOOGLE_CLIENT_ID is not set');
	return id;
}

function getClientSecret(): string {
	const secret = env.GOOGLE_CLIENT_SECRET;
	if (!secret) throw new Error('GOOGLE_CLIENT_SECRET is not set');
	return secret;
}

/**
 * Build the Google OAuth authorization URL. redirectUri must match the callback URL
 * (e.g. origin + '/auth/google/callback').
 */
export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
	const params = new URLSearchParams({
		client_id: getClientId(),
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: LOGIN_SCOPES,
		access_type: 'offline',
		prompt: 'consent',
		...(state && { state })
	});
	return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokenResponse {
	access_token: string;
	expires_in?: number;
	id_token?: string;
	scope: string;
	token_type: string;
}

/**
 * Exchange the authorization code for tokens. redirectUri must match the one used in getGoogleAuthUrl.
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: getClientId(),
			client_secret: getClientSecret(),
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
			code
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Google token exchange failed: ${err}`);
	}
	return res.json() as Promise<GoogleTokenResponse>;
}

export interface GoogleUserInfo {
	id: string;
	email: string;
	name: string;
	picture: string;
}

/**
 * Fetch user info using the access token.
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
	const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Google userinfo failed: ${err}`);
	}
	return res.json() as Promise<GoogleUserInfo>;
}
