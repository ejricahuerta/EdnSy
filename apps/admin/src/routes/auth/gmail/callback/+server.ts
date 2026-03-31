import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeGmailCodeForTokens, getGmailProfile } from '$lib/server/gmailAuth';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { setGmailTokens } from '$lib/server/gmail';

const DEFAULT_REDIRECT = '/dashboard/integrations';

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}

	if (!code) {
		throw redirect(303, state || DEFAULT_REDIRECT);
	}

	const redirectUri = `${url.origin}/auth/gmail/callback`;
	const tokens = await exchangeGmailCodeForTokens(code, redirectUri);

	const refreshToken = tokens.refresh_token?.trim();
	if (!refreshToken) {
		throw redirect(303, (state || DEFAULT_REDIRECT) + '?gmail=error&message=no_refresh_token');
	}

	let email: string | undefined;
	try {
		const profile = await getGmailProfile(tokens.access_token);
		email = profile.emailAddress || undefined;
	} catch {
		// continue without email; will be fetched on first send
	}

	const redirectTo = state || DEFAULT_REDIRECT;
	const expires_at =
		tokens.expires_in != null ? Date.now() + tokens.expires_in * 1000 : undefined;

	await setGmailTokens(user.id, {
		refresh_token: refreshToken,
		access_token: tokens.access_token,
		expires_at,
		email
	});

	throw redirect(303, redirectTo + '?gmail=connected');
};
