<script lang="ts">
	import { enhance } from '$app/forms';
	import { INDUSTRY_LABELS, INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
	import type { PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string; atLimit?: boolean; alreadyCreating?: boolean }> | { success?: boolean; checkEmail?: boolean };
	}>();
	const freeLimit = $derived(data.freeLimit);
	const message = $derived(form && 'message' in form ? form.message : undefined);
	const atLimit = $derived(form && 'atLimit' in form ? form.atLimit ?? false : false);
	const alreadyCreating = $derived(form && 'alreadyCreating' in form ? form.alreadyCreating ?? false : false);
	const checkEmailSuccess = $derived(
		(form && 'checkEmail' in form && form.checkEmail) as boolean | undefined
	);

	let showCheckEmailModal = $state(false);
	let submitting = $state(false);

	$effect(() => {
		if (checkEmailSuccess) showCheckEmailModal = true;
	});

	function enhanceTryForm() {
		return enhance(() => {
			submitting = true;
			return async ({ result, update }) => {
				try {
					if (result.type === 'success' && result.data && typeof result.data === 'object' && 'checkEmail' in result.data && result.data.checkEmail) {
						showCheckEmailModal = true;
					}
					await update();
				} finally {
					submitting = false;
				}
			};
		});
	}
</script>

<div class="page-content">
	<header style="padding-bottom: var(--space-5);">
		<h1 class="lr-heading-display">Try free: one demo</h1>
		<p class="lr-subline">
			Enter one client. We generate a demo page. Starter and Growth get CSV upload; Growth and Agency add CRM and automated sending.
		</p>
	</header>

	{#if atLimit}
		<div class="lr-alert lr-alert-warning mb-6">
			<p style="font-weight: 500;">Free limit reached</p>
			<p class="mt-1 text-sm">{message}</p>
			<p class="mt-3 text-sm">
				<a href="/auth/login" class="lr-btn-primary" style="display: inline-flex;">Sign in →</a>
			</p>
		</div>
	{:else if message && !atLimit}
		<div class="lr-alert mb-6" class:lr-alert-error={!alreadyCreating} class:lr-alert-warning={alreadyCreating}>
			{message}
		</div>
	{/if}

	<div class="max-w-xl">
		<form
			method="POST"
			action="?/createDemo"
			class="space-y-4"
			use:enhance={enhanceTryForm()}
		>
			<div class="form-group max-w-full">
				<label for="companyName" class="form-label">Company name</label>
				<input
					id="companyName"
					name="companyName"
					type="text"
					placeholder="Acme Inc."
					class="form-input w-full"
				/>
			</div>
			<div class="form-group max-w-full">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="lead@company.com"
					class="form-input w-full"
				/>
			</div>
			<div class="form-group max-w-full">
				<label for="website" class="form-label">Website (optional)</label>
				<input
					id="website"
					name="website"
					type="url"
					placeholder="https://"
					class="form-input w-full"
				/>
			</div>
			<div class="form-group max-w-full">
				<label for="industry" class="form-label">Industry</label>
				<select id="industry" name="industry" class="form-input w-full">
					{#each INDUSTRY_SLUGS as slug}
						<option value={slug}>{INDUSTRY_LABELS[slug as IndustrySlug]}</option>
					{/each}
				</select>
			</div>
			<div class="form-group max-w-full">
				<label class="flex items-start gap-3 cursor-pointer">
					<input
						type="checkbox"
						name="complianceConfirm"
						required
						class="form-checkbox mt-1 shrink-0"
						aria-describedby="compliance-desc"
					/>
					<span id="compliance-desc" class="form-compliance-label">
						I confirm I am responsible for ensuring my outreach complies with applicable laws in my jurisdiction.
					</span>
				</label>
			</div>
			<button type="submit" class="lr-btn-primary" disabled={submitting}>
				{submitting ? 'Creating…' : 'Create demo →'}
			</button>
		</form>
	</div>

	<p class="form-hint mt-6">
		Free: {freeLimit.remaining} of {freeLimit.limit} demos this month. Preview in your browser; link is not saved. Sign in to send and track clients.
	</p>
	<p class="form-hint mt-2">
		We don't store your lead data or use it for training.
		<a href="/privacy" class="underline" style="color: var(--sage);">Privacy</a> · <a href="/terms" class="underline" style="color: var(--sage);">Terms</a> · <a href="/cookies" class="underline" style="color: var(--sage);">Cookies</a>
	</p>

	{#if showCheckEmailModal}
		<div
			class="try-dev-dialog-overlay"
			role="dialog"
			aria-modal="true"
			aria-labelledby="try-check-email-title"
		>
			<div class="try-dev-dialog">
				<h2 id="try-check-email-title" class="try-dev-dialog-title">Check your email</h2>
				<p class="try-dev-dialog-body">
					We've sent you a link to view your demo. It usually takes 1–2 minutes to generate. If the page says "Generating…", wait a minute and refresh.
				</p>
				<div class="try-dev-dialog-actions">
					<button type="button" class="lr-btn-primary" onclick={() => (showCheckEmailModal = false)}>
						OK
					</button>
				</div>
			</div>
		</div>
	{/if}

</div>

<style>
	.try-dev-dialog-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	.try-dev-dialog {
		background: var(--lr-bg, #fff);
		border-radius: 0.5rem;
		padding: 1.5rem;
		max-width: 24rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}
	.try-dev-dialog-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
	}
	.try-dev-dialog-body {
		font-size: 0.9375rem;
		color: var(--muted, #6b7280);
		margin: 0 0 1.25rem;
		line-height: 1.5;
	}
	.try-dev-dialog-body strong {
		color: inherit;
		font-weight: 600;
	}
	.try-dev-dialog-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}
	.try-dev-dialog-cancel {
		background: none;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		cursor: pointer;
		color: var(--muted, #6b7280);
	}
	.try-dev-dialog-cancel:hover {
		background: var(--muted);
		color: #fff;
	}
</style>
