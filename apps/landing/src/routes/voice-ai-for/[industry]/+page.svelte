<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import { CheckCircle2, CircleAlert, Workflow, HelpCircle } from "lucide-svelte";
  import type { PageData } from "./$types";
  import {
    buildBreadcrumbSchema,
    buildFAQSchema,
    buildServiceSchema,
  } from "$lib/content/seo";

  let { data }: { data: PageData } = $props();
  const industry = data.industry;
  const pagePath = `/voice-ai-for/${industry.slug}`;

  const serviceSchema = buildServiceSchema(
    `Voice AI for ${industry.industryName}`,
    industry.description,
    pagePath
  );
  const faqSchema = buildFAQSchema(industry.faq);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Voice AI for Business", url: "/voice-ai-for-business" },
    { name: industry.industryName, url: pagePath },
  ]);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <nav class="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <a href="/voice-ai-for-business" class="text-primary hover:underline">Voice AI</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{industry.industryName}</span>
    </nav>
    <h1 class="typography-h1 mb-5 text-balance">{industry.headline}</h1>
    <p class="typography-lead mb-6 max-w-3xl">
      {industry.subhead}
    </p>
    <Button
      href="/contact"
      size="lg"
      class="bg-primary hover:bg-primary/90"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
    >
      Book a Free Strategy Call
    </Button>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CircleAlert class="h-5 w-5" />
        </div>
        <Card.Title class="typography-h2">Common call-handling bottlenecks</Card.Title>
        <Card.Description class="leading-relaxed">
          These are the friction points we hear most often from {industry.industryName.toLowerCase()} teams in Toronto.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <ul class="space-y-3 text-muted-foreground">
          {#each industry.painPoints as point}
            <li class="flex items-start gap-2">
              <span class="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
              <span>{point}</span>
            </li>
          {/each}
        </ul>
      </Card.Content>
    </Card.Root>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-8">
    <Card.Root class="border-border bg-card">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckCircle2 class="h-5 w-5" />
        </div>
        <Card.Title class="typography-h3">Expected outcomes</Card.Title>
      </Card.Header>
      <Card.Content>
        <ul class="space-y-3 text-muted-foreground">
          {#each industry.outcomes as outcome}
            <li class="flex items-start gap-2">
              <CheckCircle2 class="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{outcome}</span>
            </li>
          {/each}
        </ul>
      </Card.Content>
    </Card.Root>

    <Card.Root class="border-border bg-card">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Workflow class="h-5 w-5" />
        </div>
        <Card.Title class="typography-h3">How we implement it</Card.Title>
      </Card.Header>
      <Card.Content>
        <ol class="space-y-3 text-muted-foreground">
          {#each industry.processSteps as step, index}
            <li class="flex items-start gap-3">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          {/each}
        </ol>
      </Card.Content>
    </Card.Root>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle class="h-5 w-5" />
        </div>
        <Card.Title class="typography-h2">Frequently Asked Questions</Card.Title>
      </Card.Header>
      <Card.Content>
        <Accordion.Root type="single" class="w-full">
          {#each industry.faq as item}
            <Accordion.Item value={item.question}>
              <Accordion.Trigger>{item.question}</Accordion.Trigger>
              <Accordion.Content>{item.answer}</Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      </Card.Content>
    </Card.Root>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card max-w-3xl">
      <Card.Header>
        <Card.Title class="typography-h3">Ready to capture more calls?</Card.Title>
        <Card.Description>
          We will map a Voice AI flow for your {industry.industryName.toLowerCase()} business and show a practical implementation roadmap.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <p class="text-sm text-muted-foreground mb-4">
          Explore related resources:
        </p>
        <ul class="flex flex-wrap gap-4 text-sm">
          {#each industry.internalLinks as link}
            <li>
              <a href={link.href} class="text-primary hover:underline">{link.label}</a>
            </li>
          {/each}
        </ul>
      </Card.Content>
      <Card.Footer>
        <Button
          href="/contact"
          class="bg-primary hover:bg-primary/90"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
        >
          Book a Free Strategy Call
        </Button>
      </Card.Footer>
    </Card.Root>
  </div>
</section>
