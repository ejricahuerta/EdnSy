<script lang="ts">
	import { INDUSTRY_LABELS, INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
	import type { PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string; atLimit?: boolean }>;
	}>();
	const freeLimit = $derived(data.freeLimit);
	const message = $derived(form?.message);
	const atLimit = $derived(form?.atLimit ?? false);
</script>

<div class="page-content">
	<header style="padding-bottom: var(--space-5);">
		<h1 class="lr-heading-display">Try free: one demo</h1>
		<p class="lr-subline">
			Enter one client. We generate a demo page. Pro users get CSV upload, CRM connection, and automated email sending.
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
		<div class="lr-alert lr-alert-error mb-6">{message}</div>
	{/if}

	<div class="max-w-xl">
		<form method="POST" action="?/createDemo" class="space-y-4">
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
					<span id="compliance-desc" class="text-sm text-base-content/90">
						I confirm I am responsible for ensuring my outreach complies with applicable laws in my jurisdiction.
					</span>
				</label>
			</div>
			<button type="submit" class="lr-btn-primary">
				Create demo →
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
</div>
