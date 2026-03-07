<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { toastFromActionResult } from '$lib/toast';

	let { data } = $props<{ data: PageData }>();
	const industries = $derived(data.industries ?? []);
	const initialFilter = $derived(data.crmIndustryFilter ?? []);
	let gbpDefaultLocation = $state(data.gbpDefaultLocation ?? '');
	let checkedBySlug = $state<Record<string, boolean>>(
		Object.fromEntries((data.industries ?? []).map((i) => [i.slug, (data.crmIndustryFilter ?? []).includes(i.slug)]))
	);

	$effect(() => {
		const filter = initialFilter;
		const ind = industries;
		if (ind.length === 0) return;
		checkedBySlug = Object.fromEntries(ind.map((i) => [i.slug, filter.includes(i.slug)]));
	});

	const selected = $derived(Object.entries(checkedBySlug).filter(([, v]) => v).map(([k]) => k));
	const selectedSet = $derived(new Set(selected));
	const selectAll = $derived(selectedSet.size === industries.length && industries.length > 0);
	const selectNone = $derived(selectedSet.size === 0);
</script>

<svelte:head>
	<title>Settings · Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">General</h1>
		<p class="text-muted-foreground">Default location and CRM list preferences.</p>
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
		<Card.Root class="border-0 bg-card shadow-none">
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

	<form
		method="POST"
		action="?/saveCrmIndustryFilter"
		use:enhance={() => {
			return async ({ result }) => {
				toastFromActionResult('CRM industry filter', result, 'Filter saved.');
			};
		}}
	>
		<Card.Root class="border-0 bg-card shadow-none">
			<Card.Header>
				<Card.Title>CRM industry filter</Card.Title>
				<Card.Description>
					Choose which industries appear in your CRM list on the dashboard. Leave all selected to show
					everyone; uncheck industries to hide them from the list.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#each selected as s (s)}
					<input type="hidden" name="industry" value={s} />
				{/each}
				<div class="flex flex-wrap gap-x-6 gap-y-3">
					{#each industries as { slug, label }}
						<div class="flex items-center space-x-2">
							<Checkbox
								id="industry-{slug}"
								bind:checked={checkedBySlug[slug]}
							/>
							<Label for="industry-{slug}" class="text-sm font-normal cursor-pointer">{label}</Label>
						</div>
					{/each}
				</div>
				<p class="text-xs text-muted-foreground">
					{#if selectNone}
						No industries selected: all prospects will be shown.
					{:else if selectAll}
						All industries selected: all prospects will be shown.
					{:else}
						{selectedSet.size} of {industries.length} industries selected; only those will appear in the
						CRM list.
					{/if}
				</p>
			</Card.Content>
			<Card.Footer>
				<Button type="submit">Save</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
