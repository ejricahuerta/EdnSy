<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import {
    Phone,
    Palette,
    Wrench,
    Headphones,
    Gift,
    Sliders,
    TrendingUp,
    MapPin,
  } from "lucide-svelte";
  import { processSteps, processStats, faqItems, ctaBlock } from "$lib/content/site";

  const processStepIcons = [Phone, Palette, Wrench, Headphones];
  const processStatIcons = [Gift, Sliders, TrendingUp, MapPin];
</script>

<svelte:head>
  <title>Our Process | Ed & Sy | Tech Implementation & AI for Toronto Businesses</title>
  <meta
    name="description"
    content="From first call to full automation. Our 4-step process: Free consultation, custom strategy, implementation, training and support."
  />
</svelte:head>

<!-- Hero - 100vh -->
<section class="min-h-[75vh] bg-background pt-24 md:pt-28 pb-20 md:pb-28 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <div class="max-w-3xl">
      <h1 class="typography-h1 mb-5 text-balance">
        From first call to full automation
      </h1>
      <p class="typography-lead mb-6">
        Our 4-step process is designed to ensure your automation solution is built right and delivers real results.
      </p>
      <Button
        href="/#contact"
        size="lg"
        class="bg-primary hover:bg-primary/90 w-fit"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
      >
        Book Free Discovery Call
      </Button>
    </div>
  </div>
</section>

<!-- Process steps -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {#each processSteps as step, i}
        <Card.Root class="flex flex-col border-border bg-card overflow-hidden">
          <Card.Header class="space-y-4 pb-2">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svelte:component this={processStepIcons[i]} class="h-5 w-5" />
              </div>
              <span class="text-sm font-semibold tabular-nums text-muted-foreground">{step.step}</span>
            </div>
            <Card.Title class="text-xl font-semibold leading-tight">{step.title}</Card.Title>
          </Card.Header>
          <Card.Content class="flex-1 pt-0">
            <p class="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16">
      {#each processStats as s, i}
        <div class="flex flex-col items-center text-center">
          <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svelte:component this={processStatIcons[i]} class="h-5 w-5" />
          </div>
          <p class="text-2xl font-bold text-foreground">{s.value}</p>
          <p class="text-sm text-muted-foreground">{s.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">Frequently Asked Questions</h2>
    <Accordion.Root type="single" class="w-full">
      {#each faqItems as item}
        <Accordion.Item value={item.question}>
          <Accordion.Trigger>{item.question}</Accordion.Trigger>
          <Accordion.Content>{item.answer}</Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
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
