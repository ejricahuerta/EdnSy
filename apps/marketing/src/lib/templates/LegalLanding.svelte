<script lang="ts">
	import { CAL_COM_LINK, DEMO_PHONE } from '$lib/constants';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import { legalDemoContent } from '$lib/content/legal';
	import type { DemoProspect } from '$lib/types/demo';
	import {
		Scale,
		FileText,
		ShieldCheck,
		ArrowRight,
		Quote,
		Menu,
		X,
		Search,
		Settings,
		Lightbulb,
		MessageCircle,
		Lock,
		Star,
		Crosshair,
		Home,
		Handshake
	} from 'lucide-svelte';

	let { prospect, content = legalDemoContent }: { prospect: DemoProspect; content?: typeof legalDemoContent } = $props();
	const displayAddress = $derived(prospect.address || content.contact.address);
	const displayPhone = $derived(prospect.phone || content.contact.phone);
	const displayEmail = $derived(prospect.email || content.contact.email);
	const displayName = $derived(prospect.companyName || 'Your Law Firm');
	const heroHeadline = $derived(prospect.city ? content.hero.taglineWithCity.replace('{city}', prospect.city) : content.hero.tagline);
	const industrySlug = 'legal';
	const website = $derived(prospect.website);

	const serviceIconsByIndex = [Scale, FileText, Home, ShieldCheck, Lightbulb, Handshake] as const;
	const legacyIcons = [Scale, Settings, Lightbulb, MessageCircle] as const;
	const consultationBulletIcons = [Lock, Star, Crosshair] as const;

	let navOpen = $state(false);
	let consultationName = $state('');
	let consultationEmail = $state('');
	let consultationPhone = $state('');
	let consultationService = $state(content.consultation.serviceOptions[0]);
	let consultationMessage = $state('');

	function handleConsultationSubmit(e: Event) {
		e.preventDefault();
		window.open(CAL_COM_LINK, '_blank', 'noopener,noreferrer');
	}
</script>

<div class="legal-landing flex flex-col min-h-screen">
	<!-- Section 1: Header – navy, logo left, nav center, search + Request a Call right -->
	<header class="sticky top-0 z-50 bg-neutral text-neutral-content border-b border-neutral-content/10">
		<nav class="navbar min-h-16 lg:min-h-[4.25rem] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">
			<div class="navbar-start">
				<a href="#" class="text-lg sm:text-xl font-bold text-neutral-content truncate tracking-tight hover:opacity-90 transition-opacity">
					{displayName}
				</a>
			</div>
			<div class="navbar-end hidden lg:flex items-center gap-8">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-neutral-content/90 hover:text-neutral-content text-sm font-medium transition-colors">
						{link.label}
					</a>
				{/each}
				<span class="text-neutral-content/80 p-1" aria-hidden="true"><Search class="w-5 h-5" /></span>
				<a
					href={CAL_COM_LINK}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm bg-neutral-content/10 hover:bg-neutral-content/20 text-neutral-content border-0"
				>
					{content.header.ctaLabel}
				</a>
				<button
					type="button"
					class="btn btn-ghost btn-square lg:hidden text-neutral-content"
					aria-label="Toggle menu"
					onclick={() => (navOpen = !navOpen)}
				>
					{#if navOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
		</nav>
		{#if navOpen}
			<div class="lg:hidden border-t border-neutral-content/10 px-4 py-4 flex flex-col gap-2 bg-neutral">
				{#each content.header.navLinks as link}
					<a href={link.href} class="text-neutral-content/90 hover:text-neutral-content py-2" onclick={() => (navOpen = false)}>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</header>

	<main class="flex-1">
		<!-- Section 2: Hero – law library bg, overlay, headline, two CTAs (~30–40% viewport) -->
		<section
			class="relative min-h-[40vh] flex flex-col justify-end pb-16 md:pb-20 pt-24 md:pt-28"
			aria-labelledby="hero-heading"
		>
			<div
				class="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style="background-image: url('{content.hero.image}');"
				role="img"
				aria-label={content.hero.imageAlt}
			></div>
			<div class="absolute inset-0 bg-neutral/85"></div>
			<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-content">
				<h1 id="hero-heading" class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
					{heroHeadline}
				</h1>
				<p class="text-base md:text-lg text-neutral-content/95 mb-6 max-w-2xl mx-auto leading-relaxed">
					{content.hero.subtext}
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a
						href={CAL_COM_LINK}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary btn-lg text-primary-content shadow-lg hover:shadow-xl transition-all"
					>
						{content.hero.ctaPrimary}
					</a>
					<a
						href="#about"
						class="btn btn-outline btn-lg border-2 border-neutral-content text-neutral-content hover:bg-neutral-content hover:text-neutral transition-all"
					>
						{content.hero.ctaSecondary}
					</a>
				</div>
			</div>
		</section>

		<!-- Section 3: Statistics – white/off-white, 4 columns -->
		<section class="py-16 md:py-20 bg-base-100" aria-label="Firm statistics">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
					{#each content.stats as stat}
						<div>
							<p class="text-4xl md:text-5xl font-bold text-base-content tracking-tight">{stat.value}</p>
							<p class="text-base-content/80 font-medium mt-1 text-sm">{stat.label}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Section 4: Legacy – light beige, two columns: headline + body | 4 value cards -->
		<section id="about" class="py-20 md:py-28 bg-base-200/60" aria-labelledby="legacy-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
					<div class="lg:pr-8">
						<h2 id="legacy-heading" class="section-heading mb-6">
							{content.legacy.heading}
						</h2>
						<p class="text-base-content/85 leading-relaxed max-w-xl">
							{content.legacy.body}
						</p>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{#each content.legacy.values as item, i}
							{@const Icon = legacyIcons[i] ?? Scale}
							<div class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
								<div class="rounded-lg bg-primary/10 w-fit p-3 text-primary mb-4" aria-hidden="true">
									<Icon class="w-7 h-7" />
								</div>
								<h3 class="font-semibold text-base-content mb-2">{item.title}</h3>
								<p class="text-base-content/80 text-sm leading-relaxed">{item.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Section 5: Practice Areas – subtitle "Our Expertise", 2×3 grid, no card CTA -->
		<section id="services" class="py-20 md:py-28 bg-base-100" aria-labelledby="services-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<p class="text-sm font-medium text-base-content/70 uppercase tracking-wider mb-2">{content.services.subtitle}</p>
					<div class="w-12 h-0.5 bg-primary mx-auto mb-4" aria-hidden="true"></div>
					<h2 id="services-heading" class="section-heading mx-auto mb-4">
						{content.services.heading}
					</h2>
					<p class="section-lead mx-auto">
						{content.services.subtext}
					</p>
				</header>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{#each content.services.items as service, i}
						{@const Icon = serviceIconsByIndex[i] ?? Scale}
						<div class="card bg-base-200/50 shadow-sm border border-base-300/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 flex flex-col">
							<div class="card-body p-6 flex flex-col flex-1">
								<div class="rounded-lg bg-primary/10 w-fit p-3 text-primary mb-4" aria-hidden="true">
									<Icon class="w-7 h-7" />
								</div>
								<h3 class="card-title text-lg text-base-content mb-2">{service.title}</h3>
								<p class="text-base-content/80 text-sm leading-relaxed flex-1">{service.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Section 6: Meet Our Attorneys – subtitle "Our Team", 4 profiles -->
		<section id="attorneys" class="py-20 md:py-28 bg-base-200/60" aria-labelledby="attorneys-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<p class="text-sm font-medium text-base-content/70 uppercase tracking-wider mb-2">{content.attorneys.subtitle}</p>
					<div class="flex items-center justify-center gap-3 mb-4">
						<div class="w-8 h-0.5 bg-primary" aria-hidden="true"></div>
						<h2 id="attorneys-heading" class="section-heading mb-0">
							{content.attorneys.heading}
						</h2>
						<div class="w-8 h-0.5 bg-primary" aria-hidden="true"></div>
					</div>
					<p class="section-lead mx-auto">{content.attorneys.subtext}</p>
				</header>
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
					{#each content.attorneys.items as attorney}
						<div class="card bg-base-100 shadow-sm border border-base-300/60 rounded-xl overflow-hidden">
							<figure class="aspect-square overflow-hidden">
								<img
									src={attorney.image}
									alt={attorney.name}
									class="object-cover w-full h-full"
									loading="lazy"
									width="300"
									height="300"
								/>
							</figure>
							<div class="card-body p-4">
								<h3 class="font-semibold text-base-content">{attorney.name}</h3>
								<p class="text-sm text-base-content/70">{attorney.title}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Section 7: Testimonials – navy bg, subtitle "Testimonials", 3 cards -->
		<section id="testimonials" class="py-20 md:py-28 bg-neutral text-neutral-content" aria-labelledby="testimonials-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<p class="text-sm font-medium text-neutral-content/80 uppercase tracking-wider mb-2">{content.testimonials.subtitle}</p>
					<div class="flex items-center justify-center gap-3 mb-4">
						<div class="w-8 h-0.5 bg-primary" aria-hidden="true"></div>
						<h2 id="testimonials-heading" class="text-2xl md:text-3xl font-bold text-neutral-content mb-0">
							{content.testimonials.heading}
						</h2>
						<div class="w-8 h-0.5 bg-primary" aria-hidden="true"></div>
					</div>
				</header>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
					{#each content.testimonials.items as t}
						<div class="rounded-xl bg-neutral-content/5 border border-neutral-content/10 p-6 md:p-8 flex flex-col">
							<Quote class="w-10 h-10 text-primary/80 mb-4 flex-shrink-0" aria-hidden="true" />
							<blockquote class="text-neutral-content/95 italic text-[15px] leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
							<footer class="mt-5 pt-4 border-t border-neutral-content/20">
								<p class="font-semibold text-neutral-content">{t.author}</p>
								<p class="text-sm text-neutral-content/80">{t.role}</p>
							</footer>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Section 8: Schedule Consultation – left: 3 bullets (Confidential, Expert, Personalized); right: Request a Call Back form -->
		<section id="consultation" class="py-20 md:py-28 bg-base-100" aria-labelledby="consultation-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
					<div>
						<h2 id="consultation-heading" class="section-heading mb-4">
							{content.consultation.heading}
						</h2>
						<p class="text-base-content/80 mb-8 max-w-md">
							{content.consultation.subtext}
						</p>
						<ul class="space-y-4" role="list">
							{#each content.consultation.bullets as bullet, i}
								{@const Icon = consultationBulletIcons[i] ?? Lock}
								<li class="flex items-start gap-4">
									<div class="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0" aria-hidden="true">
										<Icon class="w-5 h-5" />
									</div>
									<div>
										<p class="font-semibold text-base-content">{bullet.title}</p>
										<p class="text-base-content/80 text-sm mt-0.5">{bullet.description}</p>
									</div>
								</li>
							{/each}
						</ul>
					</div>
					<div class="rounded-2xl bg-base-200/50 border border-base-300/80 p-6 md:p-8 shadow-sm">
						<h3 class="font-semibold text-lg text-base-content mb-6">{content.consultation.formTitle}</h3>
						<form onsubmit={handleConsultationSubmit} class="space-y-4">
							<div class="space-y-2">
								<label for="consult-name" class="label text-sm font-medium text-base-content">{content.consultation.form.name}</label>
								<input
									id="consult-name"
									type="text"
									bind:value={consultationName}
									class="input input-bordered w-full bg-base-100"
									placeholder="Name"
								/>
							</div>
							<div class="space-y-2">
								<label for="consult-email" class="label text-sm font-medium text-base-content">{content.consultation.form.email}</label>
								<input
									id="consult-email"
									type="email"
									bind:value={consultationEmail}
									class="input input-bordered w-full bg-base-100"
									placeholder="Email"
								/>
							</div>
							<div class="space-y-2">
								<label for="consult-phone" class="label text-sm font-medium text-base-content">{content.consultation.form.phone}</label>
								<input
									id="consult-phone"
									type="tel"
									bind:value={consultationPhone}
									class="input input-bordered w-full bg-base-100"
									placeholder="Phone"
								/>
							</div>
							<div class="space-y-2">
								<label for="consult-service" class="label text-sm font-medium text-base-content">{content.consultation.form.serviceNeeded}</label>
								<select
									id="consult-service"
									bind:value={consultationService}
									class="select select-bordered w-full bg-base-100"
								>
									{#each content.consultation.serviceOptions as opt}
										<option value={opt}>{opt}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<label for="consult-message" class="label text-sm font-medium text-base-content">{content.consultation.form.message}</label>
								<textarea
									id="consult-message"
									bind:value={consultationMessage}
									class="textarea textarea-bordered w-full bg-base-100 min-h-[100px]"
									placeholder="Message"
								></textarea>
							</div>
							<button type="submit" class="btn btn-neutral w-full text-neutral-content hover:bg-neutral/90">
								{content.consultation.form.submit}
							</button>
							<p class="text-xs text-base-content/60 text-center">
								{content.consultation.form.privacyNote}
							</p>
						</form>
					</div>
				</div>
			</div>
		</section>

	</main>

	<!-- Section 9: Footer – navy, logo + tagline + social | Quick Links | Practice Areas | Contact Info; bottom: copyright, Privacy, Terms -->
	<footer id="contact" class="bg-neutral text-neutral-content border-t border-neutral-content/10">
		<div class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
				<div>
					<p class="font-bold text-lg text-neutral-content">{displayName}</p>
					<p class="text-neutral-content/80 text-sm mt-2">{content.footer.tagline}</p>
					<div class="flex gap-4 mt-4" aria-label="Social links">
						<a href="#" class="text-neutral-content/80 hover:text-neutral-content transition-colors" aria-label="Facebook"><span class="text-lg">f</span></a>
						<a href="#" class="text-neutral-content/80 hover:text-neutral-content transition-colors" aria-label="Twitter"><span class="text-lg">𝕏</span></a>
						<a href="#" class="text-neutral-content/80 hover:text-neutral-content transition-colors" aria-label="LinkedIn"><span class="text-lg">in</span></a>
					</div>
				</div>
				<div>
					<h3 class="font-semibold text-neutral-content mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
					<nav class="flex flex-col gap-3">
						{#each content.footer.quickLinks as link}
							<a href={link.href} class="text-neutral-content/80 hover:text-neutral-content text-sm transition-colors w-fit">
								{link.label}
							</a>
						{/each}
					</nav>
				</div>
				<div>
					<h3 class="font-semibold text-neutral-content mb-4 text-sm uppercase tracking-wider">Practice Areas</h3>
					<nav class="flex flex-col gap-3">
						{#each content.footer.practiceAreas as link}
							<a href={link.href} class="text-neutral-content/80 hover:text-neutral-content text-sm transition-colors w-fit">
								{link.label}
							</a>
						{/each}
					</nav>
				</div>
				<div>
					<h3 class="font-semibold text-neutral-content mb-4 text-sm uppercase tracking-wider">{content.footer.contactHeading}</h3>
					<p class="text-neutral-content/80 text-sm">{displayAddress}</p>
					<a href={`tel:${displayPhone.replace(/\D/g, '')}`} class="text-neutral-content/80 hover:text-neutral-content text-sm block mt-2">{displayPhone}</a>
					<a href={"mailto:" + displayEmail} class="text-neutral-content/80 hover:text-neutral-content text-sm block mt-1 break-all">{displayEmail}</a>
				</div>
			</div>
		</div>
		<div class="border-t border-neutral-content/10 px-4 py-6">
			<div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-content/60">
				<p>© {new Date().getFullYear()} {displayName}. {content.footer.copyright}</p>
				<nav class="flex gap-6">
					{#each content.footer.legal as link}
						<a href={link.href} class="text-neutral-content/60 hover:text-neutral-content/80 transition-colors">{link.label}</a>
					{/each}
				</nav>
			</div>
		</div>
	</footer>

	<ChatWidget industrySlug={industrySlug} displayName={displayName} prospectId={prospect.id} />
</div>

{#if website}
	<p class="sr-only">Website: {website}</p>
{/if}

<style>
	.legal-landing details summary::-webkit-details-marker {
		display: none;
	}
	.legal-landing a:focus-visible,
	.legal-landing button:focus-visible {
		outline: 2px solid oklch(var(--p));
		outline-offset: 2px;
	}
	.legal-landing .section-heading {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
		color: oklch(var(--bc));
	}
	.legal-landing .section-lead {
		color: oklch(var(--bc) / 0.8);
		line-height: 1.7;
		max-width: 42rem;
	}
</style>
