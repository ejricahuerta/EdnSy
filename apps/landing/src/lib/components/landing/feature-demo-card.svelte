<script lang="ts">
  /** Interactive right-column card for How it works blocks. variant = step index 0–3. */
  let { variant = 0 }: { variant: 0 | 1 | 2 | 3 } = $props();

  const stepLabel = ["01", "02", "03", "04"][variant];
</script>

{#if variant === 0}
  <!-- Strategy call: calendar / meeting style -->
  <div class="rounded-2xl border border-border/60 bg-zinc-50/80 p-5 shadow-sm">
    <div class="flex items-center gap-3 border-b border-border/60 pb-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{stepLabel}</span>
      <div>
        <p class="text-sm font-semibold text-foreground">Strategy call</p>
        <p class="text-xs text-muted-foreground">30 min · Booked</p>
      </div>
    </div>
    <ul class="mt-4 space-y-2">
      {#each ["Current ops", "Biggest gaps", "Next steps"] as item}
        <li class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
          {item}
        </li>
      {/each}
    </ul>
  </div>
{:else if variant === 1}
  <!-- Custom solution: checklist -->
  <div class="rounded-2xl border border-border/60 bg-zinc-50/80 p-5 shadow-sm">
    <div class="flex items-center gap-3 border-b border-border/60 pb-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{stepLabel}</span>
      <p class="text-sm font-semibold text-foreground">Your plan</p>
    </div>
    <ul class="mt-4 space-y-2.5">
      {#each [{ done: true, label: "Voice AI" }, { done: true, label: "Calendar sync" }, { done: false, label: "Website refresh" }] as item}
        <li class="flex items-center gap-2 text-sm">
          <span class="flex h-4 w-4 items-center justify-center rounded border {item.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}">
            {#if item.done}✓{/if}
          </span>
          <span class="{item.done ? 'text-muted-foreground line-through' : 'text-foreground'}">{item.label}</span>
        </li>
      {/each}
    </ul>
  </div>
{:else if variant === 2}
  <!-- Implementation: progress -->
  <div class="rounded-2xl border border-border/60 bg-zinc-50/80 p-5 shadow-sm">
    <div class="flex items-center gap-3 border-b border-border/60 pb-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{stepLabel}</span>
      <p class="text-sm font-semibold text-foreground">Go-live</p>
    </div>
    <div class="mt-4 space-y-3">
      <div class="flex justify-between text-xs">
        <span class="text-muted-foreground">Setup</span>
        <span class="font-medium text-primary">Done</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-border/80">
        <div class="h-full w-3/4 rounded-full bg-primary transition-all" style="width: 75%"></div>
      </div>
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>Integration</span>
        <span>Testing</span>
      </div>
    </div>
  </div>
{:else}
  <!-- Ongoing support: message list -->
  <div class="rounded-2xl border border-border/60 bg-zinc-50/80 p-5 shadow-sm">
    <div class="flex items-center gap-3 border-b border-border/60 pb-3">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">{stepLabel}</span>
      <p class="text-sm font-semibold text-foreground">Support</p>
    </div>
    <ul class="mt-4 space-y-2">
      {#each [{ msg: "System running smoothly", time: "Today" }, { msg: "Report ready", time: "Yesterday" }] as item}
        <li class="rounded-lg border border-border/60 bg-white px-3 py-2 text-sm">
          <p class="font-medium text-foreground">{item.msg}</p>
          <p class="text-xs text-muted-foreground">{item.time}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}
