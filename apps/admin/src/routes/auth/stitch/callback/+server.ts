import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	exchangeStitchCodeForTokens,
	getStitchGoogleUserEmail
} from '$lib/server/stitchAuth';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { setStitchTokens } from '$lib/server/stitchTokens';

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

	const redirectUri = `${url.origin}/auth/stitch/callback`;
	const tokens = await exchangeStitchCodeForTokens(code, redirectUri);

	const refreshToken = tokens.refresh_token?.trim();
	if (!refreshToken) {
		throw redirect(303, (state || DEFAULT_REDIRECT) + '?stitch=error&message=no_refresh_token');
	}

	let email: string | undefined;
	try {
		email = await getStitchGoogleUserEmail(tokens.access_token);
	} catch {
		// continue without email
	}

	const redirectTo = state || DEFAULT_REDIRECT;
	const expires_at =
		tokens.expires_in != null ? Date.now() + tokens.expires_in * 1000 : undefined;

	await setStitchTokens(user.id, {
		refresh_token: refreshToken,
		access_token: tokens.access_token,
		expires_at,
		email
	});

	throw redirect(303, redirectTo + '?stitch=connected');
};
