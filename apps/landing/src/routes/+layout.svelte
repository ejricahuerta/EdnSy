<script lang="ts">
  import Instagram from "@lucide/svelte/icons/instagram";
  import Linkedin from "@lucide/svelte/icons/linkedin";

  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import SiteHeader from "$lib/components/landing/site-header.svelte";
  import type { LayoutData } from "./$types";
  import { getSeoForPath, buildCanonical, buildOrganizationSchema, buildLocalBusinessSchema, buildWebSiteSchema } from "$lib/content/seo";

  let { children } = $props<{ data: LayoutData }>();

  const seo = $derived(getSeoForPath(page.url.pathname));
  const organizationSchema = buildOrganizationSchema();
  const localBusinessSchema = buildLocalBusinessSchema();
  const websiteSchema = buildWebSiteSchema();

  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  if (!posthogApiKey) {
    console.warn("⚠️ PostHog API key not found. Analytics will be disabled.");
  }

  if (browser) {
    afterNavigate(() => {
      if (posthogApiKey) {
        posthog.capture("$pageview");
      }
    });
  }

  if (browser && posthogApiKey) {
    beforeNavigate(() => posthog.capture("$pageleave"));
  }

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

<SiteHeader />

  <!-- Public Layout without Sidebar -->
  {@render children()}

  <!-- FOOTER - Local SEO: Ed & Sy, Toronto Ontario, contact (dark theme) -->
  <footer class="border-t border-slate-800/90 bg-slate-900 py-14 md:py-20 text-slate-100">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-6 gap-10 md:gap-12">
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
        <div class="lg:col-span-1 flex flex-col items-start gap-3">
          <p class="text-sm font-semibold text-slate-100">Get started</p>
          <a
            href="/contact"
            class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            data-cal-link="edmel-ednsy/enable-ai"
            data-cal-namespace="enable-ai"
            data-cal-config={JSON.stringify({ layout: "month_view" })}
          >
            Book a Call
          </a>
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
