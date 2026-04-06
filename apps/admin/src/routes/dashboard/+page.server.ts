import { fail, redirect } from '@sveltejs/kit';
import {
	listProspects,
	getProspectById,
	updateProspectDemoLink,
	updateProspectFromGbp,
	updateProspectStatus
} from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	getDemoCountThisMonth,
	getGbpCountThisMonth,
	getInsightsCountThisMonth,
	getPlacesCountThisMonth,
	getPlacesMonthlyLimit,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	enqueueDemoJob,
	getDemoTrackingForProspect
} from '$lib/server/supabase';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { env } from '$env/dynamic/private';
import { getCrmIndustryFilter, getGbpDefaultLocation } from '$lib/server/userSettings';
import { isValidDemoTrackingStatus } from '$lib/demo';
import { getPlanForUser, getUpcomingInvoiceForUser } from '$lib/server/stripe';
import { getDemoCreationLimit } from '$lib/plans';
import { getOriginForOutgoingLinks, getDemoPublicOrigin } from '$lib/server/send';
import { PROSPECT_STATUS } from '$lib/prospectStatus';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const plan = await getPlanForUser(user);
	const demoLimit = getDemoCreationLimit(plan);
	const [demoCountThisMonth, gbpCountThisMonth, insightsCountThisMonth, placesCountThisMonth, prospectsResult] =
		await Promise.all([
			getDemoCountThisMonth(user.id),
			getGbpCountThisMonth(user.id),
			getInsightsCountThisMonth(user.id),
			getPlacesCountThisMonth(),
			listProspects(user.id)
		]);
	const placesMonthlyLimit = getPlacesMonthlyLimit();
	const prospects = prospectsResult.prospects ?? [];
	const statusOrder: Array<{ key: string; label: string }> = [
		{ key: PROSPECT_STATUS.NEW, label: 'New' },
		{ key: PROSPECT_STATUS.GBP_QUEUED, label: 'GBP Queued' },
		{ key: PROSPECT_STATUS.DEMO_PENDING, label: 'Pending Demo' },
		{ key: PROSPECT_STATUS.DEMO_QUEUED, label: 'Demo Queued' },
		{ key: PROSPECT_STATUS.REVIEW, label: 'Review' },
		{ key: PROSPECT_STATUS.READY_TO_SEND, label: 'Ready to Send' },
		{ key: PROSPECT_STATUS.EMAIL_SENT, label: 'Demo Sent' },
		{ key: PROSPECT_STATUS.DEMO_OPENED, label: 'Demo Opened' },
		{ key: PROSPECT_STATUS.FOLLOW_UP, label: 'Follow-up' }
	];
	const statusCounts = new Map<string, number>();
	for (const p of prospects) {
		const key = (p.status ?? '').trim().toLowerCase();
		if (!key) continue;
		statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
	}
	const statusChartData = statusOrder.map((s) => ({
		status: s.label,
		count: statusCounts.get(s.key.toLowerCase()) ?? 0
	}));

	const attentionStatusKeys = new Set(
		[
			PROSPECT_STATUS.NEW,
			PROSPECT_STATUS.GBP_QUEUED,
			PROSPECT_STATUS.DEMO_PENDING,
			PROSPECT_STATUS.DEMO_QUEUED,
			PROSPECT_STATUS.REVIEW
		].map((s) => s.toLowerCase())
	);
	let prospectsNeedingAttention = 0;
	for (const p of prospects) {
		const key = (p.status ?? '').trim().toLowerCase();
		if (attentionStatusKeys.has(key)) prospectsNeedingAttention++;
	}

	return {
		user,
		plan,
		demoLimit,
		demoCountThisMonth,
		gbpCountThisMonth,
		insightsCountThisMonth,
		placesCountThisMonth,
		placesMonthlyLimit,
		statusChartData,
		prospectTotal: prospects.length,
		prospectsNeedingAttention
	};
};

export const actions: Actions = {
	generateDemo: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		if (demoLimit !== null) {
			const count = await getDemoCountThisMonth(user.id);
			if (count >= demoLimit) {
				return fail(403, {
					message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
				});
			}
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
		if (prospect.flagged) {
			return fail(400, { message: 'This client is out of scope. Demos and GBP are not available.' });
		}
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		const scrapedResult = await getScrapedDataForDemo(prospect);
		if (!scrapedResult.ok) {
			return fail(503, { message: formatScrapedDataErrorMessage(scrapedResult.errors) });
		}
		const scrapedData = scrapedResult.data;
		const demoUrl = `${getDemoPublicOrigin(url.origin)}/demo/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, PROSPECT_STATUS.REVIEW);
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const crmSource = prospect.provider ?? 'manual';
			const crmProspectId = prospect.provider_row_id ?? prospectId;
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				crmSource,
				crmProspectId,
				demoUrl,
				'draft'
			);
		}
		if (supabase) {
			await updateDemoTrackingStatus(user.id, prospectId, {
				status: 'draft',
				scrapedData
			});
		}
		if ('gbpRaw' in scrapedData && scrapedData.gbpRaw) {
			await updateProspectFromGbp(prospectId, scrapedData.gbpRaw);
		}
		return { success: true, prospectId, demoLink: demoUrl };
	},
	updateDemoStatus: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		const status = formData.get('status');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		if (!status || typeof status !== 'string' || !isValidDemoTrackingStatus(status)) {
			return fail(400, { message: 'Invalid status' });
		}
		const result = await updateDemoTrackingStatus(user.id, prospectId, { status });
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update demo status' });
		}
		return { success: true, prospectId, status };
	},
	bulkApproveDemos: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client' });
		}
		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return fail(503, { message: 'Demo tracking not configured' });
		}
		for (const id of prospectIds) {
			if (typeof id !== 'string') continue;
			await updateDemoTrackingStatus(user.id, id, {
				status: 'approved'
			});
		}
		return { success: true, total: prospectIds.length };
	},
	bulkGenerateDemos: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		let countThisMonth = await getDemoCountThisMonth(user.id);
		if (demoLimit !== null && countThisMonth >= demoLimit) {
			return fail(403, {
				message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
			});
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client' });
		}
		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return fail(503, { message: 'Demo tracking not configured. Supabase is required for bulk demo creation.' });
		}
		const origin = getOriginForOutgoingLinks(url.origin);
		const demoPublicOrigin = getDemoPublicOrigin(url.origin);
		const defaultLocation = await getGbpDefaultLocation(user.id);
		let enqueued = 0;
		const errors: string[] = [];
		for (const prospectId of prospectIds) {
			if (demoLimit !== null && countThisMonth >= demoLimit) break;
			const prospect = await getProspectById(prospectId);
			if (!prospect) continue;
			if (prospect.flagged) continue;
			if (prospect.demoLink) continue;
			const scrapedResult = await getScrapedDataForDemo(prospect, {
				defaultLocation: defaultLocation ?? undefined
			});
			if (!scrapedResult.ok) {
				errors.push(`${prospect.companyName || prospectId}: ${formatScrapedDataErrorMessage(scrapedResult.errors)}`);
				continue;
			}
			const scrapedData = scrapedResult.data as Record<string, unknown>;
			const demoUrl = `${demoPublicOrigin}/demo/${prospectId}`;
			const crmSource = prospect.provider ?? 'manual';
			const crmProspectId = prospect.provider_row_id ?? prospectId;
			await upsertDemoTrackingForProspect(user.id, prospectId, crmSource, crmProspectId, demoUrl, 'draft');
			await updateDemoTrackingStatus(user.id, prospectId, { status: 'draft', scrapedData });
			if (scrapedData?.gbpRaw && typeof scrapedData.gbpRaw === 'object') {
				await updateProspectFromGbp(prospectId, scrapedData.gbpRaw as { phone?: string; website?: string; address?: string; industry?: string });
			}
			const enqueueResult = await enqueueDemoJob(user.id, prospectId);
			if (!enqueueResult) {
				errors.push(`${prospect.companyName || prospectId}: Could not enqueue job`);
				continue;
			}
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
			enqueued++;
			countThisMonth++;
		}
		if (enqueued === 0 && errors.length > 0) {
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		// Kick cron so jobs start processing (uses industry mapping in processDemoJob for correct endpoint e.g. dental → /api/dental-async)
		const cronSecret = (env.CRON_SECRET ?? '').trim();
		if (origin && cronSecret && enqueued > 0) {
			fetch(`${origin.replace(/\/$/, '')}/api/cron/jobs/demo`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${cronSecret}` }
			}).catch(() => {});
		}
		return {
			success: true,
			created: enqueued,
			enqueued,
			queued: enqueued,
			total: prospectIds.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	}
};
