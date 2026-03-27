<script lang="ts">
  import Instagram from "@lucide/svelte/icons/instagram";
  import Linkedin from "@lucide/svelte/icons/linkedin";

  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate, goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import type { LayoutData } from "./$types";
  import { getSeoForPath, buildCanonical, buildOrganizationSchema, buildLocalBusinessSchema, buildWebSiteSchema } from "$lib/content/seo";
  import { services as coreServices, industries } from "$lib/content/site";
  import Menu from "@lucide/svelte/icons/menu";

  let { children } = $props<{ data: LayoutData }>();
  /** Slightly stronger shadow when user has scrolled (bar stays solid dark either way) */
  let headerElevated = $state(false);
  let navDrawerOpen = $state(false);

  function syncHeaderScroll() {
    if (!browser) return;
    headerElevated = window.scrollY > 12;
  }

  async function onLogoNavigate(e: MouseEvent) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if ($page.url.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      syncHeaderScroll();
      return;
    }
    await goto("/");
    window.scrollTo({ top: 0, behavior: "instant" });
    syncHeaderScroll();
  }

  const voiceService = coreServices.find((s) => s.slug === "voice-ai")!;
  const automationService = coreServices.find((s) => s.slug === "workflow-automation")!;
  const websiteService = coreServices.find((s) => s.slug === "website-seo")!;

  /** Desktop Services dropdown links (same order as `site.services`) */
  const serviceNavItems = [
    { slug: voiceService.slug, href: voiceService.href, title: voiceService.title },
    { slug: automationService.slug, href: automationService.href, title: automationService.title },
    { slug: websiteService.slug, href: websiteService.href, title: websiteService.title },
  ] as const;

  const seo = $derived(getSeoForPath($page.url.pathname));
  const organizationSchema = buildOrganizationSchema();
  const localBusinessSchema = buildLocalBusinessSchema();
  const websiteSchema = buildWebSiteSchema();


  $effect(() => {
    if (!browser) return;
    const onScroll = () => syncHeaderScroll();
    syncHeaderScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  // Validate PostHog API key
  if (!posthogApiKey) {
    console.warn("⚠️ PostHog API key not found. Analytics will be disabled.");
  }

  if (browser) {
    afterNavigate(() => {
      syncHeaderScroll();
      navDrawerOpen = false;
      if (posthogApiKey) {
        posthog.capture("$pageview");
      }
      requestAnimationFrame(() => {
        syncHeaderScroll();
        requestAnimationFrame(syncHeaderScroll);
      });
    });
  }

  if (browser && posthogApiKey) {
    beforeNavigate(() => posthog.capture("$pageleave"));
  }

  let prevPathname = $state("");
  $effect(() => {
    const pathname = $page.url.pathname;
    if (browser && prevPathname && prevPathname !== pathname) {
      navDrawerOpen = false;
    }
    prevPathname = pathname;
  });

  const exploreNavItems = [
    { href: "/process", label: "Process" },
    { href: "/about", label: "About" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ] as const;

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
  {@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}<\/script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}<\/script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(websiteSchema)}<\/script>`}
</svelte:head>

<!-- NAV: logo (home) · Book a Call · menu opens drawer with grouped links -->
<header
  class="site-header fixed top-0 z-[100] w-full border-b border-white/10 bg-slate-950/92 backdrop-blur-xl {headerElevated
    ? 'shadow-lg shadow-black/30'
    : 'shadow-sm shadow-black/15'}"
>
  <div
    class="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 min-h-[56px] sm:min-h-[60px]"
  >
    <a
      href="/"
      class="flex min-w-0 items-center shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label="Ed & Sy home"
      onclick={onLogoNavigate}
    >
      <img
        src="/logo/logo.png"
        alt="Ed & Sy"
        class="h-10 w-auto sm:h-12 brightness-0 invert"
        width="120"
        height="40"
      />
    </a>

    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <a
        href="/contact"
        class="inline-flex items-center rounded-md border border-white/35 bg-transparent px-3 py-2 text-sm font-heading text-white no-underline transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:px-4"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({ layout: "month_view" })}
      >
        Book a Call
      </a>
      <button
        type="button"
        class="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-white transition-colors hover:bg-white/10 active:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Open menu"
        aria-expanded={navDrawerOpen}
        aria-controls="site-nav-drawer"
        onclick={() => (navDrawerOpen = true)}
      >
        <Menu class="size-6" aria-hidden="true" />
      </button>
    </div>
  </div>
</header>

<Sheet.Root bind:open={navDrawerOpen}>
  <Sheet.Content
    side="right"
    id="site-nav-drawer"
    class="flex w-[min(100vw-1rem,22rem)] flex-col overflow-y-auto border-l border-white/10 bg-slate-950 pt-14 pb-8 pl-4 pr-12 text-slate-100 sm:max-w-sm"
  >
    <Sheet.Header class="sr-only">
      <Sheet.Title>Site menu</Sheet.Title>
    </Sheet.Header>
    <nav class="flex flex-col gap-8" aria-label="Main navigation">
      <section aria-labelledby="nav-services-heading">
        <h2 id="nav-services-heading" class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Services
        </h2>
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
          {#each serviceNavItems as item (item.slug)}
            <li>
              <Button
                href={item.href}
                variant="ghost"
                class="h-auto min-h-10 w-full justify-start whitespace-normal px-3 py-2 text-left text-base font-heading text-slate-100 hover:bg-white/10 hover:text-white"
              >
                {item.title}
              </Button>
            </li>
          {/each}
        </ul>
      </section>

      <section aria-labelledby="nav-industries-heading">
        <h2 id="nav-industries-heading" class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Industries
        </h2>
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
          <li>
            <Button
              href="/industries"
              variant="ghost"
              class="h-auto min-h-10 w-full justify-start px-3 py-2 text-left text-base font-heading text-slate-100 hover:bg-white/10 hover:text-white"
            >
              All industries
            </Button>
          </li>
          {#each industries as ind (ind.slug)}
            <li>
              <Button
                href={ind.href}
                variant="ghost"
                class="h-auto min-h-9 w-full justify-start px-3 py-1.5 text-left text-sm font-heading text-slate-300 hover:bg-white/10 hover:text-white"
              >
                {ind.name}
              </Button>
            </li>
          {/each}
        </ul>
      </section>

      <section aria-labelledby="nav-explore-heading">
        <h2 id="nav-explore-heading" class="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Explore
        </h2>
        <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
          {#each exploreNavItems as link (link.href)}
            <li>
              <Button
                href={link.href}
                variant="ghost"
                class="h-auto min-h-10 w-full justify-start px-3 py-2 text-left text-base font-heading text-slate-100 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Button>
            </li>
          {/each}
        </ul>
      </section>
    </nav>
  </Sheet.Content>
</Sheet.Root>

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
    class="fixed bottom-6 right-6 z-[115] bg-background text-primary border border-border text-lg font-bold px-6 py-4 rounded-full shadow-xl hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
  >
    Hi! 👋
  </button>
