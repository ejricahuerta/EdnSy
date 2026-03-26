/**
 * Human-facing labels for persisted `prospects.status` (see PROSPECT_STATUS).
 * CRM import uses `mapProviderStatusToApp`; the Status column also layers demo_tracking + jobs via getSimplifiedStatus.
 */

import { PROSPECT_STATUS } from '$lib/prospectStatus';

export type StatusVariant = 'default' | 'warning' | 'success' | 'muted';

export interface StatusDisplay {
	label: string;
	variant: StatusVariant;
}

/**
 * Display map for each canonical stored status string (case-sensitive keys match DB values).
 */
const APP_STATUS_TO_DISPLAY: Record<string, StatusDisplay> = {
	[PROSPECT_STATUS.NEW]: { label: 'New', variant: 'default' },
	[PROSPECT_STATUS.GBP_QUEUED]: { label: 'GBP Queued', variant: 'warning' },
	[PROSPECT_STATUS.DEMO_PENDING]: { label: 'Pending Demo', variant: 'warning' },
	[PROSPECT_STATUS.DEMO_QUEUED]: { label: 'Demo Queued', variant: 'warning' },
	[PROSPECT_STATUS.REVIEW]: { label: 'Ready to send', variant: 'success' },
	[PROSPECT_STATUS.READY_TO_SEND]: { label: 'Ready to send', variant: 'success' },
	[PROSPECT_STATUS.EMAIL_SENT]: { label: 'Demo Sent', variant: 'muted' },
	[PROSPECT_STATUS.DEMO_OPENED]: { label: 'Demo Opened', variant: 'success' },
	[PROSPECT_STATUS.FOLLOW_UP]: { label: 'Follow-up', variant: 'muted' },
	// Legacy CRM / migration
	Prospect: { label: 'Not contacted', variant: 'default' },
	New: { label: 'New', variant: 'default' },
	'In queue': { label: 'GBP Queued', variant: 'warning' },
	'Generate Demo': { label: 'Pending Demo', variant: 'warning' },
	'Demo Created': { label: 'Ready to send', variant: 'success' },
	'Demo Sent': { label: 'Demo Sent', variant: 'muted' },
	Converting: { label: 'Demo Opened', variant: 'success' },
	Contacted: { label: 'Demo Sent', variant: 'muted' },
	Complete: { label: 'Follow-up', variant: 'muted' },
	Flagged: { label: 'Out of scope', variant: 'muted' }
};

/**
 * Map provider/CRM status to app canonical status (for storage on sync).
 * Use when syncing from Notion, HubSpot, GoHighLevel, Pipedrive so one Status column is consistent.
 */
export function mapProviderStatusToApp(providerStatus: string): string {
	const raw = (providerStatus ?? '').trim();
	if (!raw) return PROSPECT_STATUS.NEW;
	const lower = raw.toLowerCase();
	if (lower === 'new') return PROSPECT_STATUS.NEW;
	if (lower === 'prospect' || lower === 'lead' || lower === 'not contacted') return PROSPECT_STATUS.NEW;
	if (lower === 'generate demo' || lower === 'follow up needed' || lower === 'demo pending')
		return PROSPECT_STATUS.DEMO_PENDING;
	if (lower === 'ready to send') return PROSPECT_STATUS.READY_TO_SEND;
	if (lower === 'demo created' || lower === 'review') return PROSPECT_STATUS.REVIEW;
	if (lower === 'demo sent' || lower === 'contacted' || lower === 'sent' || lower === 'email sent')
		return PROSPECT_STATUS.EMAIL_SENT;
	if (lower === 'converting' || lower === 'replied' || lower === 'demo opened') return PROSPECT_STATUS.DEMO_OPENED;
	if (lower === 'complete' || lower === 'closed') return PROSPECT_STATUS.FOLLOW_UP;
	if (lower === 'gbp queued' || lower === 'in queue') return PROSPECT_STATUS.GBP_QUEUED;
	if (lower === 'demo queued') return PROSPECT_STATUS.DEMO_QUEUED;
	return APP_STATUS_TO_DISPLAY[raw] ? raw : PROSPECT_STATUS.NEW;
}

/**
 * Get display label and badge variant for an app/canonical status.
 * Unknown statuses get default display (label = raw value, variant = default).
 */
export function getStatusDisplay(status: string): StatusDisplay {
	const normalized = status?.trim() || '';
	return APP_STATUS_TO_DISPLAY[normalized] ?? { label: normalized || 'Not contacted yet', variant: 'default' };
}

/**
 * Transient "Building..." state is handled in the UI when generatingDemoFor === id.
 * This returns the display for the persisted status only.
 */
export function getStatusLabel(status: string): string {
	return getStatusDisplay(status).label;
}

export function getStatusVariant(status: string): StatusVariant {
	return getStatusDisplay(status).variant;
}
