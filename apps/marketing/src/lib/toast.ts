/**
 * Toast notifications for dashboard actions.
 * Title = action name, description = prospect (if any) or success/error message.
 */
import { toast as sonnerToast } from 'svelte-sonner';

type ToastDescription = string | undefined | null;

export type ToastAction = {
	label: string;
	onClick: () => void;
};

function descriptionStr(value: ToastDescription): string {
	if (value == null || value === '') return '';
	return String(value).trim();
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
	action?: ToastAction
): void {
	sonnerToast.success(title, {
		description: descriptionStr(description) || undefined,
		...(action && { action: { label: action.label, onClick: action.onClick } })
	});
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
	action?: ToastAction
): void {
	sonnerToast.error(title, {
		description: descriptionStr(description) || undefined,
		...(action && { action: { label: action.label, onClick: action.onClick } })
	});
}

/**
 * Show an info toast.
 */
export function toastInfo(title: string, description?: ToastDescription): void {
	sonnerToast.info(title, {
		description: descriptionStr(description) || undefined
	});
}

/**
 * Show a warning toast.
 */
export function toastWarning(title: string, description?: ToastDescription): void {
	sonnerToast.warning(title, {
		description: descriptionStr(description) || undefined
	});
}

/**
 * Show toast based on form action result.
 * Use in enhance() callback: if result.type === 'success' and result.data?.success, success; else if result.type === 'failure', error with result.data?.message.
 */
export function toastFromActionResult(
	actionLabel: string,
	result: { type: 'success' | 'failure'; data?: { success?: boolean; message?: string } },
	successDescription?: string
): void {
	if (result.type === 'success' && result.data?.success !== false) {
		toastSuccess(actionLabel, successDescription ?? 'Done.');
	} else if (result.type === 'failure' && result.data) {
		const msg = typeof result.data.message === 'string' ? result.data.message : 'Something went wrong.';
		toastError(actionLabel, msg);
	}
}
