<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { PLAN_LABELS } from '$lib/plans';
	import { LoaderCircle, CreditCard } from 'lucide-svelte';
	import { toast } from '$lib/toast';

	let { data } = $props<{ data: PageData }>();
	const plan = $derived(data.plan ?? 'free');
	const subscription = $derived(data.subscription ?? null);
	const priceIds = $derived(data.priceIds ?? { starter: '', pro: '', agency: '' });
	const checkoutCanceled = $derived($page.url.searchParams.get('checkout') === 'canceled');
	const isInternal = $derived((data.user?.email ?? '').toLowerCase().endsWith('@ednsy.com'));

	let loadingPriceId = $state<string | null>(null);
	let loadingPortal = $state(false);

	$effect(() => {
		if (checkoutCanceled) {
			toast.info('Checkout was canceled.');
			goto('/dashboard/billing', { replaceState: true });
		}
	});

	async function startCheckout(priceId: string) {
		if (!priceId) return;
		loadingPriceId = priceId;
		try {
			const res = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priceId })
			});
			const json = await res.json();
			if (!res.ok) {
				toast.error(json.error ?? 'Checkout failed');
				return;
			}
			if (json.url) window.location.href = json.url;
		} finally {
			loadingPriceId = null;
		}
	}

	async function openPortal() {
		loadingPortal = true;
		try {
			const res = await fetch('/api/stripe/portal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ returnUrl: window.location.href })
			});
			const json = await res.json();
			if (!res.ok) {
				toast.error(json.error ?? 'Could not open billing portal');
				return;
			}
			if (json.url) window.location.href = json.url;
		} finally {
			loadingPortal = false;
		}
	}

	const canManage = $derived(!!subscription?.stripe_customer_id);
	const plans: { key: 'starter' | 'pro' | 'teams'; priceId: string; label: string }[] = $derived([
		{ key: 'starter', priceId: priceIds.starter, label: PLAN_LABELS.starter },
		{ key: 'pro', priceId: priceIds.pro, label: PLAN_LABELS.pro },
		{ key: 'teams', priceId: priceIds.agency, label: PLAN_LABELS.teams }
	].filter((p) => p.priceId));
</script>

<svelte:head>
	<title>Billing · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Billing</h1>
		<p class="text-muted-foreground">Manage your plan and subscription.</p>
	</div>

	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header>
			<Card.Title>Current plan</Card.Title>
			<Card.Description>Your active plan and usage.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex items-center gap-2 flex-wrap">
				<Badge variant="secondary" class="text-sm">{PLAN_LABELS[plan]}</Badge>
				{#if isInternal}
					<Badge variant="outline">Internal (ednsy.com)</Badge>
				{/if}
				{#if subscription?.status && subscription.status !== 'active'}
					<Badge variant="outline">{subscription.status}</Badge>
				{/if}
			</div>
			{#if isInternal}
				<p class="text-sm text-muted-foreground">Your account uses the internal Agency plan. No payment required.</p>
			{/if}
			{#if canManage && !isInternal}
				<Button variant="outline" onclick={openPortal} disabled={loadingPortal}>
					{#if loadingPortal}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					{:else}
						<CreditCard class="mr-2 h-4 w-4" />
					{/if}
					Manage subscription
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if !isInternal && plans.length > 0}
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header>
				<Card.Title>Upgrade</Card.Title>
				<Card.Description>Choose a plan that fits your needs.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-3">
					{#each plans as { key, priceId, label }}
						<Button
							variant={plan === key ? 'secondary' : 'default'}
							disabled={plan === key || loadingPriceId !== null}
							onclick={() => startCheckout(priceId)}
						>
							{#if loadingPriceId === priceId}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							{plan === key ? 'Current' : `Upgrade to ${label}`}
						</Button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{:else if !isInternal}
		<p class="text-sm text-muted-foreground">Stripe prices are not configured. Set STRIPE_PRICE_* in .env.</p>
	{/if}
</div>
