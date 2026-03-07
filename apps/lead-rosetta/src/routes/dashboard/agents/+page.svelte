<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import type { ContentSlot } from './$types';

	type AgentTabId = 'design' | 'demo-chat' | 'demo-creation';

	const EDITABLE_AGENTS: { id: AgentTabId; label: string; description: string }[] = [
		{
			id: 'design',
			label: 'Design',
			description: 'Tone selection prompt. Use {{context}} for business context. Default is used until you save a version.'
		},
		{
			id: 'demo-chat',
			label: 'Demo Chat',
			description: 'System instruction for the demo page assistant. Use {{businessName}} for the business name.'
		},
		{
			id: 'demo-creation',
			label: 'Demo Creation',
			description: 'Audit and audit modal copy prompts. Use {{context}} where context is injected.'
		}
	];

	let { data, form } = $props<{
		data: { slots: ContentSlot[] };
		form?: { success?: boolean; error?: string; version?: number };
	}>();

	const slotsByAgent = $derived.by(() => {
		const map: Record<AgentTabId, ContentSlot[]> = { design: [], 'demo-chat': [], 'demo-creation': [] };
		for (const slot of data.slots ?? []) {
			if (slot.agentId in map) {
				map[slot.agentId as AgentTabId].push(slot);
			}
		}
		return map;
	});

	function slotKey(slot: ContentSlot): string {
		return `${slot.agentId}-${slot.contentType}-${slot.key}`;
	}

	let selectedTab = $state<AgentTabId>('design');
	let editingBodies = $state<Record<string, string>>({});

	$effect(() => {
		const slots = data.slots ?? [];
		if (slots.length === 0) return;
		editingBodies = {
			...editingBodies,
			...Object.fromEntries(slots.map((s) => [slotKey(s), s.body]))
		};
	});

	$effect(() => {
		if (form?.success && form?.version != null) {
			toast.success('Saved', { description: `New version: ${form.version}` });
			invalidateAll();
		}
		if (form?.success === false && form?.error) {
			toast.error('Save failed', { description: form.error });
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

	<Tabs.Root bind:value={selectedTab} class="w-full">
		<Tabs.List class="grid w-full grid-cols-3 gap-1">
			{#each EDITABLE_AGENTS as agent}
				<Tabs.Trigger value={agent.id}>{agent.label}</Tabs.Trigger>
			{/each}
		</Tabs.List>
		{#each EDITABLE_AGENTS as agent}
			<Tabs.Content value={agent.id} class="mt-6 space-y-4">
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
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
