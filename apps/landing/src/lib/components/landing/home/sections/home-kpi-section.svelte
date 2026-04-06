<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { homeStatsBar } from "$lib/content/site";

  const kpis = homeStatsBar.kpis;
</script>

<section
  class="border-t border-zinc-200/50 bg-[var(--home-soft)] py-10 md:py-14"
  aria-label="Key metrics"
>
  <div class="mx-auto w-full max-w-7xl px-6 lg:px-10">
    <div class="mb-6 flex justify-center md:justify-start">
      <Badge variant="secondary" class="border-0 bg-primary/10 text-xs font-semibold text-primary">
        Proof points
      </Badge>
    </div>
    <Card.Root class="border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
      <Card.Content class="p-6 md:p-8">
        <div class="flex flex-col md:flex-row md:items-stretch md:justify-between">
          {#each kpis as kpi, i (kpi.label)}
            <div
              class="flex flex-1 flex-col py-6 text-center first:pt-2 last:pb-2 md:px-4 md:py-2 md:text-left"
            >
              <div class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-[2.25rem]">
                {kpi.value}
              </div>
              <div
                class="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-800 sm:text-xs sm:tracking-[0.14em]"
              >
                {kpi.shortLabel}
              </div>
              <p class="mt-2 text-xs leading-relaxed text-zinc-600 sm:text-sm">{kpi.label}</p>
            </div>
            {#if i < kpis.length - 1}
              <Separator class="bg-zinc-200 md:hidden" />
              <Separator
                orientation="vertical"
                class="hidden min-h-[5.5rem] self-center bg-zinc-200 md:block"
              />
            {/if}
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</section>
