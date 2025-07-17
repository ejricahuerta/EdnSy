<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { X, Calendar, MessageSquare, CheckCircle } from '@lucide/svelte';
  
  let { isOpen = false, onConsultationClick = () => {} } = $props();
  let isOpenState = $state(isOpen);
  
  function closePopup() {
    isOpenState = false;
  }
  
  function bookConsultation() {
    closePopup();
    onConsultationClick();
  }
  
  function contactUs() {
    // TODO: Integrate with contact form or email
    window.location.href = 'mailto:hello@ednsy.com?subject=Partnership%20Inquiry';
    closePopup();
  }
</script>

{#if isOpenState}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="relative">
        <button
          onclick={closePopup}
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X class="h-5 w-5" />
        </button>
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle class="text-xl">Ready to Partner?</CardTitle>
          <CardDescription>
            You've explored our AI demos. Let's discuss how we can help your business grow.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">What you'll get:</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Custom AI solutions for your business
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Implementation and training support
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Ongoing optimization and updates
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Dedicated account management
            </li>
          </ul>
        </div>
        
        <div class="space-y-3">
          <Button class="w-full" onclick={bookConsultation}>
            <Calendar class="h-4 w-4 mr-2" />
            Book Free Consultation
          </Button>
          <Button variant="outline" class="w-full" onclick={contactUs}>
            Contact Us
          </Button>
        </div>
        
        <p class="text-xs text-gray-500 text-center">
          No pressure, no commitment. Let's explore how AI can transform your business.
        </p>
      </CardContent>
    </Card>
  </div>
{/if} 