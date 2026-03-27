<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    hero,
    stats,
    services,
    industries,
    problemsWeSolve,
    servicesIntro,
    faqItems,
    caseStudies,
    ctaBlock,
    voiceAiPhoneNumber,
    processIntro,
    processSteps,
  } from "$lib/content/site";
  import { websitePage } from "$lib/content/service-pages";
  import { buildFAQSchema } from "$lib/content/seo";
  import { industryIcons } from "$lib/content/industry-icons";

  const faqSchema = buildFAQSchema(faqItems);

  const serviceIllustrations: Record<string, string> = {
    "voice-ai": "voice.svg",
    "workflow-automation": "automation.svg",
    "website-seo": "website.svg",
  };

  const featuredIndustries = industries.slice(0, 4);

  const tickerItems = [
    "Voice AI",
    "Business Automation",
    "Lead Capture",
    "Appointment Booking",
    "CRM Integration",
    "Toronto & GTA",
    "24/7 Answering",
    "Workflow Automation",
    "Website & SEO",
  ] as const;

</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<!-- Hero: headline + CTA + hourglass (overflow-x only so tall content is not clipped vertically) -->
<section
  class="relative flex min-h-[100svh] items-center overflow-x-hidden text-white lg:min-h-0"
  style="background: radial-gradient(ellipse 80% 70% at 50% 100%, #3a00ff 0%, #280066 25%, #1e004d 50%, #150033 75%, #0a0015 100%);"
>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_140%_120%_at_50%_100%,rgba(58,0,255,0.25)_0%,transparent_50%)]"></div>
  <div class="absolute inset-x-0 top-0 h-px bg-white/10"></div>

  <!-- Hourglass: anchored right, soft fade toward the left (into copy / gradient) -->
  <div
    class="pointer-events-none absolute inset-y-0 right-0 z-0 w-[min(92vw,28rem)] sm:w-[min(88vw,32rem)] md:w-[min(85vw,36rem)] lg:w-[min(42vw,28rem)] xl:w-[min(38vw,30rem)]"
    aria-hidden="true"
  >
    <img
      src="/images/hero-hourglass.png"
      alt=""
      class="hero-hourglass-img h-full w-full object-contain object-right"
      loading="eager"
      decoding="async"
      width="480"
      height="720"
    />
  </div>

  <div class="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 md:py-32 lg:px-8 lg:pt-44 lg:pb-32">
    <div class="max-w-2xl">
      <p class="hp-eyebrow text-xs font-medium uppercase tracking-[0.25em] text-white/50">
        {hero.eyebrow}
      </p>

      <h1 class="hp-headline mt-6 text-5xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl md:leading-[1.1]">
        We give your <em class="not-italic text-primary">time</em> back
      </h1>

      <p class="hp-sub mt-4 text-base leading-7 text-white/70">
        {hero.subhead}
      </p>

      <div class="hp-ctas mt-10 flex flex-wrap gap-3">
        <Button
          href="#cta"
          size="lg"
          class="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {hero.ctaPrimary}
        </Button>

        <Button
          href="#services"
          size="lg"
          variant="outline"
          class="border-white/30 text-primary hover:bg-background hover:text-primary"
        >
          {hero.ctaSecondary}
        </Button>
      </div>

      <div class="mt-12 border-t border-white/10 pt-10 flex flex-wrap gap-x-10 gap-y-7">
        {#each stats as stat}
          <div class="min-w-[140px]">
            <div class="text-4xl font-semibold leading-none tracking-tight text-white">
              {stat.value}
            </div>
            <div class="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              {stat.label}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  /* Fade hourglass toward the left so it blends into the purple hero gradient */
  .hero-hourglass-img {
    -webkit-mask-image: linear-gradient(to left, #000 28%, transparent 100%);
    mask-image: linear-gradient(to left, #000 28%, transparent 100%);
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
  }
  @media (min-width: 1024px) {
    .hero-hourglass-img {
      -webkit-mask-image: linear-gradient(to left, #000 35%, transparent 100%);
      mask-image: linear-gradient(to left, #000 35%, transparent 100%);
    }
  }

</style>

<section
  class="relative overflow-hidden py-16 text-white md:py-20"
  style="background: radial-gradient(ellipse 80% 60% at 50% 50%, #1e004d 0%, #150033 40%, #0a0015 100%);"
>
  <div class="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden="true"></div>
  <div class="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
    <div class="border-y border-white/10 py-3" role="presentation">
      <div class="flex flex-wrap justify-center gap-x-8 gap-y-2">
        {#each tickerItems as item (item)}
          <span class="whitespace-nowrap text-[11px] font-semibold tracking-[0.12em] uppercase text-white/60">
            {item}
          </span>
        {/each}
      </div>
    </div>

    <!-- The problem -->
    <div class="mt-14">
      <div class="text-xs font-semibold uppercase tracking-[0.14em] text-primary flex items-center gap-3">
        <span class="h-px w-4 bg-primary" aria-hidden="true"></span>
        The problem
      </div>
      <h2 class="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
        Where you're<br />
        losing revenue
      </h2>

      <div class="mt-10 grid gap-6 md:grid-cols-3">
        {#each problemsWeSolve as problem, idx (problem.slug)}
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div class="text-5xl font-semibold text-white/10 leading-none mb-3">
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div class="text-xl font-semibold tracking-tight">{problem.title}</div>
            <p class="mt-3 text-sm leading-relaxed text-white/70">{problem.description}</p>
            <div class="mt-4 text-sm font-semibold text-primary">
              → {problem.solution}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Solution – Operational AI Stack -->

<section id="services" class="bg-white py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Services</p>

    <h2 class="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
      Three solutions.<br />
      One leaky bucket <span class="italic">fixed.</span>
    </h2>

    <p class="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
      {servicesIntro}
    </p>

    <div class="mt-10 grid gap-6 grid-cols-1">
      {#each services as service}
        <div
          id={service.slug}
          class="scroll-mt-24 flex flex-col md:grid md:grid-cols-[3fr_1fr] md:items-center gap-6 md:gap-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm"
        >
          <!-- Left: content -->
          <div class="min-w-0">
            {#if service.popular}
              <div class="mb-4">
                <Badge variant="secondary" class="border-0 bg-primary/10 text-primary text-xs">Most Popular</Badge>
              </div>
            {/if}

            <h3 class="text-xl font-semibold tracking-tight text-foreground">{service.title}</h3>
            <p class="mt-1 text-sm font-medium text-primary">{service.tagline}</p>

            <p class="mt-4 text-sm leading-6 text-muted-foreground">{service.description}</p>

            <ul class="mt-5 space-y-2">
              {#each service.bullets as bullet}
                <li class="flex items-start gap-2 text-sm leading-6 text-foreground">
                  <span class="mt-1 text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
              <a href={service.href} class="text-primary hover:underline">{service.cta}</a>
              {#if service.slug === "voice-ai"}
                <a href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`} class="text-primary hover:underline">Call</a>
              {/if}
            </div>
          </div>

          <!-- Right: image -->
          <div class="flex-shrink-0 flex justify-center md:justify-end">
            <img
              src={`/images/${serviceIllustrations[service.slug]}`}
              alt={`${service.title} illustration`}
              width="128"
              height="128"
              loading="lazy"
              class="h-24 w-24 md:h-32 md:w-32 object-contain"
            />
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- How it works -->
<section id="how-it-works" class="bg-zinc-50 py-16 md:py-24 scroll-mt-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</div>
    <h2 class="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
      Go from first call to fully automated<br />
      in weeks, not months
    </h2>
    <p class="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
      {processIntro}
    </p>

    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each processSteps as step, idx (step.step)}
        <div class="rounded-2xl border border-border/60 bg-white p-7">
          <div class="text-5xl font-semibold text-primary/10 leading-none mb-3">
            {step.step}
          </div>
          <div class="text-xl font-semibold tracking-tight">{step.title}</div>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          <div class="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {["Day 1", "Week 1", "Week 2–3", "Month 1+"][idx] ?? ""}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Case study -->
<section id="case-study" class="bg-white py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="rounded-2xl border border-border/60 bg-white p-6 shadow-sm md:p-8">
      <div class="grid gap-8 md:grid-cols-[3fr_1.6fr] md:items-center">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Case study</p>
          <h2 class="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {caseStudies[0].title}
          </h2>
          <p class="mt-4 text-lg leading-7 text-muted-foreground">
            {caseStudies[0].outcome}
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium">
            <a href={caseStudies[0].href} class="text-primary hover:underline">
              {caseStudies[0].cta} →
            </a>
          </div>
        </div>

        <div class="flex justify-center md:justify-end">
          <img
            src="/images/case-studies/ohmyglass-aluminum-storefront.jpg"
            alt="OhMyGlass storefront case study"
            width="800"
            height="520"
            loading="lazy"
            class="h-56 w-full rounded-xl object-cover md:h-72 md:w-auto md:max-w-[420px]"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- About -->
<section id="about" class="bg-zinc-50 py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About</div>
    <h2 class="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
      Two founders.<br />
      <span class="italic">Zero middlemen.</span>
    </h2>

    <div class="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-2xl border border-border/60 bg-white p-7">
        <p class="text-base leading-relaxed text-muted-foreground">
          We're Ed and Sy, a two-person Toronto agency that actually implements what we sell. <strong>No offshore team, no project managers, no account reps. When you email us, Ed or Sy answers.</strong>
        </p>
        <p class="mt-4 text-base leading-relaxed text-muted-foreground">
          We started Ed &amp; Sy because we watched too many Toronto service businesses lose customers to broken systems, not bad service. A missed call here, a slow follow-up there. We knew AI could fix it and that nobody was making it accessible to businesses without a tech team.
        </p>
        <p class="mt-4 text-base leading-relaxed text-muted-foreground">
          Every client gets <strong>direct access to both founders</strong>, a solution built for their workflow, and support that doesn't disappear after launch.
        </p>

        <div class="mt-8 grid grid-cols-3 gap-6">
          <div>
            <div class="text-3xl font-semibold tracking-tight">Toronto</div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Based</div>
          </div>
          <div>
            <div class="text-3xl font-semibold tracking-tight">2</div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Founders only</div>
          </div>
          <div>
            <div class="text-3xl font-semibold tracking-tight">Direct</div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Access always</div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="rounded-2xl border border-border/60 bg-white p-7">
          <div class="text-xl font-semibold tracking-tight">Ed</div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-1">Co-Founder · Tech Lead</div>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            Deep background in AI implementation and systems integration. Turns complex automation into things that actually work inside real businesses, not just demos.
          </p>
        </div>

        <div class="rounded-2xl border border-border/60 bg-white p-7">
          <div class="text-xl font-semibold tracking-tight">Sy</div>
          <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-1">Co-Founder · AI Specialist</div>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            Operations and AI background. Finds exactly where your business leaks time and money, then closes those gaps with the right tools and no unnecessary complexity.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Industries -->
<section id="industries" class="bg-zinc-50 py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Related</p>
    <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each featuredIndustries.slice(0, 4) as ind}
        <a
          href={ind.href}
          class="block rounded-xl border border-border/60 bg-white p-5 hover:border-primary/30"
        >
          {#if industryIcons[ind.slug]}
            {@const Icon = industryIcons[ind.slug]}
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon class="h-4 w-4" />
            </div>
          {/if}
          <h3 class="mt-3 font-semibold tracking-tight text-foreground">{ind.name}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{ind.description}</p>
        </a>
      {/each}
    </div>
    <p class="mt-6">
      <a href="/industries" class="text-sm font-medium text-primary hover:underline">View all industries →</a>
    </p>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="bg-white py-16 md:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</div>
    <h2 class="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
      Questions before<br />
      every first call
    </h2>
    <div class="mt-10 grid gap-1 sm:grid-cols-2">
      {#each faqItems as item}
        <div class="rounded-2xl border border-border/60 bg-zinc-50 p-7">
          <div class="text-lg font-semibold leading-7 tracking-tight">{item.question}</div>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Final CTA -->
<section id="contact" class="bg-white pb-24 md:pb-32">
  <div id="cta" class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="overflow-hidden rounded-2xl border border-white/10 text-white shadow-xl" style="background: radial-gradient(ellipse 100% 80% at 50% 0%, #280066 0%, #1e004d 35%, #150033 100%);">
      <div class="p-8 md:p-12 text-center">
        <div class="text-xs font-semibold uppercase tracking-[0.14em] text-primary flex items-center justify-center gap-3 mb-5">
          <span class="h-px w-4 bg-primary" aria-hidden="true"></span>
          Get started
        </div>

        <h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Stop losing leads<br />
          to <span class="italic text-primary">voicemail.</span>
        </h2>

        <p class="mt-4 max-w-xl mx-auto text-lg text-slate-300">
          {ctaBlock.subhead}
        </p>

        <div class="mt-8">
          <Button
            href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`}
            size="lg"
            class="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {ctaBlock.button}
          </Button>
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
          <span class="font-medium text-primary">✓ No commitment</span>
          <span class="font-medium text-primary">✓ 30-minute call</span>
          <span class="font-medium text-primary">✓ Custom roadmap</span>
          <span class="font-medium text-primary">✓ Toronto-based team</span>
        </div>
      </div>
    </div>
  </div>
</section>
