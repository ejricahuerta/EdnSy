<script lang="ts">
  import { goto } from "$app/navigation";
  import "../app.css";
  import { Star, Users } from "@lucide/svelte";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  injectAnalytics({ mode: "production" });
  let { children } = $props();
  let mobileNavOpen = $state(false);
  function closeMobileNav() {
    mobileNavOpen = false;
  }
  // Footer links
  const footerLinks = [
    {
      href: "/privacy",
      label: "Privacy",
    },
    {
      href: "/terms",
      label: "Terms",
    },
    {
      href: "/cookies",
      label: "Cookies",
    },
  ];
  // Social links (placeholder)
  const socialLinks = [
    { href: "https://twitter.com/yourcompany", icon: Star, label: "Twitter" },
    {
      href: "https://linkedin.com/company/yourcompany",
      icon: Users,
      label: "LinkedIn",
    },
  ];
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
  <!-- Manifest (add if/when available) -->
  <!-- <link rel="manifest" href="/manifest.json" /> -->
  <!-- Social profile links for SEO -->
  <link rel="me" href="https://www.instagram.com/dev.exd/" />
  <link rel="me" href="https://www.linkedin.com/in/syronsuerte/" />
  <!-- JSON-LD Structured Data for LocalBusiness/Organization -->
  <script type="application/ld+json">
    {"@context": "https://schema.org","@type": "LocalBusiness","name": "Ed&Sy","url": "https://ednsy.com","logo": "https://ednsy.com/logo.png","image": "https://ednsy.com/logo.png","description": "Ed&Sy helps small and medium businesses automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with easy-to-use AI tools. Designed for non-technical teams and older business owners.","address": {"@type": "PostalAddress","addressLocality": "Toronto","addressRegion": "ON","addressCountry": "CA"},"contactPoint": [{"@type": "ContactPoint","email": "hello@ednsy.com","contactType": "customer support","areaServed": "CA"}],"sameAs": ["https://www.instagram.com/dev.exd/","https://www.linkedin.com/in/syronsuerte/"]}
  </script>

  <script>
    !(function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1])),
              (t[e] = function () {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              });
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.crossOrigin = "anonymous"),
            (p.async = !0),
            (p.src =
              s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
              "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
              p,
              r
            );
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = "posthog";
                return (
                  "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
                );
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "init Ie Ts Ms Ee Es Rs capture Ge calculateEventProperties Os register register_once register_for_session unregister unregister_for_session js getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Ds Fs createPersonProfile Ls Ps opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Cs debug I As getPageViewId captureTraceFeedback captureTraceMetric".split(
                  " "
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);
    posthog.init("phc_dIDsHXydHuZQaAMvL3BpgjxQz32bcvdm4ZdUogzi3a6", {
      api_host: "https://us.i.posthog.com",
      defaults: "2025-05-24",
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });
  </script>
</svelte:head>

<!-- NAVIGATION BAR (moved from +page.svelte) -->
<nav
  class="sticky top-0 z-50 w-full mx-auto bg-gradient-to-b from-white to-gray-100"
>
  <div
    class="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-16 py-4"
  >
    <a href="/" class="flex items-center gap-3 font-heading">
      <div class="font-heading text-2xl font-bold tracking-tight text-blue-600">
        Ed <span class="text-blue-600">&</span> Sy
      </div>
    </a>
    <div class="flex items-center gap-6">
      <button
        data-tally-open="3NQ6pB"
        data-tally-overlay="1"
        class="hidden sm:inline-block rounded-full bg-blue-600 hover:bg-blue-700 hover:text-white font-heading font-bold px-6 py-2 text-base bg-white text-blue-600 transition border-2 border-blue-600 cursor-pointer"
        >Contact us</button
      >
    </div>
  </div>
</nav>

{@render children()}

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


<style>
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.2s ease;
  }
</style>
