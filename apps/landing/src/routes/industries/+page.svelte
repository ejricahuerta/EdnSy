<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import { industries, ctaBlock, industriesPageHero } from "$lib/content/site";
  import { industryIcons, industryFallbackIcon } from "$lib/content/industry-icons";
</script>

<svelte:head>
  <title>Industries We Serve | Ed & Sy | Tech Implementation & AI for Toronto Businesses</title>
  <meta
    name="description"
    content="Voice AI, workflow automation & website & SEO for your industry. Healthcare, dental, construction, salons, real estate, legal, fitness and more. Toronto."
  />
</svelte:head>

<!-- Hero - 50vh -->
<section class="min-h-[50vh] bg-background pt-24 md:pt-28 pb-12 md:pb-16 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <h1 class="typography-h1 mb-3">
      {industriesPageHero.headline}
    </h1>
    <p class="typography-lead max-w-2xl">
      {industriesPageHero.subhead}
    </p>
  </div>
</section>

<!-- Industries grid -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {#each industries as ind}
        <Card.Root
          class="h-full min-h-[13rem] flex flex-col gap-8 rounded-2xl border-border bg-card px-6 py-8 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50 md:min-h-[14rem] md:px-8 md:py-10"
        >
          <a href={ind.href} class="block contents flex min-h-0 flex-1 flex-col">
            <Card.Header class="flex-1 space-y-0 p-0">
              {#if industryIcons[ind.slug]}
                <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary md:h-16 md:w-16">
                  <svelte:component this={industryIcons[ind.slug]} class="h-7 w-7 md:h-8 md:w-8" />
                </div>
              {/if}
              <Card.Title class="text-xl font-semibold tracking-tight md:text-2xl">{ind.name}</Card.Title>
              <Card.Description class="mt-3 text-base leading-relaxed">{ind.description}</Card.Description>
            </Card.Header>
            <Card.Content class="p-0 pt-2">
              <Button variant="link" class="text-primary p-0 h-auto font-heading text-left inline-flex items-center gap-1">
                View {ind.name} solutions
                <ChevronRight class="h-4 w-4" />
              </Button>
            </Card.Content>
          </a>
        </Card.Root>
      {/each}
      <Card.Root
        class="flex h-full min-h-[13rem] flex-col gap-8 rounded-2xl border-border bg-card px-6 py-8 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50 md:min-h-[14rem] md:px-8 md:py-10"
      >
        <Card.Header class="flex-1 space-y-0 p-0">
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary md:h-16 md:w-16">
            <svelte:component this={industryFallbackIcon} class="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <Card.Title class="text-xl font-semibold tracking-tight md:text-2xl">Don't see your industry?</Card.Title>
          <Card.Description class="mt-3 text-base leading-relaxed">
            We work with businesses across all industries. Book a free consultation to discuss your specific needs.
          </Card.Description>
        </Card.Header>
        <Card.Content class="p-0 pt-2">
          <Button
            href="/#contact"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            variant="link"
            class="text-primary p-0 h-auto font-heading text-left"
          >
            Book a Free Consultation →
          </Button>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-16 md:py-24 bg-background text-center">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-2">{ctaBlock.headline}</h2>
    <p class="typography-lead mb-6">{ctaBlock.subhead}</p>
    <Button
      href="/#contact"
      size="lg"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
    >
      {ctaBlock.button}
    </Button>
    <p class="text-sm text-muted-foreground mt-4">{ctaBlock.note}</p>
  </div>
</section>
