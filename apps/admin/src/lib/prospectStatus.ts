/**
 * Values persisted on `prospects.status` (Supabase / CRM sync). Intended lifecycle (display labels):
 *
 * New → GBP Queued → Processing GBP → Pending Demo → Demo Queued → Processing Demo → Review →
 * Demo Sent → Demo Opened → Follow-up
 *
 * Live job rows override labels (e.g. Processing GBP while GBP/insights jobs run). See getSimplifiedStatus.
 */
export const PROSPECT_STATUS = {
	NEW: 'new',
	GBP_QUEUED: 'gbp queued',
	DEMO_PENDING: 'demo pending',
	DEMO_QUEUED: 'demo queued',
	REVIEW: 'review',
	READY_TO_SEND: 'ready to send',
	EMAIL_SENT: 'email sent',
	DEMO_OPENED: 'demo opened',
	FOLLOW_UP: 'follow-up'
} as const;

export type ProspectStatusValue = (typeof PROSPECT_STATUS)[keyof typeof PROSPECT_STATUS];

/** Reset / error fallback */
export const PROSPECT_STATUS_RESET = PROSPECT_STATUS.NEW;

/** True when status means "queued for automation" (pull or demo). Includes legacy `In queue`. */
export function isProspectQueuedStatus(status: string | null | undefined): boolean {
	const s = (status ?? '').trim().toLowerCase();
	if (s === 'in queue') return true;
	return s === PROSPECT_STATUS.GBP_QUEUED.toLowerCase() || s === PROSPECT_STATUS.DEMO_QUEUED.toLowerCase();
}
