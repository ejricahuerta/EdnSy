import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import {
	getEmailSenderName,
	setEmailSenderName,
	getEmailSignatureOverride,
	setEmailSignatureOverride
} from '$lib/server/userSettings';
import { isResendConfigured, getResendFromDisplay } from '$lib/server/send';
import { getTemplates } from '$lib/server/templates';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const [emailSenderName, emailSignatureOverride, resendDisplay, templates] = await Promise.all([
		getEmailSenderName(user.id),
		getEmailSignatureOverride(user.id),
		Promise.resolve(getResendFromDisplay()),
		getTemplates(user.id)
	]);
	const { EMAIL_PLACEHOLDERS } = await import('$lib/server/templates');
	return {
		emailSenderName: emailSenderName ?? '',
		emailSignatureOverride: emailSignatureOverride ?? '',
		resendConfigured: isResendConfigured(),
		resendFrom: resendDisplay.configured ? resendDisplay.from : null,
		hasCustomEmailTemplate: !!templates.emailHtml,
		emailPlaceholders: EMAIL_PLACEHOLDERS.join(', ')
	};
};

function getStr(formData: FormData, key: string): string {
	return (formData.get(key) ?? '').toString().trim();
}

export const actions: Actions = {
	saveEmailSenderName: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const name = getStr(formData, 'senderName');
		const result = await setEmailSenderName(user.id, name);
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	},
	saveEmailSignature: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const signature = getStr(formData, 'emailSignature');
		const result = await setEmailSignatureOverride(user.id, signature);
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	}
};
