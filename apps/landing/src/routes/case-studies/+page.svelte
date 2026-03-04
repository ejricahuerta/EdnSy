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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {#each caseStudyList as study}
        <Card.Root class="border-border bg-card flex flex-col">
          <Card.Header>
            <Card.Title class="text-lg">
              <a href="/case-studies/{study.slug}" class="text-foreground hover:text-primary hover:underline">
                {study.title}
              </a>
            </Card.Title>
            <Card.Description>
              <span class="font-medium text-foreground">{study.industry}</span> · {study.location}
            </Card.Description>
          </Card.Header>
          <Card.Content class="flex-1">
            <p class="text-muted-foreground text-sm leading-6 mb-4">{study.outcome}</p>
            <Button href="/case-studies/{study.slug}" variant="outline" size="sm" class="border-primary text-primary w-fit">
              Read case study
            </Button>
          </Card.Content>
        </Card.Root>
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
