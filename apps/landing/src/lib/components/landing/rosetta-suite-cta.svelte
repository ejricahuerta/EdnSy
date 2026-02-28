<script lang="ts">
  /**
   * Mini CTA for Rosetta Suite: Chart Rosetta and Report Rosetta.
   * Use on pages where offering the suite as a light-touch CTA makes sense.
   */
  let {
    variant = "inline",
    class: className = "",
  }: { variant?: "inline" | "buttons"; class?: string } = $props();

  const chartUrl = "https://chartrosetta.com";
  const reportUrl = "https://reportrosetta.com";
</script>

{#if variant === "inline"}
  <p class={["text-sm text-muted-foreground", className].filter(Boolean).join(" ")}>
    <span class="font-medium text-foreground">Rosetta Suite:</span>
    <a href={chartUrl} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-heading">Chart</a>
    <span class="text-muted-foreground" aria-hidden="true"> · </span>
    <a href={reportUrl} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-heading">Report</a>
  </p>
{:else}
  <div class={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}>
    <a
      href={chartUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center text-sm font-medium text-primary hover:underline"
    >
      Chart Rosetta
    </a>
    <span class="text-muted-foreground" aria-hidden="true">·</span>
    <a
      href={reportUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center text-sm font-medium text-primary hover:underline"
    >
      Report Rosetta
    </a>
  </div>
{/if}
