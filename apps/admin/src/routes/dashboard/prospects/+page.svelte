<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
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
	import { X, ExternalLink, Mail, MessageSquare, Copy, Link2, Send, Eye, Globe, Phone, MapPin, Star, ListChecks, Briefcase, LoaderCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload } from 'lucide-svelte';
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
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { toastSuccess, toastError, toastInfo, toastFromActionResult } from '$lib/toast';
import { clientError } from '$lib/log';

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
	const gbpDentalTodayCount = $derived(data.gbpDentalTodayCount ?? 0);
	const gbpDentalDailyCap = $derived(data.gbpDentalDailyCap ?? 25);
	const placesApiConfigured = $derived(data.placesApiConfigured ?? false);
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
	/** Count of prospects in a queued automation status (may be stuck if no active job). */
	const prospectsInQueueCount = $derived(prospects.filter((p) => isProspectQueuedStatus(p.status)).length);
	const processingSummary = $derived.by(() => {
		const gbpJobs = Object.values(data.gbpJobsByProspectId ?? {});
		const insightsJobs = Object.values(data.insightsJobsByProspectId ?? {});
		const demoJobs = Object.values(data.demoJobsByProspectId ?? {});
		const gbpCount = gbpJobs.filter((j) => j.status === 'pending' || j.status === 'running').length;
		const insightsCount = insightsJobs.filter((j) => j.status === 'pending' || j.status === 'running').length;
		const demoCount = demoJobs.filter((j) => j.status === 'pending' || j.status === 'creating').length;
		const parts: string[] = [];
		if (gbpCount > 0) parts.push(`GBP ${gbpCount}`);
		if (insightsCount > 0) parts.push(`Insights ${insightsCount}`);
		if (demoCount > 0) parts.push(`Demo ${demoCount}`);
		return parts.join(' · ');
	});

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

	/** Build a short user-facing alert for demo job failure: "Error - Description." */
	function formatDemoErrorAlert(errorMessage: string | undefined): string {
		const raw = (errorMessage ?? 'Unknown error').trim();
		const lower = raw.toLowerCase();
		if (/gbp|not found|no search results|dataforseo|business profile|scraped data/.test(lower)) {
			return 'Unable to create demo - GBP not found.';
		}
		// Only rewrite when error clearly refers to a CRM provider (sync/integrations), not generic "sync" or "invalid input" from demo/generator
		if (/\b(crm|notion|pipedrive|hubspot|gohighlevel)\b/i.test(lower)) {
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

	const hasActiveFilters = $derived(filterQuery.trim() !== '');
	const activeFilterCount = $derived(filterQuery.trim() ? 1 : 0);

	function clearFilters() {
		filterQuery = '';
	}

	const filteredProspects = $derived.by((): ProspectRow[] => {
		let list: ProspectRow[] = prospectsWithJobStatus;
		const q = filterQuery.trim().toLowerCase();
		const nextStepOpts = { optimisticGbpIds: optimisticGbpProspectIds, optimisticInsightsIds: optimisticInsightsProspectIds };
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
	let bulkProcessNextStepSubmitting = $state(false);
	let clearStuckSubmitting = $state(false);
	let gbpJobPollingActive = $state(false);
	let insightsJobPollingActive = $state(false);
	/** Prospect ID currently running processNextStep (per-row generate icon). */
	let processNextStepId = $state<string | null>(null);
	let sendDemosDialogOpen = $state(false);
	let sendDemosForm: HTMLFormElement | null = $state(null);
	let sendDemosSubmitting = $state(false);
	let importCsvOpen = $state(false);
	let importCsvSubmitting = $state(false);
	let pullGbpDentalSubmitting = $state(false);
	/** Prospect IDs we've just submitted for GBP/Insights so status updates immediately before server responds. */
	let optimisticGbpProspectIds = $state<Set<string>>(new Set());
	let optimisticInsightsProspectIds = $state<Set<string>>(new Set());

	/** Approved prospects that have a demo and email (can be sent). */
	const approvedSendableProspects = $derived(
		approvedProspects.filter(
			(p) => (p.demoLink ?? '').trim().length > 0 && (p.email ?? '').trim().length > 0
		)
	);

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

	/** Run next step for one prospect (pull GBP, pull insights, or create demo). Used by per-row generate icon. */
	async function handleProcessNextStep(prospectId: string) {
		if (processNextStepId) return;
		processNextStepId = prospectId;
		const p = prospects.find((x) => x.id === prospectId);
		const who = p?.companyName || p?.email || prospectId;
		toastInfo('Next step', `Processing ${who}…`);
		const formData = new FormData();
		formData.set('prospectId', prospectId);
		try {
			const res = await fetch('?/processNextStep', {
				method: 'POST',
				body: formData,
				headers: { Accept: 'application/json' }
			});
			const raw = (await res.json().catch(() => ({}))) as {
				type?: string;
				data?: { success?: boolean; step?: string; queued?: boolean; prospectId?: string; companyName?: string; alreadyQueued?: boolean; message?: string };
				message?: string;
			};
			const result = raw?.data ?? raw;
			const success = result && typeof result === 'object' && 'success' in result && result.success;
			const message = result?.message ?? raw?.message;
			if (success && result.queued && result.step) {
				if (result.step === 'gbp') {
					optimisticGbpProspectIds = new Set([...optimisticGbpProspectIds, prospectId]);
					startGbpJobPolling();
				} else if (result.step === 'insights') {
					optimisticInsightsProspectIds = new Set([...optimisticInsightsProspectIds, prospectId]);
					startInsightsJobPolling();
				} else {
					startDemoJobPolling();
				}
				toastSuccess(
					result.alreadyQueued ? 'Already in progress' : 'Queued',
					result.alreadyQueued
						? 'Job is running. The list will update when ready.'
						: result.step === 'demo'
							? 'Demo usually takes 1–2 minutes. The list will update when ready.'
							: 'The list will update when ready.',
					result.prospectId ? { label: 'View prospect', onClick: () => goto(`/dashboard/prospects/${result.prospectId}`) } : undefined
				);
				await invalidateAll();
			} else {
				const msg = message ?? (res.ok ? 'Nothing to do for this prospect.' : 'Request failed.');
				// Already has a demo is informational, not a failure
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
				alreadyQueued?: boolean;
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
					// Refresh list so "In queue" (e.g. after demo completed or failed) updates
					await invalidateAll();
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
					// Refresh list so "In queue" (e.g. after GBP completed or failed) updates
					await invalidateAll();
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
					// Refresh list so "In queue" (e.g. after insights completed) updates
					await invalidateAll();
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
		// Also poll when some prospects have no demo and queued status (demo may have completed or failed; refresh will update state)
		const prospects = data.prospects ?? [];
		const inQueueNoDemo = prospects.some(
			(p: Prospect) => !(p.demoLink ?? '').trim() && isProspectQueuedStatus(p.status)
		);
		if ((hasPending || inQueueNoDemo) && !demoJobPollingActive) startDemoJobPolling();
	});

	$effect(() => {
		const gbpJobs = data.gbpJobsByProspectId ?? {};
		if (Object.keys(gbpJobs).length > 0 && !gbpJobPollingActive) startGbpJobPolling();
	});

	$effect(() => {
		const insightsJobs = data.insightsJobsByProspectId ?? {};
		const hasInsightsJobs = Object.keys(insightsJobs).length > 0;
		// Also poll when some prospects have no demo and queued status (insights may have completed; refresh will update state)
		const prospects = data.prospects ?? [];
		const inQueueNoDemo = prospects.some(
			(p: Prospect) => !(p.demoLink ?? '').trim() && isProspectQueuedStatus(p.status)
		);
		if ((hasInsightsJobs || inQueueNoDemo) && !insightsJobPollingActive) startInsightsJobPolling();
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
			meta: { label: 'Website' },
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
					status.label === 'Processing GBP' ||
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
				// Show email icon whenever demo is approved and has a demo link (email required by server when sending)
				const showSendDemo =
					step.filterValue === 'approved' && !!(p.demoLink ?? '').trim();
				const showGenerate =
					!showSendDemo &&
					(step.filterValue === 'pull_data' ||
						step.filterValue === 'create_demo' ||
						step.filterValue === 'retry_demo');
				const demoStatus = p.demoJob?.status as 'pending' | 'creating' | 'done' | 'failed' | undefined;
				return renderComponent(ProspectRowActionsCell, {
					prospectId: p.id,
					showGenerate,
					showSendDemo,
					prospectLabel: p.companyName || p.email || p.id,
					processing: isRowProcessing(p),
					generating: processNextStepId === p.id,
					onProcessNextStep: handleProcessNextStep,
					hasDemoLink: !!(p.demoLink ?? '').trim(),
					demoJobStatus: demoStatus,
					trackingStatus: p.tracking?.status as
						| 'draft'
						| 'approved'
						| 'sent'
						| 'opened'
						| 'clicked'
						| 'replied'
						| undefined,
					showDelete: !p.flagged,
					showRestore: !!p.flagged,
					onRegenerateQueued: () => startDemoJobPolling(),
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
	<Card.Root id="prospects">
		<Card.Header class="space-y-1 pb-6">
			<Card.Title class="text-2xl font-semibold tracking-tight">Welcome back!</Card.Title>
			<Card.Description class="text-muted-foreground">
				Here's a list of your prospects. Search and manage demos from the table.
			</Card.Description>
		</Card.Header>
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
		{#if prospects.length === 0}
			<div class="mx-4 mb-4 sm:mx-6">
				<div
					class="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
				>
					<p class="text-sm text-muted-foreground">
						No prospects yet. Import a CSV to add rows, or connect an integration and sync.
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="h-9 shrink-0 bg-background"
						onclick={() => (importCsvOpen = true)}
					>
						<Upload class="mr-2 size-4" aria-hidden="true" />
						Import CSV
					</Button>
				</div>
			</div>
		{/if}
		{#if prospects.length > 0}
			<div class="mx-4 mb-4 sm:mx-6">
				<div
					class="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6"
					role="search"
					aria-label="Filter prospects"
				>
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
											toastSuccess('Send demo', d.sent != null ? `Email sent to ${d.sent} prospect${d.sent === 1 ? '' : 's'}.` : 'Done.');
											sendDemosDialogOpen = false;
											await invalidateAll();
										} else if (result.type === 'failure' && result.data?.message) {
											toastError('Send demo', (result.data as { message?: string }).message);
											await applyAction(result);
										}
									} finally {
										sendDemosSubmitting = false;
									}
								};
							}}
							class="contents"
						>
							{#each approvedSendableProspects as p (p.id)}
								<input type="hidden" name="prospectId" value={p.id} />
							{/each}
							<AlertDialog.Root bind:open={sendDemosDialogOpen}>
								<AlertDialog.Trigger asChild>
									{#snippet trigger({ props })}
										<Button type="button" size="sm" class="h-9" {...props}>
											<Send class="mr-2 size-4" aria-hidden="true" />
											Send Demo
										</Button>
									{/snippet}
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Send demo to approved prospects?</AlertDialog.Title>
										<AlertDialog.Description>
											An email with the demo link will be sent to {approvedSendableProspects.length} prospect{approvedSendableProspects.length === 1 ? '' : 's'}.
											<br><br>
											<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
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
						</form>
					{/if}
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
							placeholder="Search by company, email, website, status…"
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

					{#if processingSummary}
						<div class="flex items-center">
							<Badge variant="outline" class="h-8 px-2 text-xs">
								<LoaderCircle class="mr-1.5 size-3 animate-spin" aria-hidden="true" />
								Now processing: {processingSummary}
							</Badge>
						</div>
					{/if}

					{#if prospectsInQueueCount > 0}
						<div class="flex flex-wrap items-center gap-3 sm:gap-4">
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
								class="flex items-center"
							>
								<Button
									type="submit"
									variant="outline"
									size="sm"
									class="h-9"
									disabled={clearStuckSubmitting}
									title="Clear stuck gbp queued / demo queued when no active job"
								>
									{#if clearStuckSubmitting}
										<LoaderCircle class="mr-1.5 size-4 animate-spin" aria-hidden="true" />
									{/if}
									{clearStuckSubmitting ? 'Clearing…' : 'Clear stuck queue'}
								</Button>
							</form>
						</div>
					{/if}

					<!-- Clear filters + Import + Columns -->
					<div class="flex shrink-0 items-center gap-2 border-t border-border/50 pt-4 sm:ms-auto sm:border-0 sm:pt-0">
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
						>
							<Button
								type="submit"
								variant="outline"
								size="sm"
								class="h-9 bg-background"
								disabled={pullGbpDentalSubmitting || !placesApiConfigured || gbpDentalTodayCount >= gbpDentalDailyCap || gbpDentalPullLock.locked}
								title={!placesApiConfigured
									? 'Set GOOGLE_PLACES_API_KEY in .env'
									: gbpDentalPullLock.locked
										? `Locked for ${gbpDentalLockMinutesRemaining} more minute${gbpDentalLockMinutesRemaining === 1 ? '' : 's'}`
										: `Today: ${gbpDentalTodayCount}/${gbpDentalDailyCap}`}
							>
								{#if pullGbpDentalSubmitting}
									<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
								{:else}
									<MapPin class="mr-2 size-4" aria-hidden="true" />
								{/if}
								{#if gbpDentalPullLock.locked}
									Lead discovery locked
								{:else}
									Lead discovery (GBP)
								{/if}
							</Button>
						</form>
						<Button
							type="button"
							variant="outline"
							size="sm"
							class="h-9 bg-background"
							onclick={() => (importCsvOpen = true)}
						>
							<Upload class="mr-2 size-4" aria-hidden="true" />
							Import CSV
						</Button>
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
			<!-- Prominent "Send email" bar when there are approved prospects -->
			{#if approvedSendableProspects.length > 0}
				<div class="mx-4 mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/40 sm:mx-6">
					<span class="text-sm font-medium text-green-800 dark:text-green-200">
						{approvedSendableProspects.length} approved demo{approvedSendableProspects.length === 1 ? '' : 's'} ready to send
					</span>
					<Button
						type="button"
						size="sm"
						class="h-9 bg-green-700 text-white hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
						onclick={() => (sendDemosDialogOpen = true)}
					>
						<Send class="mr-2 size-4" aria-hidden="true" />
						Send email
					</Button>
				</div>
			{/if}
		{/if}
		<Card.Content class="lr-dash-card-content lr-prospects-content p-0">
			{#snippet selectionBar()}
				{#if prospects.length > 0 && filteredProspects.length > 0}
					<div class="flex flex-wrap items-center justify-between gap-4 py-4 px-4">
						<div class="flex flex-1 flex-wrap items-center gap-4">
							<div class="text-muted-foreground text-sm">
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
														if (parts.length > 0) toastSuccess('Process next step', parts.join('. '));
														else if (actionableCount > 0) toastInfo('Process next step', 'No new jobs queued (already in progress or skipped).');
														addHttpCallLog({
															action: 'bulkProcessNextStep',
															result: 'success',
															message: parts.join('; ') || 'Done',
															status: 200,
															context: `${actionableCount} actionable`
														});
														rowSelection = {};
														await invalidateAll();
														if ((d.gbp?.queued ?? 0) > 0) startInsightsJobPolling();
														if ((d.demos?.queued ?? 0) > 0) startDemoJobPolling();
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
						<div class="lr-prospects-pagination flex w-full flex-wrap items-center justify-end gap-6 lg:w-auto">
							<div class="flex items-center gap-2">
								<Label for="lr-rows-per-page" class="text-sm font-medium whitespace-nowrap">Rows per page</Label>
								<Select.Root
									type="single"
									value={String(pagination.pageSize)}
									onValueChange={(v) => v != null && table.setPageSize(Number(v))}
								>
									<Select.Trigger id="lr-rows-per-page" size="sm" class="w-20 h-8 border-border/50">
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
					</div>
				{/if}
			{/snippet}
			{@render selectionBar()}
			<div class="overflow-x-auto mx-4 sm:mx-6 my-2">
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
