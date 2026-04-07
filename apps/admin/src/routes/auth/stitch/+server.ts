import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStitchAuthUrl } from '$lib/server/stitchAuth';

const ALLOWED_REDIRECTS = new Set(['/dashboard/integrations', '/dashboard', '/dashboard/settings/email']);

export const GET: RequestHandler = async ({ url }) => {
	const redirectParam = url.searchParams.get('redirect');
	const state = redirectParam && ALLOWED_REDIRECTS.has(redirectParam) ? redirectParam : '/dashboard/integrations';
	const redirectUri = `${url.origin}/auth/stitch/callback`;
	const authUrl = getStitchAuthUrl(redirectUri, state);
	throw redirect(302, authUrl);
};
