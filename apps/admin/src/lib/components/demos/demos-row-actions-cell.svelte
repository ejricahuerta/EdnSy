<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { toastSuccess, toastError } from '$lib/toast';
	import { cn } from '$lib/utils';
	import { ChevronRight, LoaderCircle, RefreshCw } from 'lucide-svelte';

	let {
		prospectId,
		demoJobStatus
	}: {
		prospectId: string;
		demoJobStatus?: 'pending' | 'creating' | 'done' | 'failed';
	} = $props();

	const detailHref = $derived(
		`/dashboard/prospects/${prospectId}?returnTo=${encodeURIComponent('/dashboard/demos')}`
	);
	let regenerating = $state(false);

	const demoJobActive = $derived(demoJobStatus === 'pending' || demoJobStatus === 'creating');
</script>

<div class="flex items-center justify-end gap-1">
	<form
		method="POST"
		action="/dashboard/prospects?/regenerateDemo"
		class="inline-flex"
		use:enhance={() => {
			regenerating = true;
			const timeoutMs = 150_000;
			const t = setTimeout(() => {
				regenerating = false;
			}, timeoutMs);
			return async ({ result }) => {
				try {
					if (
						result.type === 'success' &&
						result.data &&
						typeof result.data === 'object' &&
						'success' in result.data &&
						result.data.success
					) {
						const d = result.data as { queued?: boolean; alreadyQueued?: boolean };
						if (d.queued) {
							toastSuccess(
								d.alreadyQueued ? 'Demo already in progress' : 'Regeneration queued',
								d.alreadyQueued
									? 'Demo is being regenerated. The list will update when ready.'
									: 'Usually 1–2 minutes. The list will update when ready.'
							);
							await invalidateAll();
						} else {
							toastSuccess('Demo regenerated', 'Content and images updated.');
							await invalidateAll();
						}
					} else if (
						result.type === 'failure' &&
						result.data &&
						typeof result.data === 'object' &&
						'message' in result.data
					) {
						toastError('Regenerate', String((result.data as { message?: string }).message));
						await applyAction(result);
					}
				} finally {
					clearTimeout(t);
					regenerating = false;
				}
			};
		}}
	>
		<input type="hidden" name="prospectId" value={prospectId} />
		<Tooltip.Root>
			<Tooltip.Trigger
				type="submit"
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
				disabled={regenerating || demoJobActive}
				aria-label="Regenerate demo"
			>
				{#if regenerating}
					<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
				{:else}
					<RefreshCw class="size-4" aria-hidden="true" />
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Content side="top" sideOffset={6}>
				{#if demoJobActive}
					Demo is being created; wait before regenerating
				{:else}
					Regenerate demo (usually 1–2 minutes)
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
	</form>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<a
				href={detailHref}
				class="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
				aria-label="View prospect details"
			>
				<ChevronRight class="h-4 w-4" />
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="top" sideOffset={6}>View prospect details</Tooltip.Content>
	</Tooltip.Root>
</div>
