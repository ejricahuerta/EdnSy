<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Zap, Upload, FileText, CheckCircle, X, Users, Building, ShoppingCart, Calendar, CreditCard } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  let currentUser = $derived($page.data.user);
  let uploadedFiles = $state([]);
  let selectedSystems = $state([]);
  let isProcessing = $state(false);
  let isTraining = $state(false);
  let trainingProgress = $state(0);
  let trainingComplete = $state(false);
  
  const managementSystems = [
    {
      id: 'crm',
      name: 'Customer Relationship Management',
      icon: Users,
      description: 'Manage customer data, sales, and relationships',
      features: ['Lead management', 'Sales tracking', 'Customer profiles']
    },
    {
      id: 'fsm',
      name: 'Field Service Management',
      icon: Building,
      description: 'Manage field operations and service delivery',
      features: ['Job scheduling', 'Technician dispatch', 'Service tracking']
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      icon: ShoppingCart,
      description: 'Manage online sales and inventory',
      features: ['Order management', 'Inventory tracking', 'Payment processing']
    },
    {
      id: 'calendar',
      name: 'Calendar & Scheduling',
      icon: Calendar,
      description: 'Manage appointments and scheduling',
      features: ['Appointment booking', 'Calendar sync', 'Reminder system']
    },
    {
      id: 'accounting',
      name: 'Accounting & Finance',
      icon: CreditCard,
      description: 'Manage financial data and reporting',
      features: ['Invoice management', 'Expense tracking', 'Financial reporting']
    }
  ];
  
  function handleFileUpload(event: any) {
    const files = Array.from(event.target.files);
    uploadedFiles = [...uploadedFiles, ...files];
  }
  
  function removeFile(index: number) {
    uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
  }
  
  function toggleSystem(systemId: string) {
    if (selectedSystems.includes(systemId)) {
      selectedSystems = selectedSystems.filter(id => id !== systemId);
    } else {
      selectedSystems = [...selectedSystems, systemId];
    }
  }
  
  function validateForm() {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one knowledge base file');
      return false;
    }
    
    if (selectedSystems.length === 0) {
      alert('Please select at least one management system');
      return false;
    }
    
    return true;
  }
  
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isProcessing = true;
    
    // Simulate AI training
    isTraining = true;
    for (let i = 0; i <= 100; i += 10) {
      trainingProgress = i;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    isTraining = false;
    trainingComplete = true;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isProcessing = false;
    
    // Navigate to AI assistant interface
    goto('/app/demos/ai-assistant/chat');
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
    <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Assistant Setup</h1>
    <p class="text-gray-600">
      Upload your knowledge base and select management systems for your AI assistant
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Knowledge Base Upload -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Upload class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Upload files containing your business knowledge and processes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-sm text-gray-600 mb-2">
              Upload SOPs, manuals, guides, and business documents
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              onchange={handleFileUpload}
              class="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label for="file-upload" class="cursor-pointer">
              <Button variant="outline" disabled={isProcessing}>
                Choose Files
              </Button>
            </label>
          </div>
          
          <!-- Uploaded Files -->
          {#if uploadedFiles.length > 0}
            <div class="space-y-2">
              <h3 class="font-medium text-gray-900">Uploaded Files:</h3>
              <div class="space-y-2">
                {#each uploadedFiles as file, index}
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <FileText class="h-4 w-4 text-gray-500" />
                      <span class="text-sm text-gray-700">{file.name}</span>
                      <span class="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onclick={() => removeFile(index)}
                      class="text-red-500 hover:text-red-700"
                      disabled={isProcessing}
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">What we'll train the AI on:</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Business processes and SOPs
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Customer service procedures
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Product and service information
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Company policies and guidelines
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
    
    <!-- Management Systems -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <Zap class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Management Systems</CardTitle>
            <CardDescription>
              Select the systems your AI assistant should be trained on
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each managementSystems as system}
            {@const Icon = system.icon}
            <div class="border rounded-lg p-4 {selectedSystems.includes(system.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={system.id}
                  checked={selectedSystems.includes(system.id)}
                  onchange={() => toggleSystem(system.id)}
                  disabled={isProcessing}
                  class="mt-1"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Icon class="h-4 w-4 text-gray-600" />
                    <h3 class="font-medium text-gray-900">{system.name}</h3>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{system.description}</p>
                  <div class="flex flex-wrap gap-1">
                    {#each system.features as feature}
                      <Badge variant="secondary" class="text-xs">{feature}</Badge>
                    {/each}
                  </div>
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
        disabled={isProcessing || uploadedFiles.length === 0 || selectedSystems.length === 0}
      >
        {#if isProcessing}
          {#if isTraining}
            Training AI Assistant... {trainingProgress}%
          {:else}
            Processing...
          {/if}
        {:else}
          Start AI Training
        {/if}
      </Button>
    </CardContent>
  </Card>
  
  <!-- Progress Indicator -->
  {#if isTraining}
    <Card class="mt-8">
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">Training AI Assistant</p>
              <p class="text-sm text-gray-600">Training on {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} and {selectedSystems.length} system{selectedSystems.length > 1 ? 's' : ''}</p>
            </div>
            <span class="text-sm font-medium text-gray-900">{trainingProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {trainingProgress}%"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- Success Message -->
  {#if trainingComplete}
    <Card class="mt-8 border-green-200 bg-green-50">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <CheckCircle class="h-6 w-6 text-green-600" />
          <div>
            <p class="font-medium text-green-900">AI Training Complete!</p>
            <p class="text-sm text-green-700">Your AI assistant is ready to help with your business tasks.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div> 