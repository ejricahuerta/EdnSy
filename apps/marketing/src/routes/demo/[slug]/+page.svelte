<script lang="ts">
	import { onMount } from 'svelte';
	import type { DemoPageJson } from '$lib/demo';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import RetellCallbackDialog from '$lib/components/RetellCallbackDialog.svelte';
	import DemoCtaDropdown from '$lib/components/DemoCtaDropdown.svelte';
	import { DEMO_PHONE, DEMO_PHONE_DISPLAY, CAL_COM_LINK } from '$lib/constants';

	let { data } = $props();
	const freeDemoPending = data.freeDemoPending === true;
	const freeDemoCompanyName = (data.freeDemoCompanyName as string) ?? 'Your business';
	const freeDemoIndustry = (data.freeDemoIndustry as string) ?? 'professional';
	const freeDemoEmail = (data.freeDemoEmail as string) ?? '';
	const freeDemoFailed = data.freeDemoFailed === true;
	const freeDemoErrorMessage = (data.errorMessage as string) ?? '';
	const useV0Demo = data.useV0Demo === true;
	const prospectId = data.prospectId as string;
	const industrySlug = data.industrySlug as string;
	const companyName = (data.companyName as string) ?? 'Demo';
	/** v0-hosted demo URL (external); when set, we must use iframe. When null, we use inline demoHtml. */
	const v0DemoUrl = (data.v0DemoUrl as string | null | undefined) ?? null;
	/** Full demo HTML from storage; rendered via iframe srcdoc so CSS/scripts run in a real document. */
	const demoHtml = (data.demoHtml as string | null | undefined) ?? null;
	const iframeSrc = v0DemoUrl || '';

	const pageJson = useV0Demo ? null : (data.pageJson as DemoPageJson);
	const theme = useV0Demo ? '' : (data.theme as string);
	const layout = useV0Demo ? '' : (data.layout as string);
	const themeClass = theme ? `theme-${theme}` : '';

	let callbackDialogOpen = $state(false);
	const demoPhoneDisplay = $derived(
		pageJson?.contact?.phone && pageJson.contact.phone !== '—' ? pageJson.contact.phone : DEMO_PHONE_DISPLAY
	);
	const demoPhoneHref = $derived(
		pageJson?.contact?.phone && pageJson.contact.phone !== '—'
			? `tel:${pageJson.contact.phone.replace(/\s/g, '')}`
			: `tel:${DEMO_PHONE}`
	);

	/** KPIs: ensure at least 3 for display; pad with non-duplicate defaults if missing. */
	const STATS_POOL: Array<{ value: string; label: string }> = [
		{ value: '100+', label: 'Happy Clients' },
		{ value: '15+', label: 'Years Experience' },
		{ value: 'Local', label: '& Trusted' },
		{ value: '500+', label: 'Projects Done' },
		{ value: '24/7', label: 'Support' }
	];
	const displayStats = $derived.by(() => {
		if (!pageJson?.stats?.enabled) return [];
		const items = pageJson.stats.items ?? [];
		if (items.length >= 3) return items;
		if (items.length === 0) return STATS_POOL.slice(0, 3);
		const used = new Set(items.map((s) => `${s.value}|${s.label}`));
		const toAdd = STATS_POOL.filter((s) => !used.has(`${s.value}|${s.label}`)).slice(0, 3 - items.length);
		return [...items, ...toAdd];
	});

	/** Fallback image URLs so demos never render broken img (server fills these when possible). */
	const DEFAULT_LOGO = '/images/logo.png';
	const DEFAULT_AVATAR =
		'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

	/** Ensure legal links point to real routes; fix bad or placeholder hrefs from stored JSON. */
	const LEGAL_HREF: Record<string, string> = { Privacy: '/privacy', Terms: '/terms', Cookies: '/cookies' };
	const legalLinks = $derived.by(() => {
		const links = pageJson?.footer?.legalLinks ?? [];
		return links.map((l) => {
			const href =
				l.href && l.href !== '#' && l.href.startsWith('/')
					? l.href
					: LEGAL_HREF[l.label] ?? '/privacy';
			return { label: l.label, href };
		});
	});

	onMount(() => {
		if (prospectId) {
			fetch(`/api/demo/track`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prospectId, event: 'page_view', path: window.location.pathname })
			}).catch(() => {});
		}
	});
</script>

<svelte:head>
	<title>{freeDemoPending ? 'Generating your demo…' : freeDemoFailed ? 'Demo failed' : useV0Demo ? `${companyName} — Demo` : pageJson?.meta?.title ?? 'Demo'}</title>
	<meta name="description" content={useV0Demo ? `Demo for ${companyName}. Chat or request a callback.` : (pageJson?.meta?.description ?? '')} />
	{#if !useV0Demo && !freeDemoPending && !freeDemoFailed}
		<link rel="stylesheet" href="/demo-themes/{theme}/app.css" />
		<script src="https://cdn.tailwindcss.com"></script>
	{/if}
</svelte:head>

{#if freeDemoPending}
	<div class="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6 text-center">
		<div class="max-w-md space-y-4">
			<h1 class="text-xl font-semibold text-stone-800">Generating your demo</h1>
			<dl class="text-left rounded-lg border border-stone-200 bg-white p-4 space-y-2">
				<div>
					<dt class="text-xs font-medium text-stone-500 uppercase tracking-wide">Business</dt>
					<dd class="mt-0.5 text-stone-800 font-medium">{freeDemoCompanyName}</dd>
				</div>
				<div>
					<dt class="text-xs font-medium text-stone-500 uppercase tracking-wide">Industry</dt>
					<dd class="mt-0.5 text-stone-700">{freeDemoIndustry}</dd>
				</div>
				{#if freeDemoEmail}
					<div>
						<dt class="text-xs font-medium text-stone-500 uppercase tracking-wide">Email</dt>
						<dd class="mt-0.5 text-stone-700">{freeDemoEmail}</dd>
					</div>
				{/if}
			</dl>
			<p class="text-stone-600">This usually takes 1–2 minutes. This page will show your demo when it’s ready—refresh in a moment.</p>
			<p class="text-sm text-stone-500">We’ve also sent a link to your email so you can open it later.</p>
		</div>
	</div>
{:else if freeDemoFailed}
	<div class="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6 text-center">
		<div class="max-w-md">
			<h1 class="text-xl font-semibold text-stone-800">Demo couldn’t be created</h1>
			<p class="mt-2 text-stone-600">{freeDemoErrorMessage}</p>
			<a href="/try" class="mt-6 inline-block rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">Try again</a>
		</div>
	</div>
{:else if useV0Demo}
	<!-- Demo: our HTML in iframe srcdoc (CSS/scripts work) or external v0 URL in iframe src. -->
	<div class="demo-v0 flex flex-col bg-stone-100">
		<div class="demo-v0-iframe-wrap">
			{#if demoHtml}
				<iframe
					title="Demo website for {companyName}"
					srcdoc={demoHtml}
					class="demo-v0-iframe"
				></iframe>
			{:else if iframeSrc}
				<iframe
					title="Demo website for {companyName}"
					src={iframeSrc}
					class="demo-v0-iframe"
				></iframe>
			{/if}
		</div>
		<RetellCallbackDialog
			bind:open={callbackDialogOpen}
			prospectId={prospectId}
			onerror={(e) => e.detail?.notConfigured && window.open(CAL_COM_LINK, '_blank', 'noopener,noreferrer')}
		/>
		<ChatWidget
			industrySlug={industrySlug}
			displayName={companyName}
			prospectId={prospectId}
			onOpenCallback={() => (callbackDialogOpen = true)}
			autoOpenAfterMs={5000}
		/>
	</div>
{:else}
<div class="demo-v13 {themeClass}" data-layout={layout}>
	<!-- Nav -->
	<nav class="nav-bar" id="nav">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 py-4 min-h-[3.5rem] md:min-h-14">
			<a href="#" class="flex items-center gap-2">
				<img
					src={pageJson.brand.logoUrl?.trim() || DEFAULT_LOGO}
					alt={pageJson.brand.logoAlt}
					class="h-8 w-auto"
				/>
			</a>
			<div class="hidden md:flex items-center gap-6">
				{#each pageJson.nav.links as link}
					<a href={link.href} class="nav-link">{link.label}</a>
				{/each}
			</div>
			{#if pageJson.nav.cta}
				<DemoCtaDropdown
					label={pageJson.nav.cta.label}
					phoneHref={demoPhoneHref}
					phoneDisplay={demoPhoneDisplay}
					onRequestCallback={() => (callbackDialogOpen = true)}
				/>
			{/if}
		</div>
	</nav>

	<!-- Hero (layout-specific) -->
	<section id="hero" class="hero-section hero-{layout}">
		{#if layout === 'split'}
			<div class="hero-grid container mx-auto px-4 sm:px-6 lg:px-8 min-h-[70vh] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-24">
				<div class="hero-content">
					<h1 class="hero-headline">{pageJson.hero.headline}</h1>
					{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2">{pageJson.hero.subheadline}</p>{/if}
					{#if pageJson.hero.body}<p class="hero-body mt-4">{pageJson.hero.body}</p>{/if}
					<div class="flex flex-wrap gap-3 mt-8">
						<DemoCtaDropdown
							label={pageJson.hero.primaryCta.label}
							phoneHref={demoPhoneHref}
							phoneDisplay={demoPhoneDisplay}
							onRequestCallback={() => (callbackDialogOpen = true)}
						/>
						<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
					</div>
				</div>
				{#if pageJson.hero.imageUrl}
					<div class="hero-image-wrap rounded-xl overflow-hidden">
						<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full h-72 lg:h-full object-cover" />
					</div>
				{/if}
			</div>
		{:else if layout === 'fullbleed' || layout === 'cinematic'}
			<div class="hero-fullbleed relative min-h-[85vh] flex items-center justify-center text-center">
				{#if pageJson.hero.imageUrl}
					<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
				{/if}
				<div class="hero-overlay absolute inset-0"></div>
				<div class="hero-content relative z-10 container mx-auto px-4 py-24 max-w-3xl">
					<h1 class="hero-headline">{pageJson.hero.headline}</h1>
					{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2">{pageJson.hero.subheadline}</p>{/if}
					{#if pageJson.hero.body}<p class="hero-body mt-4">{pageJson.hero.body}</p>{/if}
					<div class="flex flex-wrap justify-center gap-3 mt-8">
						<DemoCtaDropdown
							label={pageJson.hero.primaryCta.label}
							phoneHref={demoPhoneHref}
							phoneDisplay={demoPhoneDisplay}
							onRequestCallback={() => (callbackDialogOpen = true)}
						/>
						<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
					</div>
				</div>
			</div>
		{:else if layout === 'lifestyle'}
			<div class="hero-lifestyle relative min-h-[70vh]">
				{#if pageJson.hero.imageUrl}
					<div class="hero-lifestyle-bg absolute inset-0">
						<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full h-full min-h-[70vh] object-cover object-center" />
					</div>
				{/if}
				<div class="hero-lifestyle-content relative z-10 container mx-auto px-4 py-20 md:py-28 max-w-2xl text-center">
					<h1 class="hero-headline text-4xl md:text-5xl">{pageJson.hero.headline}</h1>
					{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-4 text-lg">{pageJson.hero.subheadline}</p>{/if}
					{#if pageJson.hero.body}<p class="hero-body mt-3">{pageJson.hero.body}</p>{/if}
					<div class="flex flex-wrap justify-center gap-4 mt-8">
						<DemoCtaDropdown
							label={pageJson.hero.primaryCta.label}
							phoneHref={demoPhoneHref}
							phoneDisplay={demoPhoneDisplay}
							onRequestCallback={() => (callbackDialogOpen = true)}
						/>
						<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
					</div>
				</div>
			</div>
		{:else if layout === 'narrow'}
			<div class="container mx-auto px-4 py-20 max-w-2xl text-center">
				<h1 class="hero-headline text-3xl md:text-4xl font-serif">{pageJson.hero.headline}</h1>
				{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2">{pageJson.hero.subheadline}</p>{/if}
				{#if pageJson.hero.body}<p class="hero-body mt-4">{pageJson.hero.body}</p>{/if}
				<div class="flex flex-wrap justify-center gap-3 mt-8">
					<DemoCtaDropdown
						label={pageJson.hero.primaryCta.label}
						phoneHref={demoPhoneHref}
						phoneDisplay={demoPhoneDisplay}
						onRequestCallback={() => (callbackDialogOpen = true)}
					/>
					<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
				</div>
				{#if pageJson.hero.imageUrl}
					<div class="mt-12">
						<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full rounded-lg shadow-md" />
					</div>
				{/if}
			</div>
		{:else if layout === 'dense'}
			<div class="container mx-auto px-4 py-12 md:py-16">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					<div>
						<h1 class="hero-headline text-3xl md:text-4xl">{pageJson.hero.headline}</h1>
						{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2">{pageJson.hero.subheadline}</p>{/if}
						{#if pageJson.hero.body}<p class="hero-body mt-3 text-sm">{pageJson.hero.body}</p>{/if}
						<div class="flex gap-3 mt-6">
							<DemoCtaDropdown
								label={pageJson.hero.primaryCta.label}
								phoneHref={demoPhoneHref}
								phoneDisplay={demoPhoneDisplay}
								onRequestCallback={() => (callbackDialogOpen = true)}
							/>
							<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
						</div>
					</div>
					{#if pageJson.hero.imageUrl}
						<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full h-64 object-cover rounded-lg" />
					{/if}
				</div>
			</div>
		{:else if layout === 'bento'}
			<div class="container mx-auto px-4 py-16">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<div>
						<h1 class="hero-headline text-4xl md:text-5xl">{pageJson.hero.headline}</h1>
						{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2 text-lg">{pageJson.hero.subheadline}</p>{/if}
						{#if pageJson.hero.body}<p class="hero-body mt-3">{pageJson.hero.body}</p>{/if}
						<div class="flex flex-wrap gap-3 mt-6">
							<DemoCtaDropdown
								label={pageJson.hero.primaryCta.label}
								phoneHref={demoPhoneHref}
								phoneDisplay={demoPhoneDisplay}
								onRequestCallback={() => (callbackDialogOpen = true)}
							/>
							<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
						</div>
					</div>
					{#if pageJson.hero.imageUrl}
						<div class="rounded-2xl overflow-hidden shadow-xl">
							<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full h-80 object-cover" />
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- centered default -->
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center max-w-3xl mx-auto">
				<h1 class="hero-headline">{pageJson.hero.headline}</h1>
				{#if pageJson.hero.subheadline}<p class="hero-subheadline mt-2">{pageJson.hero.subheadline}</p>{/if}
				{#if pageJson.hero.body}<p class="hero-body mt-4">{pageJson.hero.body}</p>{/if}
				<div class="flex flex-wrap justify-center gap-3 mt-8">
					<DemoCtaDropdown
						label={pageJson.hero.primaryCta.label}
						phoneHref={demoPhoneHref}
						phoneDisplay={demoPhoneDisplay}
						onRequestCallback={() => (callbackDialogOpen = true)}
					/>
					<a href={pageJson.hero.secondaryCta.href} class="btn btn-secondary">{pageJson.hero.secondaryCta.label}</a>
				</div>
				{#if pageJson.hero.imageUrl}
					<div class="hero-image-wrap mt-12 rounded-2xl overflow-hidden shadow-lg">
						<img src={pageJson.hero.imageUrl} alt={pageJson.hero.imageAlt} class="w-full h-64 md:h-80 object-cover" />
					</div>
				{/if}
			</div>
		{/if}
	</section>

	{#if pageJson.trustBar?.enabled && pageJson.trustBar.items?.length}
		<section class="trust-bar">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-wrap justify-center gap-6 md:gap-10">
				{#each pageJson.trustBar.items as item}
					<div class="flex items-center gap-2 text-sm font-medium">
						<span class="trust-icon" aria-hidden="true">★</span>
						{item.label}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if pageJson.problem?.enabled && pageJson.problem.items?.length}
		<section id="problem" class="section section-alt">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-3xl mx-auto text-center">
				<h2 class="section-headline">{pageJson.problem.headline}</h2>
				<ul class="mt-6 space-y-3 text-left">
					{#each pageJson.problem.items as item}
						<li class="flex items-start gap-2"><span class="text-accent mt-0.5">•</span> {item}</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	{#if pageJson.solution?.enabled}
		<section id="solution" class="section">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
					<div>
						<h2 class="section-headline">{pageJson.solution.headline}</h2>
						<p class="mt-4 text-body">{pageJson.solution.body}</p>
					</div>
					{#if pageJson.solution.imageUrl}
						<img src={pageJson.solution.imageUrl} alt={pageJson.solution.imageAlt} class="rounded-xl shadow-md w-full object-cover" />
					{/if}
				</div>
			</div>
		</section>
	{/if}

	{#if pageJson.services?.enabled && pageJson.services.items?.length}
		<section id="services" class="section section-alt">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
				<h2 class="section-headline text-center">{pageJson.services.headline}</h2>
				{#if pageJson.services.subheadline}<p class="section-subheadline text-center mt-2">{pageJson.services.subheadline}</p>{/if}
				<div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each pageJson.services.items as svc}
						<div class="card rounded-xl p-6 h-full flex flex-col">
							<span class="text-2xl" aria-hidden="true">★</span>
							<h3 class="text-lg font-semibold mt-2">{svc.title}</h3>
							<p class="text-body mt-2 text-sm flex-1">{svc.description}</p>
							{#if svc.cta}<a href={svc.cta.href} class="btn btn-outline mt-4 inline-block">{svc.cta.label}</a>{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if pageJson.work?.enabled && pageJson.work?.items?.length}
		<section id="work" class="section work-section">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
				<h2 class="section-headline text-center">{pageJson.work.headline}</h2>
				{#if pageJson.work.subheadline}<p class="section-subheadline text-center mt-2">{pageJson.work.subheadline}</p>{/if}
				<div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each pageJson.work.items as item}
						<article class="work-card card rounded-xl overflow-hidden h-full flex flex-col">
							<div class="work-card-image aspect-[4/3] overflow-hidden">
								<img
									src={item.imageUrl || pageJson.solution?.imageUrl || pageJson.hero.imageUrl}
									alt={item.imageAlt}
									class="w-full h-full object-cover"
								/>
							</div>
							<div class="p-5 flex flex-col flex-1">
								{#if item.category}<span class="text-xs font-medium uppercase tracking-wide text-accent">{item.category}</span>{/if}
								<h3 class="text-lg font-semibold mt-1">{item.title}</h3>
								<p class="text-body text-sm mt-2 flex-1">{item.description}</p>
								{#if item.outcome}<p class="text-sm font-medium mt-2 text-accent">{item.outcome}</p>{/if}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if pageJson.stats?.enabled && displayStats.length}
		<section class="section stats-bar">
			<div class="container mx-auto px-4 py-10 md:py-12 flex justify-center">
				<div class="flex flex-wrap justify-center items-stretch gap-8 md:gap-12 max-w-4xl">
					{#each displayStats as s}
						<div class="stat-cell flex flex-col items-center justify-center text-center min-w-[120px]">
							<div class="stat-value">{s.value}</div>
							<div class="stat-label text-sm mt-1">{s.label}</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if pageJson.testimonials?.enabled && pageJson.testimonials.items?.length}
		<section id="reviews" class="section section-alt">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
				<h2 class="section-headline text-center">{pageJson.testimonials.headline}</h2>
				{#if pageJson.testimonials.source}<p class="text-center text-sm opacity-80 mt-1">{pageJson.testimonials.source}</p>{/if}
				<div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
					{#each pageJson.testimonials.items as rev}
						<div class="card rounded-xl p-6">
							<div class="flex items-center gap-3">
								<img
									src={rev.avatarUrl || DEFAULT_AVATAR}
									alt=""
									class="w-12 h-12 rounded-full object-cover"
								/>
								<div>
									<div class="font-semibold">{rev.name}</div>
									<div class="text-sm opacity-80">{rev.location}</div>
								</div>
							</div>
							{#if rev.rating}<div class="text-amber-500 mt-1" aria-label="{rev.rating} stars">{'★'.repeat(rev.rating)}</div>{/if}
							<p class="mt-3 text-body text-sm">{rev.text}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if pageJson.cta?.enabled}
		<section class="section cta-section">
			<div class="container mx-auto px-4 py-20 md:py-24 text-center max-w-2xl mx-auto">
				<h2 class="section-headline">{pageJson.cta.headline}</h2>
				{#if pageJson.cta.body}<p class="mt-2 text-body">{pageJson.cta.body}</p>{/if}
				<div class="flex flex-wrap justify-center gap-3 mt-6">
					<DemoCtaDropdown
						label={pageJson.cta.primaryCta.label}
						phoneHref={demoPhoneHref}
						phoneDisplay={demoPhoneDisplay}
						onRequestCallback={() => (callbackDialogOpen = true)}
					/>
					<a href={pageJson.cta.secondaryCta.href} class="btn btn-secondary">{pageJson.cta.secondaryCta.label}</a>
				</div>
				{#if pageJson.cta.guarantee}<p class="text-sm mt-4 opacity-90">{pageJson.cta.guarantee}</p>{/if}
			</div>
		</section>
	{/if}

	{#if pageJson.contact?.enabled}
		<section id="contact" class="section section-alt">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 max-w-2xl mx-auto">
				<h2 class="section-headline text-center">{pageJson.contact.headline}</h2>
				{#if pageJson.contact.subheadline}<p class="text-center text-body mt-1">{pageJson.contact.subheadline}</p>{/if}
				<div class="mt-6 space-y-2 text-center text-sm">
					{#if pageJson.contact.phone !== '—'}<p><a href="tel:{pageJson.contact.phone.replace(/\s/g, '')}" class="link">{pageJson.contact.phone}</a></p>{/if}
					{#if pageJson.contact.email !== '—'}<p><a href="mailto:{pageJson.contact.email}" class="link">{pageJson.contact.email}</a></p>{/if}
					{#if pageJson.contact.address !== '—'}<p>{pageJson.contact.address}</p>{/if}
				</div>
				<form class="mt-8 space-y-4" action="#" method="post">
					{#each pageJson.contact.fields as field}
						<div>
							<label for="c-{field}" class="block text-sm font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
							{#if field === 'message'}
								<textarea id="c-{field}" name={field} class="input w-full min-h-[100px]" placeholder="Your message"></textarea>
							{:else}
								<input id="c-{field}" name={field} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} class="input w-full" placeholder={field === 'email' ? 'you@example.com' : field === 'phone' ? 'Phone' : 'Your ' + field} />
							{/if}
						</div>
					{/each}
					<button type="submit" class="btn btn-primary w-full">{pageJson.contact.submitLabel}</button>
				</form>
			</div>
		</section>
	{/if}

	{#if pageJson.faq?.enabled && pageJson.faq.items?.length}
		<section id="faq" class="section">
			<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 max-w-2xl mx-auto">
				<h2 class="section-headline text-center">{pageJson.faq.headline}</h2>
				<dl class="mt-8 space-y-4">
					{#each pageJson.faq.items as item}
						<dt class="font-semibold">{item.question}</dt>
						<dd class="text-body text-sm mt-1 ml-0 pl-0">{item.answer}</dd>
					{/each}
				</dl>
			</div>
		</section>
	{/if}

	<footer class="footer">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
			<p class="footer-tagline">{pageJson.footer.tagline}</p>
			{#if pageJson.footer.hours?.length}
				<div class="mt-4 text-sm space-y-1">
					{#each pageJson.footer.hours as h}
						<p>{h.days}: {h.hours}</p>
					{/each}
				</div>
			{/if}
			{#if legalLinks.length}
				<div class="flex flex-wrap gap-4 mt-4 text-sm">
					{#each legalLinks as l}
						<a href={l.href} class="link">{l.label}</a>
					{/each}
				</div>
			{/if}
			<p class="text-sm mt-6 opacity-80">{pageJson.footer.copyright}</p>
		</div>
	</footer>

	<RetellCallbackDialog
		bind:open={callbackDialogOpen}
		prospectId={prospectId}
		onerror={(e) => e.detail?.notConfigured && window.open(CAL_COM_LINK, '_blank', 'noopener,noreferrer')}
	/>

	<ChatWidget
		industrySlug={industrySlug}
		displayName={pageJson?.brand?.businessName ?? companyName}
		prospectId={prospectId}
		onOpenCallback={() => (callbackDialogOpen = true)}
		autoOpenAfterMs={5000}
	/>
</div>
{/if}
