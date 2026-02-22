<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Phone, Workflow, Globe } from "lucide-svelte";
  import { services } from "$lib/content/site";

  const serviceIcons: Record<string, typeof Phone> = {
    "voice-ai": Phone,
    "workflow-automation": Workflow,
    "website-seo": Globe,
  };
</script>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h1 class="typography-h1 mb-5 text-balance">
      AI Automation Toronto
    </h1>
    <p class="typography-lead mb-6 max-w-2xl">
      We're Toronto's AI automation agency. We help service businesses in Toronto and Ontario automate operations, capture more leads, and scale with Voice AI, business automation, and website & SEO.
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
    <h2 class="typography-h2 mb-6">What we offer in Toronto</h2>
    <p class="text-muted-foreground mb-10 max-w-2xl leading-7">
      We focus on three pillars: Voice AI for 24/7 call answering, business automation (with AI when it helps) for workflows and follow-ups, and website & SEO built for conversions and local search. All tailored for Toronto and Ontario businesses.
    </p>
    <div class="grid md:grid-cols-3 gap-6">
      {#each services as service}
        <Card.Root class="border-border bg-card h-full flex flex-col">
          <Card.Header class="space-y-1.5">
            <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={serviceIcons[service.slug]} class="h-5 w-5" />
            </div>
            <Card.Title class="text-xl">{service.title}</Card.Title>
            <Card.Description class="leading-relaxed">{service.description}</Card.Description>
          </Card.Header>
          <Card.Footer class="mt-auto">
            <Button href={service.href} variant="outline" class="w-fit">
              Learn more
            </Button>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>
    <p class="mt-8 text-muted-foreground">
      Serving the <a href="/ai-automation-gta" class="text-primary underline">Greater Toronto Area (GTA)</a> too. <a href="/contact" class="text-primary underline">Contact us</a> for a free strategy call.
    </p>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">Ready to automate?</h2>
    <p class="text-muted-foreground mb-6 max-w-xl mx-auto">Book a free strategy call. We'll outline a custom plan for your Toronto business. No commitment.</p>
    <Button href="/contact" size="lg" class="bg-primary hover:bg-primary/90" data-cal-link="edmel-ednsy/enable-ai" data-cal-namespace="enable-ai">
      Book a Free Strategy Call
    </Button>
  </div>
</section>
