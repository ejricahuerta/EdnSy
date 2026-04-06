<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import {
    homeServicesHeading,
    services,
    servicesIntro,
    voiceAiPhoneNumber,
  } from "$lib/content/site";
</script>

<section id="services" class="border-t border-zinc-200/75 bg-white py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="flex justify-center">
      <Badge
        variant="outline"
        class="border-primary/20 bg-primary/[0.04] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
      >
        {homeServicesHeading.eyebrow}
      </Badge>
    </div>

    <h2
      class="mx-auto mt-4 max-w-3xl text-center text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl lg:text-[2.5rem] lg:leading-tight"
    >
      {homeServicesHeading.headline}
    </h2>

    <p class="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-zinc-600 md:text-lg">
      {servicesIntro}
    </p>

    <div
      class="mt-12 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-3 lg:items-stretch lg:gap-5 xl:gap-6"
    >
      {#each services as service (service.slug)}
        <Card.Root
          id={service.slug}
          class="scroll-mt-24 flex h-full flex-col overflow-hidden rounded-3xl border transition-shadow {service.popular
            ? 'border-primary bg-primary text-primary-foreground shadow-2xl shadow-primary/25 lg:z-10 lg:scale-[1.02] lg:shadow-xl'
            : 'border-zinc-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]'}"
        >
          <Card.Content class="flex flex-1 flex-col p-7 md:p-8">
            {#if service.popular}
              <Badge
                class="mb-4 w-fit border-0 bg-white/15 text-[10px] uppercase tracking-wider text-white hover:bg-white/20"
              >
                Featured
              </Badge>
            {/if}

            <h3 class="text-xl font-semibold tracking-tight {service.popular ? '' : 'text-foreground'}">
              {service.title}
            </h3>
            <p
              class="mt-1 text-sm font-medium {service.popular ? 'text-white/85' : 'text-primary'}"
            >
              {service.tagline}
            </p>

            <p
              class="mt-4 flex-1 text-sm leading-relaxed {service.popular ? 'text-white/80' : 'text-muted-foreground'}"
            >
              {service.description}
            </p>

            <ul
              class="mt-6 space-y-2.5 text-sm {service.popular ? 'text-white/90' : 'text-foreground'}"
            >
              {#each service.bullets.slice(0, 4) as bullet (bullet)}
                <li class="flex gap-2">
                  <span
                    class="mt-1.5 size-1 shrink-0 rounded-full {service.popular ? 'bg-white' : 'bg-primary'}"
                  ></span>
                  <span>{bullet}</span>
                </li>
              {/each}
            </ul>

            <div class="mt-8 flex flex-col gap-2">
              {#if service.popular}
                <Button
                  type="button"
                  size="lg"
                  class="h-11 w-full rounded-xl border-0 bg-white text-base font-semibold text-primary hover:bg-white/90"
                  data-cal-link="edmel-ednsy/enable-ai"
                  data-cal-namespace="enable-ai"
                  data-cal-config={JSON.stringify({ layout: "month_view" })}
                >
                  Book a demo
                </Button>
                <Button
                  href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`}
                  size="lg"
                  variant="outline"
                  class="h-11 w-full rounded-xl border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Call us
                </Button>
              {:else}
                <Button
                  href={service.href}
                  variant="outline"
                  class="h-11 w-full rounded-xl border-zinc-200 bg-white text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
                >
                  {service.cta}
                </Button>
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>
