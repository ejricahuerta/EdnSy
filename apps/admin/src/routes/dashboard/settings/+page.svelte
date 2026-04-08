<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toastFromActionResult } from '$lib/toast';

	let { data } = $props<{ data: PageData }>();
	let gbpDefaultLocation = $state('');

	$effect.pre(() => {
		gbpDefaultLocation = data.gbpDefaultLocation ?? '';
	});
</script>

<svelte:head>
	<title>Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">General</h1>
		<p class="text-muted-foreground">Default location for business lookup.</p>
	</div>

	<form
		method="POST"
		action="?/saveGbpDefaultLocation"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('Default location (GBP)', result, 'Location saved.');
			};
		}}
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Default location for business lookup (GBP)</Card.Title>
				<Card.Description>
					Used when looking up Google Business Profile data for prospects that don't have a city. Format: City,Region,Country (e.g. Toronto,Ontario,Canada). Leave empty to use the server default.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="gbp-location">Location</Label>
					<Input
						id="gbp-location"
						name="location"
						type="text"
						placeholder="e.g. Toronto,Ontario,Canada"
						bind:value={gbpDefaultLocation}
						class="max-w-md"
					/>
				</div>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
