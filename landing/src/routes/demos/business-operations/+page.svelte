<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
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
    Headphones,
    Coins
  } from 'lucide-svelte';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import { supabase } from '$lib/supabase';

  let currentCredits: any = $state(null);
  let currentSessionId: string | null = $state(null);
  let messageInput = $state('');
  let loading = $state(false);
  let showEmergencyModal = $state(false);
  let currentJob: any = null;
  let technicianStatus = 'available';
  let isDemoRunning = $state(false);
  let showMobileSetup = $state(true);
  let demoError = $state("");
  let demoSuccess = $state("");
  let estimatedTime = $state(0);
  let trainingCost = $state(0);
  let supabaseSessionId: string | null = null;
  let supabaseUserId: string | null = null;

  let chatHistory = [
    {
      id: '1',
      role: 'ai',
      content: 'Hi! This is your business operations assistant. I can help with urgent job dispatch, technician coordination, and field service management. What do you need?'
    }
  ];

  let chatWindow: HTMLDivElement | null = null;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    supabaseSessionId = session?.access_token ?? null;
    supabaseUserId = session?.user?.id ?? null;
    
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
    console.log('Initial credits:', currentCredits);

    // Add event listeners for browser close/unload
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (currentSessionId && isDemoRunning) {
        try {
          // Complete the session when user closes browser
          await CreditService.completeDemoSession(currentSessionId, {
            chatHistory: chatHistory,
            lastActivity: new Date().toISOString(),
            reason: 'browser_closed'
          });
          console.log('Demo session completed due to browser close');
        } catch (error) {
          console.error('Error completing session on browser close:', error);
        }
      }
    };

    const handlePageHide = async (event: PageTransitionEvent) => {
      if (currentSessionId && isDemoRunning) {
        try {
          // Complete the session when user navigates away
          await CreditService.completeDemoSession(currentSessionId, {
            chatHistory: chatHistory,
            lastActivity: new Date().toISOString(),
            reason: 'page_navigation'
          });
          console.log('Demo session completed due to page navigation');
        } catch (error) {
          console.error('Error completing session on page hide:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && currentSessionId && isDemoRunning) {
        try {
          // Complete the session when user switches tabs or minimizes browser
          await CreditService.completeDemoSession(currentSessionId, {
            chatHistory: chatHistory,
            lastActivity: new Date().toISOString(),
            reason: 'tab_switch'
          });
          console.log('Demo session completed due to tab switch');
        } catch (error) {
          console.error('Error completing session on visibility change:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store cleanup function for onDestroy
    window._demoCleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  // Handle SvelteKit navigation (internal page navigation)
  beforeNavigate(async ({ to, cancel }) => {
    if (currentSessionId && isDemoRunning) {
      try {
        // Complete the session when user navigates to another page
        await CreditService.completeDemoSession(currentSessionId, {
          chatHistory: chatHistory,
          lastActivity: new Date().toISOString(),
          reason: 'internal_navigation',
          destination: to?.url.pathname || 'unknown'
        });
        console.log('Demo session completed due to internal navigation');
      } catch (error) {
        console.error('Error completing session on navigation:', error);
      }
    }
  });

  onDestroy(() => {
    // Clean up event listeners
    if (window._demoCleanup) {
      window._demoCleanup();
    }
    
    // Complete session if still running
    if (currentSessionId && isDemoRunning) {
      CreditService.completeDemoSession(currentSessionId, {
        chatHistory: chatHistory,
        lastActivity: new Date().toISOString(),
        reason: 'component_destroy'
      }).catch(error => {
        console.error('Error completing session on destroy:', error);
      });
    }
  });

  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  async function startDemo() {
    // Demo is disabled - show coming soon message
    demoError = "This business operations demo is coming soon! We're working hard to bring you powerful field service management, technician dispatch, and operations coordination capabilities.";
  }

  async function sendMessage() {
    // Demo is disabled - show coming soon message
    demoError = "This business operations demo is coming soon! We're working hard to bring you powerful field service management, technician dispatch, and operations coordination capabilities.";
  }

  async function processBusinessOperationsMessage(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('critical')) {
      return `🚨 **EMERGENCY RESPONSE ACTIVATED** 🚨

I've identified this as a critical situation. Here's what I can do:

⚡ **Immediate Actions**:
- Dispatch nearest available technician (ETA: 15-30 min)
- Alert emergency contacts
- Notify relevant authorities if needed
- Create priority ticket with highest escalation

📞 **Emergency Protocol**:
- Customer notified of immediate response
- Safety instructions provided
- Real-time tracking enabled
- Backup technician on standby

What's the specific emergency? I'll coordinate the fastest possible response.`;
    }
    
    if (lowerMessage.includes('dispatch') || lowerMessage.includes('technician') || lowerMessage.includes('send')) {
      return `I can help you dispatch technicians efficiently! Here's what I can coordinate:

👨‍🔧 **Available Technicians**:
- John Smith (Plumbing) - 2 miles away - Available now
- Sarah Johnson (Electrical) - 5 miles away - Available in 30 min
- Mike Davis (HVAC) - 1 mile away - Available now

📋 **Dispatch Options**:
- **Nearest Available**: Fastest response time
- **Specialist Match**: Best skills for the job
- **Scheduled Visit**: Book for specific time
- **Emergency Dispatch**: Immediate priority response

What type of service do you need? I'll find the best technician match.`;
    }
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return `Perfect! Let's schedule a service appointment. Here are the available options:

📅 **Available Time Slots**:
- Today: 2:00 PM, 4:00 PM
- Tomorrow: 9:00 AM, 11:00 AM, 1:00 PM, 3:00 PM
- This Week: Multiple slots available

⏰ **Service Types**:
- **Standard Service**: 1-2 hour window
- **Priority Service**: 30-minute window
- **Emergency Service**: Immediate dispatch
- **Preventive Maintenance**: Flexible scheduling

What's the service type and preferred time? I'll book the appointment and send confirmation.`;
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('where')) {
      return `I can help you track service status in real-time! Here's what I can show you:

📍 **Live Tracking**:
- Technician location and ETA
- Job progress updates
- Route optimization
- Traffic conditions

📊 **Status Updates**:
- Job started/completed times
- Parts used and costs
- Customer satisfaction rating
- Follow-up scheduling

🔔 **Notifications**:
- Technician arrival alerts
- Job completion confirmations
- Invoice and payment reminders
- Follow-up service scheduling

Which job would you like to track? I'll show you the current status and ETA.`;
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('parts') || lowerMessage.includes('supplies')) {
      return `I can help you manage inventory and parts! Here's what I can track:

📦 **Current Inventory**:
- Plumbing parts: 85% stocked
- Electrical components: 92% stocked
- HVAC supplies: 78% stocked
- Emergency kits: 100% stocked

🔄 **Auto-Reorder System**:
- Low stock alerts
- Supplier notifications
- Bulk order optimization
- Cost tracking

📋 **Parts Management**:
- Usage tracking per job
- Warranty information
- Supplier contacts
- Cost analysis

What inventory do you need to check or reorder?`;
    }

    return `I'm here to help with your business operations! I can assist with:

🚨 **Emergency Response**: Immediate dispatch and coordination
👨‍🔧 **Technician Dispatch**: Find and send the best available tech
📅 **Service Scheduling**: Book appointments and manage calendars
📍 **Live Tracking**: Monitor job progress and technician location
📦 **Inventory Management**: Track parts, supplies, and reorders
📊 **Operations Analytics**: Performance metrics and optimization

What would you like to manage first?`;
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
              <div class="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
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
                <div class="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Truck class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Business Operations</h3>
                  <p class="text-sm text-gray-600">
                    Coming Soon
                  </p>
                </div>
              </div>
              

              
              <div class="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                  <Truck class="w-4 h-4" />
                  <span>Dispatch</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                  <MessageSquare class="w-4 h-4" />
                  <span>Coordination</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                  <Zap class="w-4 h-4" />
                  <span>Automation</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                  <AlertTriangle class="w-4 h-4" />
                  <span>Emergency</span>
                </Badge>
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
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <Clock class="h-4 w-4" />
              <span>~{estimatedTime} min</span>
            </div>
            <div class="flex items-center gap-1">
              <Coins class="h-4 w-4" />
              <span>{trainingCost} credits</span>
            </div>
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