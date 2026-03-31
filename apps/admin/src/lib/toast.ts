/**
 * Toast notifications for dashboard actions.
 * Title = action name, description = prospect (if any) or success/error message.
 */
import { toast as sonnerToast } from 'svelte-sonner';
import { appendDashboardNotification, type NotificationKind } from '$lib/notificationHistory';

type ToastDescription = string | undefined | null;

export type ToastAction = {
	label: string;
	onClick: () => void;
};

export type ToastHistoryOptions = {
	/** When true, do not append to the dashboard activity bell. */
	skipHistory?: boolean;
	/**
	 * Client-focused one line for the bell only (who + what happened). If omitted, nothing is
	 * added unless you use `toastFromActionResult`, which sets a sensible default from the success message.
	 */
	activity?: string;
};

function descriptionStr(value: ToastDescription): string {
	if (value == null || value === '') return '';
	return String(value).trim();
}

function recordHistory(kind: NotificationKind, opts?: ToastHistoryOptions) {
	if (opts?.skipHistory) return;
	const text = opts?.activity?.trim();
	if (!text) return;
	appendDashboardNotification({ kind, text });
}

/**
 * Show a success toast.
 * @param title - Action name (e.g. "Template saved", "Client removed").
 * @param description - Prospect identifier or success message (e.g. company name, or "Settings saved").
 * @param action - Optional button (e.g. { label: 'View', onClick: () => goto(...) }) to open details.
 */
export function toastSuccess(
	title: string,
	description?: ToastDescription,
	action?: ToastAction,
	opts?: ToastHistoryOptions
): void {
	sonnerToast.success(title, {
		description: descriptionStr(description) || undefined,
		...(action && { action: { label: action.label, onClick: action.onClick } })
	});
	recordHistory('success', opts);
}

/**
 * Show an error toast.
 * @param title - Action name (e.g. "Save failed", "Remove client").
 * @param description - Error message or prospect context.
 * @param action - Optional button (e.g. { label: 'View', onClick: () => goto(...) }) to open details.
 */
export function toastError(
	title: string,
	description?: ToastDescription,
	action?: ToastAction,
	opts?: ToastHistoryOptions
): void {
	sonnerToast.error(title, {
		description: descriptionStr(description) || undefined,
		...(action && { action: { label: action.label, onClick: action.onClick } })
	});
	recordHistory('error', opts);
}

/**
 * Show an info toast.
 */
export function toastInfo(
	title: string,
	description?: ToastDescription,
	opts?: ToastHistoryOptions
): void {
	sonnerToast.info(title, {
		description: descriptionStr(description) || undefined
	});
	recordHistory('info', opts);
}

/**
 * Show a warning toast.
 */
export function toastWarning(
	title: string,
	description?: ToastDescription,
	opts?: ToastHistoryOptions
): void {
	sonnerToast.warning(title, {
		description: descriptionStr(description) || undefined
	});
	recordHistory('warning', opts);
}

/**
 * Show toast based on form action result.
 * Use in enhance() callback: if result.type === 'success' and result.data?.success, success; else if result.type === 'failure', error with result.data?.message.
 * Bell: uses `opts.activity` when set; otherwise success uses `successDescription` (short), failure uses `actionLabel` + error snippet.
 */
export function toastFromActionResult(
	actionLabel: string,
	result: { type: 'success' | 'failure'; data?: { success?: boolean; message?: string } },
	successDescription?: string,
	opts?: ToastHistoryOptions
): void {
	if (result.type === 'success' && result.data?.success !== false) {
		const desc = successDescription ?? 'Done.';
		const activity =
			opts?.activity ??
			(descriptionStr(desc) ? descriptionStr(desc) : `${actionLabel} — Done.`);
		toastSuccess(actionLabel, desc, undefined, { ...opts, activity });
	} else if (result.type === 'failure' && result.data) {
		const msg = typeof result.data.message === 'string' ? result.data.message : 'Something went wrong.';
		const activity =
			opts?.activity ??
			`${actionLabel} — ${msg.length > 120 ? `${msg.slice(0, 117)}…` : msg}`;
		toastError(actionLabel, msg, undefined, { ...opts, activity });
	}
}
