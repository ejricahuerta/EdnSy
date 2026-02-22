<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { ChevronRight } from "lucide-svelte";
  import { industries, ctaBlock, industriesPageHero } from "$lib/content/site";
  import { industryIcons, industryFallbackIcon } from "$lib/content/industry-icons";
</script>

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
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {#each industries as ind}
        <Card.Root class="transition-colors hover:border-primary/40 hover:bg-muted/50 h-full flex flex-col border-border bg-card">
          <a href={ind.href} class="block contents flex flex-col flex-1 min-h-0">
            <Card.Header class="flex-1">
              {#if industryIcons[ind.slug]}
                <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svelte:component this={industryIcons[ind.slug]} class="h-5 w-5" />
                </div>
              {/if}
              <Card.Title class="typography-h4">{ind.name}</Card.Title>
              <Card.Description class="text-sm">{ind.description}</Card.Description>
            </Card.Header>
            <Card.Content class="pt-4 pb-6">
              <Button variant="link" class="text-primary p-0 h-auto font-heading text-left inline-flex items-center gap-1">
                View {ind.name} solutions
                <ChevronRight class="h-4 w-4" />
              </Button>
            </Card.Content>
          </a>
        </Card.Root>
      {/each}
      <Card.Root class="transition-colors hover:border-primary/40 hover:bg-muted/50 h-full flex flex-col border-border bg-card">
        <Card.Header class="flex-1">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svelte:component this={industryFallbackIcon} class="h-5 w-5" />
          </div>
          <Card.Title class="typography-h4">Don't see your industry?</Card.Title>
          <Card.Description class="text-sm">
            We work with businesses across all industries. Book a free consultation to discuss your specific needs.
          </Card.Description>
        </Card.Header>
        <Card.Content class="pt-4 pb-6">
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
