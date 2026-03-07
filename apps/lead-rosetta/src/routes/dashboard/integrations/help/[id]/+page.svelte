<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>{data.title} · Integrations · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="sm" href="/dashboard/integrations">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to integrations
		</Button>
	</div>
	<Card.Root class="border-0 bg-[var(--surface)]">
		<Card.Header>
			<Card.Title>{data.title}</Card.Title>
			<Card.Description>Step-by-step setup guide</Card.Description>
		</Card.Header>
		<Card.Content>
			<article class="prose prose-sm max-w-none dark:prose-invert">
				<div class="help-doc-content font-sans text-sm leading-relaxed [&_a]:underline [&_a:hover]:no-underline [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1:first-child]:mt-0 [&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-1">
					{@html data.content}
				</div>
			</article>
		</Card.Content>
	</Card.Root>
</div>
