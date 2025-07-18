<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Building2, User, Mail, Phone, MapPin, ArrowRight } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let currentUser = $derived($page.data.user);
  let isProcessing = $state(false);
  let currentStep = $state(1);
  
  // Form data
  let organizationName = $state('');
  let organizationType = $state('');
  let businessAddress = $state('');
  let phoneNumber = $state('');
  let website = $state('');
  
  onMount(() => {
    // Redirect if user already has organization
    if (currentUser?.organization) {
      goto('/app/home');
    }
  });
  
  const organizationTypes = [
    'Retail',
    'Restaurant',
    'Service Business',
    'Healthcare',
    'Professional Services',
    'Manufacturing',
    'Construction',
    'Technology',
    'Other'
  ];
  
  async function handleSubmit() {
    if (!organizationName.trim() || !organizationType) {
      alert('Please fill in all required fields');
      return;
    }
    
    isProcessing = true;
    
    try {
      // Create organization
      const response = await fetch('http://localhost:5235/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: organizationName,
          ownerId: currentUser.sub, // Use the user's ID as owner
          createdAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Redirect to app home after successful organization creation
        goto('/app/home');
      } else {
        throw new Error('Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      isProcessing = false;
    }
  }
  
  function nextStep() {
    if (currentStep < 2) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Building2 class="h-6 w-6 text-blue-600" />
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome to Ed&Sy</h2>
      <p class="text-gray-600">Let's set up your business profile to get started</p>
    </div>
    
    <!-- Progress indicator -->
    <div class="flex items-center justify-center space-x-2 mb-8">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          1
        </div>
        <div class="w-12 h-1 bg-blue-600"></div>
      </div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full {currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center text-sm font-medium">
          2
        </div>
      </div>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle class="text-xl">
          {currentStep === 1 ? 'Business Information' : 'Contact Details'}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 
            ? 'Tell us about your business' 
            : 'How can customers reach you?'}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        {#if currentStep === 1}
          <!-- Step 1: Business Information -->
          <div class="space-y-4">
            <div>
              <Label for="org-name">Business Name *</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Enter your business name"
                bind:value={organizationName}
                required
              />
            </div>
            
            <div>
              <Label for="org-type">Business Type *</Label>
              <select
                id="org-type"
                bind:value={organizationType}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select business type</option>
                {#each organizationTypes as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>
          </div>
        {:else}
          <!-- Step 2: Contact Details -->
          <div class="space-y-4">
            <div>
              <Label for="address">Business Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, Toronto, ON"
                bind:value={businessAddress}
              />
            </div>
            
            <div>
              <Label for="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(416) 555-0123"
                bind:value={phoneNumber}
              />
            </div>
            
            <div>
              <Label for="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourbusiness.com"
                bind:value={website}
              />
            </div>
          </div>
        {/if}
        
        <!-- Navigation buttons -->
        <div class="flex justify-between pt-4">
          {#if currentStep > 1}
            <Button variant="outline" onclick={prevStep}>
              Back
            </Button>
          {:else}
            <div></div>
          {/if}
          
          {#if currentStep === 1}
            <Button onclick={nextStep} disabled={!organizationName.trim() || !organizationType}>
              Next
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          {:else}
            <Button onclick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? 'Creating...' : 'Complete Setup'}
            </Button>
          {/if}
        </div>
      </CardContent>
    </Card>
    
    <!-- Skip option -->
    <div class="text-center">
      <button 
        class="text-sm text-gray-500 hover:text-gray-700"
        onclick={() => goto('/app/home')}
      >
        Skip for now
      </button>
    </div>
  </div>
</div> 