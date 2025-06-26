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
      href: "https://purple-moonflower-026.notion.site/Privacy-20194cc9908280c4a2f9dc4e73864328",
      label: "Privacy",
    },
    {
      href: "https://purple-moonflower-026.notion.site/Terms-20194cc990828002a3befb22a94a00a3?pvs=73",
      label: "Terms",
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

<!-- NAVBAR -->
<nav class="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur shadow-md">
  <div class="container mx-auto flex items-center justify-between px-4 py-3">
    <!-- Logo -->
    <a
      href="/"
      class="font-extrabold text-2xl text-blue-700 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
      >Ed & Sy</a
    >
    <!-- Desktop Nav -->
    <div class="hidden md:flex items-center gap-8">
      <a
        href="/"
        class="text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >Home</a
      >
      <a
        href="/#pricing"
        class="text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >Pricing</a
      >
      <a
        href="/#team"
        class="text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >Meet Ed & Sy</a
      >
      <a
        href="/#contact"
        class="text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >Contact</a
      >

      <button
        class="ml-4 bg-blue-600 text-white font-bold text-lg px-6 py-3 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        data-tally-open="3NQ6pB"
        data-tally-overlay="1"
        data-tally-emoji-text="👋"
        data-tally-emoji-animation="wave"
        data-tally-auto-close="3000">Get Started</button
      >
    </div>
    <!-- Mobile Hamburger -->
    <button
      class="md:hidden flex items-center justify-center w-12 h-12 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Open navigation menu"
      onclick={() => (mobileNavOpen = !mobileNavOpen)}
    >
      <span class="sr-only">Open navigation menu</span>
      <svg
        class="w-8 h-8 text-blue-700"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><line x1="3" y1="6" x2="21" y2="6" /><line
          x1="3"
          y1="12"
          x2="21"
          y2="12"
        /><line x1="3" y1="18" x2="21" y2="18" /></svg
      >
    </button>
  </div>
  <!-- Mobile Nav Menu -->
  {#if mobileNavOpen}
    <div class="md:hidden bg-white border-t shadow-lg animate-slide-down pb-4">
      <a
        href="/"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Home</a
      >
      <a
        href="/#pricing"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Pricing</a
      >
      <a
        href="/#team"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Meet Ed & Sy</a
      >
      <a
        href="#contact"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Contact</a
      >
      <button
        data-tally-open="3NQ6pB"
        data-tally-overlay="1"
        data-tally-emoji-text="👋"
        data-tally-emoji-animation="wave"
        data-tally-auto-close="3000"
        class="block px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 mb-4 mx-4 text-center"
        onclick={closeMobileNav}>Get Started</button
      >
    </div>
  {/if}
</nav>

{@render children()}
<button
  data-tally-open="3NQ6pB"
  data-tally-overlay="1"
  data-tally-emoji-text="👋"
  data-tally-emoji-animation="wave"
  data-tally-auto-close="3000"
  class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white text-lg font-bold px-6 py-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
  >Hi!👋</button
>

<footer
  class="w-full py-10 bg-gray-900 border-t text-center text-white text-lg font-sans"
>
  <div class="mb-2 font-bold text-xl">Ed & Sy</div>
  <div class="mb-2">
    &copy; {new Date().getFullYear()} Ed & Sy. All rights reserved.
  </div>
  <nav
    class="flex flex-wrap justify-center gap-4 mt-2 text-base mb-4"
    aria-label="Footer navigation"
  >
    {#each footerLinks as link}
      <a
        href={link.href}
        class="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600"
        >{link.label}</a
      >
    {/each}
  </nav>
  <div class="flex justify-center gap-4">
    {#each socialLinks as s}
      <a
        href={s.href}
        class="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-1"
        aria-label={s.label}
        target="_blank"
        rel="noopener"
      >
        {#if s.icon}
          <s.icon class="w-5 h-5" aria-hidden="true" />
        {/if}
      </a>
    {/each}
  </div>
</footer>

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
