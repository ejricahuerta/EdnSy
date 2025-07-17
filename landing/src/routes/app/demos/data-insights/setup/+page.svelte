<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { BarChart3, Upload, FileText, CheckCircle, X } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  let currentUser = $derived($page.data.user);
  let uploadedFiles = $state([]);
  let isProcessing = $state(false);
  let isAnalyzing = $state(false);
  let analysisProgress = $state(0);
  let analysisComplete = $state(false);
  
  function handleFileUpload(event: any) {
    const files = Array.from(event.target.files);
    uploadedFiles = [...uploadedFiles, ...files];
  }
  
  function removeFile(index: number) {
    uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
  }
  
  function validateFiles() {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file');
      return false;
    }
    
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf', // .pdf
      'text/csv', // .csv
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];
    
    for (const file of uploadedFiles) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported format. Please upload Excel, PDF, CSV, or Word documents.`);
        return false;
      }
    }
    
    return true;
  }
  
  async function handleSubmit() {
    if (!validateFiles()) return;
    
    isProcessing = true;
    
    // Simulate file analysis
    isAnalyzing = true;
    for (let i = 0; i <= 100; i += 10) {
      analysisProgress = i;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    isAnalyzing = false;
    analysisComplete = true;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isProcessing = false;
    
    // Navigate to data insights interface
    goto('/app/demos/data-insights/analysis');
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
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Data Insights Setup</h1>
    <p class="text-gray-600">
      Upload your business data files for AI-powered analysis and insights
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- File Upload -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Upload class="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Upload Data Files</CardTitle>
            <CardDescription>
              Upload Excel, PDF, CSV, or Word documents for analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.pdf,.csv,.doc,.docx"
              onchange={handleFileUpload}
              class="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label for="file-upload" class="cursor-pointer">
              <Button variant="outline" disabled={isProcessing}>
                Choose Files
              </Button>
            </label>
          </div>
          
          <!-- Uploaded Files -->
          {#if uploadedFiles.length > 0}
            <div class="space-y-2">
              <h3 class="font-medium text-gray-900">Uploaded Files:</h3>
              <div class="space-y-2">
                {#each uploadedFiles as file, index}
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-2">
                      <FileText class="h-4 w-4 text-gray-500" />
                      <span class="text-sm text-gray-700">{file.name}</span>
                      <span class="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      onclick={() => removeFile(index)}
                      class="text-red-500 hover:text-red-700"
                      disabled={isProcessing}
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">What we'll analyze:</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Sales trends and patterns
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Customer behavior insights
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Performance metrics
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="h-4 w-4 text-green-500" />
              Growth opportunities
            </li>
          </ul>
        </div>
        
        <Button 
          class="w-full" 
          onclick={handleSubmit}
          disabled={isProcessing || uploadedFiles.length === 0}
        >
          {#if isProcessing}
            {#if isAnalyzing}
              Analyzing Data... {analysisProgress}%
            {:else}
              Processing Files...
            {/if}
          {:else}
            Start Analysis
          {/if}
        </Button>
      </CardContent>
    </Card>
    
    <!-- Preview -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <BarChart3 class="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Data Insights Preview</CardTitle>
            <CardDescription>
              AI-powered analysis of your business data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Example Insights:</h4>
            <div class="space-y-3 text-sm">
              <div class="bg-white rounded-lg p-3">
                <p class="font-medium text-blue-600">📈 Sales Trend</p>
                <p class="text-gray-600">Revenue increased 15% in Q3 vs Q2</p>
              </div>
              <div class="bg-white rounded-lg p-3">
                <p class="font-medium text-green-600">👥 Customer Insights</p>
                <p class="text-gray-600">Top 3 customer segments identified</p>
              </div>
              <div class="bg-white rounded-lg p-3">
                <p class="font-medium text-purple-600">🎯 Opportunities</p>
                <p class="text-gray-600">3 high-potential growth areas found</p>
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="font-medium text-gray-900">Supported Formats:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Excel (.xlsx, .xls)</li>
              <li>• PDF documents</li>
              <li>• CSV files</li>
              <li>• Word documents (.doc, .docx)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  
  <!-- Progress Indicator -->
  {#if isAnalyzing}
    <Card class="mt-8">
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 class="h-4 w-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">Analyzing Data</p>
              <p class="text-sm text-gray-600">Processing {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} for insights</p>
            </div>
            <span class="text-sm font-medium text-gray-900">{analysisProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: {analysisProgress}%"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
  
  <!-- Success Message -->
  {#if analysisComplete}
    <Card class="mt-8 border-green-200 bg-green-50">
      <CardContent class="pt-6">
        <div class="flex items-center gap-3">
          <CheckCircle class="h-6 w-6 text-green-600" />
          <div>
            <p class="font-medium text-green-900">Data Analysis Complete!</p>
            <p class="text-sm text-green-700">Your files have been processed and insights are ready.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div> 