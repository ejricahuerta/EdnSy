<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { website }: { website: string | null | undefined } = $props();

	const url = $derived((website ?? '').trim());
	const href = $derived(url && /^https?:\/\//i.test(url) ? url : url ? `https://${url}` : null);
	const display = $derived(url.length > 40 ? url.slice(0, 37) + '…' : url || null);
</script>

<span class={cn('inline-flex items-center gap-1 text-sm text-muted-foreground', !display && 'opacity-50')}>
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
