<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
  import { 
    BarChart3, 
    ArrowLeft, 
    Clock,
    Star,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    ShoppingCart,
    Eye,
    Activity,
    Calendar,
    Filter,
    Settings,
    Play,
    RotateCcw
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { Label } from "$lib/components/ui/label";

  let selectedPeriod = "30d";
  let selectedMetric = "revenue";
  let isDemoRunning = false;
  let showMobileSetup = false;

  const periods = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" }
  ];

  const metrics = [
    { value: "revenue", label: "Revenue", icon: DollarSign, color: "text-green-600" },
    { value: "orders", label: "Orders", icon: ShoppingCart, color: "text-blue-600" },
    { value: "customers", label: "Customers", icon: Users, color: "text-purple-600" },
    { value: "views", label: "Page Views", icon: Eye, color: "text-orange-600" }
  ];

  const demoFeatures = [
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Monitor your business performance in real-time"
    },
    {
      icon: Activity,
      title: "Predictive Insights",
      description: "AI-powered forecasting and trend analysis"
    },
    {
      icon: Filter,
      title: "Custom Reports",
      description: "Create and schedule personalized reports"
    },
    {
      icon: Calendar,
      title: "Historical Data",
      description: "Access and analyze historical performance data"
    }
  ];

  const benefits = [
    "Increase revenue by 25% with data-driven decisions",
    "Reduce customer churn by identifying at-risk customers",
    "Optimize marketing spend with performance insights",
    "Improve operational efficiency through trend analysis",
    "Make informed decisions with predictive analytics"
  ];

  // Mock data for charts
  const chartData = {
    revenue: [12000, 15000, 18000, 14000, 22000, 25000, 28000, 32000, 29000, 35000, 38000, 42000],
    orders: [45, 52, 61, 48, 68, 75, 82, 89, 76, 92, 98, 105],
    customers: [120, 135, 148, 142, 165, 178, 192, 205, 198, 215, 228, 240],
    views: [1200, 1350, 1480, 1420, 1650, 1780, 1920, 2050, 1980, 2150, 2280, 2400]
  };

  const currentMetric = metrics.find(m => m.value === selectedMetric);
  const currentData = chartData[selectedMetric as keyof typeof chartData];
  const currentValue = currentData[currentData.length - 1];
  const previousValue = currentData[currentData.length - 2];
  const changePercent = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
  const isPositive = currentValue > previousValue;

  function getChartHeight(value: number, maxValue: number) {
    return (value / maxValue) * 100;
  }

  const maxValue = Math.max(...currentData);

  function startDemo() {
    isDemoRunning = true;
  }

  function resetDemo() {
    isDemoRunning = false;
  }
</script>

<div class="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 min-h-screen">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #8b5cf6 1px, transparent 0); background-size: 20px 20px;"></div>
  </div>

  <div class="relative z-10 flex h-screen">
    <!-- Analytics Interface (Left - Takes remaining space) -->
    <div class="flex-1 flex flex-col min-h-0 lg:mr-80">
      <!-- Analytics Area -->
      <div class="flex-1 p-3 lg:p-6 min-h-0">
        <!-- Mobile: Single Unified Card -->
        <div class="lg:hidden">
          <Card class="h-full bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-purple-500 text-white">
                    <BarChart3 class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Data Insights</h3>
                    <p class="text-xs text-gray-600">
                      {isDemoRunning ? "Live - Real-time analytics" : "Offline - Start demo to begin"}
                    </p>
                  </div>
                </div>
                <!-- Mobile Setup Toggle -->
                <Button 
                  variant="ghost" 
                  size="sm" 
                  class="text-gray-600 hover:text-gray-900"
                  on:click={() => showMobileSetup = !showMobileSetup}
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
                    <!-- Metric Selection -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Select Metric</Label>
                      <Select bind:value={selectedMetric}>
                        <SelectTrigger class="w-full text-sm">
                          <span>{currentMetric?.label}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {#each metrics as metric}
                            <SelectItem value={metric.value}>{metric.label}</SelectItem>
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Period Selection -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Time Period</Label>
                      <Select bind:value={selectedPeriod}>
                        <SelectTrigger class="w-full text-sm">
                          <span>{periods.find(p => p.value === selectedPeriod)?.label}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {#each periods as period}
                            <SelectItem value={period.value}>{period.label}</SelectItem>
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Demo Controls -->
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                      <Button 
                        variant={isDemoRunning ? "outline" : "default"}
                        on:click={startDemo}
                        disabled={isDemoRunning}
                        class="w-full flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <Play class="w-4 h-4" />
                        Start Demo
                      </Button>
                      <Button 
                        variant="outline"
                        on:click={resetDemo}
                        disabled={!isDemoRunning}
                        class="w-full flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <RotateCcw class="w-4 h-4" />
                        Reset Demo
                      </Button>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Analytics Content -->
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-6 text-gray-500">
                    <BarChart3 class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Data Insights</p>
                    <p class="text-xs">Configure your demo and click Start to view analytics</p>
                  </div>
                {:else}
                  <!-- Analytics Dashboard Content -->
                  <div class="space-y-4">
                    <!-- Metric Card -->
                    <Card class="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                      <CardContent class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <div class="p-2 rounded-lg bg-purple-500 text-white">
                              <svelte:component this={currentMetric?.icon} class="w-4 h-4" />
                            </div>
                            <div>
                              <p class="text-sm text-gray-600">{currentMetric?.label}</p>
                              <p class="text-2xl font-bold text-gray-900">${currentValue?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="flex items-center gap-1 {isPositive ? 'text-green-600' : 'text-red-600'}">
                              <svelte:component this={isPositive ? TrendingUp : TrendingDown} class="w-4 h-4" />
                              <span class="text-sm font-medium">{changePercent}%</span>
                            </div>
                            <p class="text-xs text-gray-500">vs last period</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Chart -->
                    <Card class="border-purple-200">
                      <CardHeader class="pb-3">
                        <CardTitle class="text-base">Performance Trend</CardTitle>
                      </CardHeader>
                      <CardContent class="p-4">
                        <div class="flex items-end justify-between h-32 gap-1">
                          {#each currentData as value, i}
                            <div class="flex-1 flex flex-col items-center">
                              <div 
                                class="w-full bg-purple-500 rounded-t transition-all duration-300"
                                style="height: {getChartHeight(value, maxValue)}%"
                              ></div>
                              <span class="text-xs text-gray-500 mt-1">{i + 1}</span>
                            </div>
                          {/each}
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Key Metrics -->
                    <div class="grid grid-cols-2 gap-3">
                      {#each metrics.slice(0, 4) as metric}
                        <Card class="border-gray-200">
                          <CardContent class="p-3">
                            <div class="flex items-center gap-2">
                              <svelte:component this={metric.icon} class="w-4 h-4 {metric.color}" />
                              <span class="text-sm font-medium">{metric.label}</span>
                            </div>
                            <p class="text-lg font-bold text-gray-900 mt-1">
                              {chartData[metric.value as keyof typeof chartData]?.[chartData[metric.value as keyof typeof chartData].length - 1]?.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Separate Analytics Card -->
        <div class="hidden lg:block">
          <Card class="h-full bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0 p-6">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-purple-500 text-white">
                  <BarChart3 class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Data Insights</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Live - Real-time analytics" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Analytics Content -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <BarChart3 class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to Data Insights</p>
                    <p class="text-sm">Configure your demo and click Start to view analytics</p>
                  </div>
                {:else}
                  <!-- Analytics Dashboard Content -->
                  <div class="space-y-6">
                    <!-- Metric Card -->
                    <Card class="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                      <CardContent class="p-6">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-4">
                            <div class="p-3 rounded-lg bg-purple-500 text-white">
                              <svelte:component this={currentMetric?.icon} class="w-6 h-6" />
                            </div>
                            <div>
                              <p class="text-base text-gray-600">{currentMetric?.label}</p>
                              <p class="text-3xl font-bold text-gray-900">${currentValue?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="flex items-center gap-2 {isPositive ? 'text-green-600' : 'text-red-600'}">
                              <svelte:component this={isPositive ? TrendingUp : TrendingDown} class="w-5 h-5" />
                              <span class="text-lg font-medium">{changePercent}%</span>
                            </div>
                            <p class="text-sm text-gray-500">vs last period</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Chart -->
                    <Card class="border-purple-200">
                      <CardHeader class="pb-4">
                        <CardTitle class="text-lg">Performance Trend</CardTitle>
                      </CardHeader>
                      <CardContent class="p-6">
                        <div class="flex items-end justify-between h-40 gap-2">
                          {#each currentData as value, i}
                            <div class="flex-1 flex flex-col items-center">
                              <div 
                                class="w-full bg-purple-500 rounded-t transition-all duration-300"
                                style="height: {getChartHeight(value, maxValue)}%"
                              ></div>
                              <span class="text-sm text-gray-500 mt-2">{i + 1}</span>
                            </div>
                          {/each}
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Key Metrics -->
                    <div class="grid grid-cols-2 gap-4">
                      {#each metrics.slice(0, 4) as metric}
                        <Card class="border-gray-200">
                          <CardContent class="p-4">
                            <div class="flex items-center gap-3">
                              <svelte:component this={metric.icon} class="w-5 h-5 {metric.color}" />
                              <span class="text-base font-medium">{metric.label}</span>
                            </div>
                            <p class="text-2xl font-bold text-gray-900 mt-2">
                              {chartData[metric.value as keyof typeof chartData]?.[chartData[metric.value as keyof typeof chartData].length - 1]?.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar (Right) -->
    <div class="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 absolute right-0 top-0 h-full overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Metric Selection -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Select Metric</Label>
          <Select bind:value={selectedMetric}>
            <SelectTrigger class="w-full text-base">
              <span>{currentMetric?.label}</span>
            </SelectTrigger>
            <SelectContent>
              {#each metrics as metric}
                <SelectItem value={metric.value}>{metric.label}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <!-- Period Selection -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Time Period</Label>
          <Select bind:value={selectedPeriod}>
            <SelectTrigger class="w-full text-base">
              <span>{periods.find(p => p.value === selectedPeriod)?.label}</span>
            </SelectTrigger>
            <SelectContent>
              {#each periods as period}
                <SelectItem value={period.value}>{period.label}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <!-- Demo Information -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            <span>Duration: 10-15 minutes</span>
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
              <TrendingUp class="w-4 h-4 text-purple-600" />
              <span>Real-time insights</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Activity class="w-4 h-4 text-purple-600" />
              <span>Predictive analytics</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Filter class="w-4 h-4 text-purple-600" />
              <span>Custom reports</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          <Button 
            variant={isDemoRunning ? "outline" : "default"}
            on:click={startDemo}
            disabled={isDemoRunning}
            class="w-full flex items-center gap-2 text-base"
          >
            <Play class="w-4 h-4" />
            Start Demo
          </Button>
          <Button 
            variant="outline"
            on:click={resetDemo}
            disabled={!isDemoRunning}
            class="w-full flex items-center gap-2 text-base"
          >
            <RotateCcw class="w-4 h-4" />
            Reset Demo
          </Button>
        </div>
      </div>
    </div>
  </div>
</div> 