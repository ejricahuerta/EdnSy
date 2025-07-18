<script lang="ts">
  import { page } from "$app/stores";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import {
    MessageSquare,
    Globe,
    CheckCircle,
    Sparkles,
    Bot,
    Send,
    User,
  } from "@lucide/svelte";

  let currentUser = $derived($page.data.user);
  let websiteUrl = $state("");
  let isProcessing = $state(false);
  let isScraping = $state(false);
  let scrapingProgress = $state(0);
  let scrapingComplete = $state(false);
  let demoMessages = $state([
    {
      type: "bot",
      content:
        "Hello! I'm your AI chatbot. I've been trained on your website content and can answer questions about your business. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  let userInput = $state("");

  function validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    if (!websiteUrl.trim()) {
      alert("Please enter a website URL");
      return;
    }

    if (!validateUrl(websiteUrl)) {
      alert("Please enter a valid website URL (include http:// or https://)");
      return;
    }

    isProcessing = true;

    // Simulate website scraping
    isScraping = true;
    for (let i = 0; i <= 100; i += 10) {
      scrapingProgress = i;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    isScraping = false;
    scrapingComplete = true;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    isProcessing = false;
  }

  function sendMessage() {
    if (!userInput.trim()) return;

    // Add user message
    demoMessages = [
      ...demoMessages,
      { type: "user", content: userInput, timestamp: new Date() },
    ];

    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "Based on your website content, I can help you with that!",
        "I found information about that in your business documentation.",
        "Let me check your website for the most up-to-date information.",
        "I can answer questions about your services, pricing, and policies.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      demoMessages = [
        ...demoMessages,
        { type: "bot", content: randomResponse, timestamp: new Date() },
      ];
    }, 1000);

    userInput = "";
  }
</script>

<div class="flex h-full">
  <!-- Setup Panel (1/3) -->
  <div class="w-1/3 border-r border-gray-200 p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-2">Customer Service Assistant</h1>
        <p class="text-gray-600">Enter your website URL to create an AI chatbot</p>
      </div>

      <!-- Setup Form -->
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Website URL</label>
          <input
            type="url"
            placeholder="https://yourwebsite.com"
            bind:value={websiteUrl}
            disabled={isProcessing}
            class="w-full h-10 px-3 border rounded-md mt-1"
          />
          <p class="text-xs text-gray-600 mt-1">We'll use your website as a tool for the AI chatbot</p>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-medium">What we'll do:</h3>
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <span>Connect to your website</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <span>Enable AI to access your content</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <span>Answer questions about your business</span>
            </div>
          </div>
        </div>

        <!-- Tools & Integrations -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium">Tools</h3>
          <div class="flex flex-wrap gap-1">
            <Badge variant="outline" class="text-xs">WhatsApp</Badge>
            <Badge variant="outline" class="text-xs">Facebook</Badge>
            <Badge variant="outline" class="text-xs">Instagram</Badge>
            <Badge variant="outline" class="text-xs">Google Sheets</Badge>
            <Badge variant="outline" class="text-xs">Excel</Badge>
            <Badge variant="outline" class="text-xs">Website</Badge>
          </div>
        </div>

        <button
          class="w-full h-12 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 cursor-pointer"
          onclick={handleSubmit}
          disabled={isProcessing || !websiteUrl.trim()}
        >
          {#if isProcessing}
            {#if isScraping}
              Scraping... {scrapingProgress}%
            {:else}
              Processing...
            {/if}
          {:else}
            Create Chatbot
          {/if}
        </button>

        <!-- Progress Bar -->
        {#if isScraping}
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {scrapingProgress}%"></div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Demo Playground (2/3) -->
  <div class="w-2/3 flex flex-col h-full">
    <!-- Chat Header -->
    <div class="border-b border-gray-200 p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-100 rounded-lg">
          <Bot class="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 class="font-semibold">AI Chatbot Demo</h2>
          <p class="text-sm text-muted-foreground">Try the chatbot interface</p>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 p-4 space-y-4">
      {#each demoMessages as message}
        <div
          class="flex gap-3 {message.type === 'user'
            ? 'justify-end'
            : 'justify-start'}"
        >
          {#if message.type === "bot"}
            <div
              class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Bot class="h-4 w-4 text-white" />
            </div>
          {/if}
          <div class="max-w-xs">
            <div
              class="p-3 rounded-lg {message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100'}"
            >
              <p class="text-sm">{message.content}</p>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
          {#if message.type === "user"}
            <div
              class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <User class="h-4 w-4 text-white" />
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Chat Input -->
    <div class="border-t border-gray-200 p-4">
      <div class="flex gap-2">
        <Input
          placeholder="Type your message..."
          bind:value={userInput}
          onkeydown={(e) => e.key === "Enter" && sendMessage()}
          class="flex-1"
        />
        <Button onclick={sendMessage} disabled={!userInput.trim()}>
          <Send class="h-4 w-4" />
        </Button>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        Try asking: "What services do you offer?" or "What are your prices?"
      </p>
    </div>
  </div>
</div>
