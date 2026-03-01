import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getTemplates, setTemplates, DEMO_PLACEHOLDERS, EMAIL_PLACEHOLDERS } from '$lib/server/templates';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) throw redirect(303, '/auth/login');
	const templates = await getTemplates(user.id);
	return {
		templates: {
			demoHtml: templates.demoHtml ?? '',
			emailHtml: templates.emailHtml ?? ''
		},
		placeholders: {
			demo: DEMO_PLACEHOLDERS,
			email: EMAIL_PLACEHOLDERS
		}
	};
};

export const actions: Actions = {
	saveDemo: async ({ cookies, request }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Not signed in' });
		const form = await request.formData();
		const demoHtml = (form.get('demoHtml') as string) ?? '';
		const result = await setTemplates(user.id, { demoHtml: demoHtml.trim() || null });
		if (!result.ok) return fail(500, { demoError: result.error });
		return { demoSaved: true };
	},
	saveEmail: async ({ cookies, request }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Not signed in' });
		const form = await request.formData();
		const emailHtml = (form.get('emailHtml') as string) ?? '';
		const result = await setTemplates(user.id, { emailHtml: emailHtml.trim() || null });
		if (!result.ok) return fail(500, { emailError: result.error });
		return { emailSaved: true };
	}
};
