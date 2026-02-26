<script lang="ts">
	import { CAL_COM_LINK, DEMO_PHONE } from '$lib/constants';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import { constructionDemoContent } from '$lib/content/construction';
	import type { DemoProspect } from '$lib/types/demo';
	import {
		Building2,
		ArrowRight,
		Home,
		Lightbulb,
		ClipboardList,
		Menu,
		X
	} from 'lucide-svelte';

	let { prospect, content = constructionDemoContent }: { prospect: DemoProspect; content?: typeof constructionDemoContent } = $props();
	const displayName = $derived(prospect.companyName || content.hero.companyName);
	const website = $derived(prospect.website);
	const displayAddress = $derived(prospect.address || content.contact.address);
	const displayPhone = $derived(prospect.phone || content.contact.phone);
	const displayEmail = $derived(prospect.email || content.contact.email);
	const industrySlug = 'construction';
	const brandTagline = content.header.brandTagline;
	// Hero body text: use Notion prospect company name when present, else static content
	const heroBody = $derived(
		prospect.companyName
			? content.hero.body.replace(content.hero.companyName, displayName)
			: content.hero.body
	);

	const serviceIcons = { Home, Building2, Lightbulb, ClipboardList } as const;

	let navOpen = $state(false);
	let formName = $state('');
	let formEmail = $state('');
	let formPhone = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		window.open(CAL_COM_LINK, '_blank', 'noopener,noreferrer');
	}
</script>

<div class="construction-landing flex flex-col min-h-screen bg-stone-100">
	<!-- 1. Header: light tan, logo + tagline left, nav right -->
	<header class="sticky top-0 z-50 bg-stone-100 border-b border-stone-300/80">
		<nav class="navbar min-h-16 lg:min-h-[4.25rem] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
			<div class="navbar-start">
				<a href="#" class="flex flex-col">
					<span class="text-lg font-bold text-stone-800 uppercase tracking-tight">{displayName}</span>
					<span class="text-xs text-stone-500 uppercase tracking-wider">{brandTagline}</span>
				</a>
			</div>
			<div class="navbar-end hidden lg:flex items-center gap-8">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-stone-600 hover:text-stone-800 text-sm font-medium uppercase tracking-wider transition-colors">
						{link.label}
					</a>
				{/each}
				<a
					href={CAL_COM_LINK}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm bg-stone-800 text-stone-100 border-0 hover:bg-stone-700 uppercase tracking-wider"
				>
					{content.header.ctaLabel}
				</a>
			</div>
			<button type="button" class="btn btn-ghost btn-square lg:hidden text-stone-700" aria-label="Toggle menu" onclick={() => (navOpen = !navOpen)}>
				{#if navOpen}<X class="w-6 h-6" />{:else}<Menu class="w-6 h-6" />{/if}
			</button>
		</nav>
		{#if navOpen}
			<div class="lg:hidden border-t border-stone-200 px-4 py-4 flex flex-col gap-2 bg-stone-100">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-stone-600 hover:text-stone-800 py-2 uppercase text-sm" onclick={() => (navOpen = false)}>{link.label}</a>
				{/each}
				<a href={CAL_COM_LINK} target="_blank" rel="noopener noreferrer" class="btn btn-sm bg-stone-800 text-stone-100 mt-2">{content.header.ctaLabel}</a>
			</div>
		{/if}
	</header>

	<main class="flex-1">
		<!-- 2. Hero: burnt orange/sienna, eyebrow, company name, image, body, VIEW PROJECTS -->
		<section class="relative bg-amber-800/90 text-amber-50 py-16 md:py-24" aria-labelledby="hero-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<p class="text-amber-200/90 text-sm uppercase tracking-widest mb-4">{content.hero.eyebrow}</p>
				<h1 id="hero-heading" class="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-50 mb-6 tracking-tight">
					{displayName}
				</h1>
				<div class="rounded-xl overflow-hidden max-w-4xl aspect-video mb-8 shadow-2xl">
					<img src={content.hero.image} alt={content.hero.imageAlt} class="object-cover w-full h-full" width="1000" height="563" />
				</div>
				<p class="text-amber-50/95 max-w-3xl text-lg leading-relaxed mb-6">{heroBody}</p>
				<a href="#projects" class="text-amber-200 font-medium underline underline-offset-4 hover:text-amber-50 transition-colors">{content.hero.ctaLabel}</a>
			</div>
		</section>

		<!-- 3. Featured Projects: light tan, 3 cards -->
		<section id="projects" class="py-20 md:py-28 bg-stone-100" aria-labelledby="projects-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
					<h2 id="projects-heading" class="text-3xl md:text-4xl font-serif font-bold text-stone-800">{content.featuredProjects.heading}</h2>
					<p class="text-stone-500 text-sm uppercase tracking-wider">{content.featuredProjects.subheading}</p>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each content.featuredProjects.items as project}
						<div class="group">
							<div class="rounded-xl overflow-hidden aspect-[4/3] mb-4">
								<img src={project.image} alt={project.title} class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy" width="400" height="300" />
							</div>
							<p class="font-semibold text-stone-800">{project.title}</p>
							<p class="text-stone-500 text-sm">{project.category}</p>
							<span class="text-stone-400 text-sm mt-2 block">{project.number}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 4. Stats: dark brown -->
		<section class="py-16 md:py-20 bg-stone-800 text-amber-50/95" aria-label="Statistics">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
					{#each content.stats as stat}
						<div>
							<p class="text-4xl md:text-5xl font-bold tracking-tight">{stat.value}</p>
							<p class="text-amber-100/80 text-sm uppercase tracking-wider mt-1">{stat.label}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 5. Our Services: light tan, 2x2 grid -->
		<section id="services" class="py-20 md:py-28 bg-stone-100" aria-labelledby="services-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
					<h2 id="services-heading" class="text-3xl md:text-4xl font-serif font-bold text-stone-800">{content.services.heading}</h2>
					<p class="text-stone-500 text-sm uppercase tracking-wider">{content.services.subheading}</p>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each content.services.items as service, i}
						{@const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] ?? Building2}
						<div class="p-6 md:p-8 rounded-xl bg-white border border-stone-200 shadow-sm">
							<div class="text-amber-700 mb-4" aria-hidden="true"><Icon class="w-8 h-8" /></div>
							<h3 class="font-semibold text-stone-800 text-lg mb-2">{service.title}</h3>
							<p class="text-stone-600 text-sm leading-relaxed">{service.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 6. Built on Integrity: two columns -->
		<section id="about" class="py-20 md:py-28 bg-stone-100" aria-labelledby="integrity-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
					<div>
						<h2 id="integrity-heading" class="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">{content.integrity.heading}</h2>
						<p class="text-stone-500 text-sm uppercase tracking-wider">{content.integrity.subheading}</p>
					</div>
					<div>
						<p class="text-stone-600 leading-relaxed mb-8">{content.integrity.body}</p>
						<div class="space-y-4">
							{#each content.integrity.team as person}
								<div>
									<p class="font-semibold text-stone-800">{person.name}</p>
									<p class="text-stone-500 text-sm">{person.title}</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 7. Register interest: form -->
		<section id="contact" class="py-20 md:py-28 bg-stone-200/80" aria-labelledby="register-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
					<div>
						<h2 id="register-heading" class="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">{content.registerInterest.heading}</h2>
						<p class="text-stone-600">{content.registerInterest.subtext}</p>
					</div>
					<div class="bg-white rounded-xl border border-stone-200 p-6 md:p-8 shadow-sm">
						<form onsubmit={handleSubmit} class="space-y-4">
							<div>
								<label for="con-name" class="label text-stone-700 text-sm">{content.registerInterest.form.fullName}</label>
								<input id="con-name" type="text" bind:value={formName} class="input input-bordered w-full bg-stone-50 border-stone-300" placeholder={content.registerInterest.form.placeholderName} />
							</div>
							<div>
								<label for="con-email" class="label text-stone-700 text-sm">{content.registerInterest.form.email}</label>
								<input id="con-email" type="email" bind:value={formEmail} class="input input-bordered w-full bg-stone-50 border-stone-300" placeholder={content.registerInterest.form.placeholderEmail} />
							</div>
							<div>
								<label for="con-phone" class="label text-stone-700 text-sm">{content.registerInterest.form.phone}</label>
								<input id="con-phone" type="tel" bind:value={formPhone} class="input input-bordered w-full bg-stone-50 border-stone-300" placeholder={content.registerInterest.form.placeholderPhone} />
							</div>
							<button type="submit" class="btn w-full bg-amber-800 hover:bg-amber-700 text-white border-0 uppercase tracking-wider">
								{content.registerInterest.form.submit}
							</button>
						</form>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- 8. Footer: dark brown, logo + copyright left, two contact columns -->
	<footer class="bg-stone-800 text-amber-50/95 py-14 md:py-20">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-12">
				<div>
					<p class="text-lg font-bold text-amber-50 uppercase tracking-tight">{displayName}</p>
					<p class="text-amber-100/70 text-sm mt-2">{content.footer.copyright}</p>
				</div>
				{#each content.footer.contacts as person}
					<div>
						<p class="font-semibold text-amber-50">{person.name}</p>
						<p class="text-amber-100/80 text-sm">{person.title}</p>
						<a href={`tel:${person.phone.replace(/\D/g, '')}`} class="text-amber-100/90 text-sm block mt-1 hover:underline">{person.phone}</a>
						<a href={`mailto:${person.email}`} class="text-amber-100/90 text-sm block hover:underline break-all">{person.email}</a>
					</div>
				{/each}
			</div>
		</div>
		<div class="border-t border-amber-900/50 mt-10 pt-6">
			<div class="max-w-6xl mx-auto px-4 text-center text-amber-100/60 text-sm">
				<p>Powered by Ed & Sy Inc.</p>
			</div>
		</div>
	</footer>

	<ChatWidget industrySlug={industrySlug} displayName={displayName} prospectId={prospect.id} />
</div>

{#if website}
	<p class="sr-only">Website: {website}</p>
{/if}

<style>
	.construction-landing a:focus-visible,
	.construction-landing button:focus-visible {
		outline: 2px solid var(--tw-color-amber-700);
		outline-offset: 2px;
	}
</style>
