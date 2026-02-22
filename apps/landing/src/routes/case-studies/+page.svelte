<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { caseStudyList } from "$lib/content/case-studies";
  import { buildBreadcrumbSchema } from "$lib/content/seo";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Case Studies", url: "/case-studies" },
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
      <span class="text-foreground">Case Studies</span>
    </nav>
    <h1 class="typography-h1 mb-5">Case Studies</h1>
    <p class="typography-lead max-w-2xl">
      See how Toronto and Ontario businesses use our Voice AI, automation, and website solutions. Real results and client outcomes.
    </p>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="space-y-16">
      {#each caseStudyList as study}
        <article class="border-b border-border pb-16 last:border-0 last:pb-0">
          <h2 class="typography-h2 mb-4">{study.title}</h2>
          <p class="text-sm text-muted-foreground mb-6">
            <span class="font-medium text-foreground">{study.industry}</span> · {study.location}
          </p>
          <p class="text-lg font-medium text-foreground mb-4">Outcome: {study.outcome}</p>

          <h3 class="text-lg font-semibold mt-6 mb-2">Problem</h3>
          <p class="text-muted-foreground leading-7 mb-6">{study.problem}</p>

          <h3 class="text-lg font-semibold mt-6 mb-2">Solution</h3>
          <p class="text-muted-foreground leading-7 mb-6">{study.solution}</p>

          <h3 class="text-lg font-semibold mt-6 mb-2">Tools used</h3>
          <p class="text-muted-foreground leading-7 mb-6">{study.tools.join(", ")}</p>

          <h3 class="text-lg font-semibold mt-6 mb-2">Before vs after</h3>
          <p class="text-muted-foreground leading-7 mb-6">{study.beforeAfter}</p>

          <h3 class="text-lg font-semibold mt-6 mb-2">Measurable results</h3>
          <p class="text-muted-foreground leading-7 mb-6">{study.results}</p>

          {#if study.testimonial}
            <blockquote class="border-l-4 border-primary pl-6 py-2 text-foreground italic">
              {study.testimonial}
            </blockquote>
          {/if}

          <div class="mt-8">
            <Button href={study.href} variant="outline" class="border-primary text-primary">
              {study.cta}
            </Button>
          </div>
        </article>
      {/each}
    </div>

    <div class="mt-16 pt-12 border-t border-border">
      <p class="text-muted-foreground mb-6">
        Ready to get similar results? We serve Toronto, the GTA, and Ontario.
      </p>
      <div class="flex flex-wrap gap-4">
        <Button href="/voice-ai-for-business" variant="outline">Voice AI</Button>
        <Button href="/business-automation-services" variant="outline">Business Automation</Button>
        <Button href="/website-design-toronto" variant="outline">Website & SEO</Button>
        <Button href="/contact" class="bg-primary hover:bg-primary/90" data-cal-link="edmel-ednsy/enable-ai" data-cal-namespace="enable-ai">
          Book a Free Strategy Call
        </Button>
      </div>
    </div>
  </div>
</section>
