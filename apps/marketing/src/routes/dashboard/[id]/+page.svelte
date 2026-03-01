<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { getStatusDisplay } from '$lib/statusDisplay';
	import type { PageData } from './$types';
	import { ArrowLeft, ExternalLink, Mail, MessageSquare, Copy, Link2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { toast, showFormToast } from '$lib/toast';
	import { cn } from '$lib/utils';

	let { data, form } = $props<{
		data: PageData;
		form?: import('./$types').ActionFailure<{ message: string }>;
	}>();
	const prospect = $derived(data.prospect);
	let generatingDemo = $state(false);
	let copied = $state(false);

	$effect(() => {
		showFormToast(form);
	});

	function enhanceGenerateDemo(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		if (formData) generatingDemo = true;
		return async ({ result }: { result: import('./$types').ActionResult }) => {
			try {
				if (result.type === 'success' && result.data && typeof result.data === 'object' && 'success' in result.data && result.data.success) {
					toast.success('Demo created. Share the link below.');
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
		if (!prospect.demoLink) return;
		await navigator.clipboard.writeText(prospect.demoLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function statusLabel(): string {
		if (generatingDemo) return 'Building…';
		return getStatusDisplay(prospect.status).label;
	}

	function badgeVariant(): 'default' | 'secondary' | 'outline' {
		if (generatingDemo) return 'secondary';
		const v = getStatusDisplay(prospect.status).variant;
		if (v === 'success') return 'default';
		if (v === 'warning') return 'secondary';
		return 'outline';
	}
</script>

<svelte:head>
	<title>{prospect.companyName} — Dashboard — Lead Rosetta</title>
</svelte:head>

<div class="lr-dash-page max-w-2xl mx-auto">
	<a href="/dashboard" class="inline-flex items-center gap-2 text-sm font-medium text-[var(--sage)] hover:text-[var(--sage-light)] mb-6">
		<ArrowLeft class="size-4" aria-hidden="true" />
		Back to clients
	</a>

	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header class="pb-2">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<Card.Title class="font-semibold text-foreground text-xl">{prospect.companyName}</Card.Title>
				<Badge
					variant={badgeVariant()}
					class={cn(
						badgeVariant() === 'secondary' && 'bg-[rgba(193,125,42,0.12)] text-[var(--amber)] border-[var(--amber)]/25',
						badgeVariant() === 'outline' && 'bg-muted text-muted-foreground border-border'
					)}
				>
					{statusLabel()}
				</Badge>
			</div>
			{#if prospect.industry}
				<Card.Description class="text-muted-foreground">{prospect.industry}</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if prospect.email}
				<div>
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</p>
					<a href="mailto:{prospect.email}" class="text-[var(--sage)] hover:underline">{prospect.email}</a>
				</div>
			{/if}
			{#if prospect.website}
				<div>
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Website</p>
					<a
						href={prospect.website}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 text-[var(--sage)] hover:underline"
					>
						{prospect.website}
						<ExternalLink class="size-3.5 shrink-0" aria-hidden="true" />
					</a>
				</div>
			{/if}
			{#if prospect.phone}
				<div>
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
					<a href="tel:{prospect.phone}" class="text-[var(--sage)] hover:underline">{prospect.phone}</a>
				</div>
			{/if}
			{#if prospect.address || prospect.city}
				<div>
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Address</p>
					<p class="text-foreground">
						{#if prospect.address}{prospect.address}{/if}
						{#if prospect.address && prospect.city}, {/if}
						{#if prospect.city}{prospect.city}{/if}
					</p>
				</div>
			{/if}

			<hr class="border-border" />

			<div>
				<p class="text-xs font-medium text-foreground uppercase tracking-wider mb-2">Personalized demo</p>
				{#if generatingDemo}
					<p class="text-sm text-muted-foreground animate-pulse">Building demo…</p>
				{:else if prospect.demoLink}
					<div class="flex flex-wrap items-center gap-2">
						<a
							href={prospect.demoLink}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 text-[var(--sage)] hover:underline font-medium"
						>
							<Link2 class="size-4 shrink-0" aria-hidden="true" />
							Preview demo
						</a>
						<Button variant="ghost" size="sm" onclick={copyLink}>
							<Copy class="size-4 mr-1" aria-hidden="true" />
							{copied ? 'Copied' : 'Copy link'}
						</Button>
						<a
							href="mailto:{prospect.email}?subject={encodeURIComponent('Your demo')}&body={encodeURIComponent('Hi,\n\nHere\'s your personalized demo: ' + prospect.demoLink)}"
							class="inline-flex"
						>
							<Button variant="ghost" size="sm">
								<Mail class="size-4 mr-1" aria-hidden="true" />
								Email
							</Button>
						</a>
						<a href="sms:?body={encodeURIComponent('Your demo: ' + prospect.demoLink)}" class="inline-flex">
							<Button variant="ghost" size="sm">
								<MessageSquare class="size-4 mr-1" aria-hidden="true" />
								SMS
							</Button>
						</a>
					</div>
					<p class="mt-2 text-xs text-muted-foreground break-all">{prospect.demoLink}</p>
				{:else}
					<form method="POST" action="?/generateDemo" use:enhance={enhanceGenerateDemo}>
						<input type="hidden" name="prospectId" value={prospect.id} />
						<Button
							type="submit"
							disabled={generatingDemo}
							class="lr-dash-cta-create-demo bg-[var(--amber)] text-white hover:bg-[var(--amber-light)]"
						>
							{generatingDemo ? 'Building…' : 'Create demo'}
						</Button>
					</form>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
