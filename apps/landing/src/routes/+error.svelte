<script lang="ts">
	export let error;
	export let status;
</script>

<svelte:head>
	<title>{status} | Not found</title>
</svelte:head>

<div class="h-screen flex flex-col items-center justify-center bg-background text-foreground">
	<h1 class="text-7xl font-bold mb-4">{status}</h1>
	<p class="text-2xl mb-2">{error?.message ?? 'Page not found'}</p>
	<a href="/" rel="noopener" aria-label="Go to homepage" class="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
		Go home
	</a>
</div> 