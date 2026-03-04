import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { markdownToHtml } from '$lib/markdown';

const ALLOWED_IDS = ['notion', 'hubspot', 'gohighlevel', 'pipedrive'] as const;
const TITLES: Record<(typeof ALLOWED_IDS)[number], string> = {
	notion: 'Notion setup',
	hubspot: 'HubSpot setup',
	gohighlevel: 'GoHighLevel setup',
	pipedrive: 'Pipedrive setup'
};

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id?.toLowerCase();
	if (!id || !ALLOWED_IDS.includes(id as (typeof ALLOWED_IDS)[number])) {
		throw error(404, 'Help doc not found');
	}
	const base = process.cwd();
	const filePath = join(base, 'docs', 'integrations', `${id}.md`);
	let content: string;
	try {
		const raw = readFileSync(filePath, 'utf-8');
		content = markdownToHtml(raw);
	} catch {
		throw error(404, 'Help doc not found');
	}
	return {
		content,
		title: TITLES[id as (typeof ALLOWED_IDS)[number]],
		id
	};
};
