<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { CheckSquare, Mail, Phone, Calendar, CheckCircle } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  let currentUser = $derived($page.data.user);
  let email = $state('');
  let phone = $state('');
  let selectedScenarios = $state([]);
  let isProcessing = $state(false);
  let isSettingUp = $state(false);
  let setupProgress = $state(0);
  let setupComplete = $state(false);
  
  const automationScenarios = [
    {
      id: 'appointment-booking',
      title: 'Appointment Booking',
      description: 'Automate customer appointment scheduling',
      icon: Calendar,
      features: ['Calendar integration', 'SMS confirmations', 'Reminder notifications']
    },
    {
      id: 'lead-capture',
      title: 'Lead Capture',
      description: 'Automate lead collection and follow-up',
      icon: Mail,
      features: ['Form submissions', 'Email sequences', 'CRM integration']
    },
    {
      id: 'customer-support',
      title: 'Customer Support',
      description: 'Automate support ticket management',
      icon: CheckSquare,
      features: ['Ticket routing', 'Auto-responses', 'Escalation rules']
    },
    {
      id: 'inventory-alerts',
      title: 'Inventory Alerts',
      description: 'Automate inventory management',
      icon: CheckSquare,
      features: ['Low stock alerts', 'Reorder notifications', 'Stock tracking']
    },
    {
      id: 'payment-reminders',
      title: 'Payment Reminders',
      description: 'Automate payment collection',
      icon: Mail,
      features: ['Invoice reminders', 'Payment confirmations', 'Overdue alerts']
    },
    {
      id: 'marketing-campaigns',
      title: 'Marketing Campaigns',
      description: 'Automate marketing outreach',
      icon: Mail,
      features: ['Email campaigns', 'Social media posts', 'Analytics tracking']
    }
  ];
  
  function toggleScenario(scenarioId: string) {
    if (selectedScenarios.includes(scenarioId)) {
      selectedScenarios = selectedScenarios.filter(id => id !== scenarioId);
    } else {
      selectedScenarios = [...selectedScenarios, scenarioId];
    }
  }
  
  function validateForm() {
    if (!email.trim()) {
      alert('Please enter your email address');
      return false;
    }
    
    if (!phone.trim()) {
      alert('Please enter your phone number');
      return false;
    }
    
    if (selectedScenarios.length === 0) {
      alert('Please select at least one automation scenario');
      return false;
    }
    
    return true;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isProcessing = true;
    
    // Simulate automation setup
    isSettingUp = true;
    for (let i = 0; i <= 100; i += 10) {
      setupProgress = i;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    isSettingUp = false;
    setupComplete = true;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isProcessing = false;
    
    // Navigate to automation interface
    goto('/app/demos/task-automation/automation');
  }
</script>

<div class="px-4 lg:px-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <a href="/app/demos" class="text-sm text-gray-500 hover:text-gray-700">
        ← Back to Demos
      </a>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Task Automation Setup</h1>
    <p class="text-gray-600">
      Provide your contact information and select automation scenarios
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Contact Information -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Mail class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              We'll use this to set up your automation workflows
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            bind:value={email}
            disabled={isProcessing}
          />
          <p class="text-xs text-gray-500">
            Used for calendar integration and notifications
          </p>
        </div>
        
        <div class="space-y-2">
          <Label for="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            bind:value={phone}
            disabled={isProcessing}
          />
          <p class="text-xs text-gray-500">
            Used for SMS notifications and reminders
          </p>
        </div>
        
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">What we'll set up:</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Calendar integration for scheduling
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              SMS notification system
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Email automation workflows
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Third-party integrations
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
    
    <!-- Automation Scenarios -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckSquare class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Select Scenarios</CardTitle>
            <CardDescription>
              Choose which automation scenarios you want to explore
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each automationScenarios as scenario}
            {@const Icon = scenario.icon}
            <div class="border rounded-lg p-4 {selectedScenarios.includes(scenario.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={scenario.id}
                  checked={selectedScenarios.includes(scenario.id)}
                  onchange={() => toggleScenario(scenario.id)}
                  disabled={isProcessing}
                  class="mt-1"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon class="h-4 w-4 text-gray-600" />
                    <h3 class="font-medium text-gray-900">{scenario.title}</h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <ul class="text-xs text-gray-500 space-y-1">
                    {#each scenario.features as feature}
                      <li>• {feature}</li>
                    {/each}
                  </ul>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
  </div>
  
  <!-- Submit Button -->
  <Card class="mt-8">
    <CardContent class="pt-6">
      <Button 
        class="w-full" 
        onclick={handleSubmit}
        disabled={isProcessing || !email.trim() || !phone.trim() || selectedScenarios.length === 0}
      >
        {#if isProcessing}
          {#if isSettingUp}
            Setting Up Automation... {setupProgress}%
          {:else}
            Processing...
          {/if}
        {:else}
          Start Automation Setup
        {/if}
      </Button>
    </CardContent>
  </Card>
  
  <!-- Progress Indicator -->
  {#if isSettingUp}
    <Card class="mt-8">
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">Setting Up Automation</p>
              <p class="text-sm text-gray-600">Configuring {selectedScenarios.length} scenario{selectedScenarios.length > 1 ? 's' : ''}</p>
            </div>
            <span class="text-sm font-medium text-gray-900">{setupProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {setupProgress}%"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- Success Message -->
  {#if setupComplete}
    <Card class="mt-8 border-green-200 bg-green-50">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <CheckCircle class="h-6 w-6 text-green-600" />
          <div>
            <p class="font-medium text-green-900">Automation Setup Complete!</p>
            <p class="text-sm text-green-700">Your automation workflows are ready to explore.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div> 