<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import { Badge } from "$lib/components/ui/badge";
  import {
    hero,
    services,
    industries,
    industriesIntro,
    faqIntro,
    faqItems,
    ctaBlock,
    servicesIntro,
    problemsWeSolve,
    problemsWeSolveIntro,
    caseStudies,
    voiceAiPhoneNumber,
  } from "$lib/content/site";
  import { industryIcons } from "$lib/content/industry-icons";
  import { buildFAQSchema } from "$lib/content/seo";
  import { BrushCard } from "$lib/components/landing";
  import { Phone, Workflow, Globe, Sparkles, PhoneOff, ClipboardList, MessageSquarePlus, X, Check } from "lucide-svelte";

  const faqSchema = buildFAQSchema(faqItems);

  const serviceIcons: Record<string, typeof Phone> = {
    "voice-ai": Phone,
    "workflow-automation": Workflow,
    "website-seo": Globe,
  };
  const problemIcons: Record<string, typeof PhoneOff> = {
    "missed-calls": PhoneOff,
    "manual-admin": ClipboardList,
    "inefficient-follow-ups": MessageSquarePlus,
  };
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<!-- Hero: 1200px height, text + CTA centered -->
<section class="hero-block">
  <div class="hero-block-inner">
    <h1 class="typography-h1 mb-5 text-balance">
      {hero.headline}
    </h1>
    <p class="typography-lead mb-6">
      {hero.subhead}
    </p>
    <div class="flex flex-wrap gap-3 mb-5">
      <Button
        href="#contact"
        size="lg"
        class="bg-primary hover:bg-primary/90"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({ layout: "month_view" })}
      >
        {hero.ctaPrimary}
      </Button>
      <Button
        href="#services"
        variant="outline"
        size="lg"
        class="border-primary text-primary hover:bg-primary/10"
      >
        {hero.ctaSecondary}
      </Button>
    </div>
    <p class="typography-muted">{hero.tagline}</p>
  </div>
</section>

<!-- The Problems We Solve -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
      <div class="lg:sticky lg:top-24">
        <h2 class="typography-h2 mb-3">The Problems We Solve</h2>
        <p class="text-muted-foreground text-base max-w-xl leading-7">
          {problemsWeSolveIntro}
        </p>
      </div>
      <div class="flex flex-col gap-5 md:gap-6">
        {#each problemsWeSolve as problem}
          <BrushCard>
            <Card.Root class="border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors flex flex-col">
              <Card.Header class="space-y-3 flex-1 pb-2">
              {#if problemIcons[problem.slug]}
                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <svelte:component this={problemIcons[problem.slug]} class="h-5 w-5" />
                </div>
              {/if}
              <Card.Title class="text-xl font-semibold tracking-tight">{problem.title}</Card.Title>
              <div class="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed">
                <X class="h-4 w-4 shrink-0 mt-0.5 text-destructive/80" aria-hidden="true" />
                <span>{problem.description}</span>
              </div>
              <div class="flex items-start gap-2 text-sm font-medium text-primary pt-1">
                <Check class="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{problem.solution}</span>
              </div>
            </Card.Header>
            </Card.Root>
          </BrushCard>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Operational AI Stack (internal links to money pages) -->
<section id="services" class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">Operational AI Stack</h2>
    <p class="text-muted-foreground text-base mb-12 max-w-2xl leading-7">{servicesIntro}</p>

    <div class="space-y-16 md:space-y-20">
      {#each services as service}
        <BrushCard>
          <Card.Root
            id={service.slug}
            class="scroll-mt-24 grid md:grid-cols-2 gap-0 border-border bg-card overflow-hidden"
          >
          <Card.Content class="order-2 md:order-1 flex flex-col justify-center p-8 md:p-10 space-y-4">
            {#if service.popular}
              <Badge variant="secondary" class="w-fit bg-primary/10 text-primary border-0">
                Most Popular
              </Badge>
            {/if}
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svelte:component this={serviceIcons[service.slug]} class="h-5 w-5" />
              </div>
              <Card.Title class="typography-h3">{service.title}</Card.Title>
            </div>
            <p class="text-sm font-medium text-primary">{service.tagline}</p>
            <Card.Description class="text-base leading-relaxed">{service.description}</Card.Description>
            <ul class="space-y-2 text-foreground">
              {#each service.bullets as bullet}
                <li class="flex items-start gap-2">
                  <span class="text-primary mt-0.5 shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>
            <div class="pt-4 flex flex-wrap gap-3">
              <Button
                href={service.href}
                class="w-fit bg-primary hover:bg-primary/90"
              >
                {service.cta}
              </Button>
              {#if service.slug === "voice-ai"}
                <Button
                  href="tel:{voiceAiPhoneNumber.replace(/\s/g, '')}"
                  variant="outline"
                  class="w-fit border-primary text-primary hover:bg-primary/10"
                >
                  <Sparkles class="mr-2 h-4 w-4" />
                  Call
                </Button>
              {/if}
            </div>
          </Card.Content>
          <div class="order-1 md:order-2 aspect-video md:aspect-auto md:min-h-[260px] bg-muted flex items-center justify-center p-4 md:p-6 md:pr-8 overflow-hidden">
            {#if service.slug === "voice-ai"}
              <img
                src="/images/voice.svg"
                alt="Voice AI - 24/7 call handling for Toronto businesses"
                class="w-full h-full object-contain max-h-[260px]"
                width="400"
                height="260"
              />
            {:else if service.slug === "workflow-automation"}
              <img
                src="/images/automation.svg"
                alt="Business automation - reclaim your time"
                class="w-full h-full object-contain max-h-[260px]"
                width="400"
                height="260"
              />
            {:else if service.slug === "website-seo"}
              <img
                src="/images/website.svg"
                alt="Website & SEO Toronto - convert and rank"
                class="w-full h-full object-contain max-h-[260px]"
                width="400"
                height="260"
              />
            {:else}
              <span class="text-muted-foreground">{(service as { title: string }).title}</span>
            {/if}
          </div>
          </Card.Root>
        </BrushCard>
      {/each}
    </div>

    <p class="mt-10 text-sm text-muted-foreground">
      Custom packages available. Mix and match any solutions. <a href="/contact" class="text-primary underline">get in touch</a>.
    </p>
  </div>
</section>

<!-- Industries we serve -->
<section id="industries" class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">
      Built for businesses like yours
    </h2>
    <p class="text-muted-foreground text-base mb-10 max-w-2xl leading-7">{industriesIntro}</p>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {#each industries as ind}
        <BrushCard>
          <Card.Root class="border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors h-full flex flex-col">
            <a href={ind.href} class="block contents flex flex-col flex-1 min-h-0">
            <Card.Header class="space-y-1.5 pb-2 flex-1">
              {#if industryIcons[ind.slug]}
                <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svelte:component this={industryIcons[ind.slug]} class="h-5 w-5" />
                </div>
              {/if}
              <Card.Title class="text-xl font-semibold tracking-tight">{ind.name}</Card.Title>
              <Card.Description class="text-muted-foreground leading-relaxed text-sm">{ind.description}</Card.Description>
            </Card.Header>
            <Card.Content class="pt-4 pb-6">
              <span class="text-sm font-medium text-primary hover:underline">Learn more →</span>
            </Card.Content>
          </a>
          </Card.Root>
        </BrushCard>
      {/each}
    </div>

    <div class="mt-8">
      <Button href="/industries" variant="link" class="font-heading text-primary p-0 h-auto text-sm">
        View all industries we serve →
      </Button>
    </div>
    <p class="mt-6 text-sm text-muted-foreground">
      Also see our umbrella page: <a href="/ai-automation-toronto" class="text-primary underline">AI Automation Toronto</a> and <a href="/ai-automation-gta" class="text-primary underline">AI Automation GTA</a>.
    </p>
  </div>
</section>

<!-- Example outcomes (not full case studies; one CTA to contact) -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
      <div class="lg:sticky lg:top-24">
        <h2 class="typography-h2 mb-3">Results we help businesses achieve</h2>
        <p class="text-muted-foreground text-base max-w-xl leading-7">
          Toronto and GTA businesses use our Voice AI, automation, and website & SEO to get outcomes like these.
        </p>
      </div>
      <div class="flex flex-col gap-5 md:gap-6">
        {#each caseStudies as study}
          <BrushCard>
            <Card.Root class="border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors flex flex-col">
              <a href="/case-studies" class="block contents flex flex-col flex-1 min-h-0">
                <Card.Header class="space-y-1.5 pb-2 flex-1">
                  <Card.Title class="text-xl font-semibold tracking-tight">{study.title}</Card.Title>
                  <Card.Description class="text-muted-foreground leading-relaxed text-sm">{study.outcome}</Card.Description>
                </Card.Header>
                <Card.Content class="pt-4 pb-6">
                  <span class="text-sm font-medium text-primary hover:underline">{study.cta} →</span>
                </Card.Content>
              </a>
            </Card.Root>
          </BrushCard>
        {/each}
        <BrushCard>
          <Card.Root class="border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-colors flex flex-col">
            <a href="/process" class="block contents flex flex-col flex-1 min-h-0">
              <Card.Header class="space-y-1.5 pb-2 flex-1">
                <Card.Title class="text-xl font-semibold tracking-tight">How It Works</Card.Title>
                <Card.Description class="text-muted-foreground leading-relaxed text-sm">
                  Free strategy call, custom solution, implementation, then ongoing support. Toronto-based, no surprises.
                </Card.Description>
              </Card.Header>
              <Card.Content class="pt-4 pb-6">
                <span class="text-sm font-medium text-primary hover:underline">See our process →</span>
              </Card.Content>
            </a>
          </Card.Root>
        </BrushCard>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">
      Frequently Asked Questions
    </h2>
    <p class="text-muted-foreground text-base mb-10 leading-7">{faqIntro}</p>

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
<section id="contact" class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">
      {ctaBlock.headline}
    </h2>
    <p class="typography-lead mb-6 max-w-2xl mx-auto">
      {ctaBlock.subhead}
    </p>
    <Button
      href="#contact"
      size="lg"
      class="bg-primary hover:bg-primary/90"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
      data-cal-config={JSON.stringify({ layout: "month_view" })}
    >
      {ctaBlock.button}
    </Button>
    <p class="typography-muted mt-4">{ctaBlock.note}</p>
  </div>
</section>

