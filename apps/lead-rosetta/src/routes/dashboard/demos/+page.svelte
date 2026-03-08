<script lang="ts">
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";
	import * as Card from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import { Button } from "$lib/components/ui/button";
	import { ExternalLink, ChevronRight } from "lucide-svelte";

	let { data } = $props<{ data: PageData }>();

	const prospects = $derived(data.prospects ?? []);
</script>

<svelte:head>
	<title>Demos — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full">
	<Card.Root>
		<Card.Header class="space-y-1 pb-6">
			<Card.Title class="text-2xl font-semibold tracking-tight"
				>Demos</Card.Title
			>
			<Card.Description class="text-muted-foreground">
				Prospects with a demo. Open the link or view details for each.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			{#if prospects.length === 0}
				<div
					class="px-4 py-8 text-center text-muted-foreground text-sm"
				>
					No demos yet. Create demos from the Prospects page to see
					them here.
				</div>
			{:else}
				<div class="overflow-x-auto mx-4 sm:mx-6 my-2">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[min(200px,40%)]"
									>Business name</Table.Head
								>
								<Table.Head>Link</Table.Head>
								<Table.Head class="w-[100px] text-right"
								></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each prospects as p (p.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										{p.companyName || p.email || "—"}
									</Table.Cell>
									<Table.Cell>
										{#if p.demoLink}
											<a
												href={p.demoLink}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1.5 text-primary hover:underline truncate max-w-[280px]"
												title={p.demoLink}
											>
												<span class="truncate"
													>{p.demoLink}</span
												>
												<ExternalLink
													class="h-3.5 w-3.5 shrink-0"
												/>
											</a>
										{:else}
											—
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button
											variant="ghost"
											size="icon"
											class="h-8 w-8"
											aria-label="View details"
											onclick={() =>
												goto(
													`/dashboard/prospects/${p.id}?returnTo=${encodeURIComponent("/dashboard/demos")}`,
												)}
										>
											<ChevronRight class="h-4 w-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
