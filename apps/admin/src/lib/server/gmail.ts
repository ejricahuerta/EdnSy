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

export type GmailDraftResult =
	| { ok: true; draftId: string; messageId?: string }
	| { ok: false; error: string };

function gmailApiErrorHint(status: number, message: string): string {
	if (status === 404 || /not found|notFound/i.test(message)) {
		return 'Draft no longer exists in Gmail (deleted or already sent). Create a new draft.';
	}
	if (status === 403 || /insufficient|permission|scope|access_denied|test|testing|not verified/i.test(message)) {
		return `${message} Reconnect Gmail in Dashboard → Integrations to grant draft access (includes gmail.compose). If the OAuth app is in Testing mode, add your Gmail as a Test user in Google Cloud Console.`;
	}
	return message;
}

type PreparedMime = { accessToken: string; raw: string };

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

async function prepareGmailMimeRaw(
	userId: string,
	to: string,
	subject: string,
	html: string,
	fromName?: string | null
): Promise<{ ok: false; error: string } | { ok: true } & PreparedMime> {
	const accessToken = await getValidAccessToken(userId);
	if (!accessToken) {
		return { ok: false, error: 'Gmail not connected or token expired. Reconnect in Integrations.' };
	}

	let tokens = await getGmailTokens(userId);
	let fromEmail = tokens?.email;
	if (!fromEmail?.trim()) {
		try {
			const profile = await getGmailProfile(accessToken);
			fromEmail = profile.emailAddress?.trim() || undefined;
			if (fromEmail && tokens) {
				await setGmailTokens(userId, { ...tokens, email: fromEmail });
			}
		} catch {
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
	return { ok: true, accessToken, raw };
}

/**
 * Web URL to open the drafts folder; Gmail may focus a draft when compose id matches API draft id.
 */
export function gmailDraftWebComposeUrl(draftId: string): string {
	return `https://mail.google.com/mail/u/0/#drafts?compose=${encodeURIComponent(draftId)}`;
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
	const prepared = await prepareGmailMimeRaw(userId, to, subject, html, fromName);
	if (!prepared.ok) return prepared;

	const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${prepared.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ raw: prepared.raw })
	});

	if (!res.ok) {
		const err = await res.text();
		let message = err || `Gmail API error ${res.status}`;
		if (res.status === 403 || /access_denied|test|testing|not verified/i.test(message)) {
			message += ' To use Gmail, add your Gmail address as a Test user in Google Cloud Console → OAuth consent screen → Test users.';
		}
		return { ok: false, error: message };
	}

	const data = (await res.json()) as { id?: string };
	return { ok: true, id: data?.id };
}

/**
 * Create a Gmail draft (users/me/drafts). Requires gmail.compose scope.
 */
export async function createDraftViaGmail(
	userId: string,
	to: string,
	subject: string,
	html: string,
	fromName?: string | null
): Promise<GmailDraftResult> {
	const prepared = await prepareGmailMimeRaw(userId, to, subject, html, fromName);
	if (!prepared.ok) return prepared;

	const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${prepared.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ message: { raw: prepared.raw } })
	});

	if (!res.ok) {
		const err = await res.text();
		const message = err || `Gmail drafts API error ${res.status}`;
		return { ok: false, error: gmailApiErrorHint(res.status, message) };
	}

	const data = (await res.json()) as { id?: string; message?: { id?: string } };
	const draftId = data?.id;
	if (!draftId) return { ok: false, error: 'Gmail draft created but no draft id returned.' };
	return { ok: true, draftId, messageId: data.message?.id };
}

/**
 * Send an existing draft (users/me/drafts/send).
 */
export async function sendDraftViaGmail(userId: string, draftId: string): Promise<SendEmailResult> {
	const accessToken = await getValidAccessToken(userId);
	if (!accessToken) {
		return { ok: false, error: 'Gmail not connected or token expired. Reconnect in Integrations.' };
	}

	const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts/send', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: draftId })
	});

	if (!res.ok) {
		const err = await res.text();
		const message = err || `Gmail drafts/send error ${res.status}`;
		return { ok: false, error: gmailApiErrorHint(res.status, message) };
	}

	const data = (await res.json()) as { id?: string };
	return { ok: true, id: data?.id };
}

/**
 * Delete a draft. Ignores 404 (already deleted in Gmail UI).
 */
export async function deleteDraftViaGmail(
	userId: string,
	draftId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const accessToken = await getValidAccessToken(userId);
	if (!accessToken) {
		return { ok: false, error: 'Gmail not connected or token expired. Reconnect in Integrations.' };
	}

	const res = await fetch(
		`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${encodeURIComponent(draftId)}`,
		{
			method: 'DELETE',
			headers: { Authorization: `Bearer ${accessToken}` }
		}
	);

	if (res.status === 404) return { ok: true };
	if (!res.ok) {
		const err = await res.text();
		return { ok: false, error: gmailApiErrorHint(res.status, err || `Gmail draft delete ${res.status}`) };
	}
	return { ok: true };
}
