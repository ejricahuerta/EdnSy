<script lang="ts">
  import { goto } from "$app/navigation";
  import "../app.css";
  import { Calendar, Heart, Briefcase, ShoppingCart, Home, Factory, Utensils, Headphones, Workflow, Smartphone, MessageCircle, Youtube, Instagram, Linkedin } from "@lucide/svelte";

  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ContentHeader from "$lib/components/app/content/header.svelte";
  import SidebarLayout from "$lib/components/app/sidebar/layout.svelte";
  import type { LayoutData } from "./$types";

  let { children } = $props<{ data: LayoutData }>();
  let scrolled = $state(false);
  let isAnimating = $state(false);


  // Animate wave emoji every 5 seconds
  if (browser) {
    $effect(() => {
      const interval = setInterval(() => {
        isAnimating = true;
        setTimeout(() => {
          isAnimating = false;
        }, 1000); // Animation duration
      }, 5000); // Trigger every 5 seconds

      return () => clearInterval(interval);
    });
  }

  // Handle scroll events for navigation background
  if (browser) {
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup will be handled by the browser when the page unloads
  }


  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  // Validate PostHog API key
  if (!posthogApiKey) {
    console.warn("⚠️ PostHog API key not found. Analytics will be disabled.");
  }

  if (browser && posthogApiKey) {
    beforeNavigate(() => posthog.capture("$pageleave"));
    afterNavigate(() => posthog.capture("$pageview"));
  }
</script>


<svelte:head>
  <title>Get Your Time Back with AI-Powered Digital Solutions | Ed & Sy Digital Agency</title>
  <meta
    name="description"
    content="Toronto digital agency helping business owners reclaim 15-20 hours weekly. Voice AI Assistants, Workflow Automation, Website Development & more. Free 30-minute consultation available."
  />
  <meta
    name="keywords"
    content="digital agency Toronto, AI automation, voice AI assistants, workflow automation, website development, time saving solutions, business automation, chatbots, SEO services, Toronto business automation"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    property="og:title"
    content="Get Your Time Back with AI-Powered Digital Solutions | Ed & Sy"
  />
  <meta
    property="og:description"
    content="Toronto digital agency helping business owners reclaim 15-20 hours weekly. Voice AI Assistants, Workflow Automation & more. Free consultation."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com" />
  <meta property="og:image" content="/logo/white transparent.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Get Your Time Back with AI-Powered Digital Solutions | Ed & Sy"
  />
  <meta
    name="twitter:description"
    content="Toronto digital agency helping business owners reclaim 15-20 hours weekly. Voice AI Assistants, Workflow Automation & more. Free consultation."
  />
  <meta name="twitter:image" content="/logo/white transparent.png" />
  <link rel="canonical" href="https://ednsy.com" />
  <link rel="icon" href="/logo/white transparent.png" />
  <link rel="apple-touch-icon" href="/logo/white transparent.png" />
  <!-- Social profile links for SEO -->
  <link rel="me" href="https://www.instagram.com/dev.exd/" />
  <link rel="me" href="https://www.linkedin.com/in/syronsuerte/" />
  
  <!-- Cal.com element-click embed script -->
  <script src="/lib/cal-embed.js"></script>
  <!-- JSON-LD Structured Data for LocalBusiness/Organization -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Ed & Sy Digital Agency",
      "url": "https://ednsy.com",
      "logo": "https://ednsy.com/logo/white transparent.png",
      "image": "https://ednsy.com/logo/white transparent.png",
      "description": "Ed & Sy is a Toronto digital agency helping business owners reclaim 15-20 hours weekly through AI-powered solutions. We specialize in Voice AI Assistants, Workflow Automation, Website Development, SEO Services, and Chatbots for growing businesses.",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "addressCountry": "CA"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "email": "hello@ednsy.com",
          "contactType": "customer support",
          "areaServed": "CA"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/dev.exd/",
        "https://www.linkedin.com/in/syronsuerte/"
      ]
    }
  </script>
</svelte:head>

<!-- NAVIGATION BAR - Only show on landing page and non-demo pages -->
{#if $page.url.pathname === "/" || (!$page.url.pathname.startsWith("/demos"))}
  <nav
    class="fixed top-0 z-50 w-full mx-auto transition-all duration-300 {scrolled
      ? 'bg-white/50 backdrop-blur-md border-b border-white/10 shadow-sm'
      : 'bg-transparent border-transparent'}"
  >
         <div class="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-16 py-3 md:py-4 min-h-[60px] md:min-h-[70px]">
        <a href="/" class="flex items-center font-heading sm:justify-start justify-center flex-1">
          <div class="text-xl md:text-2xl font-bold">
            <span class="{$page.url.pathname === '/' ? (scrolled ? 'text-blue-600' : 'text-white') : 'text-blue-600'}">Ed</span>
            <span class="text-blue-600">&</span>
            <span class="{$page.url.pathname === '/' ? (scrolled ? 'text-blue-600' : 'text-white') : 'text-blue-600'}">Sy</span>
          </div>
        </a>
             <div class="flex items-center gap-2 md:gap-4">
            <button
              data-cal-link="edmel-ednsy/enable-ai"
              data-cal-namespace="enable-ai"
              data-cal-config={JSON.stringify({layout: "month_view"})}
              class="flex items-center gap-1 md:gap-2 {scrolled ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700 text-white border-blue-600/90'} px-2 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 border"
            >
              <Calendar class="w-4 h-4" />
              <span class="hidden sm:inline">Contact Us</span>
            </button>
       </div>
    </div>
  </nav>
{/if}

{#if $page.url.pathname.startsWith("/demos")}
  <!-- Demo Layout with Sidebar -->
  <div class="[--header-height:calc(--spacing(14))]">
    <Sidebar.Provider class="flex flex-col">
      <ContentHeader />
      <div class="flex flex-1">
        <SidebarLayout />
        <Sidebar.Inset>
          {@render children()}
        </Sidebar.Inset>
      </div>
    </Sidebar.Provider>
  </div>
{:else}
  <!-- Public Layout without Sidebar -->
  {@render children()}

  {#if $page.url.pathname !== "/demos"}
         <!-- FOOTER -->
     <footer class="bg-slate-900 text-white">
       <div class="max-w-6xl mx-auto px-6 sm:px-16 py-16">
                   <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Company Info -->
            <div class="space-y-4">
               <div class="flex items-center gap-3">
                 <div class="text-xl font-bold">
                   <span class="text-white">Ed</span>
                   <span class="text-blue-600">&</span>
                   <span class="text-white">Sy</span>
                 </div>
               </div>
              <p class="text-white/70 text-sm leading-relaxed">
                Toronto digital agency helping business owners reclaim 15-20 hours weekly through AI-powered solutions.
              </p>
            </div>

                          <!-- Solutions -->
              <div class="space-y-4">
                <h3 class="font-semibold text-white">Solutions</h3>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-center gap-2">
                    <Headphones class="w-4 h-4 text-blue-400" />
                    <button
                      data-cal-link="edmel-ednsy/enable-ai"
                      data-cal-namespace="enable-ai"
                      data-cal-config={JSON.stringify({layout: "month_view"})}
                      class="text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      Voice AI Business Growth
                    </button>
                  </li>
                  <li class="flex items-center gap-2">
                    <Workflow class="w-4 h-4 text-blue-400" />
                    <button
                      data-cal-link="edmel-ednsy/enable-ai"
                      data-cal-namespace="enable-ai"
                      data-cal-config={JSON.stringify({layout: "month_view"})}
                      class="text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      Workflow Freedom Package
                    </button>
                  </li>
                  <li class="flex items-center gap-2">
                    <Smartphone class="w-4 h-4 text-blue-400" />
                    <button
                      data-cal-link="edmel-ednsy/enable-ai"
                      data-cal-namespace="enable-ai"
                      data-cal-config={JSON.stringify({layout: "month_view"})}
                      class="text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      High-Converting Websites
                    </button>
                  </li>
                </ul>
              </div>

            <!-- Industries -->
            <div class="space-y-4">
              <h3 class="font-semibold text-white">Industries</h3>
              <ul class="space-y-2 text-sm">
                <li class="flex items-center gap-2">
                  <Heart class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Healthcare</span>
                </li>
                <li class="flex items-center gap-2">
                  <Briefcase class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Professional Services</span>
                </li>
                <li class="flex items-center gap-2">
                  <ShoppingCart class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Retail & E-commerce</span>
                </li>
                <li class="flex items-center gap-2">
                  <Home class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Real Estate</span>
                </li>
                <li class="flex items-center gap-2">
                  <Factory class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Manufacturing</span>
                </li>
                <li class="flex items-center gap-2">
                  <Utensils class="w-4 h-4 text-blue-400" />
                  <span class="text-white/70">Food & Hospitality</span>
                </li>
              </ul>
            </div>

            <!-- Legal -->
            <div class="space-y-4">
              <h3 class="font-semibold text-white">Legal</h3>
              <ul class="space-y-2 text-sm">
                <li>
                  <a href="/privacy" class="text-white/70 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" class="text-white/70 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p class="text-white/60 text-sm">© 2025 Ed & Sy. All rights reserved.</p>
            <div class="flex items-center gap-4 mt-4 sm:mt-0">
              <a
                href="https://www.tiktok.com/@ed.n.sy"
                class="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                target="_blank"
                rel="noopener"
              >
                <MessageCircle class="w-4 h-4" />
                TikTok
              </a>
              <a
                href="https://www.instagram.com/ed.n.sy"
                class="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                target="_blank"
                rel="noopener"
              >
                <Instagram class="w-4 h-4" />
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@ed.n.sy"
                class="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                target="_blank"
                rel="noopener"
              >
                <Youtube class="w-4 h-4" />
                YouTube
              </a>
              <a
                href="https://www.linkedin.com/in/syronsuerte/"
                class="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                target="_blank"
                rel="noopener"
              >
                <Linkedin class="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>
       </div>
     </footer>
    <button
      data-tally-open="3NQ6pB"
      data-tally-overlay="1"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      data-tally-auto-close="3000"
      class="fixed bottom-6 right-6 z-50 bg-white text-blue-700  border-1 border-white/10 text-lg font-bold px-6 py-4 rounded-full shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 cursor-pointer"
      >Hi!<span class={isAnimating ? 'animate-bounce' : ''}>👋</span></button
    >
  {/if}
{/if}
