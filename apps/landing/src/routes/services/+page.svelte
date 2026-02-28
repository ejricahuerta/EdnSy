<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { RosettaSuiteCta } from "$lib/components/landing";
  import { Phone, Workflow, Globe, Puzzle } from "lucide-svelte";
  import { site, services, servicesIntro, ctaBlock } from "$lib/content/site";

  const serviceIcons: Record<string, typeof Phone> = {
    "voice-ai": Phone,
    "workflow-automation": Workflow,
    "website-seo": Globe,
  };
</script>

<!-- Hero - 100vh like main landing -->
<section class="min-h-[75vh] bg-background pt-24 md:pt-28 pb-20 md:pb-28 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <div class="max-w-3xl">
      <h1 class="typography-h1 mb-5 text-balance">
        Our Services: Voice AI, Automation & Website & SEO
      </h1>
      <p class="typography-lead mb-6">
        {servicesIntro}
      </p>
      <Button
        href="/contact"
        size="lg"
        class="bg-primary hover:bg-primary/90 w-fit"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
      >
        Book a Free Strategy Call
      </Button>
    </div>
  </div>
</section>

<!-- Services -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:gap-10">
      {#each services as service}
        <Card.Root id={service.slug} class="scroll-mt-24 h-full flex flex-col">
          <Card.Header class="space-y-1.5">
            <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={serviceIcons[service.slug]} class="h-5 w-5" />
            </div>
            <p class="text-sm font-medium text-primary">{service.tagline}</p>
            <Card.Title class="typography-h3">{service.title}</Card.Title>
            <Card.Description class="text-base max-w-2xl">{service.description}</Card.Description>
          </Card.Header>
          <Card.Content class="flex-1 pb-4">
            <ul class="space-y-2">
              {#each service.bullets as bullet}
                <li class="flex items-start gap-2 text-foreground">
                  <span class="text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>
          </Card.Content>
          <Card.Footer class="pt-6 pb-6 flex gap-3">
            <Button href={service.href} variant="outline">
              Learn more
            </Button>
            <Button
              href="/contact"
              data-cal-link="edmel-ednsy/enable-ai"
              data-cal-namespace="enable-ai"
            >
              {service.cta}
            </Button>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>

    <Card.Root class="mt-12 md:mt-16">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Puzzle class="h-5 w-5" />
        </div>
        <Card.Title>Need a custom solution?</Card.Title>
        <Card.Description class="max-w-xl">
          We offer custom packages that mix and match any of our solutions to fit your specific business needs.
        </Card.Description>
      </Card.Header>
      <Card.Footer class="pt-6 pb-6">
        <Button href="/contact" data-cal-link="edmel-ednsy/enable-ai" data-cal-namespace="enable-ai">
          Book a Free Strategy Call
        </Button>
      </Card.Footer>
    </Card.Root>
  </div>
</section>

<!-- CTA -->
<section class="py-16 md:py-24 bg-background text-center">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-2">{ctaBlock.headline}</h2>
    <p class="typography-lead mb-6">{ctaBlock.subhead}</p>
    <Button
      href="/contact"
      size="lg"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
    >
      {ctaBlock.button}
    </Button>
    <p class="text-sm text-muted-foreground mt-4">{ctaBlock.note}</p>
    <div class="mt-6 flex justify-center">
      <RosettaSuiteCta variant="inline" />
    </div>
  </div>
</section>
