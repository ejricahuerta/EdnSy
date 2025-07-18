<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Badge } from '$lib/components/ui/badge';
  import { Workflow, Zap, Sparkles, CheckCircle, Clock, Play, Pause, Square, Settings, ArrowRight, Calendar, Mail, Database, Phone, User, AlertTriangle, Timer, Users, FileText, CalendarDays, Receipt, CreditCard, MessageSquare, Instagram, Users2, Package } from '@lucide/svelte';
  
  let currentUser = $derived($page.data.user);
  let selectedPainPoint = $state('invoice-processing');
  let customerEmail = $state('');
  let customerPhone = $state('');
  let isProcessing = $state(false);
  let isBuilding = $state(false);
  let buildProgress = $state(0);
  let buildComplete = $state(false);
  let automationLogs = $state<string[]>([]);
  
  const painPoints = [
    { 
      id: 'invoice-processing', 
      name: 'Invoice Processing', 
      description: 'Automatically process and categorize invoices',
      icon: Receipt,
      color: 'text-blue-600',
      problem: 'Manually processing invoices, entering data into accounting systems, and chasing missing information. Takes hours every week.',
      solution: 'AI automatically extracts invoice data, categorizes expenses, and updates your accounting system'
    },
    { 
      id: 'customer-feedback', 
      name: 'Customer Feedback Management', 
      description: 'Handle customer reviews and feedback automatically',
      icon: MessageSquare,
      color: 'text-green-600',
      problem: 'Missing customer reviews, not responding to feedback, and losing valuable insights from customer comments.',
      solution: 'AI monitors reviews, responds to feedback, and alerts you to important customer issues'
    },
    { 
      id: 'inventory-requests', 
      name: 'Inventory Management', 
      description: 'Automate inventory requests and stock alerts',
      icon: Package,
      color: 'text-purple-600',
      problem: 'Running out of popular items, overstocking slow movers, and manual inventory tracking. Wastes money and time.',
      solution: 'AI tracks inventory levels, sends reorder alerts, and predicts stock needs based on sales patterns'
    },
    { 
      id: 'email-management', 
      name: 'Email Organization', 
      description: 'Sort and respond to business emails automatically',
      icon: Mail,
      color: 'text-orange-600',
      problem: 'Drowning in emails, missing important messages, and spending hours sorting through inbox clutter.',
      solution: 'AI categorizes emails, drafts responses, and prioritizes urgent messages'
    },
    { 
      id: 'appointment-scheduling', 
      name: 'Appointment Scheduling', 
      description: 'Automate booking and calendar management',
      icon: Calendar,
      color: 'text-red-600',
      problem: 'Endless back-and-forth calls to book appointments, managing cancellations, and sending reminders manually.',
      solution: 'AI handles booking requests, sends confirmations, and manages your calendar automatically'
    },
    { 
      id: 'data-entry', 
      name: 'Data Entry Automation', 
      description: 'Convert paper forms to digital records',
      icon: FileText,
      color: 'text-indigo-600',
      problem: 'Copying information from paper forms to spreadsheets, updating customer details across multiple systems.',
      solution: 'AI scans documents, extracts data, and updates all your systems automatically'
    }
  ];
  
  function addLog(message: string) {
    automationLogs = [...automationLogs, `${new Date().toLocaleTimeString()}: ${message}`];
  }
  
  async function handleSubmit() {
    if (!customerEmail.trim() || !customerPhone.trim()) {
      alert('Please enter both email and phone number');
      return;
    }
    
    isProcessing = true;
    isBuilding = true;
    automationLogs = [];
    
    const selectedPain = painPoints.find(p => p.id === selectedPainPoint);
    addLog(`Building automation for: ${selectedPain?.name}`);
    
    // Simulate building automation
    for (let i = 0; i <= 100; i += 10) {
      buildProgress = i;
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (i === 30) addLog('Setting up automation triggers...');
      if (i === 60) addLog('Configuring notification channels...');
      if (i === 90) addLog('Testing automation rules...');
    }
    
    isBuilding = false;
    buildComplete = true;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add completion logs based on selected task
    if (selectedPainPoint === 'invoice-processing') {
      addLog('✓ Invoice processing automation activated');
      addLog(`✓ Expense categorization enabled for ${customerEmail}`);
      addLog(`✓ Accounting system integration configured`);
    } else if (selectedPainPoint === 'customer-feedback') {
      addLog('✓ Customer feedback monitoring enabled');
      addLog(`✓ Review response automation activated for ${customerEmail}`);
      addLog(`✓ Feedback alert system configured`);
    } else if (selectedPainPoint === 'inventory-requests') {
      addLog('✓ Inventory management automation activated');
      addLog(`✓ Stock level monitoring enabled for ${customerEmail}`);
      addLog(`✓ Reorder alerts and predictions configured`);
    } else if (selectedPainPoint === 'email-management') {
      addLog('✓ Email organization automation activated');
      addLog(`✓ Email categorization enabled for ${customerEmail}`);
      addLog(`✓ Priority message alerts configured`);
    } else if (selectedPainPoint === 'appointment-scheduling') {
      addLog('✓ Appointment scheduling automation activated');
      addLog(`✓ Booking confirmations enabled for ${customerEmail}`);
      addLog(`✓ Calendar management system configured`);
    } else if (selectedPainPoint === 'data-entry') {
      addLog('✓ Data entry automation activated');
      addLog(`✓ Document scanning enabled for ${customerEmail}`);
      addLog(`✓ Cross-system data syncing configured`);
    }
    
    addLog('🎉 Automation ready! Time saved: 5-10 hours weekly');
    isProcessing = false;
  }
</script>

<div class="flex h-full">
  <!-- Setup Panel (2/3) -->
  <div class="w-2/3 border-r border-gray-200 p-6">
    <div class="space-y-6">
      <!-- Simple Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-2">Task Automation Helper</h1>
        <p class="text-gray-600">Transform your business with automation</p>
      </div>
      
      <!-- Contact Form -->
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="your@business.com"
              bind:value={customerEmail}
              disabled={isProcessing}
              class="w-full h-10 px-3 border rounded-md mt-1"
            />
          </div>
          
          <div>
            <label class="text-sm font-medium">Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              bind:value={customerPhone}
              disabled={isProcessing}
              class="w-full h-10 px-3 border rounded-md mt-1"
            />
          </div>
        </div>
      </div>
      
      <!-- Task Selection -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Choose a task to automate:</label>
        <div class="grid grid-cols-2 gap-2">
          {#each painPoints as painPoint}
            {@const Icon = painPoint.icon}
            <button
              class="p-3 border rounded-md text-left {selectedPainPoint === painPoint.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'} cursor-pointer"
              onclick={() => selectedPainPoint = painPoint.id}
              disabled={isProcessing}
            >
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 {painPoint.color}" />
                <span class="text-sm">{painPoint.name}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Tools & Integrations -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Tools</label>
        <div class="flex flex-wrap gap-1">
          <Badge variant="outline" class="text-xs">WhatsApp</Badge>
          <Badge variant="outline" class="text-xs">SMS</Badge>
          <Badge variant="outline" class="text-xs">Gmail</Badge>
          <Badge variant="outline" class="text-xs">Excel</Badge>
          <Badge variant="outline" class="text-xs">Google Calendar</Badge>
          <Badge variant="outline" class="text-xs">Phone Calls</Badge>
        </div>
      </div>
      
      <!-- Action Button -->
      <button 
        class="w-full h-12 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 cursor-pointer"
        onclick={handleSubmit}
        disabled={isProcessing || !customerEmail.trim() || !customerPhone.trim()}
      >
        {#if isProcessing}
          {#if isBuilding}
            Building automation... {buildProgress}%
          {:else}
            Deploying solution...
          {/if}
        {:else}
          Automate This Task
        {/if}
      </button>
      
      <!-- Progress Bar -->
      {#if isBuilding}
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {buildProgress}%"></div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Logs Panel (1/3) -->
  <div class="w-1/3 p-6">
    <div class="space-y-4">
      <div>
        <h2 class="font-semibold mb-2">Automation Logs</h2>
        <p class="text-sm text-gray-600">Watch the automation process in real-time</p>
      </div>
      
      {#if automationLogs.length === 0}
        <div class="bg-gray-50 rounded-lg p-8 text-center">
          <div class="text-gray-400 mb-2">
            <Workflow class="h-8 w-8 mx-auto" />
          </div>
          <p class="text-sm text-gray-500">Enter your details and start automation to see logs</p>
        </div>
      {:else}
        <div class="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
          {#each automationLogs as log}
            <div class="text-sm text-gray-700 mb-2 font-mono">
              {log}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div> 