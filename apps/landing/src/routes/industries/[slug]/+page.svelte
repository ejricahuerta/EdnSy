<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Check } from "lucide-svelte";
  import { getIndustryIcon } from "$lib/content/industry-icons";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const industry = data.industry;
  const IndustryIcon = getIndustryIcon(industry.slug);
</script>

<!-- Hero - same 100vh pattern as main landing. Title/description/canonical from layout via getSeoForPath(/industries/:slug). -->
<section class="min-h-[75vh] bg-background pt-24 md:pt-28 pb-20 md:pb-28 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <Button href="/industries" variant="link" class="text-primary font-heading mb-6 p-0 h-auto w-fit">
      ← All Industries
    </Button>
    <div class="max-w-3xl">
      {#if IndustryIcon}
        <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svelte:component this={IndustryIcon} class="h-6 w-6" />
        </div>
      {/if}
      <h1 class="typography-h1 mb-5 text-balance">
        {industry.headline}
      </h1>
      <p class="typography-lead mb-6">
        {industry.subhead}
      </p>
      <div class="flex flex-wrap gap-3 mb-5">
        <Button
          href="/#contact"
          size="lg"
          class="bg-primary hover:bg-primary/90"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
        >
          Book a Free Consultation
        </Button>
        <Button href="/#services" variant="outline" size="lg" class="border-primary text-primary hover:bg-primary/10">
          See How It Works
        </Button>
      </div>
    </div>
    <!-- Stats strip - 4 columns like main landing -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mt-14 md:mt-20">
      {#each industry.resultStats as stat}
        <div>
          <p class="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
          <p class="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Solutions -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-8">
      Solutions for your {industry.name.toLowerCase()} {industry.slug === "solo-professionals" ? "" : "business"}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each industry.solutions as sol}
        <Card.Root class="h-full flex flex-col border-border bg-card">
          <Card.Header>
            {#if IndustryIcon}
              <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svelte:component this={IndustryIcon} class="h-5 w-5" />
              </div>
            {/if}
            <Card.Title class="typography-h4">{sol.title}</Card.Title>
            <Card.Description>{sol.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-muted-foreground">
              {#each sol.bullets as b}
                <li class="flex items-start gap-2">
                  <Check class="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span>{b}</span>
                </li>
              {/each}
            </ul>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- Compliance (optional) -->
{#if industry.complianceNote}
  <section class="py-16 md:py-24 bg-background">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <Card.Root class="bg-muted/50 border-border">
        <Card.Header>
          {#if IndustryIcon}
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={IndustryIcon} class="h-5 w-5" />
            </div>
          {/if}
          <Card.Title class="text-lg">{industry.complianceNote.title}</Card.Title>
        </Card.Header>
        <Card.Content>
          <ul class="space-y-2 text-muted-foreground">
            {#each industry.complianceNote.bullets as b}
              <li class="flex items-start gap-2">
                <Check class="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>{b}</span>
              </li>
            {/each}
          </ul>
        </Card.Content>
      </Card.Root>
    </div>
  </section>
{/if}

<!-- CTA -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <Card.Root class="border-border bg-card text-center">
      <Card.Header>
        {#if IndustryIcon}
          <div class="mb-4 flex justify-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <svelte:component this={IndustryIcon} class="h-6 w-6" />
            </div>
          </div>
        {/if}
        <Card.Title class="typography-h3">Ready to reclaim your time?</Card.Title>
        <Card.Description>
          We help Toronto {industry.name.toLowerCase()} businesses automate operations and get their time back. Book a free consultation for a custom roadmap.
        </Card.Description>
      </Card.Header>
      <Card.Footer class="flex justify-center pt-6 pb-6">
        <Button
          href="/#contact"
          size="lg"
          class="bg-primary hover:bg-primary/90"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
        >
          Book Your Free Consultation
        </Button>
      </Card.Footer>
    </Card.Root>
    <p class="text-sm text-muted-foreground mt-4">No commitment required • 30-minute call • Custom roadmap included</p>
  </div>
</section>
