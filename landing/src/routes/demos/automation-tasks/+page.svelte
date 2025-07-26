<script lang="ts">
  import { onMount } from 'svelte';
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
    Phone
  } from 'lucide-svelte';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "$lib/components/ui/dialog";
  import { supabase } from '$lib/supabase';


  let activeTab = 'demo';
  let supabaseSessionId: string | null = null;

  let isDemoRunning = $state(false);
  let isTraining = $state(false);
  let showMobileSetup = $state(true);
  let demoError = $state("");
  let demoSuccess = $state("");
  let messageInput = $state("");
  let websiteUrl = $state("");
  let emailAddress = $state("");
  let phoneNumber = $state("");
  let websiteValidation = $state("");
  let emailValidation = $state("");
  let phoneValidation = $state("");
  let chatHistory = $state([]);
  let loading = $state(false);
  let trainingProgress = $state(0);
  let trainingError = $state("");
  let trainingSuccess = $state("");
  let currentTrainingStep = $state("");
  let trainingStepIndex = 0;
  let trainingStepInterval: ReturnType<typeof setInterval> | null = null;
  let showDemoReadyDialog = $state(false);

  let webhookUrl = "/api/n8n/automation-chat";

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
    if (emailAddress && !isTraining && !isDemoRunning) {
      emailValidation = validateEmail(emailAddress);
    } else if (!emailAddress) {
      emailValidation = "";
    }
  });

  $effect(() => {
    if (phoneNumber && !isTraining && !isDemoRunning) {
      phoneValidation = validatePhone(phoneNumber);
    } else if (!phoneNumber) {
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
    console.log("startDemo called", { isDemoRunning, isTraining, websiteUrl, emailAddress, phoneNumber });
        
    // Validate website URL
    const websiteValidationResult = validateWebsiteUrl(websiteUrl);
    console.log("Website validation result:", websiteValidationResult);
    if (websiteValidationResult) {
      websiteValidation = websiteValidationResult;
      console.log("Website validation failed:", websiteValidationResult);
      return;
    }
    
    // Validate email
    const emailValidationResult = validateEmail(emailAddress);
    console.log("Email validation result:", emailValidationResult);
    if (emailValidationResult) {
      emailValidation = emailValidationResult;
      console.log("Email validation failed:", emailValidationResult);
      return;
    }
    
    // Validate phone
    const phoneValidationResult = validatePhone(phoneNumber);
    console.log("Phone validation result:", phoneValidationResult);
    if (phoneValidationResult) {
      phoneValidation = phoneValidationResult;
      console.log("Phone validation failed:", phoneValidationResult);
      return;
    }
    
    console.log("Starting training with n8n...");
    websiteValidation = "";
    isTraining = true;
    isDemoRunning = false; // Ensure chat is disabled during training
    demoError = "";
    demoSuccess = "";
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
      console.log("Starting automation demo setup");
      // Call the automation-tasks API route for training
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'train',
          website: websiteUrl,
          email: emailAddress,
          phone: phoneNumber,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      trainingProgress = 100;
      isTraining = false;
      isDemoRunning = true;
      trainingSuccess = "Demo ready!";
      trainingError = "";
      demoSuccess = "Automation Tasks demo started successfully!";
      console.log("Demo started successfully!");
      
      // Send welcome message and display the response
      await sendWelcomeMessage();
    } catch (error) {
      console.error("Demo start error:", error);
      trainingProgress = 100;
      isTraining = false;
      isDemoRunning = true;
      trainingError = "Demo started in fallback mode.";
      demoSuccess = "Demo started in fallback mode - some features may be limited.";
      console.log("Demo started in fallback mode!");
    } finally {
      if (trainingStepInterval) clearInterval(trainingStepInterval);
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
    websiteUrl = "";
    emailAddress = "";
    phoneNumber = "";
    websiteValidation = "";
    emailValidation = "";
    phoneValidation = "";
    chatHistory = [];
    messageInput = '';
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
          sessionId: supabaseSessionId,
          action: 'message',
          message: 'Send Welcome Message through SMS and Email. make the message personalized based on the customer and the company',
          website: websiteUrl,
          email: emailAddress,
          phone: phoneNumber,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      if (!response.ok) {
        console.error("Welcome message failed:", response.status);
        // Add a fallback welcome message
        const fallbackMessage = {
          id: Date.now().toString(),
          role: 'ai',
          content: "Welcome to Ed & Sy Automation Services! I'm here to help you with our automation solutions. How can I assist you today?"
        };
        chatHistory = [...chatHistory, fallbackMessage];
      } else {
        console.log("Welcome message sent successfully");
        const result = await response.json();
        
        // Display the welcome message response in chat
        const welcomeMessage = {
          id: Date.now().toString(),
          role: 'ai',
          content: result.output || result.raw || "Welcome to Ed & Sy Automation Services! I'm here to help you with our automation solutions. How can I assist you today?"
        };
        chatHistory = [...chatHistory, welcomeMessage];
      }
    } catch (error) {
      console.error("Error sending welcome message:", error);
      // Add a fallback welcome message
      const fallbackMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: "Welcome to Ed & Sy Automation Services! I'm here to help you with our automation solutions. How can I assist you today?"
      };
      chatHistory = [...chatHistory, fallbackMessage];
    }
  }

  async function sendMessage() {
    if (!messageInput.trim() || !isDemoRunning || isTraining) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput
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
          sessionId: supabaseSessionId,
          action: 'message',
          message: currentMessage,
          website: websiteUrl,
          email: emailAddress,
          phone: phoneNumber,
          timestamp: new Date().toISOString(),
          demo: 'automation-tasks'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const botResponse = {
        id: Date.now().toString(),
        role: 'ai',
        content: result.output || result.raw || "I'm sorry, I couldn't process your request. Please try again."
      };
      
      chatHistory = [...chatHistory, botResponse];
      
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      // Show service down message like ai-assistant demo
      const botResponse = {
        id: Date.now().toString(),
        role: 'ai',
        content: "Automation service is currently unavailable. Please try again later."
      };
      chatHistory = [...chatHistory, botResponse];
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

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    supabaseSessionId = session?.access_token ?? null;
    // Initialize demo
  });
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
                  <div class="p-2 rounded-lg bg-purple-500 text-white">
                    <Zap class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Automation Tasks</h3>
                    <p class="text-xs text-gray-600">
                      {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                    </p>
                  </div>
                </div>
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
                          bind:value={phoneNumber}
                          class="w-full text-sm"
                        />
                        {#if phoneValidation}
                          <p class="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle class="w-3 h-3" />
                            {phoneValidation}
                          </p>
                        {:else if phoneNumber}
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
                          disabled={isTraining || !websiteUrl.trim() || !!websiteValidation || !emailAddress.trim() || !!emailValidation || !phoneNumber.trim() || !!phoneValidation}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          {isTraining ? "Training..." : !websiteUrl.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : !emailAddress.trim() ? "Enter Email" : !!emailValidation ? "Invalid Email" : !phoneNumber.trim() ? "Enter Phone" : !!phoneValidation ? "Invalid Phone" : "Start Demo"}
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
                    <Zap class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Automation Tasks</p>
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
                          <p class="text-xs whitespace-pre-line">{message.content}</p>
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
                <div class="p-2 rounded-lg bg-purple-500 text-white">
                  <Zap class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Automation Tasks</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>Lead Capture</span>
                </Badge>
                <Badge variant="outline">
                  <Workflow class="w-4 h-4" />
                  <span>Follow-ups</span>
                </Badge>
                <Badge variant="outline">
                  <Users class="w-4 h-4" />
                  <span>CRM Integration</span>
                </Badge>
                <Badge variant="outline">
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
                    <p class="text-lg font-medium">Welcome to Automation Tasks</p>
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
                          <p class="text-sm whitespace-pre-line">{message.content}</p>
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
              bind:value={phoneNumber}
              class="w-full text-base"
            />
            {#if phoneValidation}
              <p class="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle class="w-3 h-3" />
                {phoneValidation}
              </p>
            {:else if phoneNumber}
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
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            <span>Duration 5-8 minutes</span>
              </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Star class="w-4 h-4" />
            <span>Difficulty: Medium</span>
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
              disabled={isTraining || !websiteUrl.trim() || !!websiteValidation || !emailAddress.trim() || !!emailValidation || !phoneNumber.trim() || !!phoneValidation}
              class="w-full flex items-center gap-2 text-base"
            >
              <Play class="w-4 h-4" />
              {isTraining ? "Training..." : !websiteUrl.trim() ? "Enter Website URL" : !!websiteValidation ? "Invalid URL" : !emailAddress.trim() ? "Enter Email" : !!emailValidation ? "Invalid Email" : !phoneNumber.trim() ? "Enter Phone" : !!phoneValidation ? "Invalid Phone" : "Start Demo"}
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
        The Automation Tasks demo is now ready. You can start chatting with the automation assistant below.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button on:click={() => showDemoReadyDialog = false}>Start Chatting</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
