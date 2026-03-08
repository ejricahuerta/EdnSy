/**
 * Single status system: app statuses (demo workflow + synced CRM).
 * CRM statuses are mapped to app display on sync; one "Status" column everywhere.
 */

export type StatusVariant = 'default' | 'warning' | 'success' | 'muted';

export interface StatusDisplay {
	label: string;
	variant: StatusVariant;
}

/**
 * App canonical statuses (prospects.status from CRM sync).
 * Used when there is no demo_tracking row or for display in the Status column.
 */
const APP_STATUS_TO_DISPLAY: Record<string, StatusDisplay> = {
	Prospect: { label: 'Not contacted', variant: 'default' },
	New: { label: 'New', variant: 'default' },
	'In queue': { label: 'Processing…', variant: 'warning' },
	'Generate Demo': { label: 'Needs demo', variant: 'warning' },
	'Demo Created': { label: 'Ready to send', variant: 'success' },
	'Demo Sent': { label: 'Demo sent', variant: 'muted' },
	Converting: { label: 'Engaged', variant: 'success' },
	Contacted: { label: 'Demo sent', variant: 'muted' },
	Complete: { label: 'Closed', variant: 'muted' },
	Flagged: { label: 'Out of scope', variant: 'muted' }
};

/**
 * Map provider/CRM status to app canonical status (for storage on sync).
 * Use when syncing from Notion, HubSpot, GoHighLevel, Pipedrive so one Status column is consistent.
 */
export function mapProviderStatusToApp(providerStatus: string): string {
	const raw = (providerStatus ?? '').trim();
	if (!raw) return 'Prospect';
	const lower = raw.toLowerCase();
	// Not contacted / early stage
	if (lower === 'new') return 'New';
	if (lower === 'prospect' || lower === 'lead' || lower === 'not contacted') return 'Prospect';
	if (lower === 'generate demo' || lower === 'follow up needed') return 'Generate Demo';
	// Ready to send (has demo or similar)
	if (lower === 'demo created' || lower === 'ready to send') return 'Demo Created';
	// Already sent / later stage
	if (lower === 'demo sent' || lower === 'contacted' || lower === 'sent') return 'Demo Sent';
	if (lower === 'converting' || lower === 'replied') return 'Converting';
	if (lower === 'complete' || lower === 'closed') return 'Complete';
	// Fallback: use known key if exact match
	return APP_STATUS_TO_DISPLAY[raw] ? raw : 'Prospect';
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
