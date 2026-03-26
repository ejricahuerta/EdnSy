<script lang="ts">
  import type { SimpleIcon } from "simple-icons";

  type Integration = {
    name: string;
    icon: SimpleIcon;
  };

  let { items, iconOnly = false }: { items: readonly Integration[]; iconOnly?: boolean } = $props();

  // For a seamless marquee loop we render the list multiple times and animate the track by
  // exactly one "copy" width. Rendering more than 2 copies ensures we never expose empty
  // gaps on wide viewports.
  const MARQUEE_COPIES = 6;
  const marqueeItems = Array.from({ length: MARQUEE_COPIES }, () => items).flat();
</script>

{#if iconOnly}
  <div class="w-full overflow-hidden integration-marquee-viewport">
    <div class="integration-marquee-track" style={`--integration-marquee-copies: ${MARQUEE_COPIES};`}>
      {#each marqueeItems as item, index (item.name + item.icon.hex + item.icon.path + "-" + index)}
        <div class="flex items-center justify-center integration-marquee-item">
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

<style>
  .integration-marquee-viewport {
    /* Fade logos in/out at the section edges. */
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  .integration-marquee-item {
    flex: 0 0 auto;
  }

  .integration-marquee-track {
    display: flex;
    width: max-content;
    align-items: center;
    /* More whitespace between logos, so the row feels filled. */
    gap: clamp(18px, 4vw, 36px);
    will-change: transform;
    animation: integration-marquee 24s linear infinite;
  }

  /* Move left across the full track (logos move right-to-left), repeating seamlessly. */
  @keyframes integration-marquee {
    from {
      transform: translate3d(0%, 0, 0);
    }
    to {
      transform: translate3d(calc(-100% / var(--integration-marquee-copies)), 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .integration-marquee-track {
      animation: none;
    }
  }
</style>
