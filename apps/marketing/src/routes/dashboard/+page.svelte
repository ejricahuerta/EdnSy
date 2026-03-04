<script lang="ts">
	import { refreshRouteData } from '$lib/refreshRouteData';
	import type { PageData } from './$types';
	import { RefreshCw } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';
	import { OVERVIEW_REFRESH_COOLDOWN_MINUTES } from '$lib/constants';

	let { data } = $props<{ data: PageData }>();
	const prospects = $derived(data.prospects);
	const prospectsCount = $derived(data.prospectsCount ?? prospects.length);
	const clientsNew = $derived(data.clientsNew ?? []);
	const clientsStagnant = $derived(data.clientsStagnant ?? []);
	const clientsOngoing = $derived(data.clientsOngoing ?? []);
	const trackingCounts = $derived.by(() => {
		const map = data.demoTrackingByProspectId ?? {};
		let sent = 0, opened = 0, clicked = 0, replied = 0;
		for (const v of Object.values(map)) {
			if (v.status === 'sent') sent++;
			else if (v.status === 'opened') opened++;
			else if (v.status === 'clicked') clicked++;
			else if (v.status === 'replied') replied++;
		}
		return { sent, opened, clicked, replied };
	});
	const trackingSummaryLabel = $derived(
		trackingCounts.sent + trackingCounts.opened + trackingCounts.clicked + trackingCounts.replied > 0
			? [trackingCounts.sent && `${trackingCounts.sent} sent`, trackingCounts.opened && `${trackingCounts.opened} opened`, trackingCounts.clicked && `${trackingCounts.clicked} clicked`, trackingCounts.replied && `${trackingCounts.replied} replied`].filter(Boolean).join(' · ')
			: ''
	);
	const { approvedCount, draftCount } = $derived.by(() => {
		const map = data.demoTrackingByProspectId ?? {};
		let approved = 0, draft = 0;
		for (const t of Object.values(map)) {
			if (t.status === 'approved') approved++;
			else if (t.status === 'draft') draft++;
		}
		return { approvedCount: approved, draftCount: draft };
	});
	const noDemoButEmail = $derived(prospects.filter((p) => (p.email ?? '').trim().length > 0 && !(p.demoLink ?? '').trim()).length);
	const engagedCount = $derived(trackingCounts.opened + trackingCounts.clicked);
	const readyToSendCount = $derived(approvedCount + draftCount);

	const overviewWhat = $derived.by(() => {
		const n = prospects.length;
		const { sent, opened, clicked, replied } = trackingCounts;
		if (n === 0) return 'Your CRM has no prospects yet. Connect an integration (HubSpot, Pipedrive, etc.) or add prospects to start generating and sending demos.';
		const parts: string[] = [];
		parts.push(`You have ${n} client${n === 1 ? '' : 's'} in your CRM.`);
		if (sent + opened + clicked + replied > 0) {
			parts.push(`${sent} demo${sent === 1 ? ' has' : 's have'} been sent; ${opened} opened, ${clicked} clicked, ${replied} replied.`);
		} else {
			parts.push('No demos have been sent yet.');
		}
		return parts.join(' ');
	});
	const overviewKey = $derived.by(() => {
		const { sent, opened, clicked, replied } = trackingCounts;
		const parts: string[] = [];
		parts.push(`Sent: ${sent}. Opened: ${opened}. Clicked: ${clicked}. Replied: ${replied}.`);
		const readyToSend = approvedCount + draftCount;
		if (readyToSend > 0) parts.push(`${readyToSend} demo${readyToSend === 1 ? '' : 's'} ready to send.`);
		if (noDemoButEmail > 0) parts.push(`${noDemoButEmail} with email but no demo yet.`);
		return parts.join(' ');
	});
	const overviewNext = $derived.by(() => {
		const readyToSend = approvedCount + draftCount;
		const hasActions = readyToSend > 0 || noDemoButEmail > 0 || engagedCount > 0;
		if (!hasActions) return 'No urgent actions. Use the Clients page to send demos, create new ones, or follow up with prospects who engaged.';
		const bullets: string[] = [];
		if (readyToSend > 0) bullets.push(`Send the ${readyToSend} demo${readyToSend === 1 ? '' : 's'}.`);
		if (noDemoButEmail > 0) bullets.push(`Create demos for ${noDemoButEmail} prospect${noDemoButEmail === 1 ? '' : 's'}.`);
		if (engagedCount > 0) bullets.push(`Follow up with ${engagedCount} who opened or clicked.`);
		return bullets.join(' ');
	});
	const overviewStagnation = $derived.by(() => {
		const { sent, opened, clicked, replied } = trackingCounts;
		if (prospects.length === 0) return 'Add or sync prospects to see where your pipeline might be stuck.';
		if (sent === 0 && (draftCount > 0 || approvedCount > 0)) return 'Demos are ready but none sent yet. Use the Clients page to send.';
		if (sent === 0 && noDemoButEmail > 0) return 'No demos created or sent yet. Create demos for prospects with email, then send.';
		if (sent > 0 && replied === 0 && engagedCount === 0) return 'Demos were sent but no opens or clicks yet. Give it time or check that links and subject lines are clear.';
		if (sent > 0 && opened + clicked > 0 && replied === 0) return 'Opens and clicks but no replies yet. Consider a follow-up or give recipients more time.';
		if (readyToSendCount >= 3) return 'Several demos are ready. Use the Clients page to send.';
		return 'Pipeline is moving. Keep sending and following up with those who engaged.';
	});

	const displayWhat = $derived((data.overviewWhat ?? '').trim() || overviewWhat);
	const displayKeyFindings = $derived((data.overviewKeyFindings ?? '').trim() || overviewKey);
	const displayNext = $derived((data.overviewNext ?? '').trim() || overviewNext);
	const displayStagnation = $derived((data.overviewStagnation ?? '').trim() || overviewStagnation);

	const actionCardsCount = $derived((readyToSendCount > 0 ? 1 : 0) + (noDemoButEmail > 0 ? 1 : 0) + (engagedCount > 0 ? 1 : 0));

	let overviewRefreshing = $state(false);
	let overviewInitialGenerated = $state(false);
	let nowForCooldown = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => { nowForCooldown = Date.now(); }, 60_000);
		return () => clearInterval(id);
	});
	const overviewGeneratedAt = $derived(data.overviewGeneratedAt ?? null);
	const overviewCooldownMs = OVERVIEW_REFRESH_COOLDOWN_MINUTES * 60 * 1000;
	const inOverviewCooldown = $derived(!!overviewGeneratedAt && nowForCooldown - new Date(overviewGeneratedAt).getTime() < overviewCooldownMs);
	const overviewMinutesLeft = $derived(inOverviewCooldown && overviewGeneratedAt ? Math.ceil((new Date(overviewGeneratedAt).getTime() + overviewCooldownMs - nowForCooldown) / 60_000) : 0);

	async function refreshOverview() {
		if (overviewRefreshing || inOverviewCooldown) return;
		overviewRefreshing = true;
		try {
			const res = await fetch('/api/dashboard/overview', { method: 'POST' });
			const body = await res.json();
			if (!res.ok) {
				return;
			}
			await refreshRouteData();
		} finally {
			overviewRefreshing = false;
		}
	}

	$effect(() => {
		if (overviewInitialGenerated || (data.overviewWhat ?? '').trim() !== '' || prospects.length === 0) return;
		overviewInitialGenerated = true;
		refreshOverview();
	});
</script>

<svelte:head>
	<title>Dashboard — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between gap-2">
			<h2 class="text-sm font-medium text-muted-foreground">Overview</h2>
			<Button
				variant="outline"
				size="sm"
				disabled={overviewRefreshing || inOverviewCooldown}
				onclick={refreshOverview}
				aria-label={inOverviewCooldown ? `Regenerate in ${overviewMinutesLeft} min` : 'Regenerate overview'}
			>
				<RefreshCw class={cn('h-4 w-4', overviewRefreshing && 'animate-spin')} />
				{#if overviewRefreshing}
					Regenerating…
				{:else if inOverviewCooldown}
					Regenerate in {overviewMinutesLeft} min
				{:else}
					Regenerate
				{/if}
			</Button>
		</div>
		<Item.Group class="grid grid-cols-2 gap-4">
			<Item.Root variant="outline">
				<Item.Content>
					<Item.Title>What</Item.Title>
					<Item.Description class="line-clamp-[unset]">{displayWhat}</Item.Description>
				</Item.Content>
			</Item.Root>
			<Item.Root variant="outline">
				<Item.Content>
					<Item.Title>Key findings</Item.Title>
					<Item.Description class="line-clamp-[unset]">{displayKeyFindings}</Item.Description>
				</Item.Content>
			</Item.Root>
			<Item.Root variant="outline">
				<Item.Content>
					<Item.Title>Next</Item.Title>
					<Item.Description class="line-clamp-[unset]">{displayNext}</Item.Description>
				</Item.Content>
				{#if actionCardsCount > 0}
					<Item.Actions>
						<Button variant="outline" size="sm" href="/dashboard/prospects">View prospects</Button>
					</Item.Actions>
				{/if}
			</Item.Root>
			<Item.Root variant="outline">
				<Item.Content>
					<Item.Title>Stagnation</Item.Title>
					<Item.Description class="line-clamp-[unset]">{displayStagnation}</Item.Description>
				</Item.Content>
			</Item.Root>
		</Item.Group>
	</div>

	<!-- Connected apps & Upcoming bill -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Connected apps</Card.Title>
				<Card.Description class="text-sm">Integrations syncing to your dashboard.</Card.Description>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if (data.connectedApps ?? []).length > 0}
					<ul class="flex flex-wrap gap-2 list-none p-0 m-0">
						{#each data.connectedApps as app (app)}
							<li>
								<Badge variant="secondary" class="font-medium">{app}</Badge>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-muted-foreground">None connected.</p>
				{/if}
				<Button variant="link" href="/dashboard/integrations" class="mt-2 h-auto p-0">
					Manage integrations
				</Button>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Upcoming bill</Card.Title>
				<Card.Description class="text-sm">Next subscription charge.</Card.Description>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if data.upcomingBill}
					{@const b = data.upcomingBill}
					<p class="text-sm font-medium text-foreground">
						{new Intl.NumberFormat(undefined, { style: 'currency', currency: b.currency.toUpperCase() }).format(b.amountDue / 100)}
					</p>
					<p class="text-xs text-muted-foreground mt-0.5">
						Due {new Date(b.periodEnd * 1000).toLocaleDateString(undefined, { dateStyle: 'medium' })}
					</p>
				{:else}
					<p class="text-sm text-muted-foreground">No upcoming charge.</p>
				{/if}
				<Button variant="link" href="/dashboard/billing" class="mt-2 h-auto p-0">
					Billing
				</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-4">
			<div>
				<Card.Title class="font-semibold text-foreground text-lg">Clients</Card.Title>
				<Card.Description class="mt-1">
					Your prospects from Connect CRM. Generate demos, send via email, or copy the link.
				</Card.Description>
				{#if trackingSummaryLabel}
					<p class="mt-0.5 text-xs text-muted-foreground">{trackingSummaryLabel}</p>
				{/if}
			</div>
			<Button variant="outline" size="sm" href="/dashboard/prospects" class="shrink-0">
				View all ({prospectsCount}) clients
			</Button>
		</Card.Header>
		<Card.Content class="px-4 pb-4 sm:px-6 space-y-6">
			{#if prospectsCount > 0}
				<div>
					<h3 class="text-sm font-medium text-muted-foreground mb-2">Top 5 new</h3>
					<Table.Root class="rounded-md border border-border">
						<Table.Body>
							{#each clientsNew as p (p.id)}
								<Table.Row>
									<Table.Cell class="px-3 py-2.5">
										<span class="font-medium truncate">{p.companyName || 'Unnamed'}</span>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
					{#if clientsNew.length === 0}
						<p class="text-sm text-muted-foreground py-2">None. All have demos or no clients yet.</p>
					{/if}
				</div>
				<div>
					<h3 class="text-sm font-medium text-muted-foreground mb-2">Top 5 in progress</h3>
					<Table.Root class="rounded-md border border-border">
						<Table.Body>
							{#each clientsOngoing as p (p.id)}
								<Table.Row>
									<Table.Cell class="px-3 py-2.5">
										<span class="font-medium truncate">{p.companyName || 'Unnamed'}</span>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
					{#if clientsOngoing.length === 0}
						<p class="text-sm text-muted-foreground py-2">None.</p>
					{/if}
				</div>
				<div>
					<h3 class="text-sm font-medium text-muted-foreground mb-2">Top 5 stagnant</h3>
					<Table.Root class="rounded-md border border-border">
						<Table.Body>
							{#each clientsStagnant as p (p.id)}
								<Table.Row>
									<Table.Cell class="px-3 py-2.5">
										<span class="font-medium truncate">{p.companyName || 'Unnamed'}</span>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
					{#if clientsStagnant.length === 0}
						<p class="text-sm text-muted-foreground py-2">None.</p>
					{/if}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground py-2">No prospects yet. Connect an integration in Integrations to sync.</p>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if prospects.length === 0}
		<p class="py-8 text-sm text-muted-foreground">No prospects yet. Connect an integration in Integrations to sync, or add from your CRM.</p>
	{/if}
</div>
