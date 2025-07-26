<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
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
    Calendar
  } from 'lucide-svelte';
  import { CreditService } from '$lib/services/creditService';
  import CreditDisplay from '$lib/components/ui/CreditDisplay.svelte';

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

  function startDemo() {
    isDemoRunning = true;
    demoSuccess = "Data Insights demo started successfully!";
    demoError = "";
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
  }

  function sendMessage() {
    if (!messageInput.trim() || !isDemoRunning) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput
    };

    chatHistory = [...chatHistory, userMessage];
    messageInput = '';
    loading = true;

    setTimeout(() => {
      processMessage(userMessage);
      loading = false;
    }, 1500);
  }

  function processMessage(userMessage: any) {
    const text = userMessage.content.toLowerCase();
    
    if (text.includes('revenue') || text.includes('sales') || text.includes('income')) {
      const response = {
        id: Date.now().toString(),
        role: 'ai',
        content: `📊 Revenue Analysis\n\nCurrent Month: $45,230 (+12% vs last month)\n• Top Service: Plumbing ($18,450)\n• Average Job Value: $342\n• Conversion Rate: 23.4%\n\nTrends:\n• Weekend jobs up 15%\n• Emergency calls peak 6-8 PM\n• Seasonal growth in HVAC services`
      };
      chatHistory = [...chatHistory, response];
    } else if (text.includes('customer') || text.includes('client') || text.includes('satisfaction')) {
      const response = {
        id: Date.now().toString(),
        role: 'ai',
        content: `👥 Customer Insights\n\nCustomer Satisfaction: 4.8/5\n• Repeat Customers: 67%\n• Average Lifetime Value: $2,340\n• Referral Rate: 34%\n\nTop Feedback Themes:\n• "Quick response time" (89%)\n• "Professional service" (92%)\n• "Fair pricing" (78%)\n\nAreas for Improvement:\n• Communication during delays\n• Follow-up scheduling`
      };
      chatHistory = [...chatHistory, response];
    } else if (text.includes('performance') || text.includes('efficiency') || text.includes('productivity')) {
      const response = {
        id: Date.now().toString(),
        role: 'ai',
        content: `⚡ Performance Metrics\n\nTeam Productivity:\n• Jobs per day: 8.2 (target: 7.5)\n• Average completion time: 2.3 hours\n• First-time fix rate: 94%\n\nEfficiency Gains:\n• Route optimization: 23% time saved\n• Digital paperwork: 45 min/day saved\n• Automated scheduling: 67% reduction in conflicts\n\nROI Impact:\n• 18% increase in jobs completed\n• 12% reduction in fuel costs\n• 31% improvement in customer satisfaction`
      };
      chatHistory = [...chatHistory, response];
    } else if (text.includes('forecast') || text.includes('prediction') || text.includes('trend')) {
      const response = {
        id: Date.now().toString(),
        role: 'ai',
        content: `🔮 Predictive Insights\n\nNext 30 Days Forecast:\n• Expected Revenue: $52,400 (+15%)\n• Peak Days: Tuesday, Thursday\n• High-Demand Services:\n  - HVAC maintenance (seasonal)\n  - Emergency plumbing\n  - Smart home installations\n\nRecommendations:\n• Increase HVAC tech availability\n• Stock up on common plumbing parts\n• Promote preventive maintenance packages`
      };
      chatHistory = [...chatHistory, response];
    } else {
      const defaultMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: 'I can help you analyze:\n• Revenue trends and projections\n• Customer satisfaction metrics\n• Team performance and efficiency\n• Predictive analytics and forecasting\n• Service demand patterns\n• ROI and profitability analysis\n\nWhat would you like to explore?'
      };
      chatHistory = [...chatHistory, defaultMessage];
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  onMount(() => {
    // Initialize demo
  });
</script>

<div class="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 h-full">
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
                  <div class="p-2 rounded-lg bg-orange-500 text-white">
                    <BarChart3 class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Data Insights</h3>
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
                          variant="default"
                          onclick={startDemo}
                          class="w-full flex items-center gap-2 text-sm"
                          size="sm"
                        >
                          <Play class="w-4 h-4" />
                          Start Demo
                        </Button>
                      {/if}
                      {#if isDemoRunning}
                        <Button 
                          variant="outline"
                          onclick={resetDemo}
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
                    <BarChart3 class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Data Insights</p>
                    <p class="text-xs">Tap the settings icon above to start the demo, then begin chatting</p>
                  </div>
                {:else}
                  {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[85%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <BarChart3 class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-2 rounded-lg min-w-[80px] {message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-xs whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if loading}
                    <div class="flex gap-2 justify-start">
                      <div class="flex gap-2 max-w-[85%]">
                        <div class="p-1.5 rounded-full bg-gray-200 text-gray-700">
                          <BarChart3 class="w-3 h-3" />
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
                <div class="p-2 rounded-lg bg-orange-500 text-white">
                  <BarChart3 class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Data Insights</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Online - Ready to help" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline">
                  <BarChart3 class="w-4 h-4" />
                  <span>Analytics</span>
                </Badge>
                <Badge variant="outline">
                  <TrendingUp class="w-4 h-4" />
                  <span>Trends</span>
                </Badge>
                <Badge variant="outline">
                  <PieChart class="w-4 h-4" />
                  <span>Reports</span>
                </Badge>
                <Badge variant="outline">
                  <Activity class="w-4 h-4" />
                  <span>Performance</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Messages Area -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <BarChart3 class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to Data Insights</p>
                    <p class="text-sm">Click Start Demo in the sidebar to begin analyzing your business data</p>
                  </div>
                {:else}
                  {#each chatHistory as message}
                    <div class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                      <div class="flex {message.role === 'user' ? 'flex-row-reverse items-end' : 'flex-row items-start'} gap-2 max-w-[80%]">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full {message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}">
                          {#if message.role === 'user'}
                            <User class="w-4 h-4" />
                          {:else}
                            <BarChart3 class="w-4 h-4" />
                          {/if}
                        </div>
                        <div class="p-3 rounded-lg min-w-[80px] {message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900'}">
                          <p class="text-sm whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  {/each}
                  
                  {#if loading}
                    <div class="flex gap-3 justify-start">
                      <div class="flex gap-3 max-w-[80%]">
                        <div class="p-2 rounded-full bg-gray-200 text-gray-700">
                          <BarChart3 class="w-4 h-4" />
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
          <CreditDisplay />
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
            <span>Duration 4-6 minutes</span>
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
              <BarChart3 class="w-4 h-4 text-orange-600" />
              <span>Real-time analytics</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp class="w-4 h-4 text-orange-600" />
              <span>Trend analysis</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <PieChart class="w-4 h-4 text-orange-600" />
              <span>Custom reports</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Activity class="w-4 h-4 text-orange-600" />
              <span>Performance tracking</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          {#if !isDemoRunning}
            <Button 
              variant="default"
              onclick={startDemo}
              class="w-full flex items-center gap-2 text-base"
            >
              <Play class="w-4 h-4" />
              Start Demo
            </Button>
          {/if}
          {#if isDemoRunning}
            <Button 
              variant="outline"
              onclick={resetDemo}
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
