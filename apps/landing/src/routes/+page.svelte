<script lang="ts">
  import HomeHeroSection from "$lib/components/landing/home/sections/home-hero-section.svelte";
  import HomeKpiSection from "$lib/components/landing/home/sections/home-kpi-section.svelte";
  import HomeServicesSection from "$lib/components/landing/home/sections/home-services-section.svelte";
  import HomeProcessSection from "$lib/components/landing/home/sections/home-process-section.svelte";
  import HomeCaseStudySection from "$lib/components/landing/home/sections/home-case-study-section.svelte";
  import HomeAboutSection from "$lib/components/landing/home/sections/home-about-section.svelte";
  import HomeIndustriesSection from "$lib/components/landing/home/sections/home-industries-section.svelte";
  import HomeFaqSection from "$lib/components/landing/home/sections/home-faq-section.svelte";
  import HomeCtaSection from "$lib/components/landing/home/sections/home-cta-section.svelte";
  import { faqItems } from "$lib/content/site";
  import { buildFAQSchema } from "$lib/content/seo";

  const faqSchema = buildFAQSchema(faqItems);
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<HomeHeroSection />
<HomeKpiSection />
<HomeServicesSection />
<HomeProcessSection />
<HomeCaseStudySection />
<HomeAboutSection />
<HomeIndustriesSection />
<HomeFaqSection />
<HomeCtaSection />
