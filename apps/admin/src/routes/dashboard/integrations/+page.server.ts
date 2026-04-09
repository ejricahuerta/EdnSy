import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { markdownToHtml } from '$lib/markdown';
import { INTEGRATION_HELP_DOCS, INTEGRATION_IDS } from '$lib/server/integrationHelpDocs';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { listCrmConnections, saveCrmConnection, deleteCrmConnection, getCrmConnection } from '$lib/server/crm';
import { getGmailTokens, deleteGmailTokens } from '$lib/server/gmail';
import {
	listProspects as listNotionProspects,
	listNotionDatabases,
	getNotionDatabaseSchema,
	getNotionDatabaseTitle,
	NOTION_FIELD_KEYS
} from '$lib/server/notion';
import { insertProspectIfAbsent } from '$lib/server/prospects';
import {
	getGbpDentalDailyStats,
	runPullGbpDental,
	isPlacesConfiguredForGbp,
	getGbpDentalPullLock
} from '$lib/server/pullGbpDental';
import {
	deleteApifyApiTokenForUser,
	getApifyApiTokenForUser,
	setApifyApiTokenForUser
} from '$lib/server/apifyToken';

function loadHelpDocs(): Record<string, string> {
	const out: Record<string, string> = {};
	for (const id of INTEGRATION_IDS) {
		const raw = INTEGRATION_HELP_DOCS[id] ?? '';
		out[id] = raw ? markdownToHtml(raw) : '';
	}
	return out;
}

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) throw redirect(303, '/auth/login');
	const connections = await listCrmConnections(user.id);
	const helpDocs = loadHelpDocs();
	const gmailTokens = await getGmailTokens(user.id);
	const gmailConnected = !!(gmailTokens?.refresh_token);
	const gmailEmail = gmailTokens?.email ?? null;
	const notionFieldKeys = NOTION_FIELD_KEYS;
	const apifyApiToken = await getApifyApiTokenForUser(user.id);
	const apifyConfigured = !!apifyApiToken;
	const { todayCount: gbpDentalTodayCount, dailyCap: gbpDentalDailyCap } =
		await getGbpDentalDailyStats(user.id);
	const gbpDentalPullLock = await getGbpDentalPullLock(user.id);
	const placesApiConfigured = isPlacesConfiguredForGbp();

	let notionDatabaseId: string | null = null;
	let notionDatabaseTitle: string | null = null;
	const notionConn = await getCrmConnection(user.id, 'notion');
	if (notionConn?.databaseId) {
		notionDatabaseId = notionConn.databaseId;
		const titleResult = await getNotionDatabaseTitle(user.id);
		if (titleResult) notionDatabaseTitle = titleResult.title;
	}

	return {
		connections,
		helpDocs,
		gmailConnected,
		gmailEmail,
		notionFieldKeys,
		apifyConfigured,
		notionDatabaseId,
		notionDatabaseTitle,
		gbpDentalTodayCount,
		gbpDentalDailyCap,
		gbpDentalPullLock,
		placesApiConfigured
	};
};

export const actions: Actions = {
	getNotionDatabases: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		if (!apiKey) return fail(400, { message: 'API key required to load databases' });
		const result = await listNotionDatabases(apiKey);
		if ('error' in result) return fail(400, { message: result.error, databases: [] });
		return { success: true, databases: result.databases };
	},
	connectNotion: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		const databaseId = (formData.get('databaseId') as string)?.trim();
		if (!apiKey || !databaseId) return fail(400, { message: 'API key and Database ID required' });
		const result = await saveCrmConnection(user.id, 'notion', apiKey, { databaseId });
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'Notion connected for the shared workspace.' };
	},
	disconnectNotion: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteCrmConnection(user.id, 'notion');
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'Notion disconnected for the shared workspace.' };
	},
	getNotionSchema: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const schemaResult = await getNotionDatabaseSchema(user.id);
		if ('error' in schemaResult) return fail(502, { message: schemaResult.error, schema: null, fieldMapping: null });
		const conn = await getCrmConnection(user.id, 'notion');
		const fieldMapping = conn?.fieldMapping ?? undefined;
		return {
			success: true,
			schema: schemaResult.properties,
			fieldMapping: fieldMapping ?? {}
		};
	},
	saveNotionFieldMapping: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const conn = await getCrmConnection(user.id, 'notion');
		if (!conn?.access_token || !conn.databaseId) return fail(400, { message: 'Notion not connected' });
		const formData = await request.formData();
		const allowedIds = new Set(NOTION_FIELD_KEYS.map((f) => f.id));
		const fieldMapping: Record<string, string> = {};
		for (const { id } of NOTION_FIELD_KEYS) {
			const value = (formData.get(id) as string)?.trim();
			if (value && allowedIds.has(id)) fieldMapping[id] = value;
		}
		const result = await saveCrmConnection(user.id, 'notion', conn.access_token, {
			databaseId: conn.databaseId,
			fieldMapping
		});
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save mapping' });
		return { success: true, message: 'Field mapping saved.' };
	},
	syncNotion: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const conn = await getCrmConnection(user.id, 'notion');
		if (!conn?.databaseId) return fail(400, { message: 'Notion not connected' });
		const result = await listNotionProspects(user.id);
		if (result.error) return fail(502, { message: result.message ?? 'Failed to load from Notion' });
		let inserted = 0;
		let skipped = 0;
		for (const p of result.prospects) {
			const r = await insertProspectIfAbsent(user.id, 'notion', p.id, {
				companyName: p.companyName,
				email: p.email,
				website: p.website || undefined,
				phone: p.phone || undefined,
				industry: p.industry || undefined
			});
			if (r.error) continue;
			if (r.inserted) inserted++;
			else skipped++;
		}
		return {
			success: true,
			message: `Inserted ${inserted} new row(s); skipped ${skipped} already in your dashboard (${result.prospects.length} total from Notion).`
		};
	},
	/** Save current mapping from form then run sync (single action for the Map headers popup). */
	syncNotionWithMapping: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const conn = await getCrmConnection(user.id, 'notion');
		if (!conn?.access_token || !conn.databaseId) return fail(400, { message: 'Notion not connected' });
		const formData = await request.formData();
		const allowedIds = new Set(NOTION_FIELD_KEYS.map((f) => f.id));
		const fieldMapping: Record<string, string> = {};
		for (const { id } of NOTION_FIELD_KEYS) {
			const value = (formData.get(id) as string)?.trim();
			if (value && allowedIds.has(id)) fieldMapping[id] = value;
		}
		const saveResult = await saveCrmConnection(user.id, 'notion', conn.access_token, {
			databaseId: conn.databaseId,
			fieldMapping
		});
		if (!saveResult.ok) return fail(502, { message: saveResult.error ?? 'Failed to save mapping' });
		const result = await listNotionProspects(user.id);
		if (result.error) return fail(502, { message: result.message ?? 'Failed to load from Notion' });
		let inserted = 0;
		let skipped = 0;
		for (const p of result.prospects) {
			const r = await insertProspectIfAbsent(user.id, 'notion', p.id, {
				companyName: p.companyName,
				email: p.email,
				website: p.website || undefined,
				phone: p.phone || undefined,
				industry: p.industry || undefined
			});
			if (r.error) continue;
			if (r.inserted) inserted++;
			else skipped++;
		}
		return {
			success: true,
			message: `Inserted ${inserted} new row(s); skipped ${skipped} already in your dashboard (${result.prospects.length} total from Notion).`
		};
	},
	disconnectGmail: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteGmailTokens(user.id);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'Gmail disconnected.' };
	},
	connectApify: async (event) => {
		const { request } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string | null)?.trim() ?? '';
		if (!apiKey) return fail(400, { message: 'API key is required' });
		const result = await setApifyApiTokenForUser(user.id, apiKey);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save API key' });
		return { success: true, message: 'Apify API key saved.' };
	},
	disconnectApify: async (event) => {
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteApifyApiTokenForUser(user.id);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to remove API key' });
		return { success: true, message: 'Apify API key removed.' };
	},
	pullGbpDental: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await runPullGbpDental(user.id);
		if (!result.ok) return fail(400, { message: result.message });
		return { success: true, message: result.message, added: result.added, leads: result.leads };
	}
};
