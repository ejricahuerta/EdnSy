<script lang="ts">
	import RealEstateLanding from '$lib/templates/RealEstateLanding.svelte';
	import LowDataView from '$lib/components/demo/LowDataView.svelte';
	import { realEstateDemoContent } from '$lib/content/realEstate';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl, senderName, audit, lowData, lowDataReason } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${realEstateDemoContent.hero.tagline}`
		: `Real estate demo | ${realEstateDemoContent.hero.tagline}`;
	const description = realEstateDemoContent.hero.subtext;
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
	<RealEstateLanding
		companyName={prospect.companyName}
		website={prospect.website}
		address={prospect.address}
		city={prospect.city}
		industrySlug="real-estate"
		{senderName}
		{audit}
		prospectId={prospect.id}
		dataConfidenceScore={data.dataConfidenceScore}
	/>
{/if}
