<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';

	let { data } = $props<{ data: PageData }>();

	const gbpCount = $derived(data.gbpCountThisMonth ?? 0);
	const insightsCount = $derived(data.insightsCountThisMonth ?? 0);
	const demoCount = $derived(data.demoCountThisMonth ?? 0);
	const demoLimit = $derived(data.demoLimit ?? null);
	const placesCount = $derived(data.placesCountThisMonth ?? 0);
	const placesLimit = $derived(data.placesMonthlyLimit ?? 0);

	const demoLabel = $derived(
		demoLimit !== null ? `${demoCount} / ${demoLimit} demos` : `${demoCount} demos`
	);

	const placesLabel = $derived(`${placesCount} / ${placesLimit} lookups`);

	/** Same AI agent: qualify (GBP) + insights. */
	const agentPullsLabel = $derived(`${gbpCount} GBP · ${insightsCount} insights`);

	/** Data for the bar chart: one bar per metric, this month. */
	const usageChartData = $derived([
		{ metric: 'AI agent', count: gbpCount + insightsCount },
		{ metric: 'Demos', count: demoCount },
		{ metric: 'Places API', count: placesCount }
	]);

	const chartConfig = {
		count: { label: 'This month', color: 'var(--primary)' }
	} satisfies Chart.ChartConfig;
</script>

<svelte:head>
	<title>Dashboard — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full space-y-6">
	<h1 class="text-xl font-semibold text-foreground">Dashboard</h1>

	<!-- KPIs: AI agent (GBP + Insights), Demos, Places API this month -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<Card.Root class="border shadow-none">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">AI agent pulls</Card.Title>
				<Card.Description class="text-sm">Qualify (GBP) + Insights, this month</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-semibold tabular-nums">{agentPullsLabel}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border shadow-none">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Demos</Card.Title>
				<Card.Description class="text-sm">This month</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-semibold tabular-nums">{demoLabel}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border shadow-none">
			<Card.Header class="pb-2">
				<Card.Title class="text-base font-semibold">Places API lookups</Card.Title>
				<Card.Description class="text-sm">This month (app-wide)</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-2xl font-semibold tabular-nums">{placesLabel}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Usage this month: shadcn-svelte chart (LayerChart BarChart) -->
	<Card.Root class="border shadow-none">
		<Card.Header class="pb-2">
			<Card.Title class="text-base font-semibold">Usage this month</Card.Title>
			<Card.Description class="text-sm">AI agent pulls, demos, and Places API lookups</Card.Description>
		</Card.Header>
		<Card.Content class="px-2 pt-4 sm:px-6 sm:pt-6">
			<Chart.Container config={chartConfig} class="min-h-[200px] w-full">
				<BarChart
					data={usageChartData}
					xScale={scaleBand().padding(0.25)}
					x="metric"
					axis="x"
					seriesLayout="group"
					series={[
						{
							key: 'count',
							label: chartConfig.count.label,
							color: chartConfig.count.color
						}
					]}
					props={{
						xAxis: { format: (d: string) => d },
						yAxis: { format: (v: number) => String(v) }
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip />
					{/snippet}
				</BarChart>
			</Chart.Container>
		</Card.Content>
	</Card.Root>
</div>
