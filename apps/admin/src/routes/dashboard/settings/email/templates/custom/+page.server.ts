import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getTemplates, setTemplates, EMAIL_PLACEHOLDERS } from '$lib/server/templates';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const templates = await getTemplates(user.id);
	return {
		emailHtml: templates.emailHtml ?? '',
		placeholders: [...EMAIL_PLACEHOLDERS]
	};
};

function getStr(formData: FormData, key: string): string {
	return (formData.get(key) ?? '').toString();
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const emailHtml = getStr(formData, 'emailHtml').trim() || null;
		const result = await setTemplates(user.id, { emailHtml });
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	}
};
