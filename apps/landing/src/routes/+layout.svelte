<script lang="ts">
  import "../app.css";
  import { Instagram, Linkedin } from "@lucide/svelte";

  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as NavigationMenu from "$lib/components/ui/navigation-menu";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import type { LayoutData } from "./$types";
  import { getSeoForPath, buildCanonical, buildOrganizationSchema, buildLocalBusinessSchema, buildWebSiteSchema } from "$lib/content/seo";
  import { services as coreServices } from "$lib/content/site";
  import { refreshScrollTrigger } from "$lib/animations/gsap.js";
  import { Menu } from "lucide-svelte";

  let { children } = $props<{ data: LayoutData }>();
  let scrolled = $state(false);
  let pastHero = $state(false);
  let isAnimating = $state(false);
  let mobileNavOpen = $state(false);
  let mobileServicesOpen = $state(false);

  const HERO_THRESHOLD = 720;
  const isHomePage = $derived($page.url.pathname === "/");
  /** On homepage over hero: logo and nav links are light; past hero or other pages: blue */
  const navLight = $derived(isHomePage && !pastHero);

  const voiceService = coreServices.find((s) => s.slug === "voice-ai")!;
  const automationService = coreServices.find((s) => s.slug === "workflow-automation")!;
  const websiteService = coreServices.find((s) => s.slug === "website-seo")!;

  function firstSentence(text: string) {
    const match = text.match(/(.+?[.!?])(\s|$)/);
    return match ? match[1] : text;
  }

  const serviceGroups = [
    {
      slug: "voice",
      title: "Voice",
      href: voiceService.href,
      description: firstSentence(voiceService.description),
    },
    {
      slug: "automation",
      title: "Automation",
      href: automationService.href,
      description: firstSentence(automationService.description),
    },
    {
      slug: "website-seo",
      title: "Website & SEO",
      href: websiteService.href,
      description: firstSentence(websiteService.description),
    },
  ] as const;

  const seo = $derived(getSeoForPath($page.url.pathname));
  const organizationSchema = buildOrganizationSchema();
  const localBusinessSchema = buildLocalBusinessSchema();
  const websiteSchema = buildWebSiteSchema();


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

  // Handle scroll: nav background, and logo/links (light over hero, blue past hero on homepage)
  if (browser) {
    const handleScroll = () => {
      scrolled = window.scrollY > 10;
      pastHero = window.scrollY > HERO_THRESHOLD;
    };
    pastHero = window.scrollY > HERO_THRESHOLD;
    window.addEventListener("scroll", handleScroll);
  }

  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  // Validate PostHog API key
  if (!posthogApiKey) {
    console.warn("⚠️ PostHog API key not found. Analytics will be disabled.");
  }

  if (browser) {
    function syncNavScroll() {
      scrolled = window.scrollY > 10;
      pastHero = window.scrollY > HERO_THRESHOLD;
    }

    afterNavigate(() => {
      syncNavScroll();
      refreshScrollTrigger();
      mobileNavOpen = false;
      mobileServicesOpen = false;
      if (posthogApiKey) {
        posthog.capture("$pageview");
      }
      // Scroll-to-top runs after this callback; sync again on the next frame(s) so home hero/nav colors match
      requestAnimationFrame(() => {
        syncNavScroll();
        requestAnimationFrame(syncNavScroll);
      });
    });
  }

  if (browser && posthogApiKey) {
    beforeNavigate(() => posthog.capture("$pageleave"));
  }

  // Close mobile nav when route changes after clicking a link in the sheet
  let prevPathname = $state("");
  $effect(() => {
    const pathname = $page.url.pathname;
    if (browser && prevPathname && prevPathname !== pathname) {
      mobileNavOpen = false;
    }
    prevPathname = pathname;
  });

  // Sync pastHero when navigating to homepage so logo/links match scroll position
  $effect(() => {
    if (browser && $page.url.pathname === "/") {
      pastHero = window.scrollY > HERO_THRESHOLD;
    }
  });
</script>


<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <meta name="keywords" content="Voice AI Toronto, business automation Toronto, website design Toronto, SEO Toronto, website and SEO, AI automation Toronto, Ed & Sy" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={buildCanonical(seo.canonicalPath)} />
  <meta property="og:image" content="https://ednsy.com/logo/logo%20with%20bg.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Ed & Sy" />
  <meta property="og:locale" content="en_CA" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content="https://ednsy.com/logo/logo%20with%20bg.png" />
  <meta name="twitter:image:alt" content="Ed & Sy logo" />
  <link rel="canonical" href={buildCanonical(seo.canonicalPath)} />
  <link rel="icon" href="/logo/logo icon.png" />
  <link rel="apple-touch-icon" href="/logo/logo icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Marck+Script&display=swap" rel="stylesheet" />
  <link rel="me" href="https://www.instagram.com/ed.n.sy/" />
  <link rel="me" href="https://www.linkedin.com/company/ednsy/" />
  <script src="/lib/cal-embed.js"></script>
  {@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`}
</svelte:head>

<!-- NAVIGATION BAR - Collapses to hamburger menu on mobile -->
{#if true}
  <header
    class="fixed top-0 z-[100] w-full transition-all duration-300 {navLight
      ? 'bg-transparent border-b border-transparent'
      : 'border-b border-white/10 bg-slate-950/95 shadow-sm backdrop-blur-md'}"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 min-h-[56px] sm:min-h-[60px]">
      <a href="/" class="flex items-center shrink-0" aria-label="Ed & Sy home">
        <img
          src="/logo/logo.png"
          alt="Ed & Sy"
          class="h-10 w-auto sm:h-12 brightness-0 invert transition-[filter] duration-300"
          width="120"
          height="40"
        />
      </a>

      <!-- Desktop: light on transparent (over hero) or on solid dark bar (past hero / inner pages) -->
      <nav class="hidden md:flex items-center gap-6 xl:gap-8" aria-label="Main navigation">
        <NavigationMenu.Root>
          <NavigationMenu.List class="flex items-center gap-6 xl:gap-8">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger class="bg-transparent text-white hover:bg-white/10 hover:text-white">
                Services
              </NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <div class="grid gap-6 p-6 md:w-[720px] md:grid-cols-3">
                  {#each serviceGroups as group (group.slug)}
                    <div class="space-y-2">
                      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {group.title}
                      </p>
                      <NavigationMenu.Link href={group.href}>
                        <span class="text-sm font-medium tracking-tight text-foreground hover:underline">
                          {group.description}
                        </span>
                      </NavigationMenu.Link>
                    </div>
                  {/each}
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <Button href="/industries" variant="link" class="font-heading p-0 h-auto text-sm xl:text-base text-white transition-colors duration-300 hover:text-white/90">Industries</Button>
        <Button href="/process" variant="link" class="font-heading p-0 h-auto text-sm xl:text-base text-white transition-colors duration-300 hover:text-white/90">Process</Button>
        <Button href="/about" variant="link" class="font-heading p-0 h-auto text-sm xl:text-base text-white transition-colors duration-300 hover:text-white/90">About</Button>
        <Button href="/contact" variant="link" class="font-heading p-0 h-auto text-sm xl:text-base text-white transition-colors duration-300 hover:text-white/90">Contact</Button>
        <Button
          href="/contact"
          class="text-sm xl:text-base border border-white/30 bg-transparent text-white transition-colors duration-300 hover:bg-white/10"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
          data-cal-config={JSON.stringify({ layout: "month_view" })}
        >
          Book a Call
        </Button>
      </nav>

      <!-- Mobile: same light-on-dark treatment as desktop solid bar -->
      <div class="flex md:hidden items-center gap-1">
        <Button
          href="/contact"
          variant="ghost"
          class="h-10 px-3 text-sm font-heading text-white transition-colors duration-300 hover:bg-white/10 active:bg-white/20"
        >
          Contact
        </Button>
        <button
          type="button"
          class="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-white transition-colors duration-300 hover:bg-white/10 active:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav-sheet"
          onclick={() => (mobileNavOpen = true)}
        >
          <Menu class="size-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile nav sheet -->
  <Sheet.Root bind:open={mobileNavOpen}>
    <Sheet.Content side="right" id="mobile-nav-sheet" class="w-[min(100vw-2rem,320px)] sm:max-w-sm flex flex-col pt-14 pb-6 px-4">
      <Sheet.Header class="sr-only">
        <Sheet.Title>Menu</Sheet.Title>
      </Sheet.Header>
      <nav class="flex flex-col gap-1" aria-label="Mobile navigation">
        <Button
          type="button"
          variant="ghost"
          class="justify-start h-11 text-base font-heading"
          onclick={() => (mobileServicesOpen = !mobileServicesOpen)}
        >
          Services
        </Button>
        {#if mobileServicesOpen}
          <div class="flex flex-col gap-1 pl-3">
            <Button href="/voice-ai-for-business" variant="ghost" class="justify-start h-11 text-base font-heading">Voice AI</Button>
            <Button href="/business-automation-services" variant="ghost" class="justify-start h-11 text-base font-heading">Automation</Button>
            <Button href="/website-design-toronto" variant="ghost" class="justify-start h-11 text-base font-heading">Website & SEO</Button>
          </div>
        {/if}
        <Button href="/industries" variant="ghost" class="justify-start h-11 text-base font-heading">Industries</Button>
        <Button href="/process" variant="ghost" class="justify-start h-11 text-base font-heading">Process</Button>
        <Button href="/about" variant="ghost" class="justify-start h-11 text-base font-heading">About</Button>
        <Button href="/contact" variant="ghost" class="justify-start h-11 text-base font-heading">Contact</Button>
      </nav>
      <div class="mt-4 pt-4 border-t border-border">
        <Button
          href="/contact"
          class="w-full"
          data-cal-link="edmel-ednsy/enable-ai"
          data-cal-namespace="enable-ai"
          data-cal-config={JSON.stringify({ layout: "month_view" })}
        >
          Book a Call
        </Button>
      </div>
    </Sheet.Content>
  </Sheet.Root>
{/if}

  <!-- Public Layout without Sidebar -->
  {@render children()}

  <!-- FOOTER - Local SEO: Ed & Sy, Toronto Ontario, contact (dark theme) -->
  <footer class="bg-slate-900 border-t border-slate-800 py-12 md:py-16 text-slate-100">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
        <div class="lg:col-span-1">
          <p class="text-2xl font-semibold tracking-tight mb-2">Ed & Sy</p>
          <p class="text-sm text-slate-400">Toronto, Ontario</p>
          <a href="mailto:hello@ednsy.com" class="text-sm text-violet-400 underline mt-1 block hover:text-violet-300">hello@ednsy.com</a>
          <div class="flex items-center gap-3 mt-3" aria-label="Social media">
            <a href="https://www.instagram.com/ed.n.sy/" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded" aria-label="Ed & Sy on Instagram">
              <Instagram class="size-5" aria-hidden="true" />
            </a>
            <a href="https://www.linkedin.com/company/ednsy/" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded" aria-label="Ed & Sy on LinkedIn">
              <Linkedin class="size-5" aria-hidden="true" />
            </a>
          </div>
          <p class="text-sm text-slate-400 mt-3">Ed & Sy Inc. Your Toronto tech implementation partner. Voice AI, automation, websites & SEO for Ontario.</p>
        </div>
        <div>
          <p class="text-sm font-semibold mb-3 text-slate-100">Company</p>
          <ul class="space-y-2">
            <li><Button href="/about" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">About</Button></li>
            <li><Button href="/industries" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Industries</Button></li>
            <li><Button href="/process" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Process</Button></li>
            <li><Button href="/case-studies" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Case Studies</Button></li>
            <li><Button href="/blog" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Blog</Button></li>
            <li><Button href="/contact" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Contact</Button></li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold mb-3 text-slate-100">Rosetta Suite</p>
          <ul class="space-y-2">
            <li><a href="https://chartrosetta.com" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-slate-100 transition-colors text-sm font-heading inline-flex items-center">Chart</a></li>
            <li><a href="https://reportrosetta.com" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-slate-100 transition-colors text-sm font-heading inline-flex items-center">Report</a></li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold mb-3 text-slate-100">Services</p>
          <ul class="space-y-2">
            <li><Button href="/voice-ai-for-business" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Voice AI</Button></li>
            <li><Button href="/business-automation-services" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Business Automation</Button></li>
            <li><Button href="/website-design-toronto" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Website & SEO</Button></li>
            <li><Button href="/toronto-voice-ai" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Toronto Voice AI</Button></li>
            <li><Button href="/toronto-automation-agency" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Toronto Automation</Button></li>
            <li><Button href="/ontario-ai-automation" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Ontario AI Automation</Button></li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold mb-3 text-slate-100">Legal</p>
          <ul class="space-y-2">
            <li><Button href="/privacy" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Privacy</Button></li>
            <li><Button href="/terms" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Terms</Button></li>
            <li><Button href="/cookies" variant="link" class="text-slate-400 hover:text-slate-100 p-0 h-auto font-heading">Cookies</Button></li>
          </ul>
        </div>
      </div>
      <p class="text-sm text-slate-500 mt-12">© 2026 Ed & Sy. All rights reserved.</p>
    </div>
  </footer>
  <button
    type="button"
    data-tally-open="3NQ6pB"
    data-tally-overlay="1"
    data-tally-emoji-text="👋"
    data-tally-emoji-animation="wave"
    data-tally-auto-close="3000"
    class="fixed bottom-6 right-6 z-[115] bg-background text-primary border border-border text-lg font-bold px-6 py-4 rounded-full shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 cursor-pointer"
  >
    Hi!<span class={isAnimating ? 'animate-bounce' : ''}>👋</span>
  </button>

