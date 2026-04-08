<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { untrack } from 'svelte';
	import { toastSuccess, toastError } from '$lib/toast';
	import type { ContentSlot } from './+page.server';

	type AgentId = 'email' | 'gbp' | 'demo-chat';

	const EDITABLE_AGENTS: { id: AgentId; label: string; description: string }[] = [
		{
			id: 'email',
			label: 'Email AI Agent',
			description: 'Prompt for AI-generated outreach email subject and body intro. Use {{company}}, {{industry}}, {{senderName}} for context.'
		},
		{
			id: 'gbp',
			label: 'GBP AI Agent',
			description: 'Prompt for grading a Google Business Profile (score, label, reasoning). Use {{context}} where the GBP summary is injected.'
		},
		{
			id: 'demo-chat',
			label: 'Demo AI Agent (chat)',
			description: 'System instruction for the demo page assistant. Use {{businessName}} for the business name.'
		}
	];

	let { data, form } = $props<{
		data: { slots: ContentSlot[] };
		form?: { success?: boolean; error?: string; version?: number };
	}>();

	const slotsByAgent = $derived.by(() => {
		const map: Record<AgentId, ContentSlot[]> = { email: [], gbp: [], 'demo-chat': [] };
		for (const slot of data.slots ?? []) {
			if (slot.agentId in map) {
				map[slot.agentId as AgentId].push(slot);
			}
		}
		return map;
	});

	function slotKey(slot: ContentSlot): string {
		return `${slot.agentId}-${slot.contentType}-${slot.key}`;
	}

	let editingBodies = $state<Record<string, string>>({});

	$effect(() => {
		const slots = data.slots ?? [];
		if (slots.length === 0) return;
		const fromServer = Object.fromEntries(slots.map((s: ContentSlot) => [slotKey(s), s.body]));
		editingBodies = { ...untrack(() => editingBodies), ...fromServer };
	});

	$effect(() => {
		if (form?.success && form?.version != null) {
			toastSuccess('Saved', `New version: ${form.version}`);
			invalidateAll();
		}
		if (form?.success === false && form?.error) {
			toastError('Save failed', form.error);
		}
	});
</script>

<svelte:head>
	<title>AI Agents · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">AI Agents</h1>
		<p class="text-muted-foreground">
			Prompts and knowledge base are versioned in the database. The app uses the default from code until you save an override below.
		</p>
	</div>

	<div class="space-y-8">
		{#each EDITABLE_AGENTS as agent}
			<Card.Root>
				<Card.Header>
					<Card.Title>{agent.label}</Card.Title>
					<Card.Description>{agent.description}</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					{#each slotsByAgent[agent.id] as slot}
						<div class="space-y-2">
							<div class="flex items-center justify-between gap-2">
								<Label for="body-{slot.agentId}-{slot.contentType}-{slot.key}" class="font-medium">
									{slot.label}
								</Label>
								<div class="flex items-center gap-2">
									<Badge variant={slot.source === 'override' ? 'default' : 'secondary'}>
										{slot.source === 'override' ? `Version ${slot.version ?? 1}` : 'Default'}
									</Badge>
								</div>
							</div>
							<form
								method="POST"
								action="?/save"
								use:enhance={() => {
									return async ({ result, update }) => {
										await update();
									};
								}}
								class="space-y-2"
							>
								<input type="hidden" name="agentId" value={slot.agentId} />
								<input type="hidden" name="contentType" value={slot.contentType} />
								<input type="hidden" name="key" value={slot.key} />
								<Textarea
									id="body-{slot.agentId}-{slot.contentType}-{slot.key}"
									name="body"
									bind:value={editingBodies[slotKey(slot)]}
									rows={slot.contentType === 'knowledge_base' ? 6 : 12}
									class="font-mono text-sm"
									placeholder={slot.source === 'default' ? 'Leave empty to keep using the default from code.' : ''}
								/>
								<Button type="submit" size="sm">Save as new version</Button>
							</form>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
