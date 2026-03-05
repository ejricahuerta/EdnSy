<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll, invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getStatusDisplay } from '$lib/statusDisplay';
	import {
		ENGAGED_STATUSES,
		getStatusFilterOptionsForPipelineTab,
		getValidStatusFilterValuesForPipelineTab,
		type DemoStatusFilterValue
	} from '$lib/demo';
	import type { PageData } from './$types';
	// Prospects page: full CRM table; no overview
	import type { Prospect } from '$lib/server/prospects';

	/** Prospect plus job/tracking status for table row so status column reacts to load updates. */
	type ProspectRow = Prospect & {
		gbpJob?: { jobId: string; status: string };
		insightsJob?: { jobId: string; status: string };
		demoJob?: { status: string; jobId: string; demoLink?: string | null; errorMessage?: string | null };
		tracking?: { status?: string; send_time?: string | null; opened_at?: string | null; clicked_at?: string | null };
	};
	import { X, ExternalLink, Mail, MessageSquare, Copy, Link2, Send, Eye, Globe, Phone, MapPin, Star, ListChecks, Briefcase, LoaderCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
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
	import DataTableActionsCell from '../data-table-actions-cell.svelte';
	import DataTableCompanyCell from '../data-table-company-cell.svelte';
	import DataTableStatusBadge from '../data-table-status-badge.svelte';
	import DataTableDemoStatus from '../data-table-demo-status.svelte';
	import DataTableGbpCell from '../data-table-gbp-cell.svelte';
	import DataTableWebsiteCell from '../data-table-website-cell.svelte';
	import DataTableWebsiteGradingCell from '../data-table-website-grading-cell.svelte';
	import { auditFromScrapedData } from '$lib/demo';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { toastSuccess, toastError, toastInfo, toastFromActionResult } from '$lib/toast';
import { clientError } from '$lib/log';
import { INDUSTRY_LABELS, INDUSTRY_SLUGS, industryDisplayToSlug, type IndustrySlug } from '$lib/industries';

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
	const engagedCount = $derived(trackingCounts.opened + trackingCounts.clicked);

	// Prospect lists per action (for filter + single-item modal)
	const trackingByProspectId = $derived(data.demoTrackingByProspectId ?? {});
	const scrapedDataByProspectId = $derived(data.scrapedDataByProspectId ?? {} as Record<string, Record<string, unknown>>);

	/** Enriched list so table data depends on job maps and status column re-renders when they change. */
	const prospectsWithJobStatus = $derived.by((): ProspectRow[] => {
		const list = data.prospects ?? [];
		const gbp = data.gbpJobsByProspectId ?? {};
		const insights = data.insightsJobsByProspectId ?? {};
		const demo = data.demoJobsByProspectId ?? {};
		const tracking = data.demoTrackingByProspectId ?? {};
		return list.map((p) => ({
			...p,
			gbpJob: gbp[p.id],
			insightsJob: insights[p.id],
			demoJob: demo[p.id],
			tracking: tracking[p.id]
		}));
	});

	type PipelineTab = 'qualify' | 'research' | 'no_fit';
	let pipelineTab = $state<PipelineTab>('qualify');
	const approvedProspects = $derived(
		prospects.filter((p) => trackingByProspectId[p.id]?.status === 'approved')
	);
	const noDemoProspects = $derived(
		prospects.filter((p) => !p.flagged && (p.email ?? '').trim().length > 0 && !(p.demoLink ?? '').trim())
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
	/** Count of prospects with status "In queue" (may be stuck if no active job). */
	const prospectsInQueueCount = $derived(
		prospects.filter((p) => (p.status ?? '').trim() === 'In queue').length
	);

	let generatingDemo = $state(false);
	type ScrapedSummary = {
		gbpCompletenessScore?: number | null;
		gbpCompletenessLabel?: string | null;
		googleRatingValue?: number | null;
		googleReviewCount?: number | null;
		gbpClaimed?: boolean | null;
		gbpHasHours?: boolean | null;
	};
	type HttpCallLogEntry = {
		id: string;
		time: string;
		method: string;
		action: string;
		result: 'success' | 'failure';
		message?: string;
		/** HTTP status from server when result is failure (e.g. 503, 400, 502) */
		status?: number;
		/** Request context for debugging (e.g. prospectId=xyz, 3 selected) */
		context?: string;
		/** Full response from server (for dev console); only set on failure */
		responseData?: unknown;
		scrapedSummary?: ScrapedSummary | null;
		scrapedSummaries?: ScrapedSummary[] | null;
		noScrapedData?: boolean;
	};
	let httpCallLogs = $state<HttpCallLogEntry[]>([]);
	const HTTP_CALL_LOGS_MAX = 100;
	function addHttpCallLog(entry: {
		action: string;
		method?: string;
		result: 'success' | 'failure';
		message?: string;
		status?: number;
		context?: string;
		responseData?: unknown;
		scrapedSummary?: ScrapedSummary | null;
		scrapedSummaries?: ScrapedSummary[] | null;
		noScrapedData?: boolean;
		/** When true, do not log this failure to the browser console (full error stays in drawer / server only). */
		skipClientConsole?: boolean;
	}) {
		const logEntry: HttpCallLogEntry = {
			id: crypto.randomUUID(),
			time: new Date().toISOString(),
			method: entry.method ?? 'POST',
			action: entry.action,
			result: entry.result,
			message: entry.message ?? (entry.result === 'success' ? `${entry.action} OK` : 'No message'),
			status: entry.status ?? (entry.result === 'success' ? 200 : undefined),
			context: entry.context,
			responseData: entry.responseData,
			scrapedSummary: entry.scrapedSummary ?? undefined,
			scrapedSummaries: entry.scrapedSummaries ?? undefined,
			noScrapedData: entry.noScrapedData ?? false
		};
		if (entry.result === 'failure' && !entry.skipClientConsole) {
			const statusPart = entry.status != null ? ` (${entry.status})` : '';
			const contextPart = entry.context ? ` [${entry.context}]` : '';
			clientError(
				'Call log',
				`${entry.action} failed${statusPart}${contextPart}: ${entry.message ?? 'No message returned'}`,
				entry.responseData !== undefined ? { response: entry.responseData } : undefined
			);
		}
		httpCallLogs = [logEntry, ...httpCallLogs].slice(0, HTTP_CALL_LOGS_MAX);
	}

	/** True when the demo failure is due to GBP / scraped data (no rerun until GBP is fixed). */
	function isGbpError(errorMessage: string | undefined): boolean {
		const lower = (errorMessage ?? '').trim().toLowerCase();
		return /gbp|not found|no search results|dataforseo|business profile|scraped data/.test(lower);
	}

	/** Short status label for failed demo: GBP vs other. */
	function failedDemoLabel(errorMessage: string | undefined): string {
		return isGbpError(errorMessage) ? 'GBP not working' : 'Demo creation error';
	}

	/** Sort key for status column: order matches display priority (flagged, demo queue, processing, queue, tracking, other). */
	function statusSortKey(p: ProspectRow): string {
		if (p.flagged) return '00_flagged';
		const job = p.demoJob;
		if (job?.status === 'pending') return '01_demo_queued';
		if (job?.status === 'creating') return '02_demo_creating';
		if (p.gbpJob?.status === 'running') return '03_processing_gbp';
		if (p.insightsJob?.status === 'running') return '04_processing_insights';
		if (optimisticGbpProspectIds.has(p.id) || p.gbpJob?.status === 'pending') return '05_queue';
		if (optimisticInsightsProspectIds.has(p.id) || p.insightsJob?.status === 'pending') return '05_queue';
		if (job?.status === 'failed') return '06_demo_failed';
		if ((p.status ?? '').trim() === 'In queue') return '07_in_queue';
		const tracking = p.tracking;
		if (tracking?.status === 'draft') return '08_draft';
		if (tracking?.status === 'sent') return '09_sent';
		if (tracking?.status === 'opened') return '10_opened';
		if (tracking?.status === 'clicked') return '11_clicked';
		return `12_${(statusLabel(p) ?? '').toLowerCase().replace(/\s+/g, '_')}`;
	}

	/** True when the row is in a processing state (GBP, Insights, or demo creation). */
	function isRowProcessing(p: ProspectRow): boolean {
		if (optimisticGbpProspectIds.has(p.id) || optimisticInsightsProspectIds.has(p.id)) return true;
		if (p.gbpJob) return true;
		if (p.insightsJob) return true;
		const job = p.demoJob;
		if (job?.status === 'pending' || job?.status === 'creating') return true;
		// Persisted status so we treat as processing after refresh when job maps are empty
		return (p.status ?? '').trim() === 'In queue';
	}

	/** Build a short user-facing alert for demo job failure: "Error - Description." */
	function formatDemoErrorAlert(errorMessage: string | undefined): string {
		const raw = (errorMessage ?? 'Unknown error').trim();
		const lower = raw.toLowerCase();
		if (/gbp|not found|no search results|dataforseo|business profile|scraped data/.test(lower)) {
			return 'Unable to create demo - GBP not found.';
		}
		if (/crm|notion|sync|invalid input|pipedrive/.test(lower)) {
			return 'Unable to sync CRM - invalid input.';
		}
		if (/out of scope|flagged/.test(lower)) {
			return 'Unable to create demo - Client out of scope.';
		}
		if (/prospect not found/.test(lower)) {
			return 'Unable to create demo - Prospect not found.';
		}
		// First sentence or first 80 chars
		const first = raw.split(/[.!?]/)[0]?.trim() ?? raw;
		const short = first.length > 80 ? first.slice(0, 77) + '…' : first;
		return `Unable to create demo - ${short}${short.endsWith('.') ? '' : '.'}`;
	}
	function formatScrapedSummary(s: ScrapedSummary): string {
		const parts: string[] = [];
		if (s.gbpCompletenessLabel != null && s.gbpCompletenessLabel !== '') parts.push(s.gbpCompletenessLabel);
		else if (s.gbpCompletenessScore != null) parts.push(`${s.gbpCompletenessScore}%`);
		if (s.googleRatingValue != null) parts.push(`${s.googleRatingValue}★`);
		if (s.googleReviewCount != null && s.googleReviewCount > 0) parts.push(`(${s.googleReviewCount} reviews)`);
		if (s.gbpClaimed === true) parts.push('Claimed');
		else if (s.gbpClaimed === false) parts.push('Unclaimed');
		if (s.gbpHasHours === true) parts.push('Hours');
		else if (s.gbpHasHours === false) parts.push('No hours');
		return parts.length > 0 ? parts.join(' · ') : '—';
	}
	let callLogsDrawerOpen = $state(false);
	type CallLogsResultFilter = 'all' | 'errors' | 'success';
	let callLogsResultFilter = $state<CallLogsResultFilter>('all');
	const filteredCallLogs = $derived.by(() => {
		if (callLogsResultFilter === 'all') return httpCallLogs;
		if (callLogsResultFilter === 'errors') return httpCallLogs.filter((e) => e.result === 'failure');
		return httpCallLogs.filter((e) => e.result === 'success');
	});
	$effect(() => {
		if (data.prospectsError === 'not_configured') {
			// prospects not configured
		} else if (data.prospectsError === 'api_error') {
			// prospects load error
		}
	});

	let filterQuery = $state('');
	let statusFilter = $state<DemoStatusFilterValue>('');
	const statusOptionsByGroup = $derived(getStatusFilterOptionsForPipelineTab(pipelineTab));
	const statusFilterLabel = $derived.by(() => {
		if (statusFilter === '') return 'All statuses';
		const all = [...statusOptionsByGroup.pipeline, ...statusOptionsByGroup.engagement, ...statusOptionsByGroup.other];
		return all.find((o) => o.value === statusFilter)?.label ?? 'All statuses';
	});

	// Reset status filter when switching tabs if current value is not valid for the new tab
	$effect(() => {
		const valid = getValidStatusFilterValuesForPipelineTab(pipelineTab);
		if (statusFilter !== '' && !valid.includes(statusFilter)) {
			statusFilter = '';
		}
	});

	type IndustryFilterValue = '' | IndustrySlug;
	let industryFilter = $state<IndustryFilterValue>('');
	const INDUSTRY_OPTIONS: { value: IndustryFilterValue; label: string }[] = [
		{ value: '', label: 'All industries' },
		...INDUSTRY_SLUGS.map((slug) => ({ value: slug as IndustryFilterValue, label: INDUSTRY_LABELS[slug] }))
	];
	const industryFilterLabel = $derived(
		INDUSTRY_OPTIONS.find((o) => o.value === industryFilter)?.label ?? 'All industries'
	);

	const hasActiveFilters = $derived(
		filterQuery.trim() !== '' || statusFilter !== '' || industryFilter !== ''
	);
	const activeFilterCount = $derived(
		(filterQuery.trim() ? 1 : 0) + (statusFilter ? 1 : 0) + (industryFilter ? 1 : 0)
	);

	function clearFilters() {
		filterQuery = '';
		statusFilter = '';
		industryFilter = '';
	}

	const filteredProspects = $derived.by((): ProspectRow[] => {
		// First: filter by pipeline tab (Qualify, Research & Personalize, No Fit)
		let list: ProspectRow[] = prospectsWithJobStatus;
		if (pipelineTab === 'no_fit') {
			list = list.filter((p) => !!p.flagged);
		} else {
			list = list.filter((p) => !p.flagged);
			if (pipelineTab === 'qualify') {
				// No GBP data yet — run GBP to qualify
				list = list.filter((p) => !(scrapedDataByProspectId[p.id] as Record<string, unknown>)?.gbpRaw);
			} else if (pipelineTab === 'research') {
				// Have GBP data — research & personalize (Insights, booking sys, call service, reviews, demos)
				list = list.filter((p) => !!(scrapedDataByProspectId[p.id] as Record<string, unknown>)?.gbpRaw);
			}
		}
		const q = filterQuery.trim().toLowerCase();
		if (q) {
			list = list.filter((p) => {
				const tr = p.tracking;
				const statusLabelForSearch = tr
					? (tr.status ?? '').toLowerCase()
					: getStatusDisplay(p.status).label.toLowerCase();
				return (
					(p.companyName ?? '').toLowerCase().includes(q) ||
					(p.email ?? '').toLowerCase().includes(q) ||
					(p.website ?? '').toLowerCase().includes(q) ||
					statusLabelForSearch.includes(q)
				);
			});
		}
		if (industryFilter) {
			list = list.filter((p) => industryDisplayToSlug(p.industry) === industryFilter);
		}
		if (statusFilter === 'flagged') {
			list = list.filter((p) => !!p.flagged);
		} else if (statusFilter === 'queue') {
			list = list.filter(
				(p) =>
					optimisticGbpProspectIds.has(p.id) ||
					p.gbpJob?.status === 'pending' ||
					optimisticInsightsProspectIds.has(p.id) ||
					p.insightsJob?.status === 'pending'
			);
		} else if (statusFilter === 'processing_gbp') {
			list = list.filter((p) => p.gbpJob?.status === 'running');
		} else if (statusFilter === 'processing_insights') {
			list = list.filter((p) => p.insightsJob?.status === 'running');
		} else if (statusFilter === 'no_demo') {
			list = list.filter((p) => !(p.demoLink ?? '').trim());
		} else if (statusFilter === 'demo_queued') {
			list = list.filter((p) => p.demoJob?.status === 'pending');
		} else if (statusFilter === 'demo_creating') {
			list = list.filter((p) => p.demoJob?.status === 'creating');
		} else if (statusFilter === 'demo_failed') {
			list = list.filter((p) => p.demoJob?.status === 'failed');
		} else if (statusFilter === 'in_queue') {
			list = list.filter((p) => (p.status ?? '').trim() === 'In queue');
		} else if (statusFilter === 'engaged') {
			list = list.filter((p) => {
				const s = p.tracking?.status;
				return s != null && ENGAGED_STATUSES.includes(s as (typeof ENGAGED_STATUSES)[number]);
			});
		} else if (statusFilter) {
			list = list.filter((p) => p.tracking?.status === statusFilter);
		}
		return list;
	});

	function openClientDialog(p: Prospect) {
		goto(`/dashboard/prospects/${p.id}`);
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

	let demoJobPollingActive = $state(false);
	let createDemosDialogOpen = $state(false);
	let createDemosForm: HTMLFormElement | null = $state(null);
	let createDemosSubmitting = $state(false);
	let singleCreateProspectId = $state('');
	let singleCreateForm: HTMLFormElement | null = $state(null);
	let singleCreateSubmitting = $state(false);
	let bulkGbpSubmitting = $state(false);
	let bulkInsightsSubmitting = $state(false);
	let bulkRestoreSubmitting = $state(false);
	let clearStuckSubmitting = $state(false);
	let gbpJobPollingActive = $state(false);
	let insightsJobPollingActive = $state(false);
	/** Prospect IDs we've just submitted for GBP/Insights so status updates immediately before server responds. */
	let optimisticGbpProspectIds = $state<Set<string>>(new Set());
	let optimisticInsightsProspectIds = $state<Set<string>>(new Set());

	/** Create demo for one prospect: enqueue job so it runs in background (demo creation can take 1–2 min). */
	async function handleCreateDemo(p: Prospect) {
		if (singleCreateSubmitting) return;
		singleCreateSubmitting = true;
		const who = p.companyName || p.email || p.id;
		toastInfo('Create demo', `Queuing demo for ${who}…`);
		const formData = new FormData();
		formData.set('prospectId', p.id);
		try {
			const res = await fetch('?/enqueueDemo', {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' }
			});
			const result = (await res.json().catch(() => ({}))) as {
				queued?: boolean;
				prospectId?: string;
				companyName?: string;
				message?: string;
			};
			if (result.queued && result.prospectId) {
				toastSuccess(
					result.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
					result.alreadyQueued
						? 'Creation is running. The list will update when ready.'
						: 'Creation usually takes 1–2 minutes. The list will update when ready.',
					{ label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${p.id}`) }
				);
				await invalidateAll();
				startDemoJobPolling();
			} else {
				const msg = result.message ?? 'Failed to queue demo';
				toastError('Create demo', msg);
			}
		} catch (err) {
			clientError('Create demo fetch', err);
			toastError('Create demo', 'Request failed.');
		} finally {
			singleCreateSubmitting = false;
		}
	}

	/** Poll process-demo-job until queue is empty or max attempts. On each processed job: invalidate. */
	function startDemoJobPolling() {
		if (demoJobPollingActive) return;
		demoJobPollingActive = true;
		const maxAttempts = 50;
		let attempts = 0;
		const run = async () => {
			if (attempts >= maxAttempts) {
				demoJobPollingActive = false;
				return;
			}
			attempts++;
			try {
				const res = await fetch('/api/jobs/demo', { method: 'POST' });
				const body = (await res.json().catch(() => ({}))) as {
					processed?: boolean;
					status?: string;
					prospectId?: string;
					companyName?: string;
					errorMessage?: string;
				};
				if (body.processed && body.status === 'done') {
					const prospectId = body.prospectId;
					const desc = body.companyName ? `Demo ready for ${body.companyName}` : 'Demo ready';
					toastSuccess('Demo ready', desc, prospectId ? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${prospectId}`) } : undefined);
					await invalidateAll();
				} else if (body.processed && body.status === 'failed') {
					await invalidateAll();
					const prospectId = body.prospectId;
					const desc = body.errorMessage ? formatDemoErrorAlert(body.errorMessage) : 'Demo creation failed';
					addHttpCallLog({
						action: 'createDemo',
						result: 'failure',
						message: body.errorMessage ?? 'Demo creation failed',
						context: body.companyName ? `${body.companyName}` : body.prospectId,
						responseData: body,
						skipClientConsole: true
					});
					toastError('Demo failed', desc, prospectId ? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${prospectId}`) } : undefined);
				}
				if (body.processed === false) {
					demoJobPollingActive = false;
					return;
				}
				tick().then(() => setTimeout(run, 3000));
			} catch {
				tick().then(() => setTimeout(run, 3000));
			}
		};
		tick().then(() => setTimeout(run, 500));
	}

	/** Poll process-gbp-job until queue is empty. On each processed job: toast, invalidate. */
	function startGbpJobPolling() {
		if (gbpJobPollingActive) return;
		gbpJobPollingActive = true;
		const maxAttempts = 50;
		let attempts = 0;
		const run = async () => {
			if (attempts >= maxAttempts) {
				gbpJobPollingActive = false;
				return;
			}
			attempts++;
			try {
				const res = await fetch('/api/jobs/gbp', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({})
				});
				const body = (await res.json().catch(() => ({}))) as {
					processed?: boolean;
					status?: string;
					prospectId?: string;
					companyName?: string;
					errorMessage?: string;
				};
				const gbpViewAction = body.prospectId ? { label: 'View prospect' as const, onClick: () => goto(`/dashboard/prospects/${body.prospectId}`) } : undefined;
				if (body.processed === true && body.status === 'done') {
					addHttpCallLog({
						action: 'processGbpJob',
						result: 'success',
						message: body.companyName ? `GBP ready for ${body.companyName}` : '1 prospect moved to Insights',
						status: res.status,
						context: body.prospectId ?? undefined
					});
					toastSuccess(
						'GBP',
						body.companyName ? `GBP ready for ${body.companyName}` : '1 prospect moved to Insights',
						gbpViewAction
					);
					await invalidateAll();
				} else if (body.processed === true && body.status === 'failed') {
					addHttpCallLog({
						action: 'processGbpJob',
						result: 'failure',
						message: body.errorMessage ?? 'GBP job failed',
						status: res.status,
						context: body.companyName ? `${body.companyName}` : body.prospectId,
						responseData: body,
						skipClientConsole: true
					});
					toastError('GBP', body.errorMessage ?? 'Failed', gbpViewAction);
					await invalidateAll();
				}
				if (body.processed === false) {
					gbpJobPollingActive = false;
					return;
				}
				tick().then(() => setTimeout(run, 3000));
			} catch {
				tick().then(() => setTimeout(run, 3000));
			}
		};
		tick().then(() => setTimeout(run, 500));
	}

	/** Poll process-insights-job until queue is empty. On each processed job: toast, invalidate. */
	function startInsightsJobPolling() {
		if (insightsJobPollingActive) return;
		insightsJobPollingActive = true;
		const maxAttempts = 50;
		let attempts = 0;
		const run = async () => {
			if (attempts >= maxAttempts) {
				insightsJobPollingActive = false;
				return;
			}
			attempts++;
			try {
				const res = await fetch('/api/jobs/insights', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({})
				});
				const body = (await res.json().catch(() => ({}))) as {
					processed?: boolean;
					status?: string;
					prospectId?: string;
					companyName?: string;
					errorMessage?: string;
				};
				const insightsViewAction = body.prospectId ? { label: 'View prospect' as const, onClick: () => goto(`/dashboard/prospects/${body.prospectId}`) } : undefined;
				if (body.processed === true && body.status === 'done') {
					addHttpCallLog({
						action: 'processInsightsJob',
						result: 'success',
						message: body.companyName ? `Insights ready for ${body.companyName}` : '1 prospect moved to Demos',
						status: res.status,
						context: body.prospectId ?? undefined
					});
					toastSuccess(
						'Insights',
						body.companyName ? `Insights ready for ${body.companyName}` : '1 prospect moved to Demos',
						insightsViewAction
					);
					await invalidateAll();
				} else if (body.processed === true && body.status === 'failed') {
					addHttpCallLog({
						action: 'processInsightsJob',
						result: 'failure',
						message: body.errorMessage ?? 'Insights job failed',
						status: res.status,
						context: body.companyName ? `${body.companyName}` : body.prospectId,
						responseData: body,
						skipClientConsole: true
					});
					toastError('Insights', body.errorMessage ?? 'Failed', insightsViewAction);
					await invalidateAll();
				}
				if (body.processed === false) {
					insightsJobPollingActive = false;
					return;
				}
				tick().then(() => setTimeout(run, 3000));
			} catch {
				tick().then(() => setTimeout(run, 3000));
			}
		};
		tick().then(() => setTimeout(run, 500));
	}

	$effect(() => {
		const jobs = data.demoJobsByProspectId ?? {};
		const hasPending = Object.values(jobs).some((j) => j.status === 'pending' || j.status === 'creating');
		if (hasPending && !demoJobPollingActive) startDemoJobPolling();
	});

	$effect(() => {
		const gbpJobs = data.gbpJobsByProspectId ?? {};
		if (Object.keys(gbpJobs).length > 0 && !gbpJobPollingActive) startGbpJobPolling();
	});

	$effect(() => {
		const insightsJobs = data.insightsJobsByProspectId ?? {};
		if (Object.keys(insightsJobs).length > 0 && !insightsJobPollingActive) startInsightsJobPolling();
	});

	/** Clear optimistic status only when the prospect has moved to the next step (server data has gbpRaw or insight). */
	$effect(() => {
		const scraped = data.scrapedDataByProspectId ?? {};
		let changed = false;
		let nextGbp = optimisticGbpProspectIds;
		let nextInsights = optimisticInsightsProspectIds;
		for (const id of optimisticGbpProspectIds) {
			const sd = scraped[id] as Record<string, unknown> | undefined;
			if (sd?.gbpRaw != null) {
				nextGbp = new Set([...nextGbp].filter((x) => x !== id));
				changed = true;
			}
		}
		for (const id of optimisticInsightsProspectIds) {
			const sd = scraped[id] as Record<string, unknown> | undefined;
			if (sd?.insight != null) {
				nextInsights = new Set([...nextInsights].filter((x) => x !== id));
				changed = true;
			}
		}
		if (changed) {
			optimisticGbpProspectIds = nextGbp;
			optimisticInsightsProspectIds = nextInsights;
		}
	});

	function enhanceEnqueueDemo(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) generatingDemo = true;
		return async ({
			result,
			formData: submitFormData
		}: {
			result: import('./$types').ActionResult;
			formData: FormData;
		}) => {
			try {
				if (
					result.type === 'success' &&
					result.data &&
					typeof result.data === 'object' &&
					'queued' in result.data &&
					result.data.queued
				) {
					const d = result.data as { prospectId?: string; companyName?: string; alreadyQueued?: boolean };
					addHttpCallLog({ action: 'enqueueDemo', result: 'success', message: d.alreadyQueued ? 'Already queued' : 'Queued', status: 200, context: d.prospectId ?? undefined });
					const prospect = prospects.find((p) => p.id === d.prospectId);
					const desc = d.alreadyQueued ? 'Creation is running. The list will update when ready.' : (prospect ? (prospect.companyName || prospect.email || d.prospectId) : 'Demo will be generated shortly.');
					toastSuccess(
						d.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
						desc,
						d.prospectId ? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${d.prospectId}`) } : undefined
					);
					await invalidateAll();
					startDemoJobPolling();
				} else {
					const msg = result.data && typeof result.data === 'object' && 'message' in result.data ? String((result.data as { message?: string }).message) : undefined;
					const status = result.type === 'failure' ? (result as { status?: number }).status : undefined;
					const prospectId = submitFormData?.get('prospectId');
					addHttpCallLog({
						action: 'enqueueDemo',
						result: 'failure',
						message: msg,
						status,
						context: prospectId ? `prospectId=${prospectId}` : undefined,
						responseData: result.data
					});
					toastError('Queue demo', msg ?? 'Failed to queue.');
					await applyAction(result);
				}
			} finally {
				generatingDemo = false;
			}
		};
	}

	const columns: ColumnDef<ProspectRow>[] = [
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
					'aria-label': 'Select row',
					disabled: isRowProcessing(row.original)
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'companyName',
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, { column, label: 'Client' }),
			cell: ({ row }) =>
				renderComponent(DataTableCompanyCell, {
					prospect: row.original,
					onView: openClientDialog
				})
		},
		{
			id: 'website',
			header: () => 'Website',
			meta: { label: 'Website' },
			cell: ({ row }) =>
				renderComponent(DataTableWebsiteCell, { website: row.original.website ?? null }),
			enableSorting: false
		},
		{
			id: 'status',
			accessorFn: (row) => statusSortKey(row as ProspectRow),
			header: ({ column }) =>
				renderComponent(DataTableSortHeader, { column, label: 'Status' }),
			meta: { label: 'Status' },
			cell: ({ row }) => {
				const p = row.original;
				if (p.flagged) {
					return renderComponent(DataTableStatusBadge, {
						label: p.flaggedReason ?? 'Out of scope',
						variant: 'muted'
					});
				}
				const job = p.demoJob;
				if (job?.status === 'pending') {
					return renderComponent(DataTableStatusBadge, { label: 'Queued', variant: 'secondary' });
				}
				if (job?.status === 'creating') {
					return renderComponent(DataTableStatusBadge, { label: 'Creating…', variant: 'secondary' });
				}
				// Only show "Processing (GBP)" when this row's job is currently running; otherwise show Pending
				if (p.gbpJob?.status === 'running') {
					return renderComponent(DataTableStatusBadge, {
						label: 'Processing (GBP)',
						variant: 'secondary',
						showSpinner: true
					});
				}
				if (optimisticGbpProspectIds.has(p.id) || p.gbpJob?.status === 'pending') {
					return renderComponent(DataTableStatusBadge, { label: 'Queue', variant: 'secondary' });
				}
				if (p.insightsJob?.status === 'running') {
					return renderComponent(DataTableStatusBadge, {
						label: 'Processing (Insights)',
						variant: 'secondary',
						showSpinner: true
					});
				}
				if (optimisticInsightsProspectIds.has(p.id) || p.insightsJob?.status === 'pending') {
					return renderComponent(DataTableStatusBadge, { label: 'Queue', variant: 'secondary' });
				}
				if (job?.status === 'failed') {
					return renderComponent(DataTableStatusBadge, {
						label: failedDemoLabel(job.errorMessage),
						variant: 'destructive'
					});
				}
				// Persisted "In queue" so status is correct after refresh even when job maps are empty
				if ((p.status ?? '').trim() === 'In queue') {
					return renderComponent(DataTableStatusBadge, { label: 'In queue', variant: 'warning' });
				}
				const tracking = p.tracking;
				const hasDemoLink = !!p.demoLink;
				if (tracking) {
					return renderComponent(DataTableDemoStatus, {
						status: tracking.status,
						sendTime: tracking.send_time,
						openedAt: tracking.opened_at ?? null,
						clickedAt: tracking.clicked_at ?? null,
						hasDemoLink,
						demoLink: p.demoLink ?? null
					});
				}
				return renderComponent(DataTableStatusBadge, {
					label: statusLabel(p),
					variant: badgeVariant(p)
				});
			}
		},
		{
			id: 'gbp',
			header: () => 'GBP',
			meta: { label: 'GBP' },
			cell: ({ row }) => {
				const scraped = data.scrapedDataByProspectId?.[row.original.id];
				const audit = auditFromScrapedData(scraped ?? null);
				const hasWebsite = !!((row.original.website ?? '').trim());
				return renderComponent(DataTableGbpCell, {
					audit,
					hasScrapedData: !!scraped,
					hasWebsite
				});
			},
			enableSorting: false
		},
		{
			id: 'websiteGrading',
			header: () => 'Website Grading',
			meta: { label: 'Website Grading' },
			cell: ({ row }) => {
				const scraped = data.scrapedDataByProspectId?.[row.original.id];
				const audit = auditFromScrapedData(scraped ?? null);
				return renderComponent(DataTableWebsiteGradingCell, { audit });
			},
			enableSorting: false
		},
		{
			id: 'actions',
			header: () => '',
			meta: { label: '' },
			enableHiding: false,
			cell: ({ row }) =>
				renderComponent(DataTableActionsCell, {
					prospectId: row.original.id,
					hasDemoLink: !!(row.original.demoLink ?? '').trim(),
					demoJobStatus: row.original.demoJob?.status,
					showDelete: !row.original.flagged,
					showRestore: !!row.original.flagged,
					processing: isRowProcessing(row.original)
				})
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
		const rowCount = filteredProspects.length;
		const maxPageIndex =
			fromUrl.pageSize > 0 ? Math.max(0, Math.ceil(rowCount / fromUrl.pageSize) - 1) : 0;
		return {
			pageIndex: Math.min(fromUrl.pageIndex, maxPageIndex),
			pageSize: fromUrl.pageSize
		};
	});

	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable<ProspectRow>({
		get data() {
			return filteredProspects;
		},
		columns,
		getRowId: (row) => row.id,
		enableRowSelection: (row) => !isRowProcessing(row.original),
		autoResetPageIndex: false,
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
		onPaginationChange: async (updater) => {
			const next = typeof updater === 'function' ? updater(pagination) : updater;
			await setPaginationInUrl(next);
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
	<title>Prospects — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-[1200px] mx-auto w-full">
	<form
		bind:this={singleCreateForm}
		method="POST"
		action="?/enqueueDemo"
		use:enhance={() => async ({ result }) => {
			try {
				if (result.type === 'success' && result.data && typeof result.data === 'object' && 'queued' in result.data && result.data.queued) {
					const d = result.data as { alreadyQueued?: boolean };
					await invalidateAll();
					toastSuccess(
						d.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
						d.alreadyQueued ? 'Creation is running. The list will update when ready.' : 'Creation usually takes 1–2 minutes. The list will update when ready.'
					);
					startDemoJobPolling();
					await applyAction(result);
				} else if (result.type === 'failure') {
					const data = result.data as { message?: string } | undefined;
					const msg = data?.message ?? 'Failed to queue demo';
					toastError('Create demo', msg);
					await applyAction(result);
				} else {
					await applyAction(result);
				}
			} finally {
				singleCreateSubmitting = false;
			}
		}}
		class="hidden"
	>
		<input type="hidden" name="prospectId" value={singleCreateProspectId} />
	</form>
	<!-- Clients (CRM) – tasks-style layout -->
	<Card.Root id="prospects" class="border-0 bg-card shadow-none">
		<Card.Header class="space-y-1 pb-6">
			<Card.Title class="text-2xl font-semibold tracking-tight">Welcome back!</Card.Title>
			<Card.Description class="text-muted-foreground">
				Here's a list of your prospects. Search, filter by status or industry, and manage demos from the table.
			</Card.Description>
		</Card.Header>
		{#if prospects.length > 0}
			<div class="mx-4 mb-4 sm:mx-6">
				<Tabs.Root bind:value={pipelineTab} class="w-full">
					<Tabs.List class="grid grid-cols-3 mb-4">
						<Tabs.Trigger value="qualify">Qualify</Tabs.Trigger>
						<Tabs.Trigger value="research">Research & Personalize</Tabs.Trigger>
						<Tabs.Trigger value="no_fit">No Fit</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
				<div
					class="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
					role="search"
					aria-label="Filter prospects"
				>
					<!-- Search: theme colors only (no Lead Rosetta overrides) -->
					<div class="prospects-search relative min-w-0 flex-1 basis-64 sm:max-w-xs">
						<label for="lr-dash-filter" class="sr-only">Search prospects</label>
						<SearchIcon
							class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							id="lr-dash-filter"
							type="search"
							placeholder="Search by company, email, website..."
							bind:value={filterQuery}
							aria-label="Search prospects"
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
								<span class="text-muted-foreground text-xs tabular-nums">
									{filteredProspects.length}
									{filteredProspects.length === 1 ? 'prospect' : 'prospects'}
								</span>
							{/if}
						</div>
					</div>

					<!-- Status & Industry -->
					<div class="flex flex-wrap items-center gap-3 sm:gap-4">
						<Select.Root type="single" bind:value={statusFilter}>
							<Select.Trigger
								id="lr-dash-status"
								class="min-w-[11rem] h-9 bg-background font-normal"
								aria-label="Filter by status"
							>
								<span class="text-muted-foreground mr-1.5 text-xs">Status:</span>
								{statusFilterLabel}
							</Select.Trigger>
							<Select.Content class="max-h-[min(20rem,60vh)]">
								<Select.Item value="">All statuses</Select.Item>
								{#if statusOptionsByGroup.pipeline.length > 0}
									<Select.Group>
										<Select.GroupHeading>Pipeline</Select.GroupHeading>
										{#each statusOptionsByGroup.pipeline as opt (opt.value)}
											<Select.Item value={opt.value}>{opt.label}</Select.Item>
										{/each}
									</Select.Group>
								{/if}
								{#if statusOptionsByGroup.engagement.length > 0}
									<Select.Group>
										<Select.GroupHeading>Engagement</Select.GroupHeading>
										{#each statusOptionsByGroup.engagement as opt (opt.value)}
											<Select.Item value={opt.value}>{opt.label}</Select.Item>
										{/each}
									</Select.Group>
								{/if}
								{#if statusOptionsByGroup.other.length > 0}
									<Select.Group>
										<Select.GroupHeading>Other</Select.GroupHeading>
										{#each statusOptionsByGroup.other as opt (opt.value)}
											<Select.Item value={opt.value}>{opt.label}</Select.Item>
										{/each}
									</Select.Group>
								{/if}
							</Select.Content>
						</Select.Root>

						<Select.Root type="single" bind:value={industryFilter}>
							<Select.Trigger
								id="lr-dash-industry"
								class="min-w-[11rem] h-9 bg-background font-normal"
								aria-label="Filter by industry"
							>
								<span class="text-muted-foreground mr-1.5 text-xs">Industry:</span>
								{industryFilterLabel}
							</Select.Trigger>
							<Select.Content class="max-h-[min(20rem,60vh)]">
								{#each INDUSTRY_OPTIONS as opt (opt.value)}
									<Select.Item value={opt.value}>{opt.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						{#if prospectsInQueueCount > 0}
							<form
								method="POST"
								action="?/clearStuckQueueStatus"
								use:enhance={() => {
									clearStuckSubmitting = true;
									return async ({ result }) => {
										clearStuckSubmitting = false;
										if (result.type === 'success' && result.data && typeof result.data === 'object') {
											const d = result.data as { cleared?: number };
											const cleared = d.cleared ?? 0;
											if (cleared > 0) {
												toastSuccess(
													'Queue status',
													cleared === 1
														? 'Cleared 1 prospect from queue'
														: `Cleared ${cleared} prospects from queue`
												);
												await invalidateAll();
											} else {
												toastInfo(
													'Queue status',
													'No stuck prospects found. All "In queue" have an active job.'
												);
												await invalidateAll();
											}
										} else if (result.type === 'failure' && result.data?.message) {
											toastError('Clear queue status', (result.data as { message?: string }).message);
										}
									};
								}}
								class="flex items-center"
							>
								<Button
									type="submit"
									variant="outline"
									size="sm"
									class="h-9"
									disabled={clearStuckSubmitting}
									title="Clear 'In queue' for prospects with no active job (demo, GBP, or insights)"
								>
									{#if clearStuckSubmitting}
										<LoaderCircle class="mr-1.5 size-4 animate-spin" aria-hidden="true" />
									{/if}
									{clearStuckSubmitting ? 'Clearing…' : 'Clear stuck queue'}
								</Button>
							</form>
						{/if}
					</div>

					<!-- Clear filters + Columns -->
					<div class="flex shrink-0 items-center gap-2 border-t border-border/60 pt-4 sm:ms-auto sm:border-0 sm:pt-0">
						{#if hasActiveFilters}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="h-9 text-muted-foreground hover:text-foreground"
								onclick={clearFilters}
								aria-label="Clear all filters"
							>
								<X class="mr-1.5 size-3.5" />
								Clear filters
								{#if activeFilterCount > 1}
									<Badge variant="secondary" class="ml-1.5 size-5 rounded-full px-0 text-[10px] font-medium">
										{activeFilterCount}
									</Badge>
								{/if}
							</Button>
						{/if}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="outline" size="sm" class="h-9 bg-background">
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
				</div>
			</div>
		{/if}
		<Card.Content class="lr-dash-card-content p-0">
			{#snippet selectionBar()}
				{#if prospects.length > 0 && filteredProspects.length > 0}
					<div class="flex flex-wrap items-center justify-between gap-4 py-4 px-4">
						<div class="flex flex-1 flex-wrap items-center gap-4">
							<div class="text-muted-foreground text-sm">
								{table.getFilteredSelectedRowModel().rows.length} of
								{table.getFilteredRowModel().rows.length} row(s) selected.
							</div>
							{#if table.getFilteredSelectedRowModel().rows.length > 0}
								<div class="flex flex-wrap items-center gap-2">
									{#if pipelineTab === 'qualify'}
										<form method="POST" action="?/bulkEnqueueGbp" use:enhance={(input) => {
											bulkGbpSubmitting = true;
											const formData = input?.formData ?? (input as unknown as FormData);
											const ids = (formData && typeof (formData as FormData).getAll === 'function'
												? ((formData as FormData).getAll('prospectId') as string[])
												: table.getFilteredSelectedRowModel().rows.map((r) => r.original.id)
											).filter(Boolean);
											optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds, ...ids]);
											return async ({ result }) => {
												try {
													if (result.type === 'success' && result.data && typeof result.data === 'object' && (result.data as { success?: boolean }).success) {
														const d = result.data as { queued?: number; total?: number; enqueueFailed?: number };
														const queued = d.queued ?? 0;
														const total = d.total ?? 0;
														const enqueueFailed = d.enqueueFailed ?? 0;
														let msg: string;
														if (queued > 0) {
															msg = `${queued} prospect(s) added to GBP queue`;
															if (enqueueFailed > 0) msg += `; ${enqueueFailed} could not be queued (check server env)`;
														} else if (enqueueFailed > 0) {
															msg = 'No jobs queued. Check server env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).';
															optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds].filter((id) => !ids.includes(id)));
															toastError('GBP queue', msg);
														} else if (total > 0) {
															msg = 'Selected prospect(s) already in queue or skipped.';
															optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds].filter((id) => !ids.includes(id)));
															toastSuccess('GBP jobs', msg);
														} else {
															msg = 'Done.';
														}
														addHttpCallLog({
															action: 'bulkEnqueueGbp',
															result: 'success',
															message: msg,
															status: 200,
															context: ids.length > 0 ? `${ids.length} selected` : undefined
														});
														if (enqueueFailed === 0 || queued > 0) toastSuccess('GBP jobs', msg);
														rowSelection = {};
														await invalidateAll();
														startGbpJobPolling();
														await applyAction(result);
													} else if (result.type === 'failure' && result.data?.message) {
														addHttpCallLog({
															action: 'bulkEnqueueGbp',
															result: 'failure',
															message: (result.data as { message?: string }).message,
															status: (result as { status?: number }).status,
															context: ids.length > 0 ? `${ids.length} selected` : undefined,
															responseData: result.data
														});
														toastError('Pull GBP data', (result.data as { message?: string }).message);
														await applyAction(result);
														optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds].filter((id) => !ids.includes(id)));
													} else {
														await applyAction(result);
													}
												} finally {
													bulkGbpSubmitting = false;
												}
											};
										}}>
											{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
												<input type="hidden" name="prospectId" value={row.original.id} />
											{/each}
											<Button type="submit" size="sm" disabled={bulkGbpSubmitting}>
												{#if bulkGbpSubmitting}
													<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
												{/if}
												{bulkGbpSubmitting ? 'Pulling GBP data…' : 'Pull GBP data'}
											</Button>
										</form>
									{:else if pipelineTab === 'research'}
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={atDemoLimit}
											title={atDemoLimit ? 'Demo limit reached' : 'Generate demo pages for selected prospects that do not have one yet'}
											onclick={() => (createDemosDialogOpen = true)}
										>
											Create demos
										</Button>
									{:else if pipelineTab === 'no_fit'}
										<form method="POST" action="?/bulkRestore" use:enhance={() => {
											bulkRestoreSubmitting = true;
											return async ({ result }) => {
												try {
													if (result.type === 'success' && result.data && typeof result.data === 'object' && (result.data as { success?: boolean }).success) {
														const d = result.data as { restored?: number };
														toastSuccess('Restored', d.restored ? `${d.restored} prospect(s) restored to pipeline` : 'Done.');
														rowSelection = {};
														await invalidateAll();
													} else if (result.type === 'failure' && result.data?.message) {
														toastError('Restore', (result.data as { message?: string }).message);
														await applyAction(result);
													}
												} finally {
													bulkRestoreSubmitting = false;
												}
											};
										}}>
											{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
												<input type="hidden" name="prospectId" value={row.original.id} />
											{/each}
											<Button type="submit" size="sm" variant="secondary" disabled={bulkRestoreSubmitting}>
												{#if bulkRestoreSubmitting}
													<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
												{/if}
												{bulkRestoreSubmitting ? 'Restoring…' : 'Restore'}
											</Button>
										</form>
									{/if}
								</div>
							{/if}
						</div>
						<div class="flex w-full flex-wrap items-center justify-end gap-6 lg:w-auto">
							<div class="flex items-center gap-2">
								<Label for="lr-rows-per-page" class="text-sm font-medium whitespace-nowrap">Rows per page</Label>
								<Select.Root
									type="single"
									value={String(pagination.pageSize)}
									onValueChange={(v) => v != null && table.setPageSize(Number(v))}
								>
									<Select.Trigger id="lr-rows-per-page" size="sm" class="w-20 h-8">
										{pagination.pageSize}
									</Select.Trigger>
									<Select.Content side="top">
										{#each [10, 20, 30, 40, 50] as size (size)}
											<Select.Item value={String(size)}>{size}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							<div class="flex items-center justify-center text-sm font-medium whitespace-nowrap">
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</div>
							<div class="flex items-center gap-2">
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
					</div>
				{/if}
			{/snippet}
			{@render selectionBar()}
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
			{@render selectionBar()}
			<!-- Confirm create demos for selected -->
			<AlertDialog.Root bind:open={createDemosDialogOpen}>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>
						{#if createDemosSubmitting}
							Creating demos…
						{:else}
							{@const n = table.getFilteredSelectedRowModel().rows.length}
							Generate demo pages for {n} prospect{n === 1 ? '' : 's'}?
						{/if}
					</AlertDialog.Title>
						<AlertDialog.Description>
							{#if createDemosSubmitting}
								Usually 1–2 minutes per prospect. The list will update as each finishes.
							{:else}
								Demo pages will be generated for the selected prospects that don't have a demo yet. Each will be set to Draft. This usually takes 1–2 minutes per prospect; the list will update as each finishes.
							{/if}
						</AlertDialog.Description>
					</AlertDialog.Header>
					<form
						bind:this={createDemosForm}
						method="POST"
						action="?/bulkGenerateDemos"
						use:enhance={() => {
							const rows = table.getFilteredSelectedRowModel().rows;
							const names = rows.map((r) => r.original.companyName || r.original.email || r.original.id).filter(Boolean);
							const who =
								names.length === 0
									? 'selected'
									: names.length <= 2
										? names.join(', ')
										: `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
							toastInfo('Create demos', `Creating demos for ${who}…`);
							createDemosSubmitting = true;
							return async ({ result, formData }) => {
								try {
									if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
										const d = result.data as { queued?: number; total?: number; errors?: string[] };
										const queued = d.queued ?? 0;
										addHttpCallLog({
											action: 'bulkGenerateDemos',
											result: 'success',
											message: queued ? `Queued ${queued}` : 'Completed (0 queued)',
											status: 200
										});
										if (queued > 0) {
											toastSuccess(
												'Demos queued',
												'Creation usually takes 1–2 minutes. The list will update when ready.'
											);
											startDemoJobPolling();
										} else {
											toastInfo('Create demos', 'No demos queued (selected already had demos or were skipped).');
										}
										rowSelection = {};
										await invalidateAll();
										await invalidate('/dashboard/prospects');
										createDemosDialogOpen = false;
									} else if (result.type === 'failure' && result.data) {
										const ids = formData?.getAll('prospectId') ?? [];
										const n = Array.isArray(ids) ? ids.length : 0;
										addHttpCallLog({
											action: 'bulkGenerateDemos',
											result: 'failure',
											message: (result.data as { message?: string }).message,
											status: (result as { status?: number }).status,
											context: n > 0 ? `${n} selected` : undefined,
											responseData: result.data
										});
										toastError('Create demos', (result.data as { message?: string })?.message);
										await applyAction(result);
										createDemosDialogOpen = false;
									} else {
										toastInfo('Create demos', 'Request completed. Refreshing list.');
										await invalidateAll();
										await invalidate('/dashboard/prospects');
										createDemosDialogOpen = false;
									}
								} finally {
									createDemosSubmitting = false;
								}
							};
						}}
						id="create-demos-form"
					>
						{#each table.getFilteredSelectedRowModel().rows as row (row.id)}
							<input type="hidden" name="prospectId" value={row.original.id} />
						{/each}
					</form>
					<AlertDialog.Footer class="flex flex-row justify-end gap-2 sm:gap-2">
						<AlertDialog.Cancel>{createDemosSubmitting ? 'Close' : 'Cancel'}</AlertDialog.Cancel>
						<Button
							form="create-demos-form"
							type="submit"
							disabled={createDemosSubmitting}
							variant="default"
						>
							{#if createDemosSubmitting}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							{/if}
							{createDemosSubmitting ? 'Creating…' : 'Generate demos'}
						</Button>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
			<!-- Call logs: subtle link at bottom of card -->
			<div class="mt-8 pt-4 border-t border-border/50 px-4 sm:px-6">
				<Drawer.Root bind:open={callLogsDrawerOpen}>
					<Drawer.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								type="button"
								class="text-xs text-muted-foreground hover:text-foreground/80 transition-colors inline-flex items-center gap-1.5"
								aria-label="HTTP call logs"
							>
								<ListChecks class="size-3.5" aria-hidden="true" />
								Call logs
								{#if httpCallLogs.length > 0}
									<span class="text-muted-foreground/70">({httpCallLogs.length})</span>
								{/if}
							</button>
						{/snippet}
					</Drawer.Trigger>
					<Drawer.Content class="flex flex-col max-h-full">
						<div class="flex flex-1 flex-col min-h-0 w-full px-4">
							<Drawer.Header class="text-start shrink-0">
								<Drawer.Title>HTTP call logs</Drawer.Title>
								<Drawer.Description>
									Recent form actions and API calls from this page (last {HTTP_CALL_LOGS_MAX}).
								</Drawer.Description>
							</Drawer.Header>
							<div class="flex gap-1 border-b border-border pb-2 shrink-0">
								<button
									type="button"
									class={cn(
										'rounded px-2 py-1 text-xs font-medium transition-colors',
										callLogsResultFilter === 'all'
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
									onclick={() => (callLogsResultFilter = 'all')}
								>
									All ({httpCallLogs.length})
								</button>
								<button
									type="button"
									class={cn(
										'rounded px-2 py-1 text-xs font-medium transition-colors',
										callLogsResultFilter === 'errors'
											? 'bg-destructive text-destructive-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
									onclick={() => (callLogsResultFilter = 'errors')}
								>
									Errors ({httpCallLogs.filter((e) => e.result === 'failure').length})
								</button>
								<button
									type="button"
									class={cn(
										'rounded px-2 py-1 text-xs font-medium transition-colors',
										callLogsResultFilter === 'success'
											? 'bg-green-600 text-white dark:bg-green-500'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
									onclick={() => (callLogsResultFilter = 'success')}
								>
									Success ({httpCallLogs.filter((e) => e.result === 'success').length})
								</button>
							</div>
							<div class="flex-1 min-h-0 overflow-auto py-4">
								{#if httpCallLogs.length === 0}
									<p class="text-sm text-muted-foreground">No calls logged yet. Create demos, send emails, or update status to see entries.</p>
								{:else if filteredCallLogs.length === 0}
									<p class="text-sm text-muted-foreground">
										{callLogsResultFilter === 'errors' ? 'No errors in the log.' : 'No successful calls in the log.'}
									</p>
								{:else}
									<Table.Root class="w-full table-fixed">
										<Table.Header>
											<Table.Row>
												<Table.Head class="w-[100px] shrink-0">Error</Table.Head>
												<Table.Head class="w-[80px] shrink-0">Code</Table.Head>
												<Table.Head class="min-w-0">Message</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each filteredCallLogs as entry (entry.id)}
												<Table.Row
													class={entry.result === 'failure'
														? 'border-destructive/30 bg-destructive/5'
														: 'border-green-500/20 bg-green-500/5'}
												>
													<Table.Cell class="align-top font-medium">
														<span
															class={entry.result === 'success'
																? 'text-green-600 dark:text-green-400'
																: 'text-destructive'}
														>
															{entry.result === 'success' ? 'Success' : 'Error'}
														</span>
													</Table.Cell>
													<Table.Cell class="align-top font-mono text-xs tabular-nums">
														{entry.status != null ? entry.status : '—'}
													</Table.Cell>
													<Table.Cell class="align-top text-sm break-words">
														{#if entry.message}
															<span class={entry.result === 'failure' ? 'text-destructive' : 'text-muted-foreground'}>
																{entry.message}
															</span>
														{:else}
															<span class="text-muted-foreground">—</span>
														{/if}
														{#if entry.context}
															<div class="mt-1 font-mono text-[0.65rem] text-muted-foreground break-all">
																{entry.context}
															</div>
														{/if}
														{#if entry.responseData != null}
															<details class="mt-1.5">
																<summary class="text-[0.65rem] text-muted-foreground cursor-pointer hover:text-foreground">Details</summary>
																<pre class="mt-1 font-mono text-[0.65rem] text-muted-foreground break-all whitespace-pre-wrap overflow-x-auto max-h-24 overflow-y-auto rounded border border-border/50 p-1.5">{JSON.stringify(entry.responseData, null, 2)}</pre>
															</details>
														{/if}
														{#if entry.scrapedSummary && formatScrapedSummary(entry.scrapedSummary) !== '—'}
															<div class="mt-1.5 text-[0.7rem] text-muted-foreground">
																GBP: {formatScrapedSummary(entry.scrapedSummary)}
															</div>
														{:else if entry.scrapedSummaries?.length}
															<div class="mt-1.5 text-[0.7rem] text-muted-foreground">
																GBP: {entry.scrapedSummaries.map(formatScrapedSummary).join(' · ')}
															</div>
														{:else if entry.noScrapedData}
															<div class="mt-1.5 text-[0.7rem] text-muted-foreground">
																No scraped summary in response (demo may still have been created).
															</div>
														{/if}
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								{/if}
							</div>
							<Drawer.Footer class="shrink-0 pt-2">
								<Drawer.Close
									class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
								>
									Close
								</Drawer.Close>
							</Drawer.Footer>
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>
		</Card.Content>
	</Card.Root>

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
