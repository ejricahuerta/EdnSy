<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { blogPosts } from "$lib/content/blog-posts";
  import { buildBlogCollectionSchema, buildBreadcrumbSchema } from "$lib/content/seo";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);
  const blogCollectionSchema = buildBlogCollectionSchema(blogPosts);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(blogCollectionSchema)}</script>`}
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
    <h2 class="typography-h2 mb-8">Latest articles</h2>
    <p class="text-muted-foreground mb-10 max-w-2xl leading-7">
      Practical guides for Toronto and Ontario business owners evaluating Voice AI, automation, and website growth systems.
    </p>
    <ul class="space-y-6">
      {#each blogPosts as post}
        <li>
          <Card.Root class="border-border bg-card">
            <Card.Header>
              <Card.Title class="text-xl">
                <a href={`/blog/${post.slug}`} class="hover:text-primary transition-colors">
                  {post.title}
                </a>
              </Card.Title>
              <Card.Description class="leading-relaxed">{post.excerpt}</Card.Description>
            </Card.Header>
            <Card.Content>
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{post.publishedAt}</span>
                <span>•</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
              <div class="mt-4">
                <Button href={`/blog/${post.slug}`} variant="outline">Read article</Button>
              </div>
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
  </div>
</section>
