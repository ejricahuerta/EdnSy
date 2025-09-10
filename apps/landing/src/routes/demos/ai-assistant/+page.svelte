<script lang="ts">

  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    ArrowLeft,
    MessageSquare,
    Play,
    RotateCcw,
    Clock,
    Star,
    Globe,
    Bot,
    Headphones,
    Settings,
    Send,
    User,
    MessageCircle,
    Smartphone,
    Mail,
    AlertCircle,
    CheckCircle,
    Coins
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { onMount, tick, onDestroy } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { marked } from 'marked';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "$lib/components/ui/dialog";
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';
  import NoCreditsDialog from '$lib/components/ui/NoCreditsDialog.svelte';

  function formatBotText(text: string): string {
    // Basic sanitization: escape < and >, then parse markdown
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return marked.parse(safeText) as string;
  }

  let supabaseSessionId: string | null = $state(null);
  let supabaseUserId: string | null = $state(null);
  let currentSessionId: string | null = $state(null);
  let currentCredits: any = $state(null);
  let isDemoRunning = $state(false);
  let website = $state("");
  let isTraining = $state(false);
  let messages: Array<{ id: number; text: string; sender: "user" | "bot"; timestamp: Date }> = $state([]);
  let newMessage = $state("");
  let isTyping = $state(false);
  let showMobileSetup = $state(true); // Show by default for testing
  let trainingProgress = $state(0);
  let trainingError = $state("");
  let websiteValidation = $state("");
  let trainingSuccess = $state("");
  let showDemoReadyDialog = $state(false);
  let showNoCreditsDialog = $state(false);


  const trainingSteps = [
    "Connecting to Ed & Sy AI Assistant...",
    "Uploading website data...",
    "Preparing AI model...",
    "Training AI model...",
    "Connecting to Ed & Sy AI messaging services...",
    "Integrating with Chatbot APIs...",
    "Creating AI assistant...",
    "Creating chat API integration...",
    "Building chat component...",
    "Finalizing setup..."
  ];
  let currentTrainingStep = $state(trainingSteps[0]);
  let trainingStepIndex = 0;
  let trainingStepInterval: ReturnType<typeof setInterval> | null = null;
  
  // Add missing variables
  let estimatedTime = 5;
  let trainingCost = 2;
  
  // Fix window property type
  declare global {
    interface Window {
      _demoCleanup?: () => void;
    }
  }

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

    // Check if user has no credits and show dialog
    if (currentCredits && currentCredits.demo_credits <= 0) {
      showNoCreditsDialog = true;
    }

    // Add event listeners for browser close/unload
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (currentSessionId && isDemoRunning) {
        try {
          // Complete the session when user closes browser
          await CreditService.completeDemoSession(currentSessionId, {
            messages: messages,
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
            messages: messages,
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
            messages: messages,
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
          messages: messages,
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
        messages: messages,
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

  async function sendMessage() {
    if (isTraining) return; // Prevent sending during training
    if (!newMessage.trim()) return;

    // Check if user has enough credits for a response
    const { canPerform, userCredits, actionCost } = await CreditService.canPerformAction('ai-assistant', 'response');
    if (!canPerform) {
      alert(`Insufficient credits. You need ${actionCost} credits for this response. You have ${userCredits} credits.`);
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user" as const,
      timestamp: new Date()
    };

    messages = [...messages, userMessage];
    newMessage = "";
    isTyping = true;

    try {
      // Call our SvelteKit API route for chatbot response
      const response = await fetch('/api/n8n/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'message',
          message: userMessage.text,
          website: website
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Deduct credits for the response
      if (currentSessionId) {
        const deductResult = await CreditService.deductCreditsForAction(currentSessionId, 'ai-assistant', 'response');
        if (!deductResult.success) {
          throw new Error(deductResult.error || 'Failed to deduct credits');
        }
        
        // Update current credits after deduction
        currentCredits = await CreditService.getUserCredits();
        console.log('Credits after response deduction:', currentCredits);
        
        // Ensure UI updates are applied
        await tick();
      }
      
      const botResponse = {
        id: messages.length + 1,
        text: result.output || result.raw,
        sender: "bot" as const,
        timestamp: new Date()
      };
      
      messages = [...messages, botResponse];
      
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      throw error;
    } finally {
      isTyping = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function startDemo() {
    console.log("startDemo called", { isDemoRunning, isTraining, website });
    if (isDemoRunning || isTraining) return;

    try {
      // Validate website URL first
      const validation = validateWebsiteUrl(website);
      if (validation) {
        websiteValidation = validation;
        return;
      }

      // Check if user can start the demo (but don't charge yet)
      const { canPerform: canStart, userCredits, actionCost: demoCost } = await CreditService.canPerformAction('ai-assistant', 'training');
      
      if (!canStart) {
        // Trigger Cal.com modal directly instead of showing custom modal
        const calButton = document.createElement('button');
        calButton.setAttribute('data-cal-link', 'edmel-ednsy/enable-ai');
        calButton.setAttribute('data-cal-namespace', 'enable-ai');
        calButton.setAttribute('data-cal-config', JSON.stringify({layout: "month_view"}));
        calButton.style.display = 'none';
        document.body.appendChild(calButton);
        calButton.click();
        document.body.removeChild(calButton);
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

      // Call n8n to train the chatbot
      const trainingResponse = await fetch('/api/n8n/train-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: website,
          action: 'train'
        })
      });
      
      if (!trainingResponse.ok) {
        throw new Error(`Training failed: ${trainingResponse.status}`);
      }
      
      const trainingResult = await trainingResponse.json();
      if (!trainingResult.success) {
        throw new Error(trainingResult.message || 'Training failed');
      }

      clearInterval(progressInterval);
      trainingProgress = 100;

      // Only charge credits after successful training
      const sessionResult = await CreditService.startDemoSession('ai-assistant');
      
      if (!sessionResult.success) {
        alert(sessionResult.error || 'Failed to start demo session');
        isTraining = false;
        return;
      }
      
      currentSessionId = sessionResult.sessionId || null;
      currentCredits = await CreditService.getUserCredits();
      console.log('Credits after training:', currentCredits);
      
      // Ensure UI updates are applied
      await tick();

      isDemoRunning = true;
      isTraining = false;
      trainingSuccess = "Demo started successfully! You can now chat with your AI assistant.";
      showDemoReadyDialog = true;
      
      // Send initial message to n8n
      const response = await fetch('/api/n8n/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'message',
          message: 'hi',
          website: website
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
    
      const botResponse = {
        id: 1,
        text: result.output || result.raw,
        sender: "bot" as const,
        timestamp: new Date()
      };
      messages = [botResponse];

      // Deduct credits for the initial response
      if (currentSessionId) {
          const deductResult = await CreditService.deductCreditsForAction(currentSessionId, 'ai-assistant', 'response');
        if (!deductResult.success) {
          throw new Error(deductResult.error || 'Failed to deduct credits');
        }
        
        // Update current credits after deduction
        currentCredits = await CreditService.getUserCredits();
        console.log('Credits after initial response deduction:', currentCredits);
        
        // Ensure UI updates are applied
        await tick();
      }

    } catch (error) {
      console.error('Error starting demo:', error);
      trainingError = "Failed to start demo. Please try again.";
      isTraining = false;
    }
  }

  function resetDemo() {
    isDemoRunning = false;
    isTraining = false;
    trainingProgress = 0;
    trainingError = "";
    trainingSuccess = "";
    websiteValidation = "";
    messages = [];
    newMessage = "";
    website = "";
    currentSessionId = null;
  }

  // Watch for website URL changes to validate
  $effect(() => {
    console.log("$effect triggered:", { website, isTraining, isDemoRunning });
    if (website && !isTraining && !isDemoRunning) {
      websiteValidation = validateWebsiteUrl(website);
      console.log("Validation result:", websiteValidation);
    } else if (!website) {
      websiteValidation = "";
      console.log("URL is empty, clearing validation");
    }
  });

  $effect(() => {
    // Show dialog when demo starts
    if (isDemoRunning) {
      showDemoReadyDialog = true;
    }
  });


  
  // Debug: Log when component loads
  console.log("AI Assistant demo component loaded");
</script>

<div class="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0); background-size: 20px 20px;"></div>
  </div>

  <div class="relative z-10 flex h-[calc(100vh-60px)]">
    <!-- Chat Interface (Left - Takes remaining space) -->
    <div class="flex-1 flex flex-col lg:mr-80">
      <!-- Chat Area -->
      <div class="flex-1 p-3 lg:p-6  h-full">
        <!-- Mobile: Single Unified Card -->
        <div class="lg:hidden">
          <Card class="h-full h-[calc(100vh-100px)] bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-200">
                    <Bot class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">AI Assistant</h3>
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
                        <Globe class="w-4 h-4 text-primary" />
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
                          <p class="text-xs text-primary flex items-center gap-1">
                            <CheckCircle class="w-3 h-3" />
                            Valid URL
                          </p>
                        {:else}
                          <p class="text-xs text-gray-500">
                            Enter your website URL to train the chatbot
                          </p>
                        {/if}
                      </div>
                    </div>



                    <!-- Training Status -->
                    {#if isTraining}
                      <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div class="flex items-center gap-2 text-primary">
                          <div class="animate-pulse rounded-full h-4 w-4 bg-primary"></div>
                          <span class="text-sm font-medium">{currentTrainingStep}</span>
                        </div>
                      </div>
                    {/if}
                    


                            <!-- Training Error -->
        {#if trainingError && !isDemoRunning}
          <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
              <AlertCircle class="w-4 h-4" />
              <span class="text-sm">{trainingError}</span>
            </div>
          </div>
        {/if}

                    <!-- Training Success -->
                    {#if trainingSuccess}
                      <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div class="flex items-center gap-2 text-primary">
                          <CheckCircle class="w-4 h-4" />
                          <span class="text-sm">{trainingSuccess}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Demo Controls -->
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                      {#if !isDemoRunning}
                        <Button 
                          variant={isDemoRunning ? "outline" : "default"}
                          onclick={() => {
                            console.log("Start Demo button clicked!");
                            startDemo();
                          }}
                          disabled={isTraining || !website.trim() || !!websiteValidation}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          {isTraining ? "Training..." : !website.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : "Start Demo"}
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
                    <Bot class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to AI Assistant</p>
                    <p class="text-xs">Tap the settings icon above to configure your website URL, then click Start Demo to begin chatting</p>
                  </div>
                {:else}
                  {#each messages as message}
                    <div class="flex w-full {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.sender === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[85%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-700'}">
                          {#if message.sender === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Bot class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-2 rounded-lg min-w-[80px] {message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-xs">{@html formatBotText(message.text)}</p>
                          <p class="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if isTyping}
                    <div class="flex gap-2 justify-start">
                      <div class="flex gap-2 max-w-[85%]">
                        <div class="p-1.5 rounded-full bg-gray-200 text-gray-700">
                          <Bot class="w-3 h-3" />
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
                        bind:value={newMessage}
                        onkeydown={handleKeyPress}
                        class="flex-1 text-sm"
                        disabled={isTraining}
                    />
                    <Button onclick={sendMessage} disabled={isTraining || !newMessage.trim()} size="sm">
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
                <div class="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Bot class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">AI Assistant</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              
                              
              
              <div class="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <MessageCircle class="w-4 h-4" />
                  <span>Chat</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <Smartphone class="w-4 h-4" />
                  <span>WhatsApp</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <Mail class="w-4 h-4" />
                  <span>Email</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <MessageSquare class="w-4 h-4" />
                  <span>Facebook Messenger</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <MessageSquare class="w-4 h-4" />
                  <span>Instagram</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <MessageSquare class="w-4 h-4" />
                  <span>Telegram</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <Bot class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to AI Assistant</p>
                    <p class="text-sm">Enter your website URL in the sidebar on the right, then click Start Demo to begin chatting</p>
                  </div>
                {:else}
                  {#each messages as message}
                    <div class="flex w-full {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.sender === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[80%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-700'}">
                          {#if message.sender === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Bot class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-3 rounded-lg min-w-[80px] {message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-sm">{@html formatBotText(message.text)}</p>
                          <p class="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if isTyping}
                    <div class="flex gap-3 justify-start">
                      <div class="flex gap-3 max-w-[80%]">
                        <div class="p-2 rounded-full bg-gray-200 text-gray-700">
                          <Bot class="w-4 h-4" />
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
                        bind:value={newMessage}
                        onkeydown={handleKeyPress}
                        class="flex-1 text-base"
                        disabled={isTraining}
                    />
                    <Button onclick={sendMessage} disabled={isTraining || !newMessage.trim()}>
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
            <Globe class="w-4 h-4 text-primary" />
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
              <p class="text-xs text-primary flex items-center gap-1">
                <CheckCircle class="w-3 h-3" />
                Valid URL
              </p>
            {:else}
              <p class="text-xs text-gray-500">
                Enter your website URL to train the chatbot with your content
              </p>
            {/if}
          </div>
        </div>

        <!-- Training Status -->
        {#if isTraining}
          <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
              <div class="animate-pulse rounded-full h-4 w-4 bg-primary"></div>
              <span class="text-sm font-medium">{currentTrainingStep}</span>
            </div>
          </div>
        {/if}
        


        <!-- Training Error -->
        {#if trainingError && !isDemoRunning}
          <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
              <AlertCircle class="w-4 h-4" />
              <span class="text-sm">{trainingError}</span>
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
              <Bot class="w-4 h-4 text-primary" />
              <span>AI-powered responses</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Headphones class="w-4 h-4 text-primary" />
              <span>24/7 customer support</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Settings class="w-4 h-4 text-primary" />
              <span>Easy customization</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          {#if !isDemoRunning}
            <Button 
              variant={isDemoRunning ? "outline" : "default"}
              onclick={() => {
                console.log("Start Demo button clicked (desktop)!");
                startDemo();
              }}
              disabled={isTraining || !website.trim() || !!websiteValidation}
              class="w-full flex items-center gap-2 text-base"
            >
              <Play class="w-4 h-4" />
              {isTraining ? "Training..." : !website.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : "Start Demo"}
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

<!-- No Credits Dialog -->
<NoCreditsDialog bind:open={showNoCreditsDialog} currentCredits={currentCredits?.demo_credits || 0} />

<Dialog open={showDemoReadyDialog} on:openChange={e => showDemoReadyDialog = e.detail}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Demo Ready!</DialogTitle>
      <DialogDescription>
        The AI Assistant demo is now ready. You can start chatting with the AI assistant below.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button onclick={() => showDemoReadyDialog = false}>Start Chatting</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>