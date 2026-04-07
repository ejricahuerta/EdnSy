import { env } from '$env/dynamic/private';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/** GCP scope for Stitch MCP; userinfo.email so we can show the connected Google account in Integrations. */
const STITCH_SCOPE =
	'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email';

function getStitchClientId(): string {
	const id = env.STITCH_GOOGLE_CLIENT_ID;
	if (!id?.trim()) throw new Error('STITCH_GOOGLE_CLIENT_ID is not set');
	return id.trim();
}

function getStitchClientSecret(): string {
	const secret = env.STITCH_GOOGLE_CLIENT_SECRET;
	if (!secret?.trim()) throw new Error('STITCH_GOOGLE_CLIENT_SECRET is not set');
	return secret.trim();
}

/**
 * Build the Google OAuth URL for Stitch (GCP). redirectUri must match the callback
 * (e.g. origin + '/auth/stitch/callback'). state should include redirect path after connect.
 */
export function getStitchAuthUrl(redirectUri: string, state?: string): string {
	const params = new URLSearchParams({
		client_id: getStitchClientId(),
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: STITCH_SCOPE,
		access_type: 'offline',
		prompt: 'consent',
		...(state && { state })
	});
	return `${AUTH_URL}?${params.toString()}`;
}

export interface StitchTokenResponse {
	access_token: string;
	expires_in?: number;
	refresh_token?: string;
	scope: string;
	token_type: string;
}

/**
 * Exchange the authorization code for tokens. redirectUri must match the one used in getStitchAuthUrl.
 */
export async function exchangeStitchCodeForTokens(
	code: string,
	redirectUri: string
): Promise<StitchTokenResponse> {
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: getStitchClientId(),
			client_secret: getStitchClientSecret(),
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
			code
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Stitch OAuth token exchange failed: ${err}`);
	}
	return res.json() as Promise<StitchTokenResponse>;
}

/**
 * Refresh access token using refresh_token.
 */
export async function refreshStitchAccessToken(
	refreshToken: string
): Promise<{ access_token: string; expires_in?: number }> {
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: getStitchClientId(),
			client_secret: getStitchClientSecret(),
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Stitch token refresh failed: ${err}`);
	}
	const data = (await res.json()) as { access_token: string; expires_in?: number };
	return { access_token: data.access_token, expires_in: data.expires_in };
}

/**
 * Fetch Google account email for the authenticated user (userinfo).
 */
export async function getStitchGoogleUserEmail(accessToken: string): Promise<string | undefined> {
	const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) return undefined;
	const data = (await res.json()) as { email?: string };
	return typeof data.email === 'string' ? data.email : undefined;
}
