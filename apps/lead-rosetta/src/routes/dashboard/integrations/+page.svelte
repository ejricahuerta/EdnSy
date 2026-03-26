<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toastSuccess, toastError, toastFromActionResult } from '$lib/toast';
	import { LoaderCircle, CheckCircle2, Link2, Lock, Plus, Eye, EyeOff, Pencil, Database, MapPin } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select';

	type IntegrationId = 'notion' | 'gbp-dental';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string }> & { success?: boolean; message?: string };
	}>();
	const connections = $derived(data.connections ?? []);
	const gmailConnected = $derived(data.gmailConnected ?? false);
	const gmailEmail = $derived(data.gmailEmail ?? null);
	const gbpDentalTodayCount = $derived(data.gbpDentalTodayCount ?? 0);
	const gbpDentalDailyCap = $derived(data.gbpDentalDailyCap ?? 25);
	const gbpDentalPullLock = $derived(
		data.gbpDentalPullLock ?? { locked: false, remainingSeconds: 0, lockMinutes: 15 }
	);
	const gbpDentalLockMinutesRemaining = $derived(
		Math.ceil((gbpDentalPullLock.remainingSeconds ?? 0) / 60)
	);
	const placesApiConfigured = $derived(data.placesApiConfigured ?? false);
	const notionConnected = $derived(connections.find((c) => c.provider === 'notion')?.connected ?? false);
	const notionDatabaseId = $derived(data.notionDatabaseId ?? null);
	const notionDatabaseTitle = $derived(data.notionDatabaseTitle ?? null);
	function truncateNotionId(id: string | null): string {
		if (!id) return '—';
		return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
	}
	let selectedId = $state<IntegrationId | null>(null);
	let syncing = $state<'notion' | 'gbp-dental' | null>(null);
	let disconnectNotionOpen = $state(false);
	let notionDisconnectForm: HTMLFormElement | null = $state(null);
	/** Toggle show/hide for masked credential fields when connected */
	let showConnectedKeys = $state(false);
	/** When true, credentials are loaded and form is in edit mode; eye reveals actual values */
	let editingCredentials = $state(false);
	/** Loaded credential values for the selected integration (only set when editing) */
	let editValues = $state<{ apiKey?: string; databaseId?: string; domain?: string }>({});
	let loadingCredentials = $state(false);
	/** Notion: API key for connect form (shared with Load databases form) */
	let notionApiKey = $state('');
	/** Notion: databases returned from getNotionDatabases */
	let notionDatabases = $state<{ id: string; title: string }[]>([]);
	let notionDatabasesLoading = $state(false);
	/** Notion: selected database id from dropdown */
	let selectedNotionDatabaseId = $state('');
	/** Notion: manual database ID paste (overrides select when non-empty) */
	let notionManualDatabaseId = $state('');
	/** Notion: effective database ID for submit (manual paste overrides select when non-empty). Normalize Select value (string or { value }) for form submit. */
	let notionDatabaseIdForSubmit = $derived(
		notionManualDatabaseId.trim() ||
			(typeof selectedNotionDatabaseId === 'string'
				? selectedNotionDatabaseId
				: (selectedNotionDatabaseId as { value?: string })?.value ?? '')
	);
	/** Notion (edit mode): databases list when editing credentials */
	let notionEditDatabases = $state<{ id: string; title: string }[]>([]);
	let notionEditDatabasesLoading = $state(false);
	/** Map headers dialog (Notion): open state */
	let mapHeadersOpen = $state(false);
	/** Notion schema (property names) for mapping dropdowns */
	let notionSchemaProperties = $state<{ name: string; type: string }[]>([]);
	let notionSchemaLoading = $state(false);
	let notionSchemaError = $state<string | null>(null);
	/** Current field mapping: our field id -> Notion property name (for form initial value) */
	let notionFieldMapping = $state<Record<string, string>>({});
	let getNotionSchemaForm: HTMLFormElement | null = $state(null);
	$effect(() => {
		if (!mapHeadersOpen) {
			notionSchemaProperties = [];
			notionSchemaError = null;
		} else if (notionConnected && getNotionSchemaForm && notionSchemaProperties.length === 0 && !notionSchemaLoading && !notionSchemaError) {
			notionSchemaLoading = true;
			notionSchemaError = null;
			getNotionSchemaForm.requestSubmit();
		}
	});

	$effect(() => {
		const gmail = $page.url.searchParams.get('gmail');
		if (gmail === 'connected') {
			toastSuccess('Gmail connected', 'You can send emails from your Gmail address.');
			goto($page.url.pathname, { replaceState: true });
		} else if (gmail === 'error') {
			const msg = $page.url.searchParams.get('message');
			toastError(
				'Gmail connection failed',
				msg === 'no_refresh_token'
					? 'Google did not return a refresh token. Try disconnecting Gmail (if shown) and connect again, granting all permissions.'
					: 'Something went wrong. Try again.'
			);
			goto($page.url.pathname, { replaceState: true });
		}
	});

	async function startEditingCredentials() {
		if (!selectedId) return;
		loadingCredentials = true;
		try {
			const r = await fetch(`/api/dashboard/integrations/credentials/${selectedId}`);
			if (!r.ok) {
				const err = await r.json().catch(() => ({}));
				return;
			}
			const data = await r.json();
			editValues = { ...data };
			editingCredentials = true;
			showConnectedKeys = false;
		} finally {
			loadingCredentials = false;
		}
	}

	function cancelEditingCredentials() {
		editingCredentials = false;
		editValues = {};
		showConnectedKeys = false;
	}

	function submitNotionDisconnect() {
		disconnectNotionOpen = false;
		notionDisconnectForm?.requestSubmit();
	}

	const integrations = $derived([
		{
			id: 'notion' as const,
			name: 'Notion',
			description: 'Your dashboard clients list is powered by a Notion database.',
			logoSrc: '/integrations/notion.svg',
			connected: notionConnected,
			locked: false
		},
		{
			id: 'gbp-dental' as const,
			name: 'Lead discovery (GBP)',
			description: 'Pull dental leads from Toronto/GTA (fewer reviews). Max 25 per day.',
			logoSrc: '',
			connected: placesApiConfigured,
			locked: !placesApiConfigured
		}
	]);

	const selected = $derived(selectedId ? integrations.find((i) => i.id === selectedId) : null);
	const helpContent = $derived((selected && data.helpDocs?.[selected.id]) ?? '');
	const notionFieldKeys = $derived(data.notionFieldKeys ?? []);

	function openMapHeadersDialog() {
		mapHeadersOpen = true;
	}

	$effect(() => {
		if (form?.success) invalidateAll();
	});
	$effect(() => {
		selectedId;
		showConnectedKeys = false;
		editingCredentials = false;
		editValues = {};
	});
</script>

<svelte:head>
	<title>Integrations · Dashboard</title>
</svelte:head>

<!-- Hidden form to fetch Notion schema when Map headers dialog opens -->
<form
	bind:this={getNotionSchemaForm}
	method="POST"
	action="?/getNotionSchema"
	use:enhance={() => {
		return async ({ result }) => {
			notionSchemaLoading = false;
			if (result.type === 'success' && result.data) {
				const d = result.data as { schema?: { name: string; type: string }[]; fieldMapping?: Record<string, string> };
				notionSchemaProperties = d.schema ?? [];
				notionFieldMapping = d.fieldMapping ?? {};
				notionSchemaError = null;
			} else if (result.type === 'failure' && result.data) {
				notionSchemaError = (result.data as { message?: string }).message ?? 'Failed to load schema';
			}
		};
	}}
	class="hidden"
	aria-hidden="true"
></form>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Integrations</h1>
		<p class="mt-1 text-muted-foreground">
			Connect the integrations you use; sync contacts into your dashboard from any of them.
		</p>
	</div>

	<!-- Connected accounts (OAuth): sign in with provider, no API keys -->
	<section class="space-y-3" aria-labelledby="oauth-section-heading">
		<h2 id="oauth-section-heading" class="text-lg font-medium tracking-tight text-foreground">Connected accounts</h2>
		<p class="text-sm text-muted-foreground">Sign in with your account; no API keys required.</p>
		<Card.Root class="flex flex-col {gmailConnected ? 'ring-2 ring-ring ring-inset' : ''}">
			<Card.Header class="flex flex-row items-start justify-between gap-4">
				<div class="flex min-w-0 items-center gap-3">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white p-1 overflow-hidden" aria-hidden="true">
						<img src="/integrations/gmail.png" alt="" class="h-8 w-8 object-contain" width="32" height="32" />
					</div>
					<div class="min-w-0 space-y-1">
						<Card.Title class="mb-0">Gmail</Card.Title>
						<Card.Description>Send demo emails from your Gmail. Connect once to use when you click Send in Clients.</Card.Description>
					</div>
				</div>
				{#if gmailConnected}
					<Badge variant="default" class="shrink-0 gap-1 font-normal">
						<CheckCircle2 class="h-3 w-3" />
						Connected
					</Badge>
				{/if}
			</Card.Header>
			<Card.Content class="pt-0">
				{#if gmailConnected}
					<div class="flex flex-col gap-2">
						<div class="flex flex-wrap items-center gap-3">
							{#if gmailEmail}
								<p class="text-sm text-muted-foreground">Connected as <strong class="text-foreground">{gmailEmail}</strong></p>
							{:else}
								<p class="text-sm text-muted-foreground">Gmail is connected. If sending fails, disconnect and connect again so we can use your Gmail address.</p>
							{/if}
							<form method="POST" action="?/disconnectGmail" use:enhance={() => async ({ result }) => {
							if (result.type === 'success' && result.data?.success) {
								await invalidateAll();
								toastSuccess('Gmail disconnected', 'You can reconnect from this page.');
							} else if (result.type === 'failure') {
								toastError('Disconnect Gmail', (result.data as { message?: string })?.message);
							}
						}} class="inline">
							<Button type="submit" variant="outline" size="sm">Disconnect Gmail</Button>
						</form>
						</div>
					</div>
				{:else}
					<a href="/auth/gmail?redirect=/dashboard/integrations" class="inline-flex">
						<Button type="button" size="sm">Connect Gmail</Button>
					</a>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>

	<!-- CRM & API integrations: API keys / tokens -->
	<section class="space-y-3" aria-labelledby="crm-section-heading">
		<h2 id="crm-section-heading" class="text-lg font-medium tracking-tight text-foreground">CRM & API integrations</h2>
		<p class="text-sm text-muted-foreground">Connect with API keys or tokens to sync contacts into your dashboard.</p>
	<!-- Left: column of integration tiles · Right: form / detail (toggle) -->
	<div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
		<!-- Column of integration cards (left) -->
		<div class="flex shrink-0 flex-col gap-2 lg:w-52">
			{#each integrations as integration}
				<Button
					type="button"
					variant="ghost"
					class="integration-tile w-full justify-start gap-3 rounded-[12px] p-3 h-auto font-medium {selectedId === integration.id
						? 'ring-2 ring-ring ring-offset-2 ring-offset-background'
						: ''} {integration.locked ? 'opacity-80' : ''}"
					onclick={() => (selectedId = selectedId === integration.id ? null : integration.id)}
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-1 {integration.id === 'gbp-dental' ? 'text-muted-foreground' : ''}"
						aria-hidden="true"
					>
						{#if integration.id === 'gbp-dental'}
							<MapPin class="h-6 w-6" />
						{:else}
							<img
								src={integration.logoSrc}
								alt=""
								class="h-full w-full object-contain"
							/>
						{/if}
					</div>
					<span class="min-w-0 flex-1 truncate text-sm font-medium">{integration.name}</span>
					{#if integration.connected}
						<CheckCircle2 class="h-4 w-4 shrink-0" />
					{:else if integration.locked}
						<Lock class="h-4 w-4 shrink-0 opacity-60" />
					{/if}
				</Button>
			{/each}
		</div>

		<!-- Form / detail panel (right), height aligned to left column -->
		<div class="flex min-w-0 flex-1 flex-col">
	{#if selected}
		<Card.Root class="integration-detail-card flex min-h-[420px] flex-col {selected.connected ? 'ring-2 ring-ring ring-inset' : ''}">
			<Card.Header class="flex flex-row items-start justify-between gap-4">
				<div class="min-w-0 space-y-1">
					<Card.Title class="mb-0">{selected.name}</Card.Title>
					<Card.Description>{selected.description}</Card.Description>
				</div>
				{#if selected.connected}
					<Badge variant="default" class="shrink-0 gap-1 font-normal">
						<CheckCircle2 class="h-3 w-3" />
						Connected
					</Badge>
				{/if}
			</Card.Header>
			<Card.Content class="grid min-h-0 flex-1 grid-cols-1 gap-6 pt-0 lg:grid-cols-5">
				<div class="flex min-h-0 min-w-0 flex-1 flex-col lg:col-span-2">
				{#if selected.locked}
					<div class="flex flex-col gap-4">
						<p class="text-sm text-muted-foreground">
							Google Places API is not configured. Set <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">GOOGLE_PLACES_API_KEY</code> (or <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">GOOGLE_MAPS_API_KEY</code>) in your server <code class="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env</code> to pull dental leads.
						</p>
					</div>
				{:else if selected.id === 'gbp-dental'}
					<div class="flex flex-col gap-4">
						<p class="text-sm text-muted-foreground">
							Pull up to 5 dental leads from Toronto and the GTA. Only businesses with <strong>fewer than 50 reviews</strong> are added (prioritizing those that need more visibility). They appear in your <a href="/dashboard/prospects" class="underline hover:no-underline">Prospects</a> list with industry &quot;Dental&quot;.
						</p>
						<p class="text-sm font-medium">
							Today: {gbpDentalTodayCount} / {gbpDentalDailyCap} leads
						</p>
						{#if gbpDentalPullLock.locked}
							<p class="text-sm text-muted-foreground">
								Locked for {gbpDentalLockMinutesRemaining} more minute{gbpDentalLockMinutesRemaining === 1 ? '' : 's'}.
							</p>
						{/if}
						<form
							method="POST"
							action="?/pullGbpDental"
							use:enhance={() => {
								syncing = 'gbp-dental';
								return async ({ result }) => {
									syncing = null;
									if (result.type === 'success' && result.data) {
										const d = result.data as { message?: string; added?: number };
										toastSuccess('Lead discovery', d.message ?? `Added ${d.added ?? 0} prospect(s).`);
										invalidateAll();
									} else if (result.type === 'failure' && result.data) {
										toastError('Lead discovery', (result.data as { message?: string }).message ?? 'Pull failed.');
										invalidateAll();
									}
								};
							}}
							class="contents"
						>
							<Button
								type="submit"
								size="sm"
								disabled={syncing === 'gbp-dental' || gbpDentalTodayCount >= gbpDentalDailyCap || gbpDentalPullLock.locked}
							>
								{#if syncing === 'gbp-dental'}
									<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<MapPin class="mr-2 h-4 w-4" />
								{/if}
								Pull up to 5 dental leads
							</Button>
						</form>
					</div>
				{:else if selected.id === 'notion'}
					{#if selected.connected}
						<div class="flex flex-col gap-4">
							{#if editingCredentials}
								<form
									method="POST"
									action="?/getNotionDatabases"
									use:enhance={() => {
										notionEditDatabasesLoading = true;
										return async ({ result }) => {
											notionEditDatabasesLoading = false;
											if (result.type === 'success' && (result.data as { databases?: { id: string; title: string }[] })?.databases) {
												notionEditDatabases = (result.data as { databases: { id: string; title: string }[] }).databases;
												toastSuccess('Databases loaded', 'Select a database or paste an ID.');
											} else if (result.type === 'failure' && (result.data as { message?: string })?.message) {
												toastError('Load databases', (result.data as { message: string }).message);
											}
										};
									}}
									class="contents"
								>
									<input type="hidden" name="apiKey" value={editValues.apiKey ?? ''} />
									<Button type="submit" variant="outline" size="sm" class="w-fit" disabled={!editValues.apiKey?.trim() || notionEditDatabasesLoading}>
										{#if notionEditDatabasesLoading}
											<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
										{:else}
											<Database class="mr-2 h-4 w-4" />
										{/if}
										Load databases
									</Button>
								</form>
								<form method="POST" action="?/connectNotion" use:enhance={() => async ({ result }) => {
									toastFromActionResult('Connect Notion', result, 'Notion connected.');
								}} class="flex flex-col gap-4">
									<div class="space-y-4">
										<div class="space-y-2">
											<Label for="notion-apiKey-edit">API key</Label>
											<div class="flex gap-1">
												<input
													id="notion-apiKey-edit"
													name="apiKey"
													type={showConnectedKeys ? 'text' : 'password'}
													bind:value={editValues.apiKey}
													class="border-input bg-background flex h-9 min-w-0 flex-1 rounded-md border px-3 py-1 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
												/>
												<button
													type="button"
													onclick={() => (showConnectedKeys = !showConnectedKeys)}
													aria-label={showConnectedKeys ? 'Hide API key' : 'Show API key'}
													class="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
												>
													{#if showConnectedKeys}
														<EyeOff class="h-4 w-4" />
													{:else}
														<Eye class="h-4 w-4" />
													{/if}
												</button>
											</div>
										</div>
										<div class="space-y-2">
											<Label for="notion-database-edit">Database</Label>
											{#if notionEditDatabases.length > 0}
												<Select.Root type="single" bind:value={editValues.databaseId}>
													<Select.Trigger id="notion-database-edit" class="w-full font-mono text-sm">
														<Select.Value placeholder="Select a database" />
													</Select.Trigger>
													<Select.Content>
														{#each notionEditDatabases as db (db.id)}
															<Select.Item value={db.id}>{db.title}</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
												<p class="text-xs text-muted-foreground">Or paste a database ID below.</p>
											{/if}
											<div class="flex gap-1">
												<input
													id="notion-databaseId-edit"
													name="databaseId"
													type={showConnectedKeys ? 'text' : 'password'}
													bind:value={editValues.databaseId}
													class="border-input bg-background flex h-9 min-w-0 flex-1 rounded-md border px-3 py-1 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
													placeholder={notionEditDatabases.length ? 'Or paste database ID' : 'Paste database ID or load databases above'}
												/>
												<button
													type="button"
													onclick={() => (showConnectedKeys = !showConnectedKeys)}
													aria-label={showConnectedKeys ? 'Hide Database ID' : 'Show Database ID'}
													class="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
												>
													{#if showConnectedKeys}
														<EyeOff class="h-4 w-4" />
													{:else}
														<Eye class="h-4 w-4" />
													{/if}
												</button>
											</div>
										</div>
									</div>
									<div class="mt-auto flex flex-wrap gap-2 pt-2">
										<Button type="submit" size="sm">Save</Button>
										<Button type="button" variant="ghost" size="sm" onclick={cancelEditingCredentials}>
											Cancel
										</Button>
									</div>
								</form>
							{:else}
								<div class="space-y-4">
									<div class="space-y-2">
										<Label for="notion-apiKey-connected">API key</Label>
										<div class="flex gap-1">
											<input
												id="notion-apiKey-connected"
												type={showConnectedKeys ? 'text' : 'password'}
												value="••••••••••••••••••••"
												disabled
												readonly
												class="border-input bg-background flex h-9 min-w-0 flex-1 rounded-md border px-3 py-1 font-mono text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
											/>
											<button
												type="button"
												onclick={() => (showConnectedKeys = !showConnectedKeys)}
												aria-label={showConnectedKeys ? 'Hide API key' : 'Show API key'}
												class="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
											>
												{#if showConnectedKeys}
													<EyeOff class="h-4 w-4" />
												{:else}
													<Eye class="h-4 w-4" />
												{/if}
											</button>
										</div>
									</div>
									<div class="space-y-2">
										<Label for="notion-databaseId-connected">Synced database</Label>
										<div class="flex gap-1">
											<input
												id="notion-databaseId-connected"
												type="text"
												value={showConnectedKeys ? (notionDatabaseId ?? '') : (notionDatabaseTitle || truncateNotionId(notionDatabaseId) || '—')}
												disabled
												readonly
												class="border-input bg-background flex h-9 min-w-0 flex-1 rounded-md border px-3 py-1 font-mono text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
											/>
											<button
												type="button"
												onclick={() => (showConnectedKeys = !showConnectedKeys)}
												aria-label={showConnectedKeys ? 'Show database name' : 'Show database ID'}
												class="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
											>
												{#if showConnectedKeys}
													<EyeOff class="h-4 w-4" />
												{:else}
													<Eye class="h-4 w-4" />
												{/if}
											</button>
										</div>
										{#if !showConnectedKeys && notionDatabaseId}
											<p class="text-xs text-muted-foreground">ID: {truncateNotionId(notionDatabaseId)}</p>
										{/if}
									</div>
								</div>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={loadingCredentials}
										onclick={startEditingCredentials}
										class="mt-auto"
									>
										{#if loadingCredentials}
											<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
										{:else}
											<Pencil class="mr-2 h-4 w-4" />
										{/if}
										Edit key
									</Button>
									<Button
										type="button"
										size="sm"
										onclick={openMapHeadersDialog}
										class="inline-flex"
									>
										{#if syncing === 'notion'}
											<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
										{:else}
											<Link2 class="mr-2 h-4 w-4" />
										{/if}
										Sync to dashboard
									</Button>
									<form bind:this={notionDisconnectForm} method="POST" action="?/disconnectNotion" use:enhance={() => async ({ result }) => {
										if (result.type === 'success' && (result.data as { success?: boolean })?.success) {
											await invalidateAll();
											toastSuccess('Notion disconnected', 'You can reconnect from this page.');
										} else if (result.type === 'failure') {
											toastError('Disconnect Notion', (result.data as { message?: string })?.message);
										}
									}} class="inline">
										<AlertDialog.Root bind:open={disconnectNotionOpen}>
											<AlertDialog.Trigger>
												<Button variant="ghost" size="sm">Disconnect</Button>
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>Disconnect Notion</AlertDialog.Title>
													<AlertDialog.Description>
														Your dashboard clients list will no longer sync from this Notion database. You can reconnect later with the same or a different database.
													</AlertDialog.Description>
											</AlertDialog.Header>
											<AlertDialog.Footer>
												<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
												<AlertDialog.Action onclick={submitNotionDisconnect}>
													Disconnect
												</AlertDialog.Action>
											</AlertDialog.Footer>
										</AlertDialog.Content>
									</AlertDialog.Root>
								</form>

								<!-- Map headers dialog -->
								<Dialog.Root bind:open={mapHeadersOpen}>
									<Dialog.Content class="max-h-[90vh] overflow-y-auto">
										<Dialog.Header>
											<Dialog.Title>Map headers</Dialog.Title>
											<Dialog.Description>
												Map your Notion database columns to dashboard fields. Unmapped fields use default column names when syncing.
											</Dialog.Description>
										</Dialog.Header>
										{#if notionSchemaLoading}
											<div class="flex items-center justify-center py-8">
												<LoaderCircle class="h-8 w-8 animate-spin text-muted-foreground" />
											</div>
										{:else if notionSchemaError}
											<p class="text-sm text-destructive py-4">{notionSchemaError}</p>
											<Dialog.Footer>
												<Button type="button" variant="outline" onclick={() => (mapHeadersOpen = false)}>Close</Button>
											</Dialog.Footer>
										{:else}
											<div class="space-y-4 py-2">
												<div class="grid gap-3">
													{#each notionFieldKeys as field (field.id)}
														<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-center">
															<Label for="map-{field.id}" class="sm:truncate">{field.label}</Label>
															<select
																id="map-{field.id}"
																class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
																value={notionFieldMapping[field.id] ?? ''}
																onchange={(e) => {
																	notionFieldMapping = { ...notionFieldMapping, [field.id]: (e.target as HTMLSelectElement).value };
																}}
															>
																<option value="">— Don't map —</option>
																{#each notionSchemaProperties as prop (prop.name)}
																	<option value={prop.name}>{prop.name}</option>
																{/each}
															</select>
														</div>
													{/each}
												</div>
											</div>
											<Dialog.Footer class="flex flex-wrap gap-2">
												<Button type="button" variant="outline" onclick={() => (mapHeadersOpen = false)}>Cancel</Button>
												<form
													method="POST"
													action="?/syncNotionWithMapping"
													use:enhance={() => {
														syncing = 'notion';
														return async ({ result }) => {
															syncing = null;
															toastFromActionResult('Sync Notion', result, 'Contacts synced to dashboard.');
															if (result.type === 'success' && (result.data as { success?: boolean })?.success) {
																mapHeadersOpen = false;
																invalidateAll();
															}
														};
													}}
													class="inline"
												>
													{#each notionFieldKeys as field (field.id)}
														<input type="hidden" name={field.id} value={notionFieldMapping[field.id] ?? ''} />
													{/each}
													<Button type="submit" disabled={syncing === 'notion'}>
														{#if syncing === 'notion'}
															<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
														{:else}
															<Link2 class="mr-2 h-4 w-4" />
														{/if}
														Sync to dashboard
													</Button>
												</form>
											</Dialog.Footer>
										{/if}
									</Dialog.Content>
								</Dialog.Root>
					{/if}
						</div>
					{:else}
						<!-- Load databases: separate form so apiKey is sent via hidden field (value from connect form) -->
						<form
							method="POST"
							action="?/getNotionDatabases"
							use:enhance={() => {
								notionDatabasesLoading = true;
								return async ({ result }) => {
									notionDatabasesLoading = false;
									if (result.type === 'success' && (result.data as { databases?: { id: string; title: string }[] })?.databases) {
										notionDatabases = (result.data as { databases: { id: string; title: string }[] }).databases;
										toastSuccess('Databases loaded', 'Select a database below or paste an ID.');
									} else if (result.type === 'failure' && (result.data as { message?: string })?.message) {
										toastError('Load databases', (result.data as { message: string }).message);
									}
								};
							}}
							class="contents"
						>
							<input type="hidden" name="apiKey" value={notionApiKey} />
							<Button type="submit" variant="outline" size="sm" class="w-fit" disabled={!notionApiKey.trim() || notionDatabasesLoading}>
								{#if notionDatabasesLoading}
									<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								{:else}
									<Database class="mr-2 h-4 w-4" />
								{/if}
								Load databases
							</Button>
						</form>
						<form method="POST" action="?/connectNotion" use:enhance={() => async ({ result }) => {
							toastFromActionResult('Connect Notion', result, 'Notion connected. Sync contacts to see them on the dashboard.');
						}} class="flex flex-col gap-4">
							<div class="space-y-4">
								<div class="space-y-2">
									<Label for="notion-apiKey">API key</Label>
									<Input
										id="notion-apiKey"
										name="apiKey"
										type="password"
										placeholder="secret_..."
										autocomplete="off"
										class="font-mono text-sm"
										bind:value={notionApiKey}
									/>
								</div>
								<div class="space-y-2">
									<Label for="notion-database-select">Select database to sync</Label>
									<p class="text-xs text-muted-foreground">Select the Notion database that will power your dashboard clients list. This database will be used for syncing contacts to Dashboard → Prospects.</p>
									{#if notionDatabases.length > 0}
										<Select.Root type="single" bind:value={selectedNotionDatabaseId}>
											<Select.Trigger id="notion-database-select" class="w-full font-mono text-sm">
												<Select.Value placeholder="Select a database" />
											</Select.Trigger>
											<Select.Content>
												{#each notionDatabases as db (db.id)}
													<Select.Item value={db.id}>{db.title}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
										<p class="text-xs text-muted-foreground">Or paste a database ID below if it’s not in the list.</p>
									{/if}
									<Input
										id="notion-databaseId"
										type="text"
										placeholder={notionDatabases.length ? 'Or paste database ID' : 'Paste database ID or load databases above'}
										autocomplete="off"
										class="font-mono text-sm"
										bind:value={notionManualDatabaseId}
									/>
									<input type="hidden" name="databaseId" value={notionDatabaseIdForSubmit} />
								</div>
							</div>
							<div class="mt-auto flex flex-wrap gap-2 pt-2">
								<Button type="submit" disabled={!notionDatabaseIdForSubmit.trim()}>Connect Notion</Button>
							</div>
						</form>
					{/if}
				{/if}
				</div>
				<!-- Setup guide (2:3 – form takes 2, guide takes 3) -->
				<div class="flex min-w-0 flex-col border-t border-border/50 pt-4 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
					<h3 class="mb-3 shrink-0 text-sm font-semibold text-foreground">Setup guide</h3>
					{#if helpContent}
						<div class="help-doc-content min-h-0 flex-1 overflow-y-auto font-sans text-sm leading-relaxed [&_a]:underline [&_a:hover]:no-underline [&_h1]:mb-1.5 [&_h1]:mt-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1:first-child]:mt-0 [&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:text-sm [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-0.5 [&_p]:text-xs">
							{@html helpContent}
						</div>
					{:else}
						<p class="text-xs text-muted-foreground">No setup guide available.</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
		{:else}
			<div class="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 rounded-[16px] bg-[var(--surface)] px-6 py-10 text-center">
				<Plus class="h-10 w-10 shrink-0 opacity-50" />
				<p class="text-sm font-medium text-muted-foreground">Select an integration</p>
				<p class="text-xs text-muted-foreground">Choose one from the left to connect or manage it</p>
			</div>
	{/if}
		</div>
	</div>
	</section>
</div>
