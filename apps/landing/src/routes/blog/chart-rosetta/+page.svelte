<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { buildBreadcrumbSchema } from "$lib/content/seo";
  import { ExternalLink } from "lucide-svelte";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: "Chart Rosetta", url: "/blog/chart-rosetta" },
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
      <span class="text-foreground">Chart Rosetta</span>
    </nav>
    <h1 class="typography-h1 mb-5">Chart Rosetta</h1>
    <p class="typography-lead max-w-2xl">
      A web app from Ed & Sy that decodes any chart screenshot and explains it in plain English. Your data, finally readable—paste a screenshot and get an instant, shareable summary.
    </p>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">What Chart Rosetta does</h2>
    <p class="text-muted-foreground leading-relaxed mb-6">
      <strong>Chart Rosetta</strong> is a web app we built to turn any chart into plain English. Its tagline says it best: <em>Your data, finally in plain English.</em> You paste a screenshot of a chart—from a report, a slide, a dashboard, or a paper—and Chart Rosetta decodes it and explains what it shows in clear, readable language. No more squinting at axes and legends; you get an instant, shareable explanation.
    </p>

    <h2 class="typography-h2 mb-6 mt-12">How it works</h2>
    <p class="text-muted-foreground leading-relaxed mb-6">
      Drop a chart image onto the site or paste from your clipboard (e.g. <kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono">⌘V</kbd>). Chart Rosetta accepts PNG, JPG, GIF, and WebP files up to 5MB. Hit “Explain this chart” and you get a plain-English summary you can read, use in a memo, or share with anyone—no need for them to interpret the chart themselves.
    </p>

    <h2 class="typography-h2 mb-6 mt-12">Who it’s for</h2>
    <p class="text-muted-foreground leading-relaxed mb-6">
      Chart Rosetta is for anyone who deals with charts but doesn’t want to spend time decoding them. That includes professionals reviewing reports or dashboards, students working with data, presenters who need a quick takeaway from a graph, and teams that want to share chart insights in emails or docs without attaching the raw image. It’s also useful for accessibility—turning a visual into text that screen readers and colleagues can use.
    </p>

    <p class="text-muted-foreground leading-relaxed mb-10">
      We built it to be fast and simple: no sign-up required to get started. Try it below.
    </p>

    <Card.Root class="border-border bg-card max-w-xl">
      <Card.Header>
        <Card.Title class="text-xl">Try Chart Rosetta</Card.Title>
        <Card.Description>Paste a screenshot · Get plain English · Share with anyone.</Card.Description>
      </Card.Header>
      <Card.Footer class="flex gap-3">
        <Button href={chartRosettaUrl} target="_blank" rel="noopener noreferrer" class="bg-primary hover:bg-primary/90">
          Open Chart Rosetta
          <ExternalLink class="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
        <Button href="/blog" variant="outline">Back to Blog</Button>
      </Card.Footer>
    </Card.Root>
  </div>
</section>
