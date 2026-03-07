<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronRight } from 'lucide-svelte';
	import type { DemoTrackingStatus } from '$lib/demo';

	let { data } = $props<{ data: PageData }>();

	const prospects = $derived(data.prospects ?? []);
	const demoTrackingByProspectId = $derived(data.demoTrackingByProspectId ?? {});

	function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
		if (status === 'replied') return 'default';
		if (status === 'clicked' || status === 'opened') return 'secondary';
		if (status === 'sent') return 'outline';
		return 'outline';
	}

	function statusLabel(status: string): string {
		const labels: Record<string, string> = {
			draft: 'Draft',
			approved: 'Approved',
			sent: 'Sent',
			opened: 'Opened',
			clicked: 'Clicked',
			replied: 'Replied'
		};
		return labels[status] ?? status;
	}
</script>

<svelte:head>
	<title>Demos — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full">
	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header class="space-y-1 pb-6">
			<Card.Title class="text-2xl font-semibold tracking-tight">Demos</Card.Title>
			<Card.Description class="text-muted-foreground">
				What happened to the demo? Track status and engagement for prospects with a demo.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			{#if prospects.length === 0}
				<div class="px-4 py-8 text-center text-muted-foreground text-sm">
					No demos yet. Create demos from the Prospects page to see them here.
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[min(200px,40%)]">Company</Table.Head>
							<Table.Head class="w-[120px]">Demo status</Table.Head>
							<Table.Head class="w-[80px] text-right"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each prospects as p (p.id)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50"
								onclick={() => goto(`/dashboard/prospects/${p.id}`)}
								onkeydown={(e) => e.key === 'Enter' && goto(`/dashboard/prospects/${p.id}`)}
								role="link"
								tabindex="0"
							>
								<Table.Cell class="font-medium">
									{p.companyName || p.email || '—'}
								</Table.Cell>
								<Table.Cell>
									<Badge variant={statusVariant((demoTrackingByProspectId[p.id]?.status as DemoTrackingStatus) ?? 'draft')}>
										{statusLabel((demoTrackingByProspectId[p.id]?.status as string) ?? 'draft')}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8"
										aria-label="View prospect"
										onclick={(e) => {
											e.stopPropagation();
											goto(`/dashboard/prospects/${p.id}`);
										}}
									>
										<ChevronRight class="h-4 w-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
