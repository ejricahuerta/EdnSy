<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { faqItems, homeFaqHeading } from "$lib/content/site";
</script>

<section id="faq" class="border-t border-zinc-200/60 bg-[var(--home-soft)] py-16 md:py-20 lg:py-24">
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <Badge
      variant="outline"
      class="border-primary/20 bg-primary/[0.04] text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
    >
      {homeFaqHeading.eyebrow}
    </Badge>
    <h2 class="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
      {homeFaqHeading.headline}
    </h2>

    <Card.Root
      class="mx-auto mt-10 max-w-3xl rounded-3xl border-zinc-200/70 bg-white px-2 py-3 shadow-sm md:px-4 md:py-4"
    >
      <Card.Content class="p-3 md:p-4">
        <Accordion.Root type="single" class="w-full">
          {#each faqItems as item, i (i)}
            <Accordion.Item value={`faq-${i}`} class="border-b border-zinc-200/80 last:border-b-0">
              <Accordion.Trigger
                class="py-4 text-left text-base font-semibold leading-snug hover:no-underline md:text-lg"
              >
                {item.question}
              </Accordion.Trigger>
              <Accordion.Content class="pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      </Card.Content>
    </Card.Root>
  </div>
</section>
