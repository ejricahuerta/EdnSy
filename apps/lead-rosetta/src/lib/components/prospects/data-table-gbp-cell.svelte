<script lang="ts">
	import type { DemoAudit } from '$lib/demo';
	import { cn } from '$lib/utils';

	let {
		audit,
		hasScrapedData = false,
		hasWebsite = true
	}: { audit: DemoAudit | null; hasScrapedData?: boolean; hasWebsite?: boolean } = $props();

	/** When prospect has no website, treat as lowest grade (display and style). */
	const noWebsite = $derived(hasWebsite === false);

	/** Actual grade from Gemini (e.g. "A", "B+", "Good", "Needs work"). When no website, show as lowest. */
	const grade = $derived(
		noWebsite ? null : (audit?.insight?.grade?.trim() ?? null)
	);

	const hasGbpData = $derived(
		audit &&
			(audit.gbpCompletenessScore != null ||
				audit.gbpCompletenessLabel ||
				audit.googleRatingValue != null ||
				(audit.googleReviewCount ?? 0) > 0 ||
				audit.gbpClaimed != null ||
				audit.gbpHasHours != null)
	);

	const score = $derived(audit?.gbpCompletenessScore ?? null);
	const label = $derived(audit?.gbpCompletenessLabel ?? null);

	/** Resolve 0–100 from score or label (e.g. "72% complete" -> 72). */
	const numericScore = $derived.by(() => {
		if (score != null) return score;
		if (label) {
			const match = label.match(/(\d+)\s*%?/);
			if (match) return Math.min(100, Math.max(0, parseInt(match[1], 10)));
		}
		return null;
	});

	type GbpTier = 'empty' | 'no_gbp' | 'okay' | 'great' | 'excellent';
	const tier = $derived.by((): GbpTier => {
		if (!audit) {
			return hasScrapedData ? 'no_gbp' : 'empty';
		}
		if (!hasGbpData) return 'no_gbp';
		const n = numericScore ?? 0;
		if (n >= 90) return 'excellent';
		if (n >= 70) return 'great';
		if (n >= 40) return 'okay';
		return 'okay'; // 0–39: still "okay" (we have GBP, just low)
	});

	/** CSS variant for grade text (A/B = green, C = amber, Needs work / low = red). */
	const gradeVariant = $derived.by(() => {
		if (!grade) return 'muted';
		const g = grade.toLowerCase();
		if (/^[ab][+-]?$/i.test(g) || g === 'strong' || g === 'excellent' || g === 'good') return 'green';
		if (/^c[+-]?$/i.test(g) || g === 'fair' || g === 'average') return 'amber';
		if (/^[df][+-]?$/i.test(g) || g === 'needs work' || g === 'poor' || g === 'weak') return 'red';
		return 'muted';
	});

	/** No grade: we have scraped data but no Gemini insight grade (e.g. GBP pulled, Insights not run yet). */
	const notGraded = $derived(Boolean(!grade && hasScrapedData && !noWebsite));

	/** When not graded but we have GBP data, show score so user sees GBP was pulled; "Not graded" = letter grade pending Insights. */
	const notGradedWithGbp = $derived(notGraded && hasGbpData);
	const notGradedScoreLabel = $derived.by(() => {
		if (!notGradedWithGbp) return null;
		const n = numericScore;
		if (n != null) return `${n}%`;
		return null;
	});

	const title = $derived.by(() => {
		if (noWebsite) return 'No website – grade is lowest';
		if (grade) return `Grade: ${grade}`;
		if (notGraded) {
			if (hasGbpData) {
				const scorePart = numericScore != null ? `${numericScore}% GBP · ` : 'GBP pulled · ';
				return `${scorePart}Letter grade pending (run Insights)`;
			}
			return 'Not graded';
		}
		switch (tier) {
			case 'empty':
				return "Didn't create demo yet";
			case 'no_gbp':
				return 'No GBP';
			default:
				return '';
		}
	});
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 justify-center text-muted-foreground',
		noWebsite && 'text-destructive',
		!noWebsite && !grade && !notGraded && tier === 'empty' && 'opacity-50',
		!noWebsite && !grade && !notGraded && tier === 'no_gbp' && 'text-destructive',
		!noWebsite && notGraded && 'text-muted-foreground',
		!noWebsite && grade && gradeVariant === 'green' && 'text-green-600 dark:text-green-400',
		!noWebsite && grade && gradeVariant === 'amber' && 'text-amber-600 dark:text-amber-400',
		!noWebsite && grade && gradeVariant === 'red' && 'text-destructive',
		!noWebsite && grade && gradeVariant === 'muted' && 'text-muted-foreground'
	)}
	title={title}
	aria-label={title}
>
	{#if noWebsite}
		<span class="text-sm font-medium">No website</span>
	{:else if grade}
		<span class="font-medium tabular-nums">{grade}</span>
	{:else if notGradedWithGbp}
		<span class="text-sm tabular-nums">{notGradedScoreLabel ?? 'GBP'}</span>
		<span class="text-muted-foreground/80">·</span>
		<span class="text-sm">Not graded</span>
	{:else if notGraded}
		<span class="text-sm">Not graded</span>
	{:else if tier === 'no_gbp'}
		<span class="text-sm">No GBP</span>
	{:else}
		<span class="text-sm opacity-50">—</span>
	{/if}
</span>
