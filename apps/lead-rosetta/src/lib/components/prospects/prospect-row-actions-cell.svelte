<script lang="ts">
	import { Sparkles, LoaderCircle } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import DataTableActionsCell from '$lib/components/prospects/data-table-actions-cell.svelte';

	let {
		prospectId,
		showGenerate = false,
		processing = false,
		generating = false,
		onProcessNextStep,
		detailHref = `/dashboard/prospects/${prospectId}`,
		hasDemoLink = false,
		demoJobStatus,
		showDelete = false,
		showRestore = false,
		onRegenerateQueued
	}: {
		prospectId: string;
		showGenerate?: boolean;
		processing?: boolean;
		generating?: boolean;
		onProcessNextStep?: (prospectId: string) => void;
		detailHref?: string;
		hasDemoLink?: boolean;
		demoJobStatus?: 'pending' | 'creating' | 'done' | 'failed';
		showDelete?: boolean;
		showRestore?: boolean;
		onRegenerateQueued?: () => void;
	} = $props();

	/** Allow sparkles when in queue so user can re-trigger or see status; only block while actively generating. */
	const canGenerate = $derived(showGenerate && !generating);
</script>

<div class="flex items-center justify-end gap-1">
	{#if showGenerate}
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="h-8 w-8 text-muted-foreground hover:text-foreground"
					disabled={!canGenerate}
					aria-label="Run next step"
					onclick={() => onProcessNextStep?.(prospectId)}
				>
					{#if generating}
						<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
					{:else}
						<Sparkles class="size-4" aria-hidden="true" />
					{/if}
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="top" sideOffset={6}>
				{#if canGenerate}
					Run next step: pull insights or create demo
				{:else if generating}
					Processing…
				{:else if processing}
					Row is in queue; you can still run next step or other actions
				{:else}
					Run next step
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
	{/if}
	<DataTableActionsCell
		{prospectId}
		{hasDemoLink}
		{demoJobStatus}
		detailHref={detailHref}
		{showDelete}
		{showRestore}
		{processing}
		{onRegenerateQueued}
	/>
</div>
