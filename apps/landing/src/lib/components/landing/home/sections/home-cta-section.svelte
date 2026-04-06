<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { ctaBlock, voiceAiPhoneNumber } from "$lib/content/site";
</script>

<section
  id="contact"
  class="border-t border-zinc-200/80 bg-white pb-16 pt-12 md:pb-20 md:pt-16"
>
  <div id="cta" class="mx-auto max-w-7xl px-6 lg:px-10">
    <Card.Root
      class="overflow-hidden rounded-3xl border-0 bg-primary p-0 text-center text-primary-foreground shadow-2xl shadow-primary/30"
    >
      <Card.Content class="px-8 py-12 md:px-14 md:py-16">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl md:leading-tight">
          {ctaBlock.headline}
        </h2>

        <p class="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
          {ctaBlock.subhead}
        </p>

        <div
          class="mx-auto mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center"
        >
          <Button
            type="button"
            size="lg"
            class="h-12 flex-1 rounded-xl border-0 bg-white text-base font-semibold text-primary hover:bg-white/90"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({ layout: "month_view" })}
          >
            {ctaBlock.button}
          </Button>
          <Button
            href={`tel:${voiceAiPhoneNumber.replace(/\s/g, "")}`}
            size="lg"
            variant="outline"
            class="h-12 flex-1 rounded-xl border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Call now
          </Button>
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/80">
          <span>✓ No commitment</span>
          <span>✓ 30-minute call</span>
          <span>✓ Custom roadmap</span>
          <span>✓ Toronto-based</span>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</section>
