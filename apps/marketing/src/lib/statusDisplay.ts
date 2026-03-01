/**
 * Maps Notion status values to LeadRosetta display labels and badge variants.
 * Notion values are unchanged; only UI display is mapped.
 */

export type StatusVariant = 'default' | 'warning' | 'success' | 'muted';

export interface StatusDisplay {
	label: string;
	variant: StatusVariant;
}

const NOTION_TO_DISPLAY: Record<string, StatusDisplay> = {
	Prospect: { label: 'Not contacted yet', variant: 'default' },
	'Generate Demo': { label: 'Follow up needed', variant: 'warning' },
	'Demo Created': { label: 'Ready to send', variant: 'success' },
	'Demo Sent': { label: 'Demo sent', variant: 'muted' },
	Converting: { label: 'Converting', variant: 'success' },
	Contacted: { label: 'Demo sent', variant: 'muted' },
	Complete: { label: 'Ready to send', variant: 'success' }
};

/**
 * Get display label and badge variant for a Notion status.
 * Unknown statuses get a default display (label = raw value, variant = default).
 */
export function getStatusDisplay(notionStatus: string): StatusDisplay {
	const normalized = notionStatus?.trim() || '';
	return NOTION_TO_DISPLAY[normalized] ?? { label: normalized || 'Not contacted yet', variant: 'default' };
}

/**
 * Transient "Building..." state is handled in the UI when generatingDemoFor === id.
 * This returns the display for the persisted Notion status only.
 */
export function getStatusLabel(notionStatus: string): string {
	return getStatusDisplay(notionStatus).label;
}

export function getStatusVariant(notionStatus: string): StatusVariant {
	return getStatusDisplay(notionStatus).variant;
}
