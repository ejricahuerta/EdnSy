<script lang="ts">
	import { INDUSTRY_LABELS, INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
	import { notionIndustryToSlug } from '$lib/industryMapping';
	import { canUploadCsv } from '$lib/plans';
	import type { PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string; atLimit?: boolean }>;
	}>();
	const freeLimit = $derived(data.freeLimit);
	const message = $derived(form?.message);
	const atLimit = $derived(form?.atLimit ?? false);
	const plan = $derived(data.plan ?? (data.user ? 'starter' : 'free'));
	const allowCsvUpload = $derived(canUploadCsv(plan));

	type CsvRow = {
		companyName: string;
		email: string;
		phone: string;
		website: string;
		industry: string;
		industrySlug: string;
		validationErrors: string[];
	};
	let rows = $state<CsvRow[]>([]);
	let fileInput: HTMLInputElement;

	/** Required: business_name and (contact_email or contact_phone). Returns empty if valid. */
	function validateRow(row: { companyName: string; email: string; phone: string }): string[] {
		const errs: string[] = [];
		const name = (row.companyName ?? '').trim();
		const email = (row.email ?? '').trim();
		const phone = (row.phone ?? '').trim();
		if (!name) errs.push('Missing company name');
		if (!email && !phone) errs.push('Missing email and phone (need at least one)');
		return errs;
	}

	function parseCsv(text: string): CsvRow[] {
		const lines = text.split(/\r?\n/).filter((l) => l.trim());
		if (lines.length < 2) return [];
		const header = lines[0].toLowerCase();
		const idx = (k: string) => {
			const i = header.split(',').findIndex((c) => c.trim().toLowerCase().includes(k));
			return i >= 0 ? i : -1;
		};
		const companyIdx = idx('company') >= 0 ? idx('company') : idx('name') >= 0 ? idx('name') : 0;
		const emailIdx = idx('email') >= 0 ? idx('email') : idx('contact_email') >= 0 ? idx('contact_email') : 1;
		const phoneIdx = idx('phone') >= 0 ? idx('phone') : idx('contact_phone') >= 0 ? idx('contact_phone') : idx('telephone') >= 0 ? idx('telephone') : -1;
		const websiteIdx = idx('website') >= 0 ? idx('website') : idx('url') >= 0 ? idx('url') : -1;
		const industryIdx = idx('industry') >= 0 ? idx('industry') : -1;
		const out: CsvRow[] = [];
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];
			const parts = line.match(/("([^"]*)"|([^,]*))/g)?.map((p) => p.replace(/^"|"$/g, '').trim()) ?? line.split(',').map((p) => p.trim());
			const companyName = (parts[companyIdx] ?? '').trim();
			const email = (parts[emailIdx] ?? '').trim();
			const phone = phoneIdx >= 0 ? (parts[phoneIdx] ?? '').trim() : '';
			const website = websiteIdx >= 0 ? (parts[websiteIdx] ?? '') : '';
			const industryRaw = industryIdx >= 0 ? (parts[industryIdx] ?? '') : '';
			const industrySlug = notionIndustryToSlug(industryRaw || 'solo-professionals');
			const industryLabel = INDUSTRY_LABELS[industrySlug as IndustrySlug] ?? industrySlug;
			const row = { companyName, email, phone, website, industry: industryLabel, industrySlug, validationErrors: [] as string[] };
			row.validationErrors = validateRow(row);
			out.push(row);
		}
		return out;
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = (reader.result as string) ?? '';
			rows = parseCsv(text);
		};
		reader.readAsText(file);
	}
</script>

<div class="page-content">
	<header style="padding-bottom: var(--space-5);">
		<h1 class="lr-heading-display">Upload CSV</h1>
		<p class="lr-subline">
			Upload a CSV of clients. Generate demo pages, then send by email (or copy the link to send yourself). Pro users can connect their CRM instead.
		</p>
	</header>

{#if !allowCsvUpload}
	<div class="lr-alert lr-alert-warning mb-6">
		<p style="font-weight: 500;">CSV upload is not available on the free tier</p>
		<p class="mt-1 text-sm">Sign in and upgrade to Pro to upload CSV. Free users can try one demo at a time on the <a href="/try" class="underline" style="color: var(--sage);">Try free</a> page.</p>
		<a href="/auth/login" class="lr-btn-primary mt-3 inline-flex">Sign in to upload CSV →</a>
	</div>
{:else if atLimit}
	<div class="lr-alert lr-alert-warning mb-6">
		<p style="font-weight: 500;">Free limit reached</p>
		<p class="mt-1 text-sm">{message}</p>
		<a href="/auth/login" class="lr-btn-primary mt-3 inline-flex">Sign in for Pro →</a>
	</div>
{:else if message && !atLimit}
	<div class="lr-alert lr-alert-error mb-6">{message}</div>
{/if}

{#if !allowCsvUpload}
	<p class="text-sm mt-6" style="color: var(--muted);">
		We don't store your lead data or use it for training.
		<a href="/privacy" class="underline" style="color: var(--sage);">Privacy</a> · <a href="/terms" class="underline" style="color: var(--sage);">Terms</a> · <a href="/cookies" class="underline" style="color: var(--sage);">Cookies</a>
	</p>
{:else}
<div class="max-w-2xl">
	<label class="block mb-2 text-sm font-medium" style="color: var(--color-text-secondary);">CSV file (Company, Email or Phone required; optional: Website, Industry)</label>
	<input
		type="file"
		accept=".csv,text/csv"
		class="block w-full text-sm"
		style="color: var(--color-text-primary);"
		onchange={onFileChange}
		bind:this={fileInput}
	/>
</div>

{#if rows.length > 0}
	{@const validCount = rows.filter((r) => r.validationErrors.length === 0).length}
	{@const invalidCount = rows.length - validCount}
	<p class="mt-4 text-sm" style="color: var(--color-text-muted);">
		{rows.length} row(s)
		{#if invalidCount > 0}
			— {validCount} valid, {invalidCount} invalid (fix or skip invalid rows). Create a demo for any valid row.
		{:else}
			. Create a demo for any row (Free: {freeLimit.remaining} of {freeLimit.limit} demos left this month).
		{/if}
	</p>
	<div class="overflow-x-auto mt-4">
		<table class="lr-prospects-table" style="width: 100%; border-collapse: separate; border-spacing: 0 var(--space-3);">
			<thead>
				<tr>
					<th class="lr-table-header">Company</th>
					<th class="lr-table-header">Email</th>
					<th class="lr-table-header">Phone</th>
					<th class="lr-table-header">Website</th>
					<th class="lr-table-header">Industry</th>
					<th class="lr-table-header">Status</th>
					<th class="lr-table-header"></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row, i}
					{@const isValid = row.validationErrors.length === 0}
					<tr
						class="lr-row-card"
						style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); {#if !isValid}border-left: 3px solid var(--color-error, #b91c1c);{/if}"
					>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">{row.companyName || '—'}</td>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">{row.email || '—'}</td>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">{row.phone || '—'}</td>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">{row.website || '—'}</td>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">{row.industry}</td>
						<td class="lr-table-body" style="padding: var(--space-4) var(--space-5);">
							{#if isValid}
								<span class="text-sm" style="color: var(--sage);">Valid</span>
							{:else}
								<span class="text-sm" style="color: var(--color-error, #b91c1c);" title={row.validationErrors.join('. ')}>
									Invalid: {row.validationErrors.join('; ')}
								</span>
							{/if}
						</td>
						<td style="padding: var(--space-4) var(--space-5);">
							{#if isValid}
								<form method="POST" action="?/createDemo" class="inline">
									<input type="hidden" name="companyName" value={row.companyName} />
									<input type="hidden" name="email" value={row.email} />
									<input type="hidden" name="phone" value={row.phone} />
									<input type="hidden" name="website" value={row.website} />
									<input type="hidden" name="industry" value={row.industrySlug} />
									<button type="submit" class="lr-btn-primary" style="padding: 6px 14px; font-size: 14px;">
										Create demo →
									</button>
								</form>
							{:else}
								<span class="text-sm" style="color: var(--color-text-muted);">Fix required</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

	<p class="text-sm mt-8" style="color: var(--muted);">
		We don't store your lead data or use it for training.
		<a href="/privacy" class="underline" style="color: var(--sage);">Privacy</a> · <a href="/terms" class="underline" style="color: var(--sage);">Terms</a> · <a href="/cookies" class="underline" style="color: var(--sage);">Cookies</a>
	</p>
{/if}
</div>
