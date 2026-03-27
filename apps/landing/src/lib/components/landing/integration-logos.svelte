<script lang="ts">
  import type { SimpleIcon } from "simple-icons";

  type Integration = {
    name: string;
    icon: SimpleIcon;
  };

  let { items, iconOnly = false }: { items: readonly Integration[]; iconOnly?: boolean } = $props();
</script>

{#if iconOnly}
  <div class="flex flex-wrap justify-center gap-4 px-2 sm:gap-6">
    {#each items as item (item.name + item.icon.path)}
      <div class="flex items-center justify-center">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center"
          style={`background-color: #${item.icon.hex}14; color: #${item.icon.hex};`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current">
            <path d={item.icon.path} />
          </svg>
        </span>
      </div>
    {/each}
  </div>
{:else}
  <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
    {#each items as item}
      <div class="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={`background-color: #${item.icon.hex}14; color: #${item.icon.hex};`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current">
            <path d={item.icon.path} />
          </svg>
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-foreground">{item.name}</p>
          <p class="text-xs text-muted-foreground">Integration ready</p>
        </div>
      </div>
    {/each}
  </div>
{/if}
