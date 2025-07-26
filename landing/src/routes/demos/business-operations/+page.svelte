<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { 
    MessageSquare, 
    AlertTriangle, 
    CheckCircle, 
    Truck, 
    Zap,
    Settings,
    Play,
    RotateCcw,
    Clock,
    Star,
    User,
    Bot,
    Send,
    AlertCircle,
    Globe,
    Headphones
  } from 'lucide-svelte';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';

  let messageInput = '';
  let loading = false;
  let showEmergencyModal = false;
  let currentJob: any = null;
  let technicianStatus = 'available';
  let isDemoRunning = $state(false);
  let showMobileSetup = $state(true);
  let demoError = $state("");
  let demoSuccess = $state("");

  let chatHistory = [
    {
      id: '1',
      role: 'ai',
      content: 'Hi! This is your business operations assistant. I can help with urgent job dispatch, technician coordination, and field service management. What do you need?'
    }
  ];

  let chatWindow: HTMLDivElement | null = null;

  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  function sendMessage() {
    if (!messageInput.trim() || !isDemoRunning) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'customer',
      content: messageInput
    };

    chatHistory = [...chatHistory, userMessage];
    messageInput = '';
    loading = true;

    setTimeout(() => {
      processMessage(userMessage);
      loading = false;
      scrollToBottom();
    }, 1500);
  }

  function processMessage(userMessage: any) {
    const text = userMessage.content.toLowerCase();
    
    if (text.includes('emergency') || text.includes('urgent') || text.includes('burst') || text.includes('leak')) {
      const emergencyJob = {
        jobId: 'EMG-' + Date.now().toString().slice(-6),
        service: text.includes('pipe') ? 'Emergency Plumbing' : 'Emergency Service',
        address: '123 Main St, Anytown, USA',
        technician: 'Mike Johnson',
        eta: '15 minutes'
      };

      const dispatchMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: `🚨 URGENT JOB DISPATCHED!\n\nService: ${emergencyJob.service}\nAddress: ${emergencyJob.address}\nTechnician: ${emergencyJob.technician}\nETA: ${emergencyJob.eta}\n\nTechnician notified and en route.`
      };

      chatHistory = [...chatHistory, dispatchMessage];
      currentJob = emergencyJob;
      technicianStatus = 'en-route';
    } else if (text.includes('status') || text.includes('update')) {
      const statusMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `📊 Current Status:\n• Active Jobs: 3\n• Available Technicians: 2\n• Average Response Time: 12 minutes\n• Customer Satisfaction: 4.8/5`
      };
      chatHistory = [...chatHistory, statusMessage];
    } else {
      const defaultMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: 'I can help with:\n• Emergency dispatch\n• Job scheduling\n• Status updates\n• Technician coordination\n\nWhat do you need?'
      };
      chatHistory = [...chatHistory, defaultMessage];
    }
  }

  function triggerEmergency() {
    showEmergencyModal = true;
  }

  function dispatchEmergency() {
    showEmergencyModal = false;
    const emergencyText = 'EMERGENCY: Burst pipe at 123 Main St, water everywhere! Need immediate assistance!';
    messageInput = emergencyText;
    sendMessage();
  }

  function startDemo() {
    isDemoRunning = true;
    demoSuccess = "Business Operations demo started successfully!";
    demoError = "";
  }

  function resetDemo() {
    isDemoRunning = false;
    demoSuccess = "";
    demoError = "";
    chatHistory = [
      {
        id: '1',
        role: 'ai',
        content: 'Hi! This is your business operations assistant. I can help with urgent job dispatch, technician coordination, and field service management. What do you need?'
      }
    ];
    messageInput = '';
    currentJob = null;
    technicianStatus = 'available';
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  onMount(() => {
    scrollToBottom();
  });
</script>

<div class="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0); background-size: 20px 20px;"></div>
  </div>

  <div class="relative z-10 flex h-[calc(100vh-60px)]">
    <!-- Chat Interface (Left - Takes remaining space) -->
    <div class="flex-1 flex flex-col lg:mr-80">
      <!-- Chat Area -->
      <div class="flex-1 p-3 lg:p-6 h-full">
        <!-- Mobile: Single Unified Card -->
        <div class="lg:hidden">
          <Card class="h-full h-[calc(100vh-100px)] bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-green-500 text-white">
                    <Truck class="w-4 h-4" />
              </div>
              <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Business Operations</h3>
                    <p class="text-xs text-gray-600">
                      {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <CreditDisplay />
                  <!-- Mobile Setup Toggle -->
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    class="text-gray-600 hover:text-gray-900"
                    onclick={() => showMobileSetup = !showMobileSetup}
                  >
                    <Settings class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Mobile Setup Section -->
              {#if showMobileSetup}
                <div class="border-b border-gray-200 p-4 bg-gray-50">
                  <div class="space-y-4">
                    <!-- Demo Status -->
                    {#if demoError}
                      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-center gap-2 text-yellow-700">
                          <AlertCircle class="w-4 h-4" />
                          <span class="text-sm">{demoError}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Demo Success -->
                    {#if demoSuccess}
                      <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex items-center gap-2 text-green-700">
                          <CheckCircle class="w-4 h-4" />
                          <span class="text-sm">{demoSuccess}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Demo Controls -->
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                      {#if !isDemoRunning}
                        <Button 
                          variant="default"
                          onclick={startDemo}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          Start Demo
                        </Button>
                      {/if}
                      {#if isDemoRunning}
                        <Button 
                          variant="outline"
                          onclick={resetDemo}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <RotateCcw class="w-4 h-4" />
                          Reset Demo
                        </Button>
                      {/if}
            </div>
            </div>
          </div>
              {/if}

              <!-- Messages Area -->
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0" bind:this={chatWindow}>
                {#if !isDemoRunning}
                  <div class="text-center py-6 text-gray-500">
                    <Truck class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Business Operations</p>
                    <p class="text-xs">Tap the settings icon above to start the demo, then begin chatting</p>
                  </div>
                {:else}
            {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'customer' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'customer' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[85%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'customer' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'customer'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Truck class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-2 rounded-lg min-w-[80px] {message.role === 'customer' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-xs whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if loading}
                    <div class="flex gap-2 justify-start">
                      <div class="flex gap-2 max-w-[85%]">
                        <div class="p-1.5 rounded-full bg-gray-200 text-gray-700">
                          <Truck class="w-3 h-3" />
                        </div>
                        <div class="p-2 rounded-lg bg-gray-100 text-gray-900">
                          <div class="flex gap-1">
                            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}
                {/if}
              </div>

              <!-- Message Input -->
              {#if isDemoRunning}
                <div class="border-t border-gray-200 p-3 flex-shrink-0">
                  <div class="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      bind:value={messageInput}
                      onkeydown={handleKeyPress}
                      class="flex-1 text-sm"
                      disabled={loading}
                    />
                    <Button onclick={sendMessage} disabled={loading || !messageInput.trim()} size="sm">
                      <Send class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              {/if}
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Separate Chat Card -->
        <div class="hidden lg:block">
          <Card class="h-full h-[calc(100vh-100px)] bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-green-500 text-white">
                  <Truck class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Business Operations</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline">
                  <Truck class="w-4 h-4" />
                  <span>Dispatch</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>Coordination</span>
                </Badge>
                <Badge variant="outline">
                  <Zap class="w-4 h-4" />
                  <span>Automation</span>
                </Badge>
                <Badge variant="outline">
                  <AlertTriangle class="w-4 h-4" />
                  <span>Emergency</span>
                </Badge>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <CreditDisplay />
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0" bind:this={chatWindow}>
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <Truck class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to Business Operations</p>
                    <p class="text-sm">Click Start Demo in the sidebar to begin managing your operations</p>
                  </div>
                {:else}
                  {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'customer' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'customer' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[80%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'customer' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'customer'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Truck class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-3 rounded-lg min-w-[80px] {message.role === 'customer' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-sm whitespace-pre-line">{message.content}</p>
                        </div>
                </div>
              </div>
            {/each}
                  
            {#if loading}
                    <div class="flex gap-3 justify-start">
                      <div class="flex gap-3 max-w-[80%]">
                        <div class="p-2 rounded-full bg-gray-200 text-gray-700">
                          <Truck class="w-4 h-4" />
                        </div>
                        <div class="p-3 rounded-lg bg-gray-100 text-gray-900">
                          <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
                    </div>
                  {/if}
            {/if}
          </div>

              <!-- Message Input -->
              {#if isDemoRunning}
                <div class="border-t border-gray-200 p-4 flex-shrink-0">
                  <div class="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                bind:value={messageInput}
                      onkeydown={handleKeyPress}
                      class="flex-1 text-base"
                      disabled={loading}
                    />
                    <Button onclick={sendMessage} disabled={loading || !messageInput.trim()}>
                      <Send class="w-4 h-4" />
              </Button>
                  </div>
          </div>
              {/if}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar (Right) -->
    <div class="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 absolute right-0 top-0 h-full overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Credit Display -->
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
          <span class="text-sm font-medium text-gray-700">Credits</span>
          <CreditDisplay />
        </div>
        <!-- Demo Status -->
        {#if demoError}
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center gap-2 text-yellow-700">
              <AlertCircle class="w-4 h-4" />
              <span class="text-sm">{demoError}</span>
            </div>
          </div>
        {/if}

        <!-- Demo Success -->
        {#if demoSuccess}
          <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center gap-2 text-green-700">
              <CheckCircle class="w-4 h-4" />
              <span class="text-sm">{demoSuccess}</span>
            </div>
            </div>
      {/if}

        <!-- Demo Information -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            <span>Duration 3-5 minutes</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Star class="w-4 h-4" />
            <span>Difficulty: Easy</span>
          </div>
        </div>

        <!-- Key Features -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-900">Key Features</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Truck class="w-4 h-4 text-green-600" />
              <span>Emergency dispatch</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare class="w-4 h-4 text-green-600" />
              <span>Technician coordination</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Zap class="w-4 h-4 text-green-600" />
              <span>Automated workflows</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Headphones class="w-4 h-4 text-green-600" />
              <span>Real-time updates</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          {#if !isDemoRunning}
            <Button 
              variant="default"
              onclick={startDemo}
              class="w-full flex items-center gap-2 text-base"
            >
              <Play class="w-4 h-4" />
              Start Demo
          </Button>
          {/if}
          {#if isDemoRunning}
            <Button 
              variant="outline"
              onclick={resetDemo}
              class="w-full flex items-center gap-2 text-base"
            >
              <RotateCcw class="w-4 h-4" />
              Reset Demo
          </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div> 