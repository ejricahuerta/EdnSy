<script lang="ts">
  import Menu from "@lucide/svelte/icons/menu";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { browser } from "$app/environment";
  import { afterNavigate, goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { exploreNavItems } from "$lib/content/site-nav";
  import { services as coreServices, industries } from "$lib/content/site";

  let servicesMenuOpen = $state(false);
  let industriesMenuOpen = $state(false);
  let headerElevated = $state(false);
  let navDrawerOpen = $state(false);

  const desktopExploreLinks = exploreNavItems.filter((l) => l.href !== "/contact");
  const contactNavItem = exploreNavItems.find((l) => l.href === "/contact")!;

  function syncHeaderScroll() {
    if (!browser) return;
    headerElevated = window.scrollY > 12;
  }

  async function onLogoNavigate(e: MouseEvent) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (page.url.pathname === "/") {
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

  const serviceNavItems = [
    { slug: automationService.slug, href: automationService.href, title: automationService.title },
    { slug: voiceService.slug, href: voiceService.href, title: voiceService.title },
    { slug: websiteService.slug, href: websiteService.href, title: websiteService.title },
  ] as const;

  const headerLightMode = $derived(page.url.pathname === "/" && !headerElevated);

  const desktopLinkClass = $derived(
    headerLightMode
      ? "rounded-md px-3 py-2 text-sm font-medium transition-colors text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
      : "rounded-md px-3 py-2 text-sm font-medium transition-colors text-white/85 hover:bg-white/10 hover:text-white",
  );

  const desktopMenuButtonClass = $derived(
    headerLightMode
      ? "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-primary/35"
      : "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white/40",
  );

  $effect(() => {
    if (!browser) return;
    const onScroll = () => syncHeaderScroll();
    syncHeaderScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  if (browser) {
    afterNavigate(() => {
      syncHeaderScroll();
      navDrawerOpen = false;
      requestAnimationFrame(() => {
        syncHeaderScroll();
        requestAnimationFrame(syncHeaderScroll);
      });
    });
  }

  let prevPathname = $state("");
  $effect(() => {
    const pathname = page.url.pathname;
    if (browser && prevPathname && prevPathname !== pathname) {
      navDrawerOpen = false;
      servicesMenuOpen = false;
      industriesMenuOpen = false;
    }
    prevPathname = pathname;
  });

  $effect(() => {
    if (!browser || (!servicesMenuOpen && !industriesMenuOpen)) return;
    const close = () => {
      servicesMenuOpen = false;
      industriesMenuOpen = false;
    };
    queueMicrotask(() => document.addEventListener("click", close));
    return () => document.removeEventListener("click", close);
  });

  function toggleServices(e: MouseEvent) {
    e.stopPropagation();
    industriesMenuOpen = false;
    servicesMenuOpen = !servicesMenuOpen;
  }

  function toggleIndustries(e: MouseEvent) {
    e.stopPropagation();
    servicesMenuOpen = false;
    industriesMenuOpen = !industriesMenuOpen;
  }

  function closeDropdowns() {
    servicesMenuOpen = false;
    industriesMenuOpen = false;
  }
</script>

<!-- Same header on every page: light on home hero at top; dark after scroll or on inner pages -->
<header
  class="site-header fixed top-0 z-[100] w-full backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-200 {headerLightMode
    ? headerElevated
      ? 'border-b border-zinc-200/80 bg-white/95 shadow-md shadow-zinc-900/10'
      : 'border-b border-transparent bg-white/80 shadow-sm shadow-zinc-900/5'
    : headerElevated
      ? 'border-b border-white/10 bg-slate-950/92 shadow-lg shadow-black/25'
      : 'border-b border-transparent bg-slate-950/92 shadow-sm shadow-black/10'}"
>
  <div
    class="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 min-h-[56px] sm:min-h-[60px]"
  >
    <a
      href="/"
      class="flex min-w-0 items-center shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 {headerLightMode
        ? 'focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
        : 'focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'}"
      aria-label="Ed & Sy home"
      onclick={onLogoNavigate}
    >
      <img
        src="/logo/logo.png"
        alt="Ed & Sy"
        class="h-10 w-auto sm:h-12 {headerLightMode ? '' : 'brightness-0 invert'}"
        width="120"
        height="40"
      />
    </a>

    <nav class="hidden lg:flex flex-1 items-center justify-center gap-1 px-4 min-w-0" aria-label="Primary">
      <div class="relative shrink-0">
        <button
          type="button"
          class={desktopMenuButtonClass}
          aria-expanded={servicesMenuOpen}
          aria-haspopup="true"
          onclick={toggleServices}
        >
          Services
          <ChevronDown class="size-4 opacity-70" aria-hidden="true" />
        </button>
        {#if servicesMenuOpen}
          <div
            class="absolute left-0 top-full z-[110] pt-2"
            role="presentation"
            onclick={(e) => e.stopPropagation()}
          >
            <ul
              class="min-w-[14rem] rounded-xl py-2 shadow-xl shadow-zinc-900/15 {headerLightMode
                ? 'bg-white'
                : 'bg-slate-950 shadow-black/40'}"
              role="menu"
            >
              {#each serviceNavItems as item (item.slug)}
                <li role="presentation">
                  <a
                    href={item.href}
                    class="block px-4 py-2.5 text-sm {headerLightMode
                      ? 'text-zinc-800 hover:bg-zinc-50 hover:text-zinc-950'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'}"
                    role="menuitem"
                    onclick={closeDropdowns}
                  >
                    {item.title}
                  </a>
                </li>
              {/each}
              <li role="presentation" class="mt-1 pt-1 {headerLightMode ? 'bg-zinc-50/80' : 'bg-white/5'}">
                <a
                  href="/#services"
                  class="block px-4 py-2.5 text-sm text-primary {headerLightMode
                    ? 'hover:bg-zinc-50'
                    : 'hover:bg-white/10'}"
                  role="menuitem"
                  onclick={closeDropdowns}
                >
                  All on homepage →
                </a>
              </li>
            </ul>
          </div>
        {/if}
      </div>

      <div class="relative shrink-0">
        <button
          type="button"
          class={desktopMenuButtonClass}
          aria-expanded={industriesMenuOpen}
          aria-haspopup="true"
          onclick={toggleIndustries}
        >
          Industries
          <ChevronDown class="size-4 opacity-70" aria-hidden="true" />
        </button>
        {#if industriesMenuOpen}
          <div
            class="absolute left-0 top-full z-[110] pt-2"
            role="presentation"
            onclick={(e) => e.stopPropagation()}
          >
            <ul
              class="max-h-[min(70vh,22rem)] min-w-[14rem] overflow-y-auto rounded-xl py-2 shadow-xl shadow-zinc-900/15 {headerLightMode
                ? 'bg-white'
                : 'bg-slate-950 shadow-black/40'}"
              role="menu"
            >
              <li role="presentation">
                <a
                  href="/industries"
                  class="block px-4 py-2.5 text-sm font-medium {headerLightMode
                    ? 'text-zinc-800 hover:bg-zinc-50 hover:text-zinc-950'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'}"
                  role="menuitem"
                  onclick={closeDropdowns}
                >
                  All industries
                </a>
              </li>
              {#each industries as ind (ind.slug)}
                <li role="presentation">
                  <a
                    href={ind.href}
                    class="block px-4 py-2 text-sm {headerLightMode
                      ? 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'}"
                    role="menuitem"
                    onclick={closeDropdowns}
                  >
                    {ind.name}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      {#each desktopExploreLinks as link (link.href)}
        <a href={link.href} class={desktopLinkClass}>
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <a
        href={contactNavItem.href}
        class="hidden lg:inline-flex rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 {headerLightMode
          ? 'text-zinc-600 hover:text-zinc-900 focus-visible:ring-primary/35'
          : 'text-white/70 hover:text-white focus-visible:ring-white/40'}"
      >
        {contactNavItem.label}
      </a>
      <a
        href="/contact"
        class="inline-flex items-center rounded-md border border-white/35 bg-primary px-3 py-2 text-sm font-semibold text-white no-underline shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:px-4"
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({ layout: "month_view" })}
      >
        Get Started
      </a>
      <button
        type="button"
        class="inline-flex lg:hidden items-center justify-center min-w-[44px] min-h-[44px] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 {headerLightMode
          ? 'text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 focus-visible:ring-primary/40 focus-visible:ring-offset-white'
          : 'text-white hover:bg-white/10 active:bg-white/15 focus-visible:ring-white/40 focus-visible:ring-offset-slate-950'}"
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
