import { writable } from 'svelte/store';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export type NotificationHistoryEntry = {
	id: string;
	at: number;
	kind: NotificationKind;
	/** One line for the activity list */
	text: string;
};

const MAX_ITEMS = 100;

export const notificationHistory = writable<NotificationHistoryEntry[]>([]);

/**
 * Resolves prospect id to a display name for job toasts. List/detail pages set this while mounted;
 * default is a short id so the dashboard realtime listener still works elsewhere.
 */
export const prospectJobLabelResolver = writable<(id: string) => string>((id) => id.slice(0, 8));

function newId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Append a line to the dashboard activity feed (newest first). */
export function appendDashboardNotification(entry: { kind: NotificationKind; text: string }): void {
	const text = entry.text.trim();
	if (!text) return;
	notificationHistory.update((list) =>
		[{ id: newId(), at: Date.now(), kind: entry.kind, text }, ...list].slice(0, MAX_ITEMS)
	);
}

export function clearDashboardNotificationHistory(): void {
	notificationHistory.set([]);
}
