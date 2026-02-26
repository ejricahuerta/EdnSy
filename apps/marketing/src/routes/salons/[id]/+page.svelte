<script lang="ts">
	import SalonsLanding from '$lib/templates/SalonsLanding.svelte';
	import { salonsDemoContent } from '$lib/content/salons';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const prospect = $derived(data.prospect);
	const content = $derived(data.content ?? salonsDemoContent);
	const canonicalUrl = $derived(data.canonicalUrl);
	const title = $derived(
		prospect.companyName
			? `${prospect.companyName} | ${content.hero.tagline}`
			: `Salon demo | ${content.hero.tagline}`
	);
	const description = $derived(content.hero.subtext);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
</svelte:head>

<SalonsLanding prospect={prospect} content={content} />
