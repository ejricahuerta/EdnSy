/**
 * Per-user app settings (e.g. CRM industry filter). Stored in Supabase user_settings.
 */

import { getSupabaseAdmin } from '$lib/server/supabase';
import { getGmailTokens } from '$lib/server/gmail';
import type { IndustrySlug } from '$lib/industries';

/** Derive a display name from an email (e.g. ed@gmail.com → Ed). */
function nameFromEmail(email: string): string {
	const local = email.split('@')[0]?.trim() || '';
	if (!local) return 'Ed & Sy Admin';
	return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
}

const CRM_INDUSTRY_FILTER_KEY = 'crm_industry_filter';
const GBP_DEFAULT_LOCATION_KEY = 'gbp_default_location';
const EMAIL_SENDER_NAME_KEY = 'email_sender_name';
const EMAIL_SIGNATURE_OVERRIDE_KEY = 'email_signature_override';
const DEMO_BANNER_KEY = 'demo_banner';

export type DemoBannerSettings = {
	text: string;
	ctaLabel: string;
	ctaHref: string;
};

/**
 * Get the user's CRM industry filter. Returns empty array if not set (show all industries).
 */
export async function getCrmIndustryFilter(userId: string): Promise<IndustrySlug[]> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', CRM_INDUSTRY_FILTER_KEY)
		.maybeSingle();
	if (error || !data?.value || !Array.isArray(data.value)) return [];
	return data.value as IndustrySlug[];
}

/**
 * Save the user's CRM industry filter. Empty array = show all industries.
 */
export async function setCrmIndustryFilter(
	userId: string,
	slugs: IndustrySlug[]
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: CRM_INDUSTRY_FILTER_KEY,
			value: slugs,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Get the user's default location for GBP/Places lookup (e.g. "Toronto, Ontario, Canada").
 * Returns null if not set (caller uses app default; Places API falls back to "United States").
 */
export async function getGbpDefaultLocation(userId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', GBP_DEFAULT_LOCATION_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'string') return null;
	const s = (data.value as string).trim();
	return s || null;
}

/**
 * Save the user's default location for GBP lookup. Pass empty string to clear (use env default).
 */
export async function setGbpDefaultLocation(
	userId: string,
	location: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = location.trim() || null;
	if (value === null) {
		const { error } = await supabase
			.from('user_settings')
			.delete()
			.eq('user_id', userId)
			.eq('key', GBP_DEFAULT_LOCATION_KEY);
		if (error) return { ok: false, error: error.message };
		return { ok: true };
	}
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: GBP_DEFAULT_LOCATION_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Effective sender name for outreach: user override if set, else Gmail account name when
 * Gmail is connected, else app account email local part, else "Ed & Sy Admin". Use this when
 * building email body and for the From name when sending.
 */
export async function getEffectiveEmailSenderName(
	userId: string,
	appUserEmail?: string | null
): Promise<string> {
	const override = await getEmailSenderName(userId);
	if (override != null && override.trim() !== '') return override.trim();
	const tokens = await getGmailTokens(userId);
	if (tokens?.email?.trim()) return nameFromEmail(tokens.email.trim());
	const local = appUserEmail?.trim().split('@')[0]?.trim();
	if (local) return nameFromEmail(appUserEmail!.trim());
	return 'Ed & Sy Admin';
}

/**
 * Get the user's email sender name override (used in email body sign-off). Returns null if not set.
 */
export async function getEmailSenderName(userId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', EMAIL_SENDER_NAME_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'string') return null;
	const s = (data.value as string).trim();
	return s || null;
}

/**
 * Save the user's email sender name. Pass empty string to clear (fall back to email prefix or "Ed & Sy Admin").
 */
export async function setEmailSenderName(
	userId: string,
	name: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = name.trim() || null;
	if (value === null) {
		const { error } = await supabase
			.from('user_settings')
			.delete()
			.eq('user_id', userId)
			.eq('key', EMAIL_SENDER_NAME_KEY);
		if (error) return { ok: false, error: error.message };
		return { ok: true };
	}
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: EMAIL_SENDER_NAME_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

/**
 * Get the user's email signature override for AI-generated outreach emails. When set, this line
 * is used instead of the default "- [Sender name] | ednsy.com". May contain {{senderName}}.
 * Returns null if not set.
 */
export async function getEmailSignatureOverride(userId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', EMAIL_SIGNATURE_OVERRIDE_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'string') return null;
	const s = (data.value as string).trim();
	return s || null;
}

/**
 * Save the user's email signature override. Pass empty string to clear (use default signature).
 */
export async function setEmailSignatureOverride(
	userId: string,
	signature: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = signature.trim() || null;
	if (value === null) {
		const { error } = await supabase
			.from('user_settings')
			.delete()
			.eq('user_id', userId)
			.eq('key', EMAIL_SIGNATURE_OVERRIDE_KEY);
		if (error) return { ok: false, error: error.message };
		return { ok: true };
	}
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: EMAIL_SIGNATURE_OVERRIDE_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}

const DEFAULT_DEMO_BANNER: DemoBannerSettings = {
	text: 'Want this live in 48 hours?',
	ctaLabel: 'Connect with Ed & Sy',
	ctaHref: '/auth/login'
};

/**
 * Get the user's demo banner settings (text, CTA label, CTA link). Returns defaults if not set.
 */
export async function getDemoBanner(userId: string): Promise<DemoBannerSettings> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return DEFAULT_DEMO_BANNER;
	const { data, error } = await supabase
		.from('user_settings')
		.select('value')
		.eq('user_id', userId)
		.eq('key', DEMO_BANNER_KEY)
		.maybeSingle();
	if (error || !data?.value || typeof data.value !== 'object') return DEFAULT_DEMO_BANNER;
	const v = data.value as Record<string, unknown>;
	const text = typeof v.text === 'string' ? v.text.trim() : DEFAULT_DEMO_BANNER.text;
	const ctaLabel = typeof v.ctaLabel === 'string' ? v.ctaLabel.trim() : DEFAULT_DEMO_BANNER.ctaLabel;
	const ctaHref = typeof v.ctaHref === 'string' ? v.ctaHref.trim() : DEFAULT_DEMO_BANNER.ctaHref;
	return { text: text || DEFAULT_DEMO_BANNER.text, ctaLabel: ctaLabel || DEFAULT_DEMO_BANNER.ctaLabel, ctaHref: ctaHref || DEFAULT_DEMO_BANNER.ctaHref };
}

/**
 * Save the user's demo banner settings.
 */
export async function setDemoBanner(
	userId: string,
	settings: DemoBannerSettings
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const value = {
		text: (settings.text ?? '').trim() || DEFAULT_DEMO_BANNER.text,
		ctaLabel: (settings.ctaLabel ?? '').trim() || DEFAULT_DEMO_BANNER.ctaLabel,
		ctaHref: (settings.ctaHref ?? '').trim() || DEFAULT_DEMO_BANNER.ctaHref
	};
	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: userId,
			key: DEMO_BANNER_KEY,
			value,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,key' }
	);
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}
