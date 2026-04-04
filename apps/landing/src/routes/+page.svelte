<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import HomeLeadQuiz from "$lib/components/landing/home-lead-quiz.svelte";
  import {
    hero,
    homeKpiSection,
    services,
    industries,
    problemsWeSolve,
    problemsWeSolveIntro,
    servicesIntro,
    faqItems,
    ctaBlock,
    voiceAiPhoneNumber,
    processIntro,
    processSteps,
    homeFeaturedTestimonial,
    caseStudyPreviewOhMyGlass,
    homeLeadQuiz,
  } from "$lib/content/site";
  import { buildFAQSchema } from "$lib/content/seo";
  import { industryIcons } from "$lib/content/industry-icons";

  const faqSchema = buildFAQSchema(faqItems);

  const featuredIndustries = industries.slice(0, 4);

  const heroTickerItems = [
    "Built for Toronto service businesses",
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

<!-- Hero: light band + two-column + trust strip (reference SaaS bg rhythm) -->
<section
  class="relative overflow-x-hidden bg-gradient-to-b from-[#FAFAF9] via-zinc-50 to-zinc-100/90 pb-4 text-foreground"
>
  <div
    class="pointer-events-none absolute inset-x-0 top-0 h-[min(40vh,360px)] bg-[radial-gradient(ellipse_80%_100%_at_50%_-15%,rgba(58,0,255,0.06)_0%,transparent_60%)]"
    aria-hidden="true"
  ></div>

  <div
    class="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 pt-24 sm:pt-28 md:pb-16 md:pt-32 lg:px-8 lg:pb-16 lg:pt-36"
  >
    <div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14">
      <div class="max-w-2xl lg:max-w-none">
        <p class="hp-eyebrow text-xs font-medium uppercase tracking-[0.25em] text-primary/90">
          {hero.eyebrow}
        </p>

        <h1
          class="hp-headline mt-6 text-5xl font-medium tracking-tight text-zinc-900 sm:text-6xl md:text-7xl md:leading-[1.1]"
        >
          We give your <em class="not-italic text-primary">time</em> back
        </h1>

        <p class="hp-sub mt-4 max-w-xl text-base leading-7 text-zinc-600 md:text-lg md:leading-8">
          {hero.subhead}
        </p>

        <div class="hp-ctas mt-10 flex w-full max-w-md flex-col gap-3">
          <Button
            type="button"
            size="lg"
            class="h-12 w-full text-base font-semibold shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({ layout: "month_view" })}
          >
            {hero.ctaPrimary}
          </Button>

          <Button
            href="#case-study"
            size="lg"
            variant="outline"
            class="h-12 w-full text-base font-semibold border-zinc-300 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:text-zinc-900"
          >
            {hero.ctaSecondary}
          </Button>
        </div>
      </div>

      <!-- Hero lead quiz -->
      <div class="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
        <div
          class="pointer-events-none absolute -inset-6 -z-10 rounded-2xl bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(58,0,255,0.12)_0%,transparent_65%)] blur-2xl md:-inset-8"
          aria-hidden="true"
        ></div>
        <div
          class="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.14)]"
        >
          <div
            class="border-b border-zinc-100 bg-gradient-to-br from-primary/[0.07] via-white to-zinc-50/80 px-5 py-5 sm:px-6 sm:py-6"
          >
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {homeLeadQuiz.cardEyebrow}
            </p>
            <h2 class="mt-2 text-xl font-semibold tracking-tight text-zinc-900 sm:text-[1.35rem]">
              {homeLeadQuiz.cardTitle}
            </h2>
            <p class="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-600">
              {homeLeadQuiz.cardSubtitle}
            </p>
          </div>
          <HomeLeadQuiz />
        </div>
      </div>
    </div>

    <!-- Trust strip: full-bleed marquee (right-to-left scroll) -->
    <div
      class="home-ticker relative left-1/2 mt-12 w-screen max-w-[100vw] -translate-x-1/2 md:mt-14"
      role="presentation"
      aria-hidden="true"
    >
      <div class="home-ticker-track">
        <div class="home-ticker-segment flex shrink-0 flex-row flex-nowrap items-center gap-x-8 pr-8 sm:gap-x-10 md:gap-x-12">
          {#each heroTickerItems as item (item)}
            <span
              class="whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-zinc-500 sm:text-[11px]"
            >
              {item}
            </span>
            <span class="leading-none text-zinc-300" aria-hidden="true">·</span>
          {/each}
        </div>
        <div
          class="home-ticker-segment home-ticker-duplicate flex shrink-0 flex-row flex-nowrap items-center gap-x-8 pr-8 sm:gap-x-10 md:gap-x-12"
          aria-hidden="true"
        >
          {#each heroTickerItems as item (`dup-${item}`)}
            <span
              class="whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-zinc-500 sm:text-[11px]"
            >
              {item}
            </span>
            <span class="leading-none text-zinc-300" aria-hidden="true">·</span>
          {/each}
        </div>
      </div>
    </div>
    <p class="sr-only">
      Built for Toronto service businesses. Services include Voice AI, business automation, lead capture,
      appointment booking, CRM integration, Toronto and GTA, 24/7 answering, workflow automation, website
      and SEO.
    </p>
  </div>
</section>

<!-- KPI band: full-viewport style (centered headline + 3-column stats) -->
<section
  class="border-t border-zinc-200/60 bg-zinc-100 py-20 md:min-h-[min(92svh,56rem)] md:flex md:flex-col md:justify-center md:py-24 lg:py-32"
  aria-labelledby="kpi-section-heading"
>
  <div class="mx-auto w-full max-w-6xl px-6 lg:px-8">
    <h2
      id="kpi-section-heading"
      class="mx-auto max-w-4xl text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]"
    >
      {homeKpiSection.headline}
    </h2>
    <p
      class="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-zinc-600 md:mt-8 md:text-lg md:leading-relaxed"
    >
      {#each homeKpiSection.introSegments as seg, i (i)}
        {#if "accent" in seg && seg.accent === true}
          <span class="font-semibold text-primary">{seg.text}</span>
        {:else}
          {seg.text}
        {/if}
      {/each}
    </p>

    <div
      class="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-10 md:mt-20 md:gap-12 lg:mt-24 lg:gap-16"
    >
      {#each homeKpiSection.kpis as kpi (kpi.label)}
        <div class="text-center sm:px-2">
          <div class="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-[2.75rem] lg:text-6xl">
            {kpi.value}
          </div>
          <div
            class="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-900 sm:text-sm sm:tracking-[0.12em]"
          >
            {kpi.label}
          </div>
          <p class="mt-3 text-sm leading-relaxed text-zinc-500 md:text-[0.9375rem] md:leading-relaxed">
            {kpi.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Featured testimonial: light band + quote card -->
<section
  class="relative border-t border-zinc-200/70 bg-white py-16 md:py-20"
  aria-label="Client testimonial"
>
  <div class="mx-auto max-w-4xl px-6 lg:px-8">
    <p class="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
      Proof, not pitch
    </p>
    <div
      class="mt-8 rounded-2xl bg-white p-8 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)] md:mt-10 md:p-10"
    >
      <blockquote
        class="font-editorial text-xl font-normal leading-snug text-foreground md:text-2xl md:leading-snug"
      >
        “{homeFeaturedTestimonial.quote}”
      </blockquote>
      <footer
        class="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary"
      >
        — {homeFeaturedTestimonial.attributionName}, {homeFeaturedTestimonial.attributionBusiness}
      </footer>
    </div>
  </div>
</section>

<!-- Case study preview -->
<section id="case-study" class="scroll-mt-24 border-t border-zinc-200/60 bg-zinc-50 py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div
      class="rounded-2xl bg-white p-6 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)] md:p-10 lg:p-12"
    >
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Case study</p>
    <div class="mt-3 flex flex-wrap items-start gap-4 md:gap-5">
      <a
        href={caseStudyPreviewOhMyGlass.clientSiteHref}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
        aria-label="Visit OhMyGlass at ohmyglass.ca"
      >
        <img
          src={caseStudyPreviewOhMyGlass.logoSrc}
          alt=""
          width="288"
          height="64"
          loading="lazy"
          decoding="async"
          class="h-9 w-auto md:h-11"
        />
      </a>
      <h2 class="min-w-0 font-editorial text-3xl font-normal tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
        <span class="block">{caseStudyPreviewOhMyGlass.clientName}</span>
        <span
          class="mt-1 block text-base font-normal leading-snug text-muted-foreground md:text-lg"
        >
          {caseStudyPreviewOhMyGlass.clientSubtitle}
        </span>
      </h2>
    </div>

    <div class="mt-8 overflow-x-auto rounded-2xl bg-zinc-50/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)]">
      <table class="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-zinc-200/70 bg-zinc-100/90">
            <th class="px-4 py-3 font-semibold text-foreground md:px-5">Before</th>
            <th class="px-4 py-3 font-semibold text-foreground md:px-5">What we did</th>
            <th class="px-4 py-3 font-semibold text-foreground md:px-5">After</th>
          </tr>
        </thead>
        <tbody>
          {#each caseStudyPreviewOhMyGlass.rows as row (row.before)}
            <tr class="odd:bg-white even:bg-zinc-50/90">
              <td class="px-4 py-4 align-top text-muted-foreground md:px-5">{row.before}</td>
              <td class="px-4 py-4 align-top text-foreground md:px-5">{row.did}</td>
              <td class="px-4 py-4 align-top text-foreground md:px-5">{row.after}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-8 flex flex-wrap items-center gap-4">
      <a
        href={caseStudyPreviewOhMyGlass.href}
        class="text-sm font-semibold text-primary hover:underline"
      >
        {caseStudyPreviewOhMyGlass.cta} →
      </a>
    </div>
    </div>
  </div>
</section>

<section
  class="relative overflow-hidden bg-zinc-950 py-16 text-white md:py-20 lg:py-24"
>
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_100%,rgba(58,0,255,0.22)_0%,transparent_55%)]"
    aria-hidden="true"
  ></div>
  <div
    class="pointer-events-none absolute bottom-0 left-0 h-[50%] w-[65%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(58,0,255,0.28)_0%,transparent_60%)]"
    aria-hidden="true"
  ></div>
  <div class="relative mx-auto w-full max-w-6xl px-6 lg:px-8">
    <div
      class="rounded-3xl bg-white/[0.05] p-6 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.45)] backdrop-blur-sm md:p-10 lg:p-12"
    >
      <!-- The problem -->
      <div>
        <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary flex items-center gap-2">
          <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
          The problem
        </div>
        <h2 class="mt-4 max-w-2xl font-editorial text-3xl font-normal tracking-tight md:text-4xl lg:text-5xl lg:leading-[1.1]">
          Where you're losing revenue
        </h2>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          {problemsWeSolveIntro}
        </p>

        <div class="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {#each problemsWeSolve as problem, idx (problem.slug)}
            <div class="rounded-2xl bg-black/30 p-7">
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
  </div>
</section>

<!-- Solution – Operational AI Stack -->

<section id="services" class="border-t border-zinc-200/75 bg-white py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <p class="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Services</p>

    <h2
      class="mx-auto mt-4 max-w-4xl text-center font-editorial text-3xl font-normal tracking-tight md:text-4xl lg:text-5xl lg:leading-[1.1]"
    >
      Three solutions.<br />
      One leaky bucket <span class="italic">fixed.</span>
    </h2>

    <p class="mx-auto mt-4 max-w-2xl text-center text-lg leading-7 text-muted-foreground">
      {servicesIntro}
    </p>

    <div class="mt-12 grid grid-cols-1 gap-8">
      {#each services as service (service.slug)}
        <div
          id={service.slug}
          class="scroll-mt-24 rounded-2xl bg-white p-6 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)] md:p-8"
        >
          <div class="mx-auto max-w-4xl text-left">
            {#if service.popular}
              <div class="mb-4 flex justify-start">
                <Badge variant="secondary" class="border-0 bg-primary/10 text-primary text-xs">Most Popular</Badge>
              </div>
            {/if}

            <h3 class="text-xl font-semibold tracking-tight text-foreground">{service.title}</h3>
            <p class="mt-1 text-sm font-medium text-primary">{service.tagline}</p>

            <div
              class="mt-6 grid gap-8 text-left md:grid-cols-2 md:items-start md:gap-10"
            >
              <div class="flex min-w-0 flex-col gap-5">
                <p class="text-sm leading-6 text-muted-foreground">{service.description}</p>
                <div class="flex w-full max-w-xs flex-col gap-2">
                  <a
                    href={service.href}
                    class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-primary/25 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    {service.cta}
                  </a>
                  {#if service.slug === "voice-ai"}
                    <a
                      href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`}
                      class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                    >
                      Call
                    </a>
                  {/if}
                </div>
              </div>

              <div class="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/40">
                <table class="w-full border-collapse text-left text-sm">
                  <tbody>
                    {#each service.bullets as bullet, bulletIdx (bulletIdx)}
                      <tr class="border-b border-zinc-200/90 last:border-b-0">
                        <td class="px-3 py-2.5 leading-snug text-foreground">{bullet}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- How it works -->
<section id="how-it-works" class="scroll-mt-24 bg-white py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</div>
    <h2 class="mt-4 font-editorial text-3xl font-normal tracking-tight md:text-4xl lg:text-5xl lg:leading-[1.1]">
      Go from first call to fully automated<br />
      in weeks, not months
    </h2>
    <p class="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
      {processIntro}
    </p>

    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each processSteps as step, idx (step.step)}
        <div class="rounded-2xl bg-white p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)]">
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

<!-- About: heading column + content (reference split) -->
<section id="about" class="border-t border-zinc-200/60 bg-zinc-50 py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
      <div class="lg:sticky lg:top-28">
        <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About</div>
        <h2 class="mt-4 font-editorial text-3xl font-normal tracking-tight md:text-4xl lg:text-5xl lg:leading-[1.1]">
          Two founders.<br />
          <span class="italic text-primary">Zero middlemen.</span>
        </h2>
        <p class="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          Toronto tech implementation partner. Voice AI, automation, websites &amp; SEO—built and run by the same two people you talk to on day one.
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <div class="rounded-2xl bg-white p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] md:p-8">
          <p class="text-base leading-relaxed text-muted-foreground">
            We're Ed and Sy, a two-person Toronto agency that actually implements what we sell. <strong>No offshore team, no project managers, no account reps. When you email us, Ed or Sy answers.</strong>
          </p>
          <p class="mt-4 text-base leading-relaxed text-muted-foreground">
            We started Ed &amp; Sy because we watched too many Toronto service businesses lose customers to broken systems, not bad service. A missed call here, a slow follow-up there. We knew AI could fix it and that nobody was making it accessible to businesses without a tech team.
          </p>
          <p class="mt-4 text-base leading-relaxed text-muted-foreground">
            Every client gets <strong>direct access to both founders</strong>, a solution built for their workflow, and support that doesn't disappear after launch.
          </p>

          <div class="mt-8 grid grid-cols-3 gap-4 pt-2">
            <div>
              <div class="text-2xl font-semibold tracking-tight md:text-3xl">Toronto</div>
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Based</div>
            </div>
            <div>
              <div class="text-2xl font-semibold tracking-tight md:text-3xl">2</div>
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Founders only</div>
            </div>
            <div>
              <div class="text-2xl font-semibold tracking-tight md:text-3xl">Direct</div>
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mt-1">Access always</div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl bg-white p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)]">
            <div class="text-xl font-semibold tracking-tight">Ed</div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-1">Co-Founder · Tech Lead</div>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
              Deep background in AI implementation and systems integration. Turns complex automation into things that actually work inside real businesses, not just demos.
            </p>
          </div>

          <div class="rounded-2xl bg-white p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)]">
            <div class="text-xl font-semibold tracking-tight">Sy</div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-primary mt-1">Co-Founder · AI Specialist</div>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
              Operations and AI background. Finds exactly where your business leaks time and money, then closes those gaps with the right tools and no unnecessary complexity.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Industries -->
<section id="industries" class="border-t border-zinc-200/65 bg-white py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Related</p>
    <h2 class="mt-4 font-editorial text-3xl font-normal tracking-tight text-foreground md:text-4xl">
      Industries we work with
    </h2>
    <div class="mt-10 grid gap-8 sm:grid-cols-2">
      {#each featuredIndustries.slice(0, 4) as ind}
        <a
          href={ind.href}
          class="flex min-h-[11rem] flex-col rounded-2xl bg-white p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(58,0,255,0.15)] md:min-h-[12rem] md:p-9"
        >
          {#if industryIcons[ind.slug]}
            {@const Icon = industryIcons[ind.slug]}
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary md:h-14 md:w-14">
              <Icon class="h-6 w-6 md:h-7 md:w-7" />
            </div>
          {/if}
          <h3 class="mt-5 text-lg font-semibold tracking-tight text-foreground md:text-xl">{ind.name}</h3>
          <p class="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">{ind.description}</p>
        </a>
      {/each}
    </div>
    <p class="mt-6">
      <a href="/industries" class="text-sm font-medium text-primary hover:underline">View all industries →</a>
    </p>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="border-t border-zinc-200/60 bg-zinc-50 py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</div>
    <h2 class="mt-4 font-editorial text-3xl font-normal tracking-tight md:text-4xl lg:text-5xl lg:leading-[1.1]">
      Questions before<br />
      every first call
    </h2>
    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:gap-5">
      {#each faqItems as item}
        <div class="rounded-2xl bg-zinc-100/70 p-7 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)]">
          <div class="text-lg font-semibold leading-7 tracking-tight">{item.question}</div>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Final CTA: purple gradient band (reference highlight strip) -->
<section
  id="contact"
  class="border-t border-slate-800/90 bg-gradient-to-b from-zinc-950 via-[#1a0a2e] to-[#12001f] pb-16 pt-10 md:pb-20 md:pt-12"
>
  <div id="cta" class="mx-auto max-w-6xl px-6 lg:px-8">
    <div class="overflow-hidden rounded-2xl text-white shadow-xl shadow-black/30" style="background: radial-gradient(ellipse 100% 80% at 50% 0%, #280066 0%, #1e004d 35%, #150033 100%);">
      <div class="p-10 text-center md:p-14 lg:p-16">
        <div class="text-xs font-semibold uppercase tracking-[0.14em] text-primary flex items-center justify-center gap-2 mb-5">
          <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
          Get started
        </div>

        <h2 class="font-editorial text-3xl font-normal tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.1]">
          Stop losing leads<br />
          to <span class="italic text-primary">voicemail.</span>
        </h2>

        <p class="mt-4 max-w-xl mx-auto text-lg text-slate-300">
          {ctaBlock.subhead}
        </p>

        <div class="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3">
          <Button
            href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`}
            size="lg"
            class="h-12 w-full text-base font-semibold shadow-md shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90"
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
