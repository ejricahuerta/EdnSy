<script lang="ts">
	import LegalLanding from '$lib/templates/LegalLanding.svelte';
	import { legalDemoContent } from '$lib/content/legal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${legalDemoContent.hero.tagline}`
		: `Legal demo | ${legalDemoContent.hero.tagline}`;
	const description = legalDemoContent.hero.subtext;
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

<LegalLanding companyName={prospect.companyName} website={prospect.website} address={prospect.address} city={prospect.city} />
