<script lang="ts">
	import { tick } from 'svelte';
	import { applyAction, enhance } from '$app/forms';
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
		Send
	} from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';
	import { normalizeExternalHref } from '$lib/externalUrl';
	import { buttonVariants } from '$lib/components/ui/button';
	import { toastSuccess, toastError } from '$lib/toast';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { prospectJobLabelResolver } from '$lib/notificationHistory';
	import { DEV_OUTBOUND_EMAIL } from '$lib/constants';
	import { Switch } from '$lib/components/ui/switch';

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
	const prospectWebsiteHref = $derived(normalizeExternalHref(prospect.website));
	const prospectDemoHref = $derived(normalizeExternalHref(prospect.demoLink));
	const prospectDemoLinkRaw = $derived(prospect.demoLink ?? '');
	const demoTracking = $derived(data.demoTracking);
	const scrapedData = $derived(data.scrapedData ?? null);
	const demoJob = $derived(data.demoJob);
	const insightsJob = $derived(data.insightsJob ?? null);
	const insightsJobActive = $derived(!!insightsJob);
	const gbpJob = $derived(data.gbpJob ?? null);
	const gbpJobActive = $derived(!!gbpJob);
	const gmailConnected = $derived(data.sendConfigured ?? false);
	const canSend = $derived(data.canSend ?? false);
	const integrationsGmailHref = '/dashboard/integrations';
	const atDemoLimit = $derived(data.atDemoLimit ?? false);
	const showInsightsAndDemo = $derived(data.showInsightsAndDemo ?? !prospect.flagged);
	const gbpAudit = $derived(scrapedData ? auditFromScrapedData(scrapedData) : null);
	const insight = $derived(gbpAudit?.insight ?? null);
	/** When false, we recommend AI agent / voice AI / SEO email instead of a website demo. */
	const needsWebsiteDemo = $derived(insight?.needsWebsiteDemo !== false);
	const hasAnalysis = $derived(!!scrapedData && !!insight);

	/** One line for the notification bell (matches list page pipeline summary for this prospect). */
	const detailProcessingSummary = $derived.by(() => {
		const who = prospect.companyName || prospect.email || prospect.id;
		const parts: string[] = [];
		if (gbpJob) parts.push('GBP 1');
		if (insightsJob) parts.push('Insights 1');
		if (demoJob?.status === 'creating') parts.push(`Processing Demo: ${who}`);
		if (demoJob?.status === 'pending') parts.push('Demo Queued: 1');
		return parts.length > 0 ? parts.join(' · ') : '';
	});

	let copied = $state(false);
	let aupConfirmed = $state(false);
	let generatingDemo = $state(false);
	let regeneratingDemo = $state(false);
	let analyzingBusiness = $state(false);
	let regeneratingGbpInsights = $state(false);
	let deleteDialogOpen = $state(false);
	let outreachDialogOpen = $state(false);
	let currentOutreachKind = $state<'demo' | 'alternate'>('demo');
	let previewSubject = $state('');
	let previewHtml = $state('');
	let previewTo = $state('');
	let previewLoading = $state(false);
	let previewError = $state('');
	let previewFormEl = $state<HTMLFormElement | null>(null);
	/** Outreach dialog: switch between raw HTML and rendered preview */
	let outreachBodyView = $state<'source' | 'preview'>('source');
	let creatingDraft = $state(false);
	let sendingDraft = $state(false);
	let sendDraftConfirmOpen = $state(false);
	/** Set true after Approve demo succeeds so Send button appears immediately before refetch. */
	let approvedJustNow = $state(false);
	let editingEmail = $state(false);
	let updatingEmail = $state(false);
	/** Dev schema: reveal stored prospect email under the outbound redirect display. */
	let showRealProspectEmail = $state(false);

	const isDevSchema = $derived(data.supabaseDbSchema === 'dev');
	const hasProspectEmail = $derived(!!(prospect.email ?? '').trim());
	/** Address messages and send confirmations use this (dev → test@ednsy.com when a prospect email exists). */
	const outboundEmailTargetDisplay = $derived(
		isDevSchema && hasProspectEmail ? DEV_OUTBOUND_EMAIL : (prospect.email ?? '').trim() || '(no email set)'
	);

	const hasGmailOutreachDraft = $derived(!!(prospect.gmailOutreachDraftId ?? '').trim());
	const gmailDraftComposeUrl = $derived(
		hasGmailOutreachDraft
			? `https://mail.google.com/mail/u/0/#drafts?compose=${encodeURIComponent(prospect.gmailOutreachDraftId!.trim())}`
			: ''
	);

	async function openOutreachDialog(kind: 'demo' | 'alternate') {
		currentOutreachKind = kind;
		outreachBodyView = 'source';
		previewSubject = '';
		previewHtml = '';
		previewTo = '';
		previewError = '';
		outreachDialogOpen = true;
		await tick();
		previewFormEl?.requestSubmit();
	}

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
		const prospectId = data.prospect?.id ?? '';
		const prospectWho =
			data.prospect?.companyName || data.prospect?.email || prospectId || 'This client';
		prospectJobLabelResolver.set((pid) => (pid === prospectId ? prospectWho : pid.slice(0, 8)));
		return () => prospectJobLabelResolver.set((id) => id.slice(0, 8));
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
		const outreachTimeline = data.gmailOutreachEvents ?? [];
		for (const ev of outreachTimeline) {
			if (ev.event_type === 'gmail_outreach_draft_created') {
				pushEvent(`gmail_draft_${ev.created_at}`, 'Gmail outreach draft created', ev.created_at);
			} else if (ev.event_type === 'gmail_outreach_sent') {
				pushEvent(`gmail_sent_${ev.created_at}`, 'Outreach email sent from Gmail', ev.created_at);
			} else if (ev.event_type === 'gmail_outreach_draft_expired') {
				pushEvent(`gmail_expired_${ev.created_at}`, 'Draft expired (deleted or sent from Gmail)', ev.created_at);
			}
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
			demoTracking.status === 'email_draft' ||
			approvedJustNow ||
			demoStatus === 'approved' ||
			demoStatus === 'email_draft';
		if (isApproved) return { type: 'send' };
		if (demoTracking?.status === 'draft' || demoStatus === 'draft') return { type: 'review' };
		return null;
	});

	/** True when demo is approved (any source) or has demo but no tracking row (legacy). Used to show Send by email in header. */
	const isApprovedForSend = $derived(
		!!(prospect.demoLink ?? '').trim() &&
			(!demoTracking ||
				demoTracking.status === 'approved' ||
				demoTracking.status === 'email_draft' ||
				approvedJustNow ||
				demoStatus === 'approved' ||
				demoStatus === 'email_draft')
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
			if (demoTracking.status === 'email_draft') return getDemoTrackingLabel('email_draft');
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
				: demoTracking.status === 'approved' ||
					  demoTracking.status === 'email_draft' ||
					  demoTracking.status === 'draft'
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
					}
				} else if (result.type === 'failure' && result.data?.message) {
					toastError('Regenerate GBP and insights', result.data.message);
					await applyAction(result);
				}
			} finally {
				regeneratingGbpInsights = false;
			}
		};
	}

	const createGmailDraftFormId = $derived(`create-gmail-draft-${prospect.id}`);
	const sendGmailDraftFormId = $derived(`send-gmail-draft-${prospect.id}`);
	const regenerateDemoFormId = $derived(`regenerate-demo-${prospect.id}`);

	function enhancePreviewOutreach() {
		previewLoading = true;
		previewError = '';
		return async ({ result }: { result: import('$app/forms').ActionResult }) => {
			previewLoading = false;
			if (result.type === 'success' && result.data && typeof result.data === 'object') {
				const rec = result.data as Record<string, unknown>;
				if (rec.preview === true) {
					previewSubject = String(rec.subject ?? '');
					previewHtml = String(rec.html ?? '');
					previewTo = String(rec.toDisplay ?? '');
				}
			} else if (result.type === 'failure' && result.data?.message) {
				previewError = result.data.message;
				await applyAction(result);
			}
		};
	}

	function enhanceRegenerateDemo() {
		regeneratingDemo = true;
		const timeoutMs = 150_000;
		const t = setTimeout(() => {
			regeneratingDemo = false;
		}, timeoutMs);
		return async ({ result }: { result: import('$app/forms').ActionResult }) => {
			try {
				if (result.type === 'success' && result.data && typeof result.data === 'object') {
					const rec = result.data as Record<string, unknown>;
					if (rec.success === true) {
						if (rec.queued === true) {
							toastSuccess(
								rec.alreadyQueued === true ? 'Demo already in progress' : 'Regeneration queued',
								rec.alreadyQueued === true
									? 'Regeneration is running. Page will update when ready.'
									: 'Usually 1–2 minutes. Page will update when ready.'
							);
							await invalidateAll();
						} else {
							toastSuccess(
								'Demo regenerated',
								'Content and images updated. Refresh the demo page to see changes.'
							);
							await invalidateAll();
						}
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
	}
</script>

<svelte:head>
	<title>{prospect.companyName} · Prospect · Dashboard</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-10">
	<form
		bind:this={previewFormEl}
		class="hidden"
		aria-hidden="true"
		method="POST"
		action="?/previewOutreachEmail"
		use:enhance={enhancePreviewOutreach}
	>
		<input type="hidden" name="prospectId" value={prospect.id} />
		<input type="hidden" name="outreachKind" value={currentOutreachKind} />
		<button type="submit" tabindex="-1">preview</button>
	</form>

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
			<div
				class="flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-2 sm:flex-1"
			>
				{#if !gmailConnected}
					<Button size="lg" href={integrationsGmailHref}>
						<Mail class="size-4 mr-2" aria-hidden="true" />
						Connect Gmail
					</Button>
				{:else if hasGmailOutreachDraft}
					<Button
						type="button"
						size="lg"
						variant="secondary"
						disabled={!canSend || !(prospect.email ?? '').trim()}
						onclick={() => openOutreachDialog('alternate')}
					>
						Replace draft
					</Button>
					<Button size="lg" variant="outline" href={gmailDraftComposeUrl} target="_blank" rel="noopener noreferrer">
						<ExternalLink class="size-4 mr-2" />
						Open draft
					</Button>
					<form
						id={sendGmailDraftFormId}
						method="POST"
						action="?/sendGmailOutreachDraft"
						onsubmit={(e) => ensureAupInput(e.currentTarget)}
						class="inline"
						use:enhance={() => {
							sendingDraft = true;
							return async ({ result }) => {
								try {
									if (
										result.type === 'success' &&
										result.data &&
										typeof result.data === 'object' &&
										'success' in result.data &&
										result.data.success
									) {
										toastSuccess('Email sent', prospect.companyName || prospect.email);
										sendDraftConfirmOpen = false;
										await invalidateAll();
									} else if (result.type === 'failure') {
										toastError(
											'Send email',
											result.data?.message ??
												'Something went wrong. Reconnect Gmail in Integrations if needed.'
										);
										await applyAction(result);
									}
								} finally {
									sendingDraft = false;
								}
							};
						}}
					>
						<input type="hidden" name="prospectId" value={prospect.id} />
					</form>
					<AlertDialog.Root bind:open={sendDraftConfirmOpen}>
						<AlertDialog.Trigger
							type="button"
							class={cn(buttonVariants({ size: 'lg' }), 'inline-flex items-center justify-center')}
							disabled={!canSend}
							onclick={() => (sendDraftConfirmOpen = true)}
						>
							<Send class="size-4 mr-2" />
							Send email
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send this draft now?</AlertDialog.Title>
								<AlertDialog.Description>
									The message will be sent from your connected Gmail. This cannot be undone.
									{#if !canSend}
										<span class="mt-3 block text-destructive">Connect Gmail in Integrations first.</span>
									{/if}
									<br /><br />
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel disabled={sendingDraft}>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									type="submit"
									form={sendGmailDraftFormId}
									disabled={sendingDraft || !canSend}
								>
									{#if sendingDraft}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
									{sendingDraft ? 'Sending…' : 'Send email'}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{:else}
					<Button
						type="button"
						size="lg"
						disabled={!canSend || !(prospect.email ?? '').trim()}
						onclick={() => openOutreachDialog('alternate')}
					>
						<Send class="size-4 mr-2" />
						Create Gmail draft (AI agent, voice AI &amp; SEO)
					</Button>
				{/if}
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
				<ButtonGroup.Root aria-label="Demo page actions">
					<Button
						variant="outline"
						size="lg"
						href={prospectDemoHref ?? prospect.demoLink}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Link2 class="size-4 mr-2" />
						Review demo page
					</Button>
					<Button
						type="submit"
						form={regenerateDemoFormId}
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
				</ButtonGroup.Root>
				<form
					id={regenerateDemoFormId}
					class="hidden"
					method="POST"
					action="?/regenerateDemo"
					use:enhance={enhanceRegenerateDemo}
					aria-hidden="true"
				>
					<input type="hidden" name="prospectId" value={prospect.id} />
				</form>
				{#if !demoTracking || demoTracking.status === 'draft'}
					<form
						method="POST"
						action="?/approveDemo"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									approvedJustNow = true;
									toastSuccess('Demo approved', 'You can create a Gmail draft from the button above.');
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
			</div>
		{:else if isApprovedForSend}
			<div
				class="flex w-full min-w-0 flex-row flex-wrap items-center justify-end gap-2 sm:flex-1"
			>
				{#if !gmailConnected}
					<Button size="lg" href={integrationsGmailHref}>
						<Mail class="size-4 mr-2" aria-hidden="true" />
						Connect Gmail
					</Button>
				{:else if hasGmailOutreachDraft}
					<Button
						type="button"
						size="lg"
						variant="secondary"
						disabled={!canSend || !(prospect.email ?? '').trim()}
						title={!(prospect.email ?? '').trim() ? 'Add an email for this prospect' : ''}
						onclick={() => openOutreachDialog('demo')}
					>
						Replace draft
					</Button>
					<Button size="lg" variant="outline" href={gmailDraftComposeUrl} target="_blank" rel="noopener noreferrer">
						<ExternalLink class="size-4 mr-2" />
						Open draft
					</Button>
					<form
						id={sendGmailDraftFormId}
						method="POST"
						action="?/sendGmailOutreachDraft"
						onsubmit={(e) => ensureAupInput(e.currentTarget)}
						class="inline"
						use:enhance={() => {
							sendingDraft = true;
							return async ({ result }) => {
								try {
									if (
										result.type === 'success' &&
										result.data &&
										typeof result.data === 'object' &&
										'success' in result.data &&
										result.data.success
									) {
										toastSuccess('Email sent', prospect.companyName || prospect.email);
										sendDraftConfirmOpen = false;
										await invalidateAll();
									} else if (result.type === 'failure') {
										toastError(
											'Send email',
											result.data?.message ??
												'Something went wrong. Reconnect Gmail in Integrations if needed.'
										);
										await applyAction(result);
									}
								} finally {
									sendingDraft = false;
								}
							};
						}}
					>
						<input type="hidden" name="prospectId" value={prospect.id} />
					</form>
					<AlertDialog.Root bind:open={sendDraftConfirmOpen}>
						<AlertDialog.Trigger
							type="button"
							class={cn(buttonVariants({ size: 'lg' }), 'inline-flex items-center justify-center')}
							disabled={!canSend || !(prospect.email ?? '').trim()}
							title={!(prospect.email ?? '').trim() ? 'Add an email for this prospect' : ''}
							onclick={() => (sendDraftConfirmOpen = true)}
						>
							<Send class="size-4 mr-2" />
							Send email
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Send demo email now?</AlertDialog.Title>
								<AlertDialog.Description>
									The draft will be sent from your Gmail to {outboundEmailTargetDisplay}.
									{#if !canSend}
										<span class="mt-3 block text-destructive">
											Connect Gmail in Integrations first (reconnect to grant draft access if needed).
										</span>
									{/if}
									<br /><br />
									<strong>Sending means you accept the Acceptable Use Policy (AUP).</strong>
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel disabled={sendingDraft}>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									type="submit"
									form={sendGmailDraftFormId}
									disabled={sendingDraft || !canSend || !(prospect.email ?? '').trim()}
								>
									{#if sendingDraft}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
									{sendingDraft ? 'Sending…' : 'Send email'}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{:else}
					<Button
						type="button"
						size="lg"
						disabled={!canSend || !(prospect.email ?? '').trim()}
						title={!(prospect.email ?? '').trim() ? 'Add an email for this prospect' : ''}
						onclick={() => openOutreachDialog('demo')}
					>
						<Send class="size-4 mr-2" />
						Create Gmail draft
					</Button>
				{/if}
			</div>
		{/if}
	</header>

	<Dialog.Root bind:open={outreachDialogOpen}>
		<Dialog.Content
			class="max-w-[calc(100vw-2rem)] max-h-[min(90dvh,900px)] w-[min(100%,48rem)] flex min-h-0 flex-col gap-0 sm:max-w-3xl"
		>
			<Dialog.Header class="shrink-0 pr-6">
				<Dialog.Title>Review outreach email</Dialog.Title>
				<Dialog.Description>
					Edit the subject and body if you want; use Preview to see how it renders. Then create a draft in your Gmail. Reconnect Gmail in Integrations if draft creation fails (OAuth needs gmail.compose).
				</Dialog.Description>
			</Dialog.Header>
			<div
				class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden overscroll-contain pt-2 [scrollbar-gutter:stable]"
			>
				{#if previewLoading}
					<div class="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
						<LoaderCircle class="size-5 animate-spin" aria-hidden="true" />
						Building preview…
					</div>
				{:else if previewError}
					<p class="text-sm text-destructive">{previewError}</p>
				{:else if previewHtml}
					<p class="text-sm shrink-0">
						<span class="text-muted-foreground">To:</span>
						{previewTo}
					</p>
					<div class="space-y-2 shrink-0">
						<Label for="outreach-subject-{prospect.id}">Subject</Label>
						<Input
							id="outreach-subject-{prospect.id}"
							name="outreachSubject"
							form={createGmailDraftFormId}
							bind:value={previewSubject}
							autocomplete="off"
							class="w-full"
						/>
					</div>
					<div class="flex min-h-0 flex-col gap-2">
						<div class="flex shrink-0 items-center justify-between gap-3">
							<Label for="outreach-html-{prospect.id}" class="mb-0">Body</Label>
							<div
								class="inline-flex shrink-0 rounded-md border bg-muted/40 p-0.5"
								role="group"
								aria-label="Body source or preview"
							>
								<Button
									type="button"
									size="sm"
									variant={outreachBodyView === 'source' ? 'secondary' : 'ghost'}
									class="h-7 rounded-sm px-2.5 text-xs"
									aria-pressed={outreachBodyView === 'source'}
									onclick={() => (outreachBodyView = 'source')}
								>
									Source
								</Button>
								<Button
									type="button"
									size="sm"
									variant={outreachBodyView === 'preview' ? 'secondary' : 'ghost'}
									class="h-7 rounded-sm px-2.5 text-xs"
									aria-pressed={outreachBodyView === 'preview'}
									onclick={() => (outreachBodyView = 'preview')}
								>
									Preview
								</Button>
							</div>
						</div>
						<div class="pb-4">
							{#if outreachBodyView === 'source'}
								<Textarea
									id="outreach-html-{prospect.id}"
									name="outreachHtml"
									form={createGmailDraftFormId}
									bind:value={previewHtml}
									class="field-sizing-fixed box-border w-full min-h-[12rem] max-h-[min(42dvh,20rem)] font-mono text-xs leading-relaxed sm:min-h-[14rem] sm:max-h-[min(48dvh,24rem)] sm:text-sm md:max-h-[min(52dvh,28rem)] pb-4"
									spellcheck={false}
								/>
							{:else}
								<input type="hidden" name="outreachHtml" form={createGmailDraftFormId} value={previewHtml} />
								<iframe
									class="box-border block w-full min-h-[12rem] max-h-[min(42dvh,20rem)] rounded-md border border-border bg-background sm:min-h-[14rem] sm:max-h-[min(48dvh,24rem)] md:max-h-[min(52dvh,28rem)]"
									title="Email preview"
									srcdoc={previewHtml}
									sandbox="allow-same-origin"
								></iframe>
							{/if}
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground py-4">Open this dialog again to load a preview.</p>
				{/if}
			</div>
			<Dialog.Footer class="shrink-0 gap-2 sm:gap-2 flex-col sm:flex-row sm:justify-end">
				<Button type="button" variant="outline" onclick={() => (outreachDialogOpen = false)}>Cancel</Button>
				{#if !gmailConnected}
					<Button href={integrationsGmailHref}>
						<Mail class="size-4 mr-2" aria-hidden="true" />
						Connect Gmail
					</Button>
				{:else}
					<form
						id={createGmailDraftFormId}
						method="POST"
						action="?/createGmailOutreachDraft"
						onsubmit={(e) => ensureAupInput(e.currentTarget)}
						class="contents"
						use:enhance={() => {
							creatingDraft = true;
							return async ({ result }) => {
								creatingDraft = false;
								if (
									result.type === 'success' &&
									result.data &&
									typeof result.data === 'object' &&
									'success' in result.data &&
									result.data.success
								) {
									toastSuccess('Gmail draft created', prospect.companyName || prospect.email);
									outreachDialogOpen = false;
									await invalidateAll();
								} else if (result.type === 'failure' && result.data?.message) {
									toastError('Create draft', result.data.message);
									await applyAction(result);
								}
							};
						}}
					>
						<input type="hidden" name="prospectId" value={prospect.id} />
						<input type="hidden" name="outreachKind" value={currentOutreachKind} />
						<Button
							type="submit"
							disabled={creatingDraft ||
								previewLoading ||
								!!previewError ||
								!previewHtml ||
								!previewSubject.trim() ||
								!canSend}
						>
							{#if creatingDraft}<LoaderCircle class="size-4 mr-2 animate-spin" aria-hidden="true" />{/if}
							{creatingDraft ? 'Creating…' : 'Create draft in Gmail'}
						</Button>
					</form>
				{/if}
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

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
									<dd class="text-sm mt-0.5 space-y-2">
										{#if isDevSchema && hasProspectEmail}
											<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
												<a href="mailto:{DEV_OUTBOUND_EMAIL}" class="text-primary hover:underline break-all">{DEV_OUTBOUND_EMAIL}</a>
												<span class="text-xs text-muted-foreground">(outbound in dev)</span>
												<Button type="button" variant="ghost" size="sm" class="h-7 text-muted-foreground" onclick={() => editingEmail = true}>Edit</Button>
											</div>
											<div class="flex items-center gap-2">
												<Switch id="prospect-show-real-email" bind:checked={showRealProspectEmail} size="sm" />
												<Label for="prospect-show-real-email" class="text-xs font-normal text-muted-foreground cursor-pointer">Show prospect address</Label>
											</div>
											{#if showRealProspectEmail}
												<p class="text-xs text-muted-foreground break-all">
													Stored:
													<a href="mailto:{prospect.email}" class="text-primary hover:underline">{prospect.email}</a>
												</p>
											{/if}
										{:else}
											<div class="flex items-center gap-2">
												<a href="mailto:{prospect.email}" class="text-primary hover:underline break-all">{prospect.email}</a>
												<Button type="button" variant="ghost" size="sm" class="h-7 text-muted-foreground" onclick={() => editingEmail = true}>Edit</Button>
											</div>
										{/if}
									</dd>
								{/if}
							</div>
						</div>
						{#if prospect.website}
							<div class="flex gap-3">
								<Globe class="size-4 shrink-0 mt-0.5 text-muted-foreground" />
								<div><dt class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</dt><dd class="text-sm mt-0.5"><a href={prospectWebsiteHref ?? prospect.website} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">{prospect.website}</a></dd></div>
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
						<div class="space-y-3">
							<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Share demo</p>
							<div class="flex rounded-md border border-input bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
								<input
									type="text"
									readonly
									value={prospectDemoLinkRaw}
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
									href={normalizeExternalHref(prospectDemoLinkRaw) ?? prospectDemoLinkRaw}
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
