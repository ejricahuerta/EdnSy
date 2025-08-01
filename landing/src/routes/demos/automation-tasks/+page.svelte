<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import DailyTaskDemo from '$lib/components/demos/DailyTaskDemo.svelte';
  import { 
    Zap, 
    Workflow, 
    MessageSquare, 
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    FileText,
    Settings,
    Play,
    RotateCcw,
    Star,
    User,
    Bot,
    Send,
    AlertCircle,
    Globe,
    Headphones,
    Mail,
    Phone,
    Coins
  } from 'lucide-svelte';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "$lib/components/ui/dialog";
  import { supabase } from '$lib/supabase';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import { marked } from 'marked';
  import { beforeNavigate } from '$app/navigation';

  function formatBotText(text: string): string {
    // Basic sanitization: escape < and >, then parse markdown
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return marked.parse(safeText) as string;
  }

  let activeTab = 'demo';
  let supabaseSessionId: string | null = null;
  let supabaseUserId: string | null = null;
  let currentCredits: any = $state(null);

  let isDemoRunning = $state(false);
  let isTraining = $state(false);
  let showMobileSetup = $state(true);
  let demoError = $state("");
  let demoSuccess = $state("");
  let messageInput = $state("");
  let website = $state("");
  let emailAddress = $state("");
  let phone = $state("");
  let websiteValidation = $state("");
  let emailValidation = $state("");
  let phoneValidation = $state("");
  let chatHistory: Array<{ id: string; role: string; text: string; timestamp?: Date }> = $state([]);
  let loading = $state(false);
  let trainingProgress = $state(0);
  let trainingError = $state("");
  let trainingSuccess = $state("");
  let currentTrainingStep = $state("");
  let trainingStepIndex = 0;
  let trainingStepInterval: ReturnType<typeof setInterval> | null = null;
  let showDemoReadyDialog = $state(false);

  let webhookUrl = "/api/n8n/automation-chat";
  let currentSessionId: string | null = null;
  
  // Add missing variables
  let estimatedTime = 8;
  let trainingCost = 3;
  
  // Fix window property type
  declare global {
    interface Window {
      _demoCleanup?: () => void;
    }
  }

  const trainingSteps = [
    "Initializing automation demo...",
    "Loading automation workflows...",
    "Preparing lead capture systems...",
    "Setting up email automation...",
    "Configuring phone integration...",
    "Building automation rules...",
    "Creating workflow triggers...",
    "Testing automation sequences...",
    "Finalizing demo setup...",
    "Demo ready!"
  ];

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    supabaseSessionId = session?.access_token ?? null;
    supabaseUserId = session?.user?.id ?? null;
    
    // Ensure user record exists in database (creates with 200 credits if new)
    try {
      const response = await fetch('/api/credits/test');
      const testResult = await response.json();
      // console.log('User setup result:', testResult);
    } catch (error) {
      console.error('Error setting up user:', error);
    }
    
    // Load initial credits
    currentCredits = await CreditService.getUserCredits();
    // console.log('Initial credits:', currentCredits);
    
    // Test service info retrieval
    const serviceInfo = await CreditService.getServiceInfo('automation-tasks');
    // console.log('Service info test:', serviceInfo);

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
          // console.log('Demo session completed due to browser close');
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
          // console.log('Demo session completed due to page navigation');
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
          // console.log('Demo session completed due to tab switch');
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
        // console.log('Demo session completed due to internal navigation');
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

  function validateWebsiteUrl(url: string): string {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return "Please enter a valid HTTP or HTTPS URL";
      }
      return "";
    } catch {
      return "Please enter a valid URL";
    }
  }

  function validateEmail(email: string): string {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  }

  function validatePhone(phone: string): string {
    if (!phone) return "";
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return "Please enter a valid phone number";
    }
    return "";
  }

  // Watch for input changes to validate
  $effect(() => {
    // console.log("$effect triggered:", { website, isTraining, isDemoRunning });
    if (website && !isTraining && !isDemoRunning) {
      websiteValidation = validateWebsiteUrl(website);
      // console.log("Validation result:", websiteValidation);
    } else if (!website) {
      websiteValidation = "";
      // console.log("URL is empty, clearing validation");
    }
  });

  $effect(() => {
    if (emailAddress && !isTraining && !isDemoRunning) {
      emailValidation = validateEmail(emailAddress);
    } else if (!emailAddress) {
      emailValidation = "";
    }
  });

  $effect(() => {
    if (phone && !isTraining && !isDemoRunning) {
      phoneValidation = validatePhone(phone);
    } else if (!phone) {
      phoneValidation = "";
    }
  });

  $effect(() => {
    // Show dialog when demo starts
    if (isDemoRunning) {
      showDemoReadyDialog = true;
    }
  });

  async function startDemo() {
    // console.log("startDemo called", { isDemoRunning, isTraining, website, emailAddress, phone });
    if (isDemoRunning || isTraining) return;

    try {
      // Validate website URL first
      const validation = validateWebsiteUrl(website);
      if (validation) {
        websiteValidation = validation;
        return;
      }

      // Validate email
      const emailValidationResult = validateEmail(emailAddress);
      if (emailValidationResult) {
        emailValidation = emailValidationResult;
        return;
      }

      // Validate phone
      const phoneValidationResult = validatePhone(phone);
      if (phoneValidationResult) {
        phoneValidation = phoneValidationResult;
        return;
      }

      // Check if user can start the demo (but don't charge yet)
      const { canPerform: canStart, userCredits, actionCost: demoCost } = await CreditService.canPerformAction('automation-tasks', 'training');
      
      if (!canStart) {
        alert(`Insufficient credits. You need ${demoCost} credits to start this demo. You have ${userCredits} credits.`);
        return;
      }

      isTraining = true;
      trainingProgress = 0;
      trainingError = "";
      trainingSuccess = "";

      // Simulate training progress
      const progressInterval = setInterval(() => {
        trainingProgress += Math.random() * 15;
        if (trainingProgress >= 100) {
          trainingProgress = 100;
          clearInterval(progressInterval);
        }
      }, 200);

      // Call n8n to train the automation
      const trainingResponse = await fetch('/api/n8n/train-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: website,
          emailAddress: emailAddress,
          phone: phone,
          action: 'train'
        })
      });
      
      if (!trainingResponse.ok) {
        const errorText = await trainingResponse.text();
        console.error('Training response error:', errorText);
        throw new Error(`Training failed: ${trainingResponse.status} - ${errorText}`);
      }
      
      const trainingResult = await trainingResponse.json();
      if (!trainingResult.success) {
        throw new Error(trainingResult.message || 'Training failed');
      }

      clearInterval(progressInterval);
      trainingProgress = 100;

      // Only charge credits after successful training
      const sessionResult = await CreditService.startDemoSession('automation-tasks');
      
      if (!sessionResult.success) {
        alert(sessionResult.error || 'Failed to start demo session');
        isTraining = false;
        return;
      }
      
      currentSessionId = sessionResult.sessionId || null;
      currentCredits = await CreditService.getUserCredits();
      // console.log('Credits after training:', currentCredits);
      
      // Ensure UI updates are applied
      await tick();

      isDemoRunning = true;
      isTraining = false;
      trainingSuccess = "Demo started successfully! You can now test automated workflows.";
      showDemoReadyDialog = true;
      
      // Check if user has enough credits for initial response
      const { canPerform: canPerformInitial, userCredits: userCreditsInitial, actionCost: actionCostInitial } = await CreditService.canPerformAction('automation-tasks', 'response');
      if (!canPerformInitial) {
        throw new Error(`Insufficient credits. You need ${actionCostInitial} credits for this response. You have ${userCreditsInitial} credits.`);
      }

      // Send initial message to n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'message',
          message: 'Send Welcome Message through SMS and Email to all the customers. make the message personalized based on the customer info and the our company services',
          website: website,
          email: emailAddress,
          phone: phone,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Initial message response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Deduct credits for the initial response
      if (currentSessionId) {
        const deductResult = await CreditService.deductCreditsForAction(currentSessionId, 'automation-tasks', 'response');
        if (!deductResult.success) {
          throw new Error(deductResult.error || 'Failed to deduct credits');
        }
        
        // Update current credits after deduction
        currentCredits = await CreditService.getUserCredits();
        // console.log('Credits after initial response deduction:', currentCredits);
        
        // Ensure UI updates are applied
        await tick();
      }
      
      const botResponse = {
        id: 1,
        role: 'ai',
        text: result.output || result.raw,
        timestamp: new Date()
      };
      chatHistory = [botResponse];

    } catch (error) {
      console.error('Error starting demo:', error);
      trainingError = "Failed to start demo. Please try again.";
      isTraining = false;
    }
  }

  function resetDemo() {
    isDemoRunning = false;
    isTraining = false;
    demoSuccess = "";
    demoError = "";
    trainingError = "";
    trainingSuccess = "";
    trainingProgress = 0;
    website = "";
    emailAddress = "";
    phone = "";
    websiteValidation = "";
    emailValidation = "";
    phoneValidation = "";
    chatHistory = [];
    messageInput = '';
    currentSessionId = null;
    if (trainingStepInterval) clearInterval(trainingStepInterval);
  }

  async function sendWelcomeMessage() {
    try {
      // Send welcome message to n8n and get the response
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'message',
          message: 'Send Welcome Message through SMS and Email. make the message personalized based on the customer and the company',
          website: website,
          email: emailAddress,
          phone: phone,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Welcome message failed: ${response.status}`);
      }
      
      // console.log("Welcome message sent successfully");
      const result = await response.json();
      
      // Display the welcome message response in chat
      const welcomeMessage = {
        id: Date.now().toString(),
        role: 'ai',
        text: result.output || result.raw
      };
      chatHistory = [...chatHistory, welcomeMessage];
    } catch (error) {
      console.error("Error sending welcome message:", error);
      throw error;
    }
  }

  async function sendMessage() {
    if (!messageInput.trim() || !isDemoRunning || isTraining) return;

    // Check if user has enough credits for a response
    const { canPerform, userCredits, actionCost } = await CreditService.canPerformAction('automation-tasks', 'response');
    if (!canPerform) {
      alert(`Insufficient credits. You need ${actionCost} credits for this response. You have ${userCredits} credits.`);
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageInput
    };

    chatHistory = [...chatHistory, userMessage];
    const currentMessage = messageInput;
    messageInput = '';
    loading = true;

    try {
      // Call the automation-tasks specific n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'message',
          message: currentMessage,
          website: website,
          email: emailAddress,
          phone: phone,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Message response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Deduct credits for the response
      if (currentSessionId) {
        const deductResult = await CreditService.deductCreditsForAction(currentSessionId, 'automation-tasks', 'response');
        if (!deductResult.success) {
          throw new Error(deductResult.error || 'Failed to deduct credits');
        }
        
        // Update current credits after deduction
        currentCredits = await CreditService.getUserCredits();
        // console.log('Credits after response deduction:', currentCredits);
        
        // Ensure UI updates are applied
        await tick();
      }
      
      const botResponse = {
        id: Date.now().toString(),
        role: 'ai',
        text: result.output || result.raw
      };
      
      chatHistory = [...chatHistory, botResponse];
      
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      throw error;
    } finally {
      loading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #8b5cf6 1px, transparent 0); background-size: 20px 20px;"></div>
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
                    <div class="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                      <Zap class="w-4 h-4" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 text-sm">Lead Conversion Assistant</h3>
                      <p class="text-xs text-gray-600">
                        {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
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
                    <!-- Website Input -->
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Globe class="w-4 h-4 text-purple-600" />
                        <Label for="website-mobile" class="text-sm font-medium">Your Website</Label>
                      </div>
                      <div class="space-y-2">
                                                 <Input
                           id="website-mobile"
                           type="url"
                           placeholder="https://yourcompany.com"
                           bind:value={website}
                           class="w-full text-sm"
                           disabled={isDemoRunning || isTraining}
                         />
                        {#if websiteValidation}
                          <p class="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle class="w-3 h-3" />
                            {websiteValidation}
                          </p>
                        {:else if website}
                          <p class="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle class="w-3 h-3" />
                            Valid URL
                          </p>
                        {:else}
                          <p class="text-xs text-gray-500">
                            Enter your website URL for automation setup
                          </p>
                        {/if}
                      </div>
                    </div>

                    <!-- Email Input -->
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Mail class="w-4 h-4 text-purple-600" />
                        <Label for="email-mobile" class="text-sm font-medium">Your Email</Label>
                      </div>
                      <div class="space-y-2">
                                                 <Input
                           id="email-mobile"
                           type="email"
                           placeholder="your@email.com"
                           bind:value={emailAddress}
                           class="w-full text-sm"
                           disabled={isDemoRunning || isTraining}
                         />
                        {#if emailValidation}
                          <p class="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle class="w-3 h-3" />
                            {emailValidation}
                          </p>
                        {:else if emailAddress}
                          <p class="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle class="w-3 h-3" />
                            Valid Email
                          </p>
                        {:else}
                          <p class="text-xs text-gray-500">
                            Enter your email for notifications
                          </p>
                        {/if}
                      </div>
      </div>

                    <!-- Phone Input -->
                    <div class="space-y-2">
      <div class="flex items-center gap-2">
                        <Phone class="w-4 h-4 text-purple-600" />
                        <Label for="phone-mobile" class="text-sm font-medium">Your Phone</Label>
                      </div>
                      <div class="space-y-2">
                                                 <Input
                           id="phone-mobile"
                           type="tel"
                           placeholder="+1 (555) 123-4567"
                           bind:value={phone}
                           class="w-full text-sm"
                           disabled={isDemoRunning || isTraining}
                         />
                        {#if phoneValidation}
                          <p class="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle class="w-3 h-3" />
                            {phoneValidation}
                          </p>
                        {:else if phone}
                          <p class="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle class="w-3 h-3" />
                            Valid Phone
                          </p>
                        {:else}
                          <p class="text-xs text-gray-500">
                            Enter your phone for SMS notifications
                          </p>
                        {/if}
                      </div>
                    </div>

                    <!-- Training Status -->
                    {#if isTraining}
                      <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div class="flex items-center gap-2 text-purple-700">
                          <div class="animate-pulse rounded-full h-4 w-4 bg-purple-600"></div>
                          <span class="text-sm font-medium">{currentTrainingStep}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Training Error -->
                    {#if trainingError && !isDemoRunning}
                      <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-center gap-2 text-yellow-700">
                          <AlertCircle class="w-4 h-4" />
                          <span class="text-sm">{trainingError}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Training Success -->
                    {#if trainingSuccess}
                      <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex items-center gap-2 text-green-700">
                          <CheckCircle class="w-4 h-4" />
                          <span class="text-sm">{trainingSuccess}</span>
                        </div>
                      </div>
                    {/if}

                            <!-- Training Status -->
        {#if isTraining}
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="flex items-center gap-2 text-purple-700">
              <div class="animate-pulse rounded-full h-4 w-4 bg-purple-600"></div>
              <span class="text-sm font-medium">{currentTrainingStep}</span>
            </div>
          </div>
        {/if}

        <!-- Training Error -->
        {#if trainingError && !isDemoRunning}
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center gap-2 text-yellow-700">
              <AlertCircle class="w-4 h-4" />
              <span class="text-sm">{trainingError}</span>
            </div>
          </div>
        {/if}

        <!-- Training Success -->
        {#if trainingSuccess}
          <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center gap-2 text-green-700">
              <CheckCircle class="w-4 h-4" />
              <span class="text-sm">{trainingSuccess}</span>
            </div>
          </div>
        {/if}

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
                          variant={isDemoRunning ? "outline" : "default"}
                          onclick={startDemo}
                          disabled={isTraining || !website.trim() || !!websiteValidation || !emailAddress.trim() || !!emailValidation || !phone.trim() || !!phoneValidation}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          {isTraining ? "Training..." : !website.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : !emailAddress.trim() ? "Enter Email" : !!emailValidation ? "Invalid Email" : !phone.trim() ? "Enter Phone" : !!phoneValidation ? "Invalid Phone" : "Start Demo"}
                        </Button>
                      {/if}
                      {#if isDemoRunning}
                        <Button 
                          variant="outline"
                          onclick={resetDemo}
                          disabled={!isDemoRunning && !isTraining && !website.trim()}
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
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-6 text-gray-500">
                    <Zap class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Lead Conversion Assistant</p>
                    <p class="text-xs">Tap the settings icon above to start the demo, then begin chatting</p>
                  </div>
                {:else}
                  {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[85%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Zap class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-2 rounded-lg min-w-[80px] {message.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          {#if message.role === 'user'}
                            <p class="text-xs whitespace-pre-line">{@html message.text}</p>
                          {:else}
                            <div class="text-xs prose prose-sm max-w-none">{@html formatBotText(message.text)}</div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if loading}
                    <div class="flex gap-2 justify-start">
                      <div class="flex gap-2 max-w-[85%]">
                        <div class="p-1.5 rounded-full bg-gray-200 text-gray-700">
                          <Zap class="w-3 h-3" />
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
                <div class="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Zap class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Lead Conversion Assistant</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              
                              
              
              <div class="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  <MessageSquare class="w-4 h-4" />
                  <span>Lead Capture</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  <Workflow class="w-4 h-4" />
                  <span>Follow-ups</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  <Users class="w-4 h-4" />
                  <span>CRM Integration</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors">
                  <FileText class="w-4 h-4" />
                  <span>Work Orders</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <Zap class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to Lead Conversion Assistant</p>
                    <p class="text-sm">Click Start Demo in the sidebar to begin setting up automated workflows</p>
                  </div>
                {:else}
                  {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[80%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Zap class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-3 rounded-lg min-w-[80px] {message.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          {#if message.role === 'user'}
                            <p class="text-sm whitespace-pre-line">{@html message.text}</p>
                          {:else}
                            <div class="text-sm prose prose-sm max-w-none">{@html formatBotText(message.text)}</div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if loading}
                    <div class="flex gap-3 justify-start">
                      <div class="flex gap-3 max-w-[80%]">
                        <div class="p-2 rounded-full bg-gray-200 text-gray-700">
                          <Zap class="w-4 h-4" />
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
          <CreditDisplay credits={currentCredits} />
        </div>
        <!-- Website Input -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <Globe class="w-4 h-4 text-purple-600" />
            <Label for="website" class="text-sm font-medium">Your Website</Label>
              </div>
          <div class="space-y-2">
                         <Input
               id="website"
               type="url"
               placeholder="https://yourcompany.com"
               bind:value={website}
               class="w-full text-base"
               disabled={isDemoRunning || isTraining}
             />
            {#if websiteValidation}
              <p class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {websiteValidation}
              </p>
            {:else if website}
              <p class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Valid URL
              </p>
            {:else}
              <p class="text-xs text-gray-500">
                Enter your website URL for automation setup
              </p>
            {/if}
              </div>
            </div>

        <!-- Email Input -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-purple-600" />
            <Label for="email" class="text-sm font-medium">Your Email</Label>
      </div>
          <div class="space-y-2">
                         <Input
               id="email"
               type="email"
               placeholder="your@email.com"
               bind:value={emailAddress}
               class="w-full text-base"
               disabled={isDemoRunning || isTraining}
             />
            {#if emailValidation}
              <p class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {emailValidation}
              </p>
            {:else if emailAddress}
              <p class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Valid Email
              </p>
            {:else}
              <p class="text-xs text-gray-500">
                Enter your email for notifications
              </p>
            {/if}
              </div>
            </div>

        <!-- Phone Input -->
        <div class="space-y-3">
            <div class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-purple-600" />
            <Label for="phone" class="text-sm font-medium">Your Phone</Label>
            </div>
          <div class="space-y-2">
                         <Input
               id="phone"
               type="tel"
               placeholder="+1 (555) 123-4567"
               bind:value={phone}
               class="w-full text-base"
               disabled={isDemoRunning || isTraining}
             />
            {#if phoneValidation}
              <p class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {phoneValidation}
              </p>
            {:else if phone}
              <p class="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Valid Phone
              </p>
            {:else}
              <p class="text-xs text-gray-500">
                Enter your phone for SMS notifications
              </p>
            {/if}
              </div>
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

          <!-- Key Features -->
          <div class="space-y-3">
            <h4 class="font-medium text-gray-900">Key Features</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <MessageSquare class="w-4 h-4 text-purple-600" />
                <span>Lead capture automation</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Workflow class="w-4 h-4 text-purple-600" />
                <span>Follow-up sequences</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Users class="w-4 h-4 text-purple-600" />
                <span>CRM integration</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <FileText class="w-4 h-4 text-purple-600" />
                <span>Work order processing</span>
              </div>
            </div>
          </div>

          <!-- Demo Controls -->
          <div class="space-y-3 pt-4 border-t border-gray-200">
            {#if !isDemoRunning}
              <Button 
                variant={isDemoRunning ? "outline" : "default"}
                onclick={startDemo}
                disabled={isTraining || !website.trim() || !!websiteValidation || !emailAddress.trim() || !!emailValidation || !phone.trim() || !!phoneValidation}
                class="w-full flex items-center gap-2 text-base"
              >
                <Play class="w-4 h-4" />
                {isTraining ? "Training..." : !website.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : !emailAddress.trim() ? "Enter Email" : !!emailValidation ? "Invalid Email" : !phone.trim() ? "Enter Phone" : !!phoneValidation ? "Invalid Phone" : "Start Demo"}
              </Button>
            {/if}
            {#if isDemoRunning}
              <Button 
                variant="outline"
                onclick={resetDemo}
                disabled={!isDemoRunning && !isTraining && !website.trim()}
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
</div>

<Dialog open={showDemoReadyDialog} on:openChange={e => showDemoReadyDialog = e.detail}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Demo Ready!</DialogTitle>
      <DialogDescription>
        The Lead Conversion Assistant demo is now ready. You can start chatting with the automation assistant below.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button onclick={() => showDemoReadyDialog = false}>Start Chatting</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
