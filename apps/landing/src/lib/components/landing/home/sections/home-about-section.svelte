<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import {
    homeAboutHeading,
    homeAboutLead,
    homeAboutSecondary,
    homeAboutStoryHref,
    homeAboutStoryLabel,
  } from "$lib/content/site";
</script>

<section id="about" class="border-t border-zinc-200/60 bg-[var(--home-soft)] py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div class="grid grid-cols-2 gap-4 sm:gap-5">
        <Card.Root class="overflow-hidden rounded-3xl border-zinc-200/80 bg-zinc-200 p-0 shadow-md">
          <Card.Content class="p-0">
            <img
              src="/images/ed.png"
              alt="Ed, co-founder"
              width="600"
              height="600"
              class="aspect-square h-full w-full object-cover grayscale"
              loading="lazy"
              decoding="async"
            />
          </Card.Content>
        </Card.Root>
        <Card.Root class="overflow-hidden rounded-3xl border-zinc-200/80 bg-zinc-200 p-0 shadow-md">
          <Card.Content class="p-0">
            <img
              src="/images/sy.png"
              alt="Sy, co-founder"
              width="600"
              height="600"
              class="aspect-square h-full w-full object-cover grayscale"
              loading="lazy"
              decoding="async"
            />
          </Card.Content>
        </Card.Root>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {homeAboutHeading.eyebrow}
        </p>
        <h2 class="mt-3 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
          {homeAboutHeading.headline}
        </h2>
        <p class="mt-6 text-base leading-relaxed text-zinc-600 md:text-lg">
          {homeAboutLead}
        </p>
        <p class="mt-4 text-base leading-relaxed text-zinc-600 md:text-lg">
          {homeAboutSecondary}
        </p>
        <div class="mt-8">
          <Button href={homeAboutStoryHref} variant="link" class="h-auto p-0 text-sm font-semibold text-primary">
            {homeAboutStoryLabel}
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
