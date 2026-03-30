<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ChevronRight, LoaderCircle, RefreshCw, Trash2, RotateCcw } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { toastSuccess, toastError } from '$lib/toast';

	let {
		prospectId,
		hasDemoLink = false,
		demoJobStatus,
		trackingStatus,
		detailHref = `/dashboard/prospects/${prospectId}`,
		showDelete = false,
		showRestore = false,
		processing = false,
		onRegenerateQueued
	}: {
		prospectId: string;
		hasDemoLink?: boolean;
		demoJobStatus?: 'pending' | 'creating' | 'done' | 'failed';
		trackingStatus?: 'draft' | 'approved' | 'sent' | 'opened' | 'clicked' | 'replied';
		detailHref?: string;
		/** Show soft-delete icon (set flagged = true). */
		showDelete?: boolean;
		/** Show restore icon (set flagged = false). */
		showRestore?: boolean;
		/** When true, disable action buttons but keep the details link clickable. */
		processing?: boolean;
		/** Called when regenerate is queued so the parent can start demo job polling. */
		onRegenerateQueued?: () => void;
	} = $props();

	let regenerating = $state(false);
	let flagging = $state(false);
	let restoring = $state(false);

	const demoJobActive = $derived(demoJobStatus === 'pending' || demoJobStatus === 'creating');
	const canRegenerate = $derived(
		hasDemoLink && !['approved', 'sent', 'opened', 'clicked', 'replied'].includes(trackingStatus ?? '')
	);
	/** When in queue, allow all actions except undo (restore). */
	const regenerateDisabled = $derived(false);
	const restoreDisabled = $derived(restoring || processing);
</script>

<div class="flex items-center justify-end gap-1">
	{#if canRegenerate}
		<form
			method="POST"
			action="?/regenerateDemo"
			use:enhance={() => {
				regenerating = true;
				const timeoutMs = 150_000; // 2.5 min fallback so spinner never sticks
				const t = setTimeout(() => {
					regenerating = false;
				}, timeoutMs);
				return async ({ result }) => {
					try {
						if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
							const d = result.data as { queued?: boolean; alreadyQueued?: boolean };
							if (d.queued) {
								toastSuccess(
									d.alreadyQueued ? 'Demo already in progress' : 'Regeneration queued',
									d.alreadyQueued ? 'Demo is being regenerated. The list will update when ready.' : 'Usually 1–2 minutes. The list will update when ready.'
								);
								await invalidateAll();
								onRegenerateQueued?.();
							} else {
								toastSuccess('Demo regenerated', 'Content and images updated.');
								await invalidateAll();
							}
						} else if (result.type === 'failure' && result.data && typeof result.data === 'object' && 'message' in result.data) {
							toastError('Regenerate', String((result.data as { message?: string }).message));
							await applyAction(result);
						}
					} finally {
						clearTimeout(t);
						regenerating = false;
					}
				};
			}}
			class="inline-flex"
		>
			<input type="hidden" name="prospectId" value={prospectId} />
			<Tooltip.Root>
				<Tooltip.Trigger
					type="submit"
					class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}
					disabled={regenerating || demoJobActive || regenerateDisabled}
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
	{/if}
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
		<Tooltip.Content side="top" sideOffset={6}>
			View prospect details
		</Tooltip.Content>
	</Tooltip.Root>
	{#if showDelete || showRestore}
		<div class="ml-3 pl-3 border-l border-border flex items-center gap-1">
			{#if showDelete}
				<form
					method="POST"
					action="?/setFlagged"
					use:enhance={() => {
						flagging = true;
						const unlockMs = 30_000;
						const t = setTimeout(() => {
							flagging = false;
						}, unlockMs);
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									toastSuccess('Moved to Deleted / not fit');
									await invalidateAll();
								} else if (result.type === 'failure' && result.data && typeof result.data === 'object' && 'message' in result.data) {
									toastError('Remove', String((result.data as { message?: string }).message));
									await applyAction(result);
								}
							} finally {
								clearTimeout(t);
								flagging = false;
							}
						};
					}}
					class="inline-flex"
				>
					<input type="hidden" name="prospectId" value={prospectId} />
					<Tooltip.Root>
						<Tooltip.Trigger
							type="submit"
							class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-muted-foreground hover:text-destructive')}
							disabled={flagging}
							aria-label="Remove from pipeline"
						>
							{#if flagging}
								<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
							{:else}
								<Trash2 class="size-4" aria-hidden="true" />
							{/if}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={6}>
							Remove from pipeline (move to Deleted / not fit)
						</Tooltip.Content>
					</Tooltip.Root>
				</form>
			{/if}
			{#if showRestore}
				<form
					method="POST"
					action="?/restoreProspect"
					use:enhance={() => {
						restoring = true;
						const unlockMs = 30_000;
						const t = setTimeout(() => {
							restoring = false;
						}, unlockMs);
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									toastSuccess('Restored to pipeline');
									await invalidateAll();
								} else if (result.type === 'failure' && result.data && typeof result.data === 'object' && 'message' in result.data) {
									toastError('Restore', String((result.data as { message?: string }).message));
									await applyAction(result);
								}
							} finally {
								clearTimeout(t);
								restoring = false;
							}
						};
					}}
					class="inline-flex"
				>
					<input type="hidden" name="prospectId" value={prospectId} />
					<Tooltip.Root>
						<Tooltip.Trigger
							type="submit"
							class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-muted-foreground hover:text-foreground')}
							disabled={restoreDisabled}
							aria-label="Restore to pipeline"
						>
							{#if restoring}
								<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
							{:else}
								<RotateCcw class="size-4" aria-hidden="true" />
							{/if}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" sideOffset={6}>
							{restoreDisabled && processing
								? 'Restore unavailable while prospect is in queue'
								: 'Restore to pipeline (remove from Deleted / not fit)'}
						</Tooltip.Content>
					</Tooltip.Root>
				</form>
			{/if}
		</div>
	{/if}
</div>
