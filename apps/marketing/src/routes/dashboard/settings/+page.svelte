<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">App and notification preferences.</p>
	</div>

	<Card.Root class="border-0 bg-card shadow-none">
		<Card.Header>
			<Card.Title>Preferences</Card.Title>
			<Card.Description>Configure how you use Lead Rosetta.</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">Settings options can be added here.</p>
		</Card.Content>
	</Card.Root>
</div>
