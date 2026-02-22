<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import {
    Cpu,
    Sparkles,
    Clock,
    Handshake,
    Target,
    Phone,
    Award,
    MapPin,
  } from "lucide-svelte";
  import { teamIntro, teamMembers, teamValues, teamStats, ctaBlock } from "$lib/content/site";

  const teamMemberIcons = [Cpu, Sparkles];
  const teamValueIcons = [Clock, Handshake, Target];
  const teamStatIcons = [Phone, Clock, Award, MapPin];
</script>

<svelte:head>
  <title>Meet the Team | Ed & Sy | Tech Implementation & AI for Toronto Businesses</title>
  <meta
    name="description"
    content="Ed & Sy: Toronto entrepreneurs on a mission to help local businesses reclaim their time through tech implementation and AI."
  />
</svelte:head>

<!-- Hero - 50vh (same as industries) -->
<section class="min-h-[50vh] bg-background pt-24 md:pt-28 pb-12 md:pb-16 flex flex-col">
  <div class="max-w-6xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center w-full">
    <h1 class="typography-h1 mb-3">
      The humans behind your automation
    </h1>
    <p class="typography-lead max-w-2xl">{teamIntro}</p>
  </div>
</section>

<!-- Team members -->
<section class="py-16 md:py-24 bg-muted/30">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {#each teamMembers as member, i}
        <Card.Root class="h-full flex flex-col border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/50 overflow-hidden">
          <Card.Header class="space-y-1.5 pb-2">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={teamMemberIcons[i]} class="h-5 w-5" />
            </div>
            <Card.Title class="typography-h3">{member.name}</Card.Title>
            <Card.Description class="text-sm font-medium text-primary">{member.role}</Card.Description>
          </Card.Header>
          <Card.Content class="flex-1 pt-0">
            <p class="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  </div>
</section>

<!-- Our values -->
<section class="py-16 md:py-24 bg-background">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-3">Our values</h2>
    <p class="typography-muted mb-6">
      The principles that guide everything we do at Ed & Sy.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {#each teamValues as value, i}
        <Card.Root class="h-full flex flex-col border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/50">
          <Card.Header class="space-y-1.5 pb-2">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svelte:component this={teamValueIcons[i]} class="h-5 w-5" />
            </div>
            <Card.Title class="typography-h4">{value.title}</Card.Title>
          </Card.Header>
          <Card.Content class="flex-1 pt-0">
            <Card.Description class="text-sm text-muted-foreground leading-relaxed">{value.description}</Card.Description>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
      {#each teamStats as s, i}
        <div class="flex flex-col items-center text-center">
          <div class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svelte:component this={teamStatIcons[i]} class="h-5 w-5" />
          </div>
          <p class="text-3xl font-bold text-foreground">{s.value}</p>
          <p class="text-sm text-muted-foreground">{s.label}</p>
        </div>
      {/each}
    </div>
    <p class="text-center text-muted-foreground mt-4">Based in Toronto, Canada</p>
  </div>
</section>

<!-- CTA -->
<section class="py-16 md:py-24 bg-background text-center">
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <h2 class="typography-h2 mb-2">{ctaBlock.headline}</h2>
    <p class="typography-lead mb-6">{ctaBlock.subhead}</p>
    <Button
      href="/#contact"
      size="lg"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
    >
      {ctaBlock.button}
    </Button>
    <p class="text-sm text-muted-foreground mt-4">{ctaBlock.note}</p>
  </div>
</section>
