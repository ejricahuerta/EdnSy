<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { MessageSquare, Globe, ArrowRight, CheckCircle } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  let currentUser = $derived($page.data.user);
  let websiteUrl = $state('');
  let isProcessing = $state(false);
  let isScraping = $state(false);
  let scrapingProgress = $state(0);
  let scrapingComplete = $state(false);
  
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
      alert('Please enter a website URL');
      return;
    }
    
    if (!validateUrl(websiteUrl)) {
      alert('Please enter a valid website URL (include http:// or https://)');
      return;
    }
    
    isProcessing = true;
    
    // Simulate website scraping
    isScraping = true;
    for (let i = 0; i <= 100; i += 10) {
      scrapingProgress = i;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    isScraping = false;
    scrapingComplete = true;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isProcessing = false;
    
    // Navigate to chatbot interface
    goto('/app/demos/chatbot/chat');
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
    <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Chatbot Setup</h1>
    <p class="text-gray-600">
      Enter your website URL to create an AI chatbot trained on your content
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Setup Form -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Globe class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>
              We'll scrape your website content to train the AI chatbot
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label for="website-url">Website URL</Label>
          <Input
            id="website-url"
            type="url"
            placeholder="https://yourwebsite.com"
            bind:value={websiteUrl}
            disabled={isProcessing}
          />
          <p class="text-xs text-gray-500">
            Enter the full URL including http:// or https://
          </p>
        </div>
        
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">What we'll do:</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Scrape all public pages from your website
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Extract text content and structure
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Train AI chatbot on your content
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Create customer service chatbot
            </li>
          </ul>
        </div>
        
        <Button 
          class="w-full" 
          onclick={handleSubmit}
          disabled={isProcessing || !websiteUrl.trim()}
        >
          {#if isProcessing}
            {#if isScraping}
              Scraping Website... {scrapingProgress}%
            {:else}
              Processing Content...
            {/if}
          {:else}
            Start Setup
          {/if}
        </Button>
      </CardContent>
    </Card>
    
    <!-- Preview -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <MessageSquare class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>AI Chatbot Preview</CardTitle>
            <CardDescription>
              Your chatbot will be trained on your website content
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Example Chat:</h4>
            <div class="space-y-3 text-sm">
              <div class="flex gap-2">
                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  U
                </div>
                <div class="bg-white rounded-lg p-2 max-w-xs">
                  "What services do you offer?"
                </div>
              </div>
              <div class="flex gap-2 justify-end">
                <div class="bg-blue-500 text-white rounded-lg p-2 max-w-xs">
                  "Based on our website, we offer..."
                </div>
                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                  AI
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">Features:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• 24/7 customer support</li>
              <li>• Answers based on your content</li>
              <li>• Multi-language support</li>
              <li>• Integration ready</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  
  <!-- Progress Indicator -->
  {#if isScraping}
    <Card class="mt-8">
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">Scraping Website Content</p>
              <p class="text-sm text-gray-600">Extracting text and structure from your website</p>
            </div>
            <span class="text-sm font-medium text-gray-900">{scrapingProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {scrapingProgress}%"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- Success Message -->
  {#if scrapingComplete}
    <Card class="mt-8 border-green-200 bg-green-50">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <CheckCircle class="h-6 w-6 text-green-600" />
          <div>
            <p class="font-medium text-green-900">Website Scraping Complete!</p>
            <p class="text-sm text-green-700">Your content has been processed and the AI chatbot is ready.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div> 