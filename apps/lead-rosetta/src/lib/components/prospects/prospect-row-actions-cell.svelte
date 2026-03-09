<script lang="ts">
	import { applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Sparkles, LoaderCircle, Mail } from 'lucide-svelte';
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
		prospectLabel = '',
		processing = false,
		generating = false,
		onProcessNextStep,
		detailHref = `/dashboard/prospects/${prospectId}`,
		hasDemoLink = false,
		demoJobStatus,
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
		showDelete?: boolean;
		showRestore?: boolean;
		onRegenerateQueued?: () => void;
		onSendDemoSuccess?: () => void;
	} = $props();

	/** Allow sparkles when in queue so user can re-trigger or see status; only block while actively generating. */
	const canGenerate = $derived(showGenerate && !generating);

	let sendDemoDialogOpen = $state(false);
	let sendDemoForm: HTMLFormElement | null = $state(null);
	let sendingDemo = $state(false);

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
	{#if showSendDemo}
		<form
			bind:this={sendDemoForm}
			method="POST"
			action="?/sendDemos"
			use:enhance={() => {
				sendingDemo = true;
				return async ({ result }) => {
					try {
						if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
							toastSuccess('Email sent', prospectLabel || prospectId);
							sendDemoDialogOpen = false;
							await invalidateAll();
							onSendDemoSuccess?.();
						} else if (result.type === 'failure' && result.data?.message) {
							toastError('Send demo', (result.data as { message?: string }).message);
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
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<button
							type="button"
							class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8 text-muted-foreground hover:text-foreground')}
							aria-label="Send demo by email"
							onclick={() => (sendDemoDialogOpen = true)}
							use:builder.action
							{...builder.props}
						>
							<Mail class="size-4" aria-hidden="true" />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content side="top" sideOffset={6}>
						Send demo by email
					</Tooltip.Content>
				</Tooltip.Root>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Send demo to this client?</AlertDialog.Title>
						<AlertDialog.Description>
							An email with the demo link will be sent to {prospectLabel || prospectId}.
							<br><br>
							<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel disabled={sendingDemo}>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action type="button" disabled={sendingDemo} onclick={submitSendDemo}>
							{#if sendingDemo}
								<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
							{/if}
							{sendingDemo ? 'Sending…' : 'Send email'}
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
				onclick={() => onProcessNextStep?.(prospectId)}
			>
				{#if generating}
					<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
				{:else}
					<Sparkles class="size-4" aria-hidden="true" />
				{/if}
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
