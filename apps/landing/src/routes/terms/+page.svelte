<script lang="ts">
  import { FileText, ArrowLeft } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Terms of Service | Ed & Sy</title>
  <meta
    name="description"
    content="Terms of Service for Ed & Sy - AI automation services for small and medium businesses in Toronto and the GTA."
  />
</svelte:head>

<main class="min-h-screen bg-white pt-24 pb-16">
  <div class="container mx-auto px-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <a
        href="/"
        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Home
      </a>
      <div class="flex items-center gap-3 mb-4">
        <FileText class="w-8 h-8 text-blue-600" />
        <h1 class="text-4xl font-bold text-gray-900">Terms of Service</h1>
      </div>
      <p class="text-gray-600 text-lg">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    <div class="prose prose-lg max-w-none">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Welcome to Ed & Sy. These Terms of Service ("Terms") govern your use of our website at ednsy.com and our AI automation services for small and medium businesses ("Services"). By accessing or using our Services, you agree to be bound by these Terms.
        </p>
        <p class="text-gray-700 leading-relaxed">
          If you do not agree to these Terms, please do not use our Services.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Description of Services</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Ed & Sy provides AI-powered automation solutions for small and medium businesses, including but not limited to:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>Business process automation setup and management</li>
          <li>Integration with existing business tools (Google Calendar, WhatsApp, Gmail, etc.)</li>
          <li>Custom workflow development using N8N and other automation platforms</li>
          <li>AI-powered client communication and CRM automation</li>
          <li>Consultation and training services</li>
          <li>Ongoing support and maintenance</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Eligibility and Account Registration</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          You must be at least 18 years old and have the legal authority to enter into these Terms on behalf of yourself or your business. By using our Services, you represent and warrant that you meet these requirements.
        </p>
        <p class="text-gray-700 leading-relaxed">
          You are responsible for maintaining the confidentiality of any account credentials and for all activities that occur under your account.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Service Plans and Pricing</h2>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Pricing Plans</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          We offer different service tiers with monthly subscription fees and one-time setup costs. Current pricing includes:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Time Saver Plan:</strong> Monthly subscription + setup fee</li>
          <li><strong>Growth Booster Plan:</strong> Monthly subscription + setup fee</li>
          <li><strong>Full Service Plan:</strong> Custom pricing based on requirements</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>Setup fees are due before service implementation begins</li>
          <li>Monthly subscription fees are billed in advance</li>
          <li>Annual plans require 12-month commitment with discounted monthly rates</li>
          <li>All fees are non-refundable unless otherwise specified</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Client Responsibilities</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          As our client, you agree to:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>Provide accurate and complete information about your business needs</li>
          <li>Grant necessary access to your business systems and accounts for automation setup</li>
          <li>Maintain valid credentials for integrated third-party services</li>
          <li>Use our Services in compliance with all applicable laws and regulations</li>
          <li>Not use our Services for any illegal or unauthorized purpose</li>
          <li>Notify us promptly of any issues or concerns with the automation systems</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Third-Party Integrations</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Our Services integrate with various third-party platforms and services. You acknowledge that:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>You are responsible for maintaining valid accounts and licenses with integrated services</li>
          <li>Changes to third-party services may affect our automation functionality</li>
          <li>We are not responsible for third-party service outages or policy changes</li>
          <li>You must comply with all third-party terms of service and privacy policies</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Data and Privacy</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We handle your data in accordance with our <a href="/privacy" class="text-blue-600 hover:text-blue-700">Privacy Policy</a>. You grant us permission to access and process your business data solely for the purpose of providing our Services.
        </p>
        <p class="text-gray-700 leading-relaxed">
          You remain the owner of your business data, and we will not use it for any purpose other than providing our Services to you.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Service Level and Support</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We strive to provide reliable automation services, but we cannot guarantee 100% uptime. Support levels vary by plan:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Time Saver Plan:</strong> Email support during business hours</li>
          <li><strong>Growth Booster Plan:</strong> Priority support and quarterly strategy calls</li>
          <li><strong>Full Service Plan:</strong> Dedicated support and monthly reviews</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          To the maximum extent permitted by law, Ed & Sy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our Services.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Our total liability to you for any damages shall not exceed the amount paid by you for our Services in the twelve (12) months preceding the event giving rise to liability.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Either party may terminate these Terms with 30 days' written notice. Upon termination:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>All automation services will be discontinued</li>
          <li>You remain responsible for any outstanding fees</li>
          <li>We will provide reasonable assistance with data export (additional fees may apply)</li>
          <li>Confidentiality obligations survive termination</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          All intellectual property rights in our Services, including automation workflows, custom code, and methodologies, remain the property of Ed & Sy. You receive a limited, non-exclusive license to use our Services during the term of these Terms.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
        <p class="text-gray-700 leading-relaxed">
          These Terms are governed by the laws of Ontario, Canada. Any disputes arising under these Terms shall be resolved in the courts of Ontario, Canada.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
        <p class="text-gray-700 leading-relaxed">
          We may modify these Terms at any time by posting updated Terms on our website. Continued use of our Services after changes constitutes acceptance of the modified Terms.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          If you have any questions about these Terms, please contact us:
        </p>
        <div class="bg-gray-50 p-6 rounded-lg">
          <p class="text-gray-700 mb-2"><strong>Ed & Sy</strong></p>
          <p class="text-gray-700 mb-2">Email: <a href="mailto:hello@ednsy.com" class="text-blue-600 hover:text-blue-700">hello@ednsy.com</a></p>
          <p class="text-gray-700 mb-2">Website: <a href="https://ednsy.com" class="text-blue-600 hover:text-blue-700">ednsy.com</a></p>
          <p class="text-gray-700">Location: Toronto, Ontario, Canada</p>
        </div>
      </section>
    </div>
  </div>
</main> 