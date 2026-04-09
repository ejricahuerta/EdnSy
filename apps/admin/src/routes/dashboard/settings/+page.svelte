<script lang="ts">
	import { dev } from '$app/environment';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toastFromActionResult } from '$lib/toast';
	import { LoaderCircle } from 'lucide-svelte';

	let { data } = $props<{ data: PageData }>();
	let gbpDefaultLocation = $state('');
	let resetDevDataDialogOpen = $state(false);
	let resetDevDataSubmitting = $state(false);

	const showDevResetCard = $derived(dev && data.supabaseDbSchema === 'dev');

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

	{#if showDevResetCard}
		<Card.Root class="border-destructive/50">
			<Card.Header>
				<Card.Title>Dev: reset prospects and jobs</Card.Title>
				<Card.Description>
					Removes every row in <code class="rounded bg-muted px-1 py-0.5 text-xs">apify_jobs</code>,
					<code class="rounded bg-muted px-1 py-0.5 text-xs">demo_jobs</code>,
					<code class="rounded bg-muted px-1 py-0.5 text-xs">gbp_jobs</code>,
					<code class="rounded bg-muted px-1 py-0.5 text-xs">insights_jobs</code>, and
					<code class="rounded bg-muted px-1 py-0.5 text-xs">prospects</code> in the
					<strong>dev</strong> PostgREST schema only. Related rows (for example stitch projects and demo leads)
					that reference prospects may be removed by the database. This cannot be undone.
				</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button type="button" variant="destructive" onclick={() => (resetDevDataDialogOpen = true)}>
					Reset data…
				</Button>
			</Card.Footer>
		</Card.Root>

		<form
			id="dev-reset-prospects-jobs-form"
			method="POST"
			action="?/resetDevProspectsAndJobs"
			class="hidden"
			use:enhance={() => {
				resetDevDataSubmitting = true;
				return async ({ result }) => {
					resetDevDataSubmitting = false;
					toastFromActionResult('Reset dev data', result, 'All prospects and job queues were cleared.');
					if (result.type === 'success') {
						resetDevDataDialogOpen = false;
					}
				};
			}}
		></form>

		<AlertDialog.Root bind:open={resetDevDataDialogOpen}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Delete all prospects and jobs?</AlertDialog.Title>
					<AlertDialog.Description>
						This runs only against the dev database schema. All prospects and queued jobs for this environment
						will be removed.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={resetDevDataSubmitting}>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action
						type="submit"
						form="dev-reset-prospects-jobs-form"
						disabled={resetDevDataSubmitting}
						class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{#if resetDevDataSubmitting}
							<LoaderCircle class="mr-2 size-4 animate-spin" aria-hidden="true" />
						{/if}
						{resetDevDataSubmitting ? 'Resetting…' : 'Reset now'}
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}
</div>
