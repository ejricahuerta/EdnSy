<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { getStatusDisplay } from '$lib/statusDisplay';
	import type { PageData } from './$types';
	// Clients page: full CRM table; no overview
	import type { Prospect } from '$lib/server/prospects';
	import { X, ExternalLink, Mail, MessageSquare, Copy, Link2, Send, PlusCircle, Eye, Globe, Phone, MapPin, Sparkles } from 'lucide-svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createRawSnippet, tick } from 'svelte';
	import DataTableCheckbox from '$lib/components/data-table-checkbox.svelte';
	import DataTableSortHeader from '../data-table-sort-header.svelte';
	import DataTableViewAction from '../data-table-view-action.svelte';
	import DataTableCompanyCell from '../data-table-company-cell.svelte';
	import DataTableStatusBadge from '../data-table-status-badge.svelte';
	import DataTableDemoStatus from '../data-table-demo-status.svelte';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatChatMessage } from '$lib/formatChatMessage';
	import { cn } from '$lib/utils';
import { canSendAutomated } from '$lib/plans';
import { toast, showFormToast } from '$lib/toast';
import { INDUSTRY_LABELS, INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string }> & {
			sent?: number;
			errors?: string[];
		};
	}>();
	const prospects = $derived(data.prospects);
	const plan = $derived(data.plan);
	const demoLimit = $derived(data.demoLimit);
	const demoCountThisMonth = $derived(data.demoCountThisMonth ?? 0);
	const canSend = $derived(plan ? canSendAutomated(plan) : false);
	const sendConfigured = $derived(data.sendConfigured ?? false);
	const sendEnabled = $derived(canSend && sendConfigured);
	const atDemoLimit = $derived(
		demoLimit !== null && demoLimit > 0 && demoCountThisMonth >= demoLimit
	);
	const demoUsageLabel = $derived(
		demoLimit === null ? 'Unlimited demos' : `${demoCountThisMonth} / ${demoLimit} demos this month`
	);
	const trackingCounts = $derived.by(() => {
		const map = data.demoTrackingByProspectId ?? {};
		let sent = 0,
			opened = 0,
			clicked = 0,
			replied = 0;
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

	// Actionable insights: counts for action cards (approved, draft from demo_tracking)
	const noDemoButEmail = $derived(
		prospects.filter((p) => (p.email ?? '').trim().length > 0 && !(p.demoLink ?? '').trim()).length
	);
	let approvedCount = 0,
		draftCount = 0;
	for (const t of Object.values(data.demoTrackingByProspectId ?? {})) {
		if (t.status === 'approved') approvedCount++;
		else if (t.status === 'draft') draftCount++;
	}
	const engagedCount = $derived(trackingCounts.opened + trackingCounts.clicked);

	// Prospect lists per action (for filter + single-item modal)
	const trackingByProspectId = $derived(data.demoTrackingByProspectId ?? {});
	const approvedProspects = $derived(
		prospects.filter((p) => trackingByProspectId[p.id]?.status === 'approved')
	);
	const noDemoProspects = $derived(
		prospects.filter((p) => (p.email ?? '').trim().length > 0 && !(p.demoLink ?? '').trim())
	);
	const draftProspects = $derived(
		prospects.filter((p) => trackingByProspectId[p.id]?.status === 'draft')
	);
	const engagedProspects = $derived(
		prospects.filter((p) => {
			const s = trackingByProspectId[p.id]?.status;
			return s === 'opened' || s === 'clicked';
		})
	);

	let dialogOpen = $state(false);
	let selectedProspect = $state<Prospect | null>(null);
	let generatingDemo = $state(false);
	let copied = $state(false);
	let aupConfirmed = $state(false);

	let addTestDialogOpen = $state(false);
	let dialogAupConfirmed = $state(false);
	let insightModalOpen = $state(false);
	let insightMessages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
	let insightInput = $state('');
	let insightLoading = $state(false);
	let insightLocked = $state(false);
	let insightLockedMessage = $state('');
	let insightMessagesEnd: HTMLDivElement | null = $state(null);
	const INSIGHT_SUGGESTED_QUERIES = [
		'Who should I send to first?',
		'Which prospects have no website?',
		'How should I prioritize follow-ups?'
	];

	$effect(() => {
		showFormToast(form);
	});
	$effect(() => {
		if (!dialogOpen) dialogAupConfirmed = false;
	});
	$effect(() => {
		if (data.prospectsError === 'not_configured') {
			toast.warning(data.prospectsMessage ?? 'Connect an integration in Dashboard → Integrations to sync prospects.');
		} else if (data.prospectsError === 'api_error') {
			toast.error(data.prospectsMessage ?? 'Could not load prospects. Check your integrations.');
		}
	});

	const dialogProspect = $derived(
		selectedProspect
			? (data.prospects.find((p) => p.id === selectedProspect.id) ?? selectedProspect)
			: null
	);

	let filterQuery = $state('');
	type DemoStatusFilter = '' | 'no_demo' | 'draft' | 'approved' | 'sent' | 'opened' | 'clicked' | 'replied' | 'engaged';
	let statusFilter = $state<DemoStatusFilter>('');
	const STATUS_OPTIONS: { value: DemoStatusFilter; label: string }[] = [
		{ value: '', label: 'All' },
		{ value: 'no_demo', label: 'No demo' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'sent', label: 'Sent' },
		{ value: 'opened', label: 'Opened' },
		{ value: 'clicked', label: 'Clicked' },
		{ value: 'engaged', label: 'Engaged (opened/clicked)' },
		{ value: 'replied', label: 'Replied' }
	];
	const statusFilterLabel = $derived(STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'All');

	const filteredProspects = $derived.by(() => {
		let list = prospects;
		const q = filterQuery.trim().toLowerCase();
		if (q) {
			list = list.filter(
				(p) =>
					(p.companyName ?? '').toLowerCase().includes(q) ||
					(p.email ?? '').toLowerCase().includes(q) ||
					(p.website ?? '').toLowerCase().includes(q) ||
					(p.industry ?? '').toLowerCase().includes(q) ||
					getStatusDisplay(p.status).label.toLowerCase().includes(q)
			);
		}
		if (statusFilter === 'no_demo') {
			list = list.filter((p) => !(p.demoLink ?? '').trim());
		} else if (statusFilter === 'engaged') {
			list = list.filter((p) => {
				const s = trackingByProspectId[p.id]?.status;
				return s === 'opened' || s === 'clicked';
			});
		} else if (statusFilter) {
			list = list.filter((p) => trackingByProspectId[p.id]?.status === statusFilter);
		}
		return list;
	});

	function openClientDialog(p: Prospect) {
		selectedProspect = p;
		copied = false;
		generatingDemo = false;
		dialogOpen = true;
	}

	function statusLabel(p: { status: string }): string {
		return getStatusDisplay(p.status).label;
	}

	function badgeVariant(p: { status: string }): 'default' | 'secondary' | 'outline' {
		const v = getStatusDisplay(p.status).variant;
		if (v === 'success') return 'default';
		if (v === 'warning') return 'secondary';
		return 'outline';
	}

	function enhanceGenerateDemo(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) generatingDemo = true;
		return async ({ result }: { result: import('./$types').ActionResult }) => {
			try {
				if (
					result.type === 'success' &&
					result.data &&
					typeof result.data === 'object' &&
					'success' in result.data &&
					result.data.success
				) {
					await invalidateAll();
				} else {
					await applyAction(result);
				}
			} finally {
				generatingDemo = false;
			}
		};
	}

	async function copyLink() {
		if (!dialogProspect?.demoLink) return;
		await navigator.clipboard.writeText(dialogProspect.demoLink);
		copied = true;
		toast.success('Demo link copied to clipboard');
		setTimeout(() => (copied = false), 2000);
	}

	function dialogStatusLabel(): string {
		if (!dialogProspect) return '';
		if (generatingDemo) return 'Building…';
		return getStatusDisplay(dialogProspect.status).label;
	}

	function dialogBadgeVariant(): 'default' | 'secondary' | 'outline' {
		if (!dialogProspect) return 'outline';
		if (generatingDemo) return 'secondary';
		const v = getStatusDisplay(dialogProspect.status).variant;
		if (v === 'success') return 'default';
		if (v === 'warning') return 'secondary';
		return 'outline';
	}

	$effect(() => {
		const _ = [insightMessages.length, insightLoading];
		tick().then(() => {
			insightMessagesEnd?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
	});

	function useSuggestedQuery(query: string) {
		insightInput = query;
	}

	async function sendInsightMessage() {
		const text = insightInput.trim();
		if (!text || insightLoading || insightLocked) return;
		insightInput = '';
		insightMessages = [...insightMessages, { role: 'user', content: text }];
		insightLoading = true;
		try {
			const history = insightMessages.map((m) => ({ role: m.role, content: m.content }));
			const res = await fetch('/api/dashboard/crm-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: history })
			});
			const responseData = await res.json();
			if ((res.status === 429 || res.status === 503) && responseData.locked) {
				insightLocked = true;
				insightLockedMessage = responseData.message ?? "You've reached the daily limit for CRM chat.";
				insightLoading = false;
				return;
			}
			if (!res.ok) {
				insightMessages = [
					...insightMessages,
					{ role: 'assistant', content: responseData.error ?? 'Something went wrong. Try again.' }
				];
				toast.error(responseData.error ?? 'Request failed');
				insightLoading = false;
				return;
			}
			insightMessages = [...insightMessages, { role: 'assistant', content: responseData.content ?? '' }];
		} catch {
			insightMessages = [
				...insightMessages,
				{ role: 'assistant', content: 'Unable to send. Check your connection and try again.' }
			];
			toast.error('Connection error');
		} finally {
			insightLoading = false;
		}
	}

	function handleInsightKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendInsightMessage();
		}
	}

	const columns: ColumnDef<Prospect>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(DataTableCheckbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate:
						table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(DataTableCheckbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'companyName',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, { column, label: 'Company' }),
			cell: ({ row }) =>
				renderComponent(DataTableCompanyCell, {
					prospect: row.original,
					onView: openClientDialog
				})
		},
		{
			accessorKey: 'industry',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, { column, label: 'Industry' }),
			cell: ({ row }) => {
				const snippet = createRawSnippet<[{ industry: string }]>((getIndustry) => {
					const { industry } = getIndustry();
					const safe = (industry ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
					return {
						render: () => `<div class="text-muted-foreground">${safe}</div>`
					};
				});
				return renderSnippet(snippet, { industry: row.original.industry });
			}
		},
		{
			accessorKey: 'status',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, { column, label: 'Status' }),
			cell: ({ row }) => {
				const p = row.original;
				return renderComponent(DataTableStatusBadge, {
					label: statusLabel(p),
					variant: badgeVariant(p)
				});
			}
		},
		{
			id: 'demoStatus',
			header: () => 'Demo status',
			meta: { label: 'Demo status' },
			cell: ({ row }) => {
				const tracking = data.demoTrackingByProspectId?.[row.original.id];
				const hasDemoLink = !!row.original.demoLink;
				return renderComponent(DataTableDemoStatus, {
					status: tracking?.status,
					sendTime: tracking?.send_time,
					openedAt: tracking?.opened_at ?? null,
					clickedAt: tracking?.clicked_at ?? null,
					hasDemoLink,
					demoLink: row.original.demoLink ?? null
				});
			},
			enableSorting: false
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) =>
				renderComponent(DataTableViewAction, {
					prospect: row.original,
					onView: openClientDialog
				})
		}
	];

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return filteredProspects;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});
</script>

<svelte:head>
	<title>Clients — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full">
	<div class="mb-4">
		<a href="/dashboard" class="inline-flex items-center gap-2 text-sm font-medium text-[var(--sage)] hover:text-[var(--sage-light)]">
			← Dashboard
		</a>
	</div>

	<!-- Clients (CRM) -->
	<Card.Root id="clients" class="border-0 bg-card shadow-none">
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-4">
			<div>
				<Card.Title class="font-semibold text-foreground text-lg">Clients</Card.Title>
				<Card.Description class="mt-1">
					Your clients from Connect CRM. Generate demos, then send via email or copy the link to send yourself.
				</Card.Description>
				{#if trackingSummaryLabel}
					<p class="mt-0.5 text-xs text-muted-foreground">
						{trackingSummaryLabel}
					</p>
				{/if}
			</div>
			<div class="flex items-center gap-2 shrink-0">
				<Button
					variant="outline"
					size="sm"
					class="border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)]/10 hover:text-[var(--sage-light)]"
					onclick={() => (addTestDialogOpen = true)}
					aria-label="Add test client"
				>
					<PlusCircle class="size-4 me-1.5" aria-hidden="true" />
					Add test client
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)]/10 hover:text-[var(--sage-light)]"
					onclick={() => (insightModalOpen = true)}
					aria-label="Open CRM insight chat"
				>
					<Sparkles class="size-4 me-1.5" aria-hidden="true" />
					Insights
				</Button>
			</div>
		</Card.Header>
		{#if prospects.length > 0}
			<div class="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
				<div class="w-full max-w-sm">
					<label for="lr-dash-filter" class="sr-only">Filter clients</label>
					<InputGroup.Root class="w-full">
						<InputGroup.Input
							id="lr-dash-filter"
							type="search"
							placeholder="Search..."
							bind:value={filterQuery}
							aria-label="Filter clients"
							autocomplete="off"
						/>
						<InputGroup.Addon>
							<SearchIcon />
						</InputGroup.Addon>
						<InputGroup.Addon align="inline-end">
							{#if filterQuery}
								<InputGroup.Button
									type="button"
									variant="ghost"
									size="icon-xs"
									aria-label="Clear search"
									onclick={() => (filterQuery = '')}
								>
									<X class="size-4" />
								</InputGroup.Button>
							{:else}
								<InputGroup.Text class="text-muted-foreground text-sm">
									{filteredProspects.length}
									{filteredProspects.length === 1 ? 'client' : 'clients'}
								</InputGroup.Text>
							{/if}
						</InputGroup.Addon>
					</InputGroup.Root>
				</div>
				<div class="flex items-center gap-2">
					<label for="lr-dash-status" class="text-sm text-muted-foreground whitespace-nowrap">Status</label>
					<Select.Root type="single" bind:value={statusFilter}>
						<Select.Trigger id="lr-dash-status" class="min-w-[8rem]" aria-label="Filter by demo status">
							{statusFilterLabel}
						</Select.Trigger>
						<Select.Content>
							{#each STATUS_OPTIONS as opt (opt.value)}
								<Select.Item value={opt.value}>{opt.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" class="ms-auto">
								Columns
								<ChevronDownIcon class="ms-2 size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
							<DropdownMenu.CheckboxItem
								class="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{(column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id}
							</DropdownMenu.CheckboxItem>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		{/if}
		<Card.Content class="lr-dash-card-content p-0">
			<div class="overflow-x-auto -mx-px">
				<div class="rounded-md overflow-hidden">
					<Table.Root>
						<Table.Header>
							{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<Table.Row>
									{#each headerGroup.headers as header (header.id)}
										<Table.Head class="[&:has([role=checkbox])]:ps-3">
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
								<Table.Row data-state={row.getIsSelected() && 'selected'}>
									{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell class="[&:has([role=checkbox])]:ps-3">
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
			{#if prospects.length > 0 && filteredProspects.length > 0}
				<div class="flex flex-wrap items-center justify-end gap-2 py-4 px-4">
					<div class="text-muted-foreground flex-1 text-sm">
						{table.getFilteredSelectedRowModel().rows.length} of
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					{#if table.getFilteredSelectedRowModel().rows.length > 0}
						<form
							method="POST"
							action="?/bulkGenerateDemos"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
										const created = (result.data as { created?: number }).created ?? 0;
										if (created > 0) toast.success(`Created ${created} demo(s)`);
										rowSelection = {};
										await invalidateAll();
									} else if (result.type === 'failure' && result.data) {
										await applyAction(result);
									}
								};
							}}
							class="inline-flex"
						>
							{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
								<input type="hidden" name="prospectId" value={row.original.id} />
							{/each}
							<Button
								type="submit"
								variant="outline"
								size="sm"
								disabled={atDemoLimit}
								title={atDemoLimit ? 'Demo limit reached' : 'Create demos for selected (skips those that already have one)'}
								class="border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)]/10"
							>
								Create demos
							</Button>
						</form>
						<form
							method="POST"
							action="?/bulkApproveDemos"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
										rowSelection = {};
										await invalidateAll();
									} else if (result.type === 'failure' && result.data) {
										await applyAction(result);
									}
								};
							}}
							class="inline-flex"
						>
							{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
								<input type="hidden" name="prospectId" value={row.original.id} />
							{/each}
							<Button type="submit" variant="secondary" size="sm">
								Approve
							</Button>
						</form>
						{#if sendEnabled}
							<form
								method="POST"
								action="?/sendDemos"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
											const sent = (result.data as { sent?: number }).sent ?? 0;
											if (sent > 0) toast.success(`Sent to ${sent} prospect(s)`);
											rowSelection = {};
											await invalidateAll();
										} else if (result.type === 'failure' && result.data) {
											const msg = (result.data as { message?: string }).message;
											if (msg) toast.error(msg);
											await applyAction(result);
										}
									};
								}}
								class="inline-flex flex-wrap items-center gap-2"
							>
								{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
									<input type="hidden" name="prospectId" value={row.original.id} />
								{/each}
								{#if aupConfirmed}
									<input type="hidden" name="aupConfirmed" value="on" />
								{/if}
								<label class="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
									<Checkbox bind:checked={aupConfirmed} />
									<span>I confirm my outreach complies with the <a href="/aup" target="_blank" rel="noopener noreferrer" class="underline text-[var(--sage)] hover:no-underline">Acceptable Use Policy</a> and I will honor all unsubscribe requests.</span>
								</label>
								<Button type="submit" variant="default" size="sm" disabled={!aupConfirmed}>
									Send
								</Button>
							</form>
						{:else}
							<Button
								variant="outline"
								size="sm"
								disabled
								title={!canSend ? 'Upgrade to Pro to send' : !sendConfigured ? 'Configure Resend (RESEND_API_KEY, RESEND_FROM_EMAIL) to send' : 'Select clients to send'}
							>
								Send
							</Button>
						{/if}
					{/if}
					<div class="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Client details dialog -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
			{#if dialogProspect}
				<Dialog.Header class="px-6 pt-6 pb-4 border-b border-border/60">
					<div class="flex flex-wrap items-start justify-between gap-3 pr-8">
						<div class="min-w-0">
							<Dialog.Title class="font-semibold text-foreground text-xl truncate">
								{dialogProspect.companyName}
							</Dialog.Title>
							{#if dialogProspect.industry}
								<Dialog.Description class="text-muted-foreground text-sm mt-0.5">
									{dialogProspect.industry}
								</Dialog.Description>
							{/if}
						</div>
						<Badge
							variant={dialogBadgeVariant()}
							class={cn(
								'shrink-0',
								dialogBadgeVariant() === 'secondary' &&
									'bg-[rgba(193,125,42,0.12)] text-[var(--amber)] border-[var(--amber)]/25',
								dialogBadgeVariant() === 'outline' && 'bg-muted text-muted-foreground border-border'
							)}
						>
							{dialogStatusLabel()}
						</Badge>
					</div>
				</Dialog.Header>

				<div class="px-6 py-4 space-y-5">
					<!-- Contact section -->
					<section class="space-y-3" aria-labelledby="details-contact-heading">
						<h2 id="details-contact-heading" class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Contact
						</h2>
						{#if dialogProspect.email || dialogProspect.website || dialogProspect.phone || dialogProspect.address || dialogProspect.city}
							<ul class="space-y-3">
								{#if dialogProspect.email}
									<li class="flex items-start gap-3">
										<Mail class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
										<div class="min-w-0">
											<span class="sr-only">Email</span>
											<a href="mailto:{dialogProspect.email}" class="text-[var(--sage)] hover:underline break-all">
												{dialogProspect.email}
											</a>
										</div>
									</li>
								{/if}
								{#if dialogProspect.website}
									<li class="flex items-start gap-3">
										<Globe class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
										<div class="min-w-0">
											<span class="sr-only">Website</span>
											<a
												href={dialogProspect.website}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1.5 text-[var(--sage)] hover:underline break-all"
											>
												{dialogProspect.website}
												<ExternalLink class="size-3.5 shrink-0" aria-hidden="true" />
											</a>
										</div>
									</li>
								{/if}
								{#if dialogProspect.phone}
									<li class="flex items-start gap-3">
										<Phone class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
										<div class="min-w-0">
											<span class="sr-only">Phone</span>
											<a href="tel:{dialogProspect.phone}" class="text-[var(--sage)] hover:underline">
												{dialogProspect.phone}
											</a>
										</div>
									</li>
								{/if}
								{#if dialogProspect.address || dialogProspect.city}
									<li class="flex items-start gap-3">
										<MapPin class="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
										<div class="min-w-0 text-foreground text-sm">
											<span class="sr-only">Address</span>
											{#if dialogProspect.address}{dialogProspect.address}{/if}
											{#if dialogProspect.address && dialogProspect.city}, {/if}
											{#if dialogProspect.city}{dialogProspect.city}{/if}
										</div>
									</li>
								{/if}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">No contact info</p>
						{/if}
					</section>

					<!-- Personalized demo section -->
					<section class="rounded-lg border border-border bg-muted/30 p-4 space-y-4" aria-labelledby="details-demo-heading">
						<h2 id="details-demo-heading" class="text-xs font-semibold text-foreground uppercase tracking-wider">
							Personalized demo
						</h2>
						{#if generatingDemo}
							<p class="text-sm text-muted-foreground flex items-center gap-2">
								<span class="inline-block size-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" aria-hidden="true"></span>
								Building demo…
							</p>
						{:else if dialogProspect.demoLink}
							<div class="space-y-3">
								<div class="flex flex-wrap items-center gap-2">
									<a
										href={dialogProspect.demoLink}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1.5 text-[var(--sage)] hover:underline font-medium text-sm"
									>
										<Link2 class="size-4 shrink-0" aria-hidden="true" />
										Preview demo
									</a>
									<span class="text-muted-foreground">·</span>
									<Button variant="ghost" size="sm" class="text-[var(--sage)] h-8 px-2" onclick={copyLink}>
										<Copy class="size-4 mr-1" aria-hidden="true" />
										{copied ? 'Copied' : 'Copy link'}
									</Button>
									{#if sendEnabled && dialogProspect.email?.trim() && data.demoTrackingByProspectId?.[dialogProspect.id]?.status === 'approved'}
										<form
											method="POST"
											action="?/sendDemos"
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
														const sent = (result.data as { sent?: number }).sent ?? 0;
														if (sent > 0) {
															toast.success(`Demo sent to ${dialogProspect.companyName || 'client'}`);
															dialogOpen = false;
															await invalidateAll();
														}
													} else if (result.type === 'failure' && result.data) {
														const msg = (result.data as { message?: string }).message;
														if (msg) toast.error(msg);
													}
												};
											}}
											class="inline-flex items-center gap-2"
										>
											<input type="hidden" name="prospectId" value={dialogProspect.id} />
											{#if dialogAupConfirmed}
												<input type="hidden" name="aupConfirmed" value="on" />
											{/if}
											<label class="flex items-center gap-1.5 cursor-pointer">
												<Checkbox bind:checked={dialogAupConfirmed} />
												<span class="text-xs text-muted-foreground">AUP</span>
											</label>
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												class="text-[var(--sage)] h-8 px-2"
												disabled={!dialogAupConfirmed}
												title={dialogAupConfirmed ? 'Send demo by email (Resend)' : 'Check AUP to send'}
											>
												<Mail class="size-4 mr-1" aria-hidden="true" />
												Email
											</Button>
										</form>
									{:else}
										<span
											class="inline-flex items-center gap-1.5 text-muted-foreground text-sm"
											title={!sendEnabled ? 'Configure Resend to send' : !dialogProspect.email?.trim() ? 'No email' : data.demoTrackingByProspectId?.[dialogProspect.id]?.status !== 'approved' ? 'Set status to Approved to send' : ''}
										>
											<Mail class="size-4" aria-hidden="true" />
											Email
										</span>
									{/if}
									<a href="sms:?body={encodeURIComponent('Your demo: ' + dialogProspect.demoLink)}" class="inline-flex">
										<Button variant="ghost" size="sm" class="text-[var(--sage)] h-8 px-2">
											<MessageSquare class="size-4 mr-1" aria-hidden="true" />
											SMS
										</Button>
									</a>
								</div>
								<p class="text-xs text-muted-foreground break-all font-mono">{dialogProspect.demoLink}</p>
								{#if data.demoTrackingByProspectId?.[dialogProspect.id]}
									{@const tracking = data.demoTrackingByProspectId[dialogProspect.id]}
									<div class="pt-3 border-t border-border space-y-2">
										<p class="text-xs font-medium text-muted-foreground">Demo status</p>
										<form
											method="POST"
											action="?/updateDemoStatus"
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
														await invalidateAll();
													} else if (result.type === 'failure' && result.data) {
														await applyAction(result);
													}
												};
											}}
											class="flex flex-wrap items-center gap-2"
										>
											<input type="hidden" name="prospectId" value={dialogProspect.id} />
											<select
												name="status"
												class="h-8 rounded-md border border-input bg-background px-2 text-sm min-w-[7rem]"
											>
												<option value="draft" selected={tracking.status === 'draft'}>Draft</option>
												<option value="approved" selected={tracking.status === 'approved'}>Approved</option>
												<option value="sent" selected={tracking.status === 'sent'}>Sent</option>
												<option value="opened" selected={tracking.status === 'opened'}>Opened</option>
												<option value="clicked" selected={tracking.status === 'clicked'}>Clicked</option>
												<option value="replied" selected={tracking.status === 'replied'}>Replied</option>
											</select>
											<Button type="submit" variant="secondary" size="sm">Update</Button>
										</form>
										<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
											{#if tracking.status === 'sent' && tracking.send_time}
												<span>Sent {new Date(tracking.send_time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
											{/if}
											{#if tracking.opened_at}
												<span>Opened {new Date(tracking.opened_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
											{/if}
											{#if tracking.clicked_at}
												<span>Clicked {new Date(tracking.clicked_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<form method="POST" action="?/generateDemo" use:enhance={enhanceGenerateDemo}>
								<input type="hidden" name="prospectId" value={dialogProspect.id} />
								<Button
									type="submit"
									disabled={generatingDemo || atDemoLimit}
									class="lr-dash-cta-create-demo bg-[var(--amber)] text-white hover:bg-[var(--amber-light)]"
									title={atDemoLimit ? 'Demo limit reached. Upgrade your plan for more.' : undefined}
								>
									{generatingDemo ? 'Building…' : atDemoLimit ? 'Limit reached' : 'Create demo'}
								</Button>
							</form>
						{/if}
					</section>
				</div>

				<Dialog.Footer class="flex flex-row justify-end gap-2 px-6 py-4 border-t border-border/60 bg-muted/20">
					<Dialog.Close
						class="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
					>
						Close
					</Dialog.Close>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>

	<!-- Add test client (no CRM needed) -->
	<Dialog.Root bind:open={addTestDialogOpen}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Add test client</Dialog.Title>
				<Dialog.Description>
					Add one prospect so you can create a demo and send it. No CRM required.
				</Dialog.Description>
			</Dialog.Header>
			<form
				method="POST"
				action="?/addTestProspect"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
							addTestDialogOpen = false;
							toast.success((result.data as { message?: string }).message ?? 'Test client added.');
							await invalidateAll();
						} else if (result.type === 'failure' && result.data) {
							const msg = (result.data as { message?: string }).message;
							if (msg) toast.error(msg);
						}
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label for="add-test-company" class="text-sm font-medium">Company name</label>
					<Input id="add-test-company" name="companyName" type="text" placeholder="Acme Inc." required class="w-full" />
				</div>
				<div class="space-y-2">
					<label for="add-test-email" class="text-sm font-medium">Email</label>
					<Input id="add-test-email" name="email" type="email" placeholder="you@example.com" required class="w-full" />
				</div>
				<div class="space-y-2">
					<label for="add-test-industry" class="text-sm font-medium">Industry</label>
					<select id="add-test-industry" name="industry" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
						{#each INDUSTRY_SLUGS as slug (slug)}
							<option value={INDUSTRY_LABELS[slug]}>{INDUSTRY_LABELS[slug]}</option>
						{/each}
					</select>
				</div>
				<Dialog.Footer class="flex flex-row justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onclick={() => (addTestDialogOpen = false)}>Cancel</Button>
					<Button type="submit">Add client</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Insight chat modal -->
	<Dialog.Root bind:open={insightModalOpen}>
		<Dialog.Content class="sm:max-w-2xl w-[calc(100%-2rem)] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
			<Dialog.Header class="shrink-0 px-4 pt-4 pb-2">
				<Dialog.Title class="flex items-center gap-2">
					<Sparkles class="size-5 text-[var(--sage)]" aria-hidden="true" />
					Ask about your CRM
				</Dialog.Title>
				<Dialog.Description class="text-sm text-muted-foreground">
					Get suggestions: who to send to first, who has no website, or how to prioritize.
				</Dialog.Description>
			</Dialog.Header>
			{#if insightLocked}
				<p class="px-4 pb-4 text-sm text-muted-foreground">{insightLockedMessage}</p>
			{:else}
				<div class="shrink-0 px-4 space-y-3 pb-2">
					<p class="text-xs font-medium text-muted-foreground">Try a question:</p>
					<div class="flex flex-wrap gap-2">
						{#each INSIGHT_SUGGESTED_QUERIES as q (q)}
							<Button
								variant="outline"
								size="sm"
								class="text-xs border-border bg-background text-foreground hover:border-[var(--sage)]/60 hover:bg-muted/50"
								onclick={() => useSuggestedQuery(q)}
							>
								{q}
							</Button>
						{/each}
					</div>
				</div>
				<div
					class="flex-1 min-h-0 rounded-md bg-muted/20 mx-4 overflow-y-auto overflow-x-hidden flex flex-col p-3 gap-3"
					role="log"
					aria-live="polite"
					aria-label="Chat messages"
				>
					{#if insightMessages.length === 0 && !insightLoading}
						<p class="text-sm text-muted-foreground py-2">
							Type a question or click one above, then send.
						</p>
					{:else}
						{#each insightMessages as msg, i (i)}
							<div
								class={msg.role === 'user'
									? 'ml-auto max-w-[85%] rounded-lg bg-[var(--sage)]/15 text-foreground px-3 py-2 text-sm break-words'
									: 'mr-auto max-w-[85%] rounded-lg bg-muted/80 text-foreground px-3 py-2 text-sm break-words [&_strong]:font-semibold [&_br]:block'}
								role="listitem"
							>
								{#if msg.role === 'assistant'}
									{@html formatChatMessage(msg.content)}
								{:else}
									{msg.content}
								{/if}
							</div>
						{/each}
					{/if}
					{#if insightLoading}
						<div class="flex items-center gap-2 text-sm text-muted-foreground py-1">
							<span class="inline-block size-2 rounded-full bg-[var(--sage)] animate-pulse" aria-hidden="true"></span>
							<span>Thinking…</span>
						</div>
					{/if}
					<div bind:this={insightMessagesEnd} class="h-0 w-full shrink-0" aria-hidden="true"></div>
				</div>
				<div class="shrink-0 flex gap-2 items-end p-4 pt-3 border-t border-border/50">
					<Textarea
						placeholder="Ask about your CRM..."
						bind:value={insightInput}
						onkeydown={handleInsightKeydown}
						disabled={insightLoading}
						rows={2}
						class="flex-1 min-w-0 resize-none min-h-[4rem] max-h-32 border-border bg-background focus-visible:ring-[var(--sage)]/40 focus-visible:border-[var(--sage)]/50 transition-none hover:border-border hover:bg-background"
						aria-label="Chat message"
					/>
					<Button
						type="button"
						size="default"
						onclick={sendInsightMessage}
						disabled={insightLoading || !insightInput.trim()}
						class="shrink-0 bg-[var(--sage)] text-white hover:bg-[var(--sage-light)] h-[4rem] px-4"
						aria-label="Send message"
					>
						{#if insightLoading}
							<span class="animate-pulse">…</span>
						{:else}
							<Send class="size-4 me-1.5" aria-hidden="true" />
							Send
						{/if}
					</Button>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Root>

	{#if prospects.length === 0}
		<p class="py-8 text-sm text-muted-foreground">No prospects yet. Connect an integration and sync, or add from your CRM.</p>
	{:else if filteredProspects.length === 0}
		<p class="py-8 text-sm text-muted-foreground">No prospects match your filter. Try a different search.</p>
	{/if}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
