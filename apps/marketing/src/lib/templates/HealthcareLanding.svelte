<script lang="ts">
	import { CAL_COM_LINK, DEMO_PHONE } from '$lib/constants';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import { healthcareDemoContent } from '$lib/content/healthcare';
	import type { DemoProspect } from '$lib/types/demo';
	import {
		Video,
		Heart,
		Brain,
		Activity,
		FileCheck,
		Calendar,
		Leaf,
		Check,
		ArrowRight,
		Star,
		Menu,
		X
	} from 'lucide-svelte';

	let { prospect, content = healthcareDemoContent }: { prospect: DemoProspect; content?: typeof healthcareDemoContent } = $props();
	const displayName = $derived(prospect.companyName || 'Riverside Medical');
	const companyName = $derived(prospect.companyName);
	const website = $derived(prospect.website);
	const address = $derived(prospect.address);
	const city = $derived(prospect.city);
	const industrySlug = 'healthcare';

	const serviceIcons = [Video, Heart, Brain, Activity, FileCheck, Calendar] as const;

	let navOpen = $state(false);
</script>

<div class="healthcare-landing flex flex-col min-h-screen bg-white">
	<!-- 1. Header: logo (leaf) + name left, nav right, Get Started -->
	<header class="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
		<nav class="navbar min-h-16 lg:min-h-[4.25rem] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
			<div class="navbar-start">
				<a href="#" class="flex items-center gap-2">
					<Leaf class="w-8 h-8 text-emerald-600" aria-hidden="true" />
					<span class="text-xl font-bold text-stone-800">{displayName}</span>
				</a>
			</div>
			<div class="navbar-end hidden lg:flex items-center gap-8">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors">{link.label}</a>
				{/each}
				<a
					href={CAL_COM_LINK}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-full"
				>
					{content.header.ctaLabel}
				</a>
			</div>
			<button type="button" class="btn btn-ghost btn-square lg:hidden text-stone-700" aria-label="Toggle menu" onclick={() => (navOpen = !navOpen)}>
				{#if navOpen}<X class="w-6 h-6" />{:else}<Menu class="w-6 h-6" />{/if}
			</button>
		</nav>
		{#if navOpen}
			<div class="lg:hidden border-t border-stone-200 px-4 py-4 flex flex-col gap-2 bg-white">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-stone-600 hover:text-stone-900 py-2" onclick={() => (navOpen = false)}>{link.label}</a>
				{/each}
				<a href={CAL_COM_LINK} target="_blank" rel="noopener noreferrer" class="btn btn-sm bg-emerald-600 text-white mt-2">{content.header.ctaLabel}</a>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		<!-- 2. Hero: split – left (badge, headline, text, CTAs, stats); right (image, HIPAA badge) -->
		<section class="py-16 md:py-24 bg-white" aria-labelledby="hero-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div>
						<div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
							<Leaf class="w-4 h-4" />
							{content.hero.badge}
						</div>
						<h1 id="hero-heading" class="text-4xl md:text-5xl font-bold text-stone-900 mb-4 leading-tight">
							Healthcare <span class="text-emerald-600">{content.hero.headlineHighlight}</span>
						</h1>
						<p class="text-stone-600 text-lg leading-relaxed mb-8">{content.hero.subtext}</p>
						<div class="flex flex-wrap items-center gap-4 mb-10">
							<a href={CAL_COM_LINK} target="_blank" rel="noopener noreferrer" class="btn bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-full gap-2">
								{content.hero.ctaPrimary}
								<ArrowRight class="w-4 h-4" />
							</a>
							<a href="#services" class="inline-flex items-center gap-2 text-emerald-600 font-medium hover:underline">
								<ArrowRight class="w-4 h-4" />
								{content.hero.ctaSecondary}
							</a>
						</div>
						<div class="flex flex-wrap gap-8">
							{#each content.hero.stats as stat}
								<div>
									<p class="text-2xl font-bold text-stone-900">{stat.value}</p>
									<p class="text-stone-500 text-sm">{stat.label}</p>
								</div>
							{/each}
						</div>
					</div>
					<div class="relative">
						<div class="rounded-2xl overflow-hidden shadow-xl">
							<img src={content.hero.image} alt={content.hero.imageAlt} class="object-cover w-full h-full" width="600" height="500" />
						</div>
						<div class="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm shadow">
							<Check class="w-4 h-4" />
							<span class="font-medium">{content.hero.hipaaBadge}</span>
							<span class="text-emerald-700/80">{content.hero.hipaaSubtext}</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 3. Trusted By -->
		<section class="py-12 bg-stone-50" aria-label="Trusted by">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<p class="text-stone-500 text-sm mb-8">{content.trustedBy.heading}</p>
				<div class="flex flex-wrap justify-center gap-8 md:gap-12">
					{#each content.trustedBy.brands as brand}
						<span class="text-stone-600 font-medium">{brand}</span>
					{/each}
				</div>
			</div>
		</section>

		<!-- 4. Services: OUR SERVICES, 6 cards 2x3 -->
		<section id="services" class="py-20 md:py-28 bg-white" aria-labelledby="services-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<p class="text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center mb-2">{content.services.subtitle}</p>
				<h2 id="services-heading" class="text-3xl md:text-4xl font-bold text-stone-900 text-center mb-4">{content.services.heading}</h2>
				<p class="text-stone-600 text-center max-w-2xl mx-auto mb-14">{content.services.subtext}</p>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each content.services.items as service, i}
						{@const Icon = serviceIcons[i] ?? Heart}
						<div class="p-6 rounded-xl bg-stone-50 border border-stone-200">
							<div class="text-emerald-600 mb-4"><Icon class="w-8 h-8" /></div>
							<h3 class="font-semibold text-stone-900 text-lg mb-2">{service.title}</h3>
							<p class="text-stone-600 text-sm leading-relaxed">{service.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 5. Innovation: left image + badge, right heading + bullets -->
		<section id="about" class="py-20 md:py-28 bg-stone-50" aria-labelledby="innovation-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div class="relative">
						<div class="rounded-2xl overflow-hidden shadow-lg">
							<img src={content.innovation.image} alt={content.innovation.imageAlt} class="object-cover w-full h-full" width="600" height="400" />
						</div>
						<div class="absolute top-4 right-4 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium shadow">
							{content.innovation.statBadge} {content.innovation.statLabel}
						</div>
					</div>
					<div>
						<h2 id="innovation-heading" class="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{content.innovation.heading}</h2>
						<p class="text-stone-600 leading-relaxed mb-8">{content.innovation.body}</p>
						<ul class="space-y-4" role="list">
							{#each content.innovation.bullets as bullet}
								<li class="flex items-start gap-3">
									<Check class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
									<span class="text-stone-600">{bullet}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. Stats bar: dark teal -->
		<section class="py-16 md:py-20 bg-teal-900 text-white" aria-label="Statistics">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-center">
					{#each content.statsBar as stat}
						<div>
							<p class="text-4xl md:text-5xl font-bold tracking-tight">{stat.value}</p>
							<p class="text-teal-100/90 text-sm mt-2">{stat.label}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 7. Testimonials -->
		<section id="testimonials" class="py-20 md:py-28 bg-white" aria-labelledby="testimonials-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<p class="text-emerald-600 font-semibold text-sm uppercase tracking-wider text-center mb-2">{content.testimonials.subtitle}</p>
				<h2 id="testimonials-heading" class="text-3xl md:text-4xl font-bold text-stone-900 text-center mb-4">{content.testimonials.heading}</h2>
				<p class="text-stone-600 text-center max-w-2xl mx-auto mb-14">{content.testimonials.subtext}</p>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each content.testimonials.items as t}
						<div class="p-6 md:p-8 rounded-xl bg-stone-50 border border-stone-200">
							<div class="flex gap-1 mb-4">
								{#each Array.from({ length: t.rating ?? 5 }) as _}
									<Star class="w-4 h-4 fill-emerald-500 text-emerald-500" aria-hidden="true" />
								{/each}
							</div>
							<blockquote class="text-stone-700 italic mb-6">&ldquo;{t.quote}&rdquo;</blockquote>
							<p class="font-semibold text-stone-900">{t.author}</p>
							<p class="text-stone-500 text-sm">{t.role}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 8. Final CTA: left dark, right image -->
		<section id="contact" class="py-20 md:py-28 bg-teal-900 text-white" aria-labelledby="cta-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div>
						<h2 id="cta-heading" class="text-3xl md:text-4xl font-bold mb-4">{content.cta.heading}</h2>
						<p class="text-teal-100/90 text-lg leading-relaxed mb-8">{content.cta.subtext}</p>
						<div class="flex flex-wrap gap-4">
							<a href={CAL_COM_LINK} target="_blank" rel="noopener noreferrer" class="btn bg-emerald-500 hover:bg-emerald-400 text-white border-0 gap-2">
								{content.cta.buttonPrimary}
								<ArrowRight class="w-4 h-4" />
							</a>
							<a href={CAL_COM_LINK} target="_blank" rel="noopener noreferrer" class="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-teal-900">
								{content.cta.buttonSecondary}
							</a>
						</div>
					</div>
					<div class="rounded-2xl overflow-hidden shadow-2xl">
						<img src={content.cta.image} alt={content.cta.imageAlt} class="object-cover w-full h-full" width="600" height="400" />
					</div>
				</div>
			</div>
		</section>
	</main>

	<footer class="bg-stone-800 text-stone-200 py-12">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
			<p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
			<p class="text-stone-400">Powered by Ed & Sy Inc.</p>
		</div>
	</footer>

	<ChatWidget industrySlug={industrySlug} displayName={displayName} prospectId={prospect.id} />
</div>

{#if website}
	<p class="sr-only">Website: {website}</p>
{/if}

<style>
	.healthcare-landing a:focus-visible,
	.healthcare-landing button:focus-visible {
		outline: 2px solid var(--tw-color-emerald-600);
		outline-offset: 2px;
	}
</style>
