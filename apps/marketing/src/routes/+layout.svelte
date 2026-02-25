<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { getThemeForPath, INDUSTRY_SLUGS } from '$lib/industries';
	let { data, children } = $props();
	const theme = $derived(getThemeForPath($page.url.pathname) ?? 'dark');
	const pathSegments = $derived($page.url.pathname.split('/').filter(Boolean));
	const isDemoRoute = $derived(
		pathSegments.length >= 2 && (INDUSTRY_SLUGS as readonly string[]).includes(pathSegments[0])
	);
	const user = $derived(data?.user ?? null);
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
				{#if user}
					<span class="text-sm text-base-content/80 max-w-[180px] truncate" title={user.email}>{user.email}</span>
					<a href="/auth/logout" class="btn btn-ghost btn-sm">Sign out</a>
				{:else}
					<a href="/auth/login" class="btn btn-ghost btn-sm">Sign in</a>
				{/if}
			</div>
		</nav>
		<main class="container mx-auto p-4">
			{@render children()}
		</main>
	{/if}
</div>
