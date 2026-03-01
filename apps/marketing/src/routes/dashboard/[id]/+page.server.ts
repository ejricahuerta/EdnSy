import { redirect, error, fail } from '@sveltejs/kit';
import { getProspectById, updateProspectDemoLink } from '$lib/server/prospects';
import { getSupabaseAdmin, updateDemoTrackingStatus, upsertDemoTrackingForProspect } from '$lib/server/supabase';
import { generateAuditForProspect } from '$lib/server/generateAudit';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { industryDisplayToSlug } from '$lib/industries';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const prospect = await getProspectById(params.id);
	if (!prospect) {
		throw error(404, 'Client not found');
	}
	return { prospect, user };
};

export const actions: Actions = {
	generateDemo: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectById(prospectId);
		if (!prospect) {
			return fail(404, { message: 'Prospect not found' });
		}
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		const slug = industryDisplayToSlug(prospect.industry);
		const origin = url.origin;
		const demoUrl = `${origin}/${slug}/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (supabase && prospect.provider && prospect.provider_row_id) {
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				prospect.provider,
				prospect.provider_row_id,
				demoUrl,
				'draft'
			);
		}
		const audit = await generateAuditForProspect(prospect);
		if (audit && supabase) {
			await updateDemoTrackingStatus(user.id, prospectId, {
				status: 'draft',
				scrapedData: audit
			});
		}
		return { success: true, prospectId, demoLink: demoUrl };
	}
};
