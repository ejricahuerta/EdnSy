<script lang="ts">
	import type { Column } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-svelte';

	let { column, label }: { column: Column<unknown, unknown>; label: string } = $props();
	const sorted = $derived(column.getIsSorted());
	const direction = $derived(column.getIsSorted() === 'asc' ? 'asc' : column.getIsSorted() === 'desc' ? 'desc' : null);
</script>

<Button
	variant="ghost"
	class="-ms-3 font-semibold text-[var(--ink)] hover:text-[var(--sage)]"
	onclick={(e) => column.getToggleSortingHandler()?.(e)}
>
	{label}
	{#if direction === 'asc'}
		<ArrowUp class="size-3 shrink-0 opacity-60" aria-hidden="true" />
	{:else if direction === 'desc'}
		<ArrowDown class="size-3 shrink-0 opacity-60" aria-hidden="true" />
	{:else}
		<ArrowUpDown class="size-3 shrink-0 opacity-35" aria-hidden="true" />
	{/if}
</Button>
