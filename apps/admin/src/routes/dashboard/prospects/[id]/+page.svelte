<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { getStatusDisplay } from '$lib/statusDisplay';
	import { DEMO_TRACKING_OPTIONS, getDemoTrackingLabel, type DemoTrackingStatus, auditFromScrapedData } from '$lib/demo';
	import { getDemoFailureLabel } from '$lib/constants/demoErrors';
	import type { PageData } from './$types';
	import {
		ArrowLeft,
		Briefcase,
		Mail,
		Globe,
		Phone,
		MapPin,
		Star,
		Link2,
		Copy,
		ExternalLink,
		LoaderCircle,
		Trash2,
		Check,
		Circle,
		Send
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { toastSuccess, toastError } from '$lib/toast';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { tick } from 'svelte';

	/** Safe return URL from ?returnTo= (only dashboard paths). Default: prospects list. */
	const backHref = $derived.by(() => {
		const raw = page.url?.searchParams.get('returnTo') ?? '';
		const decoded = raw ? decodeURIComponent(raw) : '';
		// Only allow relative dashboard paths to avoid open redirect
		if (decoded.startsWith('/dashboard/') && !decoded.includes('//')) return decoded;
		return '/dashboard/prospects';
	});

	let { data }: { data: PageData; form?: import('./$types').ActionFailure<{ message: string }> } =
		$props();

	const prospect = $derived(data.prospect);
	const demoTracking = $derived(data.demoTracking);
	const scrapedData = $derived(data.scrapedData ?? null);
	const demoJob = $derived(data.demoJob);
	const insightsJob = $derived(data.insightsJob ?? null);
	const insightsJobActive = $derived(!!insightsJob);
	const gbpJob = $derived(data.gbpJob ?? null);
	const gbpJobActive = $derived(!!gbpJob);
	const canSend = $derived(data.canSend ?? false);
	const atDemoLimit = $derived(data.atDemoLimit ?? false);
	const showInsightsAndDemo = $derived(data.showInsightsAndDemo ?? !prospect.flagged);
	const gbpAudit = $derived(scrapedData ? auditFromScrapedData(scrapedData) : null);
	const insight = $derived(gbpAudit?.insight ?? null);
	/** When false, we recommend AI agent / voice AI / SEO email instead of a website demo. */
	const needsWebsiteDemo = $derived(insight?.needsWebsiteDemo !== false);
	const hasAnalysis = $derived(!!scrapedData && !!insight);

	let copied = $state(false);
	let aupConfirmed = $state(false);
	let generatingDemo = $state(false);
	let regeneratingDemo = $state(false);
	let analyzingBusiness = $state(false);
	let regeneratingGbpInsights = $state(false);
	let demoJobPollingActive = $state(false);
	let insightsJobPollingActive = $state(false);
	let gbpJobPollingActive = $state(false);
	let deleteDialogOpen = $state(false);
	let sendConfirmOpen = $state(false);
	let sendAlternateConfirmOpen = $state(false);
	let sendingEmail = $state(false);
	let sendForm: HTMLFormElement | null = $state(null);
	let sendAlternateForm: HTMLFormElement | null = $state(null);
	/** Set true after Approve demo succeeds so Send button appears immediately before refetch. */
	let approvedJustNow = $state(false);
	let editingEmail = $state(false);
	let updatingEmail = $state(false);

	let demoStatus = $state<DemoTrackingStatus>(() =>
		(demoTracking?.status as DemoTrackingStatus) ?? 'draft'
	);
	$effect(() => {
		const s = demoTracking?.status as DemoTrackingStatus | undefined;
		if (s && DEMO_TRACKING_OPTIONS.some((o) => o.value === s)) {
			demoStatus = s;
			if (s === 'approved') approvedJustNow = false;
		}
	});

	$effect(() => {
		if (!browser) return;
		if (insightsJob && !insightsJobPollingActive) startInsightsJobPolling();
	});

	$effect(() => {
		if (!browser) return;
		if (gbpJob && !gbpJobPollingActive) startGbpJobPolling();
	});

	type ProspectEventEntry = { key: string; label: string; at: string | null; seq: number };
	/** Activity history: what happened to this prospect (newest first). */
	const prospectEvents = $derived.by((): ProspectEventEntry[] => {
		const events: ProspectEventEntry[] = [];
		let seq = 0;
		const pushEvent = (key: string, label: string, at: string | null) => {
			events.push({ key, label, at, seq: seq++ });
		};

		pushEvent('added', 'Added to CRM', prospect.createdAt ?? null);
		if (prospect.flagged) {
			pushEvent('out_of_scope', 'Marked out of scope', null);
		}
		if (gbpJob?.status === 'pending') {
			pushEvent('gbp_queued', 'GBP queued', null);
		}
		if (gbpJob?.status === 'running') {
			pushEvent('gbp_processing', 'Processing GBP', null);
		}
		if (insightsJob?.status === 'pending') {
			pushEvent('insights_queued', 'Insights queued', null);
		}
		if (insightsJob?.status === 'running') {
			pushEvent('insights_processing', 'Processing insights', null);
		}
		if (hasAnalysis) {
			pushEvent('insights_ready', 'Insights ready', demoTracking?.updated_at ?? null);
		}
		if (demoJob?.status === 'pending') {
			pushEvent('demo_queued', 'Demo queued', null);
		}
		if (demoJob?.status === 'creating') {
			pushEvent('demo_processing', 'Processing demo', null);
		}
		if (demoJob?.status === 'failed') {
			pushEvent(
				'demo_failed',
				`Demo failed${demoJob.errorMessage ? `: ${getDemoFailureLabel(demoJob.errorMessage)}` : ''}`,
				null
			);
		}
		if ((prospect.demoLink ?? '').trim()) {
			pushEvent('demo_created', 'Demo created', demoTracking?.created_at ?? null);
		}
		if (demoTracking?.status) {
			pushEvent(
				`stage_${demoTracking.status}`,
				`Stage set to ${getDemoTrackingLabel(demoTracking.status)}`,
				demoTracking.updated_at ?? null
			);
		}
		if (demoTracking?.send_time) {
			pushEvent('sent', 'Demo sent', demoTracking.send_time);
		}
		if (demoTracking?.opened_at) {
			pushEvent('opened', 'Demo opened (email)', demoTracking.opened_at);
		}
		if (demoTracking?.clicked_at) {
			pushEvent('clicked', 'Demo opened (link click)', demoTracking.clicked_at);
		}
		if (demoTracking?.status === 'replied') {
			pushEvent('follow_up', 'Follow-up / replied', demoTracking.updated_at ?? null);
		}
		return events
			.slice()
			.sort((a, b) => {
				const aMs = a.at ? new Date(a.at).getTime() : -1;
				const bMs = b.at ? new Date(b.at).getTime() : -1;
				// Newest timestamp first when available.
				if (aMs !== bMs) return bMs - aMs;
				// For same/missing timestamps, use event insertion order (latest step first).
				return b.seq - a.seq;
			});
	});

	/** One clear next step for the user. Drives header CTA and in-content emphasis. */
	type PrimaryAction =
		| { type: 'analyze' }
		| { type: 'generate' }
		| { type: 'review' }
		| { type: 'send' }
		| { type: 'sendAlternateOffer' }
		| null;
	const primaryAction = $derived.by((): PrimaryAction => {
		if (!showInsightsAndDemo) return null;
		if (demoJob?.status === 'pending' || demoJob?.status === 'creating') return null;
		// No insights yet: show Pull insights only (Generate demo hidden until insights exist)
		if (!hasAnalysis && !prospect.demoLink) return { type: 'analyze' };
		// Analysis says no website demo: show Send email (AI agent / voice AI / SEO)
		if (hasAnalysis && insight?.needsWebsiteDemo === false && !prospect.demoLink && canSend && prospect.email?.trim())
			return { type: 'sendAlternateOffer' };
		// Only show Generate demo after insights have been pulled (demo job infers industry from GBP/website via Gemini)
		if (hasAnalysis && !prospect.demoLink)
			return demoJob?.status === 'failed' && isGbpError(demoJob?.errorMessage) ? null : { type: 'generate' };
		// Approved: show Send (from server, optimistic approve, Stage dropdown, or no tracking row = legacy)
		const isApproved =
			!demoTracking ||
			demoTracking.status === 'approved' ||
			approvedJustNow ||
			demoStatus === 'approved';
		if (isApproved) return { type: 'send' };
		if (demoTracking?.status === 'draft' || demoStatus === 'draft') return { type: 'review' };
		return null;
	});

	/** True when demo is approved (any source) or has demo but no tracking row (legacy). Used to show Send by email in header. */
	const isApprovedForSend = $derived(
		!!(prospect.demoLink ?? '').trim() &&
		(!demoTracking ||
			demoTracking.status === 'approved' ||
			approvedJustNow ||
			demoStatus === 'approved')
	);

	/** Short label for failed demo badge (avoids long error text in header). */
	function failedDemoBadgeLabel(): string {
		return getDemoFailureLabel(demoJob?.errorMessage ?? undefined);
	}

	function statusLabel(): string {
		if (demoJob?.status === 'pending') return 'Demo Queued';
		if (demoJob?.status === 'creating') return 'Processing Demo';
		if (demoJob?.status === 'failed') return failedDemoBadgeLabel();
		if (demoTracking?.status) {
			if (demoTracking.status === 'draft') return getDemoTrackingLabel('draft');
			if (demoTracking.status === 'approved') return getDemoTrackingLabel('approved');
			if (demoTracking.status === 'sent' && demoTracking.send_time) {
				try {
					const d = new Date(demoTracking.send_time);
					return `${getDemoTrackingLabel('sent')} ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
				} catch {
					return getDemoTrackingLabel('sent');
				}
			}
			if (demoTracking.status === 'sent') return getDemoTrackingLabel('sent');
			if (demoTracking.status === 'opened' && demoTracking.opened_at) {
				try {
					const d = new Date(demoTracking.opened_at);
					return `${getDemoTrackingLabel('opened')} ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
				} catch {
					return getDemoTrackingLabel('opened');
				}
			}
			if (demoTracking.status === 'opened') return getDemoTrackingLabel('opened');
			if (demoTracking.status === 'clicked' && demoTracking.clicked_at) {
				try {
					const d = new Date(demoTracking.clicked_at);
					return `${getDemoTrackingLabel('clicked')} ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
				} catch {
					return getDemoTrackingLabel('clicked');
				}
			}
			if (demoTracking.status === 'clicked') return getDemoTrackingLabel('clicked');
			if (demoTracking.status === 'replied') return getDemoTrackingLabel('replied');
			return getStatusDisplay(prospect.status).label;
		}
		return getStatusDisplay(prospect.status).label;
	}

	function badgeVariant(): 'default' | 'secondary' | 'outline' | 'destructive' {
		if (demoJob?.status === 'pending' || demoJob?.status === 'creating') return 'secondary';
		if (demoJob?.status === 'failed') return 'destructive';
		if (demoTracking?.status) {
			return ['sent', 'opened', 'clicked', 'replied'].includes(demoTracking.status)
				? 'default'
				: demoTracking.status === 'approved' || demoTracking.status === 'draft'
					? 'default'
					: 'outline';
		}
		const v = getStatusDisplay(prospect.status).variant;
		if (v === 'success') return 'default';
		if (v === 'warning') return 'secondary';
		return 'outline';
	}

	function formatDate(iso: string | null): string {
		if (!iso) return '—';
		try {
			return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
		} catch {
			return iso;
		}
	}

	async function copyLink() {
		if (!prospect.demoLink) return;
		await navigator.clipboard.writeText(prospect.demoLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function isGbpError(msg: string | undefined): boolean {
		const lower = (msg ?? '').trim().toLowerCase();
		return /gbp|not found|no search results|dataforseo|business profile|scraped data/.test(lower);
	}

	function enhanceEnqueueDemo(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) generatingDemo = true;
		return async ({
			result
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
					const d = result.data as { alreadyQueued?: boolean };
					toastSuccess(
						d.alreadyQueued ? 'Demo already in progress' : 'Demo queued',
						d.alreadyQueued ? 'Creation is running. This page will update when ready.' : (prospect.companyName || prospect.email || prospect.id)
					);
					await invalidateAll();
					startDemoJobPolling();
				} else if (result.type === 'failure' && result.data) {
					const msg =
						result.data && typeof result.data === 'object' && 'message' in result.data
							? String((result.data as { message?: string }).message)
							: undefined;
					toastError('Queue demo', msg ?? 'Failed to queue.');
					await applyAction(result);
				}
			} finally {
				generatingDemo = false;
			}
		};
	}

	/** Poll process-demo-job until queue is empty or max attempts. */
	function startDemoJobPolling() {
		if (demoJobPollingActive) return;
		demoJobPollingActive = true;
		toastInfo('Demo', 'Processing demo job…');
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
				const body = await res.json().catch(() => ({}));
				if (body.processed && (body.status === 'done' || body.status === 'failed')) {
					await invalidateAll();
				}
				if (body.processed === false) {
					demoJobPollingActive = false;
					return;
				}
				setTimeout(run, 3000);
			} catch {
				setTimeout(run, 3000);
			}
		};
		setTimeout(run, 500);
	}

	$effect(() => {
		if (!browser) return;
		const s = demoJob?.status;
		if ((s === 'pending' || s === 'creating') && !demoJobPollingActive) startDemoJobPolling();
	});


	function ensureAupInput(formEl: HTMLFormElement) {
		let input = formEl.querySelector<HTMLInputElement>('input[name="aupConfirmed"]');
		if (!input) {
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'aupConfirmed';
			input.value = 'on';
			formEl.appendChild(input);
		} else {
			input.value = 'on';
		}
	}

	/** Submit send-demo form (use:enhance handles the request with correct SvelteKit behavior). */
	function submitSend() {
		if (!sendForm || sendingEmail) return;
		ensureAupInput(sendForm);
		sendForm.requestSubmit();
	}

	function enhanceAnalyze(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) analyzingBusiness = true;
		return async ({
			result
		}: {
			result: import('./$types').ActionResult;
			formData: FormData;
		}) => {
			try {
				if (result.type === 'success' && result.data && typeof result.data === 'object') {
					if ('queued' in result.data && result.data.queued) {
						toastSuccess(
							'Pulling insights in background',
							'You can leave this page. We’ll update when it’s done.'
						);
						await invalidateAll();
						startInsightsJobPolling();
					} else if ('analyzed' in result.data && result.data.analyzed) {
						toastSuccess('Analysis complete', prospect.companyName || prospect.email || prospect.id);
						await invalidateAll();
					}
				} else if (result.type === 'failure' && result.data?.message) {
					toastError('Analyze business', result.data.message);
					await applyAction(result);
				}
			} finally {
				analyzingBusiness = false;
			}
		};
	}

	function enhanceRegenerateGbpInsights(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) regeneratingGbpInsights = true;
		return async ({
			result
		}: {
			result: import('./$types').ActionResult;
			formData: FormData;
		}) => {
			try {
				if (result.type === 'success' && result.data && typeof result.data === 'object') {
					if ('queued' in result.data && result.data.queued) {
						const d = result.data as { alreadyQueued?: boolean };
						toastSuccess(
							d.alreadyQueued ? 'GBP job already in progress' : 'Regenerating GBP and insights',
							d.alreadyQueued ? 'Job is running. Page will update when done.' : 'Usually 1–2 minutes. Page will update when done.'
						);
						await invalidateAll();
						startGbpJobPolling();
					}
				} else if (result.type === 'failure' && result.data?.message) {
					toastError('Regenerate GBP and insights', result.data.message);
					await applyAction(result);
					regeneratingGbpInsights = false;
				}
			} finally {
				// Keep regeneratingGbpInsights true while polling; startGbpJobPolling will set it false when done
				if (result.type === 'failure') regeneratingGbpInsights = false;
			}
		};
	}

	/** Poll process-gbp-job until this prospect's job is done or failed (or queue empty). */
	function startGbpJobPolling() {
		if (gbpJobPollingActive) return;
		gbpJobPollingActive = true;
		toastInfo('GBP', 'Processing GBP and insights…');
		const prospectId = prospect.id;
		const maxAttempts = 80;
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
					body: JSON.stringify({ prospectId })
				});
				const body = await res.json().catch(() => ({}));
				if (body.processed && body.prospectId === prospectId) {
					gbpJobPollingActive = false;
					if (body.status === 'done') {
						toastSuccess('GBP and insights updated', body.companyName ?? prospectId);
						await invalidateAll();
					} else if (body.status === 'failed') {
						toastError('Regenerate GBP and insights', body.errorMessage ?? 'Job failed');
						await invalidateAll();
					}
					regeneratingGbpInsights = false;
					return;
				}
				if (body.currentJob && body.currentJob.prospectId === prospectId) {
					gbpJobPollingActive = false;
					if (body.currentJob.status === 'done') {
						toastSuccess('GBP and insights updated', body.currentJob.companyName ?? prospectId);
						await invalidateAll();
					} else if (body.currentJob.status === 'failed') {
						toastError('Regenerate GBP and insights', body.currentJob.errorMessage ?? 'Job failed');
						await invalidateAll();
					}
					regeneratingGbpInsights = false;
					return;
				}
				tick().then(() => setTimeout(run, 3000));
			} catch {
				tick().then(() => setTimeout(run, 3000));
			}
		};
		tick().then(() => setTimeout(run, 500));
	}

	/** Poll process-insights-job until this prospect's job is done or failed (or queue empty). User can navigate away; polling stops. Sends prospectId so the API can return currentJob when status is already done/failed (e.g. another tab processed it). */
	function startInsightsJobPolling() {
		if (insightsJobPollingActive) return;
		insightsJobPollingActive = true;
		toastInfo('Insights', 'Processing insights job…');
		const prospectId = prospect.id;
		const maxAttempts = 80;
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
					body: JSON.stringify({ prospectId })
				});
				const body = await res.json().catch(() => ({}));
				// Completed by this request
				if (body.processed && body.prospectId === prospectId) {
					insightsJobPollingActive = false;
					if (body.status === 'done') {
						toastSuccess('Insights ready', body.companyName ?? prospectId);
						await invalidateAll();
					} else if (body.status === 'failed') {
						toastError('Pull insights', body.errorMessage ?? 'Analysis failed');
						await invalidateAll();
					}
					return;
				}
				// Already done/failed (e.g. another tab or earlier request processed it) — update status and stop polling
				if (body.currentJob && body.currentJob.prospectId === prospectId) {
					insightsJobPollingActive = false;
					if (body.currentJob.status === 'done') {
						toastSuccess('Insights ready', body.currentJob.companyName ?? prospectId);
						await invalidateAll();
					} else if (body.currentJob.status === 'failed') {
						toastError('Pull insights', body.currentJob.errorMessage ?? 'Analysis failed');
						await invalidateAll();
					}
					return;
				}
				tick().then(() => setTimeout(run, 3000));
			} catch {
				tick().then(() => setTimeout(run, 3000));
			}
		};
		tick().then(() => setTimeout(run, 500));
	}

	/** Submit alternate-offer form (use:enhance handles the request with correct SvelteKit behavior). */
	function submitSendAlternate() {
		if (!sendAlternateForm || sendingEmail) return;
		ensureAupInput(sendAlternateForm);
		sendAlternateForm.requestSubmit();
	}
</script>

<svelte:head>
	<title>{prospect.companyName} · Prospect · Dashboard</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-10">
	<!-- Header: who + one primary action -->
	<header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
		<div class="space-y-1.5 min-w-0">
			<Button variant="ghost" size="sm" class="-ml-2 text-muted-foreground hover:text-foreground" href={backHref}>
				<ArrowLeft class="size-4 mr-1.5" aria-hidden="true" />
				{backHref === '/dashboard/demos' ? 'Demos' : 'Prospects'}
			</Button>
			<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<h1 class="text-2xl font-semibold tracking-tight truncate">{prospect.companyName}</h1>
				<Badge variant={badgeVariant()} class="shrink-0 font-normal">{statusLabel()}</Badge>
			</div>
		</div>
		<!-- Primary CTA: the one thing to do next -->
		{#if primaryAction?.type === 'analyze'}
			<form method="POST" action="?/analyzeBusiness" use:enhance={enhanceAnalyze} class="shrink-0">
				<input type="hidden" name="prospectId" value={prospect.id} />
				<Button type="submit" size="lg" disabled={analyzingBusiness || insightsJobActive}>
					{#if analyzingBusiness || insightsJobActive}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
					{analyzingBusiness || insightsJobActive ? 'Pulling insights…' : 'Pull insights'}
				</Button>
			</form>
		{:else if primaryAction?.type === 'sendAlternateOffer'}
			<div class="shrink-0">
				<form
					bind:this={sendAlternateForm}
					method="POST"
					action="?/sendAlternateOffer"
					use:enhance={() => {
						sendingEmail = true;
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									toastSuccess('Email sent', prospect.companyName || prospect.email);
									await invalidateAll();
								} else if (result.type === 'failure') {
									toastError('Send email', result.data?.message ?? 'Something went wrong. Try again or connect Gmail in Integrations.');
									await applyAction(result);
								}
							} finally {
								sendingEmail = false;
								sendAlternateConfirmOpen = false;
							}
						};
					}}
					class="inline"
				>
					<input type="hidden" name="prospectId" value={prospect.id} />
					<AlertDialog.Root bind:open={sendAlternateConfirmOpen}>
						<AlertDialog.Trigger
							type="button"
							class={cn(buttonVariants({ size: 'lg' }), 'inline-flex items-center justify-center')}
							onclick={() => (sendAlternateConfirmOpen = true)}
						>
							<Send class="size-4 mr-2" />
							Send email (AI agent, voice AI & SEO)
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send outreach email?</AlertDialog.Title>
								<AlertDialog.Description>
									An email about AI agent, voice AI, and SEO will be sent to {prospect.email}. No demo link will be included.
									<br><br>
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel disabled={sendingEmail}>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action type="button" disabled={sendingEmail} onclick={() => { submitSendAlternate(); }}>
									{#if sendingEmail}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
									{sendingEmail ? 'Sending…' : 'Send email'}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</form>
			</div>
		{:else if primaryAction?.type === 'generate'}
			<div class="flex flex-col gap-1 shrink-0">
				<form method="POST" action="?/enqueueDemo" use:enhance={enhanceEnqueueDemo} class="inline">
					<input type="hidden" name="prospectId" value={prospect.id} />
					<Button
						type="submit"
						size="lg"
						disabled={generatingDemo || atDemoLimit || demoJob?.status === 'pending' || demoJob?.status === 'creating' || (demoJob?.status === 'failed' && isGbpError(demoJob?.errorMessage))}
					>
						{#if generatingDemo}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
						{generatingDemo ? 'Queuing…' : demoJob?.status === 'pending' || demoJob?.status === 'creating' ? 'Generating…' : atDemoLimit ? 'Limit reached' : 'Generate demo page'}
					</Button>
				</form>
				<p class="text-sm text-muted-foreground">Usually takes 1–2 minutes.</p>
			</div>
		{:else if primaryAction?.type === 'review' && prospect.demoLink}
			<div class="flex flex-wrap items-center gap-2 shrink-0">
				<Button size="lg" href={prospect.demoLink} target="_blank" rel="noopener noreferrer">
					<Link2 class="size-4 mr-2" />
					Review demo page
				</Button>
				{#if !demoTracking || demoTracking.status === 'draft'}
					<form
						method="POST"
						action="?/approveDemo"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									approvedJustNow = true;
									toastSuccess('Demo approved', 'You can now send the email.');
									await invalidateAll();
								} else if (result.type === 'failure' && result.data?.message) {
									toastError('Approve demo', result.data.message);
									await applyAction(result);
								}
							};
						}}
						class="inline"
					>
						<input type="hidden" name="prospectId" value={prospect.id} />
						<Button type="submit" size="lg">
							<Check class="size-4 mr-2" />
							Approve demo
						</Button>
					</form>
				{/if}
				<form
					method="POST"
					action="?/regenerateDemo"
					use:enhance={(input) => {
						regeneratingDemo = true;
						const timeoutMs = 150_000; // 2.5 min fallback so spinner never sticks
						const t = setTimeout(() => {
							regeneratingDemo = false;
						}, timeoutMs);
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									const d = result.data as { queued?: boolean; alreadyQueued?: boolean };
									if (d.queued) {
										toastSuccess(
											d.alreadyQueued ? 'Demo already in progress' : 'Regeneration queued',
											d.alreadyQueued ? 'Regeneration is running. Page will update when ready.' : 'Usually 1–2 minutes. Page will update when ready.'
										);
										await invalidateAll();
										startDemoJobPolling();
									} else {
										toastSuccess('Demo regenerated', 'Content and images updated. Refresh the demo page to see changes.');
										await invalidateAll();
									}
								} else if (result.type === 'failure' && result.data?.message) {
									toastError('Regenerate demo', result.data.message);
									await applyAction(result);
								}
							} finally {
								clearTimeout(t);
								regeneratingDemo = false;
							}
						};
					}}
					class="inline"
				>
					<input type="hidden" name="prospectId" value={prospect.id} />
					<Button
						type="submit"
						variant="outline"
						size="lg"
						disabled={regeneratingDemo || demoJob?.status === 'pending' || demoJob?.status === 'creating'}
						title={demoJob?.status === 'pending' || demoJob?.status === 'creating' ? 'Demo is being created; wait before regenerating' : 'Regenerate demo (can take 1–2 minutes)'}
					>
						{#if regeneratingDemo}
							<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />
						{/if}
						{regeneratingDemo ? 'Regenerating…' : 'Regenerate'}
					</Button>
				</form>
			</div>
		{:else if isApprovedForSend}
			<div class="shrink-0">
				<form
					bind:this={sendForm}
					method="POST"
					action="?/sendDemos"
					use:enhance={() => {
						sendingEmail = true;
						return async ({ result }) => {
							try {
								if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
									toastSuccess('Email sent', prospect.companyName || prospect.email);
									await invalidateAll();
								} else if (result.type === 'failure') {
									toastError('Send email', result.data?.message ?? 'Something went wrong. Try again or connect Gmail in Integrations.');
									await applyAction(result);
								}
							} finally {
								sendingEmail = false;
								sendConfirmOpen = false;
							}
						};
					}}
					class="inline"
				>
					<input type="hidden" name="prospectId" value={prospect.id} />
					<AlertDialog.Root bind:open={sendConfirmOpen}>
						<AlertDialog.Trigger
							type="button"
							class={cn(buttonVariants({ size: 'lg' }), 'inline-flex items-center justify-center')}
							disabled={!canSend || !(prospect.email ?? '').trim()}
							title={
								!(prospect.email ?? '').trim()
									? 'Add an email for this prospect to send'
									: !canSend
										? 'Connect Gmail in Integrations to send email'
										: ''
							}
							onclick={() => (sendConfirmOpen = true)}
						>
							<Send class="size-4 mr-2" />
							Send by email
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send demo to this client?</AlertDialog.Title>
								<AlertDialog.Description>
									An email with the demo link will be sent to {prospect.email || '(no email set)'}.
									<br><br>
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel disabled={sendingEmail}>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action type="button" disabled={sendingEmail} onclick={() => { submitSend(); }}>
									{#if sendingEmail}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
									{sendingEmail ? 'Sending…' : 'Send email'}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</form>
			</div>
		{/if}
	</header>

	<Separator />

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
		<!-- Main: About, Insights, Website grading -->
		<div class="space-y-6 lg:col-span-2">
			<!-- About: contact + GBP in one card -->
			<Card.Root>
				<Card.Header>
					<Card.Title>About</Card.Title>
					<Card.Description>Contact and listing details</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
						{#if prospect.industry?.trim()}
							<div class="flex gap-3">
								<Briefcase class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</dt><dd class="text-sm mt-0.5">{prospect.industry.trim()}</dd></div>
							</div>
						{/if}
						<div class="flex gap-3">
							<Mail class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
							<div class="min-w-0 flex-1">
								<dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</dt>
								{#if editingEmail || !(prospect.email ?? '').trim()}
									<form
										method="POST"
										action="?/updateEmail"
										use:enhance={() => {
											updatingEmail = true;
											return async ({ result }) => {
												try {
													if (result.type === 'success') {
														editingEmail = false;
														toastSuccess('Email saved');
														await invalidateAll();
													} else if (result.type === 'failure' && result.data?.message) {
														toastError('Update email', result.data.message);
														await applyAction(result);
													}
												} finally {
													updatingEmail = false;
												}
											};
										}}
										class="mt-1 flex flex-wrap items-center gap-2"
									>
										<input type="hidden" name="prospectId" value={prospect.id} />
										<Input
											type="email"
											name="email"
											value={prospect.email ?? ''}
											placeholder="e.g. contact@company.com"
											class="h-9 max-w-xs"
											disabled={updatingEmail}
										/>
										<Button type="submit" size="sm" disabled={updatingEmail}>
											{#if updatingEmail}<LoaderCircle class="size-4 mr-1.5 animate-spin" aria-hidden="true" />{/if}
											{(prospect.email ?? '').trim() ? 'Save' : 'Add email'}
										</Button>
										{#if (prospect.email ?? '').trim()}
											<Button type="button" variant="ghost" size="sm" onclick={() => editingEmail = false} disabled={updatingEmail}>Cancel</Button>
										{/if}
									</form>
								{:else}
									<dd class="text-sm mt-0.5 flex items-center gap-2">
										<a href="mailto:{prospect.email}" class="text-primary hover:underline break-all">{prospect.email}</a>
										<Button type="button" variant="ghost" size="sm" class="h-7 text-muted-foreground" onclick={() => editingEmail = true}>Edit</Button>
									</dd>
								{/if}
							</div>
						</div>
						{#if prospect.website}
							<div class="flex gap-3">
								<Globe class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</dt><dd class="text-sm mt-0.5"><a href={prospect.website} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">{prospect.website}</a></dd></div>
							</div>
						{/if}
						{#if prospect.phone}
							<div class="flex gap-3">
								<Phone class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</dt><dd class="text-sm mt-0.5"><a href="tel:{prospect.phone}" class="text-primary hover:underline">{prospect.phone}</a></dd></div>
							</div>
						{/if}
						{#if prospect.address || prospect.city}
							<div class="flex gap-3 sm:col-span-2">
								<MapPin class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</dt><dd class="text-sm mt-0.5">{prospect.address ?? ''}{prospect.address && prospect.city ? ', ' : ''}{prospect.city ?? ''}</dd></div>
							</div>
						{/if}
					</dl>
					{#if gbpAudit && (gbpAudit.gbpCompletenessScore != null || gbpAudit.googleRatingValue != null || (gbpAudit.googleReviewCount ?? 0) > 0)}
						<Separator />
						<div class="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
							{#if gbpAudit.gbpCompletenessScore != null || gbpAudit.gbpCompletenessLabel}
								<div><span class="text-muted-foreground">Completeness</span> {gbpAudit.gbpCompletenessLabel ?? (gbpAudit.gbpCompletenessScore != null ? `${gbpAudit.gbpCompletenessScore}%` : '—')}</div>
							{/if}
							{#if gbpAudit.googleRatingValue != null}
								<div class="flex items-center gap-1.5"><Star class="size-4 fill-amber-400 text-amber-500" /><span class="text-muted-foreground">Rating</span> {gbpAudit.googleRatingValue}</div>
							{/if}
							{#if (gbpAudit.googleReviewCount ?? 0) > 0}
								<div><span class="text-muted-foreground">Reviews</span> {gbpAudit.googleReviewCount}</div>
							{/if}
						</div>
					{/if}
					{#if !prospect.email && !prospect.website && !prospect.phone && !prospect.address && !prospect.city && !prospect.industry?.trim() && !gbpAudit}
						<p class="text-sm text-muted-foreground">No contact or listing info yet.</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Insights: AI + GBP analysis; Pull insights button when empty, recommendation/summary when filled (incl. name-only for no online presence) -->
			{#if showInsightsAndDemo}
				<Card.Root>
					<Card.Header>
						<Card.Title>Insights</Card.Title>
						<Card.Description>
							{hasAnalysis
								? 'AI analysis using Google Business Profile'
								: 'Run AI + GBP analysis to see recommendation and next steps.'}
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#if !hasAnalysis}
							<form method="POST" action="?/analyzeBusiness" use:enhance={enhanceAnalyze} class="pt-1">
								<input type="hidden" name="prospectId" value={prospect.id} />
								<Button type="submit" size="lg" disabled={analyzingBusiness || insightsJobActive}>
									{#if analyzingBusiness || insightsJobActive}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
									{analyzingBusiness || insightsJobActive ? 'Pulling insights…' : 'Pull insights'}
								</Button>
							</form>
						{:else if insight}
							<!-- Recommendation: Website demo vs AI agent / voice AI / SEO -->
							<div class="rounded-lg border bg-muted/30 px-4 py-3 space-y-1">
								<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommendation</p>
								<p class="font-medium">
									{insight.needsWebsiteDemo === false
										? 'AI agent, voice AI & SEO'
										: 'Website demo'}
								</p>
								{#if insight.recommendationReason}
									<p class="text-sm text-muted-foreground">{insight.recommendationReason}</p>
								{/if}
							</div>
							{#if insight.summary}
								<div>
									<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
									<p class="text-sm">{insight.summary}</p>
								</div>
							{/if}
							{#if insight.recommendations?.length}
								<div>
									<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recommendations</p>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										{#each insight.recommendations as rec (rec)}
											<li>{rec}</li>
										{/each}
									</ul>
								</div>
							{/if}
							<form method="POST" action="?/regenerateGbpAndInsights" use:enhance={enhanceRegenerateGbpInsights} class="pt-2">
								<input type="hidden" name="prospectId" value={prospect.id} />
								<Button
									type="submit"
									variant="outline"
									size="sm"
									disabled={regeneratingGbpInsights || gbpJobActive}
									title="Re-fetch Google Business Profile and regenerate AI insight"
								>
									{#if regeneratingGbpInsights || gbpJobActive}
										<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />
									{/if}
									{regeneratingGbpInsights || gbpJobActive ? 'Regenerating…' : 'Regenerate GBP and insights'}
								</Button>
							</form>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Website: detailed grading (overall + UX, UI, SEO, benchmark) -->
			{#if gbpAudit?.insight && (gbpAudit.insight.grade != null && String(gbpAudit.insight.grade).trim() !== '' || (gbpAudit.insight.website && (gbpAudit.insight.website.ux != null || gbpAudit.insight.website.ui != null || gbpAudit.insight.website.seo != null || gbpAudit.insight.website.benchmark != null)))}
				<Card.Root>
					<Card.Header>
						<Card.Title>Website grading</Card.Title>
						<Card.Description>Detailed breakdown: overall grade, UX, UI, SEO, and benchmark</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<!-- Overall: grade + benchmark -->
						{#if gbpAudit.insight.grade != null && String(gbpAudit.insight.grade).trim() !== '' || (gbpAudit.insight.website && (gbpAudit.insight.website.benchmark === 'modern' || gbpAudit.insight.website.benchmark === 'outdated'))}
							<div class="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
								{#if gbpAudit.insight.grade != null && String(gbpAudit.insight.grade).trim() !== ''}
									<div>
										<span class="text-muted-foreground text-xs">Overall grade</span>
										<p class="font-semibold text-lg tabular-nums">{gbpAudit.insight.grade}</p>
									</div>
								{/if}
								{#if gbpAudit.insight.website?.benchmark === 'modern' || gbpAudit.insight.website?.benchmark === 'outdated'}
									<div class="flex items-center gap-2">
										<span class="text-muted-foreground text-xs">Benchmark</span>
										<Badge variant={gbpAudit.insight.website.benchmark === 'modern' ? 'default' : 'secondary'} class="capitalize">
											{gbpAudit.insight.website.benchmark}
										</Badge>
									</div>
								{/if}
							</div>
						{/if}
						<!-- Detailed: UX, UI, SEO -->
						{#if gbpAudit.insight.website && (gbpAudit.insight.website.ux != null || gbpAudit.insight.website.ui != null || gbpAudit.insight.website.seo != null)}
							<div>
								<p class="text-muted-foreground text-xs font-medium mb-2">By dimension</p>
								<div class="grid gap-x-6 gap-y-3 sm:grid-cols-3 text-sm">
									{#if gbpAudit.insight.website.ux != null && gbpAudit.insight.website.ux !== ''}
										<div>
											<span class="text-muted-foreground">UX</span>
											<p class="font-medium mt-0.5">{gbpAudit.insight.website.ux}</p>
										</div>
									{/if}
									{#if gbpAudit.insight.website.ui != null && gbpAudit.insight.website.ui !== ''}
										<div>
											<span class="text-muted-foreground">UI</span>
											<p class="font-medium mt-0.5">{gbpAudit.insight.website.ui}</p>
										</div>
									{/if}
									{#if gbpAudit.insight.website.seo != null && gbpAudit.insight.website.seo !== ''}
										<div>
											<span class="text-muted-foreground">SEO</span>
											<p class="font-medium mt-0.5">{gbpAudit.insight.website.seo}</p>
										</div>
									{/if}
								</div>
							</div>
						{/if}
						{#if gbpAudit.insight.summary != null && String(gbpAudit.insight.summary).trim() !== ''}
							<div>
								<span class="text-muted-foreground text-xs">Summary</span>
								<p class="text-sm mt-0.5">{gbpAudit.insight.summary}</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Sidebar: Outreach then Remove -->
		<aside class="space-y-6">
			<!-- Outreach: demo + pipeline -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Outreach</Card.Title>
					<Card.Description>Demo page and pipeline</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					{#if demoJob?.status === 'pending' || demoJob?.status === 'creating'}
						<div class="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
							<LoaderCircle class="size-5 shrink-0 animate-spin text-muted-foreground" />
							<div>
								<p class="text-sm font-medium">{demoJob?.status === 'creating' ? 'Processing Demo' : 'Demo Queued'}</p>
								<p class="text-xs text-muted-foreground">Usually ready in under a minute.</p>
							</div>
						</div>
					{:else if prospect.flagged && !showInsightsAndDemo}
						<div class="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
							<p class="font-medium text-amber-800 dark:text-amber-200">Out of scope</p>
							<p class="mt-1 text-muted-foreground">Demos and send are not available for this client.</p>
						</div>
					{:else if !prospect.demoLink}
						{#if hasAnalysis && insight?.needsWebsiteDemo === false}
							<p class="text-sm text-muted-foreground">We recommend outreach about AI agent, voice AI & SEO instead of a website demo. Use the button above to send an email.</p>
						{:else}
							{#if demoJob?.status === 'failed'}
								<div class="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-4 space-y-1">
									<p class="font-medium">
										{isGbpError(demoJob.errorMessage)
											? 'Google Business Profile not found or not working. Fix the listing to try again.'
											: 'Demo creation failed. You can try again from the button above.'}
									</p>
									{#if demoJob.errorMessage && !isGbpError(demoJob.errorMessage)}
										<p class="text-xs text-muted-foreground break-words">{demoJob.errorMessage}</p>
									{/if}
								</div>
							{/if}
							<p class="text-sm text-muted-foreground">Generate a demo page above to get a shareable link and track outreach.</p>
						{/if}
					{:else}
						<!-- Demo link + share -->
						{@const demoUrl = prospect.demoLink ?? ''}
						<div class="space-y-3">
							<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Share demo</p>
							<div class="flex rounded-md border border-input bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
								<input
									type="text"
									readonly
									value={demoUrl}
									aria-label="Demo URL"
									class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-default"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="shrink-0 rounded-none border-l border-input h-auto size-9"
									onclick={copyLink}
									aria-label={copied ? 'Copied' : 'Copy link'}
								>
									<Copy class="size-4" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="shrink-0 rounded-none border-l border-input h-auto size-9"
									href={demoUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Open in new tab"
								>
									<ExternalLink class="size-4" />
								</Button>
							</div>
						</div>

						{#if demoTracking}
							<form method="POST" action="?/updateDemoStatus" use:enhance={() => async ({ result }) => {
								if (result.type === 'success') { toastSuccess('Status updated'); await invalidateAll(); }
								else if (result.type === 'failure' && result.data?.message) { toastError('Update status', result.data.message); await applyAction(result); }
							}} class="flex w-full items-center gap-2 pt-1">
								<input type="hidden" name="prospectId" value={prospect.id} />
								<input type="hidden" name="status" value={demoStatus} />
								<div class="min-w-0 flex-1">
									<p class="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</p>
									<Select.Root type="single" bind:value={demoStatus}>
										<Select.Trigger class="h-9 w-full" id="demo-status" aria-label="Stage">{(DEMO_TRACKING_OPTIONS.find((o) => o.value === demoStatus)?.label ?? demoStatus) || 'Stage'}</Select.Trigger>
										<Select.Content>
											{#each DEMO_TRACKING_OPTIONS as opt (opt.value)}<Select.Item value={opt.value}>{opt.label}</Select.Item>{/each}
										</Select.Content>
									</Select.Root>
								</div>
								<Button type="submit" variant="secondary" size="sm" class="shrink-0 mt-6">Update</Button>
							</form>
						{/if}

						<!-- Prospect history: what happened -->
						{#if prospectEvents.length > 0}
							<Separator />
							<div class="space-y-4">
								<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prospect history</p>
								<ul class="space-y-2 min-w-0">
									{#each prospectEvents as event}
										<li class="flex items-start gap-2 text-sm">
											<span class="mt-1 inline-block size-1.5 rounded-full bg-muted-foreground/60" aria-hidden="true"></span>
											<div class="min-w-0">
												<p class="font-medium break-words">{event.label}</p>
												{#if event.at}<p class="text-xs text-muted-foreground">{formatDate(event.at)}</p>{/if}
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Remove client -->
			<Card.Root class="border-destructive/20">
				<Card.Header>
					<Card.Title class="text-destructive">Remove client</Card.Title>
					<Card.Description>Permanently remove from your list. Cannot be undone.</Card.Description>
				</Card.Header>
				<Card.Content>
					<AlertDialog.Root bind:open={deleteDialogOpen}>
						<Button
							type="button"
							variant="destructive"
							class="w-full sm:w-auto"
							onclick={() => (deleteDialogOpen = true)}
						>
							<Trash2 class="size-4 mr-2" />
							Remove client
						</Button>
						<AlertDialog.Content>
							<form
								method="POST"
								action="?/deleteProspect"
								use:enhance={() => async ({ result }) => {
									if (result.type === 'success') {
										deleteDialogOpen = false;
										toastSuccess('Prospect removed', prospect.companyName || prospect.email);
										goto(backHref);
									} else if (result.type === 'failure' && result.data?.message) {
										toastError('Remove prospect', result.data.message);
										await applyAction(result);
									}
								}}
							>
								<input type="hidden" name="prospectId" value={prospect.id} />
								<AlertDialog.Header>
									<AlertDialog.Title>Remove prospect</AlertDialog.Title>
									<AlertDialog.Description>
										Remove this prospect from the list? This cannot be undone.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
									<AlertDialog.Action
										type="submit"
										class={buttonVariants({ variant: 'destructive' })}
									>
										Remove
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</form>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</Card.Content>
			</Card.Root>
		</aside>
	</div>
</div>
