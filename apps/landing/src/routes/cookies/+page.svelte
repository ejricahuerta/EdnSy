<script lang="ts">
  import { Cookie, ArrowLeft } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
</script>

<svelte:head>
  <title>Cookie Policy | Ed & Sy</title>
  <meta
    name="description"
    content="Cookie Policy for Ed & Sy - Learn about how we use cookies and tracking technologies on our website."
  />
</svelte:head>

<main class="min-h-screen bg-background pt-24 pb-16">
  <div class="container mx-auto px-4 max-w-4xl">
    <div class="mb-8">
      <Button href="/" variant="link" class="text-primary gap-2 pl-0 mb-6">
        <ArrowLeft class="w-4 h-4" />
        Back to Home
      </Button>
      <div class="flex items-center gap-3 mb-4">
        <Cookie class="w-8 h-8 text-primary" />
        <h1 class="typography-h1">Cookie Policy</h1>
      </div>
      <p class="text-muted-foreground text-lg">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    <div class="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">What Are Cookies?</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and analyzing how you use our site.
        </p>
        <p class="text-muted-foreground leading-relaxed">
          This Cookie Policy explains how Ed & Sy uses cookies and similar tracking technologies on our website at ednsy.com.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Types of Cookies We Use</h2>
        <h3 class="typography-h4 mb-3">Essential Cookies</h3>
        <p class="text-muted-foreground leading-relaxed mb-4">
          These cookies are necessary for our website to function properly. They enable basic features like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
        </p>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li>Session management cookies</li>
          <li>Security cookies</li>
          <li>Load balancing cookies</li>
        </ul>
        <h3 class="typography-h4 mb-3">Analytics Cookies</h3>
        <p class="text-muted-foreground leading-relaxed mb-4">
          We use analytics cookies to understand how visitors interact with our website. This helps us improve our site's performance and user experience.
        </p>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li><strong>PostHog:</strong> User behavior analytics and feature usage tracking</li>
        </ul>
        <h3 class="typography-h4 mb-3">Functional Cookies</h3>
        <p class="text-muted-foreground leading-relaxed mb-4">
          These cookies enable enhanced functionality and personalization, such as remembering your preferences and providing personalized content.
        </p>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li>Language preferences</li>
          <li>Form auto-fill information</li>
          <li>Chat widget preferences</li>
        </ul>
        <h3 class="typography-h4 mb-3">Marketing and Advertising Cookies</h3>
        <p class="text-muted-foreground leading-relaxed mb-4">
          These cookies may be used to track visitors across websites to display relevant advertisements and measure the effectiveness of our marketing campaigns.
        </p>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li>Conversion tracking</li>
          <li>Retargeting pixels</li>
          <li>Social media integration cookies</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Third-Party Cookies</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          Some cookies on our site are set by third-party services we use to enhance your experience:
        </p>
        <Card.Root class="bg-muted/50 mb-4">
          <Card.Header class="pb-2">
            <Card.Title class="text-base">PostHog Analytics</Card.Title>
          </Card.Header>
          <Card.Content class="text-sm">
            <p class="text-muted-foreground mb-2">
              <strong class="text-foreground">Purpose:</strong> User behavior analytics and product insights
            </p>
            <p class="text-muted-foreground mb-2">
              <strong class="text-foreground">Data collected:</strong> Page views, clicks, user interactions, device information
            </p>
            <p class="text-muted-foreground">
              <strong class="text-foreground">Privacy Policy:</strong> <a href="https://posthog.com/privacy" target="_blank" rel="noopener" class="text-primary hover:underline">PostHog Privacy Policy</a>
            </p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="bg-muted/50 mb-4">
          <Card.Header class="pb-2">
            <Card.Title class="text-base">Tally Forms</Card.Title>
          </Card.Header>
          <Card.Content class="text-sm">
            <p class="text-muted-foreground mb-2">
              <strong class="text-foreground">Purpose:</strong> Contact and consultation form functionality
            </p>
            <p class="text-muted-foreground mb-2">
              <strong class="text-foreground">Data collected:</strong> Form submissions, user interactions
            </p>
            <p class="text-muted-foreground">
              <strong class="text-foreground">Privacy Policy:</strong> <a href="https://tally.so/help/privacy-policy" target="_blank" rel="noopener" class="text-primary hover:underline">Tally Privacy Policy</a>
            </p>
          </Card.Content>
        </Card.Root>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">How Long Do Cookies Last?</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          The duration cookies remain on your device depends on their type:
        </p>
        <ul class="list-disc pl-6 mb-4 text-muted-foreground">
          <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent Cookies:</strong> Remain on your device for a predetermined period or until you delete them</li>
          <li><strong>Analytics Cookies:</strong> Typically last 2 years unless deleted earlier</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Managing Cookies</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          You have several options for managing cookies:
        </p>
        <h3 class="typography-h4 mb-3">Browser Settings</h3>
        <p class="text-muted-foreground leading-relaxed mb-4">
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li>Block all cookies</li>
          <li>Block third-party cookies</li>
          <li>Delete existing cookies</li>
          <li>Receive notifications when cookies are set</li>
        </ul>
        <h3 class="typography-h4 mb-3">Browser-Specific Instructions</h3>
        <ul class="list-disc pl-6 mb-6 text-muted-foreground">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" class="text-primary hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener" class="text-primary hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener" class="text-primary hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener" class="text-primary hover:underline">Microsoft Edge</a></li>
        </ul>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p class="text-yellow-800">
            <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and limit your user experience.
          </p>
        </div>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Opt-Out Options</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          You can opt out of specific tracking services:
        </p>
        <ul class="list-disc pl-6 mb-4 text-muted-foreground">
          <li><strong>PostHog:</strong> PostHog respects browser "Do Not Track" settings</li>
          <li><strong>Google Analytics:</strong> Use the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener" class="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Do Not Track</h2>
        <p class="text-muted-foreground leading-relaxed">
          We respect "Do Not Track" browser settings where technically feasible. However, please note that some third-party services may not honor Do Not Track requests.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Updates to This Policy</h2>
        <p class="text-muted-foreground leading-relaxed">
          We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post the updated policy on this page with a new "Last updated" date.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="typography-h2 mb-4">Contact Us</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          If you have any questions about our use of cookies or this Cookie Policy, please contact us:
        </p>
        <Card.Root class="bg-muted/50">
          <Card.Content class="pt-6">
            <p class="text-muted-foreground mb-2"><strong class="text-foreground">Ed & Sy</strong></p>
            <p class="text-muted-foreground mb-2">Email: <a href="mailto:hello@ednsy.com" class="text-primary hover:underline">hello@ednsy.com</a></p>
            <p class="text-muted-foreground mb-2">Website: <a href="https://ednsy.com" class="text-primary hover:underline">ednsy.com</a></p>
            <p class="text-muted-foreground">Location: Toronto, Ontario, Canada</p>
          </Card.Content>
        </Card.Root>
      </section>
    </div>
  </div>
</main> 