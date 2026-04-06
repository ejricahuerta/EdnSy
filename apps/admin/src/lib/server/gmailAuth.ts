import { env } from '$env/dynamic/private';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Gmail send scope (immediate send via messages.send; try/free flows). */
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
/** Create, update, delete drafts and send via drafts.send (CRM outreach). */
const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';
/** Gmail metadata scope (required for users.getProfile to read email address). gmail.send alone cannot read profile. */
const GMAIL_METADATA_SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';
/** Combined scopes: compose + send + profile. Reconnect Integrations after adding compose. */
const GMAIL_SCOPE = `${GMAIL_COMPOSE_SCOPE} ${GMAIL_SEND_SCOPE} ${GMAIL_METADATA_SCOPE}`;

function getGmailClientId(): string {
	const id = env.GMAIL_GOOGLE_CLIENT_ID;
	if (!id) throw new Error('GMAIL_GOOGLE_CLIENT_ID is not set');
	return id;
}

function getGmailClientSecret(): string {
	const secret = env.GMAIL_GOOGLE_CLIENT_SECRET;
	if (!secret) throw new Error('GMAIL_GOOGLE_CLIENT_SECRET is not set');
	return secret;
}

/**
 * Build the Google OAuth URL for Gmail send. redirectUri must match the callback
 * (e.g. origin + '/auth/gmail/callback'). state should include redirect path after connect (e.g. /dashboard/integrations).
 */
export function getGmailAuthUrl(redirectUri: string, state?: string): string {
	const params = new URLSearchParams({
		client_id: getGmailClientId(),
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: GMAIL_SCOPE,
		access_type: 'offline',
		prompt: 'consent',
		...(state && { state })
	});
	return `${AUTH_URL}?${params.toString()}`;
}

export interface GmailTokenResponse {
	access_token: string;
	expires_in?: number;
	refresh_token?: string;
	scope: string;
	token_type: string;
}

/**
 * Exchange the authorization code for tokens. redirectUri must match the one used in getGmailAuthUrl.
 */
export async function exchangeGmailCodeForTokens(
	code: string,
	redirectUri: string
): Promise<GmailTokenResponse> {
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: getGmailClientId(),
			client_secret: getGmailClientSecret(),
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
			code
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail token exchange failed: ${err}`);
	}
	return res.json() as Promise<GmailTokenResponse>;
}

/**
 * Fetch Gmail profile (emailAddress) for the authenticated user.
 */
export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string }> {
	const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail profile failed: ${err}`);
	}
	const data = (await res.json()) as { emailAddress?: string };
	return { emailAddress: data.emailAddress || '' };
}

/**
 * Refresh access token using refresh_token. Uses Gmail client credentials.
 */
export async function refreshGmailAccessToken(
	refreshToken: string
): Promise<{ access_token: string; expires_in?: number }> {
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: getGmailClientId(),
			client_secret: getGmailClientSecret(),
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail token refresh failed: ${err}`);
	}
	const data = (await res.json()) as { access_token: string; expires_in?: number };
	return { access_token: data.access_token, expires_in: data.expires_in };
}
