<script lang="ts">
	import SoloProfessionalsLanding from '$lib/templates/SoloProfessionalsLanding.svelte';
	import { soloProfessionalsDemoContent } from '$lib/content/solo-professionals';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${soloProfessionalsDemoContent.hero.tagline}`
		: `Consulting demo | ${soloProfessionalsDemoContent.hero.tagline}`;
	const description = soloProfessionalsDemoContent.hero.subtext;
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

<SoloProfessionalsLanding companyName={prospect.companyName} website={prospect.website} address={prospect.address} city={prospect.city} />
