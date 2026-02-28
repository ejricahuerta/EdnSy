<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { RosettaSuiteCta } from "$lib/components/landing";
  import { Cpu, Sparkles, Clock, Handshake, Target } from "lucide-svelte";
  import { teamIntro, teamMembers, teamValues, teamStats, ctaBlock } from "$lib/content/site";
  const teamMemberIcons = [Cpu, Sparkles];
  const teamValueIcons = [Clock, Handshake, Target];
</script>

<section class="bg-background pt-32 md:pt-36 pb-12 md:pb-16">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h1 class="typography-h1 mb-5">About Ed & Sy</h1>
    <p class="typography-lead max-w-2xl">{teamIntro}</p>
  </div>
</section>

<section class="py-12 md:py-16 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">Our team</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {#each teamMembers as member, i}
        <Card.Root class="border-border bg-card">
          <Card.Header class="space-y-1.5 pb-2">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={teamMemberIcons[i]} class="h-5 w-5" />
            </div>
            <Card.Title class="text-xl">{member.name}</Card.Title>
            <Card.Description class="text-sm font-medium text-primary">{member.role}</Card.Description>
          </Card.Header>
          <Card.Content class="pt-0">
            <p class="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-6">Our values</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {#each teamValues as value, i}
        <Card.Root class="border-border bg-card">
          <Card.Header class="space-y-1.5 pb-2">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={teamValueIcons[i]} class="h-5 w-5" />
            </div>
            <Card.Title class="text-lg">{value.title}</Card.Title>
          </Card.Header>
          <Card.Content class="pt-0">
            <Card.Description class="text-sm text-muted-foreground leading-relaxed">{value.description}</Card.Description>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
      {#each teamStats as stat}
        <div>
          <p class="text-2xl font-bold text-foreground">{stat.value}</p>
          <p class="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="typography-h2 mb-3">{ctaBlock.headline}</h2>
    <p class="text-muted-foreground mb-6 max-w-xl mx-auto">{ctaBlock.subhead}</p>
    <Button
      href="/contact"
      size="lg"
      class="bg-primary hover:bg-primary/90"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
    >
      {ctaBlock.button}
    </Button>
    <div class="mt-6">
      <RosettaSuiteCta variant="inline" />
    </div>
  </div>
</section>
