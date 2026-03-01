<script lang="ts">
	import DentalLanding from '$lib/templates/DentalLanding.svelte';
	import LowDataView from '$lib/components/demo/LowDataView.svelte';
	import { dentalDemoContent } from '$lib/content/dental';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { prospect, canonicalUrl, senderName, audit, lowData, lowDataReason } = data;
	const title = prospect.companyName
		? `${prospect.companyName} | ${dentalDemoContent.hero.tagline}`
		: `Dental demo | ${dentalDemoContent.hero.tagline}`;
	const description = dentalDemoContent.hero.subtext;
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
	<DentalLanding
		companyName={prospect.companyName}
		website={prospect.website}
		address={prospect.address}
		city={prospect.city}
		industrySlug="dental"
		{senderName}
		{audit}
		prospectId={prospect.id}
		dataConfidenceScore={data.dataConfidenceScore}
	/>
{/if}
