import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { getSupabaseDbSchemaServer } from '$lib/server/dbSchemaEnv';
import { resetProspectsAndJobsForDevSchema } from '$lib/server/devResetData';
import { getGbpDefaultLocation, setGbpDefaultLocation } from '$lib/server/userSettings';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const gbpDefaultLocation = await getGbpDefaultLocation(user.id);
	return {
		gbpDefaultLocation: gbpDefaultLocation ?? '',
		supabaseDbSchema: getSupabaseDbSchemaServer()
	};
};

export const actions: Actions = {
	saveGbpDefaultLocation: async (event) => {
		const { request } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const location = (formData.get('location') ?? '').toString().trim();
		const result = await setGbpDefaultLocation(user.id, location);
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	},

	resetDevProspectsAndJobs: async (event) => {
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const result = await resetProspectsAndJobsForDevSchema();
		if (!result.ok) {
			return fail(result.httpStatus, { message: result.message });
		}
		return { success: true };
	}
};
