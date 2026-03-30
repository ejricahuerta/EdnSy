import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGmailAuthUrl } from '$lib/server/gmailAuth';

const ALLOWED_REDIRECTS = new Set(['/dashboard/integrations', '/dashboard', '/dashboard/settings/email']);

export const GET: RequestHandler = async ({ url }) => {
	const redirectParam = url.searchParams.get('redirect');
	const state = redirectParam && ALLOWED_REDIRECTS.has(redirectParam) ? redirectParam : '/dashboard/integrations';
	const redirectUri = `${url.origin}/auth/gmail/callback`;
	const authUrl = getGmailAuthUrl(redirectUri, state);
	throw redirect(302, authUrl);
};
