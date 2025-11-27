<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";

  export let icon;
  export let title;
  export let description;
  export let features = [];
  export let primaryCta = "See It In Action";
  export let secondaryCta = "Learn More";
</script>

<div class="group">
  <div class="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-slate-300">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
        <svelte:component this={icon} class="w-6 h-6 text-slate-600" />
      </div>
      <h3 class="font-display text-2xl font-semibold text-slate-900">{title}</h3>
    </div>
    
    <!-- Description -->
    <p class="text-slate-600 text-lg leading-relaxed mb-8">
      {description}
    </p>

    <!-- Features grid -->
    {#if features.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {#each features as feature, index}
          <div class="flex items-start gap-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 class="font-semibold text-slate-900 text-sm mb-1">{feature.title}</h4>
              <p class="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- CTA buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button
        onclick={() => goto("/demos")}
        size="sm"
        class="flex-1"
      >
        {primaryCta}
      </Button>
      
      <Button
        onclick={() => goto("/demos")}
        variant="outline"
        size="sm"
        class="flex-1"
      >
        {secondaryCta}
      </Button>
    </div>
  </div>
</div>
