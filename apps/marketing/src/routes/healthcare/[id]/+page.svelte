<script lang="ts">
	import HealthcareLanding from '$lib/templates/HealthcareLanding.svelte';
	import { healthcareDemoContent } from '$lib/content/healthcare';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const prospect = $derived(data.prospect);
	const content = $derived(data.content ?? healthcareDemoContent);
	const canonicalUrl = $derived(data.canonicalUrl);
	const heroTitle = $derived((content.hero as { headline?: string }).headline ?? (content.hero as { tagline?: string }).tagline ?? 'Healthcare');
	const title = $derived(
		prospect.companyName
			? `${prospect.companyName} | ${heroTitle}`
			: `Healthcare demo | ${heroTitle}`
	);
	const description = $derived((content.hero as { subtext?: string }).subtext ?? '');
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

<HealthcareLanding prospect={prospect} content={content} />
