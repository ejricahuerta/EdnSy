<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { 
    BarChart3, 
    TrendingUp, 
    PieChart, 
    Activity,
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
    CheckCircle,
    DollarSign,
    Users,
    Calendar,
    Coins
  } from 'lucide-svelte';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';

  let currentCredits: any = $state(null);
  let currentSessionId: string | null = $state(null);
  let isDemoRunning = $state(false);
  let showMobileSetup = $state(true);
  let demoError = $state("");
  let demoSuccess = $state("");
  let messageInput = $state("");
  let chatHistory = $state([
    {
      id: '1',
      role: 'ai',
      content: 'Hi! This is your data insights assistant. I can help you analyze business performance, track key metrics, and generate actionable reports. What would you like to explore?'
    }
  ]);
  let loading = $state(false);
  let initialLoading = $state(true);
  let estimatedTime = $state(0);
  let trainingCost = $state(0);

  onMount(async () => {
    try {
      // Test user setup
      const testResult = await CreditService.setupUser();
      if (testResult.error) {
        console.error('Error setting up user:', testResult.error);
        return;
      }

      // Load initial credits
      currentCredits = await CreditService.getUserCredits();
    } finally {
      initialLoading = false;
    }
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

  async function startDemo() {
    // Demo is disabled - show coming soon message
    demoError = "This data insights demo is coming soon! We're working hard to bring you powerful analytics, charting, and business intelligence capabilities.";
  }

  function resetDemo() {
    isDemoRunning = false;
    demoSuccess = "";
    demoError = "";
    chatHistory = [
      {
        id: '1',
        role: 'ai',
        content: 'Hi! This is your data insights assistant. I can help you analyze business performance, track key metrics, and generate actionable reports. What would you like to explore?'
      }
    ];
    messageInput = '';
    currentSessionId = null;
  }

  async function sendMessage() {
    // Demo is disabled - show coming soon message
    demoError = "This data insights demo is coming soon! We're working hard to bring you powerful analytics, charting, and business intelligence capabilities.";
  }

  async function processDataInsightsMessage(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualization')) {
      return `I can help you create various charts and visualizations! Here are some options:

📊 **Sales Performance Chart**: Track revenue trends over time
📈 **Customer Growth Graph**: Monitor user acquisition rates  
🍕 **Market Share Pie Chart**: Analyze competitive positioning
📉 **Conversion Funnel**: Track lead-to-customer journey

Which type of chart would you like to create? I can generate sample data and create interactive visualizations.`;
    }
    
    if (lowerMessage.includes('metric') || lowerMessage.includes('kpi') || lowerMessage.includes('performance')) {
      return `Great! Let's track your key business metrics. Here are some important KPIs to monitor:

🎯 **Revenue Metrics**: Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR)
👥 **Customer Metrics**: Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV)
📈 **Growth Metrics**: Month-over-Month growth, Churn rate
💰 **Financial Metrics**: Gross margin, Net profit margin

Which metrics are most important for your business? I can help you set up automated tracking and reporting.`;
    }
    
    if (lowerMessage.includes('report') || lowerMessage.includes('analysis') || lowerMessage.includes('insight')) {
      return `I can generate comprehensive business reports! Here's what I can analyze:

📋 **Executive Summary**: High-level business performance overview
📊 **Sales Analysis**: Revenue trends, top products, customer segments
👥 **Customer Analysis**: Demographics, behavior patterns, satisfaction scores
📈 **Growth Analysis**: Market expansion, new product performance
⚠️ **Risk Assessment**: Churn indicators, market threats

What type of report would you like me to generate? I can create automated reports that update in real-time.`;
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('monitor') || lowerMessage.includes('track')) {
      return `Perfect! Let's set up a real-time business dashboard. I can create:

📊 **Executive Dashboard**: Key metrics at a glance
📈 **Sales Dashboard**: Revenue, deals, pipeline tracking
👥 **Customer Dashboard**: User engagement, satisfaction, retention
📉 **Operations Dashboard**: Efficiency, costs, productivity metrics
🎯 **Marketing Dashboard**: Campaign performance, lead generation

What's your primary business focus? I'll customize the dashboard with the most relevant metrics for your needs.`;
    }

    return `I'm here to help with your data analysis needs! I can assist with:

📊 **Creating Charts & Visualizations**: Sales trends, customer analytics, market data
📈 **Tracking Key Metrics**: Revenue, growth, customer KPIs
📋 **Generating Reports**: Executive summaries, detailed analysis
📊 **Building Dashboards**: Real-time monitoring and alerts
🔍 **Data Analysis**: Identifying trends, patterns, and insights

What would you like to explore first?`;
  }

  function processMessage(userMessage: any) {
    // Demo is disabled
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0); background-size: 20px 20px;"></div>
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
                  <div class="p-2 rounded-lg bg-primary text-primary-foreground">
                    <BarChart3 class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Data Insights</h3>
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
                      <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div class="flex items-center gap-2 text-primary">
                          <AlertCircle class="w-4 h-4" />
                          <span class="text-sm">{demoError}</span>
                        </div>
                      </div>
                    {/if}

                    <!-- Demo Success -->
                    {#if demoSuccess}
                      <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div class="flex items-center gap-2 text-primary">
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
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
                {#if initialLoading}
                  <div class="text-center py-6 text-gray-500">
                    <Skeleton class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Loading Data Insights</p>
                    <p class="text-xs">Please wait while we set up your demo.</p>
                  </div>
                {:else}
                  <div class="text-center py-6 text-gray-500">
                    <BarChart3 class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Coming Soon</p>
                    <p class="text-xs">We're working hard to bring you powerful data insights capabilities.</p>
                  </div>
                {/if}
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
                <div class="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-200">
                  <BarChart3 class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Data Insights</h3>
                  <p class="text-sm text-gray-600">
                    Coming Soon
                  </p>
                </div>
              </div>
              

              
              <div class="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <BarChart3 class="w-4 h-4" />
                  <span>Analytics</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <TrendingUp class="w-4 h-4" />
                  <span>Trends</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <PieChart class="w-4 h-4" />
                  <span>Reports</span>
                </Badge>
                <Badge variant="outline" class="bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                  <Activity class="w-4 h-4" />
                  <span>Performance</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if initialLoading}
                  <div class="text-center py-8 text-gray-500">
                    <Skeleton class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Loading Data Insights</p>
                    <p class="text-sm">Please wait while we set up your demo.</p>
                  </div>
                {:else}
                  <div class="text-center py-8 text-gray-500">
                    <BarChart3 class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Coming Soon</p>
                    <p class="text-sm">We're working hard to bring you powerful data insights capabilities.</p>
                  </div>
                {/if}
              </div>

              <!-- Message Input -->
              <div class="border-t border-gray-200 p-4 flex-shrink-0">
                <div class="flex gap-2">
                  <Input
                    placeholder="Demo coming soon..."
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
          <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
              <AlertCircle class="w-4 h-4" />
              <span class="text-sm">{demoError}</span>
            </div>
          </div>
        {/if}

        <!-- Demo Success -->
        {#if demoSuccess}
          <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div class="flex items-center gap-2 text-primary">
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
              <BarChart3 class="w-4 h-4 text-primary" />
              <span>Real-time analytics</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp class="w-4 h-4 text-primary" />
              <span>Trend analysis</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <PieChart class="w-4 h-4 text-primary" />
              <span>Custom reports</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Activity class="w-4 h-4 text-primary" />
              <span>Performance tracking</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          <Button 
            variant="default"
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
