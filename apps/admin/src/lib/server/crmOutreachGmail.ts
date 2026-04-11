/**
 * Persist Gmail CRM outreach drafts and send via drafts.send (shared by prospect detail and bulk actions).
 */

import type { Prospect } from '$lib/server/prospects';
import { createDraftViaGmail, sendDraftViaGmail, deleteDraftViaGmail } from '$lib/server/gmail';
import { updateProspectGmailOutreachDraft, type GmailOutreachDraftKind } from '$lib/server/prospects';
import {
	updateDemoTrackingStatus,
	recordDemoEvent,
	GMAIL_OUTREACH_EVENT_DRAFT_CREATED,
	GMAIL_OUTREACH_EVENT_SENT,
	GMAIL_OUTREACH_EVENT_DRAFT_EXPIRED,
	getDemoTrackingForProspectLatest
} from '$lib/server/supabase';
import { getEffectiveEmailSenderName } from '$lib/server/userSettings';
import { prepareCrmOutreachEmail, type CrmOutreachKind } from '$lib/server/crmOutreachEmail';

const OUTREACH_DRAFT_MAX_SUBJECT_CHARS = 500;
const OUTREACH_DRAFT_MAX_HTML_CHARS = 2_000_000;

/**
 * Optional subject + HTML from the review dialog. When omitted (e.g. bulk draft create), content is generated server-side only.
 */
export function parseOutreachDraftOverridesFromForm(formData: FormData):
	| { ok: true; overrides: { subject: string; html: string } }
	| { ok: true; overrides: undefined }
	| { ok: false; error: string } {
	if (!formData.has('outreachSubject') && !formData.has('outreachHtml')) {
		return { ok: true, overrides: undefined };
	}
	if (!formData.has('outreachSubject') || !formData.has('outreachHtml')) {
		return { ok: false, error: 'Invalid outreach form.' };
	}
	const subject = String(formData.get('outreachSubject') ?? '').trim();
	const html = String(formData.get('outreachHtml') ?? '').trim();
	if (!subject) {
		return { ok: false, error: 'Subject cannot be empty.' };
	}
	if (!html) {
		return { ok: false, error: 'Email body cannot be empty.' };
	}
	if (subject.length > OUTREACH_DRAFT_MAX_SUBJECT_CHARS) {
		return {
			ok: false,
			error: `Subject must be at most ${OUTREACH_DRAFT_MAX_SUBJECT_CHARS} characters.`
		};
	}
	if (html.length > OUTREACH_DRAFT_MAX_HTML_CHARS) {
		return { ok: false, error: 'Email body is too large.' };
	}
	return { ok: true, overrides: { subject, html } };
}

export async function executeCreateGmailOutreachDraft(params: {
	userId: string;
	appUserEmail: string | null;
	prospect: Prospect;
	prospectId: string;
	kind: CrmOutreachKind;
	linkOrigin: string;
	/** When true, set demo_tracking to email_draft after success (demo outreach only). */
	setDemoTrackingEmailDraft: boolean;
	/** From review dialog: user-edited subject and HTML body. */
	draftOverrides?: { subject: string; html: string };
}): Promise<{ ok: true; draftId: string } | { ok: false; error: string }> {
	const {
		userId,
		appUserEmail,
		prospect,
		prospectId,
		kind,
		linkOrigin,
		setDemoTrackingEmailDraft,
		draftOverrides
	} = params;

	const prepared = await prepareCrmOutreachEmail({
		kind,
		prospect,
		userId,
		appUserEmail,
		linkOrigin
	});
	if (!prepared.ok) return { ok: false, error: prepared.error };

	const subject = draftOverrides?.subject ?? prepared.subject;
	const html = draftOverrides?.html ?? prepared.html;

	const fromName = await getEffectiveEmailSenderName(userId, appUserEmail);

	const existingDraft = prospect.gmailOutreachDraftId?.trim();
	if (existingDraft) {
		await deleteDraftViaGmail(userId, existingDraft);
	}

	const draftRes = await createDraftViaGmail(
		userId,
		prepared.effectiveTo,
		subject,
		html,
		fromName
	);
	if (!draftRes.ok) return { ok: false, error: draftRes.error };

	const draftKindDb: GmailOutreachDraftKind = kind === 'alternate' ? 'alternate' : 'demo';
	const persist = await updateProspectGmailOutreachDraft(prospectId, {
		draftId: draftRes.draftId,
		kind: draftKindDb
	});
	if (!persist.ok) return { ok: false, error: persist.error ?? 'Failed to save draft id' };

	if (setDemoTrackingEmailDraft && kind === 'demo') {
		await updateDemoTrackingStatus(prospectId, { status: 'email_draft' });
	}

	await recordDemoEvent(prospectId, GMAIL_OUTREACH_EVENT_DRAFT_CREATED, {
		subject,
		kind,
		gmailDraftId: draftRes.draftId,
		...(draftRes.messageId ? { gmailMessageId: draftRes.messageId } : {})
	});

	return { ok: true, draftId: draftRes.draftId };
}

export async function executeSendGmailOutreachDraft(params: {
	userId: string;
	prospect: Prospect;
	prospectId: string;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
	const { userId, prospect, prospectId } = params;
	const draftId = prospect.gmailOutreachDraftId?.trim();
	if (!draftId) {
		return { ok: false, error: 'No Gmail draft on file. Create a draft first.' };
	}

	const sendRes = await sendDraftViaGmail(userId, draftId);
	if (!sendRes.ok) {
		await revertStaleDraft(userId, prospectId, prospect.gmailOutreachDraftKind);
		return { ok: false, error: sendRes.error };
	}

	const clear = await updateProspectGmailOutreachDraft(prospectId, { clear: true });
	if (!clear.ok) return { ok: false, error: clear.error ?? 'Failed to clear draft metadata' };

	const kind = prospect.gmailOutreachDraftKind;
	if (kind === 'demo') {
		const demoTracking = await getDemoTrackingForProspectLatest(prospectId);
		if (demoTracking) {
			await updateDemoTrackingStatus(prospectId, { status: 'sent' });
		}
	}

	await recordDemoEvent(prospectId, GMAIL_OUTREACH_EVENT_SENT, {
		gmailMessageId: sendRes.id,
		kind: kind ?? 'alternate'
	});

	return { ok: true, messageId: sendRes.id };
}

/**
 * When drafts.send fails (draft deleted or already sent from Gmail), clear the stale
 * draft columns and revert demo_tracking from email_draft back to approved so the user
 * can create a fresh draft.
 */
async function revertStaleDraft(
	userId: string,
	prospectId: string,
	kind: GmailOutreachDraftKind | undefined
): Promise<void> {
	await updateProspectGmailOutreachDraft(prospectId, { clear: true });
	if (kind === 'demo') {
		const demoTracking = await getDemoTrackingForProspectLatest(prospectId);
		if (demoTracking?.status === 'email_draft') {
			await updateDemoTrackingStatus(prospectId, { status: 'approved' });
		}
	}
	await recordDemoEvent(prospectId, GMAIL_OUTREACH_EVENT_DRAFT_EXPIRED, {
		kind: kind ?? 'alternate',
		reason: 'Draft was deleted or already sent from Gmail'
	});
}
