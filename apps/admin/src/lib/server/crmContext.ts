/**
 * Builds CRM context for the AI chat: counts, urgent summary, and a truncated prospect list
 * so the model can answer questions about what's urgent, who has websites, who's engaged, etc.
 */

import type { Prospect } from '$lib/server/prospects';

const MAX_PROSPECTS_IN_CONTEXT = 50;

export type DemoTrackingMap = Record<
	string,
	{ status: string; send_time: string | null; opened_at: string | null; clicked_at: string | null }
>;

/**
 * Build a single text blob for the LLM system prompt from prospects and demo tracking.
 * Caps prospect list at MAX_PROSPECTS_IN_CONTEXT to keep context window safe.
 */
export function buildCrmContext(
	prospects: Prospect[],
	demoTrackingByProspectId: DemoTrackingMap
): string {
	const total = prospects.length;
	const withWebsite = prospects.filter((p) => (p.website ?? '').trim().length > 0).length;
	const withoutWebsite = total - withWebsite;
	const withEmail = prospects.filter((p) => (p.email ?? '').trim().length > 0).length;
	const withDemo = prospects.filter((p) => (p.demoLink ?? '').trim().length > 0).length;
	const noDemoButEmail = prospects.filter(
		(p) => ((p.email ?? '').trim().length > 0) && !(p.demoLink ?? '').trim()
	).length;

	let draft = 0,
		approved = 0,
		sent = 0,
		opened = 0,
		clicked = 0,
		replied = 0;
	for (const [, t] of Object.entries(demoTrackingByProspectId)) {
		if (t.status === 'draft') draft++;
		else if (t.status === 'approved') approved++;
		else if (t.status === 'sent') sent++;
		else if (t.status === 'opened') opened++;
		else if (t.status === 'clicked') clicked++;
		else if (t.status === 'replied') replied++;
	}

	const lines: string[] = [
		'You are a CRM analyst for Lead Rosetta. The user is running cold outreach: they have prospects, generate personalized demos, and send them via email. Answer only from the CRM data below. Be concise and actionable.',
		'',
		'--- COUNTS ---',
		`Total prospects: ${total}`,
		`With website: ${withWebsite}. Without website: ${withoutWebsite}.`,
		`With email: ${withEmail}. With demo created: ${withDemo}. With email but no demo yet: ${noDemoButEmail}.`,
		`Demo tracking: ${draft} draft, ${approved} approved (ready to send), ${sent} sent, ${opened} opened, ${clicked} clicked, ${replied} replied.`,
		'',
		'--- URGENT ---',
		`Approved ready to send: ${approved}.`,
		`With email but no demo yet: ${noDemoButEmail}.`,
		`Drafts to review: ${draft}.`,
		'',
		'--- MOST LIKELY TO READ ---',
		`Already opened email: ${opened}. Already clicked demo link: ${clicked}. Replied: ${replied}. Prospects with website + email are often more engaged; prioritize those when suggesting who to contact.`,
		'',
		'--- PROSPECT LIST (company, has_website, has_email, demo_status) ---'
	];

	const list = prospects.slice(0, MAX_PROSPECTS_IN_CONTEXT);
	for (const p of list) {
		const tracking = demoTrackingByProspectId[p.id];
		const demoStatus = tracking?.status ?? (p.demoLink ? 'has_demo' : 'no_demo');
		lines.push(
			`- ${(p.companyName || 'Unnamed').replace(/\n/g, ' ')} | website: ${(p.website ?? '').trim() ? 'Y' : 'N'} | email: ${(p.email ?? '').trim() ? 'Y' : 'N'} | demo_status: ${demoStatus}`
		);
	}
	if (prospects.length > MAX_PROSPECTS_IN_CONTEXT) {
		lines.push(`... and ${prospects.length - MAX_PROSPECTS_IN_CONTEXT} more prospects (use counts above).`);
	}

	lines.push('');
	lines.push('Answer the user\'s questions about what to do next, who to prioritize, who has websites vs not, and how to accelerate their outreach. Suggest concrete next steps (e.g. "Send to the N approved", "Create demos for those without").');

	return lines.join('\n');
}
