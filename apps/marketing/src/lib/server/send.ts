import { Resend } from 'resend';
import twilio from 'twilio';
import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import { LEGAL_COMPANY_NAME, LEGAL_COMPANY_ADDRESS } from '$lib/constants';

/** Default (dev): Resend sandbox. Prod: set RESEND_FROM_EMAIL=leadrosetta@ednsy.com, RESEND_FROM_NAME=Lead Rosetta. */
const RESEND_DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';
const RESEND_DEFAULT_FROM_NAME = 'Lead Rosetta';

function getResendConfig() {
	const apiKey = env.RESEND_API_KEY;
	const fromEmail = env.RESEND_FROM_EMAIL ?? RESEND_DEFAULT_FROM_EMAIL;
	const fromName = env.RESEND_FROM_NAME ?? RESEND_DEFAULT_FROM_NAME;
	return { apiKey, from: `${fromName} <${fromEmail}>` };
}

function getTwilioConfig() {
	const accountSid = env.TWILIO_ACCOUNT_SID;
	const authToken = env.TWILIO_AUTH_TOKEN;
	const fromNumber = env.TWILIO_PHONE_NUMBER;
	return { accountSid, authToken, fromNumber };
}

/** Default email subject per PRD (fallback when AI is not used). */
export function getDefaultEmailSubject(companyName: string): string {
	return `I built something for ${companyName}`;
}

/**
 * Build email HTML from AI-generated body intro (plain text paragraphs). Appends trackable link,
 * signature, legal footer, and open pixel. Tracking is active: link goes to /api/demo/click, pixel to /api/demo/open.
 */
export function buildEmailBodyFromAiIntro(
	prospect: Prospect,
	demoLink: string,
	senderName: string,
	origin: string,
	bodyIntro: string
): string {
	const trackableLink = `${origin}/api/demo/click?p=${encodeURIComponent(prospect.id)}`;
	const pixelUrl = `${origin}/api/demo/open?p=${encodeURIComponent(prospect.id)}`;
	const paragraphs = bodyIntro
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => `<p>${escapeHtml(p)}</p>`)
		.join('\n');
	const html = `
${paragraphs}
<p><a href="${trackableLink}">View your demo</a></p>
<p>${trackableLink}</p>
<p>— ${escapeHtml(senderName)}</p>
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">You received this message because someone used Lead Rosetta to send you a personalized demo. To unsubscribe from future messages from this sender, reply with "Unsubscribe" or "STOP".</p>
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
`.trim();
	return html;
}

/**
 * Build email HTML with trackable link and open pixel. Tracking is active: link = /api/demo/click, pixel = /api/demo/open.
 * origin: e.g. https://app.example.com (for /api/demo/click and /api/demo/open).
 */
export function buildEmailBody(
	prospect: Prospect,
	demoLink: string,
	senderName: string,
	origin: string
): string {
	const company = prospect.companyName || 'your business';
	const trackableLink = `${origin}/api/demo/click?p=${encodeURIComponent(prospect.id)}`;
	const pixelUrl = `${origin}/api/demo/open?p=${encodeURIComponent(prospect.id)}`;
	const html = `
<p>Hi${prospect.companyName ? ` from ${company}` : ''},</p>
<p>I built a free website demo for ${company}. Take 30 seconds to see it:</p>
<p><a href="${trackableLink}">View your demo</a></p>
<p>${trackableLink}</p>
<p>— ${senderName}</p>
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">You received this message because someone used Lead Rosetta to send you a personalized demo. To unsubscribe from future messages from this sender, reply with "Unsubscribe" or "STOP".</p>
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
<img src="${pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />
`.trim();
	return html;
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
	const footer = `
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">You received this message because someone used Lead Rosetta to send you a personalized demo. To unsubscribe from future messages from this sender, reply with "Unsubscribe" or "STOP".</p>
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
<img src="${vars.pixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
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

/** Default SMS body per PRD. First name not in schema; use company or "there". CASL: opt-out. */
export function buildSmsBody(prospect: Prospect, demoLink: string, senderName: string): string {
	const company = prospect.companyName || 'your business';
	return `Hey there — I built a free website demo for ${company}. 30 seconds to see it: ${demoLink} — ${senderName}. Reply STOP to opt out.`;
}

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };
export type SendSmsResult = { ok: true; sid?: string } | { ok: false; error: string };

export async function sendEmail(
	to: string,
	subject: string,
	html: string
): Promise<SendEmailResult> {
	const { apiKey, from } = getResendConfig();
	if (!apiKey) return { ok: false, error: 'Resend not configured (RESEND_API_KEY)' };
	try {
		const resend = new Resend(apiKey);
		const { data, error } = await resend.emails.send({
			from,
			to: [to],
			subject,
			html
		});
		if (error) return { ok: false, error: error.message };
		return { ok: true, id: data?.id };
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return { ok: false, error: message };
	}
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

export function isResendConfigured(): boolean {
	return !!getResendConfig().apiKey;
}

export function isTwilioConfigured(): boolean {
	const { accountSid, authToken, fromNumber } = getTwilioConfig();
	return !!(accountSid && authToken && fromNumber);
}
