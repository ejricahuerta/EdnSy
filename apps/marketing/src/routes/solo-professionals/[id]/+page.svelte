<script lang="ts">
	import SoloProfessionalsLanding from '$lib/templates/SoloProfessionalsLanding.svelte';
	import LowDataView from '$lib/components/demo/LowDataView.svelte';
	import { soloProfessionalsDemoContent } from '$lib/content/solo-professionals';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl, senderName, audit, lowData, lowDataReason } = data;
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

{#if lowData}
	<LowDataView reason={lowDataReason} />
{:else if data.customDemoHtml}
	<div class="demo-custom-html" data-custom-demo>{@html data.customDemoHtml}</div>
{:else}
	<SoloProfessionalsLanding
		companyName={prospect.companyName}
		website={prospect.website}
		address={prospect.address}
		city={prospect.city}
		industrySlug="solo-professionals"
		{senderName}
		{audit}
		prospectId={prospect.id}
		dataConfidenceScore={data.dataConfidenceScore}
	/>
{/if}
