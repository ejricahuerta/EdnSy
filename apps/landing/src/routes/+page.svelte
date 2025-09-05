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
    Play
  } from "lucide-svelte";
</script>

<style>
  .hero-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgb(15, 23, 42);
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    background-position: 0 0, 0 0;
  }

  .hero-container::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      90deg,
      rgba(15, 23, 42, 0.8) 0%,
      rgba(15, 23, 42, 1) 20%,
      rgba(15, 23, 42, 1) 50%,
      rgba(15, 23, 42, 1) 80%,
      rgba(15, 23, 42, 0.8) 100%
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
  
  <div class="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-10">
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
          Stop working nights <span class="text-blue-600">&</span> weekends. We help business owners save 15-20 hours weekly through AI automation that actually works.
        </p>
        
        <!-- CTA Button -->
        <div class="flex justify-center lg:justify-start">
                              <Button
            size="lg"
            class="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({layout: "month_view"})}
          >
            Get started today
          </Button>
                  </div>
                </div>

      <!-- Right side - KPIs -->
      <div class="grid grid-cols-2 gap-8">
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">15-20</div>
          <div class="text-sm text-slate-400">Hours Saved Weekly</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
          <div class="text-sm text-slate-400">Client Satisfaction</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
          <div class="text-sm text-slate-400">Businesses Helped</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
          <div class="text-sm text-slate-400">System Monitoring</div>
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
      
      <Button class="mt-8 bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-xl">
        Learn more
      </Button>
                  </div>
    
    <!-- Two Column Feature Layout -->
    <div class="grid lg:grid-cols-2 gap-16 items-start">
      <!-- Feature 01 -->
      <div class="space-y-6">
        <div class="relative mb-8">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center" 
            alt="Weekend getaway representing work-life balance" 
            class="w-full h-80 object-cover rounded-2xl"
          />
          <div class="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold text-slate-900">
            01
                </div>
              </div>
        
        <h3 class="text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed">
          We don't just build automation—we create business systems that give you your evenings <span class="text-blue-600">&</span> weekends back, running smoothly without you.
        </h3>
            </div>

      <!-- Feature 02 -->
      <div class="space-y-6">
        <div class="relative mb-8">
          <img 
            src="https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop&crop=center" 
            alt="Toronto business district skyline" 
            class="w-full h-80 object-cover rounded-2xl"
          />
          <div class="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-bold text-slate-900">
            02
          </div>
        </div>
        
        <h3 class="text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed">
          With our proven Toronto expertise, you'll discover how local businesses save thousands in labor costs while improving customer experience.
        </h3>
      </div>
    </div>
  </div>
</section>

<!-- Social Proof Section -->
<section class="py-24 bg-slate-50 section-grid section-grid-slate">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Top solutions to spark your<br/>
        business transformation
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Experience the winning difference of work-life balance combined with sustainable 
        growth. Our solutions are designed for busy entrepreneurs ready to take their business to new heights.
      </p>
    </div>
    
    <!-- Solutions Grid -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- Solution 1 -->
      <div class="group cursor-pointer">
        <div class="relative mb-6 overflow-hidden rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&h=400&fit=crop&crop=center" 
            alt="Voice AI phone call system" 
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Voice AI Business Growth</h3>
        <p class="text-slate-600 text-sm mb-4">
          Revolutionary phone systems that handle customer calls with trained AI, 
          ensuring every lead is captured <span class="text-blue-600">&</span> nurtured professionally.
        </p>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-slate-500">From $197</span>
          <Button size="sm" class="bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
            Book now
          </Button>
        </div>
      </div>
      
      <!-- Solution 2 -->
      <div class="group cursor-pointer">
        <div class="relative mb-6 overflow-hidden rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1646617747563-4f080bddf282?w=500&h=400&fit=crop&crop=center" 
            alt="Workflow automation flowchart" 
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Workflow Freedom Package</h3>
        <p class="text-slate-600 text-sm mb-4">
          Complete workflow automation that eliminates repetitive tasks, from invoice 
          processing to customer follow-ups, giving you your life back.
        </p>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-slate-500">From $297</span>
          <Button size="sm" class="bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
            Book now
          </Button>
    </div>
  </div>
      
      <!-- Solution 3 -->
      <div class="group cursor-pointer">
        <div class="relative mb-6 overflow-hidden rounded-2xl">
          <img 
            src="https://images.unsplash.com/photo-1518365050014-70fe7232897f?w=500&h=400&fit=crop&crop=center" 
            alt="High-converting website design" 
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">High-Converting Websites</h3>
        <p class="text-slate-600 text-sm mb-4">
          Conversion-focused websites that turn visitors into customers while you sleep, 
          with built-in SEO <span class="text-blue-600">&</span> mobile optimization for Toronto businesses.
        </p>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-slate-500">From $5,000</span>
          <Button size="sm" class="bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
            Book now
          </Button>
        </div>
      </div>
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
      class="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 text-lg rounded-xl font-semibold mt-8"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
      data-cal-config={JSON.stringify({layout: "month_view"})}
    >
      Get started today
    </Button>
  </div>
</section>