<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import type { PageData } from "./$types";
  import {
    buildBlogPostingSchema,
    buildBreadcrumbSchema,
    buildFAQSchema,
  } from "$lib/content/seo";

  let { data }: { data: PageData } = $props();
  const post = data.post;
  const postPath = `/blog/${post.slug}`;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: postPath },
  ]);
  const articleSchema = buildBlogPostingSchema({
    title: post.title,
    description: post.description,
    path: postPath,
    publishedAt: post.publishedAt,
    keywords: post.keywords,
  });
  const faqSchema = buildFAQSchema(post.faq);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-4xl mx-auto px-6 lg:px-8">
    <nav class="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <a href="/blog" class="text-primary hover:underline">Blog</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">{post.title}</span>
    </nav>
    <h1 class="typography-h1 mb-4 text-balance">{post.title}</h1>
    <p class="typography-lead mb-6">{post.intro}</p>
    <p class="text-sm text-muted-foreground">
      Published {post.publishedAt} • {post.readingTimeMinutes} min read
    </p>
  </div>
</section>

<article class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
    {#each post.sections as section}
      <Card.Root class="border-border bg-card">
        <Card.Header>
          <Card.Title class="typography-h3">{section.heading}</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          {#each section.paragraphs as paragraph}
            <p class="text-muted-foreground leading-7">{paragraph}</p>
          {/each}

          {#if section.bullets}
            <ul class="space-y-2 text-muted-foreground">
              {#each section.bullets as bullet}
                <li class="flex items-start gap-2">
                  <span class="text-primary mt-0.5 shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
</article>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-4xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card">
      <Card.Header>
        <Card.Title class="typography-h3">Frequently Asked Questions</Card.Title>
      </Card.Header>
      <Card.Content>
        <Accordion.Root type="single" class="w-full">
          {#each post.faq as item}
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
  <div class="max-w-4xl mx-auto px-6 lg:px-8">
    <Card.Root class="border-border bg-card">
      <Card.Header>
        <Card.Title class="typography-h3">{post.cta.heading}</Card.Title>
        <Card.Description>{post.cta.body}</Card.Description>
      </Card.Header>
      <Card.Footer class="flex flex-wrap gap-3">
        <Button href={post.cta.buttonHref} class="bg-primary hover:bg-primary/90">
          {post.cta.buttonLabel}
        </Button>
        <Button href="/blog" variant="outline">Back to Blog</Button>
      </Card.Footer>
    </Card.Root>
  </div>
</section>
