<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toastFromActionResult } from '$lib/toast';
	import { AlertCircle, Mail, CheckCircle, ChevronRight } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();

	let senderName = $state(data.emailSenderName ?? '');
	let emailSignatureOverride = $state(data.emailSignatureOverride ?? '');

	$effect(() => {
		senderName = data.emailSenderName ?? '';
		emailSignatureOverride = data.emailSignatureOverride ?? '';
	});
</script>

<svelte:head>
	<title>Email · Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Emails</h1>
		<p class="text-muted-foreground mt-1">
			Configure what emails your users receive and how they are sent.
		</p>
	</div>

	<form
		id="sender-name-form"
		method="POST"
		action="?/saveEmailSenderName"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('Sender name', result, 'Sender name saved.');
			};
		}}
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Sender name (default delivery)</Card.Title>
				<Card.Description>
					This name appears in the email body as the sign-off and as the From name when using default delivery. Leave empty to use your account email prefix or "Ed & Sy Admin".
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2 max-w-md">
					<Label for="sender-name">Sender name</Label>
					<Input
						id="sender-name"
						name="senderName"
						type="text"
						placeholder="e.g. Ed or Ed & Sy Admin"
						bind:value={senderName}
					/>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<form
		id="signature-form"
		method="POST"
		action="?/saveEmailSignature"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('Email signature', result, 'Signature saved.');
			};
		}}
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Email signature (AI-generated emails)</Card.Title>
				<Card.Description>
					Override the sign-off line for outreach emails. Leave empty for default: - [Sender name] | ednsy.com. Use
					<code class="rounded bg-muted px-1">&#123;&#123;senderName&#125;&#125;</code>
					to insert your sender name.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2 max-w-md">
					<Label for="email-signature">Signature line</Label>
					<Input
						id="email-signature"
						name="emailSignature"
						type="text"
						placeholder="e.g. - {{senderName}} | ednsy.com"
						bind:value={emailSignatureOverride}
					/>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<Card.Root>
		<Card.Content class="pt-6">
			<div class="space-y-8">
			<!-- Outreach: each row is an email HTML template -->
			<div class="space-y-4">
				<h2 class="text-base font-semibold">Outreach</h2>
				<p class="text-sm text-muted-foreground">
					Email templates used when sending personalized demo links to prospects. Each template is HTML; placeholders are replaced at send time.
				</p>
				<ul class="divide-y rounded-lg border bg-card">
					<li>
						<div class="flex items-center justify-between gap-4 px-4 py-3">
							<div class="min-w-0 flex-1">
								<p class="font-medium">Default cold email</p>
								<p class="text-sm text-muted-foreground">
									Pre-written cold email with demo link. Used when you don't set a custom template.
								</p>
							</div>
							<span class="text-muted-foreground text-xs shrink-0">Built-in</span>
						</div>
					</li>
					<li>
						<a
							href="/dashboard/settings/email/templates/custom"
							class="flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
						>
							<div class="min-w-0 flex-1">
								<p class="font-medium">Custom email template</p>
								<p class="text-sm text-muted-foreground">
									Your custom HTML body. Use {data.emailPlaceholders}. Legal footer and tracking are appended automatically.
								</p>
							</div>
							<div class="flex items-center gap-1 shrink-0">
								{#if data.hasCustomEmailTemplate}
									<span class="text-xs text-muted-foreground">Configured</span>
								{/if}
								<ChevronRight class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							</div>
						</a>
					</li>
				</ul>
			</div>

			<!-- Email delivery: Gmail only -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Mail class="h-5 w-5" aria-hidden="true" />
						Email delivery
					</Card.Title>
					<Card.Description>
						Outreach emails are sent via your connected <a href="/dashboard/integrations" class="underline hover:no-underline">Gmail</a>.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<p class="text-sm text-muted-foreground">
						Connect <a href="/dashboard/integrations" class="underline hover:no-underline">Gmail</a> in Integrations to send from your own address. Add your Gmail as a test user in Google Cloud Console if the app is in testing mode.
					</p>
				</Card.Content>
			</Card.Root>
			</div>
		</Card.Content>
	</Card.Root>
</div>
