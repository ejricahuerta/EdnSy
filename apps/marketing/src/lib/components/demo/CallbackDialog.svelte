<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { trackDemoEvent } from '$lib/demoTracking';
	import { Phone, X, Loader2 } from 'lucide-svelte';

	let {
		open = false,
		prospectId = '',
		termsUrl = '/terms',
		onClose = () => {}
	}: {
		open?: boolean;
		prospectId?: string;
		termsUrl?: string;
		onClose?: () => void;
	} = $props();

	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let agreeToTerms = $state(false);
	let submitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		if (prospectId) trackDemoEvent(prospectId, 'callback_submitted');
		submitting = true;
		try {
			const res = await fetch('/api/demo/callback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstName: firstName.trim(),
					lastName: lastName.trim() || undefined,
					phone: phone.trim(),
					agreeToTerms
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				if (prospectId) {
					trackDemoEvent(prospectId, 'callback_error', {
						code: (data as { code?: string }).code,
						status: res.status
					});
				}
				toast.error((data as { error?: string }).error ?? 'Something went wrong. Try again.');
				return;
			}
			if (prospectId) trackDemoEvent(prospectId, 'callback_success');
			toast.success((data as { message?: string }).message ?? "We'll call you shortly.");
			firstName = '';
			lastName = '';
			phone = '';
			agreeToTerms = false;
			onClose();
		} finally {
			submitting = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).getAttribute('data-callback-backdrop') === 'true') {
			onClose();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		data-callback-backdrop="true"
		role="dialog"
		aria-modal="true"
		aria-labelledby="callback-dialog-title"
		class="callback-dialog-backdrop"
		onclick={handleBackdropClick}
	>
		<div class="callback-dialog-panel" onclick={(e) => e.stopPropagation()}>
			<div class="callback-dialog-header">
				<h2 id="callback-dialog-title" class="callback-dialog-title">
					<Phone class="w-5 h-5" aria-hidden="true" />
					Request a call
				</h2>
				<button
					type="button"
					class="callback-dialog-close"
					onclick={onClose}
					aria-label="Close"
				>
					<X class="w-5 h-5" />
				</button>
			</div>
			<form onsubmit={handleSubmit} class="callback-dialog-form">
				<div class="callback-dialog-field">
					<label for="callback-first">First name</label>
					<input
						id="callback-first"
						type="text"
						class="callback-dialog-input"
						placeholder="First name"
						bind:value={firstName}
						required
						disabled={submitting}
					/>
				</div>
				<div class="callback-dialog-field">
					<label for="callback-last">Last name</label>
					<input
						id="callback-last"
						type="text"
						class="callback-dialog-input"
						placeholder="Last name"
						bind:value={lastName}
						disabled={submitting}
					/>
				</div>
				<div class="callback-dialog-field">
					<label for="callback-phone">Phone number</label>
					<input
						id="callback-phone"
						type="tel"
						class="callback-dialog-input"
						placeholder="+1 (555) 123-4567"
						bind:value={phone}
						required
						disabled={submitting}
					/>
				</div>
				<label class="callback-dialog-checkbox-wrap">
					<input
						type="checkbox"
						class="callback-dialog-checkbox"
						bind:checked={agreeToTerms}
						disabled={submitting}
					/>
					<span class="callback-dialog-checkbox-label">
						I agree to the
						<a href={termsUrl} target="_blank" rel="noopener noreferrer" class="callback-dialog-link">terms and conditions</a>
						and consent to be contacted.
					</span>
				</label>
				<div class="callback-dialog-actions">
					<button
						type="button"
						class="callback-dialog-btn callback-dialog-btn-cancel"
						onclick={onClose}
						disabled={submitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="callback-dialog-btn callback-dialog-btn-submit"
						disabled={submitting || !firstName.trim() || !phone.trim() || !agreeToTerms}
					>
						{#if submitting}
							<Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
							Requesting…
						{:else}
							<Phone class="w-4 h-4" aria-hidden="true" />
							Request call
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.callback-dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.5);
	}
	.callback-dialog-panel {
		width: 100%;
		max-width: 24rem;
		background: var(--color-base-100, #1c1917);
		border: 1px solid var(--color-base-300, #44403c);
		border-radius: 1rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	.callback-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-base-300, #44403c);
		background: var(--color-base-200, #292524);
	}
	.callback-dialog-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-base-content, #e7e5e4);
		margin: 0;
	}
	.callback-dialog-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		border-radius: 0.375rem;
		background: transparent;
		color: var(--color-base-content, #e7e5e4);
		cursor: pointer;
		transition: background 0.15s;
	}
	.callback-dialog-close:hover {
		background: var(--color-base-300, #44403c);
	}
	.callback-dialog-form {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.callback-dialog-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.callback-dialog-field label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-base-content, #e7e5e4);
	}
	.callback-dialog-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-base-300, #44403c);
		background: var(--color-base-200, #292524);
		color: var(--color-base-content, #e7e5e4);
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.callback-dialog-input::placeholder {
		opacity: 0.5;
	}
	.callback-dialog-input:focus {
		outline: none;
		border-color: var(--color-primary, #2D6A4F);
		box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.25);
	}
	.callback-dialog-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.callback-dialog-checkbox-wrap {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		cursor: pointer;
	}
	.callback-dialog-checkbox {
		margin-top: 0.2rem;
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-primary, #2D6A4F);
		cursor: pointer;
	}
	.callback-dialog-checkbox:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
	.callback-dialog-checkbox-label {
		font-size: 0.875rem;
		color: var(--color-base-content, #e7e5e4);
		opacity: 0.9;
	}
	.callback-dialog-link {
		color: var(--color-primary, #2D6A4F);
		text-decoration: underline;
	}
	.callback-dialog-link:hover {
		opacity: 0.9;
	}
	.callback-dialog-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 0.25rem;
	}
	.callback-dialog-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		transition: filter 0.15s, background 0.15s;
	}
	.callback-dialog-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.callback-dialog-btn-cancel {
		background: transparent;
		border: 1px solid var(--color-base-300, #44403c);
		color: var(--color-base-content, #e7e5e4);
	}
	.callback-dialog-btn-cancel:hover:not(:disabled) {
		background: var(--color-base-200, #292524);
	}
	.callback-dialog-btn-submit {
		background: var(--color-primary, #2D6A4F);
		color: var(--color-primary-content, #fafaf9);
	}
	.callback-dialog-btn-submit:hover:not(:disabled) {
		filter: brightness(1.1);
	}
</style>
