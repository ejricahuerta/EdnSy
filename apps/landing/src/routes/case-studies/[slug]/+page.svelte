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
    <nav class="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <a href="/case-studies" class="text-primary hover:underline">Case Studies</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{study.title}</span>
    </nav>
    <h1 class="typography-h1 mb-5 text-balance">{study.title}</h1>
    <p class="text-sm text-muted-foreground mb-6">
      <span class="font-medium text-foreground">{study.industry}</span> · {study.location}
    </p>
    <p class="text-lg font-medium text-foreground mb-4">Outcome: {study.outcome}</p>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <article class="space-y-10">
      <div>
        <h2 class="text-lg font-semibold mb-2">Challenge</h2>
        <p class="text-muted-foreground leading-7">{study.challenge}</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-2">Solutions</h2>
        <p class="text-muted-foreground leading-7">{study.solutions}</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-2">Stats</h2>
        <ul class="list-disc list-inside text-muted-foreground leading-7 space-y-2">
          {#each study.stats as stat}
            <li>{stat}</li>
          {/each}
        </ul>
      </div>

      {#if study.testimonial}
        <blockquote class="border-l-4 border-primary pl-6 py-2 text-foreground italic">
          {study.testimonial}
        </blockquote>
      {/if}

      <div class="pt-8 mt-10 border-t border-border">
        <p class="text-foreground font-medium mb-4">Ready to get similar results?</p>
        <div class="flex flex-wrap gap-4">
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
      </div>
    </article>
  </div>
</section>

<section class="py-12 md:py-16 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <p class="text-muted-foreground mb-6">Explore more case studies:</p>
    <ul class="space-y-3">
      {#each caseStudyList.filter((s) => s.slug !== study.slug) as other}
        <li>
          <a href="/case-studies/{other.slug}" class="text-primary hover:underline font-medium">
            {other.title}
          </a>
          <span class="text-muted-foreground text-sm"> — {other.industry}</span>
        </li>
      {/each}
    </ul>
  </div>
</section>
