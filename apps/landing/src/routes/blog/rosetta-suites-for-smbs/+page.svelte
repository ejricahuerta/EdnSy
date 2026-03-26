<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { RosettaSuiteCta } from "$lib/components/landing";
  import { buildBreadcrumbSchema } from "$lib/content/seo";
  import ExternalLink from "@lucide/svelte/icons/external-link";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: "Rosetta Suites for SMBs", url: "/blog/rosetta-suites-for-smbs" },
  ]);

  const chartRosettaUrl = "https://chartrosetta.com";
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <nav class="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <a href="/" class="text-primary hover:underline">Home</a>
      <span class="mx-2">/</span>
      <a href="/blog" class="text-primary hover:underline">Blog</a>
      <span class="mx-2">/</span>
      <span class="text-foreground">Rosetta Suites for SMBs</span>
    </nav>
    <p class="text-sm font-medium text-primary mb-2">In development</p>
    <h1 class="typography-h1 mb-5">Rosetta Suites for SMBs | What We're Building</h1>
    <p class="typography-lead max-w-2xl">
      Ed & Sy is building a family of practical AI tools designed for small and medium businesses. Here’s what’s live, what’s in development, and why it matters for you.
    </p>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">What are the Rosetta Suites?</h2>
    <p class="text-muted-foreground leading-relaxed mb-6">
      The <strong>Rosetta Suites</strong> are focused tools that solve specific, everyday problems for SMBs, including turning confusing data into plain language, improving how you (or your partners) reach prospects, and saving time on repetitive work. We’re building them in stages. Some are live today; others are in active development.
    </p>

    <h2 class="typography-h2 mb-6 mt-12">What’s live now</h2>
    <p class="text-muted-foreground leading-relaxed mb-4">
      <strong>Chart Rosetta</strong> is live and free to try. Paste a screenshot of any chart from a report, dashboard, or slide, and get a plain-English explanation in seconds. No sign-up required. It’s useful when you’re reviewing reports, preparing presentations, or sharing insights with your team or clients without making everyone interpret the graph themselves.
    </p>
    <p class="text-muted-foreground leading-relaxed mb-6">
      For SMBs, that means less time decoding data and more time acting on it. Try it at <a href={chartRosettaUrl} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">chartrosetta.com</a>.
    </p>

    <h2 class="typography-h2 mb-6 mt-12">What’s in development</h2>
    <p class="text-muted-foreground leading-relaxed mb-4">
      We’re actively building <strong>Lead Rosetta</strong>, a tool that helps agencies, freelancers, and sales teams create personalized outreach pages for prospects. It uses a prospect’s Google Business Profile and reviews to generate a tailored demo or proposal page, so outreach feels like “we already built this for you” instead of a generic pitch. We use it ourselves to reach trades and service businesses in the GTA and are opening it to others as we finish the product.
    </p>
    <p class="text-muted-foreground leading-relaxed mb-6">
      If you’re an SMB, this matters because it’s the kind of tool that serious agencies and partners will use to approach you with something already customized to your business, not a one-size-fits-all email. We’ll share launch updates as we get closer.
    </p>

    <h2 class="typography-h2 mb-6 mt-12">Why this is useful for SMBs</h2>
    <p class="text-muted-foreground leading-relaxed mb-4">
      Small and medium businesses often lack the time or budget for heavy enterprise software. The Rosetta Suites are built to be practical, with one clear job per tool, minimal setup, and value you can see quickly. Chart Rosetta gives you instant clarity on any chart; Lead Rosetta (when it’s out) will help the right partners show up with proof instead of vague promises.
    </p>
    <p class="text-muted-foreground leading-relaxed mb-10">
      We’re in development mode, shipping what’s ready and being transparent about what’s next. If you want to stay in the loop on new tools or early access, <a href="/contact" class="text-primary hover:underline">get in touch</a> or try Chart Rosetta below.
    </p>

    <Card.Root class="border-border bg-card max-w-xl">
      <Card.Header>
        <Card.Title class="text-xl">Try Chart Rosetta today</Card.Title>
        <Card.Description>Paste a chart screenshot · Get plain English · No sign-up.</Card.Description>
      </Card.Header>
      <Card.Footer class="flex flex-col gap-3">
        <div class="flex gap-3">
          <Button href={chartRosettaUrl} target="_blank" rel="noopener noreferrer" class="bg-primary hover:bg-primary/90">
            Open Chart Rosetta
            <ExternalLink class="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button href="/blog" variant="outline">Back to Blog</Button>
        </div>
        <RosettaSuiteCta variant="inline" class="mt-1" />
      </Card.Footer>
    </Card.Root>
  </div>
</section>
