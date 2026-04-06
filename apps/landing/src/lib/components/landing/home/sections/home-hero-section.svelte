<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import HomeLeadQuiz from "$lib/components/landing/home-lead-quiz.svelte";
  import { hero, homeLeadQuiz } from "$lib/content/site";
</script>

<section
  class="relative overflow-x-hidden bg-white pb-10 pt-24 text-foreground sm:pb-12 sm:pt-28 md:pt-32 lg:pb-14 lg:pt-36"
  aria-labelledby="home-lead-quiz-heading"
>
  <div
    class="pointer-events-none absolute inset-x-0 top-0 h-[min(38vh,320px)] bg-[radial-gradient(ellipse_80%_100%_at_80%_-10%,rgba(43,22,237,0.08)_0%,transparent_55%)]"
    aria-hidden="true"
  ></div>

  <div class="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
    <div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
      <div class="max-w-xl lg:max-w-none">
        <Badge
          variant="outline"
          class="border-primary/20 bg-primary/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary hover:bg-primary/[0.06] sm:text-[11px]"
        >
          {hero.eyebrow}
        </Badge>

        <h1
          class="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.08] md:text-6xl md:leading-[1.05] lg:text-[3.25rem] xl:text-6xl"
        >
          We give your <span class="text-primary">time back.</span>
        </h1>

        <p class="mt-5 max-w-lg text-base leading-relaxed text-zinc-600 md:text-lg md:leading-relaxed">
          {hero.subhead}
        </p>

        <div class="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            size="lg"
            class="h-12 rounded-xl px-7 text-base font-semibold shadow-lg shadow-primary/25"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({ layout: "month_view" })}
          >
            {hero.ctaPrimary}
          </Button>
          <Button
            href="#services"
            size="lg"
            variant="outline"
            class="h-12 rounded-xl border-zinc-300 bg-white px-7 text-base font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            {hero.ctaSecondary}
          </Button>
        </div>
      </div>

      <Card.Root
        class="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border-zinc-200/90 bg-white shadow-[0_16px_48px_-20px_rgba(43,22,237,0.12)] lg:mx-0 lg:max-w-none"
      >
        <Card.Header
          class="space-y-3 border-b border-zinc-100 bg-gradient-to-br from-primary/[0.06] via-white to-zinc-50/90 px-5 py-4 sm:px-6 sm:py-5"
        >
          <Badge
            variant="outline"
            class="w-fit border-primary/20 bg-white/80 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
          >
            {homeLeadQuiz.cardEyebrow}
          </Badge>
          <Card.Title
            id="home-lead-quiz-heading"
            class="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
          >
            {homeLeadQuiz.cardTitle}
          </Card.Title>
          <Card.Description class="max-w-md text-sm leading-relaxed text-zinc-600">
            {homeLeadQuiz.cardSubtitle}
          </Card.Description>
        </Card.Header>
        <Card.Content class="p-0">
          <HomeLeadQuiz />
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</section>
