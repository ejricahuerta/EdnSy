/**
 * Gmail OAuth token storage and send via Gmail API.
 * Tokens stored in user_settings under key gmail_oauth.
 */

import { getSupabaseAdmin } from '$lib/server/supabase';
import { refreshGmailAccessToken, getGmailProfile } from '$lib/server/gmailAuth';

const GMAIL_OAUTH_KEY = 'gmail_oauth';

export type GmailTokens = {
	refresh_token: string;
	access_token?: string;
	expires_at?: number;
	email?: string;
};

export async function getGmailTokens(userId: string): Promise<GmailTokens | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', GMAIL_OAUTH_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'object') return null;
	const v = data.value as Record<string, unknown>;
	const rt = v.refresh_token;
	if (typeof rt !== 'string' || !rt.trim()) return null;
	return {
		refresh_token: rt.trim(),
		access_token: typeof v.access_token === 'string' ? v.access_token : undefined,
		expires_at: typeof v.expires_at === 'number' ? v.expires_at : undefined,
		email: typeof v.email === 'string' ? v.email : undefined
	};
}

export async function setGmailTokens(
	userId: string,
	tokens: GmailTokens
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = {
		refresh_token: tokens.refresh_token,
		...(tokens.access_token != null && { access_token: tokens.access_token }),
		...(tokens.expires_at != null && { expires_at: tokens.expires_at }),
		...(tokens.email != null && { email: tokens.email })
	};
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: GMAIL_OAUTH_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

export async function deleteGmailTokens(userId: string): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase
		.from('user_settings')
		.delete()
		.eq('user_id', userId)
		.eq('key', GMAIL_OAUTH_KEY);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

const EXPIRY_BUFFER_MS = 60 * 1000; // refresh if expires within 1 min

/**
 * Return a valid access token for the user's Gmail. Refreshes and persists if expired.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
	const tokens = await getGmailTokens(userId);
	if (!tokens?.refresh_token) return null;

	const now = Date.now();
	if (
		tokens.access_token &&
		tokens.expires_at != null &&
		tokens.expires_at > now + EXPIRY_BUFFER_MS
	) {
		return tokens.access_token;
	}

	try {
		const { access_token, expires_in } = await refreshGmailAccessToken(tokens.refresh_token);
		const expires_at = expires_in ? now + expires_in * 1000 : undefined;
		await setGmailTokens(userId, {
			...tokens,
			access_token,
			expires_at
		});
		return access_token;
	} catch {
		return null;
	}
}

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Build a simple RFC 2822 MIME message for sending via Gmail API.
 * fromEmail should be the authenticated Gmail address; fromName is optional display name.
 */
function buildMimeMessage(
	to: string,
	subject: string,
	html: string,
	fromEmail: string,
	fromName: string | null
): string {
	const fromDisplay = fromName?.trim()
		? `From: ${fromName} <${fromEmail}>\r\n`
		: `From: ${fromEmail}\r\n`;
	return [
		fromDisplay,
		`To: ${to}\r\n`,
		`Subject: ${subject}\r\n`,
		'MIME-Version: 1.0\r\n',
		'Content-Type: text/html; charset=UTF-8\r\n',
		'\r\n',
		html
	].join('');
}

/**
 * Encode to base64url as required by Gmail API (replace +/ with -_).
 */
function toBase64Url(buffer: Uint8Array): string {
	const base64 = Buffer.from(buffer).toString('base64');
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Send an email via Gmail API as the authenticated user. Uses getValidAccessToken(userId).
 */
export async function sendEmailViaGmail(
	userId: string,
	to: string,
	subject: string,
	html: string,
	fromName?: string | null
): Promise<SendEmailResult> {
	const accessToken = await getValidAccessToken(userId);
	if (!accessToken) {
		return { ok: false, error: 'Gmail not connected or token expired. Reconnect in Integrations.' };
	}

	let tokens = await getGmailTokens(userId);
	let fromEmail = tokens?.email;
	// Gmail API requires From to be the authenticated account; fetch profile if we never stored email
	if (!fromEmail?.trim()) {
		try {
			const profile = await getGmailProfile(accessToken);
			fromEmail = profile.emailAddress?.trim() || undefined;
			if (fromEmail && tokens) {
				await setGmailTokens(userId, { ...tokens, email: fromEmail });
				tokens = { ...tokens, email: fromEmail };
			}
		} catch (e) {
			const hint =
				'Reconnect Gmail in Dashboard → Integrations so we can read your Gmail address. If the app is in Testing mode, add your Gmail as a Test user in Google Cloud Console.';
			return { ok: false, error: `Could not determine Gmail address. ${hint}` };
		}
	}
	if (!fromEmail) {
		return {
			ok: false,
			error:
				'Gmail address not found. Reconnect Gmail in Dashboard → Integrations. If the app is in Testing mode, add your Gmail as a Test user in Google Cloud Console.'
		};
	}

	const displayName = fromName?.trim() || null;
	const mime = buildMimeMessage(to, subject, html, fromEmail, displayName);
	const raw = toBase64Url(new TextEncoder().encode(mime));

	const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ raw })
	});

	if (!res.ok) {
		const err = await res.text();
		let message = err || `Gmail API error ${res.status}`;
		// When OAuth app is in "Testing" mode, only listed test users can use Gmail
		if (res.status === 403 || /access_denied|test|testing|not verified/i.test(message)) {
			message += ' To use Gmail, add your Gmail address as a Test user in Google Cloud Console → OAuth consent screen → Test users.';
		}
		return { ok: false, error: message };
	}

	const data = (await res.json()) as { id?: string };
	return { ok: true, id: data?.id };
}
