<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { LoaderCircle } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form?: import('./$types').ActionFailure<{ message: string }> }>();
	const prospects = $derived(data.prospects);
	const message = $derived(form?.message);
	let showDemoCreated = $state(false);
	let generatingDemoFor = $state<string | null>(null);

	function enhanceGenerateDemo(input: FormData | { formData: FormData }) {
		const formData = input instanceof FormData ? input : input?.formData;
		const prospectId = formData?.get('prospectId');
		if (prospectId && typeof prospectId === 'string') {
			generatingDemoFor = prospectId;
		}
		return async ({ result }: { result: import('./$types').ActionResult }) => {
			try {
				if (result.type === 'success' && result.data && 'success' in result.data && result.data.success) {
					showDemoCreated = true;
					await invalidateAll();
					setTimeout(() => (showDemoCreated = false), 5000);
				} else {
					await applyAction(result);
				}
			} finally {
				generatingDemoFor = null;
			}
		};
	}
</script>

<div class="rounded-lg bg-base-100 p-4 shadow">
	<h1 class="text-2xl font-bold mb-4">Prospects</h1>
	{#if showDemoCreated}
		<p class="alert alert-success mb-4 text-sm">Demo link created and saved to Notion.</p>
	{/if}
	{#if message}
		<p class="alert alert-error mb-4 text-sm">{message}</p>
	{/if}
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>Company</th>
					<th>Email</th>
					<th>Website</th>
					<th>Industry</th>
					<th>Status</th>
					<th>Demo link</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each prospects as p}
					<tr>
						<td class="font-medium">{p.companyName}</td>
						<td>{p.email}</td>
						<td>
							{#if p.website}
								<a href={p.website} target="_blank" rel="noopener noreferrer" class="link link-primary link-hover">
									{p.website}
								</a>
							{:else}
								-
							{/if}
						</td>
						<td><span class="badge badge-ghost">{p.industry}</span></td>
						<td>
							<span
								class="badge {p.status === 'Demo Created'
									? 'badge-success'
									: p.status === 'Generate Demo'
										? 'badge-warning'
										: 'badge-ghost'}"
							>
								{p.status}
							</span>
						</td>
						<td>
							{#if p.demoLink}
								<a href={p.demoLink} target="_blank" rel="noopener noreferrer" class="link link-primary link-hover text-sm">
									View demo
								</a>
							{:else}
								-
							{/if}
						</td>
						<td>
							{#if p.demoLink}
								<span class="text-base-content/60 text-sm">—</span>
							{:else}
								<form
									method="POST"
									action="?/generateDemo"
									class="inline"
									use:enhance={enhanceGenerateDemo}
								>
									<input type="hidden" name="prospectId" value={p.id} />
									<button
										type="submit"
										class="btn btn-primary btn-sm"
										disabled={generatingDemoFor !== null}
									>
										{#if generatingDemoFor === p.id}
											<LoaderCircle class="size-4 animate-spin shrink-0" />
											<span>Creating…</span>
										{:else}
											Generate demo
										{/if}
									</button>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if prospects.length === 0}
		<p class="text-base-content/70 py-6">No prospects yet. Add rows in your Notion database.</p>
	{/if}
</div>
