<script lang="ts">
	import type { DemoAudit, AuditStatus } from '$lib/types/demo';
	import { Globe, Star, FileText, MapPin } from 'lucide-svelte';

	let {
		businessName = 'Your business',
		audit
	}: {
		businessName?: string;
		audit: DemoAudit | null | undefined;
	} = $props();

	if (!audit) {
		// Don't render if no audit data
	}

	const statusDot = (s: AuditStatus) =>
		s === 'green' ? 'bg-success' : s === 'amber' ? 'bg-warning' : 'bg-error';

	const websiteLabel =
		audit?.websiteStatus === 'exists'
			? 'Website present'
			: audit?.websiteStatus === 'missing'
				? 'No website found'
				: 'Website outdated';
</script>

{#if audit}
	<section
		class="pain-section lr-from-platform border-b border-base-300/80 bg-base-200/60"
		aria-labelledby="pain-section-heading"
	>
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
			<p class="lr-platform-label mb-3" aria-hidden="true">Lead Rosetta</p>
			<h2 id="pain-section-heading" class="text-xl md:text-2xl font-bold text-base-content mb-1">
				Here's what we found about {businessName} online
			</h2>
			<p class="text-base-content/70 text-sm md:text-base mb-6">
				We built this demo based on what your customers are already seeing.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<!-- Website -->
				<div class="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
					<span
						class="flex h-8 w-8 shrink-0 rounded-full {statusDot(audit.websiteStatusLevel)}"
						aria-hidden="true"
					></span>
					<div class="min-w-0">
						<div class="font-medium text-base-content flex items-center gap-2">
							<Globe class="w-4 h-4 shrink-0 text-base-content/60" aria-hidden="true" />
							Website
						</div>
						<p class="text-sm text-base-content/80 mt-0.5">{websiteLabel}</p>
					</div>
				</div>

				<!-- Google reviews -->
				<div class="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
					<span
						class="flex h-8 w-8 shrink-0 rounded-full {audit.googleReviewCount != null && audit.unansweredReviewsCount != null && audit.unansweredReviewsCount > 0 ? statusDot('amber') : statusDot('green')}"
						aria-hidden="true"
					></span>
					<div class="min-w-0">
						<div class="font-medium text-base-content flex items-center gap-2">
							<Star class="w-4 h-4 shrink-0 text-base-content/60" aria-hidden="true" />
							Google reviews
						</div>
						<p class="text-sm text-base-content/80 mt-0.5">
							{audit.googleReviewCount != null ? `${audit.googleReviewCount} reviews` : '—'}
							{#if audit.lastReviewResponseDate}
								· Last response {audit.lastReviewResponseDate}
							{/if}
						</p>
						{#if audit.unansweredReviewsCount != null && audit.unansweredReviewsCount > 0}
							<p class="text-sm text-warning mt-1 font-medium">
								{audit.unansweredReviewsCount} unanswered
							</p>
						{/if}
					</div>
				</div>

				<!-- Service pages -->
				<div class="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
					<span
						class="flex h-8 w-8 shrink-0 rounded-full {audit.missingServicePages ? statusDot('amber') : statusDot('green')}"
						aria-hidden="true"
					></span>
					<div class="min-w-0">
						<div class="font-medium text-base-content flex items-center gap-2">
							<FileText class="w-4 h-4 shrink-0 text-base-content/60" aria-hidden="true" />
							Service pages
						</div>
						<p class="text-sm text-base-content/80 mt-0.5">
							{audit.missingServicePages ?? 'Aligned with competitors'}
						</p>
					</div>
				</div>

				<!-- GBP completeness -->
				{#if audit.gbpCompletenessScore != null || audit.gbpCompletenessLabel}
					<div
						class="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-300/80 shadow-sm sm:col-span-2 lg:col-span-1"
					>
						<span
							class="flex h-8 w-8 shrink-0 rounded-full {audit.gbpCompletenessScore != null && audit.gbpCompletenessScore < 70 ? (audit.gbpCompletenessScore < 40 ? statusDot('red') : statusDot('amber')) : statusDot('green')}"
							aria-hidden="true"
						></span>
						<div class="min-w-0">
							<div class="font-medium text-base-content flex items-center gap-2">
								<MapPin class="w-4 h-4 shrink-0 text-base-content/60" aria-hidden="true" />
								Google Business Profile
							</div>
							<p class="text-sm text-base-content/80 mt-0.5">
								{audit.gbpCompletenessLabel ?? (audit.gbpCompletenessScore != null ? `${audit.gbpCompletenessScore}% complete` : '—')}
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

<style>
	.pain-section .rounded-full {
		margin-top: 2px;
	}
</style>
