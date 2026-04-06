<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { homeFeaturedTestimonial, processIntro, processStepsHome } from "$lib/content/site";

  const steps = processStepsHome;
</script>

<section
  id="how-it-works"
  class="scroll-mt-24 border-t border-zinc-200/60 bg-[var(--home-soft)] py-16 md:py-20 lg:py-24"
>
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
      <div>
        <Badge
          variant="outline"
          class="border-primary/20 bg-primary/[0.04] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
        >
          How it works
        </Badge>
        <h2 class="mt-3 max-w-lg text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl lg:leading-tight">
          How we scale your local authority.
        </h2>
        <p class="mt-4 max-w-md text-base leading-relaxed text-zinc-600 md:text-lg">
          {processIntro}
        </p>

        <ol class="mt-10">
          {#each steps as step, i (step.step)}
            <li>
              <div class="flex gap-5">
                <span
                  class="font-mono text-2xl font-bold tabular-nums text-primary/40 md:text-3xl"
                  aria-hidden="true"
                >
                  {step.step}
                </span>
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-semibold tracking-tight text-zinc-900">{step.title}</h3>
                  <p class="mt-2 text-sm leading-relaxed text-zinc-600">{step.description}</p>
                </div>
              </div>
              {#if i < steps.length - 1}
                <Separator class="my-8 bg-zinc-200/90" />
              {/if}
            </li>
          {/each}
        </ol>
      </div>

      <div class="lg:sticky lg:top-32">
        <Card.Root
          class="rounded-3xl border-zinc-200/80 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(43,22,237,0.2)] md:p-9"
        >
          <Card.Content class="p-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {homeFeaturedTestimonial.projectLabel}
            </p>
            <blockquote
              class="mt-4 font-editorial text-xl font-normal leading-snug text-zinc-900 md:text-2xl"
            >
              “{homeFeaturedTestimonial.quote}”
            </blockquote>
            <footer class="mt-6 flex items-center gap-3">
              <Avatar.Root class="size-10 shrink-0 border border-primary/15">
                <Avatar.Fallback class="bg-primary/10 text-xs font-bold text-primary">
                  {homeFeaturedTestimonial.attributionName.slice(0, 1)}
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <div class="text-sm font-semibold text-zinc-900">
                  {homeFeaturedTestimonial.attributionName}
                </div>
                <div class="text-xs text-zinc-500">{homeFeaturedTestimonial.attributionBusiness}</div>
              </div>
            </footer>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </div>
</section>
