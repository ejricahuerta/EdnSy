<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import ChatbotDemo from "$lib/components/demos/ChatbotDemo.svelte";
  import DataInsightsDemo from "$lib/components/demos/DataInsightsDemo.svelte";
  import DailyTaskDemo from "$lib/components/demos/DailyTaskDemo.svelte";
  import UnifiedDemoChat from "$lib/components/demos/UnifiedDemoChat.svelte";
  let navOpen = false;

  onMount(async () => {
    if (!browser) return;
    
    // Handle OAuth callback
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      console.log('User is authenticated:', session.user.email);
      // You can redirect to a dashboard or specific page here if needed
      // For now, we'll just stay on the main page
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          // Handle successful sign in
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Handle sign out
        }
      }
    );
    
    return () => subscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>AI Automation for Local Businesses | Ed&Sy</title>
  <meta name="description" content="AI automation made simple for non-technical teams and experienced business owners. Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with Ed&Sy's easy-to-use AI tools." />
  <meta property="og:title" content="AI Automation for Local Businesses | Ed&Sy" />
  <meta property="og:description" content="AI automation made simple for non-technical teams and experienced business owners. Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with Ed&Sy's easy-to-use AI tools." />
  <meta property="og:image" content="/logo.png" />
  <meta property="og:url" content="https://ednsy.com" />
  <meta name="twitter:title" content="AI Automation for Local Businesses | Ed&Sy" />
  <meta name="twitter:description" content="AI automation made simple for non-technical teams and experienced business owners. Automate admin, scheduling, lead capture, reviews, marketing, dashboards, and training with Ed&Sy's easy-to-use AI tools." />
  <meta name="twitter:image" content="/logo.png" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <style>
    body,
    .font-sans {
      font-family: "Inter", sans-serif;
    }
    .font-heading,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    button {
      font-family:
        Mona Sans,
        ui-sans-serif,
        system-ui,
        sans-serif,
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji";
    }
    body {
      background: #f4f4f4;
    }
    @keyframes sparkle {
      0%,
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.3) rotate(20deg);
        opacity: 0.7;
      }
    }
    .animate-sparkle {
      animation: sparkle 0.8s ease-in-out;
    }
  </style>
</svelte:head>

<!-- NAVIGATION BAR REMOVED: now in layout -->

{#if navOpen}
  <div
    class="sm:hidden bg-white border-t border-neutral-200 px-6 sm:px-16 pb-4"
  >
    <button
      data-tally-open="3NQ6pB"
      data-tally-overlay="1"
      class="block py-2 text-black font-heading font-semibold cursor-pointer"
      >Contact us</button
    >
  </div>
{/if}

<!-- HERO SECTION -->
<section
  class="max-w-7xl mx-auto px-6 sm:px-16 flex flex-col justify-center h-full min-h-[60vh]"
>
  <div class="relative z-10">
    <h1
      class="font-display text-5xl font-medium tracking-tight text-balance text-neutral-700 sm:text-7xl mb-8"
    >
      AI Automation Made <span class="text-blue-500">Simple</span>
    </h1>
    <p
      class="text-lg sm:text-xl text-neutral-500 text-left max-w-2xl font-sans"
    >
      Automate the tools you already use. Perfect for non-technical teams <span
        class="text-blue-600">&</span
      >
      experienced business owners.
    </p>
    <!--tools icons-->
    <span class="flex gap-4 mt-4">
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-whatsapp.svg"
          alt="WhatsApp"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-telegram-app.svg"
          alt="Telegram"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-facebook-circled.svg"
          alt="Facebook"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img src="/logos/icons8-gmail.svg" alt="Gmail" class="w-10 h-10" />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-google-calendar.svg"
          alt="Google Calendar"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-google-drive.svg"
          alt="Google Drive"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-google-maps.svg"
          alt="Google Maps"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img
          src="/logos/icons8-google-sheets.svg"
          alt="Google Sheets"
          class="w-10 h-10"
        />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
      <span class="relative group inline-block">
        <img src="/logos/icons8-notion.svg" alt="Notion" class="w-10 h-10" />
        <svg
          class="pointer-events-none absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 group-hover:animate-sparkle transition-opacity duration-300"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g>
            <circle cx="12" cy="12" r="2" fill="#FDE68A" />
            <circle cx="6" cy="6" r="1" fill="#FDE68A" />
            <circle cx="18" cy="6" r="1" fill="#FDE68A" />
            <circle cx="6" cy="18" r="1" fill="#FDE68A" />
            <circle cx="18" cy="18" r="1" fill="#FDE68A" />
          </g>
        </svg>
      </span>
    </span>
  </div>
</section>
<!-- Unified chat for mobile only: move here -->
<div class="block sm:hidden m-8">
  <div class="text-center mb-4 px-4">
    <div class="text-xs text-gray-500 italic mt-2">
      Demo Only: This is a simulated chat experience for a Plumbing/HVAC service
      company assistant. No real data or actions are processed.
    </div>
  </div>
  <UnifiedDemoChat />
</div>
<!-- VALUE PROPOSITION SECTION -->
<section
  id="value"
  class=" mx-auto px-6 sm:px-16 min-h-[60vh] bg-slate-900 text-neutral-200 py-16 flex flex-col items-center justify-center"
>
  <h2
    class="font-display text-2xl font-semibold tracking-tight text-balance sm:text-4xl mb-4 text-center"
  >
    Why Partner with Ed <span class="text-blue-600">&</span> Sy?
  </h2>
  <span
    class="rounded-full bg-gradient-to-r from-blue-400 to-blue-200 px-4 py-2 text-neutral-700 font-display font-semibold tracking-tight mb-10 text-center text-sm shadow"
    >Your Success is Our Focus</span
  >
  <div
    class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center items-center justify-between py-10 max-w-7xl mx-auto"
  >
    <div class="flex flex-col items-center py-10">
      <div class="font-display text-6xl sm:text-7xl text-blue-200 mb-2">
        20+ <span class="text-3xl text-neutral-200">hrs</span>
      </div>
      <div class="text-base text-neutral-400">
        Saved per week on daily tasks
      </div>
    </div>
    <div class="flex flex-col items-center py-10">
      <div class="font-display text-6xl sm:text-7xl text-blue-200 mb-2">
        15-30% <span class="text-3xl text-neutral-200">less</span>
      </div>
      <div class="text-base text-neutral-400">Average cost reduction</div>
    </div>
    <div class="flex flex-col items-center py-10">
      <div class="font-display text-6xl sm:text-7xl text-blue-200 mb-2">
        2x <span class="text-3xl text-neutral-200">faster</span>
      </div>
      <div class="text-base text-neutral-400">Decision making</div>
    </div>
  </div>
</section>

<!-- SERVICES SECTION -->
<section id="services" class="mx-auto px-6 sm:px-16 my-20 h-full max-w-7xl">
  <div class="max-w-7xl mx-auto text-center mb-16">
    <h2
      class="font-display text-2xl font-semibold tracking-tight text-balance text-neutral-700 sm:text-4xl mb-4"
    >
      How We Partner For Your Success
    </h2>
    <span
      class="rounded-full bg-gradient-to-r from-blue-400 to-blue-200 px-4 py-2 text-blue-600 font-display font-semibold tracking-tight mb-10 text-center shadow text-sm"
      >Our Solutions</span
    >
  </div>
  <div class="flex flex-col gap-12 mt-4">
    <div class="flex flex-col md:flex-row items-center gap-4">
      <div class="sm:order-2 hidden sm:block">
        <DailyTaskDemo />
      </div>
      <div class="flex-1 p-12 md:p-24">
        <div class="flex items-center gap-3 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-workflow-icon lucide-workflow text-blue-600"
            ><rect width="8" height="8" x="3" y="3" rx="2" /><path
              d="M7 11v4a2 2 0 0 0 2 2h4"
            /><rect width="8" height="8" x="13" y="13" rx="2" /></svg
          >
          <h3
            class="font-display text-2xl font-semibold tracking-wider text-neutral-700"
          >
            Smart Daily Automation
          </h3>
        </div>
        <p class="font-sans text-lg text-neutral-500 leading-loose">
          We put AI into your essential tools. Think smarter customer contacts
          (CRM), automated messages on apps like WhatsApp, <span
            class="text-blue-600">&</span
          >
          helpful website chatbots. We help you streamline tasks
          <span class="text-blue-600">&</span> keep things running smoothly.
        </p>
      </div>
    </div>
    <div class="flex flex-col md:flex-row-reverse items-center gap-4">
      <div class="sm:order-2 hidden sm:block">
        <ChatbotDemo />
      </div>
      <div class="flex-1 p-12 md:p-24">
        <div class="flex items-center gap-3 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-bot-message-square-icon lucide-bot-message-square text-blue-600"
            ><path d="M12 6V2H8" /><path
              d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"
            /><path d="M2 12h2" /><path d="M9 11v2" /><path d="M15 11v2" /><path
              d="M20 12h2"
            /></svg
          >
          <h3
            class="font-display text-2xl font-semibold tracking-wider text-neutral-700"
          >
            Brilliant Customer & Sales Connections
          </h3>
        </div>
        <p class="font-sans text-lg text-neutral-500 leading-loose">
          We set up AI voice helpers <span class="text-blue-600">&</span> smart
          chatbots. They answer questions, guide new customers,
          <span class="text-blue-600">&</span>
          manage all your messages. We ensure you offer instant, outstanding service
          <span class="text-blue-600">&</span> celebrate more sales.
        </p>
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center gap-4">
      <div class="md:order-2 order-2 hidden sm:block">
        <DataInsightsDemo />
      </div>
      <div class="flex-1 p-12 md:p-24">
        <div class="flex items-center gap-3 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-database-zap-icon lucide-database-zap text-blue-600"
            ><ellipse cx="12" cy="5" rx="9" ry="3" /><path
              d="M3 5V19A9 3 0 0 0 15 21.84"
            /><path d="M21 5V8" /><path d="M21 12L18 17H22L19 22" /><path
              d="M3 12A9 3 0 0 0 14.59 14.87"
            /></svg
          >
          <h3
            class="font-display text-2xl font-semibold tracking-wider text-neutral-700"
          >
            Easy Insights from Your Data
          </h3>
        </div>
        <p class="font-sans text-lg text-neutral-500 leading-loose">
          Use our "Data Analytics with Just Prompts" service. Just ask simple
          questions to get valuable info from your business data. We help you
          understand your business better <span class="text-blue-600">&</span> make
          wiser, quicker choices.
        </p>
      </div>
    </div>
    <div class="flex flex-col md:flex-row-reverse items-center gap-4">
      <div class="flex-1 p-12 md:p-24">
        <div class="flex items-center gap-3 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-toy-brick-icon lucide-toy-brick text-blue-600"
            ><rect width="18" height="12" x="3" y="8" rx="1" /><path
              d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"
            /><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3" /></svg
          >
          <h3
            class="font-display text-2xl font-semibold tracking-wider text-neutral-700"
          >
            Custom AI Solutions
          </h3>
        </div>
        <p class="font-sans text-lg text-neutral-500 leading-loose">
          Sometimes, your business needs something unique. We create custom AI
          tools designed specifically for your special needs or challenges. We
          partner with you to build the perfect AI solution, tailor-made for
          your success.
        </p>
      </div>
    </div>
  </div>
</section>
<hr class="my-12 border-neutral-200" />
<!-- TEAM SECTION -->
<section id="team" class="max-w-7xl mx-auto px-6 sm:px-16 my-20">
  <h2
    class="font-display text-2xl font-semibold tracking-tight text-balance text-neutral-700 sm:text-4xl mb-4 text-left"
  >
    Meet Your Growth Partners
  </h2>
  <span
    class="rounded-full bg-gradient-to-r from-blue-400 to-blue-200 px-4 py-2 text-neutral-700 font-display font-semibold tracking-tight mb-10 text-center shadow text-sm mb-4"
    >The Team</span
  >

  <p class="font-sans text-lg text-neutral-500 text-left max-w-2xl my-8">
    Our joy is partnering with businesses like yours to bring you real results.
    We understand your challenges <span class="text-blue-600">&</span> make your
    AI journey easy <span class="text-blue-600">&</span> powerful.
  </p>
  <!-- Team Cards Side by Side -->

  <div class="flex flex-col md:flex-row gap-8 mb-8">
    <!-- Edmel's Team Card -->
    <div class="flex-1 flex flex-col items-center gap-2">
      <img
        src="https://media.licdn.com/dms/image/v2/C4D03AQE0faqui5GEzQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517429424712?e=1753920000&v=beta&t=0VtMz0wg580LRDk1pIc1PbP-SXIpIFQ0gtddI7Qpbhg"
        alt="Edmel Ricahuerta"
        class="w-32 h-32 rounded-full object-cover"
      />
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-display text-2xl font-bold text-neutral-700">
          Edmel Ricahuerta
        </h3>
      </div>
      <span
        class="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded ml-1"
        >Founder / Systems & Technology</span
      >
      <p
        class="font-sans text-neutral-600 leading-relaxed mb-0 text-center mt-4"
      >
        Makes technology simple and reliable for traditional business owners.
      </p>
      <a
        href="https://ca.linkedin.com/in/exricahuerta"
        target="_blank"
        rel="noopener"
        class="text-blue-600 hover:underline text-sm mt-4">LinkedIn</a
      >
    </div>
    <!-- Syron's Team Card -->
    <div class="flex-1 flex flex-col items-center gap-2">
      <img
        src="https://media.licdn.com/dms/image/v2/D5603AQHneUVdF6c2Ig/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675783722369?e=1757548800&v=beta&t=WC4EiDFsUK4OqtdhYl_TumEUGhijXAn4wkfNsbKIr2U"
        alt="Syron Suerte"
        class="w-32 h-32 rounded-full object-cover"
      />
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-display text-2xl font-bold text-neutral-700">
          Syron Suerte
        </h3>
      </div>
      <span
        class="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded ml-1"
        >Founder / Client Success & Support</span
      >
      <p
        class="font-sans text-neutral-600 leading-relaxed mb-0 text-center mt-4"
      >
        Helps business owners save time while maintaining their personal touch
        with customers.
      </p>
      <a
        href="https://www.linkedin.com/in/syronsuerte/"
        target="_blank"
        rel="noopener"
        class="text-blue-600 hover:underline text-sm mt-4">LinkedIn</a
      >
    </div>
  </div>
  <!-- Optionally, add more team member cards here in the future -->
</section>
<hr class="my-12 border-neutral-200" />

<!-- CTA SECTION -->
<section
  id="contact"
  class="flex justify-center items-center my-24 px-6 sm:px-16 max-w-7xl mx-auto"
>
  <div
    class="bg-slate-900 rounded-[2.5rem] px-10 py-14 w-full shadow-lg flex flex-col items-center"
  >
    <h2
      class="font-display text-3xl font-semibold tracking-tight text-balance text-neutral-200 sm:text-5xl mb-6 text-center"
    >
      Ready to Scale Your Business?
    </h2>
    <button
      data-tally-open="3NQ6pB"
      data-tally-overlay="1"
      class="rounded-full bg-white text-blue-600 hover:bg-blue-100 hover:text-blue-600 font-display font-bold px-8 py-3 text-base shadow border-2 border-blue-600 transition mb-2 cursor-pointer"
      >Book a Free Quick Chat</button
    >
    <p class="text-neutral-200 text-sm">🍵 Coffee is on us.</p>
  </div>
</section>
<hr class="my-12 border-neutral-200" />

<!-- Add this section where appropriate in the existing landing page -->
<div class="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8">
  <div class="text-center space-y-4">
    <h3 class="text-2xl font-bold">Experience AI Automation in Action</h3>
    <p class="text-muted-foreground max-w-2xl mx-auto">
      See exactly how AI automation can transform your local business. Try our interactive demos tailored to your industry.
    </p>
    <div class="flex justify-center space-x-4">
      <a href="/demos/onboarding" class="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
        Try Demo Platform
      </a>
      <a href="/demos/catalog" class="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
        View Demo Catalog
      </a>
    </div>
  </div>
</div>

<!-- FOOTER REMOVED: now in layout -->
