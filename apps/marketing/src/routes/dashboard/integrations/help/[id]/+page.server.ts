import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { markdownToHtml } from '$lib/markdown';
import { INTEGRATION_HELP_DOCS, INTEGRATION_IDS } from '$lib/server/integrationHelpDocs';

const TITLES: Record<(typeof INTEGRATION_IDS)[number], string> = {
	notion: 'Notion setup',
	hubspot: 'HubSpot setup',
	gohighlevel: 'GoHighLevel setup',
	pipedrive: 'Pipedrive setup'
};

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id?.toLowerCase();
	if (!id || !INTEGRATION_IDS.includes(id as (typeof INTEGRATION_IDS)[number])) {
		throw error(404, 'Help doc not found');
	}
	const raw = INTEGRATION_HELP_DOCS[id];
	if (!raw) {
		throw error(404, 'Help doc not found');
	}
	const content = markdownToHtml(raw);
	return {
		content,
		title: TITLES[id as (typeof INTEGRATION_IDS)[number]],
		id
	};
};
