<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import { Badge } from "$lib/components/ui/badge";
  import {
    hero,
    stats,
    services,
    industries,
    industriesIntro,
    faqIntro,
    faqItems,
    ctaBlock,
    servicesIntro,
    valueProposition,
    problemsWeSolve,
    whoWeWorkWith,
    caseStudies,
    aiSummary,
    voiceAiPhoneNumber,
  } from "$lib/content/site";
  import { industryIcons } from "$lib/content/industry-icons";
  import { buildFAQSchema } from "$lib/content/seo";
  import { Phone, Workflow, Globe, Sparkles } from "lucide-svelte";

  const faqSchema = buildFAQSchema(faqItems);
  const serviceIcons: Record<string, typeof Phone> = {
    "voice-ai": Phone,
    "workflow-automation": Workflow,
    "website-seo": Globe,
  };
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<!-- Hero: H1 benefit-led; value prop has SEO H2 -->
<section class="min-h-screen bg-background pt-24 md:pt-28 pb-20 md:pb-28 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
      <div class="max-w-3xl">
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
      <div class="hidden lg:flex justify-center lg:justify-end">
        <img
          src="/images/hero.svg"
          alt=""
          class="w-full max-w-md lg:max-w-none h-auto object-contain"
          width="741"
          height="608"
          fetchpriority="high"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mt-14 md:mt-20">
      {#each stats as s}
        <div>
          <p class="text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
          <p class="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
          <p class="text-xs text-muted-foreground mt-0.5">{s.sublabel}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Value proposition -->
<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">{valueProposition.headline}</h2>
    <p class="text-muted-foreground text-base max-w-2xl mx-auto leading-7">{valueProposition.body}</p>
  </div>
</section>

<!-- Who we are: clear definition for visitors and AI search engines -->
<section class="py-10 md:py-12 bg-background" aria-labelledby="ai-summary-heading">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 id="ai-summary-heading" class="typography-h2 mb-4">{aiSummary.heading}</h2>
    <p class="text-foreground text-base md:text-lg leading-7 max-w-3xl">
      {aiSummary.definition}
    </p>
    <p class="text-muted-foreground text-sm mt-4 max-w-2xl">
      We serve Toronto, the GTA (including Markham, Mississauga, Vaughan, North York), Ontario, and Canada.
    </p>
  </div>
</section>

<!-- The Problems We Solve -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">The Problems We Solve</h2>
    <p class="text-muted-foreground text-base mb-12 max-w-2xl leading-7">
      Toronto service businesses lose leads and time to these common issues. We fix them with AI and automation.
    </p>
    <div class="grid md:grid-cols-3 gap-8">
      {#each problemsWeSolve as problem}
        <Card.Root class="border-border bg-card">
          <Card.Header>
            <Card.Title class="text-xl">{problem.title}</Card.Title>
            <Card.Description class="leading-relaxed">{problem.description}</Card.Description>
          </Card.Header>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- Our 3 Core Services (internal links to money pages) -->
<section id="services" class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">Our 3 Core Services</h2>
    <p class="text-muted-foreground text-base mb-12 max-w-2xl leading-7">{servicesIntro}</p>

    <div class="space-y-16 md:space-y-20">
      {#each services as service}
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
              <span class="text-muted-foreground">{service.title}</span>
            {/if}
          </div>
        </Card.Root>
      {/each}
    </div>

    <p class="mt-10 text-sm text-muted-foreground">
      Custom packages available. Mix and match any solutions. <a href="/contact" class="text-primary underline">get in touch</a>.
    </p>
  </div>
</section>

<!-- Who We Work With -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">{whoWeWorkWith.headline}</h2>
    <p class="text-muted-foreground text-base mb-10 max-w-2xl mx-auto leading-7">{whoWeWorkWith.body}</p>
  </div>
</section>

<!-- How It Works (teaser; full detail on /process) -->
<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">How It Works</h2>
    <p class="text-muted-foreground text-base mb-6 max-w-xl mx-auto leading-7">
      Free strategy call, custom solution, implementation, then ongoing support. Toronto-based, no surprises.
    </p>
    <Button href="/process" variant="outline" class="border-primary text-primary">
      See our process
    </Button>
  </div>
</section>

<!-- Example outcomes (not full case studies; one CTA to contact) -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">Results we help businesses achieve</h2>
    <p class="text-muted-foreground text-base mb-12 max-w-2xl leading-7">
      Toronto and GTA businesses use our Voice AI, automation, and website & SEO to get outcomes like these.
    </p>
    <div class="grid md:grid-cols-3 gap-8">
      {#each caseStudies as study}
        <Card.Root class="border-border bg-card">
          <Card.Header>
            <Card.Title class="text-lg">{study.title}</Card.Title>
            <Card.Description class="leading-relaxed">{study.outcome}</Card.Description>
          </Card.Header>
        </Card.Root>
      {/each}
    </div>
    <p class="text-center mt-10">
      <Button href="/case-studies" variant="outline" class="mr-3">View case studies</Button>
      <Button
        href="/contact"
        class="bg-primary hover:bg-primary/90"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
      >
        Book a call to get results like these
      </Button>
    </p>
  </div>
</section>

<!-- Industries we serve -->
<section id="industries" class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">
      Built for businesses like yours
    </h2>
    <p class="text-muted-foreground text-base mb-10 max-w-2xl leading-7">{industriesIntro}</p>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {#each industries as ind}
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

