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
  <!-- Primary Meta Tags -->
  <title>AI Automation for Toronto Businesses | Voice AI & Workflow Solutions | Ed & Sy</title>
  <meta name="description" content="Stop working nights & weekends! Toronto's leading AI automation agency helps business owners reclaim 15-20 hours weekly. Voice AI, workflow automation & high-converting websites. Free consultation." />
  <meta name="keywords" content="Toronto AI automation, Voice AI business, workflow automation Toronto, business automation Canada, AI phone assistant, automated business processes, Toronto digital agency, small business automation, AI chatbot Toronto, business time management, automated lead generation, Toronto business solutions, AI assistant for business, workflow optimization, business process automation, Toronto tech consulting, AI implementation, business efficiency Toronto, automated customer service, Toronto AI consulting" />
  <meta name="author" content="Ed & Sy Digital Agency" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="language" content="en-CA" />
  <meta name="geo.region" content="CA-ON" />
  <meta name="geo.placename" content="Toronto" />
  <meta name="geo.position" content="43.6532;-79.3832" />
  <meta name="ICBM" content="43.6532, -79.3832" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://ednsy.com/" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com/" />
  <meta property="og:title" content="AI Automation for Toronto Businesses | Voice AI & Workflow Solutions" />
  <meta property="og:description" content="Stop working nights & weekends! Toronto's leading AI automation agency helps business owners reclaim 15-20 hours weekly. Voice AI, workflow automation & high-converting websites." />
  <meta property="og:image" content="https://ednsy.com/logo/white transparent.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Ed & Sy - AI Automation for Toronto Businesses" />
  <meta property="og:site_name" content="Ed & Sy Digital Agency" />
  <meta property="og:locale" content="en_CA" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://ednsy.com/" />
  <meta name="twitter:title" content="AI Automation for Toronto Businesses | Voice AI & Workflow Solutions" />
  <meta name="twitter:description" content="Stop working nights & weekends! Toronto's leading AI automation agency helps business owners reclaim 15-20 hours weekly. Voice AI, workflow automation & high-converting websites." />
  <meta name="twitter:image" content="https://ednsy.com/logo/white transparent.png" />
  <meta name="twitter:image:alt" content="Ed & Sy - AI Automation for Toronto Businesses" />
  
  <!-- Additional SEO Meta Tags -->
  <meta name="theme-color" content="#3b82f6" />
  <meta name="msapplication-TileColor" content="#3b82f6" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Ed & Sy" />
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  <link rel="dns-prefetch" href="//fonts.gstatic.com" />
  
  <!-- Structured Data - Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ed & Sy Digital Agency",
    "alternateName": "Ed & Sy",
    "url": "https://ednsy.com",
    "logo": "https://ednsy.com/logo/white transparent.png",
    "image": "https://ednsy.com/logo/white transparent.png",
    "description": "Toronto's leading AI automation agency helping business owners reclaim 15-20 hours weekly through Voice AI, workflow automation, and high-converting websites.",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toronto",
      "addressRegion": "ON",
      "addressCountry": "CA"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Canada"
      },
      {
        "@type": "State",
        "name": "Ontario"
      },
      {
        "@type": "City",
        "name": "Toronto"
      }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-416-XXX-XXXX",
        "contactType": "customer service",
        "areaServed": "CA",
        "availableLanguage": "English"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/ed.n.sy",
      "https://www.linkedin.com/in/syronsuerte/",
      "https://www.youtube.com/@ed.n.sy",
      "https://www.tiktok.com/@ed.n.sy"
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 43.6532,
        "longitude": -79.3832
      },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Automation Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Voice AI Business Growth",
            "description": "24/7 AI phone assistant for lead capture and customer service"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Workflow Freedom Package",
            "description": "Complete business automation for repetitive tasks"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "High-Converting Websites",
            "description": "SEO-optimized websites that turn visitors into customers"
          }
        }
      ]
    }
  }
  </script>
  
  <!-- Structured Data - Service -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Business Automation Services",
    "description": "Comprehensive AI automation solutions for Toronto businesses including Voice AI, workflow automation, and high-converting websites.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Ed & Sy Digital Agency",
      "url": "https://ednsy.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    },
    "serviceType": "Business Automation",
    "category": "Digital Marketing Services",
    "offers": {
      "@type": "Offer",
      "description": "AI automation solutions starting from custom pricing",
      "priceCurrency": "CAD"
    }
  }
  </script>
  
  <!-- Structured Data - FAQ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does it take to see results from automation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most clients see immediate improvements within the first week, with full system optimization typically achieved within 30-60 days. We provide ongoing support to ensure your automation continues to deliver value."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need technical knowledge to use your solutions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not at all! Our solutions are designed to be user-friendly and intuitive. We handle all the technical setup and provide training to ensure you and your team can easily manage and monitor your automation systems."
        }
      },
      {
        "@type": "Question",
        "name": "What's included in the free consultation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our free 30-minute consultation includes a thorough analysis of your current processes, identification of automation opportunities, and a customized roadmap showing exactly how we can help you save time and improve efficiency."
        }
      }
    ]
  }
  </script>
</svelte:head>

<!-- Hero Section -->
<main class="relative min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center pt-20 md:pt-0 pb-16 md:pb-0">
  <!-- Animated blob background -->
  <div class="hero-container absolute inset-0"></div>
  
  <div class="relative max-w-7xl mx-auto px-6 lg:px-8 w-full z-20">
    <!-- Badge -->
    <div class="text-center lg:text-left mb-6 md:mb-8">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
        Toronto AI Automation Solutions
      </div>
    </div>
                  
    <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      <!-- Left side - Hero text -->
      <header class="text-center lg:text-left">
        <!-- Main headline -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 md:mb-6">
          AI Automation for<br/>
          <span class="text-blue-400">Toronto Businesses</span>
        </h1>
        
        <!-- Subheadline -->
        <p class="text-lg md:text-xl lg:text-2xl text-slate-300 mb-4 md:mb-6 leading-relaxed">
          Stop working nights <span class="text-blue-600">&</span> weekends. Toronto's leading <strong>AI automation agency</strong> helps business owners reclaim 15-20 hours weekly through <strong>Voice AI</strong>, <strong>workflow automation</strong>, <span class="text-blue-600">&</span> <strong>high-converting websites</strong>.
        </p>
        
        <!-- Trust indicator -->
        <p class="text-base md:text-lg text-slate-400 mb-6 md:mb-8 leading-relaxed">
          Trusted by <strong>Toronto businesses</strong> across healthcare, retail, professional services, and more.
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
            Get Free AI Automation Consultation
          </Button>
        </div>
      </header>

      <!-- Right side - KPIs -->
      <aside class="space-y-6 md:space-y-8 mt-8 lg:mt-0" aria-label="Business automation results">
        <div class="text-center">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
          <div class="text-sm md:text-base text-slate-400">AI Phone Assistant</div>
        </div>
        <div class="text-center">
          <div class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">15-20</div>
          <div class="text-sm md:text-base text-slate-400">Hours Saved Weekly</div>
        </div>
        <div class="text-center">
          <div class="text-4xl md:text-5xl font-bold text-white mb-2">3x</div>
          <div class="text-sm text-slate-400">More Qualified Leads</div>
        </div>
      </aside>
    </div>

    <!-- Trust indicators -->
    <div class="mt-12 text-center lg:text-left">
      <div class="flex flex-wrap items-center gap-6 text-sm text-slate-400">
        <span>Free 30-Minute Consultation</span>
        <span class="hidden sm:inline">•</span>
        <span>Toronto-Based Team</span>
        <span class="hidden sm:inline">•</span>
        <span>Proven AI Automation Results</span>
      </div>
    </div>
  </div>
</main>

<!-- Industries Section -->
<section class="py-24 bg-white" aria-labelledby="industries-heading">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <header class="text-center mb-16">
      <h2 id="industries-heading" class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Toronto Industries We Serve
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        From <strong>healthcare practices</strong> to <strong>retail stores</strong>, we help <strong>Toronto businesses</strong> across all industries automate their operations and connect better with their customers through <strong>AI automation</strong>.
      </p>
    </header>
    
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

<!-- Social Proof Section -->
<section class="py-24 bg-slate-50 section-grid section-grid-slate" aria-labelledby="trust-heading">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <header class="text-center mb-16">
      <h2 id="trust-heading" class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Why Toronto Businesses<br/>
        Trust Our AI Automation
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        We understand the unique challenges of running a <strong>business in Toronto</strong>. Here's why local entrepreneurs choose us for their <strong>AI automation</strong> and <strong>workflow optimization</strong> needs.
      </p>
    </header>
    
    <!-- Trust Indicators Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <!-- Local Expertise -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Toronto Born & Raised</h3>
        <p class="text-slate-600 text-sm leading-relaxed">
          We understand local business culture, regulations, and the unique challenges of operating in the GTA.
        </p>
      </div>

      <!-- Proven Results -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">Proven Results</h3>
        <p class="text-slate-600 text-sm leading-relaxed">
          Our automation solutions consistently deliver 15-20 hours of time savings and 3x more qualified leads.
        </p>
      </div>

      <!-- White-Glove Service -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">White-Glove Service</h3>
        <p class="text-slate-600 text-sm leading-relaxed">
          We handle everything from setup to training. You focus on your business while we handle the tech.
        </p>
      </div>

      <!-- Industry Expertise -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-3">SMB Specialists</h3>
        <p class="text-slate-600 text-sm leading-relaxed">
          We specialize in small to medium businesses across healthcare, retail, professional services, and more.
        </p>
      </div>
    </div>

    <!-- Results Preview -->
    <div class="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-4">What you can expect</h3>
        <p class="text-slate-600 max-w-2xl mx-auto">
          Based on our experience with similar businesses, here's what our clients typically achieve:
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="text-4xl font-bold text-blue-600 mb-2">15-20</div>
          <div class="text-lg font-semibold text-slate-900 mb-2">Hours Saved Weekly</div>
          <div class="text-slate-600 text-sm">Time reclaimed for family, growth, and strategic work</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-blue-600 mb-2">3x</div>
          <div class="text-lg font-semibold text-slate-900 mb-2">More Qualified Leads</div>
          <div class="text-slate-600 text-sm">Better lead capture and nurturing through automation</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-blue-600 mb-2">24/7</div>
          <div class="text-lg font-semibold text-slate-900 mb-2">Customer Service</div>
          <div class="text-slate-600 text-sm">Never miss a call or inquiry with AI-powered assistance</div>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center mt-12">
      <p class="text-slate-600 text-lg mb-6">
        Ready to see these results for your business?
      </p>
      <Button 
        size="lg" 
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        Book Your Free Consultation
      </Button>
    </div>
  </div>
</section>

<!-- About Us Section -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Meet the team behind<br/>
        your time freedom
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        We're Toronto entrepreneurs who understand the struggle of growing a business while maintaining work-life balance.
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-16 items-center mb-16">
      <!-- Team Photos -->
      <div class="flex justify-center lg:justify-start">
        <div class="relative">
          <div class="w-80 h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center">
            <div class="text-center">
              <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users class="w-12 h-12 text-white" />
              </div>
              <p class="text-blue-800 font-semibold text-lg">Ed & Sy</p>
              <p class="text-blue-600 text-sm">Toronto Digital Agency</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Our Story -->
      <div class="space-y-6">
        <div>
          <h3 class="text-2xl font-bold text-slate-900 mb-4">Our Story</h3>
          <p class="text-slate-600 leading-relaxed mb-4">
            We started Ed & Sy because we've been there - working 70+ hour weeks, missing family dinners, 
            and feeling like our businesses were running us instead of the other way around.
          </p>
          <p class="text-slate-600 leading-relaxed">
            After years of building and scaling businesses in Toronto, we discovered the power of AI automation. 
            Now we help other entrepreneurs reclaim their time and build the life they actually want.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600 mb-2">5+</div>
            <div class="text-sm text-slate-600">Years Experience</div>
          </div>
          <div class="text-center p-4 bg-slate-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600 mb-2">100%</div>
            <div class="text-sm text-slate-600">Toronto Based</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Why We're Different -->
    <div class="bg-slate-50 rounded-3xl p-8 md:p-12">
      <h3 class="text-2xl font-bold text-slate-900 mb-6 text-center">Why We're Different</h3>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target class="w-8 h-8 text-blue-600" />
          </div>
          <h4 class="font-semibold text-slate-900 mb-2">SMB Focused</h4>
          <p class="text-slate-600 text-sm">We understand small business challenges because we've lived them.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield class="w-8 h-8 text-blue-600" />
          </div>
          <h4 class="font-semibold text-slate-900 mb-2">White-Glove Service</h4>
          <p class="text-slate-600 text-sm">We handle everything from setup to training. You just focus on your business.</p>
        </div>
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles class="w-8 h-8 text-blue-600" />
          </div>
          <h4 class="font-semibold text-slate-900 mb-2">Proven Results</h4>
          <p class="text-slate-600 text-sm">Our clients consistently save 15-20 hours weekly and see 3x more leads.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Pricing Section -->
<section class="py-24 bg-slate-50 section-grid section-grid-slate">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
        Simple, transparent pricing
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Choose the solution that fits your business needs. All packages include setup, training, and ongoing support.
      </p>
    </div>
    
    <!-- Pricing Cards -->
    <div class="grid md:grid-cols-3 gap-8 mb-12">
      <!-- Voice AI Package -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Headphones class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Voice AI Business Growth</h3>
          <p class="text-slate-600">24/7 AI phone assistant</p>
        </div>
        
        <div class="text-center mb-8">
          <div class="text-4xl font-bold text-slate-900 mb-2">Custom Pricing</div>
          <p class="text-slate-600">Based on call volume & features</p>
        </div>
        
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">24/7 call handling</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Lead qualification</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Appointment booking</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">CRM integration</span>
          </li>
        </ul>
        
        <Button 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-300"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
          data-cal-config={JSON.stringify({layout: "month_view"})}
        >
          Get Quote
        </Button>
      </div>

      <!-- Workflow Automation Package -->
      <div class="bg-white rounded-2xl p-8 border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 relative">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
        </div>
        
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Workflow class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Workflow Freedom Package</h3>
          <p class="text-slate-600">Complete business automation</p>
        </div>
        
        <div class="text-center mb-8">
          <div class="text-4xl font-bold text-slate-900 mb-2">$2,500</div>
          <p class="text-slate-600">One-time setup + $500/month</p>
        </div>
        
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Invoice processing</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Customer follow-ups</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Email marketing</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Data entry automation</span>
          </li>
        </ul>
        
        <Button 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-300"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
          data-cal-config={JSON.stringify({layout: "month_view"})}
        >
          Get Started
        </Button>
      </div>

      <!-- Website Package -->
      <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">High-Converting Website</h3>
          <p class="text-slate-600">SEO-optimized business website</p>
        </div>
        
        <div class="text-center mb-8">
          <div class="text-4xl font-bold text-slate-900 mb-2">$3,500</div>
          <p class="text-slate-600">One-time development</p>
        </div>
        
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Mobile-responsive design</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">SEO optimization</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Contact forms</span>
          </li>
          <li class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span class="text-slate-600">Fast loading speeds</span>
          </li>
        </ul>
        
        <Button 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-300"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
          data-cal-config={JSON.stringify({layout: "month_view"})}
        >
          Get Quote
        </Button>
      </div>
    </div>

    <!-- Custom Packages Notice -->
    <div class="text-center bg-white rounded-2xl p-8 border border-slate-200">
      <h3 class="text-xl font-bold text-slate-900 mb-4">Need a Custom Solution?</h3>
      <p class="text-slate-600 mb-6 max-w-2xl mx-auto">
        Every business is unique. We create custom packages that combine multiple solutions 
        to perfectly fit your needs and budget.
      </p>
      <Button 
        size="lg" 
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
      >
        Discuss Custom Package
      </Button>
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
<section id="contact" class="py-24 bg-slate-900 text-white section-grid section-grid-dark">
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