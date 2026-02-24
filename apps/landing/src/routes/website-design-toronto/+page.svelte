<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import {
    AlertCircle,
    Sparkles,
    Layout,
    Target,
    Search,
    Mail,
    Gauge,
    HelpCircle,
  } from "lucide-svelte";
  import { websitePage } from "$lib/content/service-pages";
  import { buildServiceSchema, buildFAQSchema, buildBreadcrumbSchema } from "$lib/content/seo";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Website & SEO Toronto", url: "/website-design-toronto" },
  ]);
  const sectionIcons = [
    AlertCircle,
    Sparkles,
    Layout,
    Target,
    Search,
    Mail,
    Gauge,
  ];

  const serviceSchema = buildServiceSchema(
    "Website Design & SEO Toronto",
    "AI-powered website and SEO for Toronto businesses: build fast, ship fast. Not drag-and-drop CMS. Conversion-focused and SEO-ready.",
    "/website-design-toronto"
  );
  const faqSchema = buildFAQSchema(websitePage.faq);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h1 class="typography-h1 mb-5 text-balance">
      Website Design & SEO Toronto
    </h1>
    <p class="typography-lead mb-6 max-w-2xl">
      Website & SEO that convert and rank, and we don't do it the old way. No drag-and-drop CMS or endless DIY. We use AI to build fast and ship fast, so you get a conversion-focused, SEO-ready site for Toronto without the hassle. You focus on your business; we get you live.
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

<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-6 md:gap-8">
      {#each websitePage.sections as section, i}
        <Card.Root class="border-border bg-card h-full flex flex-col">
          <Card.Header class="space-y-1.5">
            <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={sectionIcons[i]} class="h-5 w-5" />
            </div>
            <h2 class="typography-h2 font-semibold leading-none">{section.heading}</h2>
          </Card.Header>
          <Card.Content class="flex-1">
            <p class="text-muted-foreground leading-7">{section.body}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card">
      <Card.Header class="space-y-1.5">
        <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle class="h-5 w-5" />
        </div>
        <h2 class="typography-h2 font-semibold leading-none">Frequently Asked Questions</h2>
      </Card.Header>
      <Card.Content>
        <Accordion.Root type="single" class="w-full">
          {#each websitePage.faq as item}
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

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <p class="text-muted-foreground mb-6">
      Explore our other services: {#each websitePage.internalLinks as link}
        <a href={link.href} class="text-primary underline">{link.label}</a>{link.href !== "/contact" ? ", " : ""}
      {/each}
    </p>
    <Card.Root class="border-border bg-card max-w-2xl">
      <Card.Header>
        <Card.Title>Ready for a website that converts and ranks?</Card.Title>
        <Card.Description>Book a free strategy call. We'll review your goals and outline a website & SEO plan for your Toronto business.</Card.Description>
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
