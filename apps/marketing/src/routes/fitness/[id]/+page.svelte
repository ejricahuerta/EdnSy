<script lang="ts">
	import FitnessLanding from '$lib/templates/FitnessLanding.svelte';
	import { fitnessDemoContent } from '$lib/content/fitness';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${fitnessDemoContent.hero.tagline}`
		: `Fitness demo | ${fitnessDemoContent.hero.tagline}`;
	const description = fitnessDemoContent.hero.subtext;
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

<FitnessLanding companyName={prospect.companyName} website={prospect.website} address={prospect.address} city={prospect.city} />
