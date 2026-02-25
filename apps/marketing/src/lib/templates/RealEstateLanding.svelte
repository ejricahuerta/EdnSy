<script lang="ts">
	import { CAL_COM_LINK, DEMO_PHONE, YONGE_FINCH_MAP_EMBED_URL } from '$lib/constants';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import { realEstateDemoContent } from '$lib/content/realEstate';
	import {
		Home,
		TrendingUp,
		Key,
		Clock,
		Users,
		ArrowRight,
		MapPin,
		Phone,
		Mail,
		ChevronDown,
		Quote,
		Calendar,
		FileCheck,
		ClipboardList,
		Star,
		CreditCard
	} from 'lucide-svelte';

	let {
		companyName = '',
		website = '',
		address = '',
		city = '',
		industrySlug = 'real-estate'
	}: {
		companyName?: string;
		website?: string;
		address?: string;
		city?: string;
		industrySlug?: string;
	} = $props();

	const content = realEstateDemoContent;
	const displayAddress = address || content.contact.address;
	const displayName = companyName || 'Your real estate agent';
	const heroHeadline = city
		? content.hero.taglineWithCity.replace('{city}', city)
		: displayName;
	const heroSubline = city ? displayName : content.hero.tagline;
	const urgencyText = content.hero.urgencyText ?? '';

	const serviceIcons = { Home, TrendingUp, Key } as const;
	const whyIcons = [Home, TrendingUp, Key] as const;

	const newPatientsCardTitle =
		(content.newPatients as { whatToBringTitle?: string }).whatToBringTitle ?? 'What to bring';
	const footerCtaHeading = (content.footer as { ctaHeading?: string }).ctaHeading ?? 'Book a visit';
</script>

<div class="real-estate-landing flex flex-col min-h-screen">
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300/80 shadow-sm">
		<nav class="navbar min-h-16 lg:min-h-[4.25rem] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 gap-2">
			<div class="navbar-start flex-1 min-w-0">
				<a href="/" class="text-lg sm:text-xl font-bold text-base-content truncate tracking-tight hover:text-primary transition-colors">{displayName}</a>
			</div>
			<div class="navbar-end flex-none">
				<a
					href={CAL_COM_LINK}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary btn-sm sm:btn-md shadow-sm hover:shadow transition-shadow"
				>
					{content.header.ctaLabel}
				</a>
			</div>
		</nav>
	</header>

	<main class="flex-1">
		<!-- Hero -->
		<section
			class="relative min-h-[80vh] flex flex-col justify-end pb-16 md:pb-24 pt-24 md:pt-32"
			aria-labelledby="hero-heading"
		>
			<div
				class="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style="background-image: url('{content.hero.image}');"
				role="img"
				aria-label={content.hero.imageAlt}
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-base-content/80 via-base-content/50 to-base-content/40"></div>
			<div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-base-100">
				{#if content.hero.badge && !city}
					<span class="badge badge-primary badge-lg mb-5 shadow-lg border-0">{content.hero.badge}</span>
				{/if}
				<h1 id="hero-heading" class="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg tracking-tight leading-tight">
					{heroHeadline}
				</h1>
				<p class="text-xl md:text-2xl font-semibold mb-6 drop-shadow text-base-100/95 max-w-2xl mx-auto">
					{city ? content.hero.subheadline : (content.hero.subheadline || heroSubline)}
				</p>
				{#if urgencyText}
					<p class="text-sm text-base-100/90 mb-6 drop-shadow font-medium">{urgencyText}</p>
				{/if}
				<div class="flex flex-wrap justify-center gap-4">
					<a
						href={CAL_COM_LINK}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary btn-lg text-primary-content gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
					>
						{content.hero.ctaPrimary}
						<ArrowRight class="w-5 h-5" />
					</a>
					{#if content.hero.ctaSecondary}
						<a
							href="#services"
							class="btn btn-outline btn-lg border-2 border-base-100 text-base-100 hover:bg-base-100 hover:text-base-content gap-2 transition-all hover:-translate-y-0.5"
						>
							{content.hero.ctaSecondary}
							<ArrowRight class="w-5 h-5" />
						</a>
					{/if}
				</div>
				<div class="mt-12 pt-8 border-t border-base-100/30 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center max-w-3xl mx-auto">
					{#each content.stats as stat}
						<div>
							<p class="text-4xl md:text-5xl font-bold drop-shadow tracking-tight">{stat.value}</p>
							<p class="text-base-100/90 font-medium mt-1 text-sm drop-shadow">{stat.label}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Why choose us -->
		<section class="py-16 md:py-24 bg-base-100" aria-labelledby="why-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<h2 id="why-heading" class="section-heading mx-auto mb-4">
						{content.whyUs.heading}
					</h2>
					<p class="section-lead mx-auto text-center">{content.whyUs.subtext}</p>
				</header>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-14">
					{#each content.whyUs.items as item, i}
						{@const Icon = whyIcons[i]}
						<div class="flex flex-col items-center text-center group">
							<div class="rounded-2xl bg-primary/10 p-5 text-primary mb-6 transition-colors group-hover:bg-primary/20" aria-hidden="true">
								<Icon class="w-9 h-9" />
							</div>
							<h3 class="font-semibold text-lg text-base-content mb-3">{item.title}</h3>
							<p class="text-base-content/80 text-[15px] leading-relaxed max-w-xs">{item.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Services -->
		<section id="services" class="py-20 md:py-28 bg-base-200/50" aria-labelledby="services-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<h2 id="services-heading" class="section-heading mx-auto mb-4">
						{content.services.heading}
					</h2>
					<p class="section-lead mx-auto">
						{content.services.subtext}
					</p>
				</header>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
					{#each content.services.items as service}
						{@const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] ?? Home}
						<div class="card bg-base-100 shadow-md border border-base-300/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 flex flex-col">
							<div class="card-body p-6 md:p-8 flex flex-col flex-1">
								<div class="rounded-xl bg-primary/10 w-fit p-3.5 text-primary mb-5" aria-hidden="true">
									<Icon class="w-8 h-8" />
								</div>
								<h3 class="card-title text-lg md:text-xl text-base-content mb-3">{service.title}</h3>
								<p class="text-base-content/80 text-[15px] leading-relaxed flex-1">{service.description}</p>
								<a
									href={CAL_COM_LINK}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-primary btn-sm mt-6 gap-2 w-fit transition-all hover:gap-3"
								>
									{content.header.ctaLabel}
									<ArrowRight class="w-4 h-4" />
								</a>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- About -->
		<section id="about" class="py-20 md:py-28 bg-base-100" aria-labelledby="about-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
					<div class="lg:pr-4">
						<h2 id="about-heading" class="section-heading mb-6">
							{content.about.heading}
						</h2>
						<div class="prose-block space-y-5 text-base-content/80">
							<p>{content.about.subtext}</p>
							<p>{content.about.subtext2}</p>
						</div>
						<ul class="space-y-4 mt-8" role="list">
							{#each content.about.bullets as bullet}
								<li class="flex items-start gap-3 text-base-content/80 text-[15px] leading-relaxed">
									<Users class="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
									<span>{bullet}</span>
								</li>
							{/each}
						</ul>
					</div>
					<div class="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-base-300/50 aspect-[4/3] lg:min-h-[320px]">
						<img
							src={content.about.image}
							alt={content.about.imageAlt}
							class="object-cover w-full h-full"
							loading="lazy"
							width="800"
							height="600"
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- Your first visit -->
		<section id="new-patients" class="py-20 md:py-28 bg-base-200/50" aria-labelledby="new-patients-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-12">
					<h2 id="new-patients-heading" class="section-heading mx-auto mb-4">
						{content.newPatients.heading}
					</h2>
					<p class="section-lead mx-auto mb-2">
						{content.newPatients.subtext}
					</p>
					{#if content.newPatients.switchingEasy}
						<p class="font-semibold text-primary mt-4">{content.newPatients.switchingEasy}</p>
					{/if}
				</header>

				<div class="grid grid-cols-1 {content.newPatients.whatToBring?.length ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-10 lg:gap-14 items-start">
					{#if content.newPatients.whatToBring && content.newPatients.whatToBring.length > 0}
						<div class="lg:sticky lg:top-24 space-y-6">
							<div class="p-6 md:p-8 rounded-2xl bg-base-100 border border-base-300/80 shadow-sm">
								<h3 class="font-semibold text-base-content mb-5">{newPatientsCardTitle}</h3>
								<ul class="space-y-3" role="list">
									{#each content.newPatients.whatToBring as item}
										<li class="flex items-center gap-3 text-base-content/80 text-[15px] leading-relaxed">
											<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold" aria-hidden="true">✓</span>
											<span>{item}</span>
										</li>
									{/each}
								</ul>
							</div>
							<a
								href={CAL_COM_LINK}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-primary btn-lg gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 w-full"
							>
								{content.newPatients.ctaLabel}
								<ArrowRight class="w-5 h-5" />
							</a>
						</div>
					{/if}

					<div class="space-y-6">
						<div class="grid grid-cols-1 gap-6">
							{#each content.newPatients.steps as step, i}
								{@const StepIcon = [Calendar, FileCheck, ClipboardList][i] ?? ClipboardList}
								<div class="card bg-base-100 shadow-md border border-base-300/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
									<div class="card-body p-6 md:p-6 flex flex-row gap-4">
										<div class="rounded-xl bg-primary/10 w-fit h-fit p-3 text-primary shrink-0" aria-hidden="true">
											<StepIcon class="w-7 h-7" />
										</div>
										<div class="min-w-0">
											<h3 class="card-title text-lg mb-2">{step.title}</h3>
											<p class="text-base-content/80 text-[15px] leading-relaxed">{step.description}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				{#if !content.newPatients.whatToBring?.length}
					<div class="max-w-2xl mx-auto mt-10 text-center">
						<a
							href={CAL_COM_LINK}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-primary btn-lg gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
						>
							{content.newPatients.ctaLabel}
							<ArrowRight class="w-5 h-5" />
						</a>
					</div>
				{/if}
			</div>
		</section>

		<!-- What to expect -->
		<section class="py-20 md:py-28 bg-base-100" aria-labelledby="expect-heading">
			<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-12">
					<h2 id="expect-heading" class="section-heading mx-auto mb-4">
						{content.whatToExpect.heading}
					</h2>
					<p class="section-lead mx-auto">{content.whatToExpect.subtext}</p>
				</header>
				<ul class="space-y-4" role="list">
					{#each content.whatToExpect.items as item, i}
						<li class="flex items-start gap-5 p-5 md:p-6 rounded-xl bg-base-200/60 border border-base-300/50 transition-colors hover:bg-base-200/80">
							<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-semibold text-sm" aria-hidden="true">{i + 1}</span>
							<span class="text-base-content/90 pt-1.5 text-[15px] leading-relaxed">{item}</span>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- Testimonials -->
		<section class="py-20 md:py-28 bg-base-200/50" aria-labelledby="testimonials-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-12">
					<h2 id="testimonials-heading" class="section-heading mx-auto mb-4">
						{content.testimonials.heading}
					</h2>
					<p class="section-lead mx-auto mb-2">{content.testimonials.subtext}</p>
					{#if content.testimonials.ratingDisplay || content.testimonials.reviewCount}
						<p class="mt-6 flex flex-wrap items-center justify-center gap-2">
							{#if content.testimonials.ratingDisplay}
								<span class="inline-flex items-center gap-1.5 font-semibold text-base-content">
									<Star class="w-5 h-5 fill-primary text-primary" aria-hidden="true" />
									{content.testimonials.ratingDisplay}
								</span>
							{/if}
							{#if content.testimonials.reviewCount}
								<span class="text-base-content/70 text-sm">({content.testimonials.reviewCount})</span>
							{/if}
						</p>
					{/if}
				</header>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
					{#each content.testimonials.items as t}
						<div class="card bg-base-100 shadow-md border border-base-300/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
							<div class="card-body p-6 md:p-8 flex flex-col flex-1">
								<div class="flex gap-1 mb-3" aria-hidden="true">
									{#each Array.from({ length: t.rating ?? 5 }) as _}
										<Star class="w-4 h-4 fill-primary text-primary shrink-0" />
									{/each}
								</div>
								<Quote class="w-10 h-10 text-primary/40 mb-3 flex-shrink-0" aria-hidden="true" />
								<blockquote class="text-base-content/90 italic text-[15px] leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
								<footer class="mt-5 pt-4 border-t border-base-300/50">
									<p class="font-semibold text-base-content">{t.author}</p>
									<p class="text-sm text-base-content/70">{t.role}</p>
								</footer>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- FAQ -->
		<section id="faq" class="py-20 md:py-28 bg-base-100" aria-labelledby="faq-heading">
			<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-12">
					<h2 id="faq-heading" class="section-heading mx-auto">
						{content.faq.heading}
					</h2>
				</header>
				<div class="join join-vertical w-full gap-0 rounded-2xl overflow-hidden border border-base-300/80 shadow-sm">
					{#each content.faq.items as item}
						<details class="join-item group border-0 border-b border-base-300/60 last:border-b-0 bg-base-100">
							<summary class="flex cursor-pointer items-start justify-between gap-4 px-6 py-5 font-medium text-base-content hover:bg-base-200/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
								<span class="pr-4 text-left">{item.q}</span>
								<ChevronDown class="w-5 h-5 shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-180 text-base-content/60" />
							</summary>
							<div class="px-6 pb-6 pt-0 text-base-content/80 border-t border-base-300/40 bg-base-100">
								<p class="pt-3 text-[15px] leading-relaxed" style="line-height: 1.75;">{item.a}</p>
							</div>
						</details>
					{/each}
				</div>
			</div>
		</section>

		<!-- Contact -->
		<section id="contact" class="py-20 md:py-28 bg-base-200/50" aria-labelledby="contact-heading">
			<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<header class="text-center mb-14">
					<h2 id="contact-heading" class="section-heading mx-auto mb-4">
						{content.contact.heading}
					</h2>
					<p class="section-lead mx-auto">
						{content.contact.subtext}
					</p>
				</header>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
					<div class="space-y-5">
						<div class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
							<h3 class="font-semibold text-base-content mb-2 flex items-center gap-2">
								<MapPin class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
								Location
							</h3>
							<p class="text-base-content/80 text-[15px] leading-relaxed pl-7">{displayAddress}</p>
						</div>
						<div id="hours" class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
							<h3 class="font-semibold text-base-content mb-2 flex items-center gap-2">
								<Clock class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
								{content.hours.heading}
							</h3>
							<ul class="space-y-1.5 text-base-content/80 text-[15px] leading-relaxed pl-7" role="list">
								{#each content.hours.lines as line}
									<li>{line}</li>
								{/each}
							</ul>
						</div>
						<div id="insurance" class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm" aria-labelledby="insurance-heading">
							<h3 id="insurance-heading" class="font-semibold text-base-content mb-2 flex items-center gap-2">
								<CreditCard class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
								{content.insurance.heading}
							</h3>
							<p class="text-base-content/80 text-[15px] leading-relaxed pl-7" style="line-height: 1.75;">{content.insurance.body}</p>
						</div>
						<div class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
							<h3 class="font-semibold text-base-content mb-2 flex items-center gap-2">
								<Phone class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
								Phone
							</h3>
							<a href={`tel:${DEMO_PHONE}`} class="link link-hover text-base-content/80 hover:text-primary pl-7 block text-[15px]">{content.contact.phone}</a>
						</div>
						<div class="p-6 rounded-xl bg-base-100 border border-base-300/80 shadow-sm">
							<h3 class="font-semibold text-base-content mb-2 flex items-center gap-2">
								<Mail class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
								Email
							</h3>
							<a href={"mailto:" + content.contact.email} class="link link-hover text-base-content/80 hover:text-primary break-all pl-7 block text-[15px]">{content.contact.email}</a>
						</div>
						<a
							href={CAL_COM_LINK}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-primary gap-2 inline-flex shadow-md hover:shadow-lg transition-all mt-2"
						>
							{content.contact.ctaLabel}
							<ArrowRight class="w-4 h-4" />
						</a>
					</div>
					<div class="rounded-2xl overflow-hidden border border-base-300/80 shadow-lg aspect-video w-full min-h-[280px]">
						<iframe
							title="Map: salon location"
							src={YONGE_FINCH_MAP_EMBED_URL}
							width="100%"
							height="100%"
							style="border:0;"
							allowfullscreen
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
						></iframe>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA strip -->
		<section class="py-20 md:py-28 bg-primary text-primary-content" aria-labelledby="cta-heading">
			<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<h2 id="cta-heading" class="section-heading mb-5 text-primary-content">{content.cta.heading}</h2>
				<p class="text-primary-content/95 mb-4 text-lg leading-relaxed" style="line-height: 1.7;">{content.cta.subtext}</p>
				{#if content.cta.microReassurance}
					<p class="text-primary-content/85 text-sm mb-8">{content.cta.microReassurance}</p>
				{/if}
				<a
					href={CAL_COM_LINK}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-neutral btn-lg gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
				>
					{content.cta.button}
					<ArrowRight class="w-5 h-5" />
				</a>
				{#if content.cta.phoneLabel && content.contact.phone}
					<p class="mt-8 text-primary-content/95 text-[15px]">
						{content.cta.phoneLabel}:
						<a href={`tel:${DEMO_PHONE}`} class="link link-neutral font-semibold hover:underline">{content.contact.phone}</a>
					</p>
				{/if}
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="bg-base-200 text-base-content border-t border-base-300">
		<div class="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-16">
				<div>
					<h3 class="font-semibold text-base-content mb-5 text-sm uppercase tracking-wider opacity-90">
						Quick links
					</h3>
					<nav class="flex flex-col gap-3">
						{#each content.footer.links as link}
							<a href={link.href} class="link link-hover text-base-content/80 hover:text-primary text-sm transition-colors w-fit">
								{link.label}
							</a>
						{/each}
					</nav>
				</div>

				<div class="flex flex-col items-start sm:items-end justify-start">
					<h3 class="font-semibold text-base-content mb-5 text-sm uppercase tracking-wider opacity-90">
						{footerCtaHeading}
					</h3>
					<a
						href={CAL_COM_LINK}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary gap-2 shadow-sm hover:shadow transition-shadow"
					>
						{content.footer.ctaLabel}
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</div>

		<div class="border-t border-base-300 px-4 py-6">
			<div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-base-content/60">
				<p>© {new Date().getFullYear()} {displayName}. {content.footer.copyright}</p>
				<p>Powered by Ed & Sy Inc.</p>
			</div>
		</div>
	</footer>

	<ChatWidget industrySlug={industrySlug} displayName={displayName} />
</div>

{#if website}
	<p class="sr-only">Website: {website}</p>
{/if}

<style>
.real-estate-landing details summary::-webkit-details-marker {
		display: none;
	}
.real-estate-landing a:focus-visible,
.real-estate-landing button:focus-visible {
		outline: 2px solid oklch(var(--p));
		outline-offset: 2px;
	}
.real-estate-landing .section-heading {
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
		color: oklch(var(--bc));
	}
.real-estate-landing .section-lead {
		color: oklch(var(--bc) / 0.8);
		line-height: 1.7;
		max-width: 42rem;
	}
.real-estate-landing .prose-block {
		max-width: 42rem;
		line-height: 1.75;
	}
</style>
