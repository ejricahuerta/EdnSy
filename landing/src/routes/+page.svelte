<script lang="ts">
  // Import icons as needed (Lucide or custom SVGs)
  import {
    Github,
    Zap,
    ShieldCheck,
    Code2,
    Repeat,
    Globe,
    MessageCircle,
    Layers,
    Settings2,
    Calendar,
    Star,
    User,
    Mail,
    Linkedin,
    Plus,
    MapPin,
    Users,
  } from "@lucide/svelte";

  import * as Carousel from "$lib/components/ui/carousel";
  import * as Card from "$lib/components/ui/card";

  // Trust logos (replace with your own or use placeholders)
  const trustLogos = [
    { src: "/logos/google.svg", alt: "Google" },
    { src: "/logos/stripe.svg", alt: "Stripe" },
    { src: "/logos/airbnb.svg", alt: "Airbnb" },
    { src: "/logos/uber.svg", alt: "Uber" },
    { src: "/logos/shopify.svg", alt: "Shopify" },
    { src: "/logos/gmail.svg", alt: "Gmail" },
  ];
  // Feature highlights
  const features = [
    {
      icon: Zap,
      title: "No-code automation",
      desc: "Build automations visually, no coding required.",
    },
    {
      icon: ShieldCheck,
      title: "Open source & secure",
      desc: "Self-host or use our cloud. SOC 2 Type II compliant.",
    },
    {
      icon: Code2,
      title: "AI-powered builder",
      desc: "Let AI write code for you and unlock new automation potential.",
    },
    {
      icon: Repeat,
      title: "Reliable execution",
      desc: "Auto-retry, versioning, and solid reliability for your flows.",
    },
    {
      icon: Layers,
      title: "Management tools",
      desc: "Whitelabel, hide pieces, custom templates, and more.",
    },
  ];
  // Logic/AI blocks
  const logicBlocks = [
    {
      icon: Settings2,
      title: "If-this-then-that logic",
      desc: "Add logic blocks to make powerful automations.",
    },
    {
      icon: Code2,
      title: "AI code generation",
      desc: "Let the AI write code for you to unlock all the automation potential.",
    },
    {
      icon: Repeat,
      title: "Repeat actions",
      desc: "Repeat your actions for each item in a list.",
    },
    {
      icon: Globe,
      title: "Multi-language support",
      desc: "Switch the builder to one of the many languages it can speak.",
    },
  ];
  // Integrations (replace with your own or use placeholders)
  const integrations = [
    { src: "/logos/gmail.svg", alt: "Gmail" },
    { src: "/logos/slack.svg", alt: "Slack" },
    { src: "/logos/openai.svg", alt: "OpenAI" },
    { src: "/logos/dropbox.svg", alt: "Dropbox" },
    { src: "/logos/monday.svg", alt: "Monday.com" },
    { src: "/logos/hubspot.svg", alt: "HubSpot" },
    { src: "/logos/linear.svg", alt: "Linear" },
    { src: "/logos/sharepoint.svg", alt: "SharePoint" },
  ];
  // Core benefits
  const benefits = [
    {
      icon: Calendar,
      title: "Never Miss a Client",
      desc: "Automated reminders and follow-ups keep your schedule full.",
    },
    {
      icon: Star,
      title: "Save Hours Every Week",
      desc: "No more manual follow-ups or admin work.",
    },
    {
      icon: MessageCircle,
      title: "Keep It Personal",
      desc: "Messages sound like you, not a robot.",
    },
    {
      icon: Users,
      title: "Works With Your Favorite Apps",
      desc: "Integrates with WhatsApp, Google Calendar, Gmail, and more.",
    },
  ];
  // How it works steps
  const flowSteps = [
    {
      icon: "✅",
      title: "Connect Existing Tools",
      desc: "Connect your Google Calendar, Gmail, WhatsApp, and SMS no new apps needed.",
    },
    {
      icon: "🤖",
      title: "Automate Repetitive Tasks",
      desc: "Let Ed & Sy handle reminders, follow-ups, and client messages automatically.",
    },
    {
      icon: "📦",
      title: "Lightweight, No-Code Setup",
      desc: "Get started fast with a simple, no-code setup for any business.",
    },
    {
      icon: "💼",
      title: "Continuous Engagement",
      desc: "Messages go out at the perfect time after calls, appointments, or invoices.",
    },
    {
      icon: "🧠",
      title: "Human-like Communication",
      desc: "Clients get friendly, personalized messages that feel human, not robotic.",
    },
  ];
  // Testimonials
  const testimonials = [
    {
      name: "Jane D.",
      company: "Salon Owner",
      img: "/avatars/jane.png",
      quote:
        "Ed & Sy made my business run smoother than ever. I never worry about missed appointments!",
    },
    {
      name: "Mike P.",
      company: "Plumber",
      img: "/avatars/mike.png",
      quote: "I save hours every week and my customers love the reminders.",
    },
    {
      name: "Lisa T.",
      company: "Tutor",
      img: "/avatars/lisa.png",
      quote: "The setup was easy and now I can focus on teaching, not admin.",
    },
  ];
  // Pricing plans (monthly and yearly, always show per month, yearly = discounted per month, 1 year commitment)
  const plans = [
    {
      name: "Time Saver",
      monthly: 199,
      yearly: 129, // $100 off per month for yearly commitment
      setupMonthly: 199,
      setupYearly: 149,
      features: [
        "Auto reminders (appts, payments)",
        "Customer check-ins",
        "Review requests",
        "Connect 3 tools",
        "Personal setup",
      ],
      highlight: false,
    },
    {
      name: "Growth Booster",
      monthly: 399,
      yearly: 299, // $100 off per month for yearly commitment
      setupMonthly: 299,
      setupYearly: 249,
      features: [
        "Up to 7 automations",
        "All Time Saver features",
        "Personalized messages",
        "Connect 5 tools",
        "Priority support",
        "Quarterly strategy calls",
        "Progress reports",
      ],
      highlight: true,
    },
    {
      name: "Business Transformer",
      monthly: 699,
      yearly: 599, // $100 off per month for yearly commitment
      setupMonthly: 699,
      setupYearly: 599,
      features: [
        "Unlimited automations",
        "All Growth Booster features",
        "Custom AI workflows",
        "Unlimited tool connections",
        "Dedicated AI partner",
        "Monthly strategy sessions",
        "Performance reviews",
      ],
      highlight: false,
    },
  ];
  let billingPeriod: "monthly" | "yearly" = "monthly";

  function formatPrice(amount: number) {
    return `$${amount.toLocaleString()}`;
  }

  import { scatteredAppLogos } from "$lib/app-logos";
  import { onMount, onDestroy, tick } from "svelte";

  // Scatter logos randomly within the hero area, no overlap, random each load
  const containerSize = 400; // px (for both width and height)
  const logoSize = 48; // px (w-12/h-12)
  const logoGap = 20; // px, extra space between logos for touch targets
  const centerRadius = 96; // px, keep center clear for blur
  const minRadius = centerRadius + 10; // px, minimum distance from center
  const maxRadius = containerSize / 2 - logoSize / 2 - 10; // px, max from center

  function polarToXY(angle: number, radius: number, center: number) {
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  }

  function isLogoOverlapping(
    newLogo: { x: number; y: number },
    placed: { x: number; y: number }[]
  ) {
    for (const p of placed) {
      const dx = newLogo.x - p.x;
      const dy = newLogo.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < logoSize + logoGap) return true;
    }
    return false;
  }

  function generateLogoScatterPositions(count: number) {
    const center = containerSize / 2;
    const placed = [];
    const positions = [];
    for (let i = 0; i < count; i++) {
      let tries = 0;
      let pos;
      do {
        const angle = Math.random() * 2 * Math.PI;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        pos = polarToXY(angle, radius, center);
        tries++;
      } while (isLogoOverlapping(pos, placed) && tries < 50);
      placed.push(pos);
      positions.push(pos);
    }
    return positions;
  }

  let logoScatterPositions = generateLogoScatterPositions(
    scatteredAppLogos.length
  );

  function getLogoScatterStyle(i: number) {
    const pos = logoScatterPositions[i];
    if (!pos) return "display: none;";
    return `left: ${pos.x - logoSize / 2}px; top: ${pos.y - logoSize / 2}px;`;
  }

  let wandRef: HTMLSpanElement | null = null;
  let containerRef: HTMLDivElement | null = null;
  let wandCenter = { x: 0, y: 0 };

  let wandResizeObserver: ResizeObserver;
  let containerResizeObserver: ResizeObserver;

  function updateWandCenter() {
    if (wandRef && containerRef) {
      const wandRect = wandRef.getBoundingClientRect();
      const containerRect = containerRef.getBoundingClientRect();
      wandCenter.x = wandRect.left + wandRect.width / 2 - containerRect.left;
      wandCenter.y = wandRect.top + wandRect.height / 2 - containerRect.top;
    }
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      updateWandCenter();
      if (wandRef) {
        wandResizeObserver = new ResizeObserver(updateWandCenter);
        wandResizeObserver.observe(wandRef);
      }
      if (containerRef) {
        containerResizeObserver = new ResizeObserver(updateWandCenter);
        containerResizeObserver.observe(containerRef);
      }
      window.addEventListener("resize", updateWandCenter);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      if (wandResizeObserver && wandRef) wandResizeObserver.unobserve(wandRef);
      if (containerResizeObserver && containerRef)
        containerResizeObserver.unobserve(containerRef);
      window.removeEventListener("resize", updateWandCenter);
    }
  });

  // Arrange logos in a ring around the wand, but randomize their order and starting angle each load
  function shuffleArray<T>(array: T[]): T[] {
    // Fisher-Yates shuffle
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const logoRingRadius = 110; // px, distance from center
  const logoCount = scatteredAppLogos.length;
  const shuffledLogos = shuffleArray(scatteredAppLogos);
  const startAngle = Math.random() * 2 * Math.PI;

  function getLogoRingStyle(i: number) {
    const angle = startAngle + (2 * Math.PI * i) / logoCount;
    const center = 160; // px (half of 320px container height)
    const x = center + Math.cos(angle) * logoRingRadius;
    const y = center + Math.sin(angle) * logoRingRadius;
    return `left: ${x - 24}px; top: ${y - 24}px;`;
  }

  const phrases = [
    "automation easy",
    "growth simple",
    "tasks effortless",
    "success automatic",
  ];
  let phraseIndex = 0;
  let typedPhrase = "";
  let typing = true;
  let intervalId: any;

  async function typePhrase(phrase: string) {
    for (let i = 0; i <= phrase.length; i++) {
      typedPhrase = phrase.slice(0, i);
      await tick();
      await new Promise((r) => setTimeout(r, 48));
    }
    await new Promise((r) => setTimeout(r, 2400));
    for (let i = phrase.length; i >= 0; i--) {
      typedPhrase = phrase.slice(0, i);
      await tick();
      await new Promise((r) => setTimeout(r, 24));
    }
  }

  onMount(async () => {
    while (true) {
      await typePhrase(phrases[phraseIndex]);
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  });

  let currentStep = 0;
</script>

<!-- Add top padding to first section so content is not hidden behind navbar -->
<section
  class="pt-28 bg-gradient-to-br from-blue-600 to-purple-500 text-white py-20 pt-40"
>
  <div class="container mx-auto flex flex-col md:flex-row gap-10 px-4">
    <div class="flex-1 text-center md:text-left">
      <h1 class="text-5xl font-extrabold mb-6">AI Automation Made Simple</h1>
      <div class="text-xl mb-6 text-left">
        <span class="font-bold text-white"
          >Make business <span
            class="sm:inline-block text-white font-bold bg-green-500 bg-opacity-90 px-2 py-1 rounded"
            >{typedPhrase}<span class="blinking-cursor">|</span></span
          ></span
        >
        <div class="my-3"></div>
        <span class="block mb-6 text-base md:text-xl"
          >Automate the tools you already use. Perfect for non-technical teams
          and experienced business owners.</span
        >
      </div>
      <div
        class="flex flex-col sm:flex-row gap-6 justify-center md:justify-start"
      >
        <button
          data-tally-open="3NQ6pB"
          data-tally-overlay="1"
          data-tally-emoji-text="👋"
          data-tally-emoji-animation="wave"
          data-tally-auto-close="3000"
          class="btn btn-primary bg-white text-blue-700 font-bold px-8 py-4 rounded-lg shadow hover:bg-blue-100 transition"
        >
          Get Started Free
        </button>
        <a
          href="/#how-it-works"
          class="btn btn-outline border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition"
          >See How It Works</a
        >
      </div>
    </div>
    <div class="flex-1 flex items-center justify-center">
      <div class="relative w-80 h-80">
        <span
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-60 blur-2xl"
        ></span>
        <!-- SVG lines connecting each logo to each other, behind the logos -->
        <svg
          class="absolute left-0 top-0 w-80 h-80 pointer-events-none"
          width="320"
          height="320"
          style="z-index:1;"
          fill="none"
        >
          {#each scatteredAppLogos as _, i}
            {#each scatteredAppLogos as __, j}
              {#if i < j}
                {#if logoScatterPositions[i] && logoScatterPositions[j]}
                  <line
                    x1={logoScatterPositions[i].x}
                    y1={logoScatterPositions[i].y}
                    x2={logoScatterPositions[j].x}
                    y2={logoScatterPositions[j].y}
                    stroke="#fff"
                    stroke-opacity="0.18"
                    stroke-width="1"
                    stroke-dasharray="4 4"
                  />
                {/if}
              {/if}
            {/each}
          {/each}
        </svg>
        {#each scatteredAppLogos as logo, i}
          <img
            src={logo.src}
            alt={logo.alt}
            class="absolute w-12 h-12"
            style={getLogoScatterStyle(i)}
          />
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS SECTION -->
<section
  id="how-it-works"
  class="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
>
  <div class="w-full flex flex-col h-full max-h-full">
    <div class="pt-12 pb-6">
      <h2 class="text-5xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-500 to-pink-500 tracking-tight">
        Your Automation Journey
      </h2>
      <p class="text-xl text-center text-gray-700 max-w-3xl mx-auto mb-0">
        Transform your business step by step. Each phase delivers real results quickly.
      </p>
    </div>
    <div
      class="flex-1 grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-2 md:gap-4 px-4 md:px-12 max-w-none overflow-y-auto"
      style="min-height:0;"
    >
      <!-- Phase 1 -->
      <div class="flex flex-col justify-between bg-white/70 p-8 group relative z-10">
        <h3 class="text-2xl font-bold mb-2 text-blue-800">Foundation and Quick Wins</h3>
        <div class="text-sm text-blue-700 font-semibold mb-2">0 to 30 days, Immediate Impact</div>
        <ul class="mb-4 text-gray-800 space-y-1 text-base">
          <li>✔️ Audit your biggest bottleneck</li>
          <li>✔️ Launch your first automation</li>
          <li>✔️ Team training and instant results</li>
        </ul>
        <div class="text-blue-700 font-bold mb-2">Outcomes</div>
        <ul class="text-gray-700 text-sm mb-4 space-y-1">
          <li>5 to 15 hours per week saved</li>
          <li>Major error prone task automated</li>
          <li>Team confidence in automation</li>
        </ul>
        <div class="text-xs italic text-blue-900">Best for testing automation impact</div>
      </div>
      <!-- Phase 2 -->
      <div class="flex flex-col justify-between bg-white/70 p-8 group relative z-10">
        <h3 class="text-2xl font-bold mb-2 text-purple-800">Core Operations Transformation</h3>
        <div class="text-sm text-purple-700 font-semibold mb-2">30 to 90 days, Systematic Improvement</div>
        <ul class="mb-4 text-gray-800 space-y-1 text-base">
          <li>✔️ Redesign three to five core workflows</li>
          <li>✔️ Staged rollout, minimal disruption</li>
          <li>✔️ Team mastery and optimization</li>
        </ul>
        <div class="text-purple-700 font-bold mb-2">Outcomes</div>
        <ul class="text-gray-700 text-sm mb-4 space-y-1">
          <li>30 to 50 percent faster processes</li>
          <li>Customer response times soar</li>
          <li>Manual errors nearly gone</li>
        </ul>
        <div class="text-xs italic text-purple-900">Best for scaling without extra staff</div>
      </div>
      <!-- Phase 3 -->
      <div class="flex flex-col justify-between bg-white/70 p-8 group relative z-10">
        <h3 class="text-2xl font-bold mb-2 text-pink-800">Strategic Integration and Optimization</h3>
        <div class="text-sm text-pink-700 font-semibold mb-2">90 days and beyond, Competitive Advantage</div>
        <ul class="mb-4 text-gray-800 space-y-1 text-base">
          <li>✔️ AI powered decision making</li>
          <li>✔️ Predictive analytics and dashboards</li>
          <li>✔️ Cross platform integration</li>
        </ul>
        <div class="text-pink-700 font-bold mb-2">Outcomes</div>
        <ul class="text-gray-700 text-sm mb-4 space-y-1">
          <li>60 to 80 percent efficiency boost</li>
          <li>Two to five times more volume, same team</li>
          <li>Industry leading customer experience</li>
        </ul>
        <div class="text-xs italic text-pink-900">Best for market leaders and fast growers</div>
      </div>
      <!-- Phase 4 -->
      <div class="flex flex-col justify-between bg-white/70 p-8 group relative z-10">
        <h3 class="text-2xl font-bold mb-2 text-gray-800">Innovation and Evolution</h3>
        <div class="text-sm text-gray-700 font-semibold mb-2">Ongoing, Market Leadership</div>
        <ul class="mb-4 text-gray-800 space-y-1 text-base">
          <li>✔️ Proactive optimization</li>
          <li>✔️ Tech evolution and new AI</li>
          <li>✔️ Strategic expansion</li>
        </ul>
        <div class="text-gray-700 font-bold mb-2">Ongoing Benefits</div>
        <ul class="text-gray-700 text-sm mb-4 space-y-1">
          <li>Always ahead of competitors</li>
          <li>Continuous improvement</li>
          <li>Early access to new tools</li>
        </ul>
        <div class="text-xs italic text-gray-900">Best for ambitious, future focused teams</div>
      </div>
    </div>
  </div>
</section>

<!-- TEAM SECTION -->
<section id="team" class="py-12 md:py-16 bg-white">
  <div class="container mx-auto max-w-2xl px-4">
    <h2 class="text-3xl font-bold mb-6 text-center">Meet Ed & Sy</h2>
    <div class="grid md:grid-cols-2 gap-6 md:gap-8">
      <div
        class="w-full max-w-sm mx-auto mb-6 md:mb-0 p-6 flex flex-col items-center rounded-xl shadow bg-white"
      >
        <img
          src="https://media.licdn.com/dms/image/v2/C4D03AQE0faqui5GEzQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517429424712?e=1753920000&v=beta&t=0VtMz0wg580LRDk1pIc1PbP-SXIpIFQ0gtddI7Qpbhg"
          alt="Edmel Ricahuerta"
          class="mb-2 w-16 h-16 rounded-full bg-gray-200"
        />
        <div class="text-xl font-bold">Edmel Ricahuerta</div>
        <div class="text-sm text-gray-600 mb-2">Founder / Systems & Technology</div>
        <div class="mb-2 text-center">
          Makes technology simple and reliable for traditional business owners.
        </div>
        <div class="flex gap-2">
          <a
            href="mailto:edmel@ednsy.com"
            class="btn btn-outline flex items-center gap-1"
            ><Mail class="w-4 h-4" /> Email</a
          >
          <a
            href="https://www.linkedin.com/in/exricahuerta/"
            class="btn btn-outline flex items-center gap-1"
            ><Linkedin class="w-4 h-4" /> LinkedIn</a
          >
        </div>
      </div>
      <div
        class="w-full max-w-sm mx-auto p-6 flex flex-col items-center rounded-xl shadow bg-white"
      >
        <img
          src="https://media.licdn.com/dms/image/v2/D5603AQHneUVdF6c2Ig/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1675783722369?e=1753920000&v=beta&t=eYVOXdRKdLjcBTOqEEjCaIh4ePSOjeozovt97ws8BpI"
          alt="Syron Suerte"
          class="mb-2 w-16 h-16 rounded-full bg-gray-200"
        />
        <div class="text-xl font-bold">Syron Suerte</div>
        <div class="text-sm text-gray-600 mb-2">Founder / Client Success & Support</div>
        <div class="mb-2 text-center">
          Helps business owners save time while maintaining their personal touch
          with customers.
        </div>
        <div class="flex gap-2">
          <a
            href="mailto:syron@ednsy.com"
            class="btn btn-outline flex items-center gap-1"
            ><Mail class="w-4 h-4" /> Email</a
          >
          <a
            href="https://www.linkedin.com/in/syronsuerte/"
            class="btn btn-outline flex items-center gap-1"
            ><Linkedin class="w-4 h-4" /> LinkedIn</a
          >
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA / CONSULTATION SECTION (Inspired by v0-new-project-ilofrbxjvqs.vercel.app) -->
<section
  id="contact"
  class="py-20 bg-gradient-to-br from-blue-600 to-purple-500 text-white"
>
  <div class="container mx-auto max-w-4xl px-4">
    <h2 class="text-3xl md:text-4xl font-bold mb-4 text-center">
      Ready to simplify your business?
    </h2>
    <p class="text-lg md:text-xl mb-10 text-center">
      Let's have a friendly 30-minute chat about how we can help - no charge, no
      pressure.
    </p>
    <div
      class="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start justify-center"
    >
      <!-- Consultation Form -->
      <div
        class="flex-1 max-w-md w-full min-h-[500px] mb-10 md:mb-0 mx-auto bg-white/90 rounded-2xl shadow-lg p-0 md:p-4 flex flex-col justify-center overflow-hidden"
      >
        <h3
          class="text-xl font-bold mb-4 text-blue-700 text-center pt-6 md:pt-0"
        >
          Schedule your free consultation
        </h3>
        <iframe
          data-tally-src="https://tally.so/embed/3NQ6pB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          loading="lazy"
          width="100%"
          height="562"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          title="Schedule your free consultation
        "
        ></iframe>
        <script>
          var d = document,
            w = "https://tally.so/widgets/embed.js",
            v = function () {
              "undefined" != typeof Tally
                ? Tally.loadEmbeds()
                : d
                    .querySelectorAll("iframe[data-tally-src]:not([src])")
                    .forEach(function (e) {
                      e.src = e.dataset.tallySrc;
                    });
            };
          if ("undefined" != typeof Tally) v();
          else if (d.querySelector('script[src="' + w + '"]') == null) {
            var s = d.createElement("script");
            (s.src = w), (s.onload = v), (s.onerror = v), d.body.appendChild(s);
          }
        </script>
      </div>
      <!-- Contact Info & What You'll Get -->
      <div
        class="flex-1 max-w-md w-full mx-auto text-white/90 text-center md:text-left"
      >
        <div class="mb-8">
          <h4 class="font-bold text-lg mb-2 text-center md:text-left">
            Contact Us Your Way:
          </h4>
          <div class="mb-2 text-center md:text-left">
            <span class="font-semibold">Call</span>
            <a href="tel:+14165551234" class="underline">+1 (416) 555-1234</a
            ><span class="ml-2">Any time during business hours</span>
          </div>
          <div class="mb-2 text-center md:text-left">
            <span class="font-semibold">Email</span>
            <a href="mailto:hello@ednsy.com" class="underline"
              >hello@ednsy.com</a
            ><span class="ml-2">We respond within 24 hours</span>
          </div>
          <div class="mb-2 text-center md:text-left">
            <span class="font-semibold">In-Person Meeting</span>
            <span class="ml-2">We're happy to meet up for a coffee</span>
          </div>
        </div>
        <div class="bg-white/80 rounded-xl p-6 text-gray-900 mx-auto">
          <h5 class="font-bold mb-2 text-center md:text-left">
            What you'll get:
          </h5>
          <ul class="list-disc list-inside space-y-1 text-left mx-auto">
            <li>30-minute friendly business consultation</li>
            <li>Plain-English explanation of how we can help</li>
            <li>Clear pricing with no hidden fees</li>
            <li>Simple next steps you can take right away</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .blinking-cursor {
    animation: blink 1s steps(2, start) infinite;
  }
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
</style>
