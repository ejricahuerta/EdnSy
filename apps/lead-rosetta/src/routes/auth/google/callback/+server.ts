import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	exchangeCodeForTokens,
	getGoogleUserInfo
} from '$lib/server/googleAuth';
import {
	createSessionCookie,
	getSessionCookieName,
	getSessionCookieOptions
} from '$lib/server/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const redirectTo = url.searchParams.get('redirect') ?? '/dashboard';
	if (!code) {
		throw redirect(303, '/auth/login');
	}
	const redirectUri = `${url.origin}/auth/google/callback`;
	const tokens = await exchangeCodeForTokens(code, redirectUri);
	const user = await getGoogleUserInfo(tokens.access_token);
	const value = await createSessionCookie({
		id: user.id,
		email: user.email,
		name: user.name ?? '',
		picture: user.picture ?? ''
	});
	cookies.set(getSessionCookieName(), value, getSessionCookieOptions());
	throw redirect(303, redirectTo);
};
