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
  import type { LayoutData } from './$types';

  let { children, data } = $props<{ data: LayoutData }>();
  let user = $state<any>(data.user);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      goto('/login');
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
    console.warn('⚠️ PostHog API key not found. Analytics will be disabled.');
  }

  if (browser && posthogApiKey) {
    beforeNavigate(() => posthog.capture('$pageleave'));
    afterNavigate(() => posthog.capture('$pageview'));
  }
</script>

<svelte:head>
  <title>Ed&Sy: AI Automation Made Simple for Local Businesses</title>
  <meta
    name="description"
    content="Ed&Sy helps small and medium businesses automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with easy-to-use AI tools. Designed for non-technical teams and older business owners."
  />
  <meta
    name="keywords"
    content="AI automation, business automation, admin automation, appointment booking, lead capture, online reviews, local SEO, dashboards, SOPs, training, small business, non-technical, Ed&Sy, Toronto, Google Business, Zapier, Notion, ChatGPT, Twilio, Calendly, Gmail, Google Sheets, Wave, Framer, Buffer, Tally.so, Loom"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    property="og:title"
    content="Ed&Sy: AI Automation Made Simple for Local Businesses"
  />
  <meta
    property="og:description"
    content="Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training. Ed&Sy makes AI easy for non-technical and older business owners. See our services!"
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com" />
  <meta property="og:image" content="/logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Ed&Sy: AI Automation Made Simple for Local Businesses"
  />
  <meta
    name="twitter:description"
    content="Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training. Ed&Sy makes AI easy for non-technical and older business owners. See our services!"
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
      "name": "Ed&Sy",
      "url": "https://ednsy.com",
      "logo": "https://ednsy.com/logo.png",
      "image": "https://ednsy.com/logo.png",
      "description": "Ed&Sy helps small and medium businesses automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with easy-to-use AI tools. Designed for non-technical teams and older business owners.",
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
{#if $page.url.pathname === '/' || ($page.url.pathname !== '/login' && !$page.url.pathname.startsWith('/demos') && $page.url.pathname !== '/logout')}
<nav
  class="sticky top-0 z-50 w-full mx-auto bg-white border-b border-gray-200"
>
  <div
    class="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-16 py-4"
  >
    <a href="/" class="flex items-center gap-3 font-heading">
      <div class="font-heading text-2xl font-bold tracking-tight text-blue-600">
        Ed <span class="text-blue-600">&</span> Sy
      </div>
    </a>
    <div class="flex items-center gap-4">
      {#if user}
        <a 
          href="/demos" 
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <LayoutPanelLeft class="w-4 h-4" />
          <span class="hidden sm:inline">Services</span>
        </a>
        <button
          onclick={handleLogout}
          class="flex items-center gap-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Logout</span>
        </button>
      {:else}
        <button
          data-tally-open="3NQ6pB"
          data-tally-overlay="1"
          class="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >Contact us</button
        >
      {/if}
    </div>
  </div>
</nav>
{/if}

{#if user && $page.url.pathname.startsWith('/demos') && $page.url.pathname !== '/logout'}
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
{:else if user && $page.url.pathname !== '/login'}
  <!-- Authenticated user on non-demo pages - Clean layout -->
  {@render children()}
{:else}
  <!-- Public Layout without Sidebar -->
  {@render children()}
  
  
  {#if $page.url.pathname !== '/login' && $page.url.pathname !== '/logout'}
  <!-- FOOTER (moved from +page.svelte) -->
  <footer
    class="mx-auto px-6 sm:px-16 py-20 h-full mt-20 text-center bg-slate-900"
  >
  <div class="mx-auto max-w-2xl lg:max-w-none">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-1">
      <nav>
        <ul class="grid grid-cols-2 sm:grid-cols-3 justify-between">
          <li>
            <div
              class="font-display font-semibold tracking-wider text-white/70"
            >
              Solutions
            </div>
            <ul class="mt-4 text-sm text-white/90">
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/#services"
                  >Automation</a
                >
              </li>
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/#services"
                  >AI Voice & Chat</a
                >
              </li>
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/#services"
                  >Data Insights</a
                >
              </li>
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/#services"
                  >Custom AI</a
                >
              </li>
            </ul>
          </li>
          <li>
            <div
              class="font-display font-semibold tracking-wider text-white/70"
            >
              Company
            </div>
            <ul class="mt-4 text-sm text-white/90">
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/#team">
                  Our Story</a
                >
              </li>
              <li class="mt-4">
                <button
                  data-tally-open="3NQ6pB"
                  data-tally-overlay="1"
                  class="transition hover:text-neutral-700 cursor-pointer"
                  >Contact Us</button
                >
              </li>
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/privacy"
                  >Privacy</a
                >
              </li>
              <li class="mt-4">
                <a class="transition hover:text-neutral-700" href="/terms"
                  >Terms</a
                >
              </li>
            </ul>
          </li>
          <li>
            <div
              class="font-display font-semibold tracking-wider text-white/70"
            >
              Connect
            </div>
            <ul class="mt-4 text-sm text-white/90">
              <li class="mt-4">
                <a
                  class="transition hover:text-neutral-700"
                  href="https://www.instagram.com/dev.exd/">Ed's Instagram</a
                >
              </li>
              <li class="mt-4">
                <a
                  class="transition hover:text-neutral-700"
                  href="https://www.linkedin.com/in/syronsuerte/"
                  >Sy's LinkedIn</a
                >
              </li>
            </ul>
            <div class="flex flex-col items-center gap-2">
              <a
                aria-label="Home"
                href="/"
                class="flex flex-col items-center gap-2"
              >
                <div
                  class="hidden sm:block font-display text-xl font-bold text-blue-700 tracking-tight mt-6"
                >
                  Ed <span class="text-blue-600">&</span> Sy
                </div>
              </a>
              <p class="text-sm text-neutral-700">© ednsy.com 2025</p>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</footer>
<button
  data-tally-open="3NQ6pB"
  data-tally-overlay="1"
  data-tally-emoji-text="👋"
  data-tally-emoji-animation="wave"
  data-tally-auto-close="3000"
  class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-lg font-bold px-6 py-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
  >Hi!👋</button
>
  {/if}
{/if}