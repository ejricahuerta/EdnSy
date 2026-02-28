<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { RosettaSuiteCta } from "$lib/components/landing";
  import { buildBreadcrumbSchema } from "$lib/content/seo";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  /** Placeholder for pillar articles. Add slugs and titles as content is published. */
  const blogPosts: { title: string; slug: string; excerpt: string; href?: string }[] = [
    {
      title: "Chart Rosetta",
      slug: "chart-rosetta",
      excerpt: "Decode any chart screenshot into plain English. Paste a screenshot, get an instant explanation, no sign-up. From Ed & Sy.",
      href: "/blog/chart-rosetta",
    },
    {
      title: "What is Voice AI for Businesses?",
      slug: "what-is-voice-ai-for-businesses",
      excerpt: "Voice AI for business is an AI-powered phone system that answers calls 24/7 and qualifies leads. Learn how Toronto businesses use it.",
    },
    {
      title: "How AI Automation Reduces Operational Costs",
      slug: "how-ai-automation-reduces-operational-costs",
      excerpt: "Discover how workflow and AI automation help Ontario businesses save time and reduce manual costs.",
    },
    {
      title: "Voice AI vs IVR Systems",
      slug: "voice-ai-vs-ivr-systems",
      excerpt: "How conversational Voice AI differs from traditional IVR, and why it matters for Toronto businesses.",
    },
  ];
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <nav class="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">Blog</span>
    </nav>
    <h1 class="typography-h1 mb-5">Blog</h1>
    <p class="typography-lead max-w-2xl">
      Articles on Voice AI, business automation, and AI website development for Toronto and Ontario businesses.
    </p>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-8">Coming soon: pillar articles</h2>
    <p class="text-muted-foreground mb-10 max-w-2xl leading-7">
      We're publishing in-depth guides on Voice AI, automation, and AI websites. Topics will include: What is Voice AI for Businesses?, How AI Automation Reduces Operational Costs, Voice AI vs IVR Systems, and more.
    </p>
    <ul class="space-y-6">
      {#each blogPosts as post}
        <li>
          <Card.Root class="border-border bg-card">
            <Card.Header>
              <Card.Title class="text-xl">
                {#if post.href}
                  <a href={post.href} class="text-foreground hover:text-primary hover:underline">{post.title}</a>
                {:else}
                  {post.title}
                {/if}
              </Card.Title>
              <Card.Description class="leading-relaxed">{post.excerpt}</Card.Description>
            </Card.Header>
            <Card.Content>
              {#if post.href}
                <a href={post.href} class="text-sm text-primary hover:underline">Read article →</a>
              {:else}
                <span class="text-sm text-muted-foreground">Article coming soon.</span>
              {/if}
            </Card.Content>
          </Card.Root>
        </li>
      {/each}
    </ul>
    <div class="mt-12 flex flex-wrap gap-4">
      <Button href="/voice-ai-for-business" variant="outline">Voice AI</Button>
      <Button href="/business-automation-services" variant="outline">Business Automation</Button>
      <Button href="/website-design-toronto" variant="outline">Website & SEO</Button>
      <Button href="/contact" class="bg-primary hover:bg-primary/90">Contact Us</Button>
    </div>
    <div class="mt-6">
      <RosettaSuiteCta variant="inline" />
    </div>
  </div>
</section>
