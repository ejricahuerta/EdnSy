<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { site } from "$lib/content/site";
  import { buildBreadcrumbSchema } from "$lib/content/seo";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  const serviceAreas = ["Toronto", "Greater Toronto Area (GTA)", "Mississauga", "Newmarket", "Scarborough", "Vaughan", "Markham", "Ontario"];
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h1 class="typography-h1 mb-5">Contact Ed & Sy</h1>
    <p class="typography-lead max-w-2xl">
      Get in touch with our Toronto team. Book a free strategy call or send a message. We serve Toronto, the GTA, and Ontario.
    </p>
  </div>
</section>

<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12">
    <div>
      <h2 class="typography-h2 mb-4">Book a Free Strategy Call</h2>
      <p class="text-muted-foreground mb-6">
        The fastest way to get started is a 30-minute strategy call. We'll review your goals and outline a custom plan. No commitment.
      </p>
      <Button
        href="#contact"
        size="lg"
        class="bg-primary hover:bg-primary/90 w-fit"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({ layout: "month_view" })}
      >
        Book a Free Strategy Call
      </Button>

      <div class="mt-10 space-y-4">
        <h3 class="font-semibold text-foreground">Ed & Sy</h3>
        <p class="text-muted-foreground">{site.location}</p>
        <a href="mailto:{site.email}" class="text-primary underline block">{site.email}</a>
      </div>
    </div>

    <div>
      <h2 class="typography-h2 mb-4">Service Areas</h2>
      <p class="text-muted-foreground mb-4">
        We work with service-based businesses across the Greater Toronto Area and Ontario.
      </p>
      <p class="text-foreground">{serviceAreas.join(", ")}</p>

      <div class="mt-8 rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video">
        <iframe
          title="Ed & Sy - Yonge and Finch, Toronto"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2880.389256832!2d-79.415567!3d43.779762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2e63f0e5f0e5%3A0x9e5e5e5e5e5e5e5e!2sYonge%20St%20%26%20Finch%20Ave%20E%2C%20North%20York%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1708646400"
          width="100%"
          height="100%"
          style="border:0; min-height: 300px;"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>
</section>

<section id="contact" class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <Card.Root class="max-w-2xl border-border bg-card">
      <Card.Header>
        <Card.Title>Prefer to message?</Card.Title>
        <Card.Description>Use the Hi button on the bottom right to open our form, or email us at {site.email}.</Card.Description>
      </Card.Header>
    </Card.Root>
  </div>
</section>
