<script>
  export let logos = [];
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
  {#each logos as logo}
    <div class="group">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
        <div class="relative bg-white border border-slate-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
          <img
            src={logo.logo}
            alt={logo.name}
            class="h-12 w-auto opacity-60 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  {/each}
</div>
