<script lang="ts">
	import type { Prospect } from '$lib/server/prospects';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { toastSuccess, toastError } from '$lib/toast';
	import { Info, Trash2, ExternalLink, MoreVertical, Sparkles } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { prospect, onView, showDelete = false, onCreateDemo, atDemoLimit = false }: {
		prospect: Prospect;
		onView: (p: Prospect) => void;
		showDelete?: boolean;
		onCreateDemo?: (p: Prospect) => void;
		atDemoLimit?: boolean;
	} = $props();
	let deleteDialogOpen = $state(false);
	let deleteForm: HTMLFormElement | null = $state(null);
	/** Captured at submit time so the toast shows the correct name after invalidateAll() re-renders the list. */
	let deletedProspectLabel = $state<string | null>(null);

	function submitDelete() {
		deletedProspectLabel = prospect.companyName || prospect.email || prospect.id;
		deleteDialogOpen = false;
		deleteForm?.requestSubmit();
	}
</script>

<div class="flex items-center justify-end">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
			aria-label="Row actions"
			type="button"
		>
			<MoreVertical class="h-4 w-4" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-48">
			<DropdownMenu.Item
				onclick={() => {
					onView(prospect);
				}}
				onselect={() => {
					onView(prospect);
				}}
			>
				<Info class="h-4 w-4" />
				View details
			</DropdownMenu.Item>
			{#if !prospect.demoLink && onCreateDemo}
				<DropdownMenu.Item
					disabled={atDemoLimit}
					onclick={() => onCreateDemo(prospect)}
					onselect={() => onCreateDemo(prospect)}
				>
					<Sparkles class="h-4 w-4" />
					Create Demo
				</DropdownMenu.Item>
			{/if}
			{#if prospect.demoLink}
				<DropdownMenu.Item
					onclick={() => window.open(prospect.demoLink!, '_blank', 'noopener,noreferrer')}
					onselect={() => window.open(prospect.demoLink!, '_blank', 'noopener,noreferrer')}
				>
					<ExternalLink class="h-4 w-4" />
					Open demo
				</DropdownMenu.Item>
			{/if}
			{#if showDelete}
				<DropdownMenu.Item
					variant="destructive"
					onclick={() => (deleteDialogOpen = true)}
					onselect={() => (deleteDialogOpen = true)}
				>
					<Trash2 class="h-4 w-4" />
					Remove
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

{#if showDelete}
	<form
		bind:this={deleteForm}
		method="POST"
		action="?/deleteProspect"
		use:enhance={() => async ({ result }) => {
			if (result.type === 'success') {
				const label = deletedProspectLabel ?? (prospect.companyName || prospect.email || prospect.id);
				await invalidateAll();
				toastSuccess('Client removed', label);
				deletedProspectLabel = null;
			} else if (result.type === 'failure' && result.data?.message) {
				toastError('Remove client', result.data.message);
				deletedProspectLabel = null;
			}
		}}
		class="hidden"
	>
		<input type="hidden" name="prospectId" value={prospect.id} />
		<AlertDialog.Root bind:open={deleteDialogOpen}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Remove client</AlertDialog.Title>
					<AlertDialog.Description>
						Remove this client from the list? This cannot be undone.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" onclick={submitDelete}>
						Remove
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</form>
{/if}
