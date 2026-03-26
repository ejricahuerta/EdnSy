<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { caseStudyList } from "$lib/content/case-studies";
  import { buildBreadcrumbSchema } from "$lib/content/seo";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const study = data.study;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Case Studies", url: "/case-studies" },
    { name: study.title, url: `/case-studies/${study.slug}` },
  ]);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <nav class="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <a href="/case-studies" class="text-primary hover:underline">Case Studies</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{study.title}</span>
    </nav>

    <div class="mb-6 flex flex-wrap gap-3">
      <span class="inline-flex items-center rounded-full border border-border bg-muted/70 px-4 py-1.5 text-sm font-medium text-foreground">
        {study.industry}
      </span>
      <span class="inline-flex items-center rounded-full border border-border bg-muted/70 px-4 py-1.5 text-sm font-medium text-foreground">
        {study.location}
      </span>
    </div>

    <h1 class="typography-h1 mb-5 text-balance">{study.title}</h1>
    <p class="max-w-3xl text-lg leading-8 text-muted-foreground">{study.outcome}</p>

    <figure class="mt-10 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <img
        src={study.heroImage.src}
        alt={study.heroImage.alt}
        class="aspect-[16/9] w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <figcaption class="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        Source:
        <a
          href={study.heroImage.creditHref}
          class="font-medium text-foreground hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {study.heroImage.credit}
        </a>
      </figcaption>
    </figure>
  </div>
</section>

<section class="bg-muted/30 py-16 md:py-24">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <article class="space-y-20">
      <section class="space-y-5">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">01 · Challenge</p>
        <h2 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">The challenge</h2>
        <p class="max-w-2xl leading-8 text-muted-foreground">{study.challenge}</p>
      </section>

      <section class="space-y-8">
        <div class="max-w-3xl space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">02 · Approach</p>
          <h2 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Our approach</h2>
          <p class="leading-8 text-muted-foreground">
            We worked through the recovery in three deliberate phases so the business could get back online fast and rebuild on a stronger foundation.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          {#each study.approachSteps as step}
            <div class="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {step.step}
              </div>
              <h3 class="mt-6 text-xl font-semibold tracking-tight text-foreground">{step.title}</h3>
              <p class="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
            </div>
          {/each}
        </div>
      </section>

      <section class="space-y-5">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">03 · Results</p>
        <h2 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Results</h2>
        <p class="max-w-2xl leading-8 text-muted-foreground">{study.outcome}</p>

        <ul class="grid gap-3 sm:grid-cols-2">
          {#each study.resultsHighlights as highlight}
            <li class="rounded-2xl border border-border bg-card px-4 py-4 text-sm leading-6 text-muted-foreground shadow-sm">
              {highlight}
            </li>
          {/each}
        </ul>
      </section>

      {#if study.testimonial}
        <section class="rounded-[2rem] border border-border bg-background px-6 py-12 text-center shadow-sm md:px-10 md:py-16">
          <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl font-serif text-primary">
            "
          </div>
          <blockquote class="mx-auto max-w-4xl text-2xl leading-relaxed tracking-tight text-foreground md:text-3xl">
            {study.testimonial.quote}
          </blockquote>
          <p class="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {study.testimonial.attribution}
          </p>
        </section>
      {/if}

      <section class="space-y-8">
        <div class="max-w-3xl space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">04 · Key takeaways</p>
          <h2 class="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Key takeaways</h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          {#each study.takeaways as takeaway}
            <div class="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <h3 class="text-xl font-semibold tracking-tight text-foreground">{takeaway.title}</h3>
              <p class="mt-3 text-sm leading-7 text-muted-foreground">{takeaway.body}</p>
            </div>
          {/each}
        </div>
      </section>

      <section class="rounded-[2rem] border border-border bg-card px-6 py-10 shadow-sm md:px-10 md:py-12">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">05 · Next step</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Ready to get similar results?</h2>
        <p class="mt-4 max-w-2xl leading-7 text-muted-foreground">{study.ctaSubtitle}</p>
        <div class="mt-8 flex flex-wrap gap-4">
          <Button
            href={study.href}
            class="bg-primary hover:bg-primary/90"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
          >
            {study.cta}
          </Button>
          <Button href="/case-studies" variant="outline">All case studies</Button>
        </div>
      </section>
    </article>
  </div>
</section>

{#if caseStudyList.filter((s) => s.slug !== study.slug).length > 0}
  <section class="py-12 md:py-16 bg-background">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <p class="text-muted-foreground mb-6">Explore more case studies:</p>
      <ul class="space-y-3">
        {#each caseStudyList.filter((s) => s.slug !== study.slug) as other}
          <li>
            <a href="/case-studies/{other.slug}" class="text-primary hover:underline font-medium">
              {other.title}
            </a>
            <span class="text-muted-foreground text-sm"> · {other.industry}</span>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}
