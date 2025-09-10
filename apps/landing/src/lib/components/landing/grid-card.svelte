<script>
  export let icon;
  export let title;
  export let items = [];
</script>

<div class="group">
  <div class="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-slate-300">
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
        <svelte:component this={icon} class="w-6 h-6 text-slate-600" />
      </div>
      <h3 class="font-display text-2xl font-semibold text-slate-900">{title}</h3>
    </div>
    
    <div class="space-y-4">
      {#each items as item, index}
        <div class="flex items-start gap-3">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <p class="text-slate-600 text-lg leading-relaxed">{item}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
