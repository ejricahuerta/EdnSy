import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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
import { getNotionConnection, saveNotionConnection, listProspects as listNotionProspects } from '$lib/server/notion';
import { upsertProspect } from '$lib/server/prospects';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) throw redirect(303, '/auth/login');
	const plan = await getPlanForUser(user);
	const connections = await listCrmConnections(user.id);
	const notionConnection = await getNotionConnection(user.id);
	return { plan, connections, notionConnection, canConnect: canConnectCrm(plan) };
};

export const actions: Actions = {
	connectHubSpot: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Pro and Agency plans.' });
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
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Pro and Agency plans.' });
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
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Pro and Agency plans.' });
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
				industry: c.industry,
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
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Pro and Agency plans.' });
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
				industry: c.industry,
				status: 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${contacts.length} contacts to your dashboard.` };
	},
	connectNotion: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const apiKey = (formData.get('apiKey') as string)?.trim();
		const databaseId = (formData.get('databaseId') as string)?.trim();
		if (!apiKey || !databaseId) return fail(400, { message: 'API key and Database ID required' });
		const result = await saveNotionConnection(user.id, apiKey, databaseId);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, message: 'Notion connected.' };
	},
	connectPipedrive: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM connection is available on Pro and Agency plans.' });
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
		if (!canConnectCrm(plan)) return fail(403, { message: 'CRM sync is available on Pro and Agency plans.' });
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
				industry: c.industry,
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
		const notionConn = await getNotionConnection(user.id);
		if (!notionConn.connected) return fail(400, { message: 'Notion not connected' });
		const result = await listNotionProspects(user.id);
		if (result.error) return fail(502, { message: result.message ?? 'Failed to load from Notion' });
		let synced = 0;
		for (const p of result.prospects) {
			const { id, error: err } = await upsertProspect(user.id, 'notion', p.id, {
				companyName: p.companyName,
				email: p.email,
				website: p.website || undefined,
				phone: p.phone || undefined,
				industry: p.industry,
				status: p.status || 'Prospect'
			});
			if (id && !err) synced++;
		}
		return { success: true, message: `Synced ${synced} of ${result.prospects.length} rows from Notion to your dashboard.` };
	}
};
