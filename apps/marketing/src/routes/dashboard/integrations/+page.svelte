<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { LoaderCircle, CheckCircle2, Link2, Lock, Plus } from 'lucide-svelte';
	import { showFormToast } from '$lib/toast';

	type IntegrationId = 'notion' | 'hubspot' | 'gohighlevel' | 'pipedrive';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string }> & { success?: boolean; message?: string };
	}>();
	const plan = $derived(data.plan ?? 'free');
	const connections = $derived(data.connections ?? []);
	const notionConnection = $derived(data.notionConnection ?? { connected: false });
	const canConnect = $derived(data.canConnect ?? false);
	const hubspotConnected = $derived(connections.find((c) => c.provider === 'hubspot')?.connected ?? false);
	const ghlConnected = $derived(connections.find((c) => c.provider === 'gohighlevel')?.connected ?? false);
	const pipedriveConnected = $derived(connections.find((c) => c.provider === 'pipedrive')?.connected ?? false);

	let selectedId = $state<IntegrationId | null>(null);
	let syncing = $state<'notion' | 'hubspot' | 'gohighlevel' | 'pipedrive' | null>(null);

	const integrations = $derived([
		{
			id: 'notion' as const,
			name: 'Notion',
			description: 'Your dashboard clients list is powered by a Notion database.',
			logoSrc: '/integrations/notion.svg',
			connected: notionConnection.connected,
			locked: false
		},
		{
			id: 'hubspot' as const,
			name: 'HubSpot',
			description: 'Sync contacts from HubSpot. Use a Private App token.',
			logoSrc: '/integrations/hubspot.png',
			connected: hubspotConnected,
			locked: !canConnect
		},
		{
			id: 'gohighlevel' as const,
			name: 'GoHighLevel',
			description: 'Sync contacts from GoHighLevel. Sub-Account or Location token.',
			logoSrc: '/integrations/gohighlevel.jpeg',
			connected: ghlConnected,
			locked: !canConnect
		},
		{
			id: 'pipedrive' as const,
			name: 'Pipedrive',
			description: 'Sync contacts from Pipedrive. Company domain + API token.',
			logoSrc: '/integrations/pipedrive.png',
			connected: pipedriveConnected,
			locked: !canConnect
		}
	]);

	const selected = $derived(selectedId ? integrations.find((i) => i.id === selectedId) : null);

	$effect(() => {
		showFormToast(form);
		if (form?.success) invalidateAll();
	});
</script>

<svelte:head>
	<title>Integrations · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Integrations</h1>
		<p class="mt-1 text-muted-foreground">
			Connect the integrations you use; sync contacts into your dashboard from any of them.
		</p>
	</div>

	<!-- Left: column of integration tiles · Right: form / detail (toggle) -->
	<div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
		<!-- Column of integration cards (left) -->
		<div class="flex shrink-0 flex-col gap-2 lg:w-52">
			{#each integrations as integration}
				<button
					type="button"
					class="integration-tile flex w-full items-center gap-3 rounded-[12px] bg-[var(--surface)] p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cream)] {selectedId === integration.id
						? 'ring-2 ring-[var(--sage)] ring-offset-2 ring-offset-[var(--cream)]'
						: 'hover:bg-[rgba(61,90,62,0.08)]'} {integration.locked ? 'opacity-80' : ''}"
					onclick={() => (selectedId = selectedId === integration.id ? null : integration.id)}
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-1"
						aria-hidden="true"
					>
						<img
							src={integration.logoSrc}
							alt=""
							class="h-full w-full object-contain"
						/>
					</div>
					<span class="min-w-0 flex-1 truncate text-sm font-medium text-[var(--ink)]">{integration.name}</span>
					{#if integration.connected}
						<CheckCircle2 class="h-4 w-4 shrink-0 text-[var(--sage)]" />
					{:else if integration.locked}
						<Lock class="h-4 w-4 shrink-0 text-[var(--muted)]" />
					{/if}
				</button>
			{/each}
		</div>

		<!-- Form / detail panel (right), height aligned to left column -->
		<div class="flex min-w-0 flex-1 flex-col">
	{#if selected}
		<Card.Root class="integration-detail-card flex h-full min-h-0 flex-col border-0 rounded-[16px] bg-[var(--surface)] shadow-none {selected.connected ? 'ring-2 ring-[var(--sage)] ring-inset' : ''}">
			<Card.Header class="flex flex-row items-start gap-4">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-1.5"
					aria-hidden="true"
				>
					<img
						src={selected.logoSrc}
						alt=""
						class="h-full w-full object-contain"
					/>
				</div>
				<div class="min-w-0 flex-1 space-y-1">
					<div class="flex flex-wrap items-center gap-2">
						<Card.Title class="mb-0">{selected.name}</Card.Title>
						{#if selected.connected}
							<Badge variant="default" class="gap-1 font-normal">
								<CheckCircle2 class="h-3 w-3" />
								Connected
							</Badge>
						{/if}
					</div>
					<Card.Description>{selected.description}</Card.Description>
				</div>
			</Card.Header>
			<Card.Content class="flex flex-1 flex-col items-center justify-center pt-0">
				{#if selected.locked}
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground">
							CRM integrations are available on Pro and Agency plans. Upgrade to connect {selected.name} and
							sync contacts to your dashboard.
						</p>
						<Button variant="default" href="/dashboard/billing">Upgrade plan</Button>
					</div>
				{:else if selected.id === 'notion'}
					{#if selected.connected}
						<div class="flex flex-wrap items-center gap-2">
							<form
								method="POST"
								action="?/syncNotion"
								use:enhance={() => {
									syncing = 'notion';
									return async () => {
										syncing = null;
									};
								}}
								class="inline"
							>
								<Button type="submit" size="sm" disabled={syncing !== null}>
									{#if syncing === 'notion'}
										<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
									{:else}
										<Link2 class="mr-2 h-4 w-4" />
									{/if}
									Sync to dashboard
								</Button>
							</form>
							<p class="text-sm text-muted-foreground">
								Pull rows from your Notion database into your dashboard. Also sync from CRM integrations on the left.
							</p>
						</div>
					{:else}
						<form method="POST" action="?/connectNotion" use:enhance class="max-w-md space-y-4">
							<div class="grid grid-cols-1 gap-x-4 gap-y-4 items-center sm:grid-cols-[auto_1fr]">
								<Label for="notion-apiKey">API key</Label>
								<Input
									id="notion-apiKey"
									name="apiKey"
									type="password"
									placeholder="secret_..."
									autocomplete="off"
									class="font-mono text-sm"
								/>
								<Label for="notion-databaseId">Database ID</Label>
								<Input
									id="notion-databaseId"
									name="databaseId"
									type="text"
									placeholder="Paste your database ID"
									autocomplete="off"
									class="font-mono text-sm"
								/>
								<div class="sm:col-start-2">
									<Button type="submit">Connect Notion</Button>
								</div>
							</div>
						</form>
					{/if}
				{:else if selected.connected}
					<!-- CRM connected: Sync + Disconnect -->
					<div class="flex flex-wrap items-center gap-2">
						<form
							method="POST"
							action={selected.id === 'hubspot'
								? '?/syncHubSpot'
								: selected.id === 'gohighlevel'
									? '?/syncGoHighLevel'
									: '?/syncPipedrive'}
							use:enhance={() => {
								syncing = selected.id;
								return async () => {
									syncing = null;
								};
							}}
							class="inline"
						>
							<Button type="submit" size="sm" disabled={syncing !== null}>
								{#if syncing === selected.id}
									<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<Link2 class="mr-2 h-4 w-4" />
								{/if}
								Sync to dashboard
							</Button>
						</form>
						<form
							method="POST"
							action={selected.id === 'hubspot'
								? '?/disconnectHubSpot'
								: selected.id === 'gohighlevel'
									? '?/disconnectGoHighLevel'
									: '?/disconnectPipedrive'}
							use:enhance
							class="inline"
						>
							<Button type="submit" variant="ghost" size="sm">Disconnect</Button>
						</form>
					</div>
				{:else}
					<!-- CRM connect form -->
					{#if selected.id === 'hubspot'}
						<form method="POST" action="?/connectHubSpot" use:enhance class="max-w-md space-y-4">
							<div class="grid grid-cols-1 gap-x-4 gap-y-4 items-center sm:grid-cols-[auto_1fr]">
								<Label for="hubspot-apiKey">Private App token</Label>
								<div class="space-y-1">
									<Input
										id="hubspot-apiKey"
										name="apiKey"
										type="password"
										placeholder="pat-na1-..."
										autocomplete="off"
										class="font-mono text-sm"
									/>
									<p class="text-xs text-muted-foreground">HubSpot → Settings → Integrations → Private Apps</p>
								</div>
								<div class="sm:col-start-2">
									<Button type="submit">Connect HubSpot</Button>
								</div>
							</div>
						</form>
					{:else if selected.id === 'gohighlevel'}
						<form method="POST" action="?/connectGoHighLevel" use:enhance class="max-w-md space-y-4">
							<div class="grid grid-cols-1 gap-x-4 gap-y-4 items-center sm:grid-cols-[auto_1fr]">
								<Label for="ghl-apiKey">API token</Label>
								<div class="space-y-1">
									<Input
										id="ghl-apiKey"
										name="apiKey"
										type="password"
										placeholder="Your token"
										autocomplete="off"
										class="font-mono text-sm"
									/>
									<p class="text-xs text-muted-foreground">Sub-Account or Location token with contacts.readonly</p>
								</div>
								<div class="sm:col-start-2">
									<Button type="submit">Connect GoHighLevel</Button>
								</div>
							</div>
						</form>
					{:else}
						<form method="POST" action="?/connectPipedrive" use:enhance class="max-w-md space-y-4">
							<div class="grid grid-cols-1 gap-x-4 gap-y-4 items-center sm:grid-cols-[auto_1fr]">
								<Label for="pipedrive-domain">Company domain</Label>
								<Input
									id="pipedrive-domain"
									name="domain"
									type="text"
									placeholder="mycompany"
									autocomplete="off"
									class="font-mono text-sm"
								/>
								<Label for="pipedrive-apiKey">API token</Label>
								<div class="space-y-1">
									<Input
										id="pipedrive-apiKey"
										name="apiKey"
										type="password"
										placeholder="••••••••"
										autocomplete="off"
										class="font-mono text-sm"
									/>
									<p class="text-xs text-muted-foreground">Pipedrive → Settings → Personal preferences → API</p>
								</div>
								<div class="sm:col-start-2">
									<Button type="submit">Connect Pipedrive</Button>
								</div>
							</div>
						</form>
					{/if}
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
			<div class="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-[16px] bg-[var(--surface)] px-6 py-10 text-center">
				<Plus class="h-10 w-10 shrink-0 text-[var(--muted)]/50" />
				<p class="text-sm font-medium text-[var(--muted)]">Select an integration</p>
				<p class="text-xs text-[var(--muted)]">Choose one from the left to connect or manage it</p>
			</div>
	{/if}
		</div>
	</div>
</div>
