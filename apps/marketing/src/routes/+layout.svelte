<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { getThemeForPath, INDUSTRY_SLUGS } from '$lib/industries';
	let { children } = $props();
	const theme = $derived(getThemeForPath($page.url.pathname));
	const pathSegments = $derived($page.url.pathname.split('/').filter(Boolean));
	const isDemoRoute = $derived(
		pathSegments.length >= 2 && (INDUSTRY_SLUGS as readonly string[]).includes(pathSegments[0])
	);
</script>

<div class="min-h-screen bg-base-200" data-theme={theme}>
	{#if isDemoRoute}
		{@render children()}
	{:else}
		<nav class="navbar bg-base-100 shadow-lg">
			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-xl">EdnSy Marketing</a>
			</div>
			<div class="flex-none gap-2">
				<a href="/prospects" class="btn btn-ghost btn-sm">Prospects</a>
			</div>
		</nav>
		<main class="container mx-auto p-4">
			{@render children()}
		</main>
	{/if}
</div>
