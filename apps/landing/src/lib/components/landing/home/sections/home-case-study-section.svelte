<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { caseStudyPreviewOhMyGlass } from "$lib/content/site";
</script>

<section
  id="case-study"
  class="scroll-mt-24 border-t border-zinc-800/80 bg-zinc-950 py-16 text-white md:py-20 lg:py-24"
>
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          {caseStudyPreviewOhMyGlass.eyebrow}: {caseStudyPreviewOhMyGlass.clientName}
        </p>
        <h2 class="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.35rem]">
          From hacked site to qualified leads from search.
        </h2>
        <p class="mt-4 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg">
          Recovery, technical SEO, and a site rebuilt around how Toronto customers actually search for
          glass repair — so inbound reflects real demand.
        </p>

        <div class="mt-8 grid grid-cols-2 gap-6 sm:max-w-md">
          <div>
            <div class="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {caseStudyPreviewOhMyGlass.leadStat.value}
            </div>
            <div class="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              {caseStudyPreviewOhMyGlass.leadStat.label}
            </div>
          </div>
          <div>
            <div class="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {caseStudyPreviewOhMyGlass.secondaryStat.value}
            </div>
            <div class="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              {caseStudyPreviewOhMyGlass.secondaryStat.label}
            </div>
          </div>
        </div>

        <Button
          href={caseStudyPreviewOhMyGlass.href}
          variant="outline"
          size="lg"
          class="mt-10 h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          {caseStudyPreviewOhMyGlass.cta}
        </Button>
      </div>

      <Card.Root class="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-0 shadow-xl">
        <Card.Content class="p-0">
          <div class="border-b border-white/10 bg-zinc-900/50 px-6 py-5">
            <a
              href={caseStudyPreviewOhMyGlass.clientSiteHref}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center opacity-90 transition-opacity hover:opacity-100"
              aria-label="Visit client site"
            >
              <img
                src={caseStudyPreviewOhMyGlass.logoSrc}
                alt=""
                width="240"
                height="56"
                class="h-8 w-auto brightness-0 invert md:h-9"
                loading="lazy"
              />
            </a>
            <p class="mt-3 text-sm text-zinc-400">{caseStudyPreviewOhMyGlass.clientSubtitle}</p>
          </div>
          <div class="p-4 md:p-6">
            <Table.Root class="min-w-[520px] border-collapse text-left text-sm text-zinc-300">
              <Table.Header class="[&_tr]:border-white/10">
                <Table.Row class="border-white/10 hover:bg-transparent">
                  <Table.Head
                    class="h-auto pb-3 pr-4 text-left align-top font-semibold text-white whitespace-normal"
                  >
                    Before
                  </Table.Head>
                  <Table.Head
                    class="h-auto pb-3 pr-4 text-left align-top font-semibold text-white whitespace-normal"
                  >
                    What we did
                  </Table.Head>
                  <Table.Head class="h-auto pb-3 text-left align-top font-semibold text-white whitespace-normal">
                    After
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each caseStudyPreviewOhMyGlass.rows.slice(0, 3) as row (row.before)}
                  <Table.Row
                    class="border-white/5 last:border-0 hover:bg-white/[0.04] data-[state=selected]:bg-transparent"
                  >
                    <Table.Cell class="py-3 pr-4 align-top text-zinc-500 whitespace-normal">
                      {row.before}
                    </Table.Cell>
                    <Table.Cell class="py-3 pr-4 align-top whitespace-normal">{row.did}</Table.Cell>
                    <Table.Cell class="py-3 align-top text-zinc-200 whitespace-normal">{row.after}</Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</section>
