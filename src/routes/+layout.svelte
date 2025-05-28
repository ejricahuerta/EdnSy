<script lang="ts">
  import { goto } from "$app/navigation";
  import "../app.css";
  import { Star, Users } from "@lucide/svelte";

  let { children } = $props();
  let mobileNavOpen = $state(false);
  function closeMobileNav() {
    mobileNavOpen = false;
  }
  // Footer links
  const footerLinks = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
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
    <div class="md:hidden bg-white border-t shadow-lg animate-slide-down">
      <a
        href="#"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Home</a
      >
      <a
        href="#pricing"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Pricing</a
      >
      <a
        href="#team"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Meet Ed & Sy</a
      >
      <a
        href="#contact"
        class="block px-8 py-4 text-lg font-semibold text-gray-700 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={closeMobileNav}>Contact</a
      >
      <a
        href="/signup"
        class="block px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 mb-4 mx-4 text-center"
        onclick={closeMobileNav}>Get Started</a
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
  role="contentinfo"
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
        <svelte:component this={s.icon} class="w-5 h-5" aria-hidden="true" />
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
