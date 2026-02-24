<script lang="ts">
	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();
	const prospects = $derived(data.prospects);
</script>

<div class="rounded-lg bg-base-100 p-4 shadow">
	<h1 class="text-2xl font-bold mb-4">Prospects</h1>
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
							<button type="button" class="btn btn-primary btn-sm" disabled>Generate demo</button>
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
