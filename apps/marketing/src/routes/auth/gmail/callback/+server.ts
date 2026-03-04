import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeGmailCodeForTokens, getGmailProfile } from '$lib/server/gmailAuth';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { setGmailTokens } from '$lib/server/gmail';

const DEFAULT_REDIRECT = '/dashboard/integrations';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	if (!code) {
		throw redirect(303, state || DEFAULT_REDIRECT);
	}

	const redirectUri = `${url.origin}/auth/gmail/callback`;
	const tokens = await exchangeGmailCodeForTokens(code, redirectUri);

	let email: string | undefined;
	try {
		const profile = await getGmailProfile(tokens.access_token);
		email = profile.emailAddress || undefined;
	} catch {
		// continue without email; can be fetched later
	}

	const redirectTo = state || DEFAULT_REDIRECT;
	const expires_at =
		tokens.expires_in != null ? Date.now() + tokens.expires_in * 1000 : undefined;

	await setGmailTokens(user.id, {
		refresh_token: tokens.refresh_token || '',
		access_token: tokens.access_token,
		expires_at,
		email
	});

	throw redirect(303, redirectTo + '?gmail=connected');
};
