<script lang="ts">
	import { onMount } from 'svelte';
	import { stripeService, type StripeMetrics } from '$lib/services/stripe';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { TrendingUpIcon, DollarSignIcon, UsersIcon, CreditCardIcon, AlertTriangleIcon } from 'lucide-svelte';

	let metrics = $state<StripeMetrics | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await stripeService.getMetrics();
			if (response.error) {
				error = response.error;
			} else {
				metrics = response;
			}
		} catch (err) {
			error = 'Failed to load Stripe metrics';
			console.error('Error loading Stripe metrics:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">Stripe Billing Dashboard</h2>
			<p class="text-muted-foreground">
				Monitor your revenue, subscriptions, and payment processing metrics
			</p>
		</div>
		<Badge variant="outline" class="flex items-center gap-2">
			<CreditCardIcon class="h-4 w-4" />
			Stripe Integration
		</Badge>
	</div>

	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center h-64">
			<div class="text-center">
				<AlertTriangleIcon class="h-12 w-12 text-destructive mx-auto mb-4" />
				<p class="text-destructive font-medium">{error}</p>
				<p class="text-muted-foreground text-sm mt-2">
					Please check your Stripe API configuration
				</p>
			</div>
		</div>
	{:else if metrics}
		<!-- Key Metrics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Monthly Recurring Revenue</Card.Title>
					<DollarSignIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">${metrics.mrr.toLocaleString()}</div>
					<p class="text-xs text-muted-foreground">
						+{((metrics.mrr / 1000) * 100).toFixed(1)}% from last month
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Active Subscriptions</Card.Title>
					<UsersIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{metrics.activeSubscriptions}</div>
					<p class="text-xs text-muted-foreground">
						{metrics.churnRate.toFixed(1)}% churn rate
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Payment Success Rate</Card.Title>
					<CreditCardIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{metrics.paymentSuccessRate.toFixed(1)}%</div>
					<p class="text-xs text-muted-foreground">
						{metrics.disputes} active disputes
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Customer Lifetime Value</Card.Title>
					<TrendingUpIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">${metrics.customerLifetimeValue.toFixed(0)}</div>
					<p class="text-xs text-muted-foreground">
						Average per customer
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Additional Metrics -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Annual Recurring Revenue</Card.Title>
					<Card.Description>
						Your projected annual revenue based on current subscriptions
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-bold text-primary">
						${metrics.arr.toLocaleString()}
					</div>
					<div class="flex items-center gap-2 mt-2">
						<TrendingUpIcon class="h-4 w-4 text-green-600" />
						<span class="text-sm text-green-600">
							+{((metrics.arr / 100000) * 100).toFixed(1)}% YoY growth
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Total Revenue</Card.Title>
					<Card.Description>
						Total revenue processed through Stripe
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-bold text-primary">
						${metrics.totalRevenue.toLocaleString()}
					</div>
					<div class="flex items-center gap-2 mt-2">
						<DollarSignIcon class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">
							All time revenue
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Customer and Subscription Details -->
		{#if metrics.subscriptionDetails && metrics.subscriptionDetails.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Active Subscriptions</Card.Title>
					<Card.Description>
						Current active subscriptions with customer details
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						{#each metrics.subscriptionDetails.slice(0, 5) as subscription}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<UsersIcon class="h-5 w-5 text-primary" />
									</div>
									<div>
										<p class="font-medium">{subscription.customerName}</p>
										<p class="text-sm text-muted-foreground">{subscription.productName}</p>
									</div>
								</div>
								<div class="text-right">
									<p class="font-bold">${subscription.amount}</p>
									<Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
										{subscription.status}
									</Badge>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if metrics.customerDetails && metrics.customerDetails.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Top Customers</Card.Title>
					<Card.Description>
						Customers with highest lifetime value
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						{#each metrics.customerDetails.slice(0, 5) as customer}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
										<UsersIcon class="h-5 w-5 text-primary" />
									</div>
									<div>
										<p class="font-medium">{customer.name}</p>
										<p class="text-sm text-muted-foreground">{customer.email}</p>
									</div>
								</div>
								<div class="text-right">
									<p class="font-bold">${customer.totalSpent.toLocaleString()}</p>
									<p class="text-sm text-muted-foreground">{customer.subscriptions} subscriptions</p>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div> 