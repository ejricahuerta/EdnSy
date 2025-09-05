<script>
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";
  import { ArrowRight, Play } from "lucide-svelte";

  export let title = "Get Your Time Back";
  export let subtitle = "Stop working nights and weekends";
  export let description = "We help Toronto business owners reclaim 15-20 hours weekly through smart automation and AI solutions.";
</script>

<!-- Hero Section with High-Quality Visual -->
<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
  <!-- Hero Background Image -->
  <div class="absolute inset-0">
    <div class="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
    <!-- Overlay for text readability -->
    <div class="absolute inset-0 bg-black/30"></div>
  </div>
  
  <div class="relative z-10 w-full max-w-6xl mx-auto px-6 text-center">
    <!-- Badge -->
    <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
      <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
      Toronto Business Solutions
    </div>
    
    <!-- Main Heading -->
    <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
      {title}
    </h1>
    
    <!-- Subtitle -->
    <p class="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
      {subtitle}
    </p>
    
    <!-- Description -->
    <p class="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
      {description}
    </p>
    
    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <Button
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
        size="lg"
        class="px-8 py-4 text-lg font-semibold bg-white text-slate-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        Get Started
        <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
      
      <Button
        onclick={() => goto("/demos")}
        variant="outline"
        size="lg"
        class="px-8 py-4 text-lg font-semibold border-white/30 text-white hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-200"
      >
        <Play class="w-5 h-5 mr-2" />
        Watch Demo
      </Button>
    </div>
    
    <!-- Trust Indicators -->
    <div class="flex items-center justify-center gap-8 text-white/70 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white/50 rounded-full"></div>
        <span>Free Consultation</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white/50 rounded-full"></div>
        <span>Local Toronto Team</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white/50 rounded-full"></div>
        <span>Proven Results</span>
      </div>
    </div>
  </div>
</section>
