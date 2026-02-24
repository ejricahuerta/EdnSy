<script lang="ts">
	import SalonsLanding from '$lib/templates/SalonsLanding.svelte';
	import { salonsDemoContent } from '$lib/content/salons';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${salonsDemoContent.hero.tagline}`
		: `Salon demo | ${salonsDemoContent.hero.tagline}`;
	const description = salonsDemoContent.hero.subtext;
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

<SalonsLanding companyName={prospect.companyName} website={prospect.website} address={prospect.address} city={prospect.city} />
