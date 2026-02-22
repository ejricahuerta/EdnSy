<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import { Phone, PhoneOff, Settings, Building2, TrendingUp, HelpCircle } from "lucide-svelte";
  import { voiceAiPage } from "$lib/content/service-pages";
  import { buildServiceSchema, buildFAQSchema } from "$lib/content/seo";

  const sectionIcons = [Phone, PhoneOff, Settings, Building2, TrendingUp];

  const serviceSchema = buildServiceSchema(
    "Voice AI for Business",
    "24/7 AI phone answering and call automation for Toronto businesses. Never miss a lead.",
    "/voice-ai-for-business"
  );
  const faqSchema = buildFAQSchema(voiceAiPage.faq);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<!-- CTA above the fold -->
<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h1 class="typography-h1 mb-5 text-balance">
      Voice AI for Business Toronto
    </h1>
    <p class="typography-lead mb-6 max-w-2xl">
      Never miss a lead. We help Toronto businesses answer every call 24/7 with an AI phone answering system that qualifies leads, books appointments, and captures callers, so you never lose a customer to voicemail again.
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

<!-- Sections -->
<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-6 md:gap-8">
      {#each voiceAiPage.sections as section, i}
        <Card.Root class="border-border bg-card h-full flex flex-col">
          <Card.Header class="space-y-1.5">
            <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={sectionIcons[i]} class="h-5 w-5" />
            </div>
            <Card.Title class="typography-h2">{section.heading}</Card.Title>
          </Card.Header>
          <Card.Content class="flex-1">
            <p class="text-muted-foreground leading-7">{section.body}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="py-16 md:py-24 bg-background">
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
          {#each voiceAiPage.faq as item}
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

<!-- Internal links + CTA -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <p class="text-muted-foreground mb-6">
      Explore our other services: {#each voiceAiPage.internalLinks as link}
        <a href={link.href} class="text-primary underline">{link.label}</a>{link.href !== "/contact" ? ", " : ""}
      {/each}
    </p>
    <Card.Root class="border-border bg-card max-w-2xl">
      <Card.Header>
        <Card.Title>Ready to stop missing calls?</Card.Title>
        <Card.Description>Book a free strategy call. We'll outline a Voice AI plan for your Toronto business. No commitment.</Card.Description>
      </Card.Header>
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
