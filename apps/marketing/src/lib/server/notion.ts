import { env } from '$env/dynamic/private';
import type { IndustrySlug } from '$lib/industries';

const NOTION_API_KEY = env.NOTION_API_KEY;
const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID;

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

/** Mock prospects per industry (stub mode when Notion env is not set). */
const MOCK_PROSPECTS: Record<IndustrySlug, Omit<Prospect, 'id' | 'demoLink'>> = {
	healthcare: {
		companyName: 'Acme Family Clinic',
		email: 'hello@acmeclinic.example',
		website: 'https://acmeclinic.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'healthcare',
		status: 'Demo Created'
	},
	dental: {
		companyName: 'Bright Smile Dental',
		email: 'hello@brightsmile.example',
		website: 'https://brightsmile.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'dental',
		status: 'Demo Created'
	},
	construction: {
		companyName: 'Summit Builders Inc.',
		email: 'hello@summitbuilders.example',
		website: 'https://summitbuilders.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'construction',
		status: 'Demo Created'
	},
	salons: {
		companyName: 'Luxe Hair & Beauty',
		email: 'hello@luxehair.example',
		website: 'https://luxehair.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'salons',
		status: 'Demo Created'
	},
	'solo-professionals': {
		companyName: 'Morgan Consulting',
		email: 'hello@morganconsulting.example',
		website: 'https://morganconsulting.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'solo-professionals',
		status: 'Demo Created'
	},
	'real-estate': {
		companyName: 'Parkview Realty',
		email: 'hello@parkviewrealty.example',
		website: 'https://parkviewrealty.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'real-estate',
		status: 'Demo Created'
	},
	legal: {
		companyName: 'Hart & Associates',
		email: 'hello@hartlegal.example',
		website: 'https://hartlegal.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'legal',
		status: 'Demo Created'
	},
	fitness: {
		companyName: 'Peak Fitness Studio',
		email: 'hello@peakfitness.example',
		website: 'https://peakfitness.example',
		phone: '+1 (289) 513-5055',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		city: 'Toronto',
		industry: 'fitness',
		status: 'Demo Created'
	}
};

/**
 * Fetch a single prospect (Notion page) by id.
 * In stub mode, industrySlug selects which mock prospect to return (so each industry demo has its own mock).
 * Returns null if not found or env is missing (stub mode) and industrySlug is unknown.
 */
export async function getProspectById(id: string, industrySlug?: IndustrySlug): Promise<Prospect | null> {
	if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
		const slug = industrySlug ?? 'healthcare';
		const mock = MOCK_PROSPECTS[slug];
		if (!mock) return MOCK_PROSPECTS.healthcare ? { ...MOCK_PROSPECTS.healthcare, id, demoLink: `/healthcare/${id}` } : null;
		return {
			...mock,
			id,
			demoLink: `/${slug}/${id}`
		};
	}

	try {
		// Notion API: retrieve page then get properties
		const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
			headers: {
				Authorization: `Bearer ${NOTION_API_KEY}`,
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

/**
 * List prospects from the Notion database (optional; for CRM table).
 * In stub mode, returns one mock prospect per industry so all demo links work.
 */
export async function listProspects(): Promise<Prospect[]> {
	if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
		const slugs: IndustrySlug[] = ['healthcare', 'dental', 'construction', 'salons', 'solo-professionals', 'real-estate', 'legal', 'fitness'];
		return slugs.map((slug) => {
			const mock = MOCK_PROSPECTS[slug];
			const id = `mock-${slug}`;
			return {
				...mock,
				id,
				demoLink: `/${slug}/${id}`
			};
		});
	}

	try {
		const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${NOTION_API_KEY}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ page_size: 100 })
		});
		if (!res.ok) return [];
		const data = (await res.json()) as { results: Array<{ id: string; properties: Record<string, unknown> }> };
		return data.results.map((page) => mapNotionPageToProspect(page));
	} catch {
		return [];
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
	if (!NOTION_API_KEY) return { ok: false, error: 'Notion not configured' };
	const headers = {
		Authorization: `Bearer ${NOTION_API_KEY}`,
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
		website: websiteUrl || firstRich('Website') || undefined,
		phone: phoneVal || undefined,
		address: firstRich('Address') || undefined,
		city: firstRich('City') || undefined,
		industry: firstSelect('Industry', 'Vertical') || 'healthcare',
		status: firstStatus('Client Status', 'Demo Status') || firstSelect('Status', 'Stage') || 'Prospect',
		demoLink: firstRich('Demo link', 'Demo Link', 'Demo URL') || undefined
	};
}
