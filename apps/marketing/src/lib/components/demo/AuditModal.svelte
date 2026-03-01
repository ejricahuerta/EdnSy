<script lang="ts">
	import type { DemoAudit, AuditStatus } from '$lib/types/demo';
	import { Globe, Star, FileText, MapPin, X } from 'lucide-svelte';

	const COOKIE_NAME = 'lr_demo_audit_seen';
	const OPEN_DELAY_MS = 1000;
	/** PRD F1b: force-read for 4 seconds before user can dismiss */
	const FORCE_READ_MS = 4000;

	let {
		businessName = 'Your business',
		audit,
		/** F1a: 0–100; when set, show "This demo is X% complete — high confidence" */
		dataConfidenceScore
	}: {
		businessName?: string;
		audit: DemoAudit | null | undefined;
		dataConfidenceScore?: number;
	} = $props();

	const confidenceLabel = $derived(
		dataConfidenceScore != null
			? dataConfidenceScore >= 80
				? 'high confidence'
				: dataConfidenceScore >= 50
					? 'review before sending'
					: ''
			: ''
	);

	let open = $state(false);
	let showCloseButton = $state(false);
	let openTimer: ReturnType<typeof setTimeout> | null = null;
	let forceReadTimer: ReturnType<typeof setTimeout> | null = null;

	function getCookie(name: string): boolean {
		if (typeof document === 'undefined') return true; // SSR: don't show
		const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[^.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
		return !!match?.[1];
	}

	function setSessionCookie(name: string): void {
		if (typeof document === 'undefined') return;
		document.cookie = name + '=1; path=/; SameSite=Lax';
	}

	function close(): void {
		setSessionCookie(COOKIE_NAME);
		open = false;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (getCookie(COOKIE_NAME)) return;

		openTimer = setTimeout(() => {
			open = true;
			showCloseButton = false;
			forceReadTimer = setTimeout(() => {
				showCloseButton = true;
				forceReadTimer = null;
			}, FORCE_READ_MS);
		}, OPEN_DELAY_MS);

		return () => {
			if (openTimer) clearTimeout(openTimer);
			if (forceReadTimer) clearTimeout(forceReadTimer);
		};
	});

	// Lock body scroll when modal is open; restore when closed
	$effect(() => {
		if (typeof document === 'undefined') return;
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	const statusDot = (s: AuditStatus) =>
		s === 'green' ? 'bg-success' : s === 'amber' ? 'bg-warning' : 'bg-error';

	const websiteLabel =
		audit?.websiteStatus === 'exists'
			? 'Website present'
			: audit?.websiteStatus === 'missing'
				? 'No website found'
				: 'Website outdated';

	const hasAudit = $derived(audit != null);
</script>

{#if open}
	<!-- backdrop: div overlay (not button) so it doesn't get button styling; still keyboard-accessible when dismissible -->
	<div
		class="audit-modal-backdrop fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm cursor-default focus:outline-none {showCloseButton ? 'cursor-pointer' : ''}"
		role={showCloseButton ? 'button' : 'presentation'}
		aria-label={showCloseButton ? 'Close dialog' : undefined}
		tabindex={showCloseButton ? 0 : -1}
		onclick={() => showCloseButton && close()}
		onkeydown={(e) => {
			if (showCloseButton && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				close();
			}
		}}
	></div>
	<!-- centered wrapper: avoids transform-based centering so the modal doesn't jump on first frame -->
	<div class="audit-modal-wrapper fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
		<!-- modal: cream landing bg so it matches main landing look -->
		<div
			class="audit-modal audit-modal-cream pointer-events-auto w-full max-w-2xl rounded-2xl border shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
			role="dialog"
			aria-modal="true"
			aria-labelledby="audit-modal-heading"
			aria-describedby="audit-modal-desc"
		>
		<div class="audit-modal-scroll flex flex-1 flex-col overflow-y-auto pl-5 pr-5 pt-6 pb-4 md:pl-8 md:pr-8 md:pt-8 md:pb-5">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
					<p class="audit-modal-eyebrow mb-3" aria-hidden="true">Lead Rosetta</p>
					<h2 id="audit-modal-heading" class="audit-modal-title text-xl md:text-2xl font-bold mb-1">
						Here's what we found about {businessName} online
					</h2>
				</div>
				{#if showCloseButton}
					<button
						type="button"
						class="audit-modal-close btn btn-ghost btn-sm btn-square shrink-0 rounded-full"
						aria-label="Close"
						onclick={close}
					>
						<X class="w-5 h-5" aria-hidden="true" />
					</button>
				{/if}
			</div>
			{#if dataConfidenceScore != null && confidenceLabel}
				<p class="audit-modal-desc text-sm font-semibold text-base-content mb-2" aria-live="polite">
					This demo is {dataConfidenceScore}% complete — {confidenceLabel}.
				</p>
			{/if}
			<p id="audit-modal-desc" class="audit-modal-desc text-sm md:text-base mb-6">
				{#if hasAudit}
					We built this demo based on what your customers are already seeing.
				{:else}
					We built this demo for you. Explore the page to see how it could look with your real info.
				{/if}
			</p>
			{#if hasAudit}
				<div class="grid grid-cols-1 gap-3">
					<!-- Website -->
					<div class="audit-modal-card flex items-start gap-3 p-4 rounded-xl">
						<span
							class="audit-modal-icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full {statusDot(audit!.websiteStatusLevel)}"
							aria-hidden="true"
						>
							<Globe class="w-5 h-5 text-white" aria-hidden="true" />
						</span>
						<div class="min-w-0">
							<div class="font-medium audit-modal-card-title">Website</div>
							<p class="text-sm audit-modal-card-text mt-0.5">{websiteLabel}</p>
						</div>
					</div>
					<!-- Google reviews -->
					<div class="audit-modal-card flex items-start gap-3 p-4 rounded-xl">
						<span
							class="audit-modal-icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full {audit!.googleReviewCount != null && audit!.unansweredReviewsCount != null && audit!.unansweredReviewsCount > 0 ? statusDot('amber') : statusDot('green')}"
							aria-hidden="true"
						>
							<Star class="w-5 h-5 text-white" aria-hidden="true" />
						</span>
						<div class="min-w-0">
							<div class="font-medium audit-modal-card-title">Google reviews</div>
							<p class="text-sm audit-modal-card-text mt-0.5">
								{audit!.googleReviewCount != null ? `${audit!.googleReviewCount} reviews` : '—'}
								{#if audit!.lastReviewResponseDate}
									· Last response {audit!.lastReviewResponseDate}
								{/if}
							</p>
							{#if audit!.unansweredReviewsCount != null && audit!.unansweredReviewsCount > 0}
								<p class="text-sm text-warning mt-1 font-medium">{audit!.unansweredReviewsCount} unanswered</p>
							{/if}
						</div>
					</div>
					<!-- Service pages -->
					<div class="audit-modal-card flex items-start gap-3 p-4 rounded-xl">
						<span
							class="audit-modal-icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full {audit!.missingServicePages ? statusDot('amber') : statusDot('green')}"
							aria-hidden="true"
						>
							<FileText class="w-5 h-5 text-white" aria-hidden="true" />
						</span>
						<div class="min-w-0">
							<div class="font-medium audit-modal-card-title">Service pages</div>
							<p class="text-sm audit-modal-card-text mt-0.5">
								{audit!.missingServicePages ?? 'Aligned with competitors'}
							</p>
						</div>
					</div>
					{#if audit!.gbpCompletenessScore != null || audit!.gbpCompletenessLabel}
						<div class="audit-modal-card flex items-start gap-3 p-4 rounded-xl">
							<span
								class="audit-modal-icon-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full {audit!.gbpCompletenessScore != null && audit!.gbpCompletenessScore < 70 ? (audit!.gbpCompletenessScore < 40 ? statusDot('red') : statusDot('amber')) : statusDot('green')}"
								aria-hidden="true"
							>
								<MapPin class="w-5 h-5 text-white" aria-hidden="true" />
							</span>
							<div class="min-w-0">
								<div class="font-medium audit-modal-card-title">Google Business Profile</div>
								<p class="text-sm audit-modal-card-text mt-0.5">
									{audit!.gbpCompletenessLabel ?? (audit!.gbpCompletenessScore != null ? `${audit!.gbpCompletenessScore}% complete` : '—')}
								</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<div class="audit-modal-footer rounded-b-2xl">
			<button
				type="button"
				class="audit-modal-cta"
				disabled={!showCloseButton}
				onclick={close}
				aria-live="polite"
			>
				{showCloseButton ? 'See what it looks like fixed' : 'Please read (a moment)...'}
			</button>
			<p class="audit-modal-credit mt-3 text-center text-xs" aria-hidden="true">Ed & Sy Inc.</p>
		</div>
	</div>
	</div>
{/if}

<style>
	.audit-modal-backdrop {
		animation: audit-fade-in 0.2s ease-out;
		overflow: hidden;
		touch-action: none;
	}
	.audit-modal-wrapper {
		animation: audit-fade-in 0.2s ease-out;
	}
	.audit-modal {
		animation: audit-scale-in 0.25s ease-out;
	}
	/* Cream landing background (#F5F0E8) – matches main landing page */
	.audit-modal.audit-modal-cream {
		background-color: #F5F0E8;
		border-color: rgba(26, 26, 20, 0.12);
	}
	.audit-modal-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: #3d5a3e;
	}
	.audit-modal-title {
		color: #1A1A14;
	}
	.audit-modal-desc {
		color: rgba(26, 26, 20, 0.7);
	}
	.audit-modal-close {
		color: rgba(26, 26, 20, 0.6);
	}
	.audit-modal-close:hover {
		color: #1A1A14;
		background-color: rgba(26, 26, 20, 0.08);
	}
	.audit-modal-card {
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(26, 26, 20, 0.1);
		box-shadow: 0 1px 2px rgba(26, 26, 20, 0.04);
	}
	.audit-modal-card-title {
		color: #1A1A14;
	}
	.audit-modal-card-text {
		color: rgba(26, 26, 20, 0.75);
	}
	.audit-modal-icon-circle {
		/* Status-colored circles with white icons; orange for warning */
	}
	.audit-modal-icon-circle.bg-warning {
		background-color: #ea580c;
	}
	.audit-modal-footer {
		border-top: 1px solid rgba(26, 26, 20, 0.1);
		padding: 1rem 1.25rem;
		background: rgba(26, 26, 20, 0.04);
	}
	@media (min-width: 768px) {
		.audit-modal-footer {
			padding: 1.25rem;
		}
	}
	.audit-modal-cta {
		display: block;
		width: 100%;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.25;
		text-align: center;
		color: #F5F0E8;
		background: #3d5a3e;
		border: none;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: background-color 0.15s ease;
		-webkit-appearance: none;
		appearance: none;
	}
	.audit-modal-cta:hover:not(:disabled) {
		background: #4a6b4b;
		color: #F5F0E8;
	}
	.audit-modal-cta:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.audit-modal-cta:focus-visible {
		outline: 2px solid #3d5a3e;
		outline-offset: 2px;
	}
	.audit-modal-credit {
		color: rgba(26, 26, 20, 0.5);
	}
	@keyframes audit-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes audit-scale-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
