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
    CheckCircle
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { marked } from 'marked';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "$lib/components/ui/dialog";
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';

  function formatBotText(text: string): string {
    // Basic sanitization: escape < and >, then parse markdown
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return marked.parse(safeText);
  }

  let supabaseSessionId: string | null = null;
  let supabaseUserId: string | null = null;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    supabaseSessionId = session?.access_token ?? null;
    supabaseUserId = session?.user?.id ?? null;
  });

  let isDemoRunning = $state(false);
  let websiteUrl = $state("");
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
          websiteUrl: websiteUrl,
          sessionId: supabaseSessionId, // Add session ID
          userId: supabaseUserId        // Add user ID
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const botResponse = {
        id: messages.length + 1,
        text: result.output || result.raw || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot" as const,
        timestamp: new Date()
      };
      
      messages = [...messages, botResponse];
      
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      // Instead of simulated response, show service down message
      const botResponse = {
        id: messages.length + 1,
        text: "AI service is currently unavailable. Please try again later.",
        sender: "bot" as const,
        timestamp: new Date()
      };
      messages = [...messages, botResponse];
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

  async function startDemo() {
    console.log("startDemo called", { isDemoRunning, isTraining, websiteUrl });
    
    // Check if user has enough credits
    const { canStart, userCredits, demoCost } = await CreditService.canStartDemo('ai-assistant');
    if (!canStart) {
      alert(`Insufficient credits. You have ${userCredits} credits, but this demo costs ${demoCost} credits.`);
      return;
    }
        
    const validation = validateWebsiteUrl(websiteUrl);
    console.log("Validation result:", validation);
    if (validation) {
      websiteValidation = validation;
      console.log("Validation failed:", validation);
      return;
    }
    
    console.log("Starting training with n8n...");
    websiteValidation = "";
    isTraining = true;
    isDemoRunning = false; // Ensure chat is disabled during training
    trainingError = "";
    trainingSuccess = "";
    trainingProgress = 0;
    trainingStepIndex = 0;
    currentTrainingStep = trainingSteps[0];
    if (trainingStepInterval) clearInterval(trainingStepInterval);
    trainingStepInterval = setInterval(() => {
      trainingStepIndex = (trainingStepIndex + 1) % trainingSteps.length;
      currentTrainingStep = trainingSteps[trainingStepIndex];
    }, 4000); // Change step every 4 seconds
    
    console.log("Training state set:", { isTraining, trainingProgress });
    
    try {
      console.log("Making API call to /api/n8n/train-chatbot");
      
      // Start demo session and deduct credits
      const sessionResult = await CreditService.startDemoSession('ai-assistant');
      if (!sessionResult.success) {
        alert(sessionResult.error || 'Failed to start demo session');
        isTraining = false;
        return;
      }
      
      // Call our SvelteKit API route for training
      const response = await fetch('/api/n8n/train-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          websiteUrl: websiteUrl,
          action: 'train'
        })
      });
      console.log("API response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // Optionally check result.success or result.data if needed
      trainingProgress = 100;
      isTraining = false;
      isDemoRunning = true;
      trainingSuccess = "Training completed successfully!";
      trainingError = "";
      // Get website data for the demo
      const websiteData = websiteContent[websiteUrl as keyof typeof websiteContent] || websiteContent["https://example.com"];

      trainingSuccess = trainingSuccess || "Training completed successfully!";
      console.log("Demo started successfully after training!");
    } catch (error) {
      trainingError = "Failed to train chatbot. Please try again.";
      trainingProgress = 100;
      isTraining = false;

      console.log("Demo started in fallback mode!");
    } finally {
      if (trainingStepInterval) clearInterval(trainingStepInterval);
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
    websiteUrl = "";
  }

  // Watch for website URL changes to validate
  $effect(() => {
    console.log("$effect triggered:", { websiteUrl, isTraining, isDemoRunning });
    if (websiteUrl && !isTraining && !isDemoRunning) {
      websiteValidation = validateWebsiteUrl(websiteUrl);
      console.log("Validation result:", websiteValidation);
    } else if (!websiteUrl) {
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

<div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0); background-size: 20px 20px;"></div>
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
                  <div class="p-2 rounded-lg bg-blue-500 text-white">
                    <Bot class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">AI Customer Support</h3>
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
                    <!-- Website Input -->
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <Globe class="w-4 h-4 text-blue-600" />
                        <Label for="website-mobile" class="text-sm font-medium">Your Website</Label>
                      </div>
                      <div class="space-y-2">
                        <Input
                          id="website-mobile"
                          type="url"
                          placeholder="https://yourcompany.com"
                          bind:value={websiteUrl}
                          class="w-full text-sm"
                        />
                        {#if websiteValidation}
                          <p class="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle class="w-3 h-3" />
                            {websiteValidation}
                          </p>
                        {:else if websiteUrl}
                          <p class="text-xs text-green-500 flex items-center gap-1">
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
                      <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div class="flex items-center gap-2 text-blue-700">
                          <div class="animate-pulse rounded-full h-4 w-4 bg-blue-600"></div>
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

                    <!-- Demo Controls -->
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                      {#if !isDemoRunning}
                        <Button 
                          variant={isDemoRunning ? "outline" : "default"}
                          onclick={() => {
                            console.log("Start Demo button clicked!");
                            startDemo();
                          }}
                          disabled={isTraining || !websiteUrl.trim() || !!websiteValidation}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          {isTraining ? "Training..." : !websiteUrl.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : "Start Demo"}
                        </Button>
                      {/if}
                      {#if isDemoRunning}
                        <Button 
                          variant="outline"
                          onclick={resetDemo}
                          disabled={!isDemoRunning && !isTraining && !websiteUrl.trim()}
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
                    <p class="text-base font-medium">Welcome to AI Customer Support</p>
                    <p class="text-xs">Tap the settings icon above to configure your website URL, then click Start Demo to begin chatting</p>
                  </div>
                {:else}
                  {#each messages as message}
                    <div class="flex w-full {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.sender === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[85%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.sender === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Bot class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-2 rounded-lg min-w-[80px] {message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}">
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
                <div class="p-2 rounded-lg bg-blue-500 text-white">
                  <Bot class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">AI Customer Support</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap ">
                <Badge variant="outline">
                  <MessageCircle class="w-4 h-4" />
                  <span>Chat</span>
                </Badge>
                <Badge variant="outline">
                  <Smartphone class="w-4 h-4" />
                  <span>WhatsApp</span>
                </Badge>
                <Badge variant="outline">
                  <Mail class="w-4 h-4" />
                  <span>Email</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>Facebook Messenger</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>Instagram</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>Telegram</span>
                </Badge>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <CreditDisplay />
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <Bot class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to AI Customer Support</p>
                    <p class="text-sm">Enter your website URL in the sidebar on the right, then click Start Demo to begin chatting</p>
                  </div>
                {:else}
                  {#each messages as message}
                    <div class="flex w-full {message.sender === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.sender === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[80%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.sender === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <Bot class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-3 rounded-lg min-w-[80px] {message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}">
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
          <CreditDisplay />
        </div>
        <!-- Website Input -->
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <Globe class="w-4 h-4 text-blue-600" />
            <Label for="website" class="text-sm font-medium">Your Website</Label>
          </div>
          <div class="space-y-2">
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              bind:value={websiteUrl}
              class="w-full text-base"
            />
            {#if websiteValidation}
              <p class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {websiteValidation}
              </p>
            {:else if websiteUrl}
              <p class="text-xs text-green-500 flex items-center gap-1">
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
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2 text-blue-700">
              <div class="animate-pulse rounded-full h-4 w-4 bg-blue-600"></div>
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

        <!-- Demo Information -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            <span>Duration 5-10 minutes</span>
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
              <Bot class="w-4 h-4 text-blue-600" />
              <span>AI-powered responses</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Headphones class="w-4 h-4 text-blue-600" />
              <span>24/7 customer support</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Settings class="w-4 h-4 text-blue-600" />
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
              disabled={isTraining || !websiteUrl.trim() || !!websiteValidation}
              class="w-full flex items-center gap-2 text-base"
            >
              <Play class="w-4 h-4" />
              {isTraining ? "Training..." : !websiteUrl.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : "Start Demo"}
            </Button>
          {/if}
          {#if isDemoRunning}
            <Button 
              variant="outline"
              onclick={resetDemo}
              disabled={!isDemoRunning && !isTraining && !websiteUrl.trim()}
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
<Dialog open={showDemoReadyDialog} on:openChange={e => showDemoReadyDialog = e.detail}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Demo Ready!</DialogTitle>
      <DialogDescription>
        The AI Customer Support demo is now ready. You can start chatting with the AI assistant below.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button on:click={() => showDemoReadyDialog = false}>Start Chatting</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog> 