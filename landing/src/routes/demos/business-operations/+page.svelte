<script lang="ts">
  import { onMount, tick } from 'svelte';
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

  let currentCredits: any = $state(null);
  let currentSessionId: string | null = $state(null);
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

  onMount(async () => {
    // Ensure user record exists in database (creates with 200 credits if new)
    try {
      const response = await fetch('/api/credits/test');
      const testResult = await response.json();
      console.log('User setup result:', testResult);
    } catch (error) {
      console.error('Error setting up user:', error);
    }
    
    // Load initial credits
    currentCredits = await CreditService.getUserCredits();
    console.log('Initial credits loaded:', currentCredits);
    scrollToBottom();
  });

  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  async function sendMessage() {
    // Demo is disabled - show coming soon message
    demoError = "This demo is coming soon! We're working hard to bring you powerful business operations capabilities.";
  }

  function processMessage(userMessage: any) {
    // Demo is disabled
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

  async function startDemo() {
    // Demo is disabled - show coming soon message
    demoError = "This demo is coming soon! We're working hard to bring you powerful business operations capabilities.";
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
    currentSessionId = null;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
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
                      Coming Soon
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <CreditDisplay credits={currentCredits} />
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
                      <Button 
                        variant="default"
                        onclick={startDemo}
                        class="w-full flex items-center gap-2 text-sm"
                        size="sm"
                        disabled
                      >
                        <Play class="w-4 h-4" />
                        Coming Soon
                      </Button>
            </div>
            </div>
          </div>
              {/if}

              <!-- Messages Area -->
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0" bind:this={chatWindow}>
                <div class="text-center py-6 text-gray-500">
                  <Truck class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p class="text-base font-medium">Coming Soon</p>
                  <p class="text-xs">We're working hard to bring you powerful business operations capabilities.</p>
                </div>
              </div>

              <!-- Message Input -->
              <div class="border-t border-gray-200 p-3 flex-shrink-0">
                <div class="flex gap-2">
                  <Input
                    placeholder="Demo coming soon..."
                    class="flex-1 text-sm"
                    disabled
                  />
                  <Button size="sm" disabled>
                    <Send class="w-3 h-3" />
                  </Button>
                </div>
              </div>
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
                    Coming Soon
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
                <CreditDisplay credits={currentCredits} />
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0" bind:this={chatWindow}>
                <div class="text-center py-8 text-gray-500">
                  <Truck class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p class="text-lg font-medium">Coming Soon</p>
                  <p class="text-sm">We're working hard to bring you powerful business operations capabilities.</p>
                </div>
          </div>

              <!-- Message Input -->
              <div class="border-t border-gray-200 p-4 flex-shrink-0">
                <div class="flex gap-2">
                  <Input
                    placeholder="Demo coming soon..."
                bind:value={messageInput}
                      class="flex-1 text-base"
                      disabled
                    />
                    <Button disabled>
                      <Send class="w-4 h-4" />
              </Button>
                  </div>
          </div>
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
          <CreditDisplay credits={currentCredits} />
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
          <Button 
            variant="default"
            onclick={startDemo}
            class="w-full flex items-center gap-2 text-base"
            disabled
          >
            <Play class="w-4 h-4" />
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  </div>
</div> 