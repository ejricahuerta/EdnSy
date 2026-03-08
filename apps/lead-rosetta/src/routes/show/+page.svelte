<script lang="ts">
	import { enhance } from '$app/forms';
	import { MapPin, Building2, Globe, Phone, Star, Clock, CheckCircle, AlertCircle } from 'lucide-svelte';
	import type { GbpData } from '$lib/server/gbp';
	import type { GeminiInsight } from '$lib/types/demo';

	type LookupAudit = {
		websiteStatus: string;
		websiteStatusLevel: string;
		gbpCompletenessScore: number | null;
		gbpCompletenessLabel?: string;
		googleReviewCount: number | null;
		googleRatingValue: number | null;
		gbpClaimed?: boolean | null;
		gbpHasHours?: boolean | null;
	};

	type LookupData = {
		businessName: string;
		address: string;
		gbp: GbpData | null;
		insight: GeminiInsight | null;
		audit: LookupAudit;
	};

	let { data, form } = $props<{
		data: import('./$types').PageData;
		form?: import('./$types').ActionFailure<{ lookupError?: string; lookupData?: LookupData | null; createDemoError?: string }> | { lookupError?: string | null; lookupData?: LookupData | null; createDemoError?: string };
	}>();

	const lookupError = $derived(form && 'lookupError' in form ? form.lookupError ?? null : null);
	const lookupData = $derived(form && 'lookupData' in form ? form.lookupData ?? null : null);
	const createDemoError = $derived(form && 'createDemoError' in form ? form.createDemoError ?? null : null);

	let lookupSubmitting = $state(false);
	let createDemoSubmitting = $state(false);

	function enhanceLookup() {
		return enhance(() => {
			lookupSubmitting = true;
			return async ({ result, update }) => {
				await update();
				lookupSubmitting = false;
			};
		});
	}

	function enhanceCreateDemo() {
		return enhance(() => {
			createDemoSubmitting = true;
			return async ({ result, update }) => {
				await update();
				createDemoSubmitting = false;
			};
		});
	}
</script>

<svelte:head>
	<title>Client show – GBP & website insight | Lead Rosetta</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page-content">
	<header style="padding-bottom: var(--space-5);">
		<h1 class="lr-heading-display">Client show</h1>
		<p class="lr-subline">
			Enter a business name and address to pull their Google Business Profile and AI website analysis. Use this in person to show the client their profile and recommendations.
		</p>
	</header>

	<!-- Lookup form -->
	<div class="show-form-card">
		<form method="POST" action="?/lookup" class="space-y-4" use:enhance={enhanceLookup()}>
			<div class="form-group max-w-full">
				<label for="businessName" class="form-label">Business name</label>
				<input
					id="businessName"
					name="businessName"
					type="text"
					placeholder="e.g. Acme Plumbing"
					class="form-input w-full"
					required
				/>
			</div>
			<div class="form-group max-w-full">
				<label for="address" class="form-label">Address or city</label>
				<input
					id="address"
					name="address"
					type="text"
					placeholder="e.g. Toronto, ON or 123 Main St, Toronto"
					class="form-input w-full"
				/>
			</div>
			{#if lookupError}
				<div class="lr-alert lr-alert-error" role="alert">
					{lookupError}
				</div>
			{/if}
			<button type="submit" class="lr-btn-primary" disabled={lookupSubmitting}>
				{lookupSubmitting ? 'Looking up…' : 'Look up GBP & insights'}
			</button>
		</form>
	</div>

	{#if lookupData}
		<div class="show-results">
			<!-- GBP section -->
			<section class="show-section">
				<h2 class="show-section-title">
					<Building2 class="show-section-icon" aria-hidden="true" />
					Google Business Profile
				</h2>
				{#if lookupData.gbp}
					<div class="show-gbp-card">
						<div class="show-gbp-name">{lookupData.gbp.name}</div>
						{#if lookupData.gbp.address}
							<div class="show-gbp-row">
								<MapPin size={16} aria-hidden="true" />
								<span>{lookupData.gbp.address}</span>
							</div>
						{/if}
						{#if lookupData.gbp.phone}
							<div class="show-gbp-row">
								<Phone size={16} aria-hidden="true" />
								<a href="tel:{lookupData.gbp.phone}">{lookupData.gbp.phone}</a>
							</div>
						{/if}
						{#if lookupData.gbp.website}
							<div class="show-gbp-row">
								<Globe size={16} aria-hidden="true" />
								<a href={lookupData.gbp.website} target="_blank" rel="noopener noreferrer">{lookupData.gbp.website}</a>
							</div>
						{/if}
						<div class="show-gbp-meta">
							{#if lookupData.gbp.ratingValue != null}
								<span class="show-gbp-rating">
									<Star size={16} aria-hidden="true" />
									{lookupData.gbp.ratingValue} ({lookupData.gbp.ratingCount} reviews)
								</span>
							{/if}
							{#if lookupData.gbp.workHours}
								<span class="show-gbp-hours">
									<Clock size={16} aria-hidden="true" />
									Hours listed
								</span>
							{/if}
							{#if lookupData.gbp.isClaimed}
								<span class="show-gbp-claimed">
									<CheckCircle size={16} aria-hidden="true" />
									Claimed
								</span>
							{:else}
								<span class="show-gbp-unclaimed">
									<AlertCircle size={16} aria-hidden="true" />
									Not claimed
								</span>
							{/if}
						</div>
						{#if lookupData.audit.gbpCompletenessLabel}
							<p class="show-gbp-completeness">Profile completeness: {lookupData.audit.gbpCompletenessLabel}</p>
						{/if}
					</div>
				{:else}
					<p class="show-muted">No GBP data returned.</p>
				{/if}
			</section>

			<!-- AI website analysis (section by section) -->
			{#if lookupData.insight?.website}
				<section class="show-section">
					<h2 class="show-section-title">Website analysis</h2>
					<div class="show-analysis-grid">
						{#if lookupData.insight.website.ux}
							<div class="show-analysis-item">
								<span class="show-analysis-label">User experience</span>
								<span class="show-analysis-value">{lookupData.insight.website.ux}</span>
							</div>
						{/if}
						{#if lookupData.insight.website.ui}
							<div class="show-analysis-item">
								<span class="show-analysis-label">Design / UI</span>
								<span class="show-analysis-value">{lookupData.insight.website.ui}</span>
							</div>
						{/if}
						{#if lookupData.insight.website.seo}
							<div class="show-analysis-item">
								<span class="show-analysis-label">SEO</span>
								<span class="show-analysis-value">{lookupData.insight.website.seo}</span>
							</div>
						{/if}
						{#if lookupData.insight.website.benchmark}
							<div class="show-analysis-item">
								<span class="show-analysis-label">Overall</span>
								<span class="show-analysis-value show-analysis-benchmark">{lookupData.insight.website.benchmark}</span>
							</div>
						{/if}
					</div>
				</section>
			{/if}

			<!-- SEO analysis (from insight) -->
			{#if lookupData.insight?.website?.seo || lookupData.insight?.summary}
				<section class="show-section">
					<h2 class="show-section-title">SEO & summary</h2>
					<div class="show-seo-card">
						{#if lookupData.insight.summary}
							<p class="show-seo-summary">{lookupData.insight.summary}</p>
						{/if}
						{#if lookupData.insight.website?.seo}
							<p class="show-seo-grade"><strong>SEO grade:</strong> {lookupData.insight.website.seo}</p>
						{/if}
					</div>
				</section>
			{/if}

			<!-- Recommendations / next steps -->
			{#if lookupData.insight?.recommendations?.length}
				<section class="show-section">
					<h2 class="show-section-title">Recommendations & next steps</h2>
					<ul class="show-recommendations">
						{#each lookupData.insight.recommendations as rec}
							<li>{rec}</li>
						{/each}
					</ul>
					{#if lookupData.insight.recommendationReason}
						<p class="show-reason">{lookupData.insight.recommendationReason}</p>
					{/if}
				</section>
			{/if}

			<!-- Generate demo CTA -->
			<section class="show-section show-demo-cta">
				<h2 class="show-section-title">Generate demo</h2>
				<p class="show-muted" style="margin-bottom: 1rem;">
					Create a personalized demo page for this business. Enter the client's email to send them the link.
				</p>
				<form method="POST" action="?/createDemo" class="show-demo-form" use:enhance={enhanceCreateDemo()}>
					<input type="hidden" name="businessName" value={lookupData.businessName} />
					<input type="hidden" name="website" value={lookupData.gbp?.website ?? ''} />
					<input type="hidden" name="industry" value="professional" />
					<div class="form-group max-w-full">
						<label for="show-email" class="form-label">Client email</label>
						<input
							id="show-email"
							name="email"
							type="email"
							placeholder="client@example.com"
							class="form-input w-full"
							required
						/>
					</div>
					{#if createDemoError}
						<div class="lr-alert lr-alert-error" role="alert" style="margin-top: 0.75rem;">
							{createDemoError}
						</div>
					{/if}
					<button type="submit" class="lr-btn-primary" disabled={createDemoSubmitting} style="margin-top: 1rem;">
						{createDemoSubmitting ? 'Creating…' : 'Generate demo'}
					</button>
				</form>
			</section>
		</div>
	{/if}
</div>

<style>
	.show-form-card {
		max-width: 28rem;
		margin-bottom: 2.5rem;
	}
	.show-form-card .form-group {
		max-width: 100%;
	}
	.space-y-4 > * + * {
		margin-top: 1rem;
	}
	.show-results {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 40rem;
	}
	.show-section {
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		background: var(--color-surface, var(--white));
	}
	.show-section-title {
		font-family: 'Instrument Serif', serif;
		font-size: 1.25rem;
		color: var(--ink);
		margin: 0 0 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.show-section-icon {
		flex-shrink: 0;
		color: var(--sage);
	}
	.show-gbp-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.show-gbp-name {
		font-weight: 600;
		font-size: 1.1rem;
		color: var(--ink);
	}
	.show-gbp-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
		color: var(--ink);
	}
	.show-gbp-row a {
		color: var(--sage);
		text-decoration: none;
	}
	.show-gbp-row a:hover {
		text-decoration: underline;
	}
	.show-gbp-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted);
	}
	.show-gbp-rating,
	.show-gbp-hours,
	.show-gbp-claimed,
	.show-gbp-unclaimed {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.show-gbp-claimed {
		color: var(--sage);
	}
	.show-gbp-unclaimed {
		color: var(--amber);
	}
	.show-gbp-completeness {
		font-size: 0.8125rem;
		color: var(--muted);
		margin: 0.5rem 0 0;
	}
	.show-muted {
		font-size: 0.9375rem;
		color: var(--muted);
		margin: 0;
	}
	.show-analysis-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: 1rem;
	}
	.show-analysis-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;
		background: var(--surface, var(--cream));
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	.show-analysis-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}
	.show-analysis-value {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--ink);
	}
	.show-analysis-benchmark {
		text-transform: capitalize;
	}
	.show-seo-card {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--ink);
	}
	.show-seo-summary {
		margin: 0 0 0.75rem;
	}
	.show-seo-grade {
		margin: 0;
	}
	.show-recommendations {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--ink);
	}
	.show-recommendations li {
		margin-bottom: 0.35rem;
	}
	.show-reason {
		font-size: 0.8125rem;
		color: var(--muted);
		margin: 1rem 0 0;
		font-style: italic;
	}
	.show-demo-cta {
		border-color: var(--sage);
		background: rgba(61, 90, 62, 0.04);
	}
	.show-demo-form .form-group {
		max-width: 100%;
	}
</style>
