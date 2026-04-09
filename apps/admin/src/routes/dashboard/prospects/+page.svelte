<script lang="ts">
	import { browser } from '$app/environment';
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll, invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getNextStep, getSimplifiedStatus } from '$lib/nextStep';
	import type { PageData } from './$types';
	// Prospects page: full CRM table; no overview
	import type { Prospect } from '$lib/server/prospects';
	import { isProspectQueuedStatus } from '$lib/prospectStatus';

	/** Prospect plus job/tracking status for table row so status column reacts to load updates. */
	type ProspectRow = Prospect & {
		gbpJob?: { jobId: string; status: string };
		insightsJob?: { jobId: string; status: string };
		demoJob?: { status: string; jobId: string; demoLink?: string | null; errorMessage?: string | null };
		tracking?: { status?: string; send_time?: string | null; opened_at?: string | null; clicked_at?: string | null };
		/** True when scraped/GBP data exists; required for "Create demo" next step. */
		hasGbpData?: boolean;
	};
	import {
		X,
		ExternalLink,
		Mail,
		MessageSquare,
		Copy,
		Link2,
		Send,
		Eye,
		Globe,
		Phone,
		MapPin,
		Star,
		ListChecks,
		ListX,
		RotateCcw,
		Briefcase,
		LoaderCircle,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight,
		Upload,
		RefreshCw,
		CloudDownload
	} from 'lucide-svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
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
	import { createRawSnippet } from 'svelte';
	import DataTableCheckbox from '$lib/components/data-table-checkbox.svelte';
	import DataTableSortHeader from '$lib/components/prospects/data-table-sort-header.svelte';
	import DataTableActionsCell from '$lib/components/prospects/data-table-actions-cell.svelte';
	import ProspectRowActionsCell from '$lib/components/prospects/prospect-row-actions-cell.svelte';
	import DataTableCompanyCell from '$lib/components/prospects/data-table-company-cell.svelte';
	import DataTableStatusBadge from '$lib/components/prospects/data-table-status-badge.svelte';
	import DataTableGbpCell from '$lib/components/prospects/data-table-gbp-cell.svelte';
	import DataTableWebsiteCell from '$lib/components/prospects/data-table-website-cell.svelte';
	import { auditFromScrapedData, hasUsableGbpInAudit, hasUsableInsight } from '$lib/demo';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { toastSuccess, toastError, toastInfo, toastFromActionResult } from '$lib/toast';
	import { clientError } from '$lib/log';
	import {
		maybeToastDemoJobsFromLoadData,
		type DemoJobMapEntry
	} from '$lib/client/prospectsJobRealtimeToast';
	import { prospectJobLabelResolver } from '$lib/notificationHistory';
	import {
		gbpCategoriesToIndustryLabel,
		INDUSTRY_LABELS,
		INDUSTRY_SLUGS,
		notionIndustryToSlug,
		type IndustrySlug
	} from '$lib/industries';
	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string }> & {
			sent?: number;
			errors?: string[];
		};
	}>();
	const prospects = $derived(data.prospects);

	/** Latest list for Realtime toast labels (subscription closure must not use a stale snapshot). */
	const prospectListRef = { list: [] as Prospect[] };
	$effect(() => {
		prospectListRef.list = data.prospects ?? [];
	});
	const sendConfigured = $derived(data.sendConfigured ?? false);
	const canOutreachSend = $derived(sendConfigured);
	const demoCountThisMonth = $derived(data.demoCountThisMonth ?? 0);
	const gbpDentalTodayCount = $derived(data.gbpDentalTodayCount ?? 0);
	const gbpDentalDailyCap = $derived(data.gbpDentalDailyCap ?? 25);
	const placesApiConfigured = $derived(data.placesApiConfigured ?? false);
	const apifyConfigured = $derived(data.apifyConfigured ?? false);
	type ApifyToolbarJob = {
		jobId: string;
		status: string;
		industry: string;
		location: string;
		userId: string;
	};
	const myActiveApifyJob = $derived.by((): ApifyToolbarJob | null => {
		const uid = data.user?.id;
		const map = data.apifyJobsById ?? {};
		if (!uid) return null;
		for (const j of Object.values(map) as ApifyToolbarJob[]) {
			if (j.userId === uid && (j.status === 'pending' || j.status === 'running')) {
				return j;
			}
		}
		return null;
	});
	const gbpDentalPullLock = $derived(
		data.gbpDentalPullLock ?? { locked: false, remainingSeconds: 0, lockMinutes: 15 }
	);
	const gbpDentalLockMinutesRemaining = $derived(
		Math.ceil((gbpDentalPullLock.remainingSeconds ?? 0) / 60)
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
		const scraped = data.scrapedDataByProspectId ?? {};
		return list.map((p) => {
			const scrapedForP = scraped[p.id] as Record<string, unknown> | undefined;
			const audit = auditFromScrapedData(scrapedForP ?? null);
			return {
				...p,
				gbpJob: gbp[p.id],
				insightsJob: insights[p.id],
				demoJob: demo[p.id],
				tracking: tracking[p.id],
				// Use Insights grade (AI run) for status/next step: "Not graded" → Pull data; graded → Create demo
				hasGbpData: audit ? hasUsableInsight(audit) : false
			};
		});
	});

	/** True while any background job may be in flight (Realtime fallback polls until terminal). */
	const hasActivePipelineJobs = $derived.by(() => {
		const demo = data.demoJobsByProspectId ?? {};
		const gbp = data.gbpJobsByProspectId ?? {};
		const ins = data.insightsJobsByProspectId ?? {};
		for (const j of Object.values(demo)) {
			if (j.status === 'pending' || j.status === 'creating') return true;
		}
		for (const j of Object.values(gbp)) {
			if (j.status === 'pending' || j.status === 'running') return true;
		}
		for (const j of Object.values(ins)) {
			if (j.status === 'pending' || j.status === 'running') return true;
		}
		return false;
	});

	const prevDemoJobsLoadRef: {
		snapshot: Record<string, DemoJobMapEntry> | undefined;
	} = { snapshot: undefined };

	$effect(() => {
		const raw = data.demoJobsByProspectId ?? {};
		const next: Record<string, DemoJobMapEntry> = {};
		for (const [k, v] of Object.entries(raw)) {
			next[k] = {
				jobId: v.jobId,
				status: v.status,
				errorMessage: v.errorMessage ?? null
			};
		}
		if (prevDemoJobsLoadRef.snapshot !== undefined) {
			maybeToastDemoJobsFromLoadData(prevDemoJobsLoadRef.snapshot, next, (pid) => {
				const p = prospectListRef.list.find((x) => x.id === pid);
				return (p?.companyName || p?.email || pid).trim() || pid.slice(0, 8);
			});
		}
		prevDemoJobsLoadRef.snapshot = next;
	});

	$effect(() => {
		if (!browser) return;
		if (!hasActivePipelineJobs) return;
		const id = setInterval(() => {
			void invalidateAll();
		}, 6000);
		return () => clearInterval(id);
	});

	const approvedProspects = $derived(
		prospects.filter((p) => {
			const s = trackingByProspectId[p.id]?.status;
			return s === 'approved' || s === 'email_draft';
		})
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
	/** Count of prospects in a queued automation status (may be stuck if no active job). */
	const prospectsInQueueCount = $derived(prospects.filter((p) => isProspectQueuedStatus(p.status)).length);
	const hasDemoCreatingJob = $derived(data.hasDemoCreatingJob ?? false);
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

	/** True when the row is in a processing state (GBP, Insights, or demo creation). Rows with a demo or with a failed demo are selectable so they can be retried after running qualifier. */
	function isRowProcessing(p: ProspectRow): boolean {
		if ((p.demoLink ?? '').trim()) return false; // Already has demo -> selectable
		const job = p.demoJob;
		if (job?.status === 'failed') return false; // Failed demo -> selectable so user can run qualifier then Process next step to retry
		if (optimisticGbpProspectIds.has(p.id) || optimisticInsightsProspectIds.has(p.id)) return true;
		if (p.gbpJob) return true;
		if (p.insightsJob) return true;
		if (job?.status === 'pending' || job?.status === 'creating') return true;
		// Persisted status so we treat as processing after refresh when job maps are empty
		return isProspectQueuedStatus(p.status);
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
	/** `__all__` = no status filter */
	let statusFilter = $state<string>('__all__');
	/** `__all__` = any industry; `__none__` = blank industry */
	let industryFilter = $state<string>('__all__');

	const statusFilterOptions = $derived.by(() => {
		const nextStepOpts = {
			optimisticGbpIds: optimisticGbpProspectIds,
			optimisticInsightsIds: optimisticInsightsProspectIds
		};
		const labels = new Set<string>();
		for (const p of prospectsWithJobStatus) {
			labels.add(
				getSimplifiedStatus(p, { ...nextStepOpts, hasGbpData: p.hasGbpData }).label
			);
		}
		return Array.from(labels).sort((a, b) => a.localeCompare(b));
	});

	function displayIndustryLabel(raw: string): string {
		const s = raw.trim();
		if (!s) return '';
		return (
			gbpCategoriesToIndustryLabel(s) ??
			INDUSTRY_LABELS[notionIndustryToSlug(s)] ??
			s
		);
	}

	const industryFilterOptions = $derived.by(() => {
		const set = new Set<string>();
		let hasEmpty = false;
		for (const p of prospectsWithJobStatus) {
			const s = (p.industry ?? '').trim();
			if (s) set.add(displayIndustryLabel(s));
			else hasEmpty = true;
		}
		return {
			values: Array.from(set).sort((a, b) => a.localeCompare(b)),
			hasEmpty
		};
	});

	$effect(() => {
		const { values, hasEmpty } = industryFilterOptions;
		if (industryFilter === '__all__') return;
		if (industryFilter === '__none__') {
			if (!hasEmpty) industryFilter = '__all__';
			return;
		}
		if (!values.includes(industryFilter)) industryFilter = '__all__';
	});

	$effect(() => {
		if (statusFilter === '__all__') return;
		if (!statusFilterOptions.includes(statusFilter)) statusFilter = '__all__';
	});

	const filteredProspects = $derived.by((): ProspectRow[] => {
		let list: ProspectRow[] = prospectsWithJobStatus;
		const nextStepOpts = {
			optimisticGbpIds: optimisticGbpProspectIds,
			optimisticInsightsIds: optimisticInsightsProspectIds
		};
		if (statusFilter !== '__all__') {
			list = list.filter(
				(p) =>
					getSimplifiedStatus(p, { ...nextStepOpts, hasGbpData: p.hasGbpData }).label ===
					statusFilter
			);
		}
		if (industryFilter !== '__all__') {
			if (industryFilter === '__none__') {
				list = list.filter((p) => !(p.industry ?? '').trim());
			} else {
				list = list.filter(
					(p) => displayIndustryLabel((p.industry ?? '').trim()) === industryFilter
				);
			}
		}
		const q = filterQuery.trim().toLowerCase();
		if (q) {
			list = list.filter((p) => {
				const statusLabel = getSimplifiedStatus(p, {
					...nextStepOpts,
					hasGbpData: p.hasGbpData
				}).label.toLowerCase();
				return (
					(p.companyName ?? '').toLowerCase().includes(q) ||
					(p.email ?? '').toLowerCase().includes(q) ||
					(p.website ?? '').toLowerCase().includes(q) ||
					statusLabel.includes(q)
				);
			});
		}
		return list;
	});

	function openClientDialog(p: Prospect) {
		goto(`/dashboard/prospects/${p.id}`);
	}

	let createDemosDialogOpen = $state(false);
	let createDemosForm: HTMLFormElement | null = $state(null);
	let createDemosSubmitting = $state(false);
	let singleCreateProspectId = $state('');
	let singleCreateForm: HTMLFormElement | null = $state(null);
	let singleCreateSubmitting = $state(false);
	let bulkGbpSubmitting = $state(false);
	let bulkInsightsSubmitting = $state(false);
	let bulkRestoreSubmitting = $state(false);
	let bulkProcessNextStepSubmitting = $state(false);
	let clearStuckSubmitting = $state(false);
	let resetStuckDemoSubmitting = $state(false);
	/** Prospect ID currently running processNextStep (per-row generate icon). */
	let processNextStepId = $state<string | null>(null);
	let sendDemosDialogOpen = $state(false);
	let sendDemosForm: HTMLFormElement | null = $state(null);
	let sendDemosSubmitting = $state(false);
	let importCsvOpen = $state(false);
	let importCsvSubmitting = $state(false);
	type PlaceSuggest = { placeId: string; fullText: string; mainText: string; secondaryText: string };
	let importApifyOpen = $state(false);
	let importApifySubmitting = $state(false);
	let importApifyIndustry = $state<IndustrySlug>('dental');
	let importApifyLocation = $state('');
	let placeSuggestions = $state<PlaceSuggest[]>([]);
	let placeSuggestLoading = $state(false);
	let placeSuggestTimer: ReturnType<typeof setTimeout> | null = null;

	function schedulePlaceSuggestions(query: string) {
		if (!browser) return;
		if (placeSuggestTimer) clearTimeout(placeSuggestTimer);
		placeSuggestTimer = setTimeout(() => void loadPlaceSuggestions(query), 300);
	}

	async function loadPlaceSuggestions(query: string) {
		const q = query.trim();
		if (!browser || !placesApiConfigured || q.length < 2) {
			placeSuggestions = [];
			return;
		}
		placeSuggestLoading = true;
		try {
			const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(q)}`, {
				credentials: 'include'
			});
			const body = (await res.json()) as { suggestions?: PlaceSuggest[] };
			placeSuggestions = Array.isArray(body.suggestions) ? body.suggestions : [];
		} catch {
			placeSuggestions = [];
		} finally {
			placeSuggestLoading = false;
		}
	}

	function pickPlaceSuggestion(s: PlaceSuggest) {
		importApifyLocation = s.fullText || [s.mainText, s.secondaryText].filter(Boolean).join(', ');
		placeSuggestions = [];
	}
	let bulkSendDraftsDialogOpen = $state(false);
	let bulkSendDraftsForm: HTMLFormElement | null = $state(null);
	let bulkSendDraftsSubmitting = $state(false);
	let pullGbpDentalSubmitting = $state(false);
	let tableRefreshing = $state(false);
	/** Prospect IDs we've just submitted for GBP/Insights so status updates immediately before server responds. */
	let optimisticGbpProspectIds = $state<Set<string>>(new Set());
	let optimisticInsightsProspectIds = $state<Set<string>>(new Set());

	/** Approved or Gmail-draft-stage prospects with demo + email (bulk create/replace Gmail drafts). */
	const approvedSendableProspects = $derived(
		approvedProspects.filter(
			(p) => (p.demoLink ?? '').trim().length > 0 && (p.email ?? '').trim().length > 0
		)
	);

	/** Prospects with a Gmail outreach draft on file (bulk send from header). */
	const prospectsWithGmailDraft = $derived(
		(prospects ?? []).filter(
			(p) => (p.gmailOutreachDraftId ?? '').trim().length > 0 && !p.flagged
		)
	);
	const prospectsWithGmailDraftCount = $derived(prospectsWithGmailDraft.length);
	const showBulkSendDraftsButton = $derived(
		prospectsWithGmailDraftCount > 0 && canOutreachSend
	);
	const showBulkSendConnectGmail = $derived(
		prospectsWithGmailDraftCount > 0 && !sendConfigured
	);
	const integrationsGmailHref = '/dashboard/integrations';

	function ensureAupInput(formEl: HTMLFormElement | null) {
		if (!formEl) return;
		let input = formEl.querySelector<HTMLInputElement>('input[name="aupConfirmed"]');
		if (!input) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'aupConfirmed';
			formEl.appendChild(input);
		}
		input.value = 'on';
	}

	function submitSendDemosForm() {
		if (!sendDemosForm || sendDemosSubmitting) return;
		ensureAupInput(sendDemosForm);
		sendDemosForm.requestSubmit();
	}

	function submitBulkSendDraftsForm() {
		if (!bulkSendDraftsForm || bulkSendDraftsSubmitting) return;
		ensureAupInput(bulkSendDraftsForm);
		bulkSendDraftsForm.requestSubmit();
	}

	async function refreshProspectsTable() {
		if (tableRefreshing) return;
		tableRefreshing = true;
		try {
			await invalidateAll();
		} catch (err) {
			clientError('refreshProspectsTable', err);
		} finally {
			tableRefreshing = false;
		}
	}

	/** Run next step for one prospect (pull GBP, pull insights, or create demo). Used by per-row generate icon. */
	async function handleProcessNextStep(prospectId: string) {
		if (processNextStepId) return;
		processNextStepId = prospectId;
		const p = prospects.find((x) => x.id === prospectId);
		const who = p?.companyName || p?.email || prospectId;
		toastInfo(
			'Next step',
			`${who} — Queueing now. You will get another toast when the job finishes and what to do next.`
		);
		const formData = new FormData();
		formData.set('prospectId', prospectId);
		try {
			const res = await fetch('?/processNextStep', {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' }
			});
			let actionResult: ReturnType<typeof deserialize>;
			try {
				actionResult = deserialize(await res.text());
			} catch {
				toastError('Next step', 'Request failed.');
				return;
			}
			if (actionResult.type === 'error') {
				toastError('Next step', 'Request failed.');
				return;
			}
			if (actionResult.type === 'failure') {
				const fd = actionResult.data;
				const msg =
					fd && typeof fd === 'object' && 'message' in fd
						? String((fd as { message?: string }).message)
						: 'Request failed.';
				if (msg === 'This prospect already has a demo.') {
					toastInfo('Next step', msg);
				} else {
					toastError('Next step', msg);
				}
				return;
			}
			if (actionResult.type !== 'success' || actionResult.data == null || typeof actionResult.data !== 'object') {
				toastError('Next step', res.ok ? 'Nothing to do for this prospect.' : 'Request failed.');
				return;
			}
			const result = actionResult.data as {
				success?: boolean;
				step?: string;
				queued?: boolean;
				prospectId?: string;
				companyName?: string;
				alreadyQueued?: boolean;
				message?: string;
			};
			const success = result.success === true;
			if (success && result.queued && result.step) {
				if (result.step === 'gbp') {
					optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds, prospectId]);
				} else if (result.step === 'insights') {
					optimisticInsightsProspectIds = new Set([...optimisticInsightsProspectIds, prospectId]);
				}
				const queuedDesc = (() => {
					if (result.alreadyQueued) {
						if (result.step === 'demo') {
							return `${who} — Still processing: demo generation (often 1–2 min). Next when done: review, approve, send.`;
						}
						return `${who} — Still processing: pull data (GBP, site, AI grade). Next when done: Run next step to queue the demo.`;
					}
					if (result.step === 'demo') {
						return `${who} — Now: demo generation queued (often 1–2 min). Next when finished: open the row, review, approve, send.`;
					}
					if (result.step === 'insights') {
						return `${who} — Now: pull data queued (GBP, website, AI insights). Next when finished: Run next step again to queue demo creation.`;
					}
					return `${who} — Now: job queued. Next: watch for a finished toast with the exact next action.`;
				})();
				const queuedActivity =
					result.step === 'demo'
						? result.alreadyQueued
							? `Still creating the demo for ${who}.`
							: `Started creating the demo for ${who}.`
						: result.step === 'insights'
							? result.alreadyQueued
								? `Still gathering profile and insights for ${who}.`
								: `Started gathering profile and insights for ${who}.`
							: result.step === 'gbp'
								? result.alreadyQueued
									? `Still syncing Google Business Profile for ${who}.`
									: `Started Google Business Profile for ${who}.`
								: `Started the next step for ${who}.`;
				toastSuccess(result.alreadyQueued ? 'Already in progress' : 'Queued', queuedDesc, result.prospectId
					? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${result.prospectId}`) }
					: undefined,
					{ activity: queuedActivity });
				await invalidateAll();
			} else {
				const msg = result.message ?? (res.ok ? 'Nothing to do for this prospect.' : 'Request failed.');
				if (msg === 'This prospect already has a demo.') {
					toastInfo('Next step', msg);
				} else {
					toastError('Next step', msg);
				}
			}
		} catch (err) {
			clientError('processNextStep', err);
			toastError('Next step', 'Request failed.');
		} finally {
			processNextStepId = null;
		}
	}

	/** Create demo for one prospect: enqueue job so it runs in background (demo creation can take 1–2 min). */
	async function handleCreateDemo(p: Prospect) {
		if (singleCreateSubmitting) return;
		singleCreateSubmitting = true;
		const who = p.companyName || p.email || p.id;
		toastInfo(
			'Create demo',
			`${who} — Queueing demo generation. Another toast will fire when it finishes with what to do next.`
		);
		const formData = new FormData();
		formData.set('prospectId', p.id);
		try {
			const res = await fetch('?/enqueueDemo', {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' }
			});
			let actionResult: ReturnType<typeof deserialize>;
			try {
				actionResult = deserialize(await res.text());
			} catch {
				toastError('Create demo', 'Request failed.');
				return;
			}
			if (actionResult.type === 'error') {
				toastError('Create demo', 'Request failed.');
				return;
			}
			if (actionResult.type === 'failure') {
				const fd = actionResult.data;
				const msg =
					fd && typeof fd === 'object' && 'message' in fd
						? String((fd as { message?: string }).message)
						: 'Failed to queue demo';
				toastError('Create demo', msg);
				return;
			}
			if (actionResult.type !== 'success' || actionResult.data == null || typeof actionResult.data !== 'object') {
				toastError('Create demo', 'Failed to queue demo');
				return;
			}
			const result = actionResult.data as {
				queued?: boolean;
				alreadyQueued?: boolean;
				prospectId?: string;
				companyName?: string;
			};
			if (result.queued && result.prospectId) {
				const demoQueuedDesc = result.alreadyQueued
					? `${who} — Still processing: demo generation (often 1–2 min). Next when done: review, approve, send.`
					: `${who} — Now: demo generation queued (often 1–2 min). Next when finished: open the row, review, approve, send.`;
				toastSuccess(
					result.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
					demoQueuedDesc,
					{ label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${p.id}`) },
					{
						activity: result.alreadyQueued
							? `Demo still generating for ${who}.`
							: `Demo generation queued for ${who}.`
					}
				);
				await invalidateAll();
			} else {
				toastError('Create demo', 'Failed to queue demo');
			}
		} catch (err) {
			clientError('Create demo fetch', err);
			toastError('Create demo', 'Request failed.');
		} finally {
			singleCreateSubmitting = false;
		}
	}

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
					const whoEnhance = prospect ? prospect.companyName || prospect.email || d.prospectId : d.prospectId;
					toastSuccess(
						d.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
						desc,
						d.prospectId ? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${d.prospectId}`) } : undefined,
						{
							activity: d.alreadyQueued
								? `Still creating the demo for ${whoEnhance}.`
								: `Started creating the demo for ${whoEnhance}.`
						}
					);
					await invalidateAll();
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
					disabled: false
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
			meta: { label: 'Website', className: 'hidden md:table-cell' },
			cell: ({ row }) => {
				const scraped = data.scrapedDataByProspectId?.[row.original.id];
				const audit = auditFromScrapedData(scraped ?? null);
				return renderComponent(DataTableWebsiteCell, {
					website: row.original.website ?? null,
					audit
				});
			},
			enableSorting: false
		},
		{
			id: 'gbp',
			header: () => 'GBP',
			meta: { label: 'GBP', className: 'hidden md:table-cell' },
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
			id: 'status',
			header: () => 'Status',
			meta: { label: 'Status' },
			accessorFn: (row) => {
				const audit = auditFromScrapedData(
					((data.scrapedDataByProspectId ?? {})[(row as ProspectRow).id] as Record<string, unknown>) ?? null
				);
				return getSimplifiedStatus(row as ProspectRow, {
					optimisticGbpIds: optimisticGbpProspectIds,
					optimisticInsightsIds: optimisticInsightsProspectIds,
					hasGbpData: audit ? hasUsableInsight(audit) : false
				}).label;
			},
			cell: ({ row }) => {
				const p = row.original;
				const scraped = data.scrapedDataByProspectId?.[p.id] as Record<string, unknown> | undefined;
				const audit = auditFromScrapedData(scraped ?? null);
				const hasGbpData = audit ? hasUsableInsight(audit) : false;
				const status = getSimplifiedStatus(p, {
					optimisticGbpIds: optimisticGbpProspectIds,
					optimisticInsightsIds: optimisticInsightsProspectIds,
					hasGbpData
				});
				const statusSpinner =
					p.demoJob?.status === 'creating' ||
					p.insightsJob?.status === 'running' ||
					p.gbpJob?.status === 'running' ||
					status.label === 'Processing Demo' ||
					status.label === 'Processing…';
				// Map to distinct badge styles: success=primary, warning=secondary, destructive=red, muted=outline, default=secondary
				const badgeVariant =
					status.variant === 'success'
						? 'default'
						: status.variant === 'warning'
							? 'secondary'
							: status.variant === 'destructive'
								? 'destructive'
								: status.variant === 'muted'
									? 'outline'
									: 'secondary';
				return renderComponent(DataTableStatusBadge, {
					label: status.label,
					variant: badgeVariant,
					showSpinner: statusSpinner
				});
			}
		},
		{
			id: 'actions',
			header: () => '',
			meta: { label: '' },
			enableHiding: false,
			cell: ({ row }) => {
				const p = row.original;
				const step = getNextStep(p, {
					optimisticGbpIds: optimisticGbpProspectIds,
					optimisticInsightsIds: optimisticInsightsProspectIds
				});
				const hasDemoLinkOnRow = !!(p.demoLink ?? '').trim();
				// Show email icon when next step is "ready to send" (approved or Gmail draft) and demo exists
				const showSendDemo = step.filterValue === 'approved' && hasDemoLinkOnRow;
				// With a demo URL, use Regenerate (in actions menu) — not Run next step — to avoid duplicate controls
				const showGenerate =
					!hasDemoLinkOnRow &&
					!showSendDemo &&
					(step.filterValue === 'pull_data' ||
						step.filterValue === 'create_demo' ||
						step.filterValue === 'retry_demo');
				const demoStatus = p.demoJob?.status as 'pending' | 'creating' | 'done' | 'failed' | undefined;
				return renderComponent(ProspectRowActionsCell, {
					prospectId: p.id,
					showGenerate,
					showSendDemo,
					gmailConnected: sendConfigured,
					prospectLabel: p.companyName || p.email || p.id,
					processing: isRowProcessing(p),
					generating: processNextStepId === p.id,
					onProcessNextStep: handleProcessNextStep,
					hasDemoLink: hasDemoLinkOnRow,
					demoJobStatus: demoStatus,
					trackingStatus: p.tracking?.status as
						| 'draft'
						| 'approved'
						| 'email_draft'
						| 'sent'
						| 'opened'
						| 'clicked'
						| 'replied'
						| undefined,
					showDelete: !p.flagged,
					showRestore: !!p.flagged,
					onRegenerateQueued: () => void invalidateAll(),
					onSendDemoSuccess: () => invalidateAll()
				});
			}
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
		enableRowSelection: () => true,
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
	<title>Prospects — Ed & Sy Admin</title>
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
					const pRow = prospects.find((x) => x.id === singleCreateProspectId);
					const whoHidden = pRow?.companyName || pRow?.email || singleCreateProspectId;
					toastSuccess(
						d.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
						d.alreadyQueued ? 'Creation is running. The list will update when ready.' : 'Creation usually takes 1–2 minutes. The list will update when ready.',
						undefined,
						{
							activity: d.alreadyQueued
								? `Still creating the demo for ${whoHidden}.`
								: `Started creating the demo for ${whoHidden}.`
						}
					);
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
	<Card.Root id="prospects">
		<Card.Header class="pb-6">
			<div class="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
				<div class="min-w-0 w-full space-y-1 sm:flex-1">
					<Card.Title class="text-2xl font-semibold tracking-tight">Welcome back!</Card.Title>
					<Card.Description class="hidden text-muted-foreground md:block">
						Here's a list of your prospects. Search and manage demos from the table.
					</Card.Description>
				</div>
				<div
					class="flex w-full min-w-0 flex-row flex-wrap items-center gap-2 sm:w-auto sm:max-w-none sm:justify-end"
				>
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
												'No stuck prospects found. All queue rows have an active job.'
											);
											await invalidateAll();
										}
									} else if (result.type === 'failure' && result.data?.message) {
										toastError('Clear queue status', (result.data as { message?: string }).message);
									}
								};
							}}
							class="inline-flex min-w-0 shrink-0"
						>
							<Button
								type="submit"
								variant="outline"
								size="sm"
								class="h-9 max-w-full bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:shrink-0 max-sm:px-0 max-sm:[&_svg]:m-0"
								disabled={clearStuckSubmitting}
								title="Clear stuck gbp queued / demo queued when no active job"
								aria-label={clearStuckSubmitting ? 'Clearing stuck queue' : 'Clear stuck queue'}
							>
								{#if clearStuckSubmitting}
									<LoaderCircle class="size-4 animate-spin sm:mr-1.5" aria-hidden="true" />
								{:else}
									<ListX class="size-4 sm:mr-1.5" aria-hidden="true" />
								{/if}
								<span class="sr-only sm:not-sr-only sm:inline">
									{clearStuckSubmitting ? 'Clearing…' : 'Clear stuck queue'}
								</span>
							</Button>
						</form>
					{/if}
					{#if hasDemoCreatingJob}
						<form
							method="POST"
							action="?/resetStuckDemoJobs"
							use:enhance={() => {
								resetStuckDemoSubmitting = true;
								return async ({ result }) => {
									resetStuckDemoSubmitting = false;
									if (result.type === 'success' && result.data && typeof result.data === 'object') {
										const d = result.data as { resetCount?: number };
										const n = d.resetCount ?? 0;
										if (n > 0) {
											toastSuccess(
												'Demo queue',
												n === 1
													? 'Put 1 stuck demo back on the queue'
													: `Put ${n} stuck demos back on the queue`
											);
											await invalidateAll();
										} else {
											toastInfo(
												'Demo queue',
												'No demos were stuck long enough (over 5 minutes) to reset.'
											);
											await invalidateAll();
										}
									} else if (result.type === 'failure' && result.data?.message) {
										toastError('Reset stuck demos', (result.data as { message?: string }).message);
									}
								};
							}}
							class="inline-flex min-w-0 shrink-0"
						>
							<Button
								type="submit"
								variant="outline"
								size="sm"
								class="h-9 max-w-full bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:shrink-0 max-sm:px-0 max-sm:[&_svg]:m-0"
								disabled={resetStuckDemoSubmitting}
								title="Put demos stuck in generating (over 5 minutes) back on the demo queue"
								aria-label={resetStuckDemoSubmitting ? 'Resetting stuck demos' : 'Reset stuck demos'}
							>
								{#if resetStuckDemoSubmitting}
									<LoaderCircle class="size-4 animate-spin sm:mr-1.5" aria-hidden="true" />
								{:else}
									<RotateCcw class="size-4 sm:mr-1.5" aria-hidden="true" />
								{/if}
								<span class="sr-only sm:not-sr-only sm:inline">
									{resetStuckDemoSubmitting ? 'Resetting…' : 'Reset stuck demos'}
								</span>
							</Button>
						</form>
					{/if}
					<form
						method="POST"
						action="?/pullGbpDental"
						use:enhance={() => {
							pullGbpDentalSubmitting = true;
							return async ({ result }) => {
								pullGbpDentalSubmitting = false;
								if (result.type === 'success' && result.data && typeof result.data === 'object') {
									const d = result.data as { message?: string; added?: number };
									toastSuccess('Lead discovery', d.message ?? `Added ${d.added ?? 0} prospect(s).`);
									await invalidateAll();
								} else if (result.type === 'failure' && result.data?.message) {
									toastError('Lead discovery', (result.data as { message?: string }).message);
									await applyAction(result);
								}
							};
						}}
						class="inline-flex min-w-0 shrink-0"
					>
						<Button
							type="submit"
							variant="outline"
							size="sm"
							class="h-9 max-w-full bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:shrink-0 max-sm:px-0 max-sm:[&_svg]:m-0"
							disabled={pullGbpDentalSubmitting || !placesApiConfigured || gbpDentalTodayCount >= gbpDentalDailyCap || gbpDentalPullLock.locked}
							title={!placesApiConfigured
								? 'Set GOOGLE_PLACES_API_KEY in .env'
								: gbpDentalPullLock.locked
									? `Locked for ${gbpDentalLockMinutesRemaining} more minute${gbpDentalLockMinutesRemaining === 1 ? '' : 's'}`
									: `Today: ${gbpDentalTodayCount}/${gbpDentalDailyCap}`}
							aria-label={gbpDentalPullLock.locked
								? 'Lead discovery locked'
								: pullGbpDentalSubmitting
									? 'Pulling dental leads'
									: 'Lead discovery (GBP)'}
						>
							{#if pullGbpDentalSubmitting}
								<LoaderCircle class="size-4 animate-spin sm:mr-2" aria-hidden="true" />
							{:else}
								<MapPin class="size-4 sm:mr-2" aria-hidden="true" />
							{/if}
							<span class="sr-only sm:not-sr-only sm:inline">
								{#if gbpDentalPullLock.locked}
									Lead discovery locked
								{:else}
									Lead discovery (GBP)
								{/if}
							</span>
						</Button>
					</form>
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="h-9 shrink-0 bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
						onclick={() => (importCsvOpen = true)}
						aria-label="Import CSV"
					>
						<Upload class="size-4 sm:mr-2" aria-hidden="true" />
						<span class="sr-only sm:not-sr-only sm:inline">Import CSV</span>
					</Button>
					{#if apifyConfigured && prospects.length > 0}
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="h-9 shrink-0 bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
							onclick={() => {
								importApifyOpen = true;
								placeSuggestions = [];
							}}
							aria-label="Import from Apify"
						>
							<CloudDownload class="size-4 sm:mr-2" aria-hidden="true" />
							<span class="sr-only sm:not-sr-only sm:inline">Import from Apify</span>
						</Button>
					{/if}
					{#if myActiveApifyJob}
						<span
							class="text-muted-foreground inline-flex size-9 max-w-[10rem] shrink-0 items-center justify-center sm:size-auto sm:max-w-none sm:justify-start sm:gap-1"
							title="Apify Google Maps import in progress for {myActiveApifyJob.industry} — {myActiveApifyJob.location}"
							role="status"
							aria-label="Apify import in progress"
						>
							<LoaderCircle class="size-4 shrink-0 animate-spin sm:size-3.5" aria-hidden="true" />
							<span class="sr-only sm:not-sr-only sm:inline sm:truncate">Apify import…</span>
						</span>
					{/if}
					{#if showBulkSendDraftsButton}
						<Button
							type="button"
							variant="default"
							size="sm"
							class="h-9 shrink-0 max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
							title="Send all Gmail outreach drafts now (same as Send now on each prospect)"
							aria-label="Bulk send {prospectsWithGmailDraftCount} Gmail draft{prospectsWithGmailDraftCount === 1 ? '' : 's'}"
							onclick={() => (bulkSendDraftsDialogOpen = true)}
						>
							<Send class="size-4 sm:mr-2" aria-hidden="true" />
							<span class="sr-only sm:not-sr-only sm:inline">
								Bulk send ({prospectsWithGmailDraftCount})
							</span>
						</Button>
					{:else if showBulkSendConnectGmail}
						<Button
							variant="default"
							size="sm"
							class="h-9 shrink-0 max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
							href={integrationsGmailHref}
							title="Connect Gmail in Integrations to send saved drafts"
							aria-label="Connect Gmail — {prospectsWithGmailDraftCount} draft{prospectsWithGmailDraftCount === 1 ? '' : 's'}"
						>
							<Mail class="size-4 sm:mr-2" aria-hidden="true" />
							<span class="sr-only sm:not-sr-only sm:inline">
								Connect Gmail ({prospectsWithGmailDraftCount} draft{prospectsWithGmailDraftCount === 1
									? ''
									: 's'})
							</span>
						</Button>
					{/if}
				</div>
			</div>
		</Card.Header>
		<form
			bind:this={bulkSendDraftsForm}
			method="POST"
			action="?/sendGmailOutreachDraftsBulk"
			class="hidden"
			aria-hidden="true"
			use:enhance={() => {
				bulkSendDraftsSubmitting = true;
				return async ({ result }) => {
					try {
						if (
							result.type === 'success' &&
							result.data &&
							typeof result.data === 'object' &&
							'success' in result.data &&
							result.data.success
						) {
							const d = result.data as { sent?: number; total?: number; errors?: string[] };
							const extra =
								d.errors?.length && d.errors.length > 0
									? ` Some failed: ${d.errors.slice(0, 2).join('; ')}`
									: '';
							toastSuccess(
								'Bulk send',
								d.sent != null && d.total != null
									? `Sent ${d.sent} of ${d.total} draft${d.total === 1 ? '' : 's'}.${extra}`
									: 'Done.'
							);
							bulkSendDraftsDialogOpen = false;
							await invalidateAll();
						} else if (result.type === 'failure' && result.data?.message) {
							toastError('Bulk send', (result.data as { message?: string }).message);
							await applyAction(result);
						}
					} finally {
						bulkSendDraftsSubmitting = false;
					}
				};
			}}
		></form>
		<AlertDialog.Root bind:open={bulkSendDraftsDialogOpen}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Send all Gmail drafts now?</AlertDialog.Title>
					<AlertDialog.Description>
						This will send {prospectsWithGmailDraftCount} outreach email{prospectsWithGmailDraftCount === 1 ? '' : 's'} from your
						connected Gmail (drafts are removed after send). You accept the Acceptable Use Policy (AUP).
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={bulkSendDraftsSubmitting}>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="button" disabled={bulkSendDraftsSubmitting} onclick={submitBulkSendDraftsForm}>
						{#if bulkSendDraftsSubmitting}
							<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
						{/if}
						{bulkSendDraftsSubmitting ? 'Sending…' : 'Send now'}
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
		<Dialog.Root bind:open={importCsvOpen}>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Import prospects from CSV</Dialog.Title>
					<Dialog.Description>
						Include a header row with <strong>company</strong> (or name) and <strong>email</strong>. Optional:
						website, phone, industry. Up to 500 rows per file. Rows already in your list (same
						company and email) are skipped.
					</Dialog.Description>
				</Dialog.Header>
				<form
					method="POST"
					action="?/importCsv"
					enctype="multipart/form-data"
					use:enhance={() => {
						importCsvSubmitting = true;
						return async ({ result }) => {
							importCsvSubmitting = false;
							if (
								result.type === 'success' &&
								result.data &&
								typeof result.data === 'object' &&
								'success' in result.data &&
								(result.data as { success?: boolean }).success
							) {
								const d = result.data as {
									inserted?: number;
									skipped?: number;
									failed?: number;
									errors?: string[];
								};
								const parts = [
									`Added ${d.inserted ?? 0}`,
									`skipped ${d.skipped ?? 0}`
								];
								if ((d.failed ?? 0) > 0) parts.push(`failed ${d.failed}`);
								toastSuccess('Import CSV', parts.join(', ') + '.');
								if (d.errors?.length) {
									toastInfo('Import', d.errors.slice(0, 5).join(' '));
								}
								importCsvOpen = false;
								await invalidateAll();
							} else if (result.type === 'failure' && result.data?.message) {
								toastError('Import CSV', (result.data as { message?: string }).message);
							}
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="lr-import-csv">CSV file</Label>
						<Input
							id="lr-import-csv"
							name="csvFile"
							type="file"
							accept=".csv,text/csv"
							required
							class="cursor-pointer"
						/>
					</div>
					<Dialog.Footer class="gap-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={importCsvSubmitting}
							onclick={() => (importCsvOpen = false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={importCsvSubmitting}>
							{#if importCsvSubmitting}
								<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
							{/if}
							{importCsvSubmitting ? 'Importing…' : 'Import'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		<Dialog.Root bind:open={importApifyOpen}>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Import from Apify</Dialog.Title>
					<Dialog.Description>
						Runs the Google Maps scraper for your industry and location. This can take several minutes. New
						prospects appear in the table when the job finishes (no need to refresh).
					</Dialog.Description>
				</Dialog.Header>
				<form
					method="POST"
					action="?/enqueueApifyImport"
					class="space-y-4"
					use:enhance={() => {
						importApifySubmitting = true;
						return async ({ result }) => {
							importApifySubmitting = false;
							if (
								result.type === 'success' &&
								result.data &&
								typeof result.data === 'object' &&
								'success' in result.data &&
								(result.data as { success?: boolean }).success
							) {
								const d = result.data as { alreadyQueued?: boolean };
								toastSuccess(
									'Apify import',
									d.alreadyQueued
										? 'You already have an import running; it will continue in the background.'
										: 'Import queued. You will get a notification when it completes.'
								);
								importApifyOpen = false;
								placeSuggestions = [];
								void fetch('/api/jobs/apify', {
									method: 'POST',
									credentials: 'include',
									headers: { 'Content-Type': 'application/json' },
									body: '{}'
								}).catch(() => {});
								await invalidateAll();
							} else if (result.type === 'failure' && result.data?.message) {
								toastError('Apify import', (result.data as { message?: string }).message);
							}
						};
					}}
				>
					<input type="hidden" name="industry" value={importApifyIndustry} />
					<input type="hidden" name="location" value={importApifyLocation} />
					<div class="space-y-2">
						<Label id="lr-apify-industry-label">Industry we work with</Label>
						<Select.Root type="single" bind:value={importApifyIndustry}>
							<Select.Trigger class="w-full" aria-labelledby="lr-apify-industry-label">
								{INDUSTRY_LABELS[importApifyIndustry]}
							</Select.Trigger>
							<Select.Content>
								{#each INDUSTRY_SLUGS as slug (slug)}
									<Select.Item value={slug}>{INDUSTRY_LABELS[slug]}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="relative space-y-2">
						<Label for="lr-apify-location">City / province</Label>
						<Input
							id="lr-apify-location"
							bind:value={importApifyLocation}
							oninput={(e) => schedulePlaceSuggestions(e.currentTarget.value)}
							autocomplete="off"
							placeholder="Start typing; pick a suggestion or enter manually"
							aria-autocomplete="list"
							aria-expanded={placeSuggestions.length > 0}
							aria-controls="lr-apify-suggest-list"
						/>
						{#if placeSuggestLoading}
							<p class="text-muted-foreground text-xs">Searching places…</p>
						{/if}
						{#if placeSuggestions.length > 0}
							<ul
								id="lr-apify-suggest-list"
								class="border-input bg-popover absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border p-1 shadow-md"
								role="listbox"
							>
								{#each placeSuggestions as s (s.placeId)}
									<li role="presentation">
										<button
											type="button"
											role="option"
											aria-selected="false"
											class="hover:bg-accent focus:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none"
											onclick={() => pickPlaceSuggestion(s)}
										>
											{s.fullText || [s.mainText, s.secondaryText].filter(Boolean).join(', ')}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
						{#if !placesApiConfigured}
							<p class="text-muted-foreground text-xs">
								Places autocomplete is off (set GOOGLE_PLACES_API_KEY). You can still type a location.
							</p>
						{/if}
					</div>
					<Dialog.Footer class="gap-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={importApifySubmitting}
							onclick={() => {
								importApifyOpen = false;
								placeSuggestions = [];
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={importApifySubmitting || importApifyLocation.trim().length < 2}
						>
							{#if importApifySubmitting}
								<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
							{/if}
							{importApifySubmitting ? 'Queueing…' : 'Start import'}
						</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
		{#if prospects.length === 0}
			<div class="mx-4 mb-4 sm:mx-6">
				<div
					class="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
				>
					<p class="text-sm text-muted-foreground">
						No prospects yet. Import a CSV to add rows, use Apify, or connect an integration and sync.
					</p>
					<div class="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="h-9 shrink-0 bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
							onclick={() => (importCsvOpen = true)}
							aria-label="Import CSV"
						>
							<Upload class="size-4 sm:mr-2" aria-hidden="true" />
							<span class="sr-only sm:not-sr-only sm:inline">Import CSV</span>
						</Button>
						{#if apifyConfigured}
							<Button
								type="button"
								variant="outline"
								size="sm"
								class="h-9 shrink-0 bg-background max-sm:size-9 max-sm:min-w-9 max-sm:max-w-9 max-sm:px-0 max-sm:[&_svg]:m-0"
								onclick={() => {
									importApifyOpen = true;
									placeSuggestions = [];
								}}
								aria-label="Import from Apify"
							>
								<CloudDownload class="size-4 sm:mr-2" aria-hidden="true" />
								<span class="sr-only sm:not-sr-only sm:inline">Import from Apify</span>
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		{#if prospects.length > 0}
			<div class="mx-4 mb-4 sm:mx-6">
				<div
					class="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6"
					role="search"
					aria-label="Search and filter prospects"
				>
					<div class="prospects-search relative min-w-0 w-full shrink-0 md:max-w-sm">
						<label for="lr-dash-filter" class="sr-only">Search prospects</label>
						<SearchIcon
							class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							id="lr-dash-filter"
							type="search"
							placeholder="Search company, email, website…"
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
					<div
						class="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end md:ms-auto md:w-auto"
					>
						{#if industryFilterOptions.values.length > 0 || industryFilterOptions.hasEmpty}
							<div class="flex w-full min-w-0 items-center gap-2 sm:w-auto">
								<Label for="lr-industry-filter" class="sr-only">Filter by industry</Label>
								<Select.Root
									type="single"
									value={industryFilter}
									onValueChange={(v) => {
										industryFilter = v ?? '__all__';
									}}
								>
									<Select.Trigger
										id="lr-industry-filter"
										size="sm"
										class="!h-9 min-h-9 w-full min-w-0 border-border/50 py-0 sm:min-w-[10rem] sm:max-w-[min(100%,18rem)]"
										aria-label="Filter by industry"
									>
										{#if industryFilter === '__all__'}
											All industries
										{:else if industryFilter === '__none__'}
											No industry
										{:else}
											<span class="truncate">{industryFilter}</span>
										{/if}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="__all__">All industries</Select.Item>
										{#if industryFilterOptions.hasEmpty}
											<Select.Item value="__none__">No industry</Select.Item>
										{/if}
										{#each industryFilterOptions.values as ind (ind)}
											<Select.Item value={ind}>{ind}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						{/if}
						<div class="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:justify-end">
							<Label for="lr-status-filter" class="sr-only">Filter by status</Label>
							<Select.Root
								type="single"
								value={statusFilter}
								onValueChange={(v) => {
									statusFilter = v ?? '__all__';
								}}
							>
								<Select.Trigger
									id="lr-status-filter"
									size="sm"
									class="!h-9 min-h-9 w-full min-w-0 border-border/50 py-0 sm:min-w-[10rem] sm:max-w-[min(100%,18rem)]"
									aria-label="Filter by status"
								>
									{#if statusFilter === '__all__'}
										All statuses
									{:else}
										<span class="truncate">{statusFilter}</span>
									{/if}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="__all__">All statuses</Select.Item>
									{#each statusFilterOptions as label (label)}
										<Select.Item value={label}>{label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							class="size-9 shrink-0 bg-background"
							disabled={tableRefreshing}
							onclick={refreshProspectsTable}
							aria-label="Refresh table"
							title="Reload prospects and job status from the server"
						>
							<RefreshCw class={cn('size-4', tableRefreshing && 'animate-spin')} aria-hidden="true" />
						</Button>
					</div>
				</div>
			</div>
			<!-- Prominent "Send email" bar when there are approved prospects -->
			{#if approvedSendableProspects.length > 0}
				<form
					bind:this={sendDemosForm}
					method="POST"
					action="?/sendDemos"
					use:enhance={() => {
						sendDemosSubmitting = true;
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									const d = result.data as { sent?: number; total?: number };
									toastSuccess(
										'Gmail drafts',
										d.sent != null
											? `Created or updated ${d.sent} draft${d.sent === 1 ? '' : 's'}.`
											: 'Done.'
									);
									sendDemosDialogOpen = false;
									await invalidateAll();
								} else if (result.type === 'failure' && result.data?.message) {
									toastError('Gmail drafts', (result.data as { message?: string }).message);
									await applyAction(result);
								}
							} finally {
								sendDemosSubmitting = false;
							}
						};
					}}
					class="hidden"
					aria-hidden="true"
				>
					{#each approvedSendableProspects as p (p.id)}
						<input type="hidden" name="prospectId" value={p.id} />
					{/each}
				</form>
				<AlertDialog.Root bind:open={sendDemosDialogOpen}>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Create Gmail drafts for selected prospects?</AlertDialog.Title>
							<AlertDialog.Description>
								A draft with the demo link will be created in your Gmail for each of
								{approvedSendableProspects.length} prospect{approvedSendableProspects.length === 1 ? '' : 's'} (existing
								drafts are replaced).
								<br /><br />
								<strong>You accept the Acceptable Use Policy (AUP).</strong>
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel disabled={sendDemosSubmitting}>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="button" disabled={sendDemosSubmitting} onclick={submitSendDemosForm}>
								{#if sendDemosSubmitting}
									<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
								{/if}
								{sendDemosSubmitting ? 'Sending…' : 'Send email'}
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{/if}
		{/if}
		<Card.Content class="lr-dash-card-content lr-prospects-content p-0">
			{#snippet selectionBar()}
				{#if prospects.length > 0 && filteredProspects.length > 0}
					<div
						class="flex flex-col gap-4 py-4 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
					>
						<div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
							<div class="w-full text-center text-sm text-muted-foreground sm:w-auto sm:text-start">
								{table.getFilteredSelectedRowModel().rows.length} of
								{table.getFilteredRowModel().rows.length} row(s) selected.
							</div>
							{#if table.getFilteredSelectedRowModel().rows.length > 0}
								{@const selectedRows = table.getFilteredSelectedRowModel().rows}
								{@const nextStepOpts = { optimisticGbpIds: optimisticGbpProspectIds, optimisticInsightsIds: optimisticInsightsProspectIds }}
								{@const partition = (() => {
									const pullData: string[] = [];
									const demo: string[] = [];
									const flagged: string[] = [];
									for (const row of selectedRows) {
										const rowData = row.original as ProspectRow;
										const step = getNextStep(rowData, nextStepOpts);
										if (step.filterValue === 'pull_data') pullData.push(rowData.id);
										else if (step.filterValue === 'create_demo' || step.filterValue === 'retry_demo') demo.push(rowData.id);
										else if (step.filterValue === 'flagged') flagged.push(rowData.id);
									}
									return { pullData, demo, flagged };
								})()}
								{@const actionableCount = partition.pullData.length + partition.demo.length + partition.flagged.length}
								{@const nextStepSummary = (() => {
									const parts: string[] = [];
									if (partition.pullData.length > 0) parts.push(`${partition.pullData.length} Pull data`);
									if (partition.demo.length > 0) parts.push(`${partition.demo.length} Create/retry demo`);
									if (partition.flagged.length > 0) parts.push(`${partition.flagged.length} Restore`);
									return parts.join(', ');
								})()}
								{#if actionableCount > 0}
									<form
										method="POST"
										action="?/bulkProcessNextStep"
										use:enhance={() => {
											bulkProcessNextStepSubmitting = true;
											optimisticInsightsProspectIds = new Set([...optimisticInsightsProspectIds, ...partition.pullData]);
											return async ({ result }) => {
												try {
													if (result.type === 'success' && result.data && typeof result.data === 'object' && (result.data as { success?: boolean }).success) {
														const d = result.data as {
															gbp?: { queued?: number; total?: number; enqueueFailed?: number };
															demos?: { queued?: number; total?: number; errors?: string[] };
															restored?: { count?: number; total?: number };
														};
														const parts: string[] = [];
														if (d.gbp && (d.gbp.queued ?? 0) > 0) parts.push(`${d.gbp.queued} queued for pull data`);
														if (d.gbp?.enqueueFailed && d.gbp.enqueueFailed > 0) parts.push(`${d.gbp.enqueueFailed} pull data enqueue failed`);
														if (d.demos && (d.demos.queued ?? 0) > 0) parts.push(`${d.demos.queued} queued for demo`);
														if (d.restored && (d.restored.count ?? 0) > 0) parts.push(`${d.restored.count} restored`);
														if (parts.length > 0) {
															toastSuccess(
																'Process next step',
																`${parts.join('. ')} Now: jobs are running in the background. Next: watch for finish toasts per client; the table refreshes automatically.`
															);
														} else if (actionableCount > 0) {
															toastInfo(
																'Process next step',
																'No new jobs queued (already in progress or skipped). Next: wait for running jobs to finish, then try again if needed.'
															);
														}
														addHttpCallLog({
															action: 'bulkProcessNextStep',
															result: 'success',
															message: parts.join('; ') || 'Done',
															status: 200,
															context: `${actionableCount} actionable`
														});
														rowSelection = {};
														await invalidateAll();
														await invalidate('/dashboard/prospects');
													} else if (result.type === 'failure' && result.data?.message) {
														optimisticInsightsProspectIds = new Set([...optimisticInsightsProspectIds].filter((id) => !partition.pullData.includes(id)));
														addHttpCallLog({
															action: 'bulkProcessNextStep',
															result: 'failure',
															message: (result.data as { message?: string }).message,
															status: (result as { status?: number }).status,
															responseData: result.data
														});
														toastError('Process next step', (result.data as { message?: string }).message);
														await applyAction(result);
													} else {
														await applyAction(result);
													}
												} finally {
													bulkProcessNextStepSubmitting = false;
												}
											};
										}}
									>
										<input type="hidden" name="pullDataIds" value={JSON.stringify(partition.pullData)} />
										<input type="hidden" name="demoIds" value={JSON.stringify(partition.demo)} />
										<input type="hidden" name="flaggedIds" value={JSON.stringify(partition.flagged)} />
										<div class="flex flex-wrap items-center gap-2">
											<span class="text-muted-foreground text-sm" title="Queued action per selected row">{nextStepSummary}</span>
											<Button type="submit" size="sm" disabled={bulkProcessNextStepSubmitting}>
												{#if bulkProcessNextStepSubmitting}
													<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
												{/if}
												{bulkProcessNextStepSubmitting ? 'Processing…' : 'Process next step'}
											</Button>
										</div>
									</form>
								{:else}
									<span class="text-muted-foreground text-sm">Selected rows have no queueable action (e.g. review &amp; send or already sent).</span>
								{/if}
							{/if}
						</div>
						<div
							class="lr-prospects-pagination flex w-full min-w-0 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-end lg:w-auto lg:max-w-none"
						>
							<div class="flex shrink-0 items-center gap-2">
								<Label for="lr-rows-per-page" class="sr-only sm:not-sr-only">Rows per page</Label>
								<Select.Root
									type="single"
									value={String(pagination.pageSize)}
									onValueChange={(v) => v != null && table.setPageSize(Number(v))}
								>
									<Select.Trigger
										id="lr-rows-per-page"
										size="sm"
										class="h-8 w-20 border-border/50"
										aria-label="Rows per page"
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
							<div class="shrink-0 text-sm font-medium tabular-nums">
								Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
							</div>
							<div class="flex shrink-0 items-center gap-2 [&_button]:border-border/50">
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
			<div class="mx-2 max-sm:min-w-0 overflow-x-auto sm:mx-6 my-2">
				<div class="rounded-md border bg-background overflow-hidden">
					<Table.Root>
						<Table.Header>
							{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<Table.Row>
									{#each headerGroup.headers as header (header.id)}
										<Table.Head
											class={cn(
												'[&:has([role=checkbox])]:ps-3',
												(header.column.columnDef.meta as { className?: string } | undefined)?.className
											)}
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
								<Table.Row data-state={row.getIsSelected() && 'selected'}>
									{#each row.getVisibleCells() as cell (cell.id)}
										<Table.Cell
											class={cn(
												'[&:has([role=checkbox])]:ps-3',
												(cell.column.columnDef.meta as { className?: string } | undefined)?.className
											)}
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
								Demo pages will be generated for the selected prospects that don't have a demo yet. Each moves to Review when ready. This usually takes 1–2 minutes per prospect; the list will update as each finishes.
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
							toastInfo(
								'Create demos',
								`${who} — Queueing demo jobs. You will get a toast per client when each demo finishes, with what to do next.`
							);
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
												`Now: ${queued} demo generation job(s) running (often 1–2 min each). Next: a finish toast per client; table refreshes automatically.`
											);
										} else {
											toastInfo(
												'Create demos',
												'No demos queued (selected already had demos or were skipped). Next: pick clients without demos, then try again.'
											);
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
							<div class="flex gap-1 border-b border-border/50 pb-2 shrink-0">
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
									<div class="max-w-full overflow-x-auto rounded-md border bg-background">
									<Table.Root class="w-full min-w-0 table-fixed md:min-w-full">
										<Table.Header>
											<Table.Row>
												<Table.Head class="w-[100px] shrink-0 whitespace-normal">Error</Table.Head>
												<Table.Head class="w-[80px] shrink-0 whitespace-normal">Code</Table.Head>
												<Table.Head class="min-w-0 whitespace-normal">Message</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each filteredCallLogs as entry (entry.id)}
												<Table.Row
													class={entry.result === 'failure'
														? 'border-destructive/30 bg-destructive/5'
														: 'border-green-500/20 bg-green-500/5'}
												>
													<Table.Cell class="align-top font-medium whitespace-normal">
														<span
															class={entry.result === 'success'
																? 'text-green-600 dark:text-green-400'
																: 'text-destructive'}
														>
															{entry.result === 'success' ? 'Success' : 'Error'}
														</span>
													</Table.Cell>
													<Table.Cell class="align-top font-mono text-xs tabular-nums whitespace-normal">
														{entry.status != null ? entry.status : '—'}
													</Table.Cell>
													<Table.Cell class="align-top text-sm break-words whitespace-normal">
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
									</div>
								{/if}
							</div>
							<Drawer.Footer class="shrink-0 pt-2">
								<Drawer.Close
									class={buttonVariants({ variant: 'outline' })}
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

	{#if prospects.length > 0 && filteredProspects.length === 0}
		<p class="py-8 text-sm text-muted-foreground">No prospects match your filter. Try a different search.</p>
	{/if}
</div>

<style>
	/* Keep table and pagination interactive during demo/insights creation and form submission */
	.lr-prospects-content,
	.lr-prospects-pagination {
		pointer-events: auto;
		position: relative;
		z-index: 1;
	}

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
