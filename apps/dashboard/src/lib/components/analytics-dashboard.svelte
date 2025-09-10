<script lang="ts">
	import { onMount } from 'svelte';
	import { analyticsService, type AnalyticsMetrics } from '$lib/services/analytics';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { TrendingUpIcon, UsersIcon, EyeIcon, ClockIcon, AlertTriangleIcon, BarChartIcon } from 'lucide-svelte';
	import * as Table from '$lib/components/ui/table';

	let metrics = $state<AnalyticsMetrics | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let realTimeData = $state<any>(null);

	onMount(async () => {
		try {
			const response = await analyticsService.getMetrics();
			if (response.error) {
				error = response.error;
			} else {
				metrics = response;
			}
		} catch (err) {
			error = 'Failed to load analytics metrics';
			console.error('Error loading analytics metrics:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">PostHog Analytics Dashboard</h2>
			<p class="text-muted-foreground">
				Monitor your website traffic, user behavior, and conversion metrics
			</p>
		</div>
		<Badge variant="outline" class="flex items-center gap-2">
			<BarChartIcon class="h-4 w-4" />
			Analytics Integration
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
					Please check your PostHog Analytics configuration
				</p>
			</div>
		</div>
	{:else if metrics}
		<!-- Real-time Metrics -->
		{#if realTimeData}
			<Card.Root>
				<Card.Header>
					<Card.Title>Real-time Activity</Card.Title>
					<Card.Description>
						Current website activity and active users
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="text-center">
							<div class="text-3xl font-bold text-green-600">{realTimeData.activeUsers}</div>
							<p class="text-sm text-muted-foreground">Active Users</p>
						</div>
						<div class="text-center">
							<div class="text-3xl font-bold text-blue-600">{realTimeData.currentPageViews}</div>
							<p class="text-sm text-muted-foreground">Page Views</p>
						</div>
						<div class="text-center">
							<div class="text-3xl font-bold text-purple-600">{realTimeData.topActivePages.length}</div>
							<p class="text-sm text-muted-foreground">Active Pages</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Key Metrics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Total Users</Card.Title>
					<UsersIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
					<p class="text-xs text-muted-foreground">
						+{metrics.newUsers.toLocaleString()} new users
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Sessions</Card.Title>
					<EyeIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{metrics.sessions.toLocaleString()}</div>
					<p class="text-xs text-muted-foreground">
						{metrics.pageViews.toLocaleString()} page views
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Bounce Rate</Card.Title>
					<TrendingUpIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{metrics.bounceRate.toFixed(1)}%</div>
					<p class="text-xs text-muted-foreground">
						Lower is better
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Avg Session Duration</Card.Title>
					<ClockIcon class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{(metrics.averageSessionDuration / 60).toFixed(1)}m</div>
					<p class="text-xs text-muted-foreground">
						Average time on site
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Top Pages Table -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Top Performing Pages</Card.Title>
				<Card.Description>
					Most visited pages and their performance metrics
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Page</Table.Head>
							<Table.Head>Domain</Table.Head>
							<Table.Head>Views</Table.Head>
							<Table.Head>Unique Views</Table.Head>
							<Table.Head>Avg Time</Table.Head>
							<Table.Head>Bounce Rate</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each metrics.topPages as page}
							<Table.Row>
								<Table.Cell class="font-medium">
									<div>
										<div class="font-medium">{page.title}</div>
										<div class="text-sm text-muted-foreground">{page.path}</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{page.domain}</Badge>
								</Table.Cell>
								<Table.Cell>{page.views.toLocaleString()}</Table.Cell>
								<Table.Cell>{page.uniqueViews.toLocaleString()}</Table.Cell>
								<Table.Cell>{(page.averageTimeOnPage / 60).toFixed(1)}m</Table.Cell>
								<Table.Cell>{page.bounceRate.toFixed(1)}%</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<!-- Traffic Sources -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Traffic Sources</Card.Title>
				<Card.Description>
					Where your visitors are coming from
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each metrics.trafficSources as source}
						<div class="flex items-center justify-between p-4 border rounded-lg">
							<div>
								<p class="font-medium">{source.source}</p>
								<p class="text-sm text-muted-foreground">{source.medium}</p>
							</div>
							<div class="text-right">
								<p class="font-medium">{source.sessions.toLocaleString()} sessions</p>
								<p class="text-sm text-muted-foreground">
									{source.bounceRate.toFixed(1)}% bounce rate
								</p>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- User Retention -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>User Retention</Card.Title>
					<Card.Description>
						How well you retain users over time
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Day 1</span>
							<span class="text-2xl font-bold text-green-600">{metrics.userRetention.day1}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Day 7</span>
							<span class="text-2xl font-bold text-blue-600">{metrics.userRetention.day7}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Day 14</span>
							<span class="text-2xl font-bold text-purple-600">{metrics.userRetention.day14}%</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Day 30</span>
							<span class="text-2xl font-bold text-orange-600">{metrics.userRetention.day30}%</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Performance Summary</Card.Title>
					<Card.Description>
						Key performance indicators
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Total Users</span>
							<span class="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">New Users</span>
							<span class="text-2xl font-bold text-green-600">{metrics.newUsers.toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Sessions</span>
							<span class="text-2xl font-bold">{metrics.sessions.toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-sm font-medium">Page Views</span>
							<span class="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div> 