<script lang="ts">
  import { Cookie, ArrowLeft } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Cookie Policy | Ed & Sy</title>
  <meta
    name="description"
    content="Cookie Policy for Ed & Sy - Learn about how we use cookies and tracking technologies on our website."
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
        <Cookie class="w-8 h-8 text-blue-600" />
        <h1 class="text-4xl font-bold text-gray-900">Cookie Policy</h1>
      </div>
      <p class="text-gray-600 text-lg">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    <div class="prose prose-lg max-w-none">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and analyzing how you use our site.
        </p>
        <p class="text-gray-700 leading-relaxed">
          This Cookie Policy explains how Ed & Sy uses cookies and similar tracking technologies on our website at ednsy.com.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Essential Cookies</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          These cookies are necessary for our website to function properly. They enable basic features like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
        </p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Session management cookies</li>
          <li>Security cookies</li>
          <li>Load balancing cookies</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Analytics Cookies</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          We use analytics cookies to understand how visitors interact with our website. This helps us improve our site's performance and user experience.
        </p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li><strong>PostHog:</strong> User behavior analytics and feature usage tracking</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Functional Cookies</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          These cookies enable enhanced functionality and personalization, such as remembering your preferences and providing personalized content.
        </p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Language preferences</li>
          <li>Form auto-fill information</li>
          <li>Chat widget preferences</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Marketing and Advertising Cookies</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          These cookies may be used to track visitors across websites to display relevant advertisements and measure the effectiveness of our marketing campaigns.
        </p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Conversion tracking</li>
          <li>Retargeting pixels</li>
          <li>Social media integration cookies</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Some cookies on our site are set by third-party services we use to enhance your experience:
        </p>
        <div class="bg-gray-50 p-6 rounded-lg mb-4">
          <h4 class="font-semibold text-gray-800 mb-2">PostHog Analytics</h4>
          <p class="text-gray-700 text-sm mb-2">
            <strong>Purpose:</strong> User behavior analytics and product insights
          </p>
          <p class="text-gray-700 text-sm mb-2">
            <strong>Data collected:</strong> Page views, clicks, user interactions, device information
          </p>
          <p class="text-gray-700 text-sm">
            <strong>Privacy Policy:</strong> <a href="https://posthog.com/privacy" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">PostHog Privacy Policy</a>
          </p>
        </div>
        <div class="bg-gray-50 p-6 rounded-lg mb-4">
          <h4 class="font-semibold text-gray-800 mb-2">Tally Forms</h4>
          <p class="text-gray-700 text-sm mb-2">
            <strong>Purpose:</strong> Contact and consultation form functionality
          </p>
          <p class="text-gray-700 text-sm mb-2">
            <strong>Data collected:</strong> Form submissions, user interactions
          </p>
          <p class="text-gray-700 text-sm">
            <strong>Privacy Policy:</strong> <a href="https://tally.so/help/privacy-policy" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Tally Privacy Policy</a>
          </p>
        </div>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">How Long Do Cookies Last?</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          The duration cookies remain on your device depends on their type:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent Cookies:</strong> Remain on your device for a predetermined period or until you delete them</li>
          <li><strong>Analytics Cookies:</strong> Typically last 2 years unless deleted earlier</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          You have several options for managing cookies:
        </p>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li>Block all cookies</li>
          <li>Block third-party cookies</li>
          <li>Delete existing cookies</li>
          <li>Receive notifications when cookies are set</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Browser-Specific Instructions</h3>
        <ul class="list-disc pl-6 mb-6 text-gray-700">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Microsoft Edge</a></li>
        </ul>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p class="text-yellow-800">
            <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and limit your user experience.
          </p>
        </div>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Opt-Out Options</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          You can opt out of specific tracking services:
        </p>
        <ul class="list-disc pl-6 mb-4 text-gray-700">
          <li><strong>PostHog:</strong> PostHog respects browser "Do Not Track" settings</li>
          <li><strong>Google Analytics:</strong> Use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700">Google Analytics Opt-out Browser Add-on</a></li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Do Not Track</h2>
        <p class="text-gray-700 leading-relaxed">
          We respect "Do Not Track" browser settings where technically feasible. However, please note that some third-party services may not honor Do Not Track requests.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
        <p class="text-gray-700 leading-relaxed">
          We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post the updated policy on this page with a new "Last updated" date.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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