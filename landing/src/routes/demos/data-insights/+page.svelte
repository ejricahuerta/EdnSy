<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Badge } from '$lib/components/ui/badge';
  import { BarChart3, FileText, Upload, Sparkles, TrendingUp, PieChart, BarChart, LineChart, Download, Eye, BarChart3 as BarChartIcon, Send } from '@lucide/svelte';
  
  let currentUser = $derived($page.data.user);
  let selectedFiles = $state<File[]>([]);
  let isProcessing = $state(false);
  let isAnalyzing = $state(false);
  let analysisProgress = $state(0);
  let analysisComplete = $state(false);
  let selectedChart = $state('sales');
  let userPrompt = $state('');
  
  const chartTypes = [
    { id: 'sales', name: 'Sales Trends', icon: TrendingUp, color: 'text-green-600' },
    { id: 'customers', name: 'Customer Demographics', icon: PieChart, color: 'text-blue-600' },
    { id: 'revenue', name: 'Revenue Forecast', icon: BarChart, color: 'text-purple-600' },
    { id: 'performance', name: 'Performance Metrics', icon: BarChartIcon, color: 'text-orange-600' }
  ];
  
  async function handleSubmit() {
    if (selectedFiles.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    if (!userPrompt.trim()) {
      alert('Please describe the report you need');
      return;
    }
    
    isProcessing = true;
    
    // Simulate report generation
    isAnalyzing = true;
    for (let i = 0; i <= 100; i += 10) {
      analysisProgress = i;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    isAnalyzing = false;
    analysisComplete = true;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isProcessing = false;
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      selectedFiles = Array.from(target.files);
    }
  }

  function removeFile(index: number) {
    selectedFiles.splice(index, 1);
  }
</script>

<div class="flex h-full">
  <!-- Setup Panel (1/3) -->
  <div class="w-1/3 border-r border-gray-200 p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-2">Business Health Checker</h1>
        <p class="text-gray-600">Upload your data and ask for any report</p>
      </div>
      
      <!-- Setup Form -->
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Upload Files</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
            <Upload class="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <button 
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 cursor-pointer"
              onclick={() => document.getElementById('file-upload')?.click()}
            >
              Choose Files
            </button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
              onchange={handleFileSelect}
              class="hidden"
            />
          </div>
        </div>
        
        <!-- Selected Files -->
        {#if selectedFiles.length > 0}
          <div class="space-y-2">
            <h3 class="text-sm font-medium">Selected Files:</h3>
            <div class="space-y-2">
              {#each selectedFiles as file, index}
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border text-sm">
                  <div class="flex items-center gap-2">
                    <FileText class="h-4 w-4 text-blue-600" />
                    <span class="font-medium">{file.name}</span>
                    <span class="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <button
                    class="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                    onclick={() => removeFile(index)}
                  >
                    Remove
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <div class="space-y-2">
          <h3 class="text-sm font-medium">What we'll analyze:</h3>
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <BarChart class="h-4 w-4 text-blue-600" />
              <span>Sales trends and patterns</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <PieChart class="h-4 w-4 text-green-600" />
              <span>Customer demographics</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <LineChart class="h-4 w-4 text-purple-600" />
              <span>Revenue forecasting</span>
            </div>
          </div>
        </div>

        <!-- Tools & Integrations -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium">Tools</h3>
          <div class="flex flex-wrap gap-1">
            <Badge variant="outline" class="text-xs">Excel</Badge>
            <Badge variant="outline" class="text-xs">Google Sheets</Badge>
            <Badge variant="outline" class="text-xs">Paper Records</Badge>
            <Badge variant="outline" class="text-xs">Receipts</Badge>
            <Badge variant="outline" class="text-xs">Bank Statements</Badge>
            <Badge variant="outline" class="text-xs">Invoices</Badge>
          </div>
        </div>
        
        <button 
          class="w-full h-12 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 cursor-pointer"
          onclick={handleSubmit}
          disabled={isProcessing || selectedFiles.length === 0}
        >
          {#if isProcessing}
            {#if isAnalyzing}
              Analyzing... {analysisProgress}%
            {:else}
              Generating Reports...
            {/if}
          {:else}
            Upload Data
          {/if}
        </button>
        
        <!-- Progress Bar -->
        {#if isAnalyzing}
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {analysisProgress}%"></div>
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
        <div class="p-2 bg-blue-100 rounded-lg">
          <BarChart3 class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 class="font-semibold">Report Generator</h2>
          <p class="text-sm text-gray-600">Ask for any report from your data</p>
        </div>
      </div>
    </div>
    
    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Welcome Message -->
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <BarChart3 class="h-4 w-4 text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-50 rounded-lg p-3 max-w-[80%]">
            <p class="text-sm">Hi! I can help you generate reports from your business data. What would you like to know?</p>
          </div>
          <div class="mt-2 text-xs text-gray-500">Just now</div>
        </div>
      </div>
      
      <!-- Quick Suggestions -->
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <BarChart3 class="h-4 w-4 text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="bg-gray-50 rounded-lg p-3 max-w-[80%]">
            <p class="text-sm mb-2">Try asking for:</p>
            <div class="space-y-1">
              <button 
                class="block text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                onclick={() => userPrompt = 'Show me a sales report for the last quarter'}
              >
                • Sales report for Q1
              </button>
              <button 
                class="block text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                onclick={() => userPrompt = 'Create a customer demographics analysis'}
              >
                • Customer demographics
              </button>
              <button 
                class="block text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                onclick={() => userPrompt = 'Generate a revenue forecast'}
              >
                • Revenue forecast
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Messages (if any) -->
      {#if userPrompt}
        <div class="flex gap-3 justify-end">
          <div class="flex-1"></div>
          <div class="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
            <p class="text-sm">{userPrompt}</p>
          </div>
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-medium">U</span>
          </div>
        </div>
      {/if}
      
      <!-- AI Response (if processing) -->
      {#if isProcessing}
        <div class="flex gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <BarChart3 class="h-4 w-4 text-blue-600" />
          </div>
          <div class="flex-1">
            <div class="bg-gray-50 rounded-lg p-3 max-w-[80%]">
              <div class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p class="text-sm">Generating your report...</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Chat Input -->
    <div class="border-t border-gray-200 p-4">
      <div class="flex gap-2">
        <Input
          placeholder="Ask for any report... (e.g., 'Show me a sales report for Q1')"
          bind:value={userPrompt}
          onkeydown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isProcessing}
          class="flex-1"
        />
        <Button 
          onclick={handleSubmit}
          disabled={isProcessing || selectedFiles.length === 0 || !userPrompt.trim()}
        >
          <Send class="h-4 w-4" />
        </Button>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        Try asking: "Show me a sales report" or "Create a customer analysis"
      </p>
    </div>
  </div>
</div> 