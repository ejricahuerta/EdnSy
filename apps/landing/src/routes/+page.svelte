<script>
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import {
    ArrowRight,
    Calendar,
    Phone,
    Zap,
    Globe,
    MessageSquare,
    CheckCircle,
    Star,
    Play,
    Clock,
    Building2,
    Workflow,
    Smartphone,
    Headphones,
    BarChart3,
    Shield,
    Users,
    Target,
    Sparkles
  } from "lucide-svelte";
</script>

<style>
  .hero-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgb(15, 23, 42);
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.4) 2px, transparent 2px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.4) 2px, transparent 2px),
      linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
    background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px, 10px 10px, 10px 10px;
    background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0;
    animation: gridMove 25s linear infinite;
  }

  @keyframes gridMove {
    0% { background-position: 0 0, 0 0, 0 0, 0 0, 0 0, 0 0; }
    100% { background-position: 80px 80px, 80px 80px, 20px 20px, 20px 20px, 10px 10px, 10px 10px; }
  }

  .hero-container::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background: radial-gradient(
      ellipse at center,
      rgba(59, 130, 246, 0.1) 0%,
      rgba(15, 23, 42, 0.8) 40%,
      rgba(15, 23, 42, 1) 70%
    );
    pointer-events: none;
  }

  .hero-container::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(15, 23, 42, 0.7) 30%,
      rgba(15, 23, 42, 0.8) 70%,
      rgba(15, 23, 42, 0.9) 100%
    );
    pointer-events: none;
  }

  /* Grid pattern for other sections */
  .section-grid {
    position: relative;
    background-image: 
      linear-gradient(rgba(15, 23, 42, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(15, 23, 42, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    background-position: 0 0, 0 0;
  }

  .section-grid::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 20%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.8) 80%,
      transparent 100%
    );
    pointer-events: none;
  }

  /* Variant for slate-50 background */
  .section-grid-slate::before {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(248, 250, 252, 0.8) 20%,
      rgba(248, 250, 252, 1) 50%,
      rgba(248, 250, 252, 0.8) 80%,
      transparent 100%
    );
  }

  /* Variant for dark background */
  .section-grid-dark::before {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(15, 23, 42, 0.8) 20%,
      rgba(15, 23, 42, 1) 50%,
      rgba(15, 23, 42, 0.8) 80%,
      transparent 100%
    );
  }


  /* Ensure content is always on top */
  .section-grid > * {
    position: relative;
    z-index: 2;
  }
</style>

<svelte:head>
  <title>Ed & Sy Digital Agency - Time-Saving Solutions for Toronto Businesses</title>
  <meta name="description" content="Toronto digital agency helping business owners reclaim 15-20 hours weekly through AI automation, Voice AI, <span class='text-blue-600'>&</span> conversion-focused websites." />
</svelte:head>

<!-- Hero Section -->
<section class="relative h-screen bg-slate-900 overflow-hidden flex items-center justify-center">
  <!-- Animated blob background -->
  <div class="hero-container absolute inset-0"></div>
  
  <div class="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-20">
    <!-- Badge -->
    <div class="text-center lg:text-left mb-8">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
        Business Solutions
      </div>
                  </div>
                  
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Left side - Hero text -->
        <div class="text-center lg:text-left">
        <!-- Main headline -->
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          We give you<br/>
          time
        </h1>
        
        <!-- Subheadline -->
        <p class="text-xl md:text-2xl  text-slate-300 mb-10 leading-relaxed">
          Stop working nights <span class="text-blue-600">&</span> weekends. We help Toronto business owners reclaim their time through proven automation, Voice AI, <span class="text-blue-600">&</span> high-converting websites.
        </p>
        
        <!-- CTA Button -->
        <div class="flex justify-center lg:justify-start">
                              <Button
            size="lg"
            class="bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200 px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({layout: "month_view"})}
          >
            Get started today
          </Button>
                  </div>
                </div>

      <!-- Right side - KPIs -->
      <div class="space-y-8">
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
          <div class="text-sm text-slate-400">Calls Answered</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">15-20</div>
          <div class="text-sm text-slate-400">Hours Saved Weekly</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">3x</div>
          <div class="text-sm text-slate-400">More Leads</div>
        </div>
      </div>
    </div>

    <!-- Trust indicators -->
    <div class="mt-12 text-center lg:text-left">
      <div class="flex flex-wrap items-center gap-6 text-sm text-slate-400">
        <span>Free Consultation</span>
        <span class="hidden sm:inline">•</span>
        <span>Local Team</span>
        <span class="hidden sm:inline">•</span>
        <span>Proven Results</span>
      </div>
    </div>
                        </div>
</section>

<!-- What's So Special Section -->
<section class="py-24 bg-white section-grid">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <!-- Section Header -->
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        About us
                      </div>
      
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        What's so special<br/>
        about this?
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Don't settle for working nights <span class="text-blue-600">&</span> weekends when your business could run itself – systems so good your competitors wonder how you do it.
      </p>
      
      <Button class="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        Learn more
      </Button>
                  </div>
    
    <!-- Two Column Feature Layout -->
    <div class="grid lg:grid-cols-2 gap-12 items-start">
      <!-- Feature 01 -->
      <div class="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        <div class="flex items-start gap-6">
          <div class="flex-shrink-0">
            <div class="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Clock class="w-8 h-8 text-white" />
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">01</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-slate-900 leading-tight mb-4">
              We don't just build automation—we create business systems that give you your evenings <span class="text-blue-600">&</span> weekends back, running smoothly without you.
            </h3>
            <p class="text-slate-600 leading-relaxed">
              Stop working around the clock. Our AI-powered systems handle the heavy lifting so you can focus on what matters most—growing your business and enjoying your life.
            </p>
          </div>
        </div>
      </div>

      <!-- Feature 02 -->
      <div class="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300">
        <div class="flex items-start gap-6">
          <div class="flex-shrink-0">
            <div class="relative w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center">
              <Building2 class="w-8 h-8 text-white" />
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">02</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-slate-900 leading-tight mb-4">
              With our proven Toronto expertise, you'll discover how local businesses save thousands in labor costs while improving customer experience.
            </h3>
            <p class="text-slate-600 leading-relaxed">
              We understand the unique challenges Toronto businesses face. Our solutions are tailored to local market dynamics, helping you compete and win in the GTA.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Social Proof Section -->
<section class="py-24 bg-slate-50 section-grid section-grid-slate">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Three proven ways to<br/>
        reclaim your time
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Voice AI that never misses a call, workflow automation that runs your business, 
        and high-converting websites that work while you sleep. The three solutions Toronto entrepreneurs trust.
      </p>
    </div>
    
    <!-- Solutions Grid -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- Solution 1 -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="relative mb-6">
          <div class="flex items-center justify-center h-20 w-20 mx-auto bg-slate-100 rounded-2xl">
            <Headphones class="w-10 h-10 text-slate-700" />
          </div>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Voice AI Business Growth</h3>
        <p class="text-slate-600 text-sm mb-6 leading-relaxed">
          Revolutionary phone systems that handle customer calls with trained AI, 
          ensuring every lead is captured <span class="text-blue-600">&</span> nurtured professionally.
        </p>
        <div class="flex justify-end">
          <Button 
            size="sm" 
            class="bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/50 hover:border-slate-600/70"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({layout: "month_view"})}
          >
            Book now
          </Button>
        </div>
      </div>
      
      <!-- Solution 2 -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="relative mb-6">
          <div class="flex items-center justify-center h-20 w-20 mx-auto bg-slate-100 rounded-2xl">
            <Workflow class="w-10 h-10 text-slate-700" />
          </div>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Workflow Freedom Package</h3>
        <p class="text-slate-600 text-sm mb-6 leading-relaxed">
          Complete workflow automation that eliminates repetitive tasks, from invoice 
          processing to customer follow-ups, giving you your life back.
        </p>
        <div class="flex justify-end">
          <Button 
            size="sm" 
            class="bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/50 hover:border-slate-600/70"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({layout: "month_view"})}
          >
            Book now
          </Button>
        </div>
      </div>
      
      <!-- Solution 3 -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="relative mb-6">
          <div class="flex items-center justify-center h-20 w-20 mx-auto bg-slate-100 rounded-2xl">
            <Smartphone class="w-10 h-10 text-slate-700" />
          </div>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">High-Converting Websites</h3>
        <p class="text-slate-600 text-sm mb-6 leading-relaxed">
          Conversion-focused websites that turn visitors into customers while you sleep, 
          with built-in SEO <span class="text-blue-600">&</span> mobile optimization for Toronto businesses.
        </p>
        <div class="flex justify-end">
          <Button 
            size="sm" 
            class="bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-slate-700/50 hover:border-slate-600/70"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({layout: "month_view"})}
          >
            Book now
          </Button>
        </div>
      </div>
    </div>

    <!-- Package Together Notice -->
    <div class="text-center mt-12">
      <p class="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
        <span class="font-semibold text-slate-900">Custom packages available:</span> 
        Mix and match any of these solutions to create a comprehensive automation package tailored to your business needs.
      </p>
    </div>

  </div>
</section>

<!-- Final CTA Section -->
<section class="py-24 bg-slate-900 text-white section-grid section-grid-dark">
  <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
    <h2 class="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
      Reclaim your time, your<br/>
      business transformation awaits!
    </h2>
    
    <Button 
      size="lg" 
      class="bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200 px-8 py-4 text-lg rounded-xl font-semibold mt-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
      data-cal-config={JSON.stringify({layout: "month_view"})}
    >
      Get started today
    </Button>
  </div>
</section>