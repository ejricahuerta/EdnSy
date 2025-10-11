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
    Workflow,
    Smartphone,
    Headphones,
    BarChart3,
    Shield,
    Users,
    Target,
    Sparkles,
    Building2,
    ChevronDown,
    ChevronUp,
    Heart,
    Briefcase,
    ShoppingCart,
    Home,
    Factory,
    Utensils
  } from "lucide-svelte";

  // FAQ state management
  let openFAQs = $state({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  });

  function toggleFAQ(id) {
    openFAQs[id] = !openFAQs[id];
  }
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
  <title>Ed & Sy - AI Automation for Toronto Businesses | Voice AI & Workflow Solutions</title>
  <meta name="description" content="Stop working nights & weekends. Ed & Sy help Toronto business owners reclaim 15-20 hours weekly through Voice AI, workflow automation, and high-converting websites. Trusted across Canada." />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com/" />
  <meta property="og:title" content="Ed & Sy - AI Automation for Toronto Businesses" />
  <meta property="og:description" content="Stop working nights & weekends. Reclaim 15-20 hours weekly through Voice AI, workflow automation, and high-converting websites." />
  <meta property="og:image" content="https://ednsy.com/logo.png" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://ednsy.com/" />
  <meta property="twitter:title" content="Ed & Sy - AI Automation for Toronto Businesses" />
  <meta property="twitter:description" content="Stop working nights & weekends. Reclaim 15-20 hours weekly through Voice AI, workflow automation, and high-converting websites." />
  <meta property="twitter:image" content="https://ednsy.com/logo.png" />
  
  <!-- Additional SEO -->
  <meta name="keywords" content="Toronto digital agency, AI automation, Voice AI, workflow automation, business automation, Toronto business solutions, AI assistant, lead generation, high-converting websites, business time management" />
  <meta name="author" content="Ed & Sy Digital Agency" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ed & Sy",
    "url": "https://ednsy.com",
    "logo": "https://ednsy.com/logo.png",
    "description": "Toronto digital agency helping business owners reclaim time through AI automation, Voice AI, and high-converting websites.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toronto",
      "addressCountry": "CA"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "Canada"
    },
    "services": [
      "Voice AI Business Growth",
      "Workflow Freedom Package", 
      "High-Converting Websites"
    ],
    "industries": [
      "Healthcare",
      "Professional Services", 
      "Retail & E-commerce",
      "Real Estate",
      "Manufacturing",
      "Food & Hospitality"
    ]
  }
  </script>
</svelte:head>

<!-- Hero Section -->
<section class="relative min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center pt-20 md:pt-0 pb-16 md:pb-0">
  <!-- Animated blob background -->
  <div class="hero-container absolute inset-0"></div>
  
  <div class="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-20">
    <!-- Badge -->
    <div class="text-center lg:text-left mb-6 md:mb-8">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
        Business Solutions
      </div>
    </div>
                  
    <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <!-- Left side - Hero text -->
      <div class="text-center lg:text-left">
        <!-- Main headline -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 md:mb-6">
          We give you<br/>
          time
        </h1>
        
        <!-- Subheadline -->
        <p class="text-lg md:text-xl lg:text-2xl text-slate-300 mb-4 md:mb-6 leading-relaxed">
          Stop working nights <span class="text-blue-600">&</span> weekends. We help Toronto business owners reclaim their time through automation, Voice AI, <span class="text-blue-600">&</span> high-converting websites.
        </p>
        
        <!-- Trust indicator -->
        <p class="text-base md:text-lg text-slate-400 mb-6 md:mb-8 leading-relaxed">
          Trusted by businesses across Canada.
        </p>
        
        <!-- CTA Button -->
        <div class="flex justify-center lg:justify-start">
                 <Button
                   size="lg"
                   class="bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200 px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
                   data-cal-link="edmel-ednsy/enable-ai"
                   data-cal-namespace="enable-ai"
                   data-cal-config={JSON.stringify({layout: "month_view"})}
                 >
                   Reclaim Your Time
                 </Button>
        </div>
      </div>

      <!-- Right side - KPIs -->
            <div class="space-y-6 md:space-y-8 mt-8 lg:mt-0">
              <div class="text-center">
                <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
                <div class="text-sm md:text-base text-slate-400">AI Assistant</div>
              </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">15-20</div>
          <div class="text-sm md:text-base text-slate-400">Hours Saved Weekly</div>
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

<!-- Industries Section -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Industries We Serve
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        From healthcare to retail, we help businesses across Canada automate their operations and connect better with their customers.
      </p>
    </div>
    
    <!-- Industries Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Healthcare -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Heart class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <Heart class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Healthcare</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Patient scheduling, appointment reminders, and automated follow-ups that improve patient care while reducing administrative burden.
        </p>
      </div>

      <!-- Professional Services -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Briefcase class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <Briefcase class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Professional Services</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Law firms, accounting practices, and consulting agencies benefit from automated client intake and case management systems.
        </p>
      </div>

      <!-- Retail & E-commerce -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <ShoppingCart class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <ShoppingCart class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Retail & E-commerce</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Customer service automation, inventory management, and order processing that scales with your business growth.
        </p>
      </div>

      <!-- Real Estate -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Home class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <Home class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Real Estate</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Lead qualification, property inquiries, and client communication automation that helps agents focus on closing deals.
        </p>
      </div>

      <!-- Manufacturing -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Factory class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <Factory class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Manufacturing</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Supply chain automation, quality control processes, and customer support systems that improve operational efficiency.
        </p>
      </div>

      <!-- Food & Hospitality -->
      <div class="group bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center gap-4 mb-4">
          <div class="hidden md:flex w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
            <Utensils class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex md:hidden">
            <Utensils class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">Food & Hospitality</h3>
        </div>
        <p class="text-slate-600 leading-relaxed">
          Reservation management, customer feedback collection, and order processing automation that enhances guest experience.
        </p>
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
    
    <!-- Solutions Grid - Mobile Optimized -->
    <div class="space-y-8 md:space-y-16 mb-16">
      <!-- Solution 1: Voice AI -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 border border-slate-200 hover:border-blue-300 hover:shadow-xl md:hover:shadow-2xl transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <!-- Content -->
          <div class="order-2 lg:order-1">
            <div class="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div class="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 bg-blue-50 rounded-xl md:rounded-2xl">
                <Headphones class="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-slate-900">Voice AI Business Growth</h3>
            </div>
            
            <p class="text-base md:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed">
              Revolutionary phone systems that handle customer calls with trained AI, 
              ensuring every lead is captured <span class="text-blue-600">&</span> nurtured professionally.
            </p>

            <!-- Features List -->
            <div class="mb-6 md:mb-8">
              <h4 class="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Key Features:</h4>
              <ul class="space-y-2 md:space-y-3 text-sm md:text-base text-slate-600">
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>24/7 call handling with natural conversation</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Lead qualification and appointment booking</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Customer support and FAQ handling</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Integration with your CRM and calendar</span>
                </li>
              </ul>
            </div>

            <!-- Benefits -->
            <div class="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-xl md:rounded-2xl">
              <h4 class="text-base md:text-lg font-semibold text-blue-900 mb-2 md:mb-3">Results You'll See:</h4>
              <p class="text-sm md:text-base text-blue-800">
                Never miss another lead. Our Voice AI captures 100% of calls, books appointments automatically, and provides 24/7 customer support.
              </p>
            </div>
            
            <Button 
              size="lg" 
              class="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg md:rounded-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-blue-500/50 hover:border-blue-400/70"
              data-cal-link="edmel-ednsy/enable-ai"
              data-cal-namespace="enable-ai"
              data-cal-config={JSON.stringify({layout: "month_view"})}
            >
              Get Voice AI
            </Button>
          </div>

          <!-- Visual Element -->
          <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl md:rounded-3xl flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Headphones class="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <p class="text-blue-800 font-semibold text-sm md:text-base">24/7 AI Assistant</p>
                <p class="text-blue-600 text-xs md:text-sm">Never miss a call</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Solution 2: Workflow Automation -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 border border-slate-200 hover:border-blue-300 hover:shadow-xl md:hover:shadow-2xl transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <!-- Visual Element -->
          <div class="order-1 lg:order-1 flex justify-center lg:justify-start">
            <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl md:rounded-3xl flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Workflow class="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <p class="text-blue-800 font-semibold text-sm md:text-base">Automated Workflows</p>
                <p class="text-blue-600 text-xs md:text-sm">Save 15-20 hours/week</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="order-2 lg:order-2">
            <div class="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div class="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 bg-blue-50 rounded-xl md:rounded-2xl">
                <Workflow class="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-slate-900">Workflow Freedom Package</h3>
            </div>
            
            <p class="text-base md:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed">
              Complete workflow automation that eliminates repetitive tasks, from invoice 
              processing to customer follow-ups, giving you your life back.
            </p>

            <!-- Features List -->
            <div class="mb-6 md:mb-8">
              <h4 class="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">What We Automate:</h4>
              <ul class="space-y-2 md:space-y-3 text-sm md:text-base text-slate-600">
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Invoice processing and payment reminders</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Customer onboarding and follow-ups</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Email marketing and lead nurturing</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Data entry and report generation</span>
                </li>
              </ul>
            </div>

            <!-- Benefits -->
            <div class="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-xl md:rounded-2xl">
              <h4 class="text-base md:text-lg font-semibold text-blue-900 mb-2 md:mb-3">Time Savings:</h4>
              <p class="text-sm md:text-base text-blue-800">
                Reclaim 15-20 hours per week by automating repetitive tasks. Focus on growing your business instead of managing it.
              </p>
            </div>
            
            <Button 
              size="lg" 
              class="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg md:rounded-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-blue-500/50 hover:border-blue-400/70"
              data-cal-link="edmel-ednsy/enable-ai"
              data-cal-namespace="enable-ai"
              data-cal-config={JSON.stringify({layout: "month_view"})}
            >
              Automate Now
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Solution 3: High-Converting Websites -->
      <div 
        class="group cursor-pointer bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 border border-slate-200 hover:border-blue-300 hover:shadow-xl md:hover:shadow-2xl transition-all duration-300"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <!-- Content -->
          <div class="order-2 lg:order-1">
            <div class="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div class="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 bg-blue-50 rounded-xl md:rounded-2xl">
                <Smartphone class="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-slate-900">High-Converting Websites</h3>
            </div>
            
            <p class="text-base md:text-lg text-slate-600 mb-6 md:mb-8 leading-relaxed">
              Conversion-focused websites that turn visitors into customers while you sleep, 
              with built-in SEO <span class="text-blue-600">&</span> mobile optimization for Toronto businesses.
            </p>

            <!-- Features List -->
            <div class="mb-6 md:mb-8">
              <h4 class="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Website Features:</h4>
              <ul class="space-y-2 md:space-y-3 text-sm md:text-base text-slate-600">
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Mobile-first responsive design</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>SEO optimized for local Toronto searches</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Fast loading speeds and performance</span>
                </li>
                <li class="flex items-start gap-2 md:gap-3">
                  <CheckCircle class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Contact forms and lead capture systems</span>
                </li>
              </ul>
            </div>

            <!-- Benefits -->
            <div class="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-xl md:rounded-2xl">
              <h4 class="text-base md:text-lg font-semibold text-blue-900 mb-2 md:mb-3">Conversion Focus:</h4>
              <p class="text-sm md:text-base text-blue-800">
                Every element is designed to convert visitors into customers. From compelling copy to strategic placement of contact forms.
              </p>
            </div>
            
            <Button 
              size="lg" 
              class="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg md:rounded-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-blue-500/50 hover:border-blue-400/70"
              data-cal-link="edmel-ednsy/enable-ai"
              data-cal-namespace="enable-ai"
              data-cal-config={JSON.stringify({layout: "month_view"})}
            >
              Build Website
            </Button>
          </div>

          <!-- Visual Element -->
          <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl md:rounded-3xl flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Smartphone class="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
                <p class="text-blue-800 font-semibold text-sm md:text-base">High-Converting Design</p>
                <p class="text-blue-600 text-xs md:text-sm">Turn visitors into customers</p>
              </div>
            </div>
          </div>
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

<!-- FAQ Section -->
<section class="py-24 bg-white">
  <div class="max-w-4xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Frequently Asked Questions
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Get answers to common questions about our automation solutions and how we can help your business.
      </p>
    </div>
    
    <!-- FAQ Items -->
    <div class="space-y-6">
      <!-- FAQ 1 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(1)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            How long does it take to see results from automation?
          </h3>
          {#if openFAQs[1]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[1]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              Most clients see immediate improvements within the first week, with full system optimization typically achieved within 30-60 days. We provide ongoing support to ensure your automation continues to deliver value.
            </p>
          </div>
        {/if}
      </div>

      <!-- FAQ 2 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(2)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            Do I need technical knowledge to use your solutions?
          </h3>
          {#if openFAQs[2]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[2]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              Not at all! Our solutions are designed to be user-friendly and intuitive. We handle all the technical setup and provide training to ensure you and your team can easily manage and monitor your automation systems.
            </p>
          </div>
        {/if}
      </div>

      <!-- FAQ 3 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(3)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            What's included in the free consultation?
          </h3>
          {#if openFAQs[3]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[3]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              Our free 30-minute consultation includes a thorough analysis of your current processes, identification of automation opportunities, and a customized roadmap showing exactly how we can help you save time and improve efficiency.
            </p>
          </div>
        {/if}
      </div>

      <!-- FAQ 4 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(4)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            Can automation work for small businesses?
          </h3>
          {#if openFAQs[4]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[4]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              Absolutely! Automation is especially valuable for small businesses as it allows you to compete with larger companies by operating more efficiently. Our solutions are scalable and designed to grow with your business.
            </p>
          </div>
        {/if}
      </div>

      <!-- FAQ 5 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(5)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            What kind of support do you provide after implementation?
          </h3>
          {#if openFAQs[5]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[5]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              We provide comprehensive ongoing support including system monitoring, regular check-ins, performance optimization, and training for new team members. Our goal is to ensure your automation continues to deliver maximum value.
            </p>
          </div>
        {/if}
      </div>

      <!-- FAQ 6 -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <button 
          class="w-full p-8 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200"
          onclick={() => toggleFAQ(6)}
        >
          <h3 class="text-xl font-bold text-slate-900">
            How do you ensure data security and privacy?
          </h3>
          {#if openFAQs[6]}
            <ChevronUp class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {:else}
            <ChevronDown class="w-6 h-6 text-slate-600 flex-shrink-0 ml-4" />
          {/if}
        </button>
        {#if openFAQs[6]}
          <div class="px-8 pb-8">
            <p class="text-slate-600 leading-relaxed">
              Data security is our top priority. We use enterprise-grade security measures, comply with Canadian privacy laws, and ensure all data is encrypted and stored securely. We're happy to discuss our security protocols in detail during your consultation.
            </p>
          </div>
        {/if}
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
      class="bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-slate-200 px-8 py-4 text-lg rounded-xl font-semibold mt-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 hover:border-white/40"
      data-cal-link="edmel-ednsy/enable-ai"
      data-cal-namespace="enable-ai"
      data-cal-config={JSON.stringify({layout: "month_view"})}
    >
      Get started today
    </Button>
  </div>
</section>