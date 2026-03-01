<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';

	let { data } = $props<{ data: PageData }>();

	let demoHtml = $state(data.templates.demoHtml);
	let emailHtml = $state(data.templates.emailHtml);

	$effect(() => {
		demoHtml = data.templates.demoHtml;
		emailHtml = data.templates.emailHtml;
	});

	function handleDemoResult(result: { demoSaved?: boolean; demoError?: string }) {
		if (result?.demoSaved) toast.success('Demo template saved.');
		if (result?.demoError) toast.error(result.demoError);
	}

	function handleEmailResult(result: { emailSaved?: boolean; emailError?: string }) {
		if (result?.emailSaved) toast.success('Email template saved.');
		if (result?.emailError) toast.error(result.emailError);
	}
</script>

<svelte:head>
	<title>Templates · Dashboard</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Templates</h1>
		<p class="text-muted-foreground">
			Edit the HTML used for demo pages and outreach emails. Leave empty to use defaults.
		</p>
	</div>

	<!-- Demo HTML template -->
	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header>
			<Card.Title>Demo page HTML</Card.Title>
			<Card.Description>
				Custom HTML rendered on demo pages when set. When empty, the default industry template is used.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<p class="text-xs text-muted-foreground">
				Placeholders: {data.placeholders.demo.join(', ')}
			</p>
			<form
				method="POST"
				action="?/saveDemo"
				use:enhance={() => {
					return async ({ result }) => {
						handleDemoResult(result as { demoSaved?: boolean; demoError?: string });
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="demoHtml">HTML</Label>
					<textarea
						id="demoHtml"
						name="demoHtml"
						rows="14"
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-32 w-full min-w-0 rounded-md border px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="<section>...</section>"
						bind:value={demoHtml}
					></textarea>
				</div>
				<Button type="submit">Save demo template</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Email HTML template -->
	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header>
			<Card.Title>Email HTML</Card.Title>
			<Card.Description>
				Custom email body when set. Legal footer and tracking pixel are appended automatically. Use
				<code class="rounded bg-muted px-1 text-xs">{{trackableLink}}</code>
				for the click-tracked link.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<p class="text-xs text-muted-foreground">
				Placeholders: {data.placeholders.email.join(', ')}
			</p>
			<form
				method="POST"
				action="?/saveEmail"
				use:enhance={() => {
					return async ({ result }) => {
						handleEmailResult(result as { emailSaved?: boolean; emailError?: string });
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="emailHtml">HTML</Label>
					<textarea
						id="emailHtml"
						name="emailHtml"
						rows="14"
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-32 w-full min-w-0 rounded-md border px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="<p>Hi from {{companyName}},</p>..."
						bind:value={emailHtml}
					></textarea>
				</div>
				<Button type="submit">Save email template</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
