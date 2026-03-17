import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { markdownToHtml } from '$lib/markdown';
import { INTEGRATION_HELP_DOCS, INTEGRATION_IDS } from '$lib/server/integrationHelpDocs';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getPlanForUser } from '$lib/server/stripe';
import { canConnectCrm } from '$lib/plans';
import {
	listCrmConnections,
	saveCrmConnection,
	deleteCrmConnection,
	getCrmConnection,
	listHubSpotContacts,
	listGoHighLevelContacts,
	listPipedriveContacts
} from '$lib/server/crm';
import { getGmailTokens, deleteGmailTokens } from '$lib/server/gmail';
import {
	listProspects as listNotionProspects,
	listNotionDatabases,
	getNotionDatabaseSchema,
	getNotionDatabaseTitle,
	NOTION_FIELD_KEYS
} from '$lib/server/notion';
import { upsertProspect } from '$lib/server/prospects';
import {
	getGbpDentalDailyStats,
	runPullGbpDental,
	isPlacesConfiguredForGbp
} from '$lib/server/pullGbpDental';

function loadHelpDocs(): Record<string, string> {
	const out: Record<string, string> = {};
	for (const id of INTEGRATION_IDS) {
		const raw = INTEGRATION_HELP_DOCS[id] ?? '';
		out[id] = raw ? markdownToHtml(raw) : '';
	}
	return out;
}

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) throw redirect(303, '/auth/login');
	const plan = await getPlanForUser(user);
	const connections = await listCrmConnections(user.id);
	const helpDocs = loadHelpDocs();
	const gmailTokens = await getGmailTokens(user.id);
	const gmailConnected = !!(gmailTokens?.refresh_token);
	const gmailEmail = gmailTokens?.email ?? null;
	const notionFieldKeys = NOTION_FIELD_KEYS;
	const { todayCount: gbpDentalTodayCount, dailyCap: gbpDentalDailyCap } =
		await getGbpDentalDailyStats(user.id);
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
		plan,
		connections,
		canConnect: canConnectCrm(plan),
		helpDocs,
		gmailConnected,
		gmailEmail,
		notionFieldKeys,
		notionDatabaseId,
		notionDatabaseTitle,
		gbpDentalTodayCount,
		gbpDentalDailyCap,
		placesApiConfigured
	};
};

export const actions: Actions = {
	connectHubSpot: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Growth and Agency plans.' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		if (!apiKey) return fail(400, { message: 'API key required' });
		const result = await saveCrmConnection(user.id, 'hubspot', apiKey);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'HubSpot connected.' };
	},
	connectGoHighLevel: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Growth and Agency plans.' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		if (!apiKey) return fail(400, { message: 'API key required' });
		const result = await saveCrmConnection(user.id, 'gohighlevel', apiKey);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'GoHighLevel connected.' };
	},
	disconnectHubSpot: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteCrmConnection(user.id, 'hubspot');
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'HubSpot disconnected.' };
	},
	disconnectGoHighLevel: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteCrmConnection(user.id, 'gohighlevel');
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'GoHighLevel disconnected.' };
	},
	syncHubSpot: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Growth and Agency plans.' });
		const conn = await getCrmConnection(user.id, 'hubspot');
		if (!conn) return fail(400, { message: 'HubSpot not connected' });
		const { contacts, error } = await listHubSpotContacts(conn.access_token);
		if (error) return fail(502, { message: error });
		let synced = 0;
		for (const c of contacts) {
			const { id, error: err } = await upsertProspect(user.id, 'hubspot', c.id, {
				companyName: c.companyName,
				email: c.email,
				website: c.website || undefined,
				phone: c.phone || undefined,
				status: 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${contacts.length} contacts to your dashboard.` };
	},
	syncGoHighLevel: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Growth and Agency plans.' });
		const conn = await getCrmConnection(user.id, 'gohighlevel');
		if (!conn) return fail(400, { message: 'GoHighLevel not connected' });
		const { contacts, error } = await listGoHighLevelContacts(conn.access_token);
		if (error) return fail(502, { message: error });
		let synced = 0;
		for (const c of contacts) {
			const { id, error: err } = await upsertProspect(user.id, 'gohighlevel', c.id, {
				companyName: c.companyName,
				email: c.email,
				website: c.website || undefined,
				phone: c.phone || undefined,
				status: 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${contacts.length} contacts to your dashboard.` };
	},
	getNotionDatabases: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		if (!apiKey) return fail(400, { message: 'API key required to load databases' });
		const result = await listNotionDatabases(apiKey);
		if ('error' in result) return fail(400, { message: result.error, databases: [] });
		return { success: true, databases: result.databases };
	},
	connectNotion: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		const databaseId = (formData.get('databaseId') as string)?.trim();
		if (!apiKey || !databaseId) return fail(400, { message: 'API key and Database ID required' });
		const result = await saveCrmConnection(user.id, 'notion', apiKey, { databaseId });
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'Notion connected.' };
	},
	disconnectNotion: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteCrmConnection(user.id, 'notion');
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'Notion disconnected.' };
	},
	getNotionSchema: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
	saveNotionFieldMapping: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
	connectPipedrive: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Growth and Agency plans.' });
		const formData = await request.formData();
		const domain = (formData.get('domain') as string)?.trim();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		if (!domain || !apiKey) return fail(400, { message: 'Company domain and API token required' });
		const stored = `${domain}:${apiKey}`;
		const result = await saveCrmConnection(user.id, 'pipedrive', stored);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'Pipedrive connected.' };
	},
	disconnectPipedrive: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteCrmConnection(user.id, 'pipedrive');
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'Pipedrive disconnected.' };
	},
	syncPipedrive: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Growth and Agency plans.' });
		const conn = await getCrmConnection(user.id, 'pipedrive');
		if (!conn) return fail(400, { message: 'Pipedrive not connected' });
		const { contacts, error } = await listPipedriveContacts(conn.access_token);
		if (error) return fail(502, { message: error });
		let synced = 0;
		for (const c of contacts) {
			const { id, error: err } = await upsertProspect(user.id, 'pipedrive', c.id, {
				companyName: c.companyName,
				email: c.email,
				website: c.website || undefined,
				phone: c.phone || undefined,
				status: 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${contacts.length} contacts to your dashboard.` };
	},
	syncNotion: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const conn = await getCrmConnection(user.id, 'notion');
		if (!conn?.databaseId) return fail(400, { message: 'Notion not connected' });
		const result = await listNotionProspects(user.id);
		if (result.error) return fail(502, { message: result.message ?? 'Failed to load from Notion' });
		let synced = 0;
		for (const p of result.prospects) {
			const { id, error: err } = await upsertProspect(user.id, 'notion', p.id, {
				companyName: p.companyName,
				email: p.email,
				website: p.website || undefined,
				phone: p.phone || undefined,
				status: p.status || 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${result.prospects.length} rows from Notion to your dashboard.` };
	},
	/** Save current mapping from form then run sync (single action for the Map headers popup). */
	syncNotionWithMapping: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
		let synced = 0;
		for (const p of result.prospects) {
			const { id, error: err } = await upsertProspect(user.id, 'notion', p.id, {
				companyName: p.companyName,
				email: p.email,
				website: p.website || undefined,
				phone: p.phone || undefined,
				status: p.status || 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${result.prospects.length} rows from Notion to your dashboard.` };
	},
	disconnectGmail: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await deleteGmailTokens(user.id);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to disconnect' });
		return { success: true, message: 'Gmail disconnected.' };
	},
	pullGbpDental: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await runPullGbpDental(user.id);
		if (!result.ok) return fail(400, { message: result.message });
		return { success: true, message: result.message, added: result.added };
	}
};
