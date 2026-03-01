<script lang="ts">
	import ConstructionLanding from '$lib/templates/ConstructionLanding.svelte';
	import LowDataView from '$lib/components/demo/LowDataView.svelte';
	import { constructionDemoContent } from '$lib/content/construction';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl, senderName, audit, lowData, lowDataReason } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${constructionDemoContent.hero.tagline}`
		: `Construction demo | ${constructionDemoContent.hero.tagline}`;
	const description = constructionDemoContent.hero.subtext;
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
	<ConstructionLanding
		companyName={prospect.companyName}
		website={prospect.website}
		address={prospect.address}
		city={prospect.city}
		industrySlug="construction"
		{senderName}
		{audit}
		prospectId={prospect.id}
		dataConfidenceScore={data.dataConfidenceScore}
	/>
{/if}
