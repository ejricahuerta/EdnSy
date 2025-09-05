<script>
  export let title = "Section Title";
  export let subtitle = "Section Subtitle";
  export let description = "Section description goes here";
</script>

<div class="text-center mb-20">
  <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
    {subtitle}
  </div>
  
  <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
    {title}
  </h2>
  
  <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
    {description}
  </p>
</div>
