<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { Prospect } from '$lib/server/prospects';
	import {
		type Column,
		type ColumnDef,
		type PaginationState,
		type SortingState,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent
	} from '$lib/components/ui/data-table/index.js';
	import DataTableSortHeader from '$lib/components/prospects/data-table-sort-header.svelte';
	import DemosBusinessCell from '$lib/components/demos/demos-business-cell.svelte';
	import DemosLinkCell from '$lib/components/demos/demos-link-cell.svelte';
	import DemosOpenDetailCell from '$lib/components/demos/demos-open-detail-cell.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import SearchIcon from '@lucide/svelte/icons/search';
	import {
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight,
		X
	} from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	const prospects = $derived((data.prospects ?? []) as Prospect[]);
	let filterQuery = $state('');

	const filteredDemos = $derived.by((): Prospect[] => {
		const q = filterQuery.trim().toLowerCase();
		if (!q) return prospects;
		return prospects.filter((p: Prospect) => {
			const name = (p.companyName ?? '').toLowerCase();
			const email = (p.email ?? '').toLowerCase();
			const link = (p.demoLink ?? '').toLowerCase();
			return name.includes(q) || email.includes(q) || link.includes(q);
		});
	});

	const columns: ColumnDef<Prospect>[] = [
		{
			id: 'business',
			accessorFn: (row) => row.companyName || row.email || '',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, {
					column: column as Column<unknown, unknown>,
					label: 'Business name'
				}),
			cell: ({ row }) =>
				renderComponent(DemosBusinessCell, {
					companyName: row.original.companyName,
					email: row.original.email
				})
		},
		{
			accessorKey: 'demoLink',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, {
					column: column as Column<unknown, unknown>,
					label: 'Link'
				}),
			cell: ({ row }) =>
				renderComponent(DemosLinkCell, { demoLink: row.original.demoLink ?? '' }),
			sortingFn: (rowA, rowB, columnId) => {
				const a = String(rowA.getValue(columnId) ?? '').toLowerCase();
				const b = String(rowB.getValue(columnId) ?? '').toLowerCase();
				return a.localeCompare(b);
			}
		},
		{
			id: 'actions',
			header: () => '',
			enableSorting: false,
			cell: ({ row }) =>
				renderComponent(DemosOpenDetailCell, { prospectId: row.original.id })
		}
	];

	const DEFAULT_PAGE_SIZE = 10;

	function getPaginationFromUrl(url: URL): PaginationState {
		const pageParam = url.searchParams.get('page');
		const sizeParam = url.searchParams.get('pageSize');
		const pageIndex = Math.max(0, parseInt(pageParam ?? '1', 10) - 1);
		const parsed = parseInt(sizeParam ?? String(DEFAULT_PAGE_SIZE), 10);
		const pageSize = Number.isNaN(parsed) ? DEFAULT_PAGE_SIZE : Math.max(1, parsed);
		return { pageIndex, pageSize };
	}

	async function setPaginationInUrl(next: PaginationState) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(next.pageIndex + 1));
		url.searchParams.set('pageSize', String(next.pageSize));
		await goto(url.pathname + url.search, { replaceState: true });
	}

	const pagination = $derived.by((): PaginationState => {
		const fromUrl = getPaginationFromUrl($page.url);
		const rowCount = filteredDemos.length;
		const maxPageIndex =
			fromUrl.pageSize > 0 ? Math.max(0, Math.ceil(rowCount / fromUrl.pageSize) - 1) : 0;
		return {
			pageIndex: Math.min(fromUrl.pageIndex, maxPageIndex),
			pageSize: fromUrl.pageSize
		};
	});

	let sorting = $state<SortingState>([]);

	const table = createSvelteTable({
		get data() {
			return filteredDemos;
		},
		columns,
		getRowId: (row) => row.id,
		autoResetPageIndex: false,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: async (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			await setPaginationInUrl(next);
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		}
	});
</script>

<svelte:head>
	<title>Demos — Ed & Sy Admin</title>
</svelte:head>

<div class="lr-dash-page mx-auto w-full max-w-[1200px]">
	<Card.Root>
		<Card.Header class="space-y-1 pb-6">
			<Card.Title class="text-2xl font-semibold tracking-tight">Demos</Card.Title>
			<Card.Description class="text-muted-foreground">
				Prospects with a demo. Search, sort, and open each link or prospect.
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-0">
			{#if data.demosLoadError}
				<div class="px-4 py-8 text-center text-sm text-destructive sm:px-6">
					Could not load demos{data.demosLoadMessage ? `: ${data.demosLoadMessage}` : '.'}
				</div>
			{:else if prospects.length === 0}
				<div class="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
					No demos yet. Create demos from the Prospects page to see them here.
				</div>
			{:else}
				<div class="mx-4 mb-4 sm:mx-6">
					<div
						class="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6"
						role="search"
						aria-label="Search demos"
					>
						<div class="relative min-w-0 w-full shrink-0 md:max-w-sm">
							<label for="lr-demos-filter" class="sr-only">Search demos</label>
							<SearchIcon
								class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input
								id="lr-demos-filter"
								type="search"
								placeholder="Filter by business, email, or link…"
								bind:value={filterQuery}
								aria-label="Filter demos"
								autocomplete="off"
								class="h-9 pl-9 pr-20"
							/>
							<div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
								{#if filterQuery}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="h-7 w-7"
										aria-label="Clear search"
										onclick={() => (filterQuery = '')}
									>
										<X class="size-4" />
									</Button>
								{:else}
									<span class="text-xs tabular-nums text-muted-foreground">
										{filteredDemos.length}
										{filteredDemos.length === 1 ? 'demo' : 'demos'}
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>

				{#if filteredDemos.length === 0}
					<div class="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
						No demos match your search. Try a different filter.
					</div>
				{:else}
					<div class="mx-4 my-2 overflow-x-auto sm:mx-6">
						<div class="overflow-hidden rounded-md border bg-background">
							<Table.Root>
								<Table.Header>
									{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
										<Table.Row>
											{#each headerGroup.headers as header (header.id)}
												<Table.Head
													class={header.column.id === 'actions'
														? 'w-[100px] text-right'
														: header.column.id === 'business'
															? 'w-[min(200px,40%)]'
															: ''}
												>
													{#if !header.isPlaceholder}
														<FlexRender
															content={header.column.columnDef.header}
															context={header.getContext()}
														/>
													{/if}
												</Table.Head>
											{/each}
										</Table.Row>
									{/each}
								</Table.Header>
								<Table.Body>
									{#each table.getRowModel().rows as row (row.id)}
										<Table.Row>
											{#each row.getVisibleCells() as cell (cell.id)}
												<Table.Cell
													class={cell.column.id === 'actions' ? 'text-right' : ''}
												>
													<FlexRender
														content={cell.column.columnDef.cell}
														context={cell.getContext()}
													/>
												</Table.Cell>
											{/each}
										</Table.Row>
									{:else}
										<Table.Row>
											<Table.Cell colspan={columns.length} class="h-24 text-center">
												No results.
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>

					<div
						class="mx-4 mb-6 flex flex-wrap items-center justify-end gap-6 sm:mx-6 lg:w-auto"
					>
						<div class="flex items-center gap-2">
							<Label for="lr-demos-rows-per-page" class="whitespace-nowrap text-sm font-medium"
								>Rows per page</Label
							>
							<Select.Root
								type="single"
								value={String(pagination.pageSize)}
								onValueChange={(v) => v != null && table.setPageSize(Number(v))}
							>
								<Select.Trigger
									id="lr-demos-rows-per-page"
									size="sm"
									class="h-8 w-20 border-border/50"
								>
									{pagination.pageSize}
								</Select.Trigger>
								<Select.Content side="top">
									{#each [10, 20, 30, 40, 50] as size (size)}
										<Select.Item value={String(size)}>{size}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex items-center justify-center whitespace-nowrap text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of {Math.max(
								1,
								table.getPageCount()
							)}
						</div>
						<div class="flex items-center gap-2 [&_button]:border-border/50">
							<Button
								type="button"
								variant="outline"
								size="icon"
								class="size-8"
								onclick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
								aria-label="Go to first page"
							>
								<ChevronsLeft class="size-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								class="size-8"
								onclick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
								aria-label="Go to previous page"
							>
								<ChevronLeft class="size-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								class="size-8"
								onclick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								aria-label="Go to next page"
							>
								<ChevronRight class="size-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon"
								class="size-8"
								onclick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
								aria-label="Go to last page"
							>
								<ChevronsRight class="size-4" />
							</Button>
						</div>
					</div>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
</div>
