<script lang="ts">
  /**
   * Wrapper that adds a brush-trail effect following the cursor on hover.
   * Uses light brush over dark elements (buttons, dark text) so the trail stays visible.
   */
  let { class: className = '', children } = $props();

  const TRAIL_LENGTH = 22;
  const MIN_DISTANCE = 4;

  let wrapper = $state<HTMLDivElement | null>(null);
  let trail = $state<{ x: number; y: number; light: boolean }[]>([]);
  let isHovered = $state(false);
  let lastX = $state(-1);
  let lastY = $state(-1);

  function dist(x1: number, y1: number, x2: number, y2: number) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  /** Relative luminance 0–1; < 0.4 is dark. */
  function getLuminance(cssColor: string): number {
    if (!cssColor || cssColor === 'rgba(0, 0, 0, 0)' || cssColor === 'transparent') return 1;
    const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (m) {
      const [_, r, g, b] = m.map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    const hex = cssColor.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hex) {
      const r = parseInt(hex[1], 16) / 255;
      const g = parseInt(hex[2], 16) / 255;
      const b = parseInt(hex[3], 16) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return 0.5;
  }

  /** True when the element under the cursor is dark (button, dark bg, or dark text). */
  function isElementDark(clientX: number, clientY: number): boolean {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return false;
    const interactive = el.closest('button, a[href], [role="button"]') || el;
    const style = window.getComputedStyle(interactive);
    const bgLuminance = getLuminance(style.backgroundColor);
    const colorLuminance = getLuminance(style.color);
    if (bgLuminance < 0.4) return true;
    if (colorLuminance < 0.35) return true;
    return false;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isHovered = true;

    if (trail.length === 0 || dist(lastX, lastY, x, y) >= MIN_DISTANCE) {
      lastX = x;
      lastY = y;
      /* Light brush on light areas (card), purple brush on dark areas (button/dark text) */
      const light = !isElementDark(e.clientX, e.clientY);
      trail = [{ x, y, light }, ...trail].slice(0, TRAIL_LENGTH);
    }
  }

  function handleMouseLeave() {
    isHovered = false;
    trail = [];
    lastX = -1;
    lastY = -1;
  }
</script>

<div
  bind:this={wrapper}
  class="brush-card-wrapper {className}"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  role="presentation"
>
  <div class="brush-card-trail" class:visible={isHovered} aria-hidden="true">
    {#each trail as point, i}
      <div
        class="brush-trail-blob"
        class:light={point.light}
        style="--brush-x: {point.x}px; --brush-y: {point.y}px; --blob-opacity: {1 - (i / trail.length) * 0.9}; --blob-scale: {1 - (i / trail.length) * 0.25};"
      ></div>
    {/each}
  </div>
  {@render children?.()}
</div>

<style>
  .brush-card-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl, 0.75rem);
  }

  .brush-card-trail {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .brush-card-trail.visible {
    opacity: 1;
  }

  .brush-trail-blob {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    /* Default: primary purple on light card */
    background: radial-gradient(
      circle calc(72px * var(--blob-scale, 1)) at var(--brush-x) var(--brush-y),
      rgba(58, 0, 255, calc(0.18 * var(--blob-opacity, 1))) 0%,
      rgba(58, 0, 255, calc(0.06 * var(--blob-opacity, 1))) 35%,
      transparent 50%
    );
    opacity: var(--blob-opacity, 1);
  }

  /* Over dark areas (button, dark text): light brush so it stays visible */
  .brush-trail-blob.light {
    background: radial-gradient(
      circle calc(72px * var(--blob-scale, 1)) at var(--brush-x) var(--brush-y),
      rgba(255, 255, 255, calc(0.35 * var(--blob-opacity, 1))) 0%,
      rgba(255, 255, 255, calc(0.12 * var(--blob-opacity, 1))) 35%,
      transparent 50%
    );
  }
</style>
