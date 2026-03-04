<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let {
		open = $bindable(false),
		prospectId = ''
	}: {
		open?: boolean;
		prospectId?: string;
	} = $props();

	const dispatch = createEventDispatcher<{ close: void; success: void; error: void }>();

	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let agreeToTerms = $state(false);
	let submitting = $state(false);
	let error = $state('');
	let success = $state(false);

	function reset() {
		firstName = '';
		lastName = '';
		phone = '';
		agreeToTerms = false;
		error = '';
		success = false;
	}

	function closeDialog() {
		reset();
		open = false;
		dispatch('close');
	}

	async function submit() {
		error = '';
		if (!firstName.trim() || !phone.trim()) {
			error = 'First name and phone number are required.';
			return;
		}
		if (!agreeToTerms) {
			error = 'Please agree to the terms and conditions.';
			return;
		}
		submitting = true;
		if (prospectId) {
			try {
				await fetch('/api/demo/track', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prospectId, event: 'callback_submitted', path: window.location.pathname })
				});
			} catch (_) {}
		}
		try {
			const res = await fetch('/api/demo/callback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					phone: phone.trim(),
					agreeToTerms: true
				})
			});
			const data = await res.json().catch(() => ({}));
			if (res.ok) {
				success = true;
				if (prospectId) {
					fetch('/api/demo/track', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ prospectId, event: 'callback_success', path: window.location.pathname })
					}).catch(() => {});
				}
				dispatch('success');
			} else {
				if (data?.code === 'NOT_CONFIGURED') {
					dispatch('error', { notConfigured: true });
					return;
				}
				error = (data?.error as string) || 'Could not request callback. Try again.';
				if (prospectId) {
					fetch('/api/demo/track', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ prospectId, event: 'callback_error', path: window.location.pathname })
					}).catch(() => {});
				}
				dispatch('error', { notConfigured: false });
			}
		} catch (_) {
			error = 'Network error. Please try again.';
			if (prospectId) {
				fetch('/api/demo/track', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ prospectId, event: 'callback_error', path: window.location.pathname })
				}).catch(() => {});
			}
			dispatch('error', { notConfigured: false });
		} finally {
			submitting = false;
		}
	}

	let overlayEl: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		if (!open) reset();
		else overlayEl?.focus();
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={overlayEl}
		class="retell-dialog-overlay"
		role="dialog"
		aria-modal="true"
		aria-labelledby="callback-dialog-title"
		aria-describedby="callback-dialog-desc"
		tabindex="-1"
		onclick={(e) => e.target === e.currentTarget && closeDialog()}
		onkeydown={(e) => e.key === 'Escape' && closeDialog()}
	>
		<div class="retell-dialog">
			<div class="retell-dialog-header">
				<h2 id="callback-dialog-title" class="retell-dialog-title">Request AI callback</h2>
				<button
					type="button"
					class="retell-dialog-close"
					onclick={closeDialog}
					aria-label="Close"
				>×</button>
			</div>
			<p id="callback-dialog-desc" class="retell-dialog-desc">
				Enter your number below. Our AI will call you back within a few minutes. You can ask questions, get information, or schedule a time to talk—all with a voice AI that understands context and responds naturally.
			</p>

			{#if success}
				<p class="retell-dialog-success">We'll call you shortly.</p>
				<button type="button" class="retell-dialog-btn-primary" onclick={closeDialog}>Close</button>
			{:else}
				<form class="retell-dialog-form" onsubmit={(e) => { e.preventDefault(); submit(); }}>
					<div class="retell-dialog-field">
						<label for="cb-first">First name</label>
						<input id="cb-first" type="text" bind:value={firstName} placeholder="First name" required />
					</div>
					<div class="retell-dialog-field">
						<label for="cb-last">Last name</label>
						<input id="cb-last" type="text" bind:value={lastName} placeholder="Last name" />
					</div>
					<div class="retell-dialog-field">
						<label for="cb-phone">Phone</label>
						<input id="cb-phone" type="tel" bind:value={phone} placeholder="(555) 123-4567" required />
					</div>
					<div class="retell-dialog-field checkbox">
						<label>
							<input type="checkbox" bind:checked={agreeToTerms} />
							<span class="retell-dialog-terms-text">
								I agree to be contacted by phone and to the
								<a href="/terms" target="_blank" rel="noopener noreferrer" class="retell-dialog-link">Terms of Service</a>
								and
								<a href="/privacy" target="_blank" rel="noopener noreferrer" class="retell-dialog-link">Privacy Policy</a>.
							</span>
						</label>
					</div>
					{#if error}
						<p class="retell-dialog-error" role="alert">{error}</p>
					{/if}
					<div class="retell-dialog-actions">
						<button type="button" class="retell-dialog-btn-secondary" onclick={closeDialog}>Cancel</button>
						<button type="submit" class="retell-dialog-btn-primary" disabled={submitting || !agreeToTerms}>
							{submitting ? 'Requesting…' : 'Request AI callback'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Lead Rosetta brand: minimal, same palette as chat widget */
	.retell-dialog-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(26, 26, 20, 0.4);
		padding: 1rem;
	}
	.retell-dialog {
		position: relative;
		background: #ffffff;
		border: 1px solid #d8d0bf;
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		width: 100%;
		max-width: 22rem;
		box-shadow: 0 4px 24px rgba(26, 26, 20, 0.1);
	}
	.retell-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.25rem;
	}
	.retell-dialog-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: #1a1a14;
	}
	.retell-dialog-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.35rem;
		line-height: 1;
		border: 1px solid #d8d0bf;
		border-radius: 8px;
		background: #ffffff;
		color: #1a1a14;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.retell-dialog-close:hover {
		background: #f5f0e8;
		border-color: #7a7566;
	}
	.retell-dialog-desc {
		font-size: 0.875rem;
		color: #7a7566;
		margin: 0 0 1.25rem 0;
	}
	.retell-dialog-success {
		color: #2d6a4f;
		font-weight: 500;
		margin: 0 0 1rem 0;
	}
	.retell-dialog-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.retell-dialog-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.retell-dialog-field label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #1a1a14;
	}
	.retell-dialog-field input[type='text'],
	.retell-dialog-field input[type='tel'] {
		padding: 8px 12px;
		font-size: 0.875rem;
		border-radius: 8px;
		border: 1px solid #d8d0bf;
		background: #ffffff;
		color: #1a1a14;
	}
	.retell-dialog-field input:focus {
		outline: none;
		border-color: #2d6a4f;
		box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.2);
	}
	.retell-dialog-field.checkbox label {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-weight: 400;
		cursor: pointer;
		color: #1a1a14;
		font-size: 0.875rem;
	}
	.retell-dialog-field.checkbox input {
		width: 1rem;
		height: 1rem;
		margin-top: 0.2rem;
		flex-shrink: 0;
	}
	.retell-dialog-terms-text {
		line-height: 1.4;
	}
	.retell-dialog-link {
		color: #2d6a4f;
		text-decoration: underline;
	}
	.retell-dialog-link:hover {
		text-decoration: underline;
	}
	.retell-dialog-error {
		font-size: 0.875rem;
		color: #dc2626;
		margin: 0;
	}
	.retell-dialog-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 0.25rem;
	}
	.retell-dialog-btn-primary {
		padding: 10px 14px;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 8px;
		border: none;
		background: #2d6a4f;
		color: #fafaf9;
		cursor: pointer;
		transition: filter 0.15s;
		width: 100%;
	}
	.retell-dialog-btn-primary:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	.retell-dialog-btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.retell-dialog-btn-secondary {
		padding: 10px 14px;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 8px;
		border: 1px solid #d8d0bf;
		background: #ffffff;
		color: #1a1a14;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.retell-dialog-btn-secondary:hover {
		background: #f5f0e8;
		border-color: #7a7566;
	}
</style>
