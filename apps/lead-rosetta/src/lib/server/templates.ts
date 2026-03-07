import { getSupabaseAdmin } from '$lib/server/supabase';

export type UserTemplates = {
	demoHtml: string | null;
	emailHtml: string | null;
};

/**
 * Fetch demo and email templates for a user. Returns nulls when not set.
 */
export async function getTemplates(userId: string): Promise<UserTemplates> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { demoHtml: null, emailHtml: null };
	const { data, error } = await supabase
		.from('user_templates')
		.select('demo_html, email_html')
		.eq('user_id', userId)
		.maybeSingle();
	if (error || !data) return { demoHtml: null, emailHtml: null };
	return {
		demoHtml: data.demo_html ?? null,
		emailHtml: data.email_html ?? null
	};
}

/**
 * Upsert user templates. Pass null for a field to leave it unchanged; pass empty string to clear.
 */
export async function setTemplates(
	userId: string,
	updates: { demoHtml?: string | null; emailHtml?: string | null }
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { data: existing } = await supabase
		.from('user_templates')
		.select('demo_html, email_html')
		.eq('user_id', userId)
		.maybeSingle();

	const demo_html =
		updates.demoHtml !== undefined
			? (updates.demoHtml || null)
			: (existing?.demo_html ?? null);
	const email_html =
		updates.emailHtml !== undefined
			? (updates.emailHtml || null)
			: (existing?.email_html ?? null);

	const { error } = await supabase.from('user_templates').upsert(
		{
			user_id: userId,
			demo_html,
			email_html,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/** Placeholders for demo HTML (documented for UI). */
export const DEMO_PLACEHOLDERS = [
	'{{companyName}}',
	'{{website}}',
	'{{address}}',
	'{{city}}',
	'{{senderName}}',
	'{{prospectId}}',
	'{{industrySlug}}'
] as const;

/** Placeholders for email HTML (documented for UI). Legal footer and tracking pixel are appended automatically. */
export const EMAIL_PLACEHOLDERS = [
	'{{companyName}}',
	'{{demoLink}}',
	'{{trackableLink}}',
	'{{senderName}}'
] as const;

export type DemoPlaceholderVars = {
	companyName: string;
	website: string;
	address: string;
	city: string;
	senderName: string;
	prospectId: string;
	industrySlug: string;
};

/**
 * Replace demo HTML placeholders. Used when rendering custom demo template on demo pages.
 */
export function replaceDemoPlaceholders(html: string, vars: DemoPlaceholderVars): string {
	return html
		.replace(/\{\{companyName\}\}/g, escapeHtml(vars.companyName))
		.replace(/\{\{website\}\}/g, escapeHtml(vars.website))
		.replace(/\{\{address\}\}/g, escapeHtml(vars.address))
		.replace(/\{\{city\}\}/g, escapeHtml(vars.city))
		.replace(/\{\{senderName\}\}/g, escapeHtml(vars.senderName))
		.replace(/\{\{prospectId\}\}/g, escapeHtml(vars.prospectId))
		.replace(/\{\{industrySlug\}\}/g, escapeHtml(vars.industrySlug));
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
