/**
 * Centralized toast API for the dashboard.
 * Use this instead of importing from 'svelte-sonner' so all success/error
 * feedback is consistent (shadcn/sonner toasts).
 */
import { toast as sonnerToast } from 'svelte-sonner';

export const toast = sonnerToast;

export type FormWithMessage =
	| { message?: string; success?: boolean; [key: string]: unknown }
	| undefined;

/**
 * Show success or error toast from a form action result.
 * Call inside $effect(() => showFormToast(form)) so it runs when form updates.
 */
export function showFormToast(form: FormWithMessage): void {
	if (!form?.message) return;
	if (form.success) {
		toast.success(form.message);
	} else {
		toast.error(form.message);
	}
}
