<script lang="ts">
	import ConstructionLanding from '$lib/templates/ConstructionLanding.svelte';
	import { constructionDemoContent } from '$lib/content/construction';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const prospect = $derived(data.prospect);
	const content = $derived(data.content ?? constructionDemoContent);
	const canonicalUrl = $derived(data.canonicalUrl);
	const heroTitle = $derived((content.hero as { companyName?: string }).companyName ?? (content.hero as { tagline?: string }).tagline ?? 'Construction');
	const title = $derived(
		prospect.companyName
			? `${prospect.companyName} | ${heroTitle}`
			: `Construction demo | ${heroTitle}`
	);
	const description = $derived((content.hero as { body?: string }).body ?? (content.hero as { subtext?: string }).subtext ?? '');
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

<ConstructionLanding prospect={prospect} content={content} />
