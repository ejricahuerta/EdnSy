<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { toastFromActionResult } from '$lib/toast';
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();
	let emailHtml = $state(data.emailHtml ?? '');

	const placeholderExample =
		'<p>Hi {{companyName}},</p>\n<p>I built a demo for you: <a href="{{trackableLink}}">View your demo</a></p>\n<p>— {{senderName}}</p>';

	$effect(() => {
		emailHtml = data.emailHtml ?? '';
	});
</script>

<svelte:head>
	<title>Custom email template · Email · Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a
			href="/dashboard/settings/email?tab=templates"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
		>
			<ArrowLeft class="h-4 w-4" aria-hidden="true" />
			Back to Emails
		</a>
	</div>

	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Custom email template</h1>
		<p class="text-muted-foreground mt-1">
			Edit the HTML body for outreach emails. Legal footer and tracking pixel are appended automatically. Use the placeholders below.
		</p>
	</div>

	<form
		method="POST"
		action="?/default"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('Custom email template', result, 'Template saved.');
			};
		}}
		class="space-y-6"
	>
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header>
				<Card.Title>Email body HTML</Card.Title>
				<Card.Description>
					Placeholders: {data.placeholders.join(', ')}. Include <code class="rounded bg-muted px-1 py-0.5">{'{{trackableLink}}'}</code> for click tracking.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2">
					<Label for="email-html">HTML</Label>
					<textarea
						id="email-html"
						name="emailHtml"
						bind:value={emailHtml}
						rows="16"
						class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
						placeholder={placeholderExample}
					/>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save changes</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
