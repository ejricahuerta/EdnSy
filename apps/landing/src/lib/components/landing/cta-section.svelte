<script>
  import { Button } from "$lib/components/ui/button";
  import { Zap, ArrowRight } from "lucide-svelte";
  import { goto } from "$app/navigation";
</script>

<section class="relative py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
  <!-- Background elements -->
  <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
  
  <div class="relative z-10 max-w-6xl mx-auto px-8 sm:px-16 text-center">
    <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
      <div class="w-2 h-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"></div>
      Get Started
    </div>
    
    <h2 class="font-display text-4xl sm:text-6xl font-bold tracking-tight text-balance text-white mb-8">
      Ready to transform your home services business?
    </h2>
    
    <p class="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
      Join home services businesses who've already automated their operations, eliminated scheduling chaos, and 
      gained back 15+ hours per week with our n8n-powered AI solutions.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
      <Button
        onclick={() => goto("/demos")}
        size="lg"
        class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
      >
        <Zap class="w-5 h-5 mr-2" />
        <span class="relative z-10">Start Your AI Transformation</span>
        <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Button>
      
      <Button
        onclick={() => goto("/demos")}
        variant="outline"
        size="lg"
        class="px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white font-semibold text-xl rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
      >
        Try Our Demos
        <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
    </div>
    
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
      <p class="text-white/80 text-sm">
        Book a free 30-min consultation. No obligation, just impact.
      </p>
    </div>
  </div>
</section>
