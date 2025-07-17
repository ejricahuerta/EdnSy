<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { MessageSquare, BarChart3, CheckSquare, Zap, Globe, FileText, Calendar, Phone } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import PartnershipPopup from '$lib/components/partnership-popup.svelte';
  import ConsultationPopup from '$lib/components/consultation-popup.svelte';
  
  let currentUser = $derived($page.data.user);
  let promptsUsed = $state(0);
  let promptsRemaining = $derived(10 - promptsUsed);
  let showPartnershipPopupState = $state(false);
  let showConsultationPopupState = $state(false);
  
  onMount(() => {
    // Load prompts used from localStorage
    const savedPrompts = localStorage.getItem('ednsy_prompts_used');
    if (savedPrompts) {
      promptsUsed = parseInt(savedPrompts);
    }
  });
  
  const demos = [
    {
      id: 'chatbot',
      title: 'Customer Service Helper',
      description: 'Answer customer questions automatically using your business information',
      icon: MessageSquare,
      status: 'available',
      dataType: 'website',
      dataDescription: 'Just enter your website address',
      features: ['Answer customer questions', 'Available 24/7', 'Uses your business info']
    },
    {
      id: 'data-insights',
      title: 'Business Reports',
      description: 'Get insights from your business documents and spreadsheets',
      icon: BarChart3,
      status: 'available',
      dataType: 'files',
      dataDescription: 'Upload your Excel files or documents',
      features: ['Sales reports', 'Customer analysis', 'Business performance']
    },
    {
      id: 'task-automation',
      title: 'Time-Saving Tools',
      description: 'Automate repetitive tasks like emails and phone calls',
      icon: CheckSquare,
      status: 'available',
      dataType: 'contact',
      dataDescription: 'Provide your email and phone number',
      features: ['Automated emails', 'Text messages', 'Calendar reminders']
    },
    {
      id: 'ai-assistant',
      title: 'Business Assistant',
      description: 'Smart assistant that works with your existing systems',
      icon: Zap,
      status: 'available',
      dataType: 'knowledge',
      dataDescription: 'Upload your files and choose your systems',
      features: ['Customer management', 'Field service', 'Multi-system help']
    }
  ];
  
  function handleDemoClick(demo: any) {
    if (demo.status === 'coming-soon') {
      alert('This demo will be available soon!');
      return;
    }
    
    // Check if user has prompts remaining
    if (promptsRemaining <= 0) {
      showPartnershipPopup();
      return;
    }
    
    // Navigate to demo setup page
    window.location.href = `/app/demos/${demo.id}/setup`;
  }
  
  function showPartnershipPopup() {
    showPartnershipPopupState = true;
  }
  
  function showConsultationPopup() {
    showConsultationPopupState = true;
  }
</script>

<div class="px-4 lg:px-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Become Your AI Partner</h1>
    <p class="text-gray-600">
      We want to be your AI partner. Try our tools and see how we can work together to grow your business.
    </p>
  </div>
  
  <!-- Prompts Info -->
  <Card class="mb-8">
    <CardContent class="pt-6">
      <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
        <MessageSquare class="h-5 w-5 text-slate-600" />
        <div>
          <p class="text-sm font-medium text-gray-900">Free Tries Remaining</p>
          <p class="text-2xl font-bold text-slate-600">{promptsRemaining}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-600">Used {promptsUsed} of 10 tries</p>
        <p class="text-xs text-gray-500">After 10 tries, let's become your AI partner</p>
      </div>
      </div>
    </CardContent>
  </Card>
  
  <!-- Demos Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each demos as demo}
      {@const Icon = demo.icon}
      <Card class="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-slate-100 rounded-lg">
                <Icon class="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle class="text-lg">{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </div>
            </div>
            <Badge variant={demo.status === 'available' ? 'default' : 'secondary'}>
              {demo.status === 'available' ? 'Available' : 'Coming Soon'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- Features -->
            <div class="space-y-2">
              <p class="text-sm font-medium text-gray-700">Features:</p>
              <ul class="text-sm text-gray-600 space-y-1">
                {#each demo.features as feature}
                  <li class="flex items-center gap-2">
                    <div class="w-1 h-1 bg-slate-500 rounded-full"></div>
                    {feature}
                  </li>
                {/each}
              </ul>
            </div>
            
            <!-- Data Type -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div class="flex items-center gap-2">
                {#if demo.dataType === 'website'}
                  <Globe class="h-4 w-4 text-gray-500" />
                {:else if demo.dataType === 'files'}
                  <FileText class="h-4 w-4 text-gray-500" />
                {:else if demo.dataType === 'contact'}
                  <Phone class="h-4 w-4 text-gray-500" />
                {:else}
                  <Zap class="h-4 w-4 text-gray-500" />
                {/if}
                <span class="text-sm text-gray-600">{demo.dataDescription}</span>
              </div>
              <button 
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors {demo.status === 'available' ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                onclick={() => handleDemoClick(demo)}
                disabled={demo.status === 'coming-soon'}
              >
                {demo.status === 'available' ? 'Try Tool' : 'Coming Soon'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
  
  <!-- Help Section -->
  <Card class="mt-8">
    <CardHeader>
      <CardTitle>Why Partner With Us?</CardTitle>
      <CardDescription>
        We're not just another vendor - we want to be your long-term AI partner
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <MessageSquare class="h-6 w-6 text-slate-600" />
          </div>
          <h3 class="font-medium text-gray-900 mb-1">Free Tries</h3>
          <p class="text-sm text-gray-600">Try our tools for free before we partner together</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap class="h-6 w-6 text-green-600" />
          </div>
          <h3 class="font-medium text-gray-900 mb-1">Growing Together</h3>
          <p class="text-sm text-gray-600">We grow when your business grows</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar class="h-6 w-6 text-purple-600" />
          </div>
          <h3 class="font-medium text-gray-900 mb-1">Partnership</h3>
          <p class="text-sm text-gray-600">Let's become your AI partner after trying our tools</p>
        </div>
      </div>
    </CardContent>
  </Card>
  
  <!-- Partnership Popup -->
  <PartnershipPopup 
    isOpen={showPartnershipPopupState} 
    onConsultationClick={showConsultationPopup}
  />
  
  <!-- Consultation Popup -->
  <ConsultationPopup isOpen={showConsultationPopupState} />
</div> 