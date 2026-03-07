import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionCookieName } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies }) => {
	cookies.delete(getSessionCookieName(), { path: '/' });
	throw redirect(303, '/');
};
