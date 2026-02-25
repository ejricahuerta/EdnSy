import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGoogleAuthUrl } from '$lib/server/googleAuth';

export const GET: RequestHandler = async ({ url }) => {
	const redirectUri = `${url.origin}/auth/google/callback`;
	const authUrl = getGoogleAuthUrl(redirectUri);
	throw redirect(302, authUrl);
};
