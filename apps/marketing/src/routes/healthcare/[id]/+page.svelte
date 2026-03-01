<script lang="ts">
	import HealthcareLanding from '$lib/templates/HealthcareLanding.svelte';
	import LowDataView from '$lib/components/demo/LowDataView.svelte';
	import { healthcareDemoContent } from '$lib/content/healthcare';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl, senderName, audit, lowData, lowDataReason } = data;
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

{#if lowData}
	<LowDataView reason={lowDataReason} />
{:else if data.customDemoHtml}
	<div class="demo-custom-html" data-custom-demo>{@html data.customDemoHtml}</div>
{:else}
	<HealthcareLanding
		companyName={prospect.companyName}
		website={prospect.website}
		address={prospect.address}
		city={prospect.city}
		industrySlug="healthcare"
		{senderName}
		{audit}
		prospectId={prospect.id}
		dataConfidenceScore={data.dataConfidenceScore}
	/>
{/if}
