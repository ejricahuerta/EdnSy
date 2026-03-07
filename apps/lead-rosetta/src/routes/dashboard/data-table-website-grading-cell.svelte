<script lang="ts">
	import type { DemoAudit } from '$lib/demo';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	let { audit }: { audit: DemoAudit | null } = $props();

	const website = $derived(audit?.insight?.website ?? null);
	const overallGrade = $derived(
		audit?.insight?.grade != null && String(audit.insight.grade).trim()
			? String(audit.insight.grade).trim()
			: null
	);

	const hasWebsiteGrading = $derived(
		website &&
			(website.ux != null ||
				website.ui != null ||
				website.seo != null ||
				website.benchmark != null)
	);

	const benchmark = $derived(
		website?.benchmark === 'modern' || website?.benchmark === 'outdated' ? website.benchmark : null
	);

	/** Single badge label: benchmark (Modern/Outdated) or overall grade. */
	const badgeLabel = $derived(benchmark ?? overallGrade ?? null);
	const badgeVariant = $derived(
		benchmark === 'modern' ? 'default' : benchmark === 'outdated' ? 'secondary' : 'secondary'
	);

	/** Full breakdown for tooltip only. */
	const tooltipParts = $derived.by(() => {
		if (!website && !overallGrade) return [];
		const p: string[] = [];
		if (overallGrade) p.push(`Grade: ${overallGrade}`);
		if (website) {
			if (website.ux != null && String(website.ux).trim()) p.push(`UX: ${website.ux}`);
			if (website.ui != null && String(website.ui).trim()) p.push(`UI: ${website.ui}`);
			if (website.seo != null && String(website.seo).trim()) p.push(`SEO: ${website.seo}`);
			if (benchmark) p.push(`Benchmark: ${benchmark}`);
		}
		return p;
	});
	const title = $derived(
		!hasWebsiteGrading && !overallGrade
			? 'No website grading yet'
			: tooltipParts.length > 0
				? tooltipParts.join(' · ')
				: 'Website graded'
	);
</script>

<span
	class={cn(
		'inline-flex items-center text-muted-foreground text-sm',
		!badgeLabel && 'opacity-50'
	)}
	title={title}
	aria-label={title}
>
	{#if badgeLabel}
		<Badge
			variant={badgeVariant}
			class="shrink-0 capitalize text-xs"
		>
			{badgeLabel}
		</Badge>
	{:else}
		<span class="text-muted-foreground">—</span>
	{/if}
</span>
