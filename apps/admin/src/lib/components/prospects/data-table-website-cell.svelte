<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { DemoAudit } from '$lib/demo';

	let { website, audit = null }: { website: string | null | undefined; audit?: DemoAudit | null } = $props();

	const url = $derived((website ?? '').trim());
	const href = $derived(url && /^https?:\/\//i.test(url) ? url : url ? `https://${url}` : null);
	const display = $derived(url.length > 40 ? url.slice(0, 37) + '…' : url || null);

	const overallGrade = $derived(
		audit?.insight?.grade != null && String(audit.insight.grade).trim()
			? String(audit.insight.grade).trim()
			: null
	);
	const benchmark = $derived(
		audit?.insight?.website?.benchmark === 'modern' || audit?.insight?.website?.benchmark === 'outdated'
			? audit.insight.website.benchmark
			: null
	);
	const gradeLabel = $derived(benchmark ?? overallGrade ?? 'Not graded');
	// Circle color: modern = success/green, outdated = warning/amber, letter grade = muted, not graded = muted dim
	const circleClass = $derived(
		benchmark === 'modern'
			? 'shrink-0 size-2.5 rounded-full bg-emerald-600'
			: benchmark === 'outdated'
				? 'shrink-0 size-2.5 rounded-full bg-amber-500'
				: overallGrade != null
					? 'shrink-0 size-2.5 rounded-full bg-muted-foreground'
					: 'shrink-0 size-2.5 rounded-full bg-muted-foreground/50'
	);
</script>

<span class={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', !display && 'opacity-50')}>
	<span class={circleClass} title={gradeLabel} aria-label={gradeLabel}></span>
	{#if display && href}
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1 truncate max-w-[14rem] hover:underline"
			title={url}
		>
			<span class="truncate">{display}</span>
			<ExternalLink class="size-3.5 shrink-0" aria-hidden="true" />
		</a>
	{:else if display}
		<span class="truncate max-w-[14rem]" title={url}>{display}</span>
	{:else}
		—
	{/if}
</span>
