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
	getDemoTrackingForProspect
} from '$lib/server/supabase';
import { getEffectiveEmailSenderName } from '$lib/server/userSettings';
import { prepareCrmOutreachEmail, type CrmOutreachKind } from '$lib/server/crmOutreachEmail';

export async function executeCreateGmailOutreachDraft(params: {
	userId: string;
	appUserEmail: string | null;
	prospect: Prospect;
	prospectId: string;
	kind: CrmOutreachKind;
	linkOrigin: string;
	/** When true, set demo_tracking to email_draft after success (demo outreach only). */
	setDemoTrackingEmailDraft: boolean;
}): Promise<{ ok: true; draftId: string } | { ok: false; error: string }> {
	const {
		userId,
		appUserEmail,
		prospect,
		prospectId,
		kind,
		linkOrigin,
		setDemoTrackingEmailDraft
	} = params;

	const prepared = await prepareCrmOutreachEmail({
		kind,
		prospect,
		userId,
		appUserEmail,
		linkOrigin
	});
	if (!prepared.ok) return { ok: false, error: prepared.error };

	const fromName = await getEffectiveEmailSenderName(userId, appUserEmail);

	const existingDraft = prospect.gmailOutreachDraftId?.trim();
	if (existingDraft) {
		await deleteDraftViaGmail(userId, existingDraft);
	}

	const draftRes = await createDraftViaGmail(
		userId,
		prepared.effectiveTo,
		prepared.subject,
		prepared.html,
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
		await updateDemoTrackingStatus(userId, prospectId, { status: 'email_draft' });
	}

	await recordDemoEvent(prospectId, GMAIL_OUTREACH_EVENT_DRAFT_CREATED, {
		subject: prepared.subject,
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
		const demoTracking = await getDemoTrackingForProspect(userId, prospectId);
		if (demoTracking) {
			await updateDemoTrackingStatus(userId, prospectId, { status: 'sent' });
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
		const demoTracking = await getDemoTrackingForProspect(userId, prospectId);
		if (demoTracking?.status === 'email_draft') {
			await updateDemoTrackingStatus(userId, prospectId, { status: 'approved' });
		}
	}
	await recordDemoEvent(prospectId, GMAIL_OUTREACH_EVENT_DRAFT_EXPIRED, {
		kind: kind ?? 'alternate',
		reason: 'Draft was deleted or already sent from Gmail'
	});
}
