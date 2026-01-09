<script lang="ts">
  import { Shield, ArrowLeft } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Privacy Policy | Ed & Sy</title>
  <meta
    name="description"
    content="Privacy Policy for Ed & Sy - tech implementation partner services for small and medium businesses in Toronto and the GTA."
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
        <Shield class="w-8 h-8 text-blue-600" />
        <h1 class="text-4xl font-bold text-gray-900">Privacy Policy</h1>
      </div>
      <p class="text-gray-600 text-lg">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    <div class="prose prose-lg max-w-none">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          At Ed & Sy ("we," "our," or "us"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at ednsy.com or use our AI automation services for small and medium businesses.
        </p>
        <p class="text-gray-700 leading-relaxed">
          By using our services, you consent to the data practices described in this policy.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          We may collect personally identifiable information that you voluntarily provide to us when you:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>Fill out contact forms or consultation requests</li>
          <li>Subscribe to our newsletter or updates</li>
          <li>Engage with our automation services</li>
          <li>Contact us via email, phone, or other communication methods</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mb-4">This information may include:</p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Name and contact information (email, phone number)</li>
          <li>Business information (company name, industry, size)</li>
          <li>Communication preferences</li>
          <li>Any other information you choose to provide</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          When you visit our website, we may automatically collect certain information about your device and usage:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>IP address and browser information</li>
          <li>Pages visited and time spent on our site</li>
          <li>Referring website or source</li>
          <li>Device type and operating system</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We use the information we collect for the following purposes:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>To provide, operate, and maintain our automation services</li>
          <li>To respond to your inquiries and provide customer support</li>
          <li>To schedule consultations and service appointments</li>
          <li>To improve our website and services</li>
          <li>To send you updates about our services (with your consent)</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our business (e.g., email services, analytics, payment processing)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or asset sale</li>
          <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Our automation services integrate with various third-party platforms to provide you with seamless automation. These may include:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li>Google Services (Calendar, Gmail, Sheets)</li>
          <li>WhatsApp Business</li>
          <li>Telegram</li>
          <li>Notion</li>
          <li>N8N workflow automation</li>
          <li>Other business tools as requested by clients</li>
        </ul>
        <p class="text-gray-700 leading-relaxed">
          When you choose to integrate these services, you are subject to their respective privacy policies and terms of service.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission or electronic storage is 100% secure.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          You have the following rights regarding your personal information:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Access:</strong> Request a copy of the personal information we have about you</li>
          <li><strong>Correction:</strong> Request that we correct or update inaccurate information</li>
          <li><strong>Deletion:</strong> Request that we delete your personal information</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
        </ul>
        <p class="text-gray-700 leading-relaxed">
          To exercise these rights, please contact us at <a href="mailto:hello@ednsy.com" class="text-blue-600 hover:text-blue-700">hello@ednsy.com</a>.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Cookies and Analytics</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          We use cookies and similar tracking technologies to enhance your experience on our website. We also use analytics services like PostHog and Vercel Analytics to understand how visitors interact with our site.
        </p>
        <p class="text-gray-700 leading-relaxed">
          For more information about our use of cookies, please see our <a href="/cookies" class="text-blue-600 hover:text-blue-700">Cookie Policy</a>.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
        <p class="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibent text-gray-900 mb-4">Contact Us</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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