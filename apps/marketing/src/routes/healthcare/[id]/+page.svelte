<script lang="ts">
	import HealthcareLanding from '$lib/templates/HealthcareLanding.svelte';
	import { healthcareDemoContent } from '$lib/content/healthcare';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${healthcareDemoContent.hero.tagline}`
		: `Healthcare demo | ${healthcareDemoContent.hero.tagline}`;
	const description = healthcareDemoContent.hero.subtext;
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

<HealthcareLanding companyName={prospect.companyName} website={prospect.website} address={prospect.address} city={prospect.city} />
