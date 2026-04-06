import twilio from 'twilio';
import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';

/** Canonical origin for shareable demo page URLs in deployed environments. */
export const DEMO_PUBLIC_ORIGIN_PRODUCTION = 'https://built.by.ednsy.com';

function isLocalDevelopmentOrigin(requestOrigin: string): boolean {
	const trimmed = requestOrigin.trim();
	if (!trimmed) return false;
	try {
		const hostname = new URL(trimmed).hostname.toLowerCase();
		return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
	} catch {
		return false;
	}
}

/**
 * Base URL for stored demo links (`/demo/:id`). Uses the request origin on localhost; otherwise
 * built.by.ednsy.com. Use getOriginForOutgoingLinks for cron, email tracking (/api/demo/click), and callbacks.
 */
export function getDemoPublicOrigin(requestOrigin: string): string {
	const trimmed = (requestOrigin ?? '').trim();
	if (isLocalDevelopmentOrigin(trimmed)) {
		return trimmed.replace(/\/$/, '');
	}
	return DEMO_PUBLIC_ORIGIN_PRODUCTION;
}

/** Use for links in emails and stored demo URLs. Prefer SITE_ORIGIN when set (e.g. in prod), else request origin. */
export function getOriginForOutgoingLinks(requestOrigin: string): string {
	const site = env.SITE_ORIGIN?.trim();
	return site || requestOrigin;
}
import { DEV_OUTBOUND_EMAIL, LEGAL_COMPANY_ADDRESS, LEGAL_COMPANY_NAME, SIGNATURE_DOMAIN } from '$lib/constants';
import { getEffectiveEmailSenderName } from '$lib/server/userSettings';
import { getGmailTokens, sendEmailViaGmail } from '$lib/server/gmail';
import { serverInfo, serverError } from '$lib/server/logger';
import { getSupabaseDbSchemaServer } from '$lib/server/dbSchemaEnv';

function getTwilioConfig() {
	const accountSid = env.TWILIO_ACCOUNT_SID;
	const authToken = env.TWILIO_AUTH_TOKEN;
	const fromNumber = env.TWILIO_PHONE_NUMBER;
	return { accountSid, authToken, fromNumber };
}

function subjectTemplateHash(salt: string): number {
	let h = 0;
	for (let i = 0; i < salt.length; i++) h = (Math.imul(31, h) + salt.charCodeAt(i)) >>> 0;
	return h;
}

/** Curiosity-style fallbacks (not "idea for {name}"). Same prospect id always picks the same line. */
const UPGRADE_PITCH_SUBJECT_TEMPLATES: ReadonlyArray<(c: string) => string> = [
	(c) => `quick reaction to ${c}'s site`,
	(c) => `loose homepage sketch for ${c}`,
	(c) => `${c}, worth two minutes?`,
	(c) => `had a thought after ${c}'s site`,
	(c) => `softer first impression for ${c}?`,
	(c) => `what if ${c} converted a bit easier`
];

/**
 * Fallback demo subject when AI does not supply one. Varies by prospect so inboxes look less templated.
 * Pass `prospect.id` as salt when available. Company name keeps CRM title case.
 */
export function getUpgradePitchSubject(companyName: string, salt?: string): string {
	const c = (companyName || 'your business').trim() || 'your business';
	if (/^your business$/i.test(c)) {
		return 'loose sketch for your site if it helps';
	}
	const idx = salt ? subjectTemplateHash(salt) % UPGRADE_PITCH_SUBJECT_TEMPLATES.length : 0;
	return UPGRADE_PITCH_SUBJECT_TEMPLATES[idx](c);
}

const SUBJECT_STOPWORDS = new Set([
	'the',
	'and',
	'of',
	'for',
	'a',
	'an',
	'in',
	'at',
	'to',
	'or',
	'as',
	'on',
	'by'
]);

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * After AI lowercasing, restore the business name to match prospect.companyName (title case from CRM).
 */
export function applyCompanyNameCasingInSubject(
	subject: string,
	companyName: string | null | undefined
): string {
	const company = (companyName ?? '').trim();
	if (!subject.trim() || !company || /^your business$/i.test(company)) {
		return subject;
	}
	const subLower = subject.toLowerCase();
	const compLower = company.toLowerCase();

	if (subLower.includes(compLower)) {
		const re = new RegExp(escapeRegex(compLower), 'gi');
		return subject.replace(re, company);
	}

	const tokens = company.split(/\s+/).filter(Boolean);
	let out = subject;
	for (const tok of tokens) {
		const plain = tok.replace(/[^a-z0-9']/gi, '').toLowerCase();
		if (plain.length < 3 || SUBJECT_STOPWORDS.has(plain)) continue;
		if (!subLower.includes(plain)) continue;
		const re = new RegExp(`\\b${escapeRegex(plain)}\\b`, 'gi');
		out = out.replace(re, tok);
	}
	return out;
}

/** @deprecated Use {@link getUpgradePitchSubject}; kept for call sites that still reference the old name. */
export function getDefaultEmailSubject(companyName: string): string {
	return getUpgradePitchSubject(companyName, undefined);
}

/** Subject for alternate-offer email (AI agent, voice AI, SEO; no demo). */
export function getAlternateOfferSubject(companyName: string): string {
	return `Quick idea for ${companyName}`;
}

/**
 * Build email HTML for alternate offer (AI agent, voice AI, SEO) when we're not sending a website demo.
 * No demo link; short outcome-focused pitch and soft CTA.
 */
export function buildEmailBodyAlternateOffer(
	prospect: Prospect,
	senderName: string,
	_origin: string
): string {
	const company = escapeHtml(prospect.companyName || 'your business');
	const safeSender = escapeHtml(senderName);
	const html = `
<p>Hi there,</p>
<p>I had a quick look at how ${company} shows up online. A lot of local businesses like yours leave calls and bookings on the table after hours or when the desk is slammed, and it&apos;s hard to stay visible in local search without constant attention.</p>
<p>We help with 24/7 phone coverage (AI answers and books) and tightening local SEO / Google Business so more people find you when they search. If that sounds worth a short chat, reply here and we can figure out what would actually help ${company}.</p>
<p>Best,</p>
<p>${safeSender}</p>
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
`.trim();
	return html;
}

/**
 * Build the signature line for AI-generated emails. Uses signatureOverride when set (with
 * {{senderName}} replaced), otherwise default "- {senderName} | {SIGNATURE_DOMAIN}".
 */
export function getEmailSignatureLine(
	senderName: string,
	signatureOverride: string | null
): string {
	if (signatureOverride?.trim()) {
		return signatureOverride
			.replace(/\{\{senderName\}\}/g, senderName)
			.trim();
	}
	return `- ${senderName} | ${SIGNATURE_DOMAIN}`;
}

/** Plain closing line after "Best," (no leading dash). */
function getEmailClosingSignatureLine(senderName: string, signatureOverride: string | null): string {
	const line = getEmailSignatureLine(senderName, signatureOverride);
	return line.replace(/^\s*-\s+/, '').trim() || `${senderName} | ${SIGNATURE_DOMAIN}`;
}

function defaultUpgradeOpeningParagraph(company: string): string {
	const c = company.trim() || 'your business';
	return `I was thinking about how ${c} reads to a first-time visitor who is still deciding if they're in the right place. I noticed a few spots where the next step could feel clearer.`;
}

/**
 * Short demo outreach HTML: AI opener + prototype CTA + soft close. No feature bullet list.
 * Tracking: link = /api/demo/click, pixel = /api/demo/open.
 */
export function buildEmailBodyUpgradePitch(
	prospect: Prospect,
	senderName: string,
	origin: string,
	signatureOverride: string | null | undefined,
	options?: { openingHook?: string | null }
): string {
	const company = (prospect.companyName || 'your business').trim() || 'your business';
	const companySafe = escapeHtml(company);
	const trackableLink = `${origin}/api/demo/click?p=${encodeURIComponent(prospect.id)}`;
	const pixelUrl = `${origin}/api/demo/open?p=${encodeURIComponent(prospect.id)}`;
	const openingPlain = (options?.openingHook ?? '').trim() || defaultUpgradeOpeningParagraph(company);
	const openingHtml = `<p>${escapeHtml(openingPlain).replace(/\n/g, '<br />\n')}</p>`;
	const closingSig = escapeHtml(getEmailClosingSignatureLine(senderName, signatureOverride ?? null));
	const linkLabel = `See the ${companySafe} prototype`;
	const html = `
<p>Hi there,</p>
${openingHtml}
<p>I mocked that up as a simple interactive draft for ${companySafe}. Easier to skim than a long write-up. If you have two minutes:</p>
<p><a href="${trackableLink}">${linkLabel}</a></p>
<p>No strings attached. Just curious what you think.</p>
<p>Best,</p>
<p>${closingSig}</p>
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
`.trim();
	return html;
}

/**
 * @deprecated Prefer {@link buildEmailBodyUpgradePitch}. Kept for any external references.
 */
export function buildEmailBodyFromAiIntro(
	prospect: Prospect,
	_demoLink: string,
	senderName: string,
	origin: string,
	bodyIntro: string,
	signatureOverride?: string | null
): string {
	return buildEmailBodyUpgradePitch(prospect, senderName, origin, signatureOverride ?? null, {
		openingHook: bodyIntro
	});
}

/**
 * Build email HTML with trackable link and open pixel. Tracking is active: link = /api/demo/click, pixel = /api/demo/open.
 * origin: e.g. https://app.example.com (for /api/demo/click and /api/demo/open).
 */
export function buildEmailBody(
	prospect: Prospect,
	_demoLink: string,
	senderName: string,
	origin: string
): string {
	return buildEmailBodyUpgradePitch(prospect, senderName, origin, null, {});
}

export type EmailTemplateVars = {
	companyName: string;
	demoLink: string;
	trackableLink: string;
	senderName: string;
	pixelUrl: string;
};

/**
 * Build email HTML from a user template string. Replaces {{placeholders}} and appends legal footer + tracking pixel.
 * Tracking is active (pixel = open, {{trackableLink}} = click). Use when user has a custom email template.
 */
export function buildEmailBodyFromTemplate(
	templateHtml: string,
	vars: EmailTemplateVars
): string {
	let body = templateHtml
		.replace(/\{\{companyName\}\}/g, escapeHtml(vars.companyName))
		.replace(/\{\{demoLink\}\}/g, vars.demoLink)
		.replace(/\{\{trackableLink\}\}/g, vars.trackableLink)
		.replace(/\{\{senderName\}\}/g, escapeHtml(vars.senderName));
	const footer = `<img src="${vars.pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
	return body.trim() + footer;
}

export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Build email body for sending: uses custom template when provided, otherwise default.
 */
export function buildEmailBodyForUser(
	prospect: Prospect,
	demoLink: string,
	senderName: string,
	origin: string,
	customEmailHtml: string | null
): string {
	const company = prospect.companyName || 'your business';
	const trackableLink = `${origin}/api/demo/click?p=${encodeURIComponent(prospect.id)}`;
	const pixelUrl = `${origin}/api/demo/open?p=${encodeURIComponent(prospect.id)}`;
	const vars: EmailTemplateVars = {
		companyName: company,
		demoLink,
		trackableLink,
		senderName,
		pixelUrl
	};
	if (customEmailHtml?.trim()) {
		return buildEmailBodyFromTemplate(customEmailHtml.trim(), vars);
	}
	return buildEmailBody(prospect, demoLink, senderName, origin);
}

/** Banned openings that read as empty "name-only" subjects. */
function isGenericSubjectShell(s: string): boolean {
	const t = s.trim().toLowerCase().replace(/\s+/g, ' ');
	const weakStarts = [
		'idea for ',
		'thought about ',
		'something for ',
		'a thought for ',
		'quick idea for ',
		'thought on ',
		'something about ',
		'note for ',
		'a note for '
	];
	if (weakStarts.some((b) => t.startsWith(b))) return true;
	const words = t.split(' ').filter(Boolean);
	if (words.length <= 5 && /, quick thought$/i.test(t)) return true;
	return false;
}

/**
 * Reject one-word or generic AI subjects (e.g. "dental") and subjects that ignore the company name.
 */
function isAcceptableAiOutreachSubject(subject: string, companyName: string): boolean {
	const s = subject.trim().toLowerCase().replace(/\s+/g, ' ');
	if (s.length < 6) return false;
	if (isGenericSubjectShell(s)) return false;
	const words = s.split(' ').filter(Boolean);
	if (words.length < 2) return false;
	const company = (companyName || '').trim().toLowerCase();
	if (!company || company === 'your business') {
		return words.length >= 4;
	}
	const significant = company
		.split(/\s+/)
		.map((p) => p.replace(/[^a-z0-9']/gi, '').replace(/'/g, ''))
		.filter((p) => p.length >= 3);
	if (significant.length === 0) {
		return words.length >= 4;
	}
	return significant.some((tok) => s.includes(tok));
}

/** Optional AI paragraph for the upgrade-pitch template (see {@link buildEmailBodyUpgradePitch}). */
export type DemoEmailAiCopy = { openingHook?: string; bodyIntro?: string; subjectLine?: string };

export type DemoEmailGenerationResult = {
	copy: DemoEmailAiCopy | null;
	promptSource: 'override' | 'default';
	error?: string;
};

/**
 * Subject + HTML for “send demo” email: upgrade-pitch template, optional custom user HTML template,
 * optional AI opening paragraph. Fails when a custom Email AI prompt is active but generation returned no copy.
 */
export function resolveDemoOutreachEmail(
	prospect: Prospect,
	senderName: string,
	linkOrigin: string,
	emailHtmlTemplate: string | null,
	emailSignatureOverride: string | null,
	ai: DemoEmailGenerationResult
): { subject: string; html: string } | { error: string } {
	if (ai.copy === null && ai.promptSource === 'override') {
		return {
			error:
				ai.error ??
				'AI email generation failed while a custom Email AI prompt override is active. The email was not sent.'
		};
	}
	const aiSubject = ai.copy?.subjectLine?.trim();
	const baseSubject =
		aiSubject && isAcceptableAiOutreachSubject(aiSubject, prospect.companyName || '')
			? aiSubject
			: getUpgradePitchSubject(prospect.companyName || 'your business', prospect.id);
	const subject = applyCompanyNameCasingInSubject(baseSubject, prospect.companyName);
	const hookRaw = ai.copy?.openingHook?.trim() || ai.copy?.bodyIntro?.trim();
	const openingHook = hookRaw && hookRaw.length > 0 ? hookRaw : null;
	if (emailHtmlTemplate?.trim()) {
		return {
			subject,
			html: buildEmailBodyForUser(
				prospect,
				prospect.demoLink ?? '',
				senderName,
				linkOrigin,
				emailHtmlTemplate
			)
		};
	}
	return {
		subject,
		html: buildEmailBodyUpgradePitch(prospect, senderName, linkOrigin, emailSignatureOverride, { openingHook })
	};
}

/** Default SMS body per PRD. First name not in schema; use company or "there". CASL: opt-out. */
export function buildSmsBody(prospect: Prospect, demoLink: string, senderName: string): string {
	const company = prospect.companyName || 'your business';
	return `Hey there, I built a free website demo for ${company}. 30 seconds to see it: ${demoLink} (${senderName}). Reply STOP to opt out.`;
}

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };
export type SendSmsResult = { ok: true; sid?: string } | { ok: false; error: string };

export type SendEmailOptions = {
	/** When set, send via user's connected Gmail. Required for sending (no Resend fallback). */
	userId?: string;
	/** App user email (e.g. from session). Used to resolve effective sender name. */
	appUserEmail?: string | null;
};

/**
 * Maps the intended recipient to the actual Gmail `to` address. In `dev` PostgREST schema,
 * non-empty addresses are redirected to {@link DEV_OUTBOUND_EMAIL}.
 */
export function resolveOutboundEmailRecipient(originalTo: string): {
	effectiveTo: string;
	originalTo: string;
	devRedirect: boolean;
} {
	const originalToTrimmed = originalTo.trim();
	const devRedirect =
		getSupabaseDbSchemaServer() === 'dev' && originalToTrimmed.length > 0;
	const effectiveTo = devRedirect ? DEV_OUTBOUND_EMAIL : originalToTrimmed;
	return { effectiveTo, originalTo: originalToTrimmed, devRedirect };
}

/** Whether the user can send email (Gmail connected in Integrations). */
export async function getSendConfigured(userId: string | null): Promise<boolean> {
	if (userId == null) return false;
	const tokens = await getGmailTokens(userId);
	return tokens != null && !!tokens.refresh_token;
}

/**
 * Send email via Gmail only. Requires options.userId and the user to have connected Gmail in Integrations.
 */
export async function sendEmail(
	to: string,
	subject: string,
	html: string,
	options?: SendEmailOptions
): Promise<SendEmailResult> {
	const userId = options?.userId;
	const { effectiveTo, originalTo, devRedirect } = resolveOutboundEmailRecipient(to);
	if (!userId) {
		const err = 'Email sending requires Gmail. Connect Gmail in Dashboard → Integrations.';
		serverError('email-send', err, { to: effectiveTo, originalTo, devRedirect });
		return { ok: false, error: err };
	}

	const fromNameOverride = await getEffectiveEmailSenderName(userId, options?.appUserEmail);
	const result = await sendEmailViaGmail(userId, effectiveTo, subject, html, fromNameOverride);
	if (result.ok) {
		serverInfo('email-send', 'Sent via Gmail', {
			to: effectiveTo,
			originalTo: devRedirect ? originalTo : undefined,
			devRedirect,
			id: result.id
		});
		return result;
	}
	serverError('email-send', result.error, {
		to: effectiveTo,
		originalTo: devRedirect ? originalTo : undefined,
		devRedirect,
		provider: 'gmail'
	});
	return result;
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
	const { accountSid, authToken, fromNumber } = getTwilioConfig();
	if (!accountSid || !authToken || !fromNumber) {
		return { ok: false, error: 'Twilio not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)' };
	}
	try {
		const client = twilio(accountSid, authToken);
		const message = await client.messages.create({
			body,
			from: fromNumber,
			to: to.trim().startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`
		});
		return { ok: true, sid: message.sid };
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return { ok: false, error: message };
	}
}

/** @deprecated Resend removed; sending is Gmail-only. Kept for backwards compatibility with settings page. */
export function isResendConfigured(): boolean {
	return false;
}

/** @deprecated Resend removed. Kept for backwards compatibility with settings page. */
export function getResendFromDisplay(): { configured: true; from: string } | { configured: false } {
	return { configured: false };
}

export function isTwilioConfigured(): boolean {
	const { accountSid, authToken, fromNumber } = getTwilioConfig();
	return !!(accountSid && authToken && fromNumber);
}
