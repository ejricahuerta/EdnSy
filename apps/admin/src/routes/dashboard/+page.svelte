<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { PLAN_LABELS, type PlanTier } from '$lib/plans';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import {
		Bot,
		CreditCard,
		MapPin,
		Plug,
		Presentation,
		Users
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const gbpCount = $derived(data.gbpCountThisMonth ?? 0);
	const insightsCount = $derived(data.insightsCountThisMonth ?? 0);
	const demoCount = $derived(data.demoCountThisMonth ?? 0);
	const demoLimit = $derived(data.demoLimit ?? null);
	const placesCount = $derived(data.placesCountThisMonth ?? 0);
	const placesLimit = $derived(data.placesMonthlyLimit ?? 0);
	const plan = $derived((data.plan ?? 'free') as PlanTier);
	const prospectTotal = $derived(data.prospectTotal ?? 0);
	const prospectsNeedingAttention = $derived(data.prospectsNeedingAttention ?? 0);

	const greetName = $derived.by(() => {
		const email = (data.user?.email ?? '').trim();
		if (!email) return '';
		return email.split('@')[0] ?? email;
	});

	const agentPullsTotal = $derived(gbpCount + insightsCount);

	const demoProgressPct = $derived(
		demoLimit === null || demoLimit <= 0
			? null
			: Math.min(100, Math.round((demoCount / demoLimit) * 100))
	);

	const placesProgressPct = $derived(
		placesLimit <= 0 ? null : Math.min(100, Math.round((placesCount / placesLimit) * 100))
	);

	function formatUsageXAxis(d: string) {
		return d;
	}
	function formatUsageYAxis(v: number) {
		return String(v);
	}
	const usageMetricLabels = {
		'AI agent': 'AI agent (GBP + insights)',
		Demos: 'Demos this month',
		'Places API': 'Places API lookups'
	} as const;
	/** One row per metric: reliable vertical BarChart (grouped single-series + ordinal fill) */
	const usageChartData = $derived([
		{ metric: 'AI agent' as const, count: agentPullsTotal },
		{ metric: 'Demos' as const, count: demoCount },
		{ metric: 'Places API' as const, count: placesCount }
	]);

	const usageChartConfig = {
		'AI agent': { label: usageMetricLabels['AI agent'], color: 'var(--chart-1)' },
		Demos: { label: usageMetricLabels.Demos, color: 'var(--chart-2)' },
		'Places API': { label: usageMetricLabels['Places API'], color: 'var(--chart-3)' },
		count: { label: 'This month', color: 'var(--primary)' }
	} satisfies Chart.ChartConfig;

	const prospectStatusChartData = $derived(
		(data.statusChartData as Array<{ status: string; count: number }> | undefined) ?? []
	);

	const pipelineTotalCount = $derived(
		prospectStatusChartData.reduce((sum, row) => sum + row.count, 0)
	);

	const pipelineActiveStageCount = $derived(
		prospectStatusChartData.filter((r) => r.count > 0).length
	);

	const pipelineMaxCount = $derived(
		Math.max(1, ...prospectStatusChartData.map((r) => r.count))
	);

	const pipelineBarColors = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	] as const;
</script>

<svelte:head>
	<title>Dashboard — Ed & Sy Admin</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full space-y-8">
	<section class="space-y-4">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="space-y-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
					<Badge variant="secondary" class="font-normal">{PLAN_LABELS[plan]}</Badge>
				</div>
				<p class="text-muted-foreground text-sm max-w-xl">
					Usage and pipeline overview · this month
					{#if greetName}
						<span class="text-foreground/80"> · Hi, {greetName}</span>
					{/if}
				</p>
				<p class="text-xs text-muted-foreground">
					{prospectTotal} prospect{prospectTotal === 1 ? '' : 's'} in CRM
					{#if prospectsNeedingAttention > 0}
						<span class="text-foreground/90">
							· {prospectsNeedingAttention} need{prospectsNeedingAttention === 1 ? 's' : ''} attention
						</span>
					{/if}
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button href="/dashboard/prospects" variant="outline" size="sm">
					<Users class="size-4" aria-hidden="true" />
					Prospects
				</Button>
				<Button href="/dashboard/demos" variant="outline" size="sm">
					<Presentation class="size-4" aria-hidden="true" />
					Demos
				</Button>
				<Button href="/dashboard/integrations" variant="outline" size="sm">
					<Plug class="size-4" aria-hidden="true" />
					Integrations
				</Button>
				<Button href="/dashboard/billing" variant="outline" size="sm">
					<CreditCard class="size-4" aria-hidden="true" />
					Billing
				</Button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="border-border/80 shadow-sm">
				<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
					<div class="space-y-1">
						<Card.Title class="text-base font-semibold">AI agent pulls</Card.Title>
						<Card.Description class="text-xs">Qualify (GBP) + insights</Card.Description>
					</div>
					<div
						class="rounded-lg bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center"
						aria-hidden="true"
					>
						<Bot class="size-4" strokeWidth={1.75} />
					</div>
				</Card.Header>
				<Card.Content class="space-y-2">
					<p class="text-3xl font-semibold tabular-nums tracking-tight">{agentPullsTotal}</p>
					<p class="text-xs text-muted-foreground tabular-nums">
						{gbpCount} GBP · {insightsCount} insights
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-border/80 shadow-sm">
				<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
					<div class="space-y-1">
						<Card.Title class="text-base font-semibold">Demos</Card.Title>
						<Card.Description class="text-xs">Created this month</Card.Description>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)]"
						aria-hidden="true"
					>
						<Presentation class="size-4" strokeWidth={1.75} />
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					<p class="text-3xl font-semibold tabular-nums tracking-tight">{demoCount}</p>
					{#if demoLimit !== null}
						<div class="space-y-1.5">
							<div class="h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
								<div
									class="bg-primary h-full rounded-full transition-[width] duration-300"
									style:width="{demoProgressPct ?? 0}%"
								></div>
							</div>
							<p class="text-xs text-muted-foreground tabular-nums">
								{demoCount} of {demoLimit} this month
							</p>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground">No monthly cap on your plan</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-border/80 shadow-sm sm:col-span-2 lg:col-span-1">
				<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
					<div class="space-y-1">
						<Card.Title class="text-base font-semibold">Places API</Card.Title>
						<Card.Description class="text-xs">Lookups this month (app-wide)</Card.Description>
					</div>
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--chart-3)]/15 text-[color:var(--chart-3)]"
						aria-hidden="true"
					>
						<MapPin class="size-4" strokeWidth={1.75} />
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					<p class="text-3xl font-semibold tabular-nums tracking-tight">{placesCount}</p>
					{#if placesLimit > 0}
						<div class="space-y-1.5">
							<div class="h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
								<div
									class="bg-primary h-full rounded-full transition-[width] duration-300"
									style:width="{placesProgressPct ?? 0}%"
								></div>
							</div>
							<p class="text-xs text-muted-foreground tabular-nums">
								{placesCount} of {placesLimit} this month
							</p>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground">Limit not configured</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<Separator />

	<section class="space-y-4">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
			<div class="min-w-0 space-y-4">
				<div>
					<h2 class="text-lg font-semibold tracking-tight">Usage</h2>
					<p class="text-sm text-muted-foreground">
						Monthly totals for your workspace: AI pulls (GBP qualify + insights), demos you generated, and
						Places lookups (shared app quota).
					</p>
				</div>
				<Card.Root class="border-border/80 shadow-sm">
					<Card.Header class="pb-2">
						<Card.Title class="text-base font-semibold">This month</Card.Title>
						<Card.Description class="text-sm">
							Bar height matches the numbers below (including zeros).
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4 px-2 pt-2 sm:px-6 sm:pt-4">
						<dl
							class="grid grid-cols-1 gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 sm:grid-cols-3"
						>
							<div class="space-y-0.5">
								<dt class="text-muted-foreground text-xs font-medium">{usageMetricLabels['AI agent']}</dt>
								<dd class="text-foreground text-lg font-semibold tabular-nums">{agentPullsTotal}</dd>
							</div>
							<div class="space-y-0.5">
								<dt class="text-muted-foreground text-xs font-medium">{usageMetricLabels.Demos}</dt>
								<dd class="text-foreground text-lg font-semibold tabular-nums">{demoCount}</dd>
							</div>
							<div class="space-y-0.5">
								<dt class="text-muted-foreground text-xs font-medium">{usageMetricLabels['Places API']}</dt>
								<dd class="text-foreground text-lg font-semibold tabular-nums">{placesCount}</dd>
							</div>
						</dl>
						<div
							class="border-border/50 relative w-full overflow-hidden rounded-md border bg-card"
							style="height: 280px;"
						>
							<Chart.Container
								config={usageChartConfig}
								class="!aspect-auto h-full min-h-[240px] w-full [&_.lc-root-container]:h-full [&_.lc-root-container]:min-h-[220px]"
							>
								<BarChart
									data={usageChartData}
									xScale={scaleBand().padding(0.28)}
									x="metric"
									c="metric"
									cRange={['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']}
									seriesLayout="group"
									series={[
										{
											key: 'count',
											label: usageChartConfig.count.label,
											color: usageChartConfig.count.color
										}
									]}
									props={{
										bars: { fill: undefined },
										xAxis: { format: formatUsageXAxis },
										yAxis: { format: formatUsageYAxis }
									}}
								/>
							</Chart.Container>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="min-w-0 space-y-4">
				<div>
					<h2 class="text-lg font-semibold tracking-tight">Pipeline</h2>
					<p class="text-sm text-muted-foreground">
						Prospects grouped by CRM status, in workflow order. Bar length is relative to the busiest stage on
						this list.
					</p>
				</div>
				<Card.Root class="border-border/80 shadow-sm">
					<Card.Header class="pb-3">
						<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Card.Title class="text-base font-semibold">By status</Card.Title>
								<Card.Description class="text-sm">
									{#if pipelineTotalCount === 0}
										No prospects match these stages yet. Sync from your CRM or add them on Prospects.
									{:else}
										<span class="tabular-nums">{pipelineTotalCount}</span> total across
										<span class="tabular-nums">{pipelineActiveStageCount}</span>
										active stage{pipelineActiveStageCount === 1 ? '' : 's'}.
									{/if}
								</Card.Description>
							</div>
							<Button href="/dashboard/prospects" variant="outline" size="sm" class="w-fit shrink-0">
								<Users class="size-4" aria-hidden="true" />
								Open Prospects
							</Button>
						</div>
					</Card.Header>
					<Card.Content class="px-2 pb-2 sm:px-6 sm:pb-4">
						<ol class="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
							{#each prospectStatusChartData as row, i (row.status)}
								{@const barPct = pipelineMaxCount > 0 ? Math.min(100, (row.count / pipelineMaxCount) * 100) : 0}
								{@const barColor = pipelineBarColors[i % pipelineBarColors.length]}
								<li class="flex gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
									<div
										class="text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums"
										aria-hidden="true"
									>
										{i + 1}
									</div>
									<div class="min-w-0 flex-1 space-y-2">
										<div class="flex flex-wrap items-center justify-between gap-2">
											<span
												class="text-sm font-medium leading-tight"
												class:text-muted-foreground={row.count === 0}
												class:font-normal={row.count === 0}
											>
												{row.status}
											</span>
											<Badge
												variant={row.count > 0 ? 'secondary' : 'outline'}
												class="tabular-nums shrink-0 font-semibold"
											>
												{row.count}
											</Badge>
										</div>
										<div
											class="bg-muted/80 h-2 w-full overflow-hidden rounded-full"
											role="presentation"
											aria-hidden="true"
										>
											<div
												class="h-full rounded-full transition-[width] duration-300"
												style:width="{barPct}%"
												style:background-color={barColor}
												class:opacity-40={row.count === 0}
											></div>
										</div>
									</div>
								</li>
							{/each}
						</ol>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>
</div>
