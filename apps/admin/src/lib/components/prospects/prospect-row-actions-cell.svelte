<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Sparkles, LoaderCircle, Send, Mail } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import DataTableActionsCell from '$lib/components/prospects/data-table-actions-cell.svelte';
	import { toastSuccess, toastError } from '$lib/toast';

	let {
		prospectId,
		showGenerate = false,
		showSendDemo = false,
		gmailConnected = true,
		prospectLabel = '',
		processing = false,
		generating = false,
		onProcessNextStep,
		detailHref = `/dashboard/prospects/${prospectId}`,
		hasDemoLink = false,
		demoJobStatus,
		trackingStatus,
		showDelete = false,
		showRestore = false,
		onRegenerateQueued,
		onSendDemoSuccess
	}: {
		prospectId: string;
		showGenerate?: boolean;
		showSendDemo?: boolean;
		prospectLabel?: string;
		processing?: boolean;
		generating?: boolean;
		onProcessNextStep?: (prospectId: string) => void;
		detailHref?: string;
		hasDemoLink?: boolean;
		demoJobStatus?: 'pending' | 'creating' | 'done' | 'failed';
		trackingStatus?: 'draft' | 'approved' | 'email_draft' | 'sent' | 'opened' | 'clicked' | 'replied';
		showDelete?: boolean;
		showRestore?: boolean;
		onRegenerateQueued?: () => void;
		onSendDemoSuccess?: () => void;
	} = $props();

	/** Block while a job is in progress for this row or while the client request is in flight. */
	const canGenerate = $derived(showGenerate && !generating && !processing);

	let sendDemoDialogOpen = $state(false);
	let sendDemoForm: HTMLFormElement | null = $state(null);
	let sendingDemo = $state(false);

	const who = $derived(prospectLabel.trim() || prospectId.slice(0, 8));

	function ensureAupInput(formEl: HTMLFormElement | null) {
		if (!formEl) return;
		let input = formEl.querySelector<HTMLInputElement>('input[name="aupConfirmed"]');
		if (!input) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'aupConfirmed';
			formEl.appendChild(input);
		}
		input.value = 'on';
	}

	function submitSendDemo() {
		if (!sendDemoForm || sendingDemo) return;
		ensureAupInput(sendDemoForm);
		sendDemoForm.requestSubmit();
	}
</script>

<div class="flex items-center justify-end gap-1">
	{#if showSendDemo && !gmailConnected}
		<a
			href="/dashboard/integrations"
			class={cn(
				buttonVariants({ variant: 'ghost', size: 'icon' }),
				'h-8 w-8 text-muted-foreground hover:text-foreground'
			)}
			aria-label="Connect Gmail"
			title="Connect Gmail in Integrations to create drafts"
		>
			<Mail class="size-4" aria-hidden="true" />
		</a>
	{:else if showSendDemo}
		<form
			bind:this={sendDemoForm}
			method="POST"
			action="?/sendDemos"
			use:enhance={() => {
				sendingDemo = true;
				return async ({
					result
				}: {
					result: import('$app/forms').ActionResult;
				}) => {
					try {
						if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
							toastSuccess('Gmail draft created', prospectLabel || prospectId, undefined, {
								activity: `Created Gmail draft for ${who}.`
							});
							sendDemoDialogOpen = false;
							await invalidateAll();
							onSendDemoSuccess?.();
						} else if (result.type === 'failure' && result.data?.message) {
							toastError('Gmail draft', (result.data as { message?: string }).message, undefined, {
								activity: `Could not create Gmail draft for ${who}.`
							});
							await applyAction(result);
						}
					} finally {
						sendingDemo = false;
					}
				};
			}}
			class="inline-flex"
		>
			<input type="hidden" name="prospectId" value={prospectId} />
			<AlertDialog.Root bind:open={sendDemoDialogOpen}>
				<AlertDialog.Trigger
					type="button"
					class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-muted-foreground hover:text-foreground')}
					aria-label="Create Gmail draft"
					title="Create Gmail draft"
					onclick={() => (sendDemoDialogOpen = true)}
				>
					<Send class="size-4" aria-hidden="true" />
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Create Gmail draft for this client?</AlertDialog.Title>
						<AlertDialog.Description>
							A draft with the demo link will be created in your Gmail for {prospectLabel || prospectId}. Any previous draft for this prospect is replaced.
							<br /><br />
							<strong>You accept the Acceptable Use Policy (AUP).</strong>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel disabled={sendingDemo}>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action type="button" disabled={sendingDemo} onclick={submitSendDemo}>
							{#if sendingDemo}
								<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
							{/if}
							{sendingDemo ? 'Working…' : 'Create draft'}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</form>
	{:else if showGenerate}
		<Tooltip.Root>
			<Tooltip.Trigger
				type="button"
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-muted-foreground hover:text-foreground')}
				disabled={!canGenerate}
				aria-label="Run next step"
				onclick={() => {
					if (!canGenerate) return;
					onProcessNextStep?.(prospectId);
				}}
			>
				{#if generating}
					<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
				{:else}
					<Sparkles class="size-4" aria-hidden="true" />
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Content side="top" sideOffset={6}>
				{#if generating}
					Processing…
				{:else if processing}
					Wait until this row finishes processing
				{:else}
					Run next step: pull insights or create demo
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
	{/if}
	<DataTableActionsCell
		{prospectId}
		{prospectLabel}
		{hasDemoLink}
		{demoJobStatus}
		{trackingStatus}
		detailHref={detailHref}
		{showDelete}
		{showRestore}
		{processing}
		{onRegenerateQueued}
	/>
</div>
