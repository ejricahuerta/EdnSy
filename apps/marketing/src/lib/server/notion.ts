import { env } from '$env/dynamic/private';
import type { IndustrySlug } from '$lib/industries';

const NOTION_API_KEY = env.NOTION_API_KEY;
const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID;

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

function mapNotionPageToProspect(page: { id: string; properties: Record<string, unknown> }): Prospect {
	const props = page.properties as Record<string, { rich_text?: { plain_text: string }[]; title?: { plain_text: string }[]; select?: { name: string }; url?: string }>;
	const getTitle = (p: { title?: { plain_text: string }[] }) => p?.title?.[0]?.plain_text ?? '';
	const getRich = (p: { rich_text?: { plain_text: string }[] }) => p?.rich_text?.[0]?.plain_text ?? '';
	return {
		id: page.id,
		companyName: getTitle(props['Company'] ?? props['Name'] ?? {}),
		email: getRich(props['Email'] ?? {}),
		website: props['Website']?.url ?? getRich(props['Website'] ?? {}),
		phone: getRich(props['Phone'] ?? {}),
		address: getRich(props['Address'] ?? {}) || undefined,
		city: getRich(props['City'] ?? {}) || undefined,
		industry: (props['Industry'] as { select?: { name: string } })?.select?.name ?? 'healthcare',
		status: (props['Status'] as { select?: { name: string } })?.select?.name ?? 'Prospect',
		demoLink: getRich(props['Demo link'] ?? {}) || undefined
	};
}
