<script lang="ts">
  import { goto } from "$app/navigation";
  import "../app.css";
  import { LogOut, LayoutPanelLeft } from "@lucide/svelte";

  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabase";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ContentHeader from "$lib/components/app/content/header.svelte";
  import SidebarLayout from "$lib/components/app/sidebar/layout.svelte";
  import type { LayoutData } from "./$types";

  let { children, data } = $props<{ data: LayoutData }>();
  let user = $state<any>(data.user);
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

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      goto("/login");
    }
  }

  // Update user state when auth state changes (only on client)
  if (browser) {
    supabase.auth.onAuthStateChange((event, session) => {
      user = session?.user || null;
    });
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
  <title>Ed & Sy: AI Automation Made Simple for Local Businesses</title>
  <meta
    name="description"
    content="Ed & Sy helps small and medium businesses automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with easy-to-use AI tools. Designed for non-technical teams and older business owners."
  />
  <meta
    name="keywords"
    content="AI automation, business automation, admin automation, appointment booking, lead capture, online reviews, local SEO, dashboards, SOPs, training, small business, non-technical, Ed & Sy, Toronto, Google Business, Zapier, Notion, ChatGPT, Twilio, Calendly, Gmail, Google Sheets, Wave, Framer, Buffer, Tally.so, Loom"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    property="og:title"
    content="Ed & Sy: AI Automation Made Simple for Local Businesses"
  />
  <meta
    property="og:description"
    content="Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training. Ed & Sy makes AI easy for non-technical and older business owners. See our services!"
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com" />
  <meta property="og:image" content="/logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Ed & Sy: AI Automation Made Simple for Local Businesses"
  />
  <meta
    name="twitter:description"
    content="Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training. Ed & Sy makes AI easy for non-technical and older business owners. See our services!"
  />
  <meta name="twitter:image" content="/logo.png" />
  <link rel="canonical" href="https://ednsy.com" />
  <link rel="icon" href="/favicon.ico" />
  <!-- Social profile links for SEO -->
  <link rel="me" href="https://www.instagram.com/dev.exd/" />
  <link rel="me" href="https://www.linkedin.com/in/syronsuerte/" />
  <!-- JSON-LD Structured Data for LocalBusiness/Organization -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Ed & Sy",
      "url": "https://ednsy.com",
      "logo": "https://ednsy.com/logo.png",
      "image": "https://ednsy.com/logo.png",
      "description": "Ed & Sy helps small and medium businesses automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with easy-to-use AI tools. Designed for non-technical teams and older business owners.",
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
{#if $page.url.pathname === "/" || ($page.url.pathname !== "/login" && !$page.url.pathname.startsWith("/demos") && $page.url.pathname !== "/logout")}
  <nav
    class="fixed top-0 z-50 w-full mx-auto transition-all duration-300 {scrolled
      ? 'bg-white/50 backdrop-blur-md border-b border-white/10 shadow-sm'
      : 'bg-transparent border-transparent'}"
  >
         <div class=" mx-auto flex items-center justify-between px-6 sm:px-16 py-4">
       <a href="/" class="flex items-center gap-3 font-heading sm:justify-start justify-center flex-1">
         <div
           class="font-heading text-2xl font-bold tracking-tight drop-shadow-lg"
         >
           <span class="{scrolled ? 'text-blue-700' : 'text-white'}">Ed</span>
           <span class="{scrolled ? 'text-blue-700' : 'text-primary'}">&</span>
           <span class="{scrolled ? 'text-blue-700' : 'text-white'}">Sy</span>
         </div>
       </a>
             <div class="flex items-center gap-4">
         {#if user}
                      <a
              href="/demos"
              class="flex items-center gap-2 {scrolled ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'} px-4 py-2 rounded-lg font-medium transition-all duration-200 border {scrolled ? 'border-primary/20' : 'border-white/20'}"
            >
              <LayoutPanelLeft class="w-4 h-4" />
              <span class="hidden sm:inline">Services</span>
            </a>
            <button
              onclick={handleLogout}
              class="flex items-center gap-2 {scrolled ? 'text-neutral-700 hover:text-red-600' : 'text-white/80 hover:text-red-300'} px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer {scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'}"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden sm:inline">Logout</span>
            </button>
         {/if}
       </div>
    </div>
  </nav>
{/if}

{#if user && $page.url.pathname.startsWith("/demos") && $page.url.pathname !== "/logout"}
  <!-- Authenticated Layout with Sidebar - Only for Demos -->
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
{:else if user && $page.url.pathname !== "/login"}
  <!-- Authenticated user on non-demo pages - Clean layout -->
  {@render children()}
{:else}
  <!-- Public Layout without Sidebar -->
  {@render children()}

  {#if $page.url.pathname !== "/login" && $page.url.pathname !== "/logout"}
         <!-- FOOTER -->
     <footer class="bg-slate-900 text-white">
       <div class="max-w-6xl mx-auto px-6 sm:px-16 py-16">
                   <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Company Info -->
            <div class="space-y-4">
              <div class="font-display text-2xl font-bold">
                <span class="text-white">Ed</span>
                <span class="text-primary">&</span>
                <span class="text-white">Sy</span>
              </div>
              <p class="text-white/70 text-sm leading-relaxed">
                Helping small business owners get their time back through smart automation.
              </p>
            </div>

                         <!-- Solutions -->
             <div class="space-y-4">
               <h3 class="font-semibold text-white">Solutions</h3>
               <ul class="space-y-2 text-sm">
                 <li>
                   <button
                     onclick={() => {
                       if (user) {
                         goto('/demos');
                       } else {
                         goto('/login');
                       }
                     }}
                     class="text-white/70 hover:text-white transition-colors cursor-pointer"
                   >
                     Business Automation
                   </button>
                 </li>
                 <li>
                   <button
                     onclick={() => {
                       if (user) {
                         goto('/demos');
                       } else {
                         goto('/login');
                       }
                     }}
                     class="text-white/70 hover:text-white transition-colors cursor-pointer"
                   >
                     AI Voice & Chat
                   </button>
                 </li>
                 <li>
                   <button
                     onclick={() => {
                       if (user) {
                         goto('/demos');
                       } else {
                         goto('/login');
                       }
                     }}
                     class="text-white/70 hover:text-white transition-colors cursor-pointer"
                   >
                     Data Insights
                   </button>
                 </li>
                 <li>
                   <button
                     onclick={() => {
                       if (user) {
                         goto('/demos');
                       } else {
                         goto('/login');
                       }
                     }}
                     class="text-white/70 hover:text-white transition-colors cursor-pointer"
                   >
                     Custom AI
                   </button>
                 </li>
               </ul>
             </div>

            <!-- Quick Links -->
            <div class="space-y-4">
              <h3 class="font-semibold text-white">Quick Links</h3>
              <ul class="space-y-2 text-sm">
                <li>
                  <a href="/#team" class="text-white/70 hover:text-white transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <button
                    data-tally-open="3NQ6pB"
                    data-tally-overlay="1"
                    class="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    Contact Us
                  </button>
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
               href="https://www.instagram.com/dev.exd/"
               class="text-white/60 hover:text-white transition-colors text-sm"
               target="_blank"
               rel="noopener"
             >
               Ed's Instagram
             </a>
             <a
               href="https://www.linkedin.com/in/syronsuerte/"
               class="text-white/60 hover:text-white transition-colors text-sm"
               target="_blank"
               rel="noopener"
             >
               Sy's LinkedIn
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
