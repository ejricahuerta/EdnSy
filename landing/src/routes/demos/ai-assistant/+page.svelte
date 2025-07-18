<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Badge } from '$lib/components/ui/badge';
  import { Bot, Sparkles, CheckCircle, Settings, MessageSquare, Send, User, Brain, Zap, Shield, Users, Calendar, FileText, BarChart3, Phone, Mail, Clock, MapPin, DollarSign, Package, Wrench, Truck, Upload, Database, FileSpreadsheet } from '@lucide/svelte';
  
  let currentUser = $derived($page.data.user);
  let userInput = $state('');
  let uploadedFiles = $state<string[]>([]);
  let assistantMessages = $state([
    { 
      type: 'assistant', 
      content: 'Hello! I\'m your comprehensive business assistant. I can help you with:\n\n• Customer management (CRM)\n• Field service scheduling\n• Business automation\n• Data analysis & reporting\n• Document creation\n• Appointment booking\n• Inventory management\n\nWhat would you like to work on today?', 
      timestamp: new Date() 
    }
  ]);
  
  const quickActions = [
    { 
      id: 'crm', 
      title: 'Customer Management', 
      icon: Users, 
      color: 'text-blue-600',
      description: 'Add customers, track interactions, manage leads'
    },
    { 
      id: 'scheduling', 
      title: 'Schedule Appointment', 
      icon: Calendar, 
      color: 'text-green-600',
      description: 'Book meetings, set reminders, manage calendar'
    },
    { 
      id: 'field-service', 
      title: 'Field Service', 
      icon: Truck, 
      color: 'text-purple-600',
      description: 'Dispatch technicians, track jobs, manage routes'
    },
    { 
      id: 'automation', 
      title: 'Business Automation', 
      icon: Zap, 
      color: 'text-orange-600',
      description: 'Automate workflows, create triggers, streamline processes'
    },
    { 
      id: 'reports', 
      title: 'Generate Report', 
      icon: BarChart3, 
      color: 'text-indigo-600',
      description: 'Sales reports, analytics, performance metrics'
    },
    { 
      id: 'documents', 
      title: 'Create Document', 
      icon: FileText, 
      color: 'text-red-600',
      description: 'Invoices, proposals, contracts, forms'
    }
  ];
  
  const businessContexts = [
    'Restaurant & Food Service',
    'Retail & E-commerce',
    'Professional Services',
    'Healthcare & Medical',
    'Construction & Trades',
    'Real Estate',
    'Manufacturing',
    'Education & Training'
  ];

  const supportedFileTypes = [
    'CSV files (customers, sales data)',
    'Excel spreadsheets (inventory, reports)',
    'JSON files (API data, configurations)',
    'Text files (notes, logs)',
    'Database exports (SQL, backup files)'
  ];
  
  function handleQuickAction(actionId: string) {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;
    
    const messages: Record<string, string> = {
      crm: 'I\'ll help you manage your customers. What would you like to do?\n\n• Add a new customer\n• View customer history\n• Update contact information\n• Track sales interactions\n• Manage leads and prospects',
      scheduling: 'Let\'s schedule something for you. What type of appointment?\n\n• Client meeting\n• Service appointment\n• Team meeting\n• Follow-up call\n• Site visit',
      'field-service': 'I\'ll help you manage field service operations. What do you need?\n\n• Schedule a technician\n• Track job status\n• Update customer info\n• Generate work orders\n• Route optimization',
      automation: 'I can help automate your business processes. What would you like to automate?\n\n• Customer follow-ups\n• Invoice generation\n• Appointment reminders\n• Inventory alerts\n• Report scheduling',
      reports: 'I\'ll generate a report for you. What type of report?\n\n• Sales performance\n• Customer analytics\n• Financial summary\n• Service metrics\n• Inventory status',
      documents: 'I\'ll help you create a document. What do you need?\n\n• Invoice\n• Proposal\n• Contract\n• Work order\n• Customer agreement'
    };
    
    assistantMessages = [...assistantMessages, { 
      type: 'user', 
      content: `I want to use ${action.title.toLowerCase()}`, 
      timestamp: new Date() 
    }];
    
    assistantMessages = [...assistantMessages, { 
      type: 'assistant', 
      content: messages[actionId] || 'I\'ll help you with that. What specific information do you need?', 
      timestamp: new Date() 
    }];
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      uploadedFiles = [...uploadedFiles, ...files.map(f => f.name)];
    }
  }

  function removeFile(fileName: string) {
    uploadedFiles = uploadedFiles.filter(f => f !== fileName);
  }
  
  function sendMessage() {
    if (!userInput.trim()) return;
    
    // Add user message
    assistantMessages = [...assistantMessages, { type: 'user', content: userInput, timestamp: new Date() }];
    
    // Clear input
    userInput = '';
  }
</script>

<div class="flex h-full">
  <!-- Setup Panel (2/3) -->
  <div class="w-2/3 border-r border-gray-200 p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold mb-2">Business Assistant</h1>
        <p class="text-gray-600 text-lg">Your all-in-one business management tool</p>
      </div>
      
      <!-- Upload Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Upload class="h-5 w-5 text-blue-600" />
            Upload Your Data
          </CardTitle>
          <CardDescription>Upload your business data to get personalized assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <!-- File Upload Area -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload class="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.txt,.sql"
                onchange={handleFileUpload}
                class="hidden"
                id="file-upload"
              />
              <label for="file-upload" class="cursor-pointer">
                <Button variant="outline" class="mt-2 cursor-pointer">
                  Choose Files
                </Button>
              </label>
            </div>
            
            <!-- Supported File Types -->
            <div>
              <h4 class="text-sm font-medium mb-2">Supported file types:</h4>
              <div class="flex flex-wrap gap-1">
                {#each supportedFileTypes as fileType}
                  <Badge variant="secondary" class="text-xs">
                    {fileType}
                  </Badge>
                {/each}
              </div>
            </div>
            
            <!-- Uploaded Files -->
            {#if uploadedFiles.length > 0}
              <div>
                <h4 class="text-sm font-medium mb-2">Uploaded files:</h4>
                <div class="space-y-2">
                  {#each uploadedFiles as fileName}
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-2">
                        <FileSpreadsheet class="h-4 w-4 text-blue-600" />
                        <span class="text-sm">{fileName}</span>
                      </div>
                      <button
                        onclick={() => removeFile(fileName)}
                        class="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
      
      <!-- Quick Actions Grid -->
      <div>
        <div class="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles class="h-4 w-4 text-blue-600" />
          Quick Actions
        </div>
        <div class="grid grid-cols-3 gap-2">
          {#each quickActions as action}
            {@const Icon = action.icon}
            <button
              class="p-2 border rounded text-xs flex items-center gap-1 hover:bg-gray-50 transition-colors cursor-pointer"
              onclick={() => handleQuickAction(action.id)}
              title={action.description}
            >
              <Icon class="h-3 w-3 {action.color}" />
              <span>{action.title}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Tools & Integrations -->
      <div class="space-y-3">
        <label class="text-sm font-medium">Tools</label>
        <div class="flex flex-wrap gap-1">
          <Badge variant="outline" class="text-xs">WhatsApp</Badge>
          <Badge variant="outline" class="text-xs">Facebook</Badge>
          <Badge variant="outline" class="text-xs">Excel</Badge>
          <Badge variant="outline" class="text-xs">Google Sheets</Badge>
          <Badge variant="outline" class="text-xs">Phone</Badge>
          <Badge variant="outline" class="text-xs">Paper Records</Badge>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Chat Interface (1/3) -->
  <div class="w-1/3 flex flex-col h-full">
    <!-- Assistant Header -->
    <div class="border-b border-gray-200 p-4 bg-gray-50">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-100 rounded-lg">
          <Bot class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 class="font-semibold">Business Assistant</h2>
          <p class="text-sm text-muted-foreground">CRM • FSM • Scheduling • Automation • Reports</p>
        </div>
      </div>
    </div>
    
    <!-- Chat Messages -->
    <div class="flex-1 p-4 space-y-4 overflow-y-auto">
      {#each assistantMessages as message}
        <div class="flex gap-3 {message.type === 'user' ? 'justify-end' : 'justify-start'}">
          {#if message.type === 'assistant'}
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot class="h-4 w-4 text-white" />
            </div>
          {/if}
          <div class="max-w-xs">
            <div class="p-3 rounded-lg {message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}">
              <p class="text-sm whitespace-pre-line">{message.content}</p>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
          {#if message.type === 'user'}
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User class="h-4 w-4 text-white" />
            </div>
          {/if}
        </div>
      {/each}
    </div>
    
    <!-- Chat Input -->
    <div class="border-t border-gray-200 p-4 bg-white">
      <div class="flex gap-2">
        <Input
          placeholder="Ask me anything about your business..."
          bind:value={userInput}
          onkeydown={(e) => e.key === 'Enter' && sendMessage()}
          class="flex-1"
        />
        <Button onclick={sendMessage} disabled={!userInput.trim()} class="cursor-pointer">
          <Send class="h-4 w-4" />
        </Button>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        Try: "Add a new customer", "Schedule a meeting", "Generate sales report"
      </p>
    </div>
  </div>
</div> 