import { env } from '$env/dynamic/private';

/** Read at request time so Vercel serverless always sees current env (not cached at module load). */
function getNotionConfig() {
	return {
		apiKey: env.NOTION_API_KEY,
		databaseId: env.NOTION_DATABASE_ID
	};
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
 * Returns null if Notion is not configured or the page is not found.
 */
export async function getProspectById(id: string): Promise<Prospect | null> {
	const { apiKey } = getNotionConfig();
	if (!apiKey) return null;

	try {
		// Notion API: retrieve page then get properties
		const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
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
 * Returns prospects and optional error so the UI can show a clear message.
 */
export async function listProspects(): Promise<ListProspectsResult> {
	const { apiKey, databaseId } = getNotionConfig();
	if (!apiKey || !databaseId) {
		return { prospects: [], error: 'not_configured', message: 'NOTION_API_KEY and NOTION_DATABASE_ID must be set in your environment (e.g. Vercel).' };
	}

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
 * Update a prospect's Demo link and Status in Notion.
 * Expects "Demo link" as rich_text or URL type, and "Status" as select.
 * Tries rich_text first; if Notion rejects (e.g. property is URL type), tries url.
 */
export async function updateProspectDemoLink(
	pageId: string,
	demoUrl: string,
	statusValue: string = 'Demo Created'
): Promise<{ ok: boolean; error?: string }> {
	const { apiKey } = getNotionConfig();
	if (!apiKey) return { ok: false, error: 'Notion not configured' };
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
		industry: firstSelect('Industry', 'Vertical') || 'healthcare',
		status: firstStatus('Client Status', 'Demo Status') || firstSelect('Status', 'Stage') || 'Prospect',
		demoLink: firstRich('Demo link', 'Demo Link', 'Demo URL') || undefined
	};
}
