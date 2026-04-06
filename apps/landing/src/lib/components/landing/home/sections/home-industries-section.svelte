<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { homeIndustriesHeading, industries } from "$lib/content/site";
  import { industryIcons } from "$lib/content/industry-icons";

  const featured = industries.filter((i) =>
    ["healthcare", "dental", "construction", "legal"].includes(i.slug),
  );
</script>

<section id="industries" class="border-t border-zinc-200/65 bg-white py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <Badge
      variant="outline"
      class="border-primary/20 bg-primary/[0.04] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
    >
      {homeIndustriesHeading.eyebrow}
    </Badge>
    <h2 class="mt-3 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
      {homeIndustriesHeading.headline}
    </h2>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {#each featured as ind (ind.slug)}
        <a href={ind.href} class="group block">
          <Card.Root
            class="h-full rounded-2xl border-primary/10 bg-[var(--home-soft)] transition-shadow hover:border-primary/25 hover:shadow-md"
          >
            <Card.Content class="flex flex-col items-center p-6 text-center md:p-7">
              {#if industryIcons[ind.slug]}
                {@const Icon = industryIcons[ind.slug]}
                <div
                  class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15"
                >
                  <Icon class="size-5" />
                </div>
              {/if}
              <h3 class="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-900">
                {ind.name}
              </h3>
              <p class="mt-2 text-xs leading-relaxed text-zinc-600">{ind.description}</p>
            </Card.Content>
          </Card.Root>
        </a>
      {/each}
    </div>
    <p class="mt-8">
      <a href="/industries" class="text-sm font-semibold text-primary hover:underline">
        View all industries →
      </a>
    </p>
  </div>
</section>
