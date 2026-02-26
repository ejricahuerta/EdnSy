<script lang="ts">
	import RealEstateLanding from '$lib/templates/RealEstateLanding.svelte';
	import { realEstateDemoContent } from '$lib/content/realEstate';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const prospect = $derived(data.prospect);
	const content = $derived(data.content ?? realEstateDemoContent);
	const canonicalUrl = $derived(data.canonicalUrl);
	const title = $derived(
		prospect.companyName
			? `${prospect.companyName} | ${content.hero.tagline}`
			: `Real estate demo | ${content.hero.tagline}`
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

<RealEstateLanding prospect={prospect} content={content} />
