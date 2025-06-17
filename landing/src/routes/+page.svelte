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
      desc: "Connect your Google Calendar, Gmail, WhatsApp, and SMS—no new apps needed.",
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
      desc: "Messages go out at the perfect time—after calls, appointments, or invoices.",
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
  // Pricing plans
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/mo",
      features: ["Up to 5 clients", "Basic reminders", "Email support"],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      features: [
        "Unlimited clients",
        "All automations",
        "Integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Contact",
      period: "",
      features: [
        "Custom integrations",
        "Dedicated manager",
        "Advanced security",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];
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
          href="#how"
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

<!-- CUSTOMER COMMUNICATION SECTION (Animated Stepper Card) -->
<section id="how" class="py-20 bg-white">
  <div class="mx-auto px-4 container-lg max-w-6xl">
    <h2 class="text-3xl md:text-4xl font-bold mb-3 text-center">
      How Ed & Sy Works
    </h2>
    <p class="text-lg text-gray-700 mb-12 text-center">
      See how we automate your business, step by step.
    </p>
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center w-full"
    >
      {#each flowSteps as step, i}
        <div class="p-2 flex h-full">
          <Card.Root
            class="overflow-hidden rounded-2xl shadow-lg bg-white transition-all duration-500 h-full flex flex-col items-center px-8 py-5 border-0"
          >
            <div
              class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-3xl mb-2"
            >
              {step.icon}
            </div>
            <div class="font-bold text-lg mb-3 text-center">
              {i + 1}. {step.title}
            </div>
            <Card.Content
              class="text-gray-700 whitespace-pre-line text-base leading-relaxed text-center min-h-[96px] flex items-center justify-center"
            >
              {step.desc}
            </Card.Content>
          </Card.Root>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- WE WORK YOUR WAY SECTION-->
<section class="py-20 bg-gray-50">
  <div class="container mx-auto max-w-3xl px-4">
    <div class="flex flex-col items-center mb-6">
      <span class="text-5xl mb-2">💡</span>
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-center">
        We Work Your Way
      </h2>
      <p class="text-base text-gray-700 text-center max-w-xl">
        We adapt to your style! Whether you prefer face-to-face meetings, phone
        calls, or printed materials, we've got you covered.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div class="flex items-start gap-4">
        <ShieldCheck class="w-7 h-7 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <div class="font-semibold text-lg mb-1">
            Reliable &amp; Trustworthy
          </div>
          <div class="text-gray-700">
            Your information stays private and secure
          </div>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <User class="w-7 h-7 text-green-600 mt-1 flex-shrink-0" />
        <div>
          <div class="font-semibold text-lg mb-1">Personal Service</div>
          <div class="text-gray-700">
            Real people you can talk to when you need help
          </div>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <Plus class="w-7 h-7 text-purple-600 mt-1 flex-shrink-0" />
        <div>
          <div class="font-semibold text-lg mb-1">Grows With You</div>
          <div class="text-gray-700">
            Start simple, add more as you're comfortable
          </div>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <MapPin class="w-7 h-7 text-yellow-600 mt-1 flex-shrink-0" />
        <div>
          <div class="font-semibold text-lg mb-1">Local Toronto Team</div>
          <div class="text-gray-700">
            We understand your community and customers
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING SECTION (Accessible) -->
<section id="pricing" class="py-20 bg-white">
  <div class="container mx-auto max-w-5xl px-4">
    <h2 class="text-4xl md:text-5xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-500 to-pink-500 leading-tight pb-2">
      Transparent Pricing
    </h2>
    <div class="grid md:grid-cols-3 gap-10 mt-10">
      <!-- Time Saver Plan -->
      <div class="rounded-2xl p-8 flex flex-col items-start bg-gray-50 shadow h-full">
        <h3 class="text-2xl font-bold mb-2">Time Saver</h3>
        <div class="text-lg text-gray-700 mb-3">Automate reminders & follow-ups</div>
        <div class="text-3xl font-extrabold mb-2">$129<span class="text-xl font-normal">/mo</span></div>
        <div class="text-base text-gray-500 mb-4">$99 setup</div>
        <ul class="text-lg mb-6 space-y-2 list-disc list-inside">
          <li class="font-bold">Up to 3 automations</li>
          <li>Auto reminders (appts, payments)</li>
          <li>Customer check-ins</li>
          <li>Review requests</li>
          <li>Connect 3 tools</li>
          <li>Personal setup</li>
          <li>Monthly check-in call</li>
        </ul>
        <button data-tally-open="3NQ6pB" class="w-full block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow hover:bg-blue-700 transition mt-auto">Get Started</button>
      </div>
      <!-- Growth Booster Plan -->
      <div class="rounded-2xl p-8 flex flex-col items-start bg-white shadow ring-2 ring-blue-500 h-full relative">
        <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-base font-bold px-4 py-1 rounded-full shadow bg-blue-600 text-white">Most Popular</div>
        <h3 class="text-2xl font-bold mb-2">Growth Booster</h3>
        <div class="text-lg text-gray-700 mb-3">Smarter messages & more integrations</div>
        <div class="text-3xl font-extrabold mb-2">$299<span class="text-xl font-normal">/mo</span></div>
        <div class="text-base text-gray-500 mb-4">$199 setup</div>
        <ul class="text-lg mb-6 space-y-2 list-disc list-inside">
          <li class="font-bold">Up to 7 automations</li>
          <li>All Time Saver features</li>
          <li>Missed call follow-up</li>
          <li>Personalized messages</li>
          <li>Connect 5 tools</li>
          <li>Priority support</li>
          <li>Bi-weekly strategy calls</li>
          <li>Progress reports</li>
        </ul>
        <button data-tally-open="3NQ6pB" class="w-full block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow hover:bg-blue-700 transition mt-auto">Get Started</button>
      </div>
      <!-- Business Transformer Plan -->
      <div class="rounded-2xl p-8 flex flex-col items-start bg-gray-50 shadow h-full">
        <h3 class="text-2xl font-bold mb-2">Business Transformer</h3>
        <div class="text-lg text-gray-700 mb-3">Custom AI & full automation</div>
        <div class="text-3xl font-extrabold mb-2">from $599<span class="text-xl font-normal">/mo</span></div>
        <div class="text-base text-gray-500 mb-4">$499 setup</div>
        <ul class="text-lg mb-6 space-y-2 list-disc list-inside">
          <li class="font-bold">Unlimited automations</li>
          <li>All Growth Booster features</li>
          <li>Custom AI workflows</li>
          <li>Unlimited tool connections</li>
          <li>Dedicated AI partner</li>
          <li>Weekly strategy sessions</li>
          <li>Performance reviews</li>
        </ul>
        <button data-tally-open="3NQ6pB" class="w-full block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow hover:bg-blue-700 transition mt-auto">Get Started</button>
      </div>
    </div>
    <!-- One-time Fee & Add-ons -->
    <div class="mt-16 max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
      <div class="bg-blue-50 rounded-xl p-6 shadow text-base">
        <div class="font-bold mb-2 text-blue-800">Why a setup fee?</div>
        <div>It covers expert setup so your automation works right from day one.</div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow text-base">
        <div class="font-bold mb-2 text-blue-800">Add-Ons</div>
        <ul class="list-disc list-inside space-y-2">
          <li>Ad-hoc consults ($150/hr)</li>
          <li>Advanced analytics integration</li>
          <li>On-site training</li>
          <li>Emergency support SLA</li>
        </ul>
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
