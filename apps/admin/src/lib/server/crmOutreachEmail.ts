/**
 * Shared CRM outreach email body generation (demo + alternate) for preview, Gmail drafts, and bulk draft create.
 */

import type { Prospect } from '$lib/server/prospects';
import { getEffectiveEmailSenderName, getEmailSignatureOverride } from '$lib/server/userSettings';
import { getTemplates } from '$lib/server/templates';
import { generateEmailCopy } from '$lib/server/generateEmailCopy';
import {
	resolveDemoOutreachEmail,
	buildEmailBodyAlternateOffer,
	getAlternateOfferSubject,
	resolveOutboundEmailRecipient
} from '$lib/server/send';

export type CrmOutreachKind = 'demo' | 'alternate';

export type PreparedCrmOutreach =
	| {
			ok: true;
			kind: CrmOutreachKind;
			subject: string;
			html: string;
			effectiveTo: string;
			originalTo: string;
			devRedirect: boolean;
	  }
	| { ok: false; error: string };

export async function prepareCrmOutreachEmail(params: {
	kind: CrmOutreachKind;
	prospect: Prospect;
	userId: string;
	appUserEmail: string | null;
	linkOrigin: string;
}): Promise<PreparedCrmOutreach> {
	const { kind, prospect, userId, appUserEmail, linkOrigin } = params;
	const emailTrim = (prospect.email ?? '').trim();
	if (!emailTrim) {
		return { ok: false, error: 'No email address for this prospect.' };
	}

	const { effectiveTo, originalTo, devRedirect } = resolveOutboundEmailRecipient(emailTrim);

	if (kind === 'alternate') {
		const senderName = await getEffectiveEmailSenderName(userId, appUserEmail);
		const subject = getAlternateOfferSubject(prospect.companyName || 'your business');
		const html = buildEmailBodyAlternateOffer(prospect, senderName, linkOrigin);
		return { ok: true, kind, subject, html, effectiveTo, originalTo, devRedirect };
	}

	const [senderName, emailSignatureOverride] = await Promise.all([
		getEffectiveEmailSenderName(userId, appUserEmail),
		getEmailSignatureOverride(userId)
	]);
	const templates = await getTemplates(userId);
	const ai = await generateEmailCopy(prospect, senderName, userId);
	const resolved = resolveDemoOutreachEmail(
		prospect,
		senderName,
		linkOrigin,
		templates.emailHtml,
		emailSignatureOverride,
		ai
	);
	if ('error' in resolved) {
		return { ok: false, error: resolved.error };
	}
	return {
		ok: true,
		kind: 'demo',
		subject: resolved.subject,
		html: resolved.html,
		effectiveTo,
		originalTo,
		devRedirect
	};
}
