<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  // Import shadcn components
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import {
    Users,
    Heart,
    Mountain,
    Calendar,
    Mail,
    Zap,
    FileText,
    Calculator,
    DollarSign,
    MessageSquare,
    Package,
    Clock,
  } from "lucide-svelte";
  import * as Alert from "$lib/components/ui/alert";

  let navOpen = false;

  onMount(() => {
    if (!browser) return;

    const initAuth = async () => {
      // Handle OAuth callback - check for tokens in URL hash
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        // Extract tokens from URL hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken) {
          // Set the session with the tokens
          const {
            data: { session },
            error,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("Error setting session:", error);
          } else if (session) {
            // Redirect to demos page
            goto("/demos");
            return;
          }
        }
      }

      // Handle existing session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        // User is authenticated, stay on main page
      }

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Handle successful sign in
        } else if (event === "SIGNED_OUT") {
          // Handle sign out
        }
      });

      return () => subscription?.unsubscribe();
    };

    initAuth();
  });
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title
    >Get Your Time Back | Ed & Sy - Business Automation for Traditional Owners</title
  >
  <meta
    name="title"
    content="Get Your Time Back | Ed & Sy - Business Automation for Traditional Owners"
  />
  <meta
    name="description"
    content="Stop working 60+ hour weeks. We give traditional business owners 15-20 hours back each week through smart automation. Book your free consultation today."
  />
  <meta
    name="keywords"
    content="business automation, time management, small business automation, Toronto business consultants, AI automation, workflow automation, business efficiency, work-life balance, family time, business optimization, traditional business owners, automation consulting, productivity tools, business process automation, time reclamation, weekend automation, evening automation, business systems, operational efficiency, cost reduction, revenue increase"
  />
  <meta name="author" content="Ed & Sy" />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  <meta name="distribution" content="global" />
  <meta name="rating" content="general" />
  <meta name="theme-color" content="#3B82F6" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ednsy.com/" />
  <meta
    property="og:title"
    content="Get Your Time Back | Ed & Sy - Business Automation for Traditional Owners"
  />
  <meta
    property="og:description"
    content="Stop working 60+ hour weeks. We give traditional business owners 15-20 hours back each week through smart automation. Book your free consultation today."
  />
  <meta property="og:image" content="https://ednsy.com/logo.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta
    property="og:image:alt"
    content="Ed & Sy - Business Automation Services"
  />
  <meta property="og:site_name" content="Ed & Sy" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://ednsy.com/" />
  <meta
    name="twitter:title"
    content="Get Your Time Back | Ed & Sy - Business Automation for Traditional Owners"
  />
  <meta
    name="twitter:description"
    content="Stop working 60+ hour weeks. We give traditional business owners 15-20 hours back each week through smart automation. Book your free consultation today."
  />
  <meta name="twitter:image" content="https://ednsy.com/logo.png" />
  <meta
    name="twitter:image:alt"
    content="Ed & Sy - Business Automation Services"
  />

  <!-- Additional SEO Meta Tags -->
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  <meta name="format-detection" content="telephone=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Ed & Sy" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://ednsy.com/" />

  <!-- Favicon and App Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Preconnect to external domains for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link rel="preconnect" href="https://www.google-analytics.com" />
  <link rel="preconnect" href="https://www.googletagmanager.com" />

  <!-- DNS Prefetch for performance -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  <link rel="dns-prefetch" href="//www.google-analytics.com" />
  <link rel="dns-prefetch" href="//www.googletagmanager.com" />

  <!-- Fonts with display=swap for performance -->
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />

  <!-- Structured Data for Local Business -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Ed & Sy",
      "url": "https://ednsy.com",
      "logo": "https://ednsy.com/logo.png",
      "image": "https://ednsy.com/logo.png",
      "description": "Ed & Sy helps traditional business owners automate their operations to reclaim 15-20 hours per week. We specialize in business automation, workflow optimization, and time management for small to medium businesses.",
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
          "areaServed": "CA",
          "availableLanguage": "English"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/dev.exd/",
        "https://www.linkedin.com/in/syronsuerte/"
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 43.6532,
          "longitude": -79.3832
        },
        "geoRadius": "50000"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Business Automation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Business Process Automation",
              "description": "Automate repetitive tasks and workflows to save 15-20 hours per week"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Workflow Optimization",
              "description": "Streamline business operations for increased efficiency and cost reduction"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Time Management Consulting",
              "description": "Help business owners reclaim their time for family and personal activities"
            }
          }
        ]
      }
    }
  </script>

  <!-- Structured Data for Organization -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ed & Sy",
      "url": "https://ednsy.com",
      "logo": "https://ednsy.com/logo.png",
      "description": "Business automation consultants helping traditional business owners reclaim their time through smart automation solutions.",
      "foundingDate": "2025",
      "founder": [
        {
          "@type": "Person",
          "name": "Ed",
          "jobTitle": "Systems Specialist"
        },
        {
          "@type": "Person",
          "name": "Sy",
          "jobTitle": "Implementation Specialist"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "addressCountry": "CA"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "hello@ednsy.com",
        "contactType": "customer service"
      }
    }
  </script>

  <!-- Structured Data for WebPage -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Get Your Time Back | Ed & Sy",
      "description": "Stop working 60+ hour weeks. We give traditional business owners 15-20 hours back each week through smart automation. Book your free consultation today.",
      "url": "https://ednsy.com/",
      "mainEntity": {
        "@type": "Service",
        "name": "Business Automation Services",
        "description": "Comprehensive business automation solutions that help traditional business owners reclaim 15-20 hours per week through smart workflow optimization and process automation.",
        "provider": {
          "@type": "Organization",
          "name": "Ed & Sy"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Canada"
        },
        "serviceType": "Business Automation",
        "offers": {
          "@type": "Offer",
          "description": "Free 30-minute consultation to discuss your business automation needs",
          "price": "0",
          "priceCurrency": "CAD"
        }
      }
    }
  </script>

  <!-- Structured Data for FAQ -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much time can I save with Ed & Sy automation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our clients typically save 15-20 hours per week through our business automation services, allowing them to focus on what they love and spend more time with family."
          }
        },
        {
          "@type": "Question",
          "name": "What types of businesses do you work with?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We work with traditional business owners who are tired of working 60+ hour weeks. Our automation solutions are designed for non-technical teams and older business owners who want to reclaim their time."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to change my existing tools?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, we integrate with your existing tools like Google Calendar, WhatsApp, Telegram, Notion, Facebook, Stripe, Google Maps, Google Sheets, Google Drive, and Gmail."
          }
        }
      ]
    }
  </script>

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
      font-family: Mona Sans, ui-sans-serif, system-ui, sans-serif,
        "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
        "Noto Color Emoji";
    }
    body {
      background: #f4f4f4;
    }

    /* Background image styles are now in app.css for responsive optimization */

    .team-bg {
      background-image: url("/imgs/hero-bg.webp"), url("/imgs/hero-bg.jpg");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }

    .team-bg::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1;
    }

    /* Scrolling animation for logos */
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    .animate-scroll {
      animation: scroll 30s linear infinite;
    }

    /* Pause animation on hover */
    .animate-scroll:hover {
      animation-play-state: paused;
    }
  </style>
</svelte:head>

<!-- NAVIGATION BAR REMOVED: now in layout -->

{#if navOpen}
  <div
    class="sm:hidden bg-white border-t border-neutral-200 px-6 sm:px-16 pb-4"
  >
    <Button
      data-tally-open="3NQ6pB"
      data-tally-overlay="1"
      variant="ghost"
      class="w-full justify-start p-2 text-black font-heading font-semibold cursor-pointer"
    >
      Contact us
    </Button>
  </div>
{/if}

<!-- HERO SECTION - Focus on Time Reclamation -->
<section
  class="min-h-screen flex items-center justify-center hero-bg bg-gray-900"
  role="banner"
  aria-label="Hero section - Get your time back"
>
  <div class="relative z-10 px-8 sm:px-16 w-full">
    <div class="text-left max-w-4xl">
      <h1
        class="font-display text-4xl sm:text-6xl md:text-8xl font-medium tracking-tight text-white mb-6 sm:mb-4 drop-shadow-lg text-center sm:text-left mt-10 sm:mt-0"
      >
        We give you<br class="hidden sm:block" /><span
          class="italic ml-2 sm:ml-0">time</span
        >
      </h1>

      <p
        class="text-md sm:text-lg text-white/80 text-left max-w-2xl font-sans mb-8 sm:mb-10 drop-shadow-md"
        role="doc-subtitle"
      >
        From emails to invoices, our AI powered solutions scales your business
        while you focus on what really matters.
      </p>

      <button
        onclick={() => {
          if ($page.data.user) {
            goto("/demos");
          } else {
            goto("/login");
          }
        }}
        class="bg-white text-blue-900 hover:bg-gray-100 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg mb-8 sm:mb-10 cursor-pointer hover:scale-105 transition-all duration-300"
      >
        How It Works →
      </button>

      <!-- Key Statistics - Better mobile layout -->
      <div
        class="grid grid-cols-1 sm:flex sm:flex-row gap-6 sm:gap-8 items-start mb-0 sm:mb-12"
      >
        <div class="text-left">
          <div
            class="font-display text-2xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md"
          >
            20+
          </div>
          <div class="text-sm text-white/80 drop-shadow-sm">
            Hours reclaimed <br class="block sm:hidden" /> weekly
          </div>
        </div>
        <div class="hidden sm:block w-px h-12 bg-white bg-opacity-30" />
        <div class="text-left">
          <div
            class="font-display text-2xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md"
          >
            40%
          </div>
          <div class="text-sm text-white/80 drop-shadow-sm">
            Operational cost <br class="block sm:hidden" /> reduction
          </div>
        </div>
        <div class="hidden sm:block w-px h-12 bg-white bg-opacity-30" />
        <div class="text-left">
          <div
            class="font-display text-2xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-md"
          >
            30%
          </div>
          <div class="text-sm text-white/80 drop-shadow-sm">
            Revenue <br class="block sm:hidden" /> increase
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- VALUE PROPOSITION SECTION - Work-Life Balance Focus -->
<section
  id="value"
  class="mx-auto max-w-7xl py-20"
  role="region"
  aria-label="Value proposition"
>
  <div class=" mx-auto">
    <div class="text-center my-16">
      <h2
        class="font-display text-3xl font-semibold tracking-tight text-balance text-neutral-700 sm:text-5xl mb-6"
      >
        Scale Your Business <br class="hidden sm:block" />
      </h2>
      <p class="text-lg sm:text-xl leading-relaxed text-neutral-700">
        Reclaim Your Nights <span class="text-primary">&</span> Weekends
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <!-- Family Game Nights Card - Left Aligned -->
      <section
        class="min-h-[90vh] sm:min-h-[60vh] flex items-center justify-center relative game-nights-bg m-4"
      >
        <div class="relative z-10 px-8 sm:px-16 w-full">
          <div
            class="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12"
          >
            <!-- Text Content -->
            <div class="text-center sm:text-left max-w-2xl lg:max-w-xl">
              <h3
                class="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-8 drop-shadow-lg"
              >
                From chaos to game nights
              </h3>
              <p
                class="text-lg sm:text-xl text-white/80 leading-relaxed drop-shadow-md"
              >
                Instead of <span
                  class="line-through decoration-red-500 decoration-1"
                  >late nights at your desk</span
                >, you're rolling dice with your kids
                <span class="text-primary">&</span> laughing with your partner
              </p>

              <!-- Try Now Link -->
              <div class="mt-8">
                <button
                  onclick={() => {
                    if ($page.data.user) {
                      goto("/demos");
                    } else {
                      goto("/login");
                    }
                  }}
                  class="text-white/90 hover:text-white transition-colors duration-200 cursor-pointer decoration-white/30 hover:underline"
                >
                  Try Now →
                </button>
              </div>
            </div>

            <!-- Desktop alerts - positioned on right -->
            <div class="hidden lg:block space-y-3 max-w-xs">
              <small
                class="text-white/80 text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Calendar class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Smart Scheduling</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Auto-manage your calendar & meetings</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Mail class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Inbox Automation</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Replies & follow-ups handled</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Zap class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Workflow Tools</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Daily tasks streamlined, just the way you like</Alert.Description
                >
              </Alert.Root>
            </div>

            <!-- Mobile alerts - below text -->
            <div class="mt-8 space-y-3 lg:hidden w-full">
              <small
                class="text-white text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Calendar class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Smart Scheduling</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Auto-manage your calendar & meetings</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Mail class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Inbox Automation</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Replies & follow-ups handled</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Zap class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Workflow Tools</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Daily tasks streamlined, just the way you like</Alert.Description
                >
              </Alert.Root>
            </div>
          </div>
        </div>
      </section>

      <section
        class="min-h-[90vh] sm:min-h-[60vh] flex items-center justify-center relative creative-hobbies-bg"
      >
        <div class="relative z-10 px-8 sm:px-16 w-full">
          <div
            class="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12"
          >
            <!-- Text Content -->
            <div class="text-center sm:text-left max-w-2xl lg:max-w-xl">
              <h3
                class="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-8 drop-shadow-lg"
              >
                From invoices to inspiration
              </h3>
              <p
                class="text-lg sm:text-xl text-white/80 leading-relaxed drop-shadow-md"
              >
                Picture yourself no longer <span
                  class="line-through decoration-red-500 decoration-1"
                  >manually processing invoices</span
                >. Instead, you're immersed in creative hobbies that bring deep
                fulfillment.
              </p>

              <!-- Try Now Link -->
              <div class="mt-8">
                <button
                  onclick={() => {
                    if ($page.data.user) {
                      goto("/demos");
                    } else {
                      goto("/login");
                    }
                  }}
                  class="text-white/90 hover:text-white transition-colors duration-200 cursor-pointer decoration-white/30 hover:underline"
                >
                  Try Now →
                </button>
              </div>
            </div>

            <!-- Desktop alerts - positioned on right -->
            <div class="hidden lg:block space-y-3 max-w-xs">
              <small
                class="text-white/80 text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >

              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <DollarSign class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Accounting Automation</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Peace of mind without the spreadsheets</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <FileText class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Billing Workflows</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Invoices sent & tracked without lifting a finger</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Calculator class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Reconciliations</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Real-time financial syncing</Alert.Description
                >
              </Alert.Root>
            </div>

            <!-- Mobile alerts - below text -->
            <div class="mt-8 space-y-3 lg:hidden w-full">
              <small
                class="text-white text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >

              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <DollarSign class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Accounting Automation</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Peace of mind without the spreadsheets</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <FileText class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Billing Workflows</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Invoices sent & tracked without lifting a finger</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Calculator class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Reconciliations</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Real-time financial syncing</Alert.Description
                >
              </Alert.Root>
            </div>
          </div>
        </div>
      </section>

      <!-- Outdoor Adventures Card - Left Aligned -->
      <section
        class="min-h-[90vh] sm:min-h-[60vh] flex items-center justify-center relative outdoor-activities-bg"
      >
        <div class="relative z-10 px-8 sm:px-16 w-full">
          <div
            class="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12"
          >
            <!-- Text Content -->
            <div class="text-center sm:text-left max-w-2xl lg:max-w-xl">
              <h3
                class="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-8 drop-shadow-lg"
              >
                Your weekend should be yours
              </h3>
              <p
                class="text-lg sm:text-xl text-white/80 leading-relaxed drop-shadow-md"
              >
                Imagine skipping the Sunday <span
                  class="line-through decoration-red-500 decoration-1"
                  >stress</span
                > and heading out for adventure, coaching your kid's team, or doing
                nothing at all
              </p>

              <!-- Try Now Link -->
              <div class="mt-8">
                <button
                  onclick={() => {
                    if ($page.data.user) {
                      goto("/demos");
                    } else {
                      goto("/login");
                    }
                  }}
                  class="text-white/90 hover:text-white transition-colors duration-200 cursor-pointer decoration-white/30 hover:underline"
                >
                  Try Now →
                </button>
              </div>
            </div>

            <!-- Desktop alerts - positioned on right -->
            <div class="hidden lg:block space-y-3 max-w-xs">
              <small
                class="text-white text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <MessageSquare class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Lead Follow-Ups</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Personalized outreach</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Package class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >24/7 Customer Care</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >AI powered support</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Clock class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Business AI Assistant</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Handles your business while you live life</Alert.Description
                >
              </Alert.Root>
            </div>

            <!-- Mobile alerts - below text -->
            <div class="mt-8 space-y-3 lg:hidden w-full">
              <small
                class="text-white text-xs text-center italic w-full block mb-2"
                >We make it happen with</small
              >
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <MessageSquare class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Lead Follow-Ups</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Personalized outreach</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Package class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >24/7 Customer Care</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >AI powered support</Alert.Description
                >
              </Alert.Root>
              <Alert.Root
                class="bg-white/10 backdrop-blur-sm border-white/20 text-left"
              >
                <Clock class="w-4 h-4 text-blue-900" />
                <Alert.Title class="text-white text-sm font-semibold text-left"
                  >Business AI Assistant</Alert.Title
                >
                <Alert.Description class="text-white/80 text-xs text-left"
                  >Handles your business while you live life</Alert.Description
                >
              </Alert.Root>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</section>

<!-- TEAM SECTION - Ed & Sy -->
<section
  id="team"
  class="mx-auto px-6 sm:px-16 my-20"
  role="region"
  aria-label="About our team"
>
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Section - Text Content -->
      <div class="space-y-6">
        <h2
          class="font-display text-4xl sm:text-5xl font-bold text-neutral-700"
        >
          We’re Ed <span class="text-primary">&</span> Sy.
        </h2>
        <p class="text-lg text-neutral-500 leading-relaxed italic">
          Not your average tech bros.
        </p>

        <div class="space-y-4 text-lg text-neutral-500 leading-relaxed">
          <p>
            We started this because we saw incredible business owners burning
            out over basics. <span class="text-primary">Ed</span>’s a system
            architect. <span class="text-primary">Sy</span>’s an operations
            expert. Together, we turn clunky routines into smooth flows with
            practical AI.
          </p>

          <p>
            We live in Toronto. We work with businesses everywhere. We
            understand the hustle, <span class="text-primary">&</span> we know there's
            a better way.
          </p>
        </div>
      </div>

      <!-- Right Section - Profile Cards -->
      <div class="flex flex-col sm:flex-row gap-6">
        <!-- Ed's Card -->
        <Card.Root
          class="flex-1 bg-transparent border-0 shadow-none hover:shadow-lg transition-all duration-200"
        >
          <Card.Content class="flex flex-col items-center gap-4 p-6">
            <Avatar class="w-20 h-20">
              <AvatarImage
                src="https://media.licdn.com/dms/image/v2/C4D03AQE0faqui5GEzQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517429424696?e=1756944000&v=beta&t=oLdLFrISryQuP6SYIKEhFeVNsSsw8yzhUlKn2wfcL0A"
                alt="Ed"
              />
              <AvatarFallback>E</AvatarFallback>
            </Avatar>
            <div class="text-center">
              <h3 class="font-display text-xl font-bold text-neutral-700">
                Ed
              </h3>
              <p class="text-sm text-neutral-500 mt-1">Systems</p>
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Sy's Card -->
        <Card.Root
          class="flex-1 bg-transparent border-0 shadow-none hover:shadow-lg transition-all duration-200"
        >
          <Card.Content class="flex flex-col items-center gap-4 p-6">
            <Avatar class="w-20 h-20">
              <AvatarImage
                src="https://media.licdn.com/dms/image/v2/D5603AQHneUVdF6c2Ig/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1675783722369?e=1757548800&v=beta&t=WC4EiDFsUK4OqtdhYl_TumEUGhijXAn4wkfNsbKIr2U"
                alt="Sy"
              />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div class="text-center">
              <h3 class="font-display text-xl font-bold text-neutral-700">
                Sy
              </h3>
              <p class="text-sm text-neutral-500 mt-1">Implementation</p>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </div>
</section>

<!-- LOGOS SECTION - We Work With Your Existing Tools -->
<section
  class="mx-auto px-6 sm:px-16 py-32 bg-slate-100"
  role="region"
  aria-label="Integration partners"
>
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <h2
        class="font-display text-3xl sm:text-4xl font-bold text-neutral-700 mb-4"
      >
        We Work With Your Existing Tools
      </h2>
      <p class="text-lg text-neutral-500 max-w-2xl mx-auto">
        No need to change your workflow. We integrate with the tools you already
        use.
      </p>
    </div>

    <!-- Scrolling Logos Container -->
    <div class="relative overflow-hidden">
      <div class="flex animate-scroll space-x-16">
        <!-- Logo items - duplicated for seamless scrolling -->
        <div class="flex space-x-16 flex-shrink-0">
          <img
            src="/logos/icons8-google-calendar.svg"
            alt="Google Calendar"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-whatsapp.svg"
            alt="WhatsApp"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-telegram-app.svg"
            alt="Telegram"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-notion.svg"
            alt="Notion"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-facebook-circled.svg"
            alt="Facebook"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/stripe.png"
            alt="Stripe"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-maps.svg"
            alt="Google Maps"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-sheets.svg"
            alt="Google Sheets"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-drive.svg"
            alt="Google Drive"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-gmail.svg"
            alt="Gmail"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
        <!-- Duplicate for seamless loop -->
        <div class="flex space-x-16 flex-shrink-0">
          <img
            src="/logos/icons8-google-calendar.svg"
            alt="Google Calendar"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-whatsapp.svg"
            alt="WhatsApp"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-telegram-app.svg"
            alt="Telegram"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-notion.svg"
            alt="Notion"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-facebook-circled.svg"
            alt="Facebook"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/stripe.png"
            alt="Stripe"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-maps.svg"
            alt="Google Maps"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-sheets.svg"
            alt="Google Sheets"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-google-drive.svg"
            alt="Google Drive"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
          <img
            src="/logos/icons8-gmail.svg"
            alt="Gmail"
            class="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA SECTION - Simple and Direct -->
<section
  id="contact"
  class="flex justify-center items-center my-24 px-6 sm:px-16 mx-auto"
  role="region"
  aria-label="Contact us"
>
  <Card.Root class="bg-blue-900 border-0 shadow-xl w-full">
    <Card.Content class="px-10 py-16 flex flex-col items-center text-center">
      <h2
        class="font-display text-3xl font-semibold tracking-tight text-balance text-white/90 sm:text-5xl mb-6"
      >
        Ready to reclaim your time?
      </h2>
      <p class="text-white/60 text-lg mb-8 max-w-2xl">
        Join founders who've already reclaimed their evenings, weekends, and
        sanity with Ed & Sy.
      </p>
      <Button
        data-tally-open="3NQ6pB"
        data-tally-overlay="1"
        variant="secondary"
        size="lg"
        class="bg-white text-blue-900 hover:bg-gray-100 font-bold text-xl rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer hover:shadow-xl px-6 sm:px-10 py-4 sm:py-6"
      >
        Partner with us →
      </Button>
      <small class="text-white/60 text-sm mt-6"
        >Book a free 30-min consultation. No obligation, just impact.</small
      >
    </Card.Content>
  </Card.Root>
</section>

<Separator class="my-12" />
