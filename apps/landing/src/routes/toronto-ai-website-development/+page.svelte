<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Accordion from "$lib/components/ui/accordion";
  import { torontoAiWebsitePage } from "$lib/content/local-pages";
  import { buildServiceSchema, buildFAQSchema } from "$lib/content/seo";
  import { buildBreadcrumbSchema } from "$lib/content/seo";

  const serviceSchema = buildServiceSchema(
    "Toronto AI Website Development - AI Website Agency",
    "Ed & Sy Inc. is an AI website development agency in Toronto. Fast, high-converting, SEO-ready websites for Toronto and Ontario businesses.",
    "/toronto-ai-website-development"
  );
  const faqSchema = buildFAQSchema(torontoAiWebsitePage.faq);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Toronto AI Website Development", url: "/toronto-ai-website-development" },
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
      <span class="text-foreground">Toronto AI Website Development</span>
    </nav>
    <h1 class="typography-h1 mb-5 text-balance">{torontoAiWebsitePage.hero.headline}</h1>
    <p class="typography-lead mb-6 max-w-2xl">{torontoAiWebsitePage.hero.body}</p>
    <Button href="/contact" size="lg" class="bg-primary hover:bg-primary/90" data-cal-link="edmel-ednsy/enable-ai" data-cal-namespace="enable-ai">
      {torontoAiWebsitePage.cta}
    </Button>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">Toronto AI Website Development – What We Do</h2>
    <p class="text-muted-foreground mb-8 max-w-2xl leading-7">{torontoAiWebsitePage.intro}</p>
    <p class="text-muted-foreground mb-8 leading-7">{torontoAiWebsitePage.industries}</p>
    <p class="text-muted-foreground leading-7">{torontoAiWebsitePage.process}</p>
    <div class="mt-10 flex flex-wrap gap-4">
      <Button href="/website-design-toronto" variant="outline">Website Design Toronto</Button>
      <Button href="/contact" variant="default" class="bg-primary hover:bg-primary/90">Contact Us</Button>
    </div>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">Frequently Asked Questions</h2>
    <Accordion.Root type="single" class="w-full">
      {#each torontoAiWebsitePage.faq as item}
        <Accordion.Item value={item.question}>
          <Accordion.Trigger>{item.question}</Accordion.Trigger>
          <Accordion.Content>{item.answer}</Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-4">Explore More</h2>
    <ul class="flex flex-wrap gap-4 text-sm">
      {#each torontoAiWebsitePage.internalLinks as link}
        <li><a href={link.href} class="text-primary hover:underline">{link.label}</a></li>
      {/each}
    </ul>
    <div class="mt-10">
      <Button href="/contact" size="lg" class="bg-primary hover:bg-primary/90" data-cal-link="edmel-ednsy/enable-ai" data-cal-namespace="enable-ai">
        {torontoAiWebsitePage.cta}
      </Button>
    </div>
  </div>
</section>
