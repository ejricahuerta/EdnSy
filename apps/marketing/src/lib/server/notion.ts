import { getSupabaseAdmin } from '$lib/server/supabase';

/** Load Notion config from DB. userId = current user for dashboard; '' for app default (e.g. demo pages). */
async function getNotionConfig(userId?: string): Promise<{ apiKey: string; databaseId: string } | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const key = userId ?? '';
	const { data, error } = await supabase
		.from('notion_connections')
		.select('api_key, database_id')
		.eq('user_id', key)
		.maybeSingle();
	if (error || !data?.api_key || !data?.database_id) return null;
	return { apiKey: data.api_key, databaseId: data.database_id };
}

/** Get current user's Notion connection (for Integrations UI). */
export async function getNotionConnection(userId: string): Promise<{ connected: boolean }> {
	const config = await getNotionConfig(userId);
	return { connected: !!config };
}

/** Save Notion API key + database ID for a user. Use userId = '' to set app default. */
export async function saveNotionConnection(
	userId: string,
	apiKey: string,
	databaseId: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase.from('notion_connections').upsert(
		{ user_id: userId, api_key: apiKey.trim(), database_id: databaseId.trim(), updated_at: new Date().toISOString() },
		{ onConflict: 'user_id' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Notion database schema (verified):
 * - "Name" (title) → companyName
 * - "Email" (email) → email
 * - "Website" (url) → website
 * - "Phone" (phone_number) → phone
 * - "Industry" (select) → industry
 * - "Demo Link" (rich_text) → demoLink
 * - "Demo Status" (status) → updated when generating demo; "Client Status" (status) → status for display
 * Optional: "Address", "City", "Postal Code" (rich_text). Share the DB with your integration.
 */

export type Prospect = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone?: string;
	address?: string;
	city?: string;
	industry: string;
	status: string;
	demoLink?: string;
};

/**
 * Fetch a single prospect (Notion page) by id.
 * userId = current user (dashboard); omit to use app default (demo pages).
 */
export async function getProspectById(id: string, userId?: string): Promise<Prospect | null> {
	const config = await getNotionConfig(userId);
	if (!config) return null;

	try {
		const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
			headers: {
				Authorization: `Bearer ${config.apiKey}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			}
		});
		if (!res.ok) return null;
		const page = (await res.json()) as { id: string; properties: Record<string, unknown> };
		return mapNotionPageToProspect(page);
	} catch {
		return null;
	}
}

export type ListProspectsResult =
	| { prospects: Prospect[]; error?: undefined }
	| { prospects: []; error: 'not_configured' | 'api_error'; message?: string };

/**
 * List prospects from the Notion database (for CRM table).
 * userId = current user; pass '' to use app default.
 */
export async function listProspects(userId: string): Promise<ListProspectsResult> {
	const config = await getNotionConfig(userId);
	if (!config) {
		return { prospects: [], error: 'not_configured', message: 'Connect Notion in Dashboard → Integrations (API key + Database ID).' };
	}
	const { apiKey, databaseId } = config;

	try {
		const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ page_size: 100 })
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({})) as { message?: string; code?: string };
			const msg = body.message ?? body.code ?? res.statusText;
			return { prospects: [], error: 'api_error', message: `Notion API error (${res.status}): ${msg}` };
		}
		const data = (await res.json()) as { results: Array<{ id: string; properties: Record<string, unknown> }> };
		const prospects = data.results.map((page) => mapNotionPageToProspect(page));
		return { prospects };
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Request failed';
		return { prospects: [], error: 'api_error', message };
	}
}

/**
 * Create a new prospect page in the Notion database (for CRM sync).
 * Properties: Name (title), Email, Website, Phone, Industry, Client Status or Status (select).
 */
export async function createProspectPage(prospect: {
	companyName: string;
	email: string;
	website?: string;
	phone?: string;
	industry?: string;
	status?: string;
}, userId: string): Promise<{ id: string; error?: string }> {
	const config = await getNotionConfig(userId);
	if (!config) return { id: '', error: 'Notion not configured' };
	const { apiKey, databaseId } = config;

	const statusName = (prospect.status || 'Prospect').slice(0, 100);
	const properties: Record<string, unknown> = {
		Name: { title: [{ type: 'text', text: { content: (prospect.companyName || 'Unknown').slice(0, 2000) } }] },
		Email: { email: prospect.email || null },
		Website: { url: prospect.website || null },
		Phone: { phone_number: prospect.phone || null },
		Industry: { select: { name: (prospect.industry || 'Solo professionals').slice(0, 100) } },
		'Client Status': { status: { name: statusName } }
	};

	try {
		const res = await fetch('https://api.notion.com/v1/pages', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				parent: { database_id: databaseId },
				properties
			})
		});
		if (!res.ok) {
			const err = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
			return { id: '', error: err.message ?? err.code ?? res.statusText };
		}
		const page = (await res.json()) as { id: string };
		return { id: page.id };
	} catch (e) {
		return { id: '', error: e instanceof Error ? e.message : 'Create failed' };
	}
}

/**
 * Update a prospect's Demo link and Status in Notion.
 * Expects "Demo link" as rich_text or URL type, and "Status" as select.
 * Tries rich_text first; if Notion rejects (e.g. property is URL type), tries url.
 */
export async function updateProspectDemoLink(
	pageId: string,
	demoUrl: string,
	statusValue: string = 'Demo Created',
	userId?: string
): Promise<{ ok: boolean; error?: string }> {
	const config = await getNotionConfig(userId ?? '');
	if (!config?.apiKey) return { ok: false, error: 'Notion not configured' };
	const { apiKey } = config;
	const headers = {
		Authorization: `Bearer ${apiKey}`,
		'Notion-Version': '2022-06-28',
		'Content-Type': 'application/json'
	};
	const tryUpdate = async (properties: Record<string, unknown>) => {
		const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
			method: 'PATCH',
			headers,
			body: JSON.stringify({ properties })
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({})) as { message?: string };
			return { ok: false as const, error: err.message ?? res.statusText, status: res.status };
		}
		return { ok: true as const };
	};
	try {
		const statusProp = { 'Demo Status': { status: { name: statusValue } } };
		let result = await tryUpdate({
			'Demo Link': { rich_text: [{ type: 'text', text: { content: demoUrl } }] },
			...statusProp
		});
		if (!result.ok && result.status === 400) {
			result = await tryUpdate({
				'Demo Link': { url: demoUrl },
				...statusProp
			});
		}
		return result;
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : 'Update failed' };
	}
}

type NotionProp = {
	rich_text?: { plain_text: string }[];
	title?: { plain_text: string }[];
	select?: { name: string };
	status?: { name: string };
	url?: string;
	email?: string;
	phone_number?: string;
};

function mapNotionPageToProspect(page: { id: string; properties: Record<string, unknown> }): Prospect {
	const props = page.properties as Record<string, NotionProp>;
	const getTitle = (p: NotionProp) => p?.title?.[0]?.plain_text ?? '';
	const getRich = (p: NotionProp) => p?.rich_text?.[0]?.plain_text ?? '';
	const getSelect = (p: NotionProp) => p?.select?.name ?? '';
	const getStatus = (p: NotionProp) => p?.status?.name ?? '';
	const firstTitle = (...keys: string[]) => {
		for (const k of keys) {
			const v = getTitle(props[k] ?? {});
			if (v) return v;
		}
		return getTitle(props['Name'] ?? props['Company'] ?? {});
	};
	const firstRich = (...keys: string[]) => {
		for (const k of keys) {
			const v = getRich(props[k] ?? {});
			if (v) return v;
		}
		return '';
	};
	const firstSelect = (...keys: string[]) => {
		for (const k of keys) {
			const v = getSelect(props[k] ?? {});
			if (v) return v;
		}
		return '';
	};
	const firstStatus = (...keys: string[]) => {
		for (const k of keys) {
			const v = getStatus(props[k] ?? {});
			if (v) return v;
		}
		return '';
	};
	const websiteUrl = props['Website']?.url;
	const emailVal = props['Email']?.email ?? firstRich('Email', 'E-mail');
	const phoneVal = props['Phone']?.phone_number ?? firstRich('Phone', 'Phone Number');
	return {
		id: page.id,
		companyName: firstTitle('Name', 'Company', 'Company Name'),
		email: emailVal ?? '',
		website: websiteUrl || firstRich('Website') || '',
		phone: phoneVal || undefined,
		address: firstRich('Address') || undefined,
		city: firstRich('City') || undefined,
		industry: firstSelect('Industry', 'Vertical') || 'Solo professionals',
		status: firstStatus('Client Status', 'Demo Status') || firstSelect('Status', 'Stage') || 'Prospect',
		demoLink: firstRich('Demo link', 'Demo Link', 'Demo URL') || undefined
	};
}
