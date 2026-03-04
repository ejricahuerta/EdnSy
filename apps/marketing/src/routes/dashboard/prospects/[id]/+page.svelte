<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { getStatusDisplay } from '$lib/statusDisplay';
	import { DEMO_TRACKING_OPTIONS, type DemoTrackingStatus, auditFromScrapedData } from '$lib/demo';
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
		MessageSquare,
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
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { toastSuccess, toastError } from '$lib/toast';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';

	let { data }: { data: PageData; form?: import('./$types').ActionFailure<{ message: string }> } =
		$props();

	const prospect = $derived(data.prospect);
	const demoTracking = $derived(data.demoTracking);
	const scrapedData = $derived(data.scrapedData ?? null);
	const demoJob = $derived(data.demoJob);
	const insightsJob = $derived(data.insightsJob ?? null);
	const insightsJobActive = $derived(!!insightsJob);
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
	let demoJobPollingActive = $state(false);
	let insightsJobPollingActive = $state(false);
	let deleteDialogOpen = $state(false);
	let sendConfirmOpen = $state(false);
	let sendAlternateConfirmOpen = $state(false);
	let sendForm: HTMLFormElement | null = $state(null);
	let sendAlternateForm: HTMLFormElement | null = $state(null);

	let demoStatus = $state<DemoTrackingStatus>(() =>
		(demoTracking?.status as DemoTrackingStatus) ?? 'draft'
	);
	$effect(() => {
		const s = demoTracking?.status as DemoTrackingStatus | undefined;
		if (s && DEMO_TRACKING_OPTIONS.some((o) => o.value === s)) demoStatus = s;
	});

	$effect(() => {
		if (insightsJob && !insightsJobPollingActive) startInsightsJobPolling();
	});

	type HistoryEntry = { key: string; label: string; at: string | null; done: boolean };
	const historyEntries = $derived.by((): HistoryEntry[] => {
		const entries: HistoryEntry[] = [];
		entries.push({
			key: 'synced',
			label: 'Synced',
			at: prospect.createdAt ?? null,
			done: true
		});
		if (demoTracking) {
			if (prospect.demoLink) {
				entries.push(
					{ key: 'demo_created', label: 'Demo created', at: demoTracking.created_at ?? null, done: true }
				);
			}
			entries.push(
				{
					key: 'draft',
					label: 'Draft',
					at: null,
					done: ['draft', 'approved', 'sent', 'opened', 'clicked', 'replied'].includes(demoTracking.status)
				},
				{
					key: 'approved',
					label: 'Approved',
					at: null,
					done: ['approved', 'sent', 'opened', 'clicked', 'replied'].includes(demoTracking.status)
				},
				{
					key: 'sent',
					label: 'Sent',
					at: demoTracking.send_time ?? null,
					done: ['sent', 'opened', 'clicked', 'replied'].includes(demoTracking.status)
				},
				{
					key: 'opened',
					label: 'Opened',
					at: demoTracking.opened_at ?? null,
					done: ['opened', 'clicked', 'replied'].includes(demoTracking.status)
				},
				{
					key: 'clicked',
					label: 'Clicked',
					at: demoTracking.clicked_at ?? null,
					done: ['clicked', 'replied'].includes(demoTracking.status)
				},
				{
					key: 'replied',
					label: 'Replied',
					at: demoTracking.status === 'replied' ? demoTracking.updated_at : null,
					done: demoTracking.status === 'replied'
				}
			);
		}
		return entries;
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
		// Only show Generate demo after insights have been pulled
		if (hasAnalysis && !prospect.demoLink)
			return demoJob?.status === 'failed' && isGbpError(demoJob?.errorMessage) ? null : { type: 'generate' };
		if (demoTracking?.status === 'approved' && canSend && prospect.email?.trim()) return { type: 'send' };
		if (demoTracking?.status === 'draft' || demoTracking?.status === 'approved') return { type: 'review' };
		return null;
	});

	/** Short label for failed demo badge (avoids long error text in header). */
	function failedDemoBadgeLabel(): string {
		return isGbpError(demoJob?.errorMessage) ? 'GBP not working' : 'Demo failed';
	}

	function statusLabel(): string {
		if (demoJob?.status === 'pending') return 'Queued';
		if (demoJob?.status === 'creating') return 'Creating…';
		if (demoJob?.status === 'failed') return failedDemoBadgeLabel();
		if (demoTracking?.status) {
			if (demoTracking.status === 'sent' && demoTracking.send_time) {
				try {
					const d = new Date(demoTracking.send_time);
					return `Sent ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
				} catch {
					return 'Sent';
				}
			}
			if (demoTracking.status === 'opened' && demoTracking.opened_at) return 'Opened';
			if (demoTracking.status === 'clicked' && demoTracking.clicked_at) return 'Clicked';
			return demoTracking.status.charAt(0).toUpperCase() + demoTracking.status.slice(1);
		}
		return getStatusDisplay(prospect.status).label;
	}

	function badgeVariant(): 'default' | 'secondary' | 'outline' | 'destructive' {
		if (demoJob?.status === 'pending' || demoJob?.status === 'creating') return 'secondary';
		if (demoJob?.status === 'failed') return 'destructive';
		if (demoTracking?.status) {
			return ['sent', 'opened', 'clicked', 'replied'].includes(demoTracking.status)
				? 'default'
				: demoTracking.status === 'approved'
					? 'secondary'
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

	function submitSend() {
		sendConfirmOpen = false;
		if (sendForm) {
			ensureAupInput(sendForm);
			sendForm.requestSubmit();
		}
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

	/** Poll process-insights-job until this prospect's job is done or failed (or queue empty). User can navigate away; polling stops. Sends prospectId so the API can return currentJob when status is already done/failed (e.g. another tab processed it). */
	function startInsightsJobPolling() {
		if (insightsJobPollingActive) return;
		insightsJobPollingActive = true;
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

	function submitSendAlternate() {
		sendAlternateConfirmOpen = false;
		if (sendAlternateForm) {
			ensureAupInput(sendAlternateForm);
			sendAlternateForm.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>{prospect.companyName} · Prospect · Dashboard</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-10">
	<!-- Header: who + one primary action -->
	<header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
		<div class="space-y-1.5 min-w-0">
			<Button variant="ghost" size="sm" class="-ml-2 text-muted-foreground hover:text-foreground" onclick={() => goto('/dashboard/prospects')}>
				<ArrowLeft class="size-4 mr-1.5" aria-hidden="true" />
				Prospects
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
				<form bind:this={sendAlternateForm} method="POST" action="?/sendAlternateOffer" use:enhance={() => async ({ result }) => {
					if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
						toastSuccess('Email sent', prospect.companyName || prospect.email);
						await invalidateAll();
					} else if (result.type === 'failure' && result.data?.message) {
						toastError('Send email', result.data.message);
						await applyAction(result);
					}
				}} class="inline">
					<input type="hidden" name="prospectId" value={prospect.id} />
					{#if aupConfirmed}<input type="hidden" name="aupConfirmed" value="on" />{/if}
					<AlertDialog.Root bind:open={sendAlternateConfirmOpen}>
						<AlertDialog.Trigger asChild>
							{#snippet trigger({ props })}
								<Button type="button" size="lg" builders={[props]}>
									<Send class="size-4 mr-2" />
									Send email (AI agent, voice AI & SEO)
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send outreach email?</AlertDialog.Title>
								<AlertDialog.Description>
									An email about AI agent, voice AI, and SEO will be sent to {prospect.email}. No demo link will be included.
									<br /><br />
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action onclick={() => { aupConfirmed = true; submitSendAlternate(); }}>Send email</AlertDialog.Action>
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
									toastSuccess('Demo regenerated', 'Content and images updated. Refresh the demo page to see changes.');
									await invalidateAll();
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
		{:else if primaryAction?.type === 'send' && prospect.demoLink}
			<div class="shrink-0">
				<form bind:this={sendForm} method="POST" action="?/sendDemos" use:enhance={() => async ({ result }) => {
					if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
						toastSuccess('Email sent', prospect.companyName || prospect.email);
						await invalidateAll();
					} else if (result.type === 'failure' && result.data?.message) {
						toastError('Send email', result.data.message);
						await applyAction(result);
					}
				}} class="inline">
					<input type="hidden" name="prospectId" value={prospect.id} />
					{#if aupConfirmed}<input type="hidden" name="aupConfirmed" value="on" />{/if}
					<AlertDialog.Root bind:open={sendConfirmOpen}>
						<AlertDialog.Trigger asChild>
							{#snippet trigger({ props })}
								<Button type="button" size="lg" builders={[props]}>
									<Send class="size-4 mr-2" />
									Send by email
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send demo to this client?</AlertDialog.Title>
								<AlertDialog.Description>
									An email with the demo link will be sent to {prospect.email}.
									<br /><br />
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action onclick={() => { aupConfirmed = true; submitSend(); }}>Send email</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</form>
			</div>
		{/if}
	</header>

	<Separator />

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
		<!-- Main: single scroll - About then Outreach -->
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
						{#if prospect.email}
							<div class="flex gap-3">
								<Mail class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</dt><dd class="text-sm mt-0.5"><a href="mailto:{prospect.email}" class="text-primary hover:underline break-all">{prospect.email}</a></dd></div>
							</div>
						{/if}
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

			<!-- Outreach: demo + pipeline in one card -->
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
								<p class="text-sm font-medium">{demoJob?.status === 'creating' ? 'Generating demo…' : 'In queue'}</p>
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
						<div class="space-y-2">
							<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo link</p>
							<div class="flex flex-wrap items-center gap-2">
								<Button variant="outline" size="sm" href={prospect.demoLink} target="_blank" rel="noopener noreferrer"><Link2 class="size-4 mr-2" />Open</Button>
								<Button variant="outline" size="sm" onclick={copyLink}><Copy class="size-4 mr-2" />{copied ? 'Copied' : 'Copy link'}</Button>
								<Button variant="outline" size="sm" href="sms:?body={encodeURIComponent('Your demo: ' + prospect.demoLink)}"><MessageSquare class="size-4 mr-2" />SMS</Button>
							</div>
							<p class="text-xs text-muted-foreground break-all font-mono bg-muted/50 rounded px-2 py-1.5">{prospect.demoLink}</p>
						</div>

						<!-- Pipeline: timeline + update status -->
						{#if demoTracking}
							<Separator />
							<div class="space-y-4">
								<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline</p>
								<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
									<ul class="relative space-y-0 min-w-0 flex-1">
										{#each historyEntries as entry, i}
											<li class="relative flex gap-3 pb-4 last:pb-0">
												{#if i < historyEntries.length - 1}
													<span class="absolute left-[7px] top-5 bottom-0 w-px bg-border" aria-hidden="true"></span>
												{/if}
												<span class={cn('relative z-10 flex size-4 shrink-0 items-center justify-center rounded-full mt-0.5', entry.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
													{#if entry.done}<Check class="size-2.5" strokeWidth={3} />{:else}<Circle class="size-2.5" />{/if}
												</span>
												<div class="min-w-0">
													<p class="text-sm font-medium">{entry.label}</p>
													{#if entry.at}<p class="text-xs text-muted-foreground">{formatDate(entry.at)}</p>{/if}
												</div>
											</li>
										{/each}
									</ul>
									<form method="POST" action="?/updateDemoStatus" use:enhance={() => async ({ result }) => {
										if (result.type === 'success') { toastSuccess('Status updated'); await invalidateAll(); }
										else if (result.type === 'failure' && result.data?.message) { toastError('Update status', result.data.message); await applyAction(result); }
									}} class="flex flex-wrap items-center gap-2 shrink-0">
										<input type="hidden" name="prospectId" value={prospect.id} />
										<input type="hidden" name="status" value={demoStatus} />
										<Select.Root type="single" bind:value={demoStatus}>
											<Select.Trigger class="w-[160px] h-9" id="demo-status" aria-label="Stage">{(DEMO_TRACKING_OPTIONS.find((o) => o.value === demoStatus)?.label ?? demoStatus) || 'Stage'}</Select.Trigger>
											<Select.Content>
												{#each DEMO_TRACKING_OPTIONS as opt (opt.value)}<Select.Item value={opt.value}>{opt.label}</Select.Item>{/each}
											</Select.Content>
										</Select.Root>
										<Button type="submit" variant="secondary" size="sm">Update</Button>
									</form>
								</div>
							</div>
						{/if}
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Sidebar: only Remove -->
		<aside>
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
										goto('/dashboard/prospects');
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
